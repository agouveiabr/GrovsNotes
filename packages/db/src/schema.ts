import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const items = sqliteTable(
  'items',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content'),
    type: text('type', { enum: ['idea', 'task', 'note', 'bug', 'research'] })
      .notNull()
      .default('idea'),
    status: text('status', {
      enum: ['inbox', 'todo', 'doing', 'done', 'archived'],
    })
      .notNull()
      .default('inbox'),
    projectId: text('project_id').references(() => projects.id, {
      onDelete: 'set null',
    }),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('items_status_idx').on(table.status),
    index('items_type_idx').on(table.type),
    index('items_project_id_idx').on(table.projectId),
    index('items_created_at_idx').on(table.createdAt),
  ]
);

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const itemTags = sqliteTable(
  'item_tags',
  {
    itemId: text('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('item_tags_item_id_idx').on(table.itemId),
    index('item_tags_tag_id_idx').on(table.tagId),
  ]
);

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  icon: text('icon'),
});

export const devLogs = sqliteTable(
  'dev_logs',
  {
    id: text('id').primaryKey(),
    repo: text('repo').notNull(),
    branch: text('branch').notNull(),
    commitHash: text('commit_hash').notNull(),
    message: text('message').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('dev_logs_repo_idx').on(table.repo),
    index('dev_logs_created_at_idx').on(table.createdAt),
  ]
);
