import { authRouter } from "./router/auth";
import { discussionRouter } from "./router/discussion";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  discussion: discussionRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
