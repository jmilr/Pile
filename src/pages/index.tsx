import Head from 'next/head';
import { useCallback } from 'react';

import PileEditor, { SchemaDefinition } from '@/components/PileEditor';

const schema: SchemaDefinition = {
  title: 'text',
  slug: 'text',
};

const HomePage = () => {
  const handleSave = useCallback((mdx: string) => {
    console.log('[Home] Received MDX string:', mdx);
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    const timestamp = Date.now();
    const safeName = encodeURIComponent(file.name.toLowerCase().replace(/\s+/g, '-'));
    const url = `https://files.example.com/uploads/${timestamp}-${safeName}`;
    console.log(`[Home] Upload placeholder for ${file.name}:`, url);
    return url;
  }, []);

  return (
    <>
      <Head>
        <title>Pile — MDX editor playground</title>
        <meta
          name="description"
          content="Experiment with front matter and MDX in a single-page editor."
        />
      </Head>
      <main>
        <PileEditor schema={schema} onSave={handleSave} upload={handleUpload} />
      </main>
    </>
  );
};

export default HomePage;
