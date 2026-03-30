import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { parseHashtags } from "./lib/hashtags";
import type { Id } from "./_generated/dataModel";
import { parseItem } from "./lib/parser";
import { internalFindOrCreateProject } from "./projects";

async function upsertTags(ctx: any, tags: string[]): Promise<Id<"tags">[]> {
  const tagIds: Id<"tags">[] = [];
  for (const tagName of tags) {
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_name", (q: any) => q.eq("name", tagName))
      .first();
    if (existing) {
      tagIds.push(existing._id);
    } else {
      tagIds.push(await ctx.db.insert("tags", { name: tagName }));
    }
  }
  return tagIds;
}

async function getItemTags(ctx: any, itemId: Id<"items">): Promise<string[]> {
  const itemTags = await ctx.db
    .query("itemTags")
    .withIndex("by_itemId", (q: any) => q.eq("itemId", itemId))
    .collect();

  const tags: string[] = [];
  for (const it of itemTags) {
    const tag = await ctx.db.get(it.tagId);
    if (tag) tags.push(tag.name);
  }
  return tags;
}

async function withTags(ctx: any, item: any) {
  const tags = await getItemTags(ctx, item._id);
  return { ...item, id: item._id, tags };
}

export const createItem = mutation({
  args: {
    title: v.string(),
    now: v.optional(v.number()),
    timezoneOffset: v.optional(v.number()),
    content: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("idea"),
        v.literal("task"),
        v.literal("note"),
        v.literal("bug"),
        v.literal("research")
      )
    ),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    // 1. Use parseItem if context is provided, otherwise fallback to simple title
    const parseContext = {
      now: args.now ?? Date.now(),
      timezoneOffset: args.timezoneOffset ?? 0,
    };
    const parsed = parseItem(args.title, parseContext);

    // 2. Handle Project Matching/Auto-creation
    let finalProjectId = args.projectId;
    if (parsed.project && !finalProjectId) {
      finalProjectId = await internalFindOrCreateProject(ctx, parsed.project);
    }

    // 3. Handle Hashtags on the cleanTitle from parser
    const { cleanTitle, tags } = parseHashtags(parsed.cleanTitle);

    const itemId = await ctx.db.insert("items", {
      title: cleanTitle,
      originalInput: args.title,
      content: args.content,
      type: (args.type as any) ?? parsed.type,
      status: "inbox",
      projectId: finalProjectId,
      dueAt: parsed.dueAt,
      createdAt: parseContext.now,
      updatedAt: parseContext.now,
    });

    if (tags.length > 0) {
      const tagIds = await upsertTags(ctx, tags);
      for (const tagId of tagIds) {
        await ctx.db.insert("itemTags", { itemId, tagId });
      }
    }

    return itemId;
  },
});

export const listItems = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("todo"),
        v.literal("doing"),
        v.literal("done"),
        v.literal("archived")
      )
    ),
    type: v.optional(
      v.union(
        v.literal("idea"),
        v.literal("task"),
        v.literal("note"),
        v.literal("bug"),
        v.literal("research")
      )
    ),
    projectId: v.optional(v.id("projects")),
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let items;

    if (args.status) {
      items = await ctx.db
        .query("items")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .order("desc")
        .take(args.limit ?? 50);
    } else if (args.projectId) {
      items = await ctx.db
        .query("items")
        .withIndex("by_projectId", (q: any) => q.eq("projectId", args.projectId))
        .order("desc")
        .take(args.limit ?? 50);
    } else {
      items = await ctx.db
        .query("items")
        .withIndex("by_createdAt")
        .order("desc")
        .take(args.limit ?? 50);
    }

    // Secondary filters applied in-memory (after indexed fetch)
    if (args.type) {
      items = items.filter((i: any) => i.type === args.type);
    }

    if (args.tag) {
      const tag = await ctx.db
        .query("tags")
        .withIndex("by_name", (q: any) => q.eq("name", args.tag))
        .first();
      if (!tag) return [];
      const itemTagsForTag = await ctx.db
        .query("itemTags")
        .withIndex("by_tagId", (q: any) => q.eq("tagId", tag._id))
        .collect();
      const itemIds = new Set(itemTagsForTag.map((it: any) => it.itemId.toString()));
      items = items.filter((i: any) => itemIds.has(i._id.toString()));
    }

    return items.map((i: any) => ({ ...i, id: i._id }));
  },
});

export const getItem = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;
    const tags = await getItemTags(ctx, args.id);
    return { ...item, id: item._id, tags };
  },
});

export const updateItem = mutation({
  args: {
    id: v.id("items"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("todo"),
        v.literal("doing"),
        v.literal("done"),
        v.literal("archived")
      )
    ),
    type: v.optional(
      v.union(
        v.literal("idea"),
        v.literal("task"),
        v.literal("note"),
        v.literal("bug"),
        v.literal("research")
      )
    ),
    projectId: v.optional(v.id("projects")),
    dueAt: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    const updates: Record<string, any> = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      const { cleanTitle, tags } = parseHashtags(args.title);
      updates.title = cleanTitle;

      const oldItemTags = await ctx.db
        .query("itemTags")
        .withIndex("by_itemId", (q: any) => q.eq("itemId", args.id))
        .collect();
      for (const it of oldItemTags) await ctx.db.delete(it._id);

      if (tags.length > 0) {
        const tagIds = await upsertTags(ctx, tags);
        for (const tagId of tagIds) {
          await ctx.db.insert("itemTags", { itemId: args.id, tagId });
        }
      }
    }

    if (args.content !== undefined) updates.content = args.content;
    if (args.status !== undefined) updates.status = args.status;
    if (args.type !== undefined) updates.type = args.type;
    if (args.projectId !== undefined) updates.projectId = args.projectId;
    if (args.dueAt !== undefined) {
      updates.dueAt = args.dueAt ?? undefined; // null from client = clear field
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const deleteItem = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const itemTags = await ctx.db
      .query("itemTags")
      .withIndex("by_itemId", (q: any) => q.eq("itemId", args.id))
      .collect();
    for (const it of itemTags) await ctx.db.delete(it._id);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const listItemsDue = query({
  args: { beforeTimestamp: v.number() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_dueAt", (q: any) => q.gt("dueAt", 0).lte("dueAt", args.beforeTimestamp))
      .order("asc")
      .take(200);
    const active = items.filter((i: any) => i.status !== "done" && i.status !== "archived");
    return Promise.all(active.map((item: any) => withTags(ctx, item)));
  },
});

export const listBoardItems = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {
    const statuses = ["inbox", "todo", "doing", "done"] as const;
    const all: any[] = [];
    for (const status of statuses) {
      const batch = await ctx.db
        .query("items")
        .withIndex("by_status", (q: any) => q.eq("status", status))
        .order("desc")
        .take(100);
      all.push(...batch);
    }
    const filtered = args.projectId ? all.filter((i: any) => i.projectId === args.projectId) : all;
    return Promise.all(filtered.map((item: any) => withTags(ctx, item)));
  },
});

export const listOldInbox = query({
  args: { olderThanTimestamp: v.number() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_status", (q: any) => q.eq("status", "inbox"))
      .order("desc")
      .take(100);
    const old = items.filter((i: any) => i.createdAt < args.olderThanTimestamp);
    return Promise.all(old.map((item: any) => withTags(ctx, item)));
  },
});
