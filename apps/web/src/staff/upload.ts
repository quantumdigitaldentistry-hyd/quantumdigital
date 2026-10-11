import { backend } from './session';

const MAX_SIDE = 2000;

/**
 * Prepares a photo for the website and uploads it to the public media bucket.
 * The image is redrawn onto a canvas, scaled to at most 2000 px and saved as WebP. That
 * keeps pages fast and strips EXIF metadata (camera details, GPS location) that patient
 * photos must not carry. Returns the storage path and the final size.
 */
export async function uploadImage(file: File, folder: 'results' | 'gallery' | 'articles') {
  if (!backend) throw new Error('Not connected.');
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 25 * 1024 * 1024) throw new Error('That image is over 25 MB.');

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Could not process the image.'))),
      'image/webp',
      0.86,
    ),
  );

  const path = `${folder}/${crypto.randomUUID()}.webp`;
  const { error } = await backend.storage.from('media').upload(path, blob, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return { path, width, height };
}

export async function removeImage(path: string | null | undefined) {
  if (!backend || !path) return;
  await backend.storage.from('media').remove([path]);
}

/** Public URL for a stored media path. */
export function mediaUrl(path: string) {
  return backend ? backend.storage.from('media').getPublicUrl(path).data.publicUrl : '';
}
