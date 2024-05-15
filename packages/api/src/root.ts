import { authRouter } from "./router/auth";
import { baseRouter } from "./router/base";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  base: baseRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
