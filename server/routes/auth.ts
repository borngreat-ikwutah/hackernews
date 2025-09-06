import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { auth } from "@/auth";
import type { Context } from "@/context";
import { zValidator } from "@hono/zod-validator";

import {
  loginSchema,
  type ErrorResponse,
  type SuccessResponse,
} from "@/shared/types";

export const authRouter = new Hono<{
  Variables: Context;
}>()
  .post("/signup", zValidator("json", loginSchema), async (c) => {
    const { name, password, email } = c.req.valid("json");

    console.log("This is the JSON received:", { name, password, email });

    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: email,
          password: password,
          name: name,
          username: name,
        },
      });

      console.log("Sign up result:", result);

      if (result.user) {
        return c.json<SuccessResponse>(
          {
            success: true,
            message: "User created",
          },
          201,
        );
      } else {
        throw new HTTPException(400, { message: "Failed to create user" });
      }
    } catch (error) {
      console.error("Full error details:", error);

      // Handle duplicate email/username error
      if (error && typeof error === "object" && "message" in error) {
        const message = error.message as string;
        if (message.includes("duplicate") || message.includes("unique")) {
          throw new HTTPException(409, {
            message: "Email or username already exists",
            cause: { form: true },
          });
        }
        throw new HTTPException(400, { message: message });
      }

      throw new HTTPException(500, { message: "Internal Server Error" });
    }
  })
  .post(
    "/signin",
    zValidator("json", loginSchema.pick({ email: true, password: true })),
    async (c) => {
      const { password, email } = c.req.valid("json");

      try {
        const result = await auth.api.signInEmail({
          body: {
            email: email,
            password: password,
          },
        });

        if (result.user) {
          return c.json<SuccessResponse>(
            {
              success: true,
              message: "Logged in",
            },
            200,
          );
        } else {
          throw new HTTPException(401, {
            message: "Invalid email or password",
            cause: { form: true },
          });
        }
      } catch (error) {
        console.log(error);

        if (error instanceof HTTPException) {
          throw error;
        }

        if (error && typeof error === "object" && "message" in error) {
          throw new HTTPException(401, {
            message: "Invalid email or password",
            cause: { form: true },
          });
        }

        throw new HTTPException(500, { message: "Internal Server Error" });
      }
    },
  )
  .post("/signout", async (c) => {
    const session = c.get("session");

    if (!session) {
      throw new HTTPException(401, { message: "No active session" });
    }

    try {
      await auth.api.signOut({
        headers: c.req.header(),
      });

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Logged out",
        },
        200,
      );
    } catch (error) {
      throw new HTTPException(500, { message: "Failed to sign out" });
    }
  })
  .get("/user", async (c) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(401, { message: "Not authenticated" });
    }

    return c.json<
      SuccessResponse<{
        id: string;
        email: string;
        name: string;
        username?: string;
      }>
    >({
      success: true,
      message: "User fetched",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username || user.name,
      },
    });
  });
