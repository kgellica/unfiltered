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

  try {
    const res = await client.post('/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  } catch (err) {
    // Surface the real server message (validation error, 500, etc.) instead
    // of a bare network error, so callers can show something actionable.
    const serverMessage = err?.response?.data?.message;
    throw new Error(serverMessage || 'Upload failed. Please check your connection and try again.');
  }
}

// Uploads a picked photo and saves it as the user's avatar in one step.
// Returns the updated user object from the API.
export async function uploadAvatar(localUri) {
  const remoteUrl = await uploadFile(localUri, 'photo');
  try {
    const res = await client.patch('/user/profile', { avatar_url: remoteUrl });
    return res.data.user;
  } catch (err) {
    const serverMessage = err?.response?.data?.message;
    throw new Error(serverMessage || 'Could not update your profile photo. Please try again.');
  }
}