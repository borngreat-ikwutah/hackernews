import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { commentsTable } from "./comments";
import { postsTable } from "./posts";

export const postUpvotesTable = pgTable("post_upvotes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const postUpvoteRelations = relations(postUpvotesTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postUpvotesTable.postId],
    references: [postsTable.id],
    relationName: "postUpvotes",
  }),
  user: one(user, {
    fields: [postUpvotesTable.userId],
    references: [user.id],
    relationName: "user",
  }),
}));

export const commentUpVotesTable = pgTable("comment_upvotes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const commentUpvoteRelations = relations(
  commentUpVotesTable,
  ({ one }) => ({
    post: one(commentsTable, {
      fields: [commentUpVotesTable.commentId],
      references: [commentsTable.id],
      relationName: "commentUpVotes",
    }),
    user: one(user, {
      fields: [commentUpVotesTable.userId],
      references: [user.id],
      relationName: "user",
    }),
  }),
);
