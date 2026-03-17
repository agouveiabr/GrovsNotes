import { query } from "./_generated/server";
import { v } from "convex/values";
import { parseSearch } from "./lib/search_parser";
import { Id } from "./_generated/dataModel";

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

export const search = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    const { text, filters } = parseSearch(args.q);

    // Require at least a text query or a filter
    if (!text && !filters.type && !filters.project && !filters.tag) {
      return [];
    }

    let items: any[];

    if (text) {
      // Use Convex full-text search index
      const searchQuery = ctx.db
        .query("items")
        .withSearchIndex("search_title", (q: any) => {
          let sq = q.search("title", text);
          if (filters.type) sq = sq.eq("type", filters.type);
          return sq;
        });
      items = await searchQuery.take(50);
    } else {
      // Filter-only query using indexes
      if (filters.type) {
        items = await ctx.db
          .query("items")
          .withIndex("by_type", (q: any) => q.eq("type", filters.type))
          .order("desc")
          .take(50);
      } else {
        items = await ctx.db
          .query("items")
          .withIndex("by_createdAt")
          .order("desc")
          .take(50);
      }
    }

    // Filter by project name (in-memory after indexed fetch)
    if (filters.project) {
      const allProjects = await ctx.db.query("projects").collect();
      const project = allProjects.find((p: any) =>
        p.name.toLowerCase().includes(filters.project!.toLowerCase())
      );
      if (!project) return [];
      items = items.filter((i: any) => i.projectId?.toString() === project._id.toString());
    }

    // Filter by tag
    if (filters.tag) {
      const tag = await ctx.db
        .query("tags")
        .withIndex("by_name", (q: any) => q.eq("name", filters.tag!.toLowerCase()))
        .first();
      if (!tag) return [];
      const itemTagsForTag = await ctx.db
        .query("itemTags")
        .withIndex("by_tagId", (q: any) => q.eq("tagId", tag._id))
        .collect();
      const itemIds = new Set(itemTagsForTag.map((it: any) => it.itemId.toString()));
      items = items.filter((i: any) => itemIds.has(i._id.toString()));
    }

    const enriched = await Promise.all(
      items.map(async (item: any) => ({
        ...item,
        id: item._id,
        tags: await getItemTags(ctx, item._id),
      }))
    );

    return enriched;
  },
});
