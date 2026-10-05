import client from './axios';

export async function uploadFile(file, type) {
  if (!file) return null;

  try {
    const endpoint = type === 'photo' ? '/media/upload-image' : '/media/upload-voice';
    const payload = type === 'photo' ? { image: file } : { voice: file };
    const response = await client.postForm(endpoint, payload);

    return response.data.url;
  } catch (error) {
    console.error('Upload error:', error);
    const serverMessage = error?.response?.data?.message || error.message || 'Upload failed';
    throw new Error(serverMessage);
  }
}
