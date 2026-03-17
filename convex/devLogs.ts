import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createDevLog = internalMutation({
  args: {
    repo: v.string(),
    branch: v.string(),
    commitHash: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("devLogs", {
      repo: args.repo,
      branch: args.branch,
      commitHash: args.commitHash,
      message: args.message,
      createdAt: Date.now(),
    });
  },
});

export const listDevLogs = query({
  args: {
    repo: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs;

    if (args.repo) {
      logs = await ctx.db
        .query("devLogs")
        .withIndex("by_repo", (q: any) => q.eq("repo", args.repo))
        .order("desc")
        .take(args.limit ?? 50);
    } else {
      logs = await ctx.db
        .query("devLogs")
        .withIndex("by_createdAt")
        .order("desc")
        .take(args.limit ?? 50);
    }

    return logs.map((log: any) => ({ ...log, id: log._id }));
  },
});
