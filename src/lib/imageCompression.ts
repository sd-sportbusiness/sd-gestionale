export interface CompressionResult {
  compressedBase64: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

const hasTransparency = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true;
    }
  }
  return false;
};

export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.75
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    const img = new Image();
    const isPng = file.type === 'image/png';
    const isWebp = file.type === 'image/webp';

    if (!ctx) {
      reject(new Error('Impossibile creare contesto canvas'));
      return;
    }

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        console.log('Dimensioni originali:', width, 'x', height);

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
          console.log('Dimensioni ridimensionate:', width, 'x', height);
        }

        canvas.width = width;
        canvas.height = height;

        if (!isPng && !isWebp) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        let outputFormat: string;
        let outputQuality: number;
        let needsTransparency = false;

        if (isPng) {
          needsTransparency = hasTransparency(ctx, width, height);
          console.log('PNG ha trasparenza:', needsTransparency);

          if (needsTransparency) {
            outputFormat = 'image/png';
            outputQuality = 1;
          } else {
            outputFormat = 'image/jpeg';
            outputQuality = 0.85;
            console.log('Converto PNG senza trasparenza in JPEG per ridurre dimensioni');

            const newCanvas = document.createElement('canvas');
            const newCtx = newCanvas.getContext('2d');
            if (newCtx) {
              newCanvas.width = width;
              newCanvas.height = height;
              newCtx.fillStyle = '#FFFFFF';
              newCtx.fillRect(0, 0, width, height);
              newCtx.drawImage(canvas, 0, 0);
              canvas.width = newCanvas.width;
              canvas.height = newCanvas.height;
              ctx.drawImage(newCanvas, 0, 0);
            }
          }
        } else if (isWebp) {
          outputFormat = 'image/webp';
          outputQuality = quality;
        } else {
          outputFormat = 'image/jpeg';
          outputQuality = quality;
        }

        console.log('Formato output:', outputFormat, 'Qualita:', outputQuality);

        let compressedBase64 = canvas.toDataURL(outputFormat, outputQuality);
        let compressedSize = Math.round((compressedBase64.length * 3) / 4);

        const MAX_DB_SIZE = 1.5 * 1024 * 1024;

        if (compressedSize > MAX_DB_SIZE && outputFormat === 'image/jpeg') {
          console.log('Immagine ancora troppo grande, riduco qualita');
          let testQuality = outputQuality - 0.1;

          while (compressedSize > MAX_DB_SIZE && testQuality > 0.3) {
            compressedBase64 = canvas.toDataURL(outputFormat, testQuality);
            compressedSize = Math.round((compressedBase64.length * 3) / 4);
            console.log('Provo qualita:', testQuality, 'Dimensione:', formatFileSize(compressedSize));
            testQuality -= 0.1;
          }

          if (compressedSize > MAX_DB_SIZE) {
            reject(new Error('Impossibile comprimere l\'immagine abbastanza. Prova con un\'immagine più piccola.'));
            URL.revokeObjectURL(img.src);
            return;
          }
        }

        console.log('Dimensione originale:', file.size, 'Dimensione compressa:', compressedSize);

        resolve({
          compressedBase64,
          originalSize: file.size,
          compressedSize,
          compressionRatio: Math.round(((file.size - compressedSize) / file.size) * 100),
        });

        URL.revokeObjectURL(img.src);
      } catch (error) {
        reject(new Error('Errore durante la compressione: ' + (error instanceof Error ? error.message : 'Errore sconosciuto')));
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = (error) => {
      console.error('Errore caricamento immagine:', error);
      reject(new Error('Impossibile caricare l\'immagine. Verifica che il file sia valido.'));
      URL.revokeObjectURL(img.src);
    };

    try {
      const objectUrl = URL.createObjectURL(file);
      console.log('Caricamento immagine:', file.name, file.type);
      img.src = objectUrl;
    } catch (error) {
      reject(new Error('Impossibile leggere il file'));
    }
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
