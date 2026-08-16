import client from './client';

// Uploads a local file (image or audio) to the Laravel API and returns
// the public URL to store on the journal entry.
export async function uploadFile(localUri, type) {
  if (!localUri || localUri.startsWith('http')) {
    // already a remote URL (or empty) — nothing to upload
    return localUri;
  }

  const filename = localUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename || '');
  const ext = match ? match[1] : type === 'photo' ? 'jpg' : 'm4a';
  const mime = type === 'photo' ? `image/${ext === 'jpg' ? 'jpeg' : ext}` : `audio/${ext}`;

  const form = new FormData();
  form.append('type', type);
  form.append('file', { uri: localUri, name: filename || `upload.${ext}`, type: mime });

  const res = await client.post('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.url;
}
