import { useParams } from 'react-router-dom';
import { ProjectItems } from '@/components/projects/project-items';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div className="p-8 text-center text-muted-foreground">Project not found</div>;
  }

  return (
    <div className="h-full max-w-3xl mx-auto border-x bg-background relative">
      <ProjectItems projectId={id} />
    </div>
  );
}
