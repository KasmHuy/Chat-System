/**
 * Compress and convert a File to a base64 data URL.
 * Resizes to maxDimension and encodes as JPEG at given quality.
 * Keeps GIF as-is (no canvas compression).
 */
export function fileToDataUrl(file, maxDimension = 256, quality = 0.82) {
  return new Promise((resolve, reject) => {
    // GIF: skip compression, return raw base64
    if (file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate scaled dimensions
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height / width) * maxDimension);
          width = maxDimension;
        } else {
          width = Math.round((width / height) * maxDimension);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

/**
 * Validate image file: type and max size (default 5MB).
 * Returns an error string or null if valid.
 */
export function validateImageFile(file, maxMb = 5) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPG, PNG, GIF, or WEBP images are allowed.';
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `Image size must not exceed ${maxMb}MB.`;
  }
  return null;
}
