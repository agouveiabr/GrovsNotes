import { useState } from 'react';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/use-projects-convex';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProjectList() {
  const projects = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const navigate = useNavigate();
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (projects === undefined) return <div className="p-4 text-center text-muted-foreground">Loading...</div>;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      setIsCreating(true);
      await createProject({ name: newProjectName.trim() });
      setNewProjectName('');
      toast.success('Project created');
    } catch {
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      setIsDeleting(true);
      await deleteProject({ id: projectToDelete.id as any });
      toast.success('Project deleted');
      setProjectToDelete(null);
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full bg-background overflow-y-auto">
      <h2 className="text-2xl font-semibold">Projects</h2>
      
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input 
          placeholder="New project name or 'Name - Alias'..." 
          value={newProjectName} 
          onChange={(e) => setNewProjectName(e.target.value)} 
        />
        <Button type="submit" disabled={!newProjectName.trim() || isCreating}>
          Add
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {projects?.map((project: any) => (
          <div
            key={project.id}
            className="group flex flex-col p-4 border rounded-xl hover:border-primary text-left transition-colors bg-card shadow-sm relative cursor-pointer"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <div className="flex items-center gap-3 mb-2 pr-8">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: project.color || 'var(--primary)' }}
              />
              <span className="font-medium text-lg truncate leading-tight">{project.name}</span>
              {project.alias && (
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                  {project.alias}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {project.itemCount} item{project.itemCount !== 1 ? 's' : ''}
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setProjectToDelete(project);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {projects?.length === 0 && (
          <p className="text-muted-foreground col-span-full py-12 text-center border rounded-xl border-dashed">
            No projects yet. Create one above!
          </p>
        )}
      </div>

      <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{projectToDelete?.name}"</span>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setProjectToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
