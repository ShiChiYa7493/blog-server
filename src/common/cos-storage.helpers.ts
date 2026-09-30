import { extname } from 'path';

/** Key prefix that separates blog images from the Warframe bot attachments in the shared bucket. */
export const BLOG_OBJECT_PREFIX = 'blog/uploads';

/** Same naming scheme the old disk storage used, so existing gallery rows stay compatible. */
export function generateUploadFilename(originalname: string): string {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return uniqueSuffix + extname(originalname);
}

export function buildObjectKey(filename: string): string {
  return `${BLOG_OBJECT_PREFIX}/${filename}`;
}

export function buildPublicUrl(publicBaseUrl: string, key: string): string {
  return `${publicBaseUrl.replace(/\/+$/, '')}/${key}`;
}

export function isAbsoluteUrl(url: string | null | undefined): boolean {
  return !!url && /^https?:\/\//i.test(url);
}
