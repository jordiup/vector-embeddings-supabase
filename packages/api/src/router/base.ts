import { createClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import { type Embedding } from "openai/resources";
import { z } from "zod";

import { type Database } from "@acme/db";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {},
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const baseRouter = createTRPCRouter({
  docs: publicProcedure.query(async ({ ctx }) => {
    const res = await supabase
      .schema("public")
      .from("documents")
      .select()
      .order("created_at", { ascending: false });

    if (res.error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: res.error.message,
      });
    }
    return res.data;
  }),
  queryDocsWithEmbedding: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const embeddingFromInput = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: input,
        encoding_format: "float",
      });
      if (!embeddingFromInput?.data?.[0]?.embedding) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "error getting embedding from input" +
            embeddingFromInput?.error?.message,
        });
      }

      const res = await supabase.schema("public").rpc("match_documents", {
        query_embedding: embeddingFromInput.data[0]?.embedding,
        match_threshold: 0.7,
        match_count: 5,
      });

      if (res.error && !res.data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: res.error.message,
        });
      }
      return res.data;
    }),

  embedInput: publicProcedure.input(z.string()).query(async ({ input }) => {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: input,
      encoding_format: "float",
    });
    if (embedding.error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: embedding.error.message,
      });
    }
    return embedding.data;
  }),

  addEmbedding: publicProcedure
    .input(
      z.object({
        embedding: z.array(z.number()),
        content: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const res = await supabase
        .schema("public")
        .from("documents")
        .insert({ ...input });

      if (res.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: res.error.message,
        });
      }
      return res.data;
    }),
  // byId: publicProcedure
  //   .input(z.object({ id: z.string() }))
  //   .query(({ ctx, input }) => {
  //     return ctx.prisma.post.findFirst({
  //       include: { author: { select: { name: true, image: true } } },
  //       where: { id: input.id },
  //     });
  //   }),

  // create: protectedProcedure
  //   .input(
  //     z.object({
  //       title: z.string().min(1),
  //       content: z.string().min(1),
  //       topic: z.string().min(1),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.prisma.discussion.create({
  //       data: {
  //         title: input.title,
  //         content: input.content,
  //         // TODO: add topic
  //         // author: {
  //         //   connectOrCreate: {
  //         //     create: {
  //         //       email: "jordi.hermoso.up@gmail.com",
  //         //     },
  //         //   },
  //         // },
  //       },
  //     });
  //   }),

  // delete: protectedProcedure
  //   .input(z.string())
  //   .mutation(async ({ ctx, input }) => {
  //     const post = await ctx.prisma.post.findUnique({ where: { id: input } });

  //     if (post?.authorId !== ctx.user.id) {
  //       throw new TRPCError({
  //         code: "UNAUTHORIZED",
  //         message: "Only the author is allowed to delete the post",
  //       });
  //     }

  //     return ctx.prisma.post.delete({ where: { id: input } });
  //   }),
});
