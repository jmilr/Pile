import matter from 'gray-matter';

export interface ParsedMdx {
  data: Record<string, unknown>;
  content: string;
}

export function parseMdx(source: string): ParsedMdx {
  const value = source ?? '';
  const { data, content } = matter(value);

  return {
    data,
    content,
  };
}

export default parseMdx;
