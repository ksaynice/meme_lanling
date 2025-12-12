export const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // 1. Grayscale & Contrast stretching (Simple Binarization)
            // Loop through pixels
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Luminance
                const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                // Thresholding (simple value, can be tuned)
                // Memes usually have white text with black border. 
                // We want to keep white text white, and make everything else black?
                // Or just high contrast.

                // Let's try simple high-contrast binarization first.
                // If gray > 180 (light), make it 255 (white). Else 0 (black).
                // Subtitles are usually white.
                const val = gray > 160 ? 255 : 0;

                data[i] = val;
                data[i + 1] = val;
                data[i + 2] = val;
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};
