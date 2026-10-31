// Cloudinary Media Upload Service
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'vtaxbisr';
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

export interface CloudinaryUploadResult {
  success: boolean;
  url: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  error?: string;
  isFallback?: boolean;
}

/**
 * Upload a File or Blob or Base64 string to Cloudinary.
 * If Cloudinary returns that the preset is not whitelisted for unsigned uploads,
 * it gracefully falls back to local persistent base64 data-url storage so the application never fails.
 */
export async function uploadToCloudinary(
  fileOrBase64: File | Blob | string,
  folder: string = 'apply365'
): Promise<CloudinaryUploadResult> {
  try {
    const formData = new FormData();
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    if (typeof fileOrBase64 === 'string') {
      formData.append('file', fileOrBase64);
    } else {
      formData.append('file', fileOrBase64);
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.secure_url) {
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        bytes: data.bytes,
        isFallback: false,
      };
    }

    console.warn('Cloudinary upload warning:', data.error?.message || response.statusText);

    // Fallback: If unsigned preset is not configured yet, convert file to base64 data URL
    if (typeof fileOrBase64 !== 'string') {
      const base64Url = await fileToBase64(fileOrBase64);
      return {
        success: true,
        url: base64Url,
        publicId: `local_${Date.now()}`,
        format: fileOrBase64.type.split('/')[1] || 'png',
        bytes: fileOrBase64.size,
        isFallback: true,
        error: data.error?.message,
      };
    } else {
      return {
        success: true,
        url: fileOrBase64,
        publicId: `local_${Date.now()}`,
        isFallback: true,
        error: data.error?.message,
      };
    }
  } catch (err: any) {
    console.error('Cloudinary upload exception:', err);
    if (typeof fileOrBase64 !== 'string') {
      const base64Url = await fileToBase64(fileOrBase64);
      return {
        success: true,
        url: base64Url,
        publicId: `local_${Date.now()}`,
        bytes: fileOrBase64.size,
        isFallback: true,
        error: err.message,
      };
    }
    return {
      success: true,
      url: fileOrBase64,
      isFallback: true,
      error: err.message,
    };
  }
}

function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
