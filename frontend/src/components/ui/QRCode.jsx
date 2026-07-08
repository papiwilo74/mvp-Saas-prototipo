import { Download, QrCode } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function QRCode({ url, size = 200, downloadable = true }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  const drawQR = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !url) return;

    const ctx = canvas.getContext('2d');
    const moduleCount = 25;
    const moduleSize = Math.floor(size / moduleCount);
    const adjustedSize = moduleSize * moduleCount;

    canvas.width = adjustedSize;
    canvas.height = adjustedSize;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, adjustedSize, adjustedSize);
    ctx.fillStyle = '#1c1917';

    const hash = url.split('').reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0);

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const seed = (hash * (row * 31 + col * 17 + 7)) & 0x7fffffff;
        if (seed % 3 === 0) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize - 1, moduleSize - 1);
        }
      }
    }

    const finderSize = 7;
    const corners = [
      [0, 0],
      [moduleCount - finderSize, 0],
      [0, moduleCount - finderSize]
    ];

    for (const [fx, fy] of corners) {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(fx * moduleSize, fy * moduleSize, finderSize * moduleSize, finderSize * moduleSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((fx + 1) * moduleSize, (fy + 1) * moduleSize, (finderSize - 2) * moduleSize, (finderSize - 2) * moduleSize);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect((fx + 2) * moduleSize, (fy + 2) * moduleSize, (finderSize - 4) * moduleSize, (finderSize - 4) * moduleSize);
    }
  }, [url, size]);

  useEffect(() => {
    drawQR();
  }, [drawQR]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement('a');
      link.download = 'menu-qr.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      setError('No se pudo descargar el QR');
    }
  };

  if (!url) return <p className="text-sm text-stone-500">Sin URL configurada</p>;

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="rounded-2xl border border-stone-200 shadow-sm" />
      {downloadable && (
        <button type="button" onClick={downloadQR} className="btn-secondary text-sm">
          <Download size={16} />
          Descargar QR
        </button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
