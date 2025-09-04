import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { auth } from "@/auth";
import type { Context } from "@/context";
import { zValidator } from "@hono/zod-validator";

import { loginSchema, type SuccessResponse } from "@/shared/types";

export const authRouter = new Hono<{
  Variables: Context;
}>().post("/signup", zValidator("json", loginSchema), async (c) => {
  const { name, password, email } = c.req.valid("json");

  console.log("This is the JSON received:", { name, password, email });

  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: name,
        username: name, // Add this - your schema requires username to be NOT NULL
      },
    });

    console.log("Sign up result:", result);

    if (result.user) {
      return c.json<SuccessResponse<{
        id: string;
        email: string;
        name: string;
      }>>(
        {
          success: true,
          message: "User Created",
          data: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
          },
        },
        201,
      );
    } else {
      throw new HTTPException(400, { message: "Failed to create user" });
    }
  } catch (error) {
    console.error("Full error details:", error);

    if (error instanceof HTTPException) {
      throw error;
    }

    if (error && typeof error === "object" && "message" in error) {
      throw new HTTPException(400, { message: error.message as string });
    }

    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});