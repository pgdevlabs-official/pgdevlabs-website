type MarketplaceImageKind = "products" | "payment-proofs" | "payout-qr";

const maxDataUrlLengths: Record<MarketplaceImageKind, number> = {
  products: 250_000,
  "payment-proofs": 600_000,
  "payout-qr": 250_000,
};

const maxDimensions: Record<MarketplaceImageKind, number> = {
  products: 1200,
  "payment-proofs": 1600,
  "payout-qr": 700,
};

export async function encodeMarketplaceImage(file: File, kind: MarketplaceImageKind) {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
    throw new Error("Choose a PNG, JPG, or WEBP image smaller than 5 MB.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not prepare the image.");

    const limit = maxDataUrlLengths[kind];
    const maxDimension = maxDimensions[kind];
    const scaleSteps = [1, 0.82, 0.67, 0.55, 0.45, 0.37, 0.3, 0.25];
    const qualities = [0.82, 0.72, 0.62, 0.52, 0.42];

    for (const scale of scaleSteps) {
      const fitScale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height)) * scale;
      canvas.width = Math.max(1, Math.round(bitmap.width * fitScale));
      canvas.height = Math.max(1, Math.round(bitmap.height * fitScale));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of qualities) {
        const dataUrl = canvas.toDataURL("image/webp", quality);
        if (dataUrl.length <= limit) return dataUrl;
      }
    }

    throw new Error("This image could not be compressed enough to save safely. Choose a smaller image.");
  } finally {
    bitmap.close();
  }
}
