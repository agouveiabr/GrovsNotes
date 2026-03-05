import { useState } from 'react';
import { useProjects, useCreateProject } from '@/hooks/use-projects';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ProjectList() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const navigate = useNavigate();
  const [newProjectName, setNewProjectName] = useState('');

  if (isLoading) return <div className="p-4 text-center text-muted-foreground">Loading...</div>;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createProject.mutate(
      { name: newProjectName.trim() },
      { onSuccess: () => setNewProjectName('') }
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full bg-background overflow-y-auto">
      <h2 className="text-2xl font-semibold">Projects</h2>
      
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input 
          placeholder="New project name..." 
          value={newProjectName} 
          onChange={(e) => setNewProjectName(e.target.value)} 
        />
        <Button type="submit" disabled={!newProjectName.trim() || createProject.isPending}>
          Add
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {projects?.map((project) => (
          <button
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="flex flex-col p-4 border rounded-xl hover:border-primary text-left transition-colors bg-card shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: project.color || 'var(--primary)' }}
              />
              <span className="font-medium text-lg truncate leading-tight">{project.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {project.itemCount} item{project.itemCount !== 1 ? 's' : ''}
            </span>
          </button>
        ))}
        {projects?.length === 0 && (
          <p className="text-muted-foreground col-span-full py-12 text-center border rounded-xl border-dashed">
            No projects yet. Create one above!
          </p>
        )}
      </div>
    </div>
  );
}
