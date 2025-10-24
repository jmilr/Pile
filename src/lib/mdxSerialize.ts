import matter from 'gray-matter';

export interface MdxDocument {
  data: Record<string, unknown>;
  content: string;
}

export function serializeMdx(document: MdxDocument): string {
  const { data, content } = document;

  return matter.stringify(content ?? '', data ?? {});
}

export default serializeMdx;
