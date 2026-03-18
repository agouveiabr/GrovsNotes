import { BoardView } from '@/components/board/board-view';

export function BoardPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-3 shrink-0">
        <h1 className="text-2xl font-bold">Board</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <BoardView />
      </div>
    </div>
  );
}
