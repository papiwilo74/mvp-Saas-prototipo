import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import QRCodeLib from 'qrcode';

export function QRCode({ url, size = 220, downloadable = true }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !url) return;

    QRCodeLib.toCanvas(
      canvas,
      url,
      {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      },
      (err) => {
        if (err) {
          setError('No se pudo generar el código QR');
        } else {
          setError('');
        }
      }
    );
  }, [url, size]);

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
      <div className="rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
        <canvas ref={canvasRef} />
      </div>
      {downloadable && (
        <button
          type="button"
          onClick={downloadQR}
          className="btn-secondary text-xs font-bold py-2 px-3 inline-flex items-center gap-1.5"
        >
          <Download size={15} />
          Descargar QR en alta resolución
        </button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
