import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import { serve } from "@hono/node-server";
import { apiReference } from "@scalar/hono-api-reference";

import type { ErrorResponse } from "@/shared/types";

import { auth } from "./auth";
import type { Context } from "./context";
import { postRouter } from "./routes/posts";
import { getCompleteOpenAPISchema } from "./utils/openapi-generator";

const app = new Hono<{
  Variables: Context;
}>();

// Configure CORS properly for authentication
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*", // Allow all origins in development
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
  async (c, next) => {
    // Check for session on every request
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    console.log("Auth middleware triggered");
    console.log("Session check:", session?.session);
    console.log("Cookies:", c.req.raw.headers.get("Cookie"));

    if (!session) {
      c.set("user", null);
      c.set("session", null);
    } else {
      c.set("user", session.user);
      c.set("session", session.session);
    }

    return next();
  },
);

// OpenAPI Schema endpoint - serves the complete merged schema
app.get("/api/open-api", async (c) => {
  try {
    const schema = await getCompleteOpenAPISchema();
    return c.json(schema);
  } catch (error) {
    console.error("Error generating OpenAPI schema:", error);
    return c.json({ error: "Failed to generate OpenAPI schema" }, 500);
  }
});

// Unified API Documentation with Scalar
app.get("/docs", async (c) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hacker News Clone API Documentation</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <script id="api-reference" data-url="/api/open-api"></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
  `;
  return c.html(html);
});

// Better-auth handles all authentication routes including /api/auth/reference
app.all("/api/auth/*", async (c) => {
  return auth.handler(c.req.raw);
});

// Only include non-auth routes
const routes = app.basePath("/api").route("/posts", postRouter);

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
console.log(`📚 Unified API Documentation: http://localhost:${port}/docs`);
console.log(
  `🔐 Better-Auth OpenAPI Reference: http://localhost:${port}/api/auth/reference`,
);
console.log(
  `📋 Complete OpenAPI Schema: http://localhost:${port}/api/open-api`,
);

serve({
  port: port,
  fetch: app.fetch,
});

export type ApiRoutes = typeof routes;
