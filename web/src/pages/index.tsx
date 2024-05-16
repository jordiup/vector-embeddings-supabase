import React from "react";
import Head from "next/head";
import { useDebounce } from "ahooks";

import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RouterOutputs, api } from "../utils/api";

export default function HomePage() {
  const docsQuery = api.base.docs.useQuery();

  const [text, setText] = React.useState("");
  const searchQuery = api.base.queryDocsWithEmbedding.useQuery(text, {
    enabled: !!text && text.length > 0,
  });

  const [embeddingInput, setEmbeddingInput] = React.useState("");
  const debouncedEmbeddingInput = useDebounce(embeddingInput, {
    wait: 500,
  });
  const embedQuery = api.base.embedInput.useQuery(debouncedEmbeddingInput, {
    enabled: !!debouncedEmbeddingInput && debouncedEmbeddingInput.length > 0,
  });

  const addEmbeddingMutation = api.base.addEmbedding.useMutation();
  const submitEmbedding = () => {
    if (!embedQuery?.data?.[0]?.embedding) {
      alert("no embedding found");
      return;
    }

    addEmbeddingMutation
      .mutateAsync({
        embedding: embedQuery.data[0]?.embedding,
        content: debouncedEmbeddingInput,
      })
      .finally(() => {
        docsQuery.refetch();
        setEmbeddingInput("");
      });
  };

  return (
    <Layout>
      <Head>
        <title>Vector Embeddings</title>
        <meta name="description" content="" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👽</text></svg>"
        />
      </Head>

      <main className="prose max-w-screen-lg space-y-4 *:rounded-md *:border-2 *:p-4 md:p-8">
        <h2>supabase vector embedding playground</h2>
        {/* CREATE/PREVIEW EMBEDDING */}
        <section className="space-y-2">
          <h4>create embedding</h4>
          <div className="flex flex-row space-x-2">
            <Input
              value={embeddingInput}
              placeholder="type text to preview/embed"
              onChange={(e) => setEmbeddingInput(e.target.value)}
              className=""
            />
            <Button
              onClick={submitEmbedding}
              className="flex flex-row items-center "
            >
              Add embedding to db
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                {/* chevron rigiht */}
                <path
                  fill="currentColor"
                  d="M9.293 16.707a1 1 0 01-1.414-1.414L11.586 12 7.293 7.707a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-.707.293z"
                ></path>
              </svg>
            </Button>
          </div>
          <div className="flex flex-row space-x-2 *:w-full *:border">
            <div className="max-h-[400px] space-y-8 overflow-clip">
              <h4>query preview</h4>
              {embedQuery.isInitialLoading && <Spinner />}
              <code className="line-clamp-6 whitespace-pre text-wrap rounded-sm font-mono  text-xs">
                {JSON.stringify(embedQuery.data, null, 2)}
              </code>
            </div>
            <div className="max-h-[400px] space-y-8 overflow-clip">
              <h4>submit result</h4>
              {addEmbeddingMutation.isLoading && <Spinner />}
              <code className="line-clamp-6 overflow-y-auto whitespace-pre text-wrap  rounded-sm  text-xs">
                {JSON.stringify(addEmbeddingMutation, null, 2)}
              </code>
            </div>
          </div>
        </section>

        {/* VIEW ALL EMBEDDINGS */}
        <section className="">
          <h4>all embeddings</h4>
          <div className="max-h-80 overflow-y-auto">
            {docsQuery.isInitialLoading && <Spinner />}
            <DocsRenderer docs={docsQuery.data} />
          </div>
        </section>

        {/* SEARCH RESULT */}
        <section className="">
          <h4>search result</h4>
          <div className="flex flex-row space-x-2">
            <Input
              value={text}
              placeholder="type text to preview/embed"
              onChange={(e) => setText(e.target.value)}
              className=""
            />
          </div>
          <div className="space-y-8">
            {searchQuery.isInitialLoading && <Spinner />}
            <DocsRenderer docs={searchQuery.data} />
          </div>
        </section>
        <section>
          made with ❤️ by <a href="https://twitter.com/Jordi_Up">@jordi</a>
        </section>
      </main>
    </Layout>
  );
}
const DocsRenderer = ({ docs }: { docs: RouterOutputs["base"]["docs"] }) => {
  return (
    <div className="space-y-8  bg-black/5">
      {docs?.slice(0, 12).map((doc, i) => (
        <div key={i} className="flex flex-row gap-x-2 *:p-2">
          <div className="min-w-40">{doc.content}</div>
          <div className="flex-grow overflow-clip font-mono text-xs">
            {doc.embedding}
          </div>
        </div>
      ))}
    </div>
  );
};

const Spinner = () => (
  <svg
    className="h-5 w-5 animate-spin text-gray-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.003 8.003 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
