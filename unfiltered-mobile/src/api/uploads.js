import client from './client';

export async function uploadFile(localUri, type) {
  if (!localUri) {
    return null;
  }

  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  const filename = localUri.split('/').pop() || `upload.${type === 'photo' ? 'jpg' : 'm4a'}`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1] : (type === 'photo' ? 'jpg' : 'm4a');
  const mimeType = type === 'photo' ? `image/${ext === 'jpg' ? 'jpeg' : ext}` : `audio/${ext}`;

  const formData = new FormData();
  
  // Use the correct field name based on type
  if (type === 'photo') {
    formData.append('image', {
      uri: localUri,
      name: filename,
      type: mimeType,
    });
  } else {
    formData.append('voice', {
      uri: localUri,
      name: filename,
      type: mimeType,
    });
  }

  try {
    const endpoint = type === 'photo' ? '/media/upload-image' : '/media/upload-voice';
    const response = await client.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    return response.data.url;
  } catch (error) {
    console.error('Upload error:', error);
    const serverMessage = error?.response?.data?.message || error.message || 'Upload failed';
    throw new Error(serverMessage);
  }
}

export async function uploadAvatar(localUri) {
  const remoteUrl = await uploadFile(localUri, 'photo');
  try {
    const res = await client.patch('/user/profile', { avatar_url: remoteUrl });
    return res.data.user;
  } catch (err) {
    const serverMessage = err?.response?.data?.message;
    throw new Error(serverMessage || 'Could not update your profile photo.');
  }
}