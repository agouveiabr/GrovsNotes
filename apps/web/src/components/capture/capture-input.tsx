import { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCreateItem } from '@/hooks/use-items-convex';
import { useProjects, useCreateProject } from '@/hooks/use-projects-convex';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { addToOfflineQueue, getOfflineQueue, syncOfflineQueue } from '@/sw/offline-queue';
import { Send, Folder, Tag, Info } from 'lucide-react';
import { ITEM_TYPES, type ItemType } from '@grovsnotes/shared';

type ProjectOption = {
  id: string;
  name: string;
  alias?: string;
};

export function CaptureInput() {
  const [typeQuery, setTypeQuery] = useState('task');
  const [selectedType, setSelectedType] = useState<ItemType>('task');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [projectQuery, setProjectQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingProjectOption, setIsCreatingProjectOption] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [typeHighlightIndex, setTypeHighlightIndex] = useState(0);
  const [projectHighlightIndex, setProjectHighlightIndex] = useState(0);

  const typeInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const createItem = useCreateItem();
  const createProject = useCreateProject();
  const projects = useProjects();

  const projectList = useMemo<ProjectOption[]>(() => {
    if (!projects) return [];
    return projects.map((project: any) => ({
      id: String(project.id ?? project._id),
      name: String(project.name ?? ''),
      alias: project.alias ? String(project.alias) : undefined,
    }));
  }, [projects]);

  const normalizedTypeQuery = typeQuery.trim().toLowerCase();
  const normalizedProjectQuery = projectQuery.trim().toLowerCase();

  const filteredTypes = useMemo(() => {
    if (!normalizedTypeQuery) return [...ITEM_TYPES];
    return ITEM_TYPES.filter((type) => type.toLowerCase().includes(normalizedTypeQuery));
  }, [normalizedTypeQuery]);

  const filteredProjects = useMemo(() => {
    if (!normalizedProjectQuery) return projectList;
    return projectList.filter((project) => {
      const name = project.name.toLowerCase();
      const alias = project.alias?.toLowerCase() ?? '';
      return name.includes(normalizedProjectQuery) || alias.includes(normalizedProjectQuery);
    });
  }, [projectList, normalizedProjectQuery]);

  const hasExactProjectMatch = useMemo(() => {
    if (!normalizedProjectQuery) return false;
    return projectList.some((project) => {
      const name = project.name.toLowerCase();
      const alias = project.alias?.toLowerCase() ?? '';
      return name === normalizedProjectQuery || alias === normalizedProjectQuery;
    });
  }, [projectList, normalizedProjectQuery]);

  const showCreateProjectOption = Boolean(projectQuery.trim()) && !hasExactProjectMatch;

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projectList.find((project) => project.id === selectedProjectId) ?? null;
  }, [projectList, selectedProjectId]);

  useEffect(() => {
    setTypeHighlightIndex(0);
  }, [typeQuery]);

  useEffect(() => {
    setProjectHighlightIndex(0);
  }, [projectQuery]);

  useEffect(() => {
    const matched = ITEM_TYPES.find((type) => type === normalizedTypeQuery);
    if (matched) {
      setSelectedType(matched);
    }
  }, [normalizedTypeQuery]);

  useEffect(() => {
    titleInputRef.current?.focus();

    setPendingCount(getOfflineQueue().length);

    const setOnline = async () => {
      setIsOffline(false);
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        toast.info(`Syncing ${queue.length} offline items...`);
        await syncOfflineQueue(async (item) => {
          await createItem({
            ...(item as Record<string, unknown>),
            now: Date.now(),
            timezoneOffset: new Date().getTimezoneOffset()
          } as any);
        });
        setPendingCount(0);
        toast.success('Offline items synced!');
      }
    };

    const setOffline = () => setIsOffline(true);

    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);

    if (navigator.onLine) {
      setOnline();
    }

    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, [createItem]);

  const selectType = (type: ItemType) => {
    setSelectedType(type);
    setTypeQuery(type);
    setTypeOpen(false);
  };

  const selectProject = (project: ProjectOption) => {
    setSelectedProjectId(project.id);
    setProjectQuery(project.name);
    setProjectOpen(false);
  };

  const createProjectFromQuery = async () => {
    const name = projectQuery.trim();
    if (!name) return null;
    if (isOffline) {
      toast.error('Connect to internet to create a new project');
      return null;
    }
    try {
      setIsCreatingProjectOption(true);
      const id = await createProject({ name });
      setSelectedProjectId(String(id));
      setProjectQuery(name);
      setProjectOpen(false);
      toast.success(`Project "${name}" created`);
      return String(id);
    } catch {
      toast.error('Failed to create project');
      return null;
    } finally {
      setIsCreatingProjectOption(false);
    }
  };

  const resolveProjectId = async () => {
    if (selectedProjectId) return selectedProjectId;
    const query = projectQuery.trim().toLowerCase();
    if (!query) return undefined;

    const existing = projectList.find((project) => {
      const name = project.name.toLowerCase();
      const alias = project.alias?.toLowerCase() ?? '';
      return name === query || alias === query;
    });

    if (existing) {
      setSelectedProjectId(existing.id);
      setProjectQuery(existing.name);
      return existing.id;
    }

    const createdId = await createProjectFromQuery();
    return createdId ?? undefined;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const projectId = await resolveProjectId();
    if (projectQuery.trim() && !projectId) {
      return;
    }

    // For the UI notification we'll show just the title
    let displayTitle = trimmed;
    if (displayTitle.length > 40) displayTitle = displayTitle.slice(0, 40) + '...';

    const itemPayload: Record<string, unknown> = {
      title: trimmed,
      type: selectedType,
      now: Date.now(),
      timezoneOffset: new Date().getTimezoneOffset(),
    };

    if (projectId) {
      itemPayload.projectId = projectId;
    }
    if (content.trim()) {
      itemPayload.content = content.trim();
    }
    if (isOffline) {
      addToOfflineQueue(itemPayload);
      setPendingCount((prev) => prev + 1);
      setLastSaved(`${displayTitle} (Saved to queue)`);
      setTitle('');
      setContent('');
      setTimeout(() => setLastSaved(null), 2000);
      toast.success('Saved to offline queue');
      return;
    }

    try {
      setIsSaving(true);
      await createItem(itemPayload as any);
      setLastSaved(displayTitle);
      setTitle('');
      setContent('');
      setTimeout(() => setLastSaved(null), 2000);
    } catch {
      toast.error('Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTypeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setTypeOpen(true);
      if (filteredTypes.length > 0) {
        setTypeHighlightIndex((prev) => (prev + 1) % filteredTypes.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setTypeOpen(true);
      if (filteredTypes.length > 0) {
        setTypeHighlightIndex((prev) => (prev - 1 + filteredTypes.length) % filteredTypes.length);
      }
      return;
    }

    if (e.key === 'Enter') {
      if (typeOpen && filteredTypes.length > 0) {
        e.preventDefault();
        selectType(filteredTypes[typeHighlightIndex] ?? filteredTypes[0]!);
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const nextType = filteredTypes[typeHighlightIndex] ?? filteredTypes[0] ?? selectedType;
      if (nextType) {
        selectType(nextType);
      }
      projectInputRef.current?.focus();
    }
  };

  const handleProjectKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const optionsCount = filteredProjects.length + (showCreateProjectOption ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setProjectOpen(true);
      if (optionsCount > 0) {
        setProjectHighlightIndex((prev) => (prev + 1) % optionsCount);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setProjectOpen(true);
      if (optionsCount > 0) {
        setProjectHighlightIndex((prev) => (prev - 1 + optionsCount) % optionsCount);
      }
      return;
    }

    if (e.key === 'Enter') {
      if (!projectOpen) return;
      e.preventDefault();
      const highlighted = filteredProjects[projectHighlightIndex];
      if (highlighted) {
        selectProject(highlighted);
        return;
      }
      if (showCreateProjectOption) {
        await createProjectFromQuery();
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const highlighted = filteredProjects[projectHighlightIndex] ?? filteredProjects[0];
      if (highlighted) {
        selectProject(highlighted);
      } else if (showCreateProjectOption) {
        await createProjectFromQuery();
      }
      titleInputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 relative">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Structured Capture</h1>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
      {pendingCount > 0 && (
        <Badge variant="secondary" className="absolute top-4 right-4">
          {pendingCount} Pending Sync
        </Badge>
      )}
      <div className="w-full max-w-md space-y-4">
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="relative">
              <Input
                ref={typeInputRef}
                aria-label="Type"
                value={typeQuery}
                onFocus={() => setTypeOpen(true)}
                onBlur={() => window.setTimeout(() => setTypeOpen(false), 120)}
                onChange={(e) => {
                  setTypeQuery(e.target.value);
                  setTypeOpen(true);
                }}
                onKeyDown={handleTypeKeyDown}
                placeholder="Type"
                className="h-10"
                disabled={isSaving && !isOffline}
              />
              {typeOpen && filteredTypes.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
                  {filteredTypes.map((type, index) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => selectType(type)}
                      className={`flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm capitalize ${
                        index === typeHighlightIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <Input
                ref={projectInputRef}
                aria-label="Project"
                value={projectQuery}
                onFocus={() => setProjectOpen(true)}
                onBlur={() => window.setTimeout(() => setProjectOpen(false), 120)}
                onChange={(e) => {
                  setProjectQuery(e.target.value);
                  setSelectedProjectId(null);
                  setProjectOpen(true);
                }}
                onKeyDown={(e) => {
                  void handleProjectKeyDown(e);
                }}
                placeholder="Project"
                className="h-10"
                disabled={isSaving && !isOffline}
              />
              {projectOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
                  {filteredProjects.map((project, index) => (
                    <button
                      type="button"
                      key={project.id}
                      onClick={() => selectProject(project)}
                      className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm ${
                        index === projectHighlightIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'
                      }`}
                    >
                      <span className="truncate">{project.name}</span>
                      {project.alias && <span className="ml-2 text-xs uppercase opacity-70">{project.alias}</span>}
                    </button>
                  ))}
                  {showCreateProjectOption && (
                    <button
                      type="button"
                      onClick={() => {
                        void createProjectFromQuery();
                      }}
                      className={`flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm text-primary ${
                        projectHighlightIndex === filteredProjects.length ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'
                      }`}
                      disabled={isCreatingProjectOption}
                    >
                      {isCreatingProjectOption ? 'Creating project...' : `Create "${projectQuery.trim()}"`}
                    </button>
                  )}
                  {filteredProjects.length === 0 && !showCreateProjectOption && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No matching projects</div>
                  )}
                </div>
              )}
            </div>

            <Input
              ref={titleInputRef}
              aria-label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isOffline ? 'Offline mode - items will queue' : 'Title'}
              className={`h-10 ${isOffline ? 'border-amber-500/50' : ''}`}
              disabled={isSaving && !isOffline}
            />
          </div>

          <div className="relative">
            <Textarea
              ref={contentInputRef}
              aria-label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content (optional)"
              className="min-h-[120px] resize-none pr-24 pb-12"
              disabled={isSaving && !isOffline}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute bottom-3 right-3 h-8 rounded-md px-3"
              disabled={!title.trim() || (isSaving && !isOffline) || isCreatingProjectOption}
            >
              <Send className="h-4 w-4 mr-2" />
              Save
              <span className="ml-1.5 text-[10px] opacity-50 font-mono hidden sm:inline-block tracking-tighter">⌘↵</span>
            </Button>
          </div>
        </form>

        <AnimatePresence>
          {title.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="bg-muted/50 rounded-lg p-3 border border-border flex flex-wrap gap-3 items-center"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Tag className="h-3.5 w-3.5" />
                {selectedType}
              </div>
              
              {projectQuery.trim() && (
                <div className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  <Folder className="h-3.5 w-3.5" />
                  {selectedProject?.name ?? projectQuery.trim()}
                </div>
              )}

              <div className="flex-1 text-sm font-medium truncate">
                {title.trim()}
              </div>

              {content.trim() && <div className="w-full text-xs text-muted-foreground truncate">{content.trim()}</div>}
            </motion.div>
          )}
        </AnimatePresence>

        {!title && (
          <div className="text-xs text-muted-foreground flex items-start gap-2 px-1">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>Use <b>Type</b>, <b>Project</b>, and <b>Title</b>. Add optional <b>Content</b> and press <b>Tab</b> to autocomplete.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {lastSaved && (
           <motion.p
             initial={{ opacity: 1, y: 0 }}
             animate={{ opacity: 0, y: -20 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 1.5 }}
             className="text-sm text-muted-foreground absolute -bottom-8"
           >
             Saved: {lastSaved}
           </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
