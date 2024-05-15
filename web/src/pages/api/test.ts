import { NextRequest, NextResponse } from "next/server";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

import { Database } from "@acme/db";

// First, follow set-up instructions at
// https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase

// const privateKey = process.env.SUPABASE_PRIVATE_KEY;
// if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

// const url = process.env.SUPABASE_URL;
// if (!url) throw new Error(`Expected env var SUPABASE_URL`);

//   const client = createClient(url, privateKey);
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_SERVICE_ROLL_KEY,
);

export const run = async () => {
  const vectorStore = await SupabaseVectorStore.fromTexts(
    ["Hello world", "Bye bye", "What's this?"],
    [{ id: 2 }, { id: 1 }, { id: 3 }],
    new OpenAIEmbeddings(),
    {
      supabase,
      tableName: "documents",
      queryName: "match_documents",
    },
  );

  const resultOne = await vectorStore.similaritySearch("Hello world", 1);

  console.log(resultOne);
};

export default async function (req: NextRequest, res: NextResponse) {
  //   run();
  // supabase.functions.invoke('')
  supabase.from("");
  //   //   const { data, error } = await supabase.from("documents").select("*");
  //   if (error) {
  //     return res.status(500).json({ error: error.message });
  //   }
  // res.json({ message: "Hello" });
  //   return res.json(data);
}
