import fs from 'fs'; import path from 'path';
import { config } from '../lib/config';
import { rand } from '../lib/crypto';
/** Local disk by default; STORAGE_DRIVER=s3 uses any S3-compatible bucket (AWS, R2, MinIO). */
export async function put(storeId: string, name: string, buf: Buffer, mime: string, priv = false) {
  const key = `${priv ? 'private/' : ''}${storeId}/${Date.now()}-${rand(4)}-${name.replace(/[^\w.-]/g, '_')}`;
  if (config.storage === 's3') {
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const c = new S3Client({ region: config.s3.region, endpoint: config.s3.endpoint || undefined, credentials: { accessKeyId: config.s3.key, secretAccessKey: config.s3.secret }, forcePathStyle: !!config.s3.endpoint });
    await c.send(new PutObjectCommand({ Bucket: config.s3.bucket, Key: key, Body: buf, ContentType: mime }));
    return { key, url: `${config.s3.publicUrl.replace(/\/$/, '')}/${key}` };
  }
  const p = path.join(config.uploadDir, key); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, buf);
  return { key, url: priv ? '' : `${config.publicUrl}/uploads/${key}` };
}
