import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { serve } from "@hono/node-server";

import type { ErrorResponse } from "@/shared/types";

import { auth } from "./auth";
import type { Context } from "./context";
import { authRouter } from "./routes/auth";
import { postRouter } from "./routes/posts";
import { cors } from "hono/cors";

const app = new Hono<{
  Variables: Context;
}>();


app.use("*", cors(), async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  console.log("Auth middleware triggered");

  console.log("Session check:", session?.session); // Add this debug log
  console.log("Request headers:", Object.fromEntries(c.req.raw.headers)); // And this

  console.log("Cookies:", c.req.raw.headers.get("Cookie")); // Log the cookies

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  // If session exists, we might need to refresh it
  // better-auth handles cookie refreshing internally
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});


// Keep only your custom auth router
const routes = app
  .basePath("/api")
  .route("/auth", authRouter)
  .route("/posts", postRouter);



// app.on(["POST", "GET"], "/api/auth/*", (c) => {
//   return auth.handler(c.req.raw);
// });

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    const errResponse =
      error.res ??
      c.json<ErrorResponse>({
        success: false,
        message: error.message,
        isFormError:
          error.cause &&
          typeof error.cause === "object" &&
          "form" in error.cause
            ? error.cause.form === true
            : false,
      });

    return errResponse;
  }

  return c.json<ErrorResponse>(
    {
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : (error.stack ?? error?.message),
    },
    500,
  );
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  port: port,
  fetch: app.fetch,
});

export type ApiRoutes = typeof routes;
