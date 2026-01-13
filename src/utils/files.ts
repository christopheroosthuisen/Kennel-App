
import { apiFetch } from '../auth/auth';

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

export async function uploadFile(file: File) {
  const contentBase64 = await fileToBase64(file);
  const response = await apiFetch<{ data: { id: string, publicUrl: string } }>('/api/files', {
    method: 'POST',
    data: {
      filename: file.name,
      mimeType: file.type,
      contentBase64
    }
  });
  return response.data;
}
