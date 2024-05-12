import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const discussionRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany({
      include: { author: { select: { name: true, image: true } } },
      orderBy: { id: "desc" },
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.post.findFirst({
        include: { author: { select: { name: true, image: true } } },
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        topic: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.discussion.create({
        data: {
          title: input.title,
          content: input.content,
          // TODO: add topic
          // author: {
          //   connectOrCreate: {
          //     create: {
          //       email: "jordi.hermoso.up@gmail.com",
          //     },
          //   },
          // },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({ where: { id: input } });

      if (post?.authorId !== ctx.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only the author is allowed to delete the post",
        });
      }

      return ctx.prisma.post.delete({ where: { id: input } });
    }),
});
