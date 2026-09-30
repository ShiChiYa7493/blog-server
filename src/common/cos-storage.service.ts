import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import COS = require('cos-nodejs-sdk-v5');
import { mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  buildObjectKey,
  buildPublicUrl,
  generateUploadFilename,
  isAbsoluteUrl,
} from './cos-storage.helpers';

export interface StoredFile {
  /** Name under uploads/; also the final segment of the COS object key. */
  filename: string;
  /** Absolute COS URL, or /uploads/<filename> when served from the local disk. */
  url: string;
}

/**
 * Image storage: COS first, local disk fallback.
 *
 * When COS is not configured (or an upload fails) the file is written to the
 * same local directory the old disk storage used, so development and a
 * half-configured production stay functional.
 */
@Injectable()
export class CosStorageService {
  private readonly logger = new Logger(CosStorageService.name);
  private readonly client: COS | null;
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicBaseUrl: string;
  private readonly localDir: string;

  constructor(config: ConfigService) {
    const secretId = config.get<string>('COS_SECRET_ID');
    const secretKey = config.get<string>('COS_SECRET_KEY');
    this.bucket = config.get<string>('COS_MEDIA_BUCKET') || '';
    this.region = config.get<string>('COS_REGION') || 'ap-shanghai';
    this.publicBaseUrl =
      config.get<string>('COS_PUBLIC_BASE_URL') || 'https://img.shichiya.cn';
    this.localDir = join(process.cwd(), '../../uploads');

    this.client =
      secretId && secretKey && this.bucket
        ? new COS({ SecretId: secretId, SecretKey: secretKey, Timeout: 300000 })
        : null;
    if (!this.client) {
      this.logger.warn(
        'COS is not configured; image uploads fall back to the local disk',
      );
    }
  }

  get cosEnabled(): boolean {
    return this.client !== null;
  }

  async save(
    originalname: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<StoredFile> {
    const filename = generateUploadFilename(originalname);

    if (this.client) {
      const key = buildObjectKey(filename);
      try {
        await this.client.putObject({
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: buffer,
          ContentLength: buffer.length,
          ContentType: mimetype || 'application/octet-stream',
          // Filenames are unique and never reused, so long caching is safe.
          CacheControl: 'public, max-age=2592000, immutable',
        });
        return { filename, url: buildPublicUrl(this.publicBaseUrl, key) };
      } catch (error) {
        this.logger.warn(
          `COS upload failed, falling back to local disk: ${describeError(error)}`,
        );
      }
    }

    mkdirSync(this.localDir, { recursive: true });
    writeFileSync(join(this.localDir, filename), buffer);
    return { filename, url: `/uploads/${filename}` };
  }

  async remove(filename: string, url: string): Promise<void> {
    if (this.client && isAbsoluteUrl(url)) {
      try {
        await this.client.deleteObject({
          Bucket: this.bucket,
          Region: this.region,
          Key: buildObjectKey(filename),
        });
        return;
      } catch (error) {
        this.logger.warn(
          `Failed to delete COS object ${buildObjectKey(filename)}: ${describeError(error)}`,
        );
      }
    }

    try {
      unlinkSync(join(this.localDir, filename));
    } catch {
      // The file may not exist locally (e.g. it was uploaded to COS); nothing to do.
    }
  }
}

function describeError(error: unknown): string {
  const item = error as { statusCode?: number; error?: unknown; message?: string };
  if (item?.statusCode) return `${item.statusCode} ${JSON.stringify(item.error) ?? ''}`.trim();
  return item?.message ?? String(error);
}
