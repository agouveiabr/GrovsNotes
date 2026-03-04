export const ITEM_TYPES = ['idea', 'task', 'note', 'bug', 'research'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_STATUSES = ['inbox', 'todo', 'doing', 'done', 'archived'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export interface Item {
  id: string;
  title: string;
  content: string | null;
  type: ItemType;
  status: ItemStatus;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemWithTags extends Item {
  tags: Tag[];
  project: Project | null;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface ProjectWithCount extends Project {
  itemCount: number;
}

export interface DevLog {
  id: string;
  repo: string;
  branch: string;
  commitHash: string;
  message: string;
  createdAt: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}
