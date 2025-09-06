import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { postsTable } from "./posts";
import { commentUpVotesTable } from "./upvotes";

export const commentsTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  postId: integer("post_id").notNull(),
  parentCommentId: integer("parent_comment_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  depth: integer("depth").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  points: integer("points").default(0).notNull(),
});

export const commentsRelations = relations(commentsTable, ({ one, many }) => ({
  author: one(user, {
    fields: [commentsTable.userId],
    references: [user.id],
    relationName: "author",
  }),
  parentComment: one(commentsTable, {
    fields: [commentsTable.parentCommentId],
    references: [commentsTable.id],
    relationName: "childComments",
  }),
  childComments: many(commentsTable, {
    relationName: "childComments",
  }),
  post: one(postsTable, {
    fields: [commentsTable.postId],
    references: [postsTable.id],
  }),
  commentUpvotes: many(commentUpVotesTable, { relationName: "commentUpvotes" }),
}));
