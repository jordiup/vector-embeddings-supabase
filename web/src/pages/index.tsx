import React from "react";
import Head from "next/head";

import Layout from "../components/Layout";
import { api } from "../utils/api";

export default function HomePage() {
  // const postQuery = api.post.all.useQuery();

  // const deletePostMutation = api.post.delete.useMutation({
  //   onSettled: () => postQuery.refetch(),
  // });

  const docsQuery = api.base.docs.useQuery();

  const [text, setText] = React.useState("");
  const searchQuery = api.base.queryDocsWithEmbedding.useQuery(text, {
    enabled: !!text && text.length > 0,
  });

  const embedQuery = api.base.embedInput.useQuery(text, {});
  return (
    <Layout>
      <Head>
        <title></title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className="flex max-w-screen-md flex-col  justify-start overflow-x-hidden bg-white py-8 text-zinc-800">
        <h1>docs</h1>
        <input
          value={text}
          placeholder="Search docs"
          onChange={(e) => setText(e.target.value)}
          className="border"
        />
        <div className="space-y-8">
          <code className="whitespace-pre text-wrap rounded-sm bg-red-50 text-xs">
            {JSON.stringify(searchQuery.data, null, 2)}
          </code>
          <code className="whitespace-pre text-wrap rounded-sm bg-black/5 text-xs">
            {JSON.stringify(docsQuery?.data?.slice(0, 2), null, 2)}
          </code>
        </div>
      </main>
    </Layout>
  );
}
