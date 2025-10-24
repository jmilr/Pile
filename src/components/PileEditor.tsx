import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import serializeMdx from '@/lib/mdxSerialize';

import styles from './PileEditor.module.scss';

type FieldType = 'text';

export type SchemaDefinition = Record<string, FieldType>;

export interface PileEditorProps {
  schema: SchemaDefinition;
  onSave: (mdx: string) => void;
  upload?: (file: File) => Promise<string>;
}

const defaultUpload = async (file: File): Promise<string> => {
  const safeName = encodeURIComponent(file.name.toLowerCase().replace(/\s+/g, '-'));
  return `https://files.example.com/${safeName}`;
};

const PileEditor = ({ schema, onSave, upload }: PileEditorProps) => {
  const schemaKeys = useMemo(() => Object.keys(schema), [schema]);
  const [frontMatter, setFrontMatter] = useState<Record<string, string>>(() =>
    schemaKeys.reduce<Record<string, string>>((accumulator, key) => {
      accumulator[key] = '';
      return accumulator;
    }, {})
  );
  const [body, setBody] = useState('');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFrontMatter((current) =>
      schemaKeys.reduce<Record<string, string>>((accumulator, key) => {
        accumulator[key] = current[key] ?? '';
        return accumulator;
      }, {})
    );
  }, [schemaKeys]);

  const handleFrontMatterChange = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFrontMatter((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleBodyChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const mdx = serializeMdx({ data: frontMatter, content: body });
    console.log('[PileEditor] MDX output:', mdx);
    onSave(mdx);
  };

  const toggleMode = () => {
    setMode((current) => (current === 'edit' ? 'preview' : 'edit'));
  };

  const handleUploadRequest = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    const uploader = upload ?? defaultUpload;

    try {
      const url = await uploader(file);
      setBody((current) => {
        const trimmed = current.trimEnd();
        const prefix = trimmed.length > 0 ? `${trimmed}\n\n` : '';
        return `${prefix}![${file.name}](${url})\n`;
      });
      console.log('[PileEditor] Uploaded asset placeholder:', url);
    } catch (error) {
      console.error('[PileEditor] Upload failed', error);
    } finally {
      event.target.value = '';
      setIsUploading(false);
    }
  };

  const isPreviewing = mode === 'preview';

  return (
    <form className={styles.editor} onSubmit={handleSubmit}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pile Editor</h1>
        <div className={styles.controls}>
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            type="button"
            onClick={toggleMode}
            aria-pressed={isPreviewing}
          >
            {isPreviewing ? 'Switch to Edit' : 'Preview'}
          </button>
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            type="button"
            onClick={handleUploadRequest}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading…' : 'Insert Upload'}
          </button>
          <button className={styles.button} type="submit">
            Save
          </button>
        </div>
      </header>

      <fieldset className={styles.fieldset}>
        <legend className="sr-only">Front matter</legend>
        {schemaKeys.map((key) => (
          <label className={styles.fieldGroup} key={key}>
            <span className={styles.label}>{key}</span>
            <input
              className={styles.input}
              type="text"
              name={key}
              value={frontMatter[key] ?? ''}
              onChange={handleFrontMatterChange(key)}
              placeholder={`Enter ${key}`}
            />
          </label>
        ))}
      </fieldset>

      {mode === 'edit' ? (
        <label className={styles.fieldGroup}>
          <span className={styles.label}>Body</span>
          <textarea
            className={styles.textarea}
            value={body}
            onChange={handleBodyChange}
            placeholder="Write your MDX content here"
          />
        </label>
      ) : (
        <div className={styles.preview} aria-live="polite">
          {body.trim().length === 0 ? <p>No content yet. Start writing to see the preview.</p> : <ReactMarkdown>{body}</ReactMarkdown>}
        </div>
      )}

      <input
        ref={fileInputRef}
        className={styles.uploadInput}
        type="file"
        accept="image/*,video/*,audio/*"
        onChange={handleFileChange}
      />
    </form>
  );
};

export default PileEditor;
