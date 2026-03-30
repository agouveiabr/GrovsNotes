import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  items: defineTable({
    title: v.string(),
    originalInput: v.optional(v.string()),
    content: v.optional(v.string()),
    type: v.union(
      v.literal("idea"),
      v.literal("task"),
      v.literal("note"),
      v.literal("bug"),
      v.literal("research"),
      v.literal("to-do"),
      v.literal("log")
    ),
    status: v.union(
      v.literal("inbox"),
      v.literal("todo"),
      v.literal("doing"),
      v.literal("done"),
      v.literal("archived")
    ),
    projectId: v.optional(v.id("projects")),
    dueAt: v.optional(v.number()), // Unix timestamp, midnight local time of the due date
    createdAt: v.number(), // Unix timestamp for proper ordering
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_projectId", ["projectId"])
    .index("by_dueAt", ["dueAt"])
    .index("by_createdAt", ["createdAt"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["type", "status"],
    }),

  tags: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  itemTags: defineTable({
    itemId: v.id("items"),
    tagId: v.id("tags"),
  })
    .index("by_itemId", ["itemId"])
    .index("by_tagId", ["tagId"]),

  projects: defineTable({
    name: v.string(),
    alias: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  }),

  devLogs: defineTable({
    repo: v.string(),
    branch: v.string(),
    commitHash: v.string(),
    message: v.string(),
    createdAt: v.number(), // Unix timestamp
  })
    .index("by_repo", ["repo"])
    .index("by_createdAt", ["createdAt"]),
});
