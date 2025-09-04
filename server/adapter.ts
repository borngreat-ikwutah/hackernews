import { drizzle } from "drizzle-orm/postgres-js";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import postgres from "postgres";
import z from "zod";

import { account, session, user, verification } from "./db/schemas/auth";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

const processEnv = EnvSchema.parse(process.env);
const queryClient = postgres(processEnv.DATABASE_URL);

export const db = drizzle(queryClient, {
  schema: {
    user,
    session,
    account,
    verification,
  },
});

export const databaseAdapter = drizzleAdapter(db, {
  provider: "pg",
});
