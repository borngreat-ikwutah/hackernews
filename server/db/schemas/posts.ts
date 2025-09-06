import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { createInsertSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";
import { commentsTable } from "./comments";
import { postUpvotesTable } from "./upvotes";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  url: text("url"),
  content: text("content"),
  points: integer("points").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const postsRelations = relations(postsTable, ({ one, many }) => ({
  author: one(user, {
    fields: [postsTable.userId],
    references: [user.id],
    relationName: "author",
  }),
  postUpvotesTable: many(postUpvotesTable, { relationName: "postUpVotes" }),
  comments: many(commentsTable, { relationName: "postComments" }),
}));

export const insertPostsSchema = createInsertSchema(postsTable, {
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(50, { message: "Title must be at most 50 characters long" }),
  url: z
    .string()
    .trim()
    .url({ message: "Invalid URL" })
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters long" })
    .optional(),
});
