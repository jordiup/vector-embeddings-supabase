import Head from "next/head";

import Layout from "../components/Layout";

export default function HomePage() {
  // const postQuery = api.post.all.useQuery();

  // const deletePostMutation = api.post.delete.useMutation({
  //   onSettled: () => postQuery.refetch(),
  // });

  return (
    <Layout>
      <Head>
        <title></title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className="flex flex-col items-center bg-white py-8 text-zinc-800">
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
      </main>
    </Layout>
  );
}
