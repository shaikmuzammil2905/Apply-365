/**
 * Utility to reliably download files (Base64 data URLs, Blobs, or remote URLs)
 * without triggering browser about:blank blocks or popup errors.
 */

export function downloadDocumentFile(fileUrl?: string, defaultFileName: string = 'document'): boolean {
  if (!fileUrl) {
    alert('Document file is not available for download.');
    return false;
  }

  try {
    // 1. Handle Base64 Data URLs
    if (fileUrl.startsWith('data:')) {
      const parts = fileUrl.split(';base64,');
      if (parts.length === 2) {
        const contentType = parts[0].replace('data:', '');
        const byteCharacters = atob(parts[1]);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        const blobUrl = URL.createObjectURL(blob);
        
        triggerBrowserDownload(blobUrl, defaultFileName);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        return true;
      }
    }

    // 2. Handle Blob or Remote URLs
    triggerBrowserDownload(fileUrl, defaultFileName);
    return true;
  } catch (err) {
    console.error('File download helper error:', err);
    // Fallback: try opening or downloading via window
    try {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = defaultFileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch {
      alert('Unable to download file. Please check file format.');
      return false;
    }
  }
}

function triggerBrowserDownload(url: string, fileName: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

