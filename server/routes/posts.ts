import { Hono } from "hono";

import { db } from "@/adapter";
import type { Context } from "@/context";
import { postsTable } from "@/db/schemas/posts";
import { loggedIn } from "@/middleware/logged-in";
import { zValidator } from "@hono/zod-validator";

import { createPostSchema, type SuccessResponse } from "@/shared/types";

export const postRouter = new Hono<{
  Variables: Context;
}>().post("/create-post", loggedIn, zValidator("json", createPostSchema), async (c) => {
  const { title, url, content } = c.req.valid("json");
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }

  const [post] = await db
    .insert(postsTable)
    .values({
      title: title,
      content: content,
      url: url,
      userId: user.id,
    })
    .returning({
      id: postsTable.id,
    });

  return c.json<
    SuccessResponse<{
      postId: number | string | undefined;
    }>
  >({
    success: true,
    message: "Post Created",
    data: {
      postId: post?.id,
    },
  }, 201);
});
