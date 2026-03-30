import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createProject = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      name: args.name,
      color: args.color,
      icon: args.icon,
    });
  },
});

export const listProjects = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();

    return await Promise.all(
      projects.map(async (project) => {
        const count = await ctx.db
          .query("items")
          .withIndex("by_projectId", (q: any) => q.eq("projectId", project._id))
          .collect()
          .then((items: any[]) => items.length);

        return { ...project, id: project._id, itemCount: count };
      })
    );
  },
});

export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;
    return { ...project, id: project._id };
  },
});

export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    alias: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.alias !== undefined) updates.alias = args.alias;
    if (args.color !== undefined) updates.color = args.color;
    if (args.icon !== undefined) updates.icon = args.icon;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_projectId", (q: any) => q.eq("projectId", args.id))
      .collect();

    for (const item of items) {
      await ctx.db.patch(item._id, { projectId: undefined });
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
