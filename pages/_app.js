import React from "react";
import Head from "next/head";
import Layout from "../src/components/Layout";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body {
              background-color: #f3f4f6 !important;
              font-family: system-ui, -apple-system, sans-serif;
            }
          `,
          }}
        />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
