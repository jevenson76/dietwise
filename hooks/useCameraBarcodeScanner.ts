
import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException, BarcodeFormat, DecodeHintType } from '@zxing/library';

interface UseCameraBarcodeScannerProps {
  onScanSuccess: (text: string) => void;
  onScanError?: (error: Error) => void;
  videoElementId: string;
}

export const useCameraBarcodeScanner = ({ onScanSuccess, onScanError, videoElementId }: UseCameraBarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null); // To control the stream

  useEffect(() => {
    // Ensure video element exists for the ref
    const videoElem = document.getElementById(videoElementId) as HTMLVideoElement;
    if (videoElem) {
      videoRef.current = videoElem;
    }

    const hints = new Map();
    const formats = [BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true);

    codeReaderRef.current = new BrowserMultiFormatReader(hints);

    return () => {
      stopScan(); // Ensure cleanup on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoElementId]);

  const startScan = useCallback(async () => {
    if (!codeReaderRef.current) {
      setError("Barcode reader not initialized.");
      if (onScanError) onScanError(new Error("Barcode reader not initialized."));
      return;
    }
    if (!videoRef.current) {
        setError("Video element not found.");
        if (onScanError) onScanError(new Error("Video element not found."));
        return;
    }

    try {
      setError(null);
      setIsScanning(true);
      // Ensure video element has playsInline attribute for iOS
      videoRef.current.setAttribute('playsinline', 'true');

      await codeReaderRef.current.decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current,
        (result, err) => {
          if (result) {
            onScanSuccess(result.getText());
            stopScan(); // Stop after successful scan
          }
          if (err && !(err instanceof NotFoundException)) {
            if (process.env.NODE_ENV !== 'production') {
            console.error("Barcode scan error:", err);
            }
            setError(err.message);
            if (onScanError) onScanError(err);
            // Don't stop scanning on NotFoundException, let it continue trying
          }
        }
      );
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
      console.error("Error starting scanner:", err);
      }
      let message = "Failed to start scanner.";
      if (err.name === 'NotAllowedError') {
        message = "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = "No camera found. Please ensure a camera is connected and enabled.";
      } else if (err.name === 'NotReadableError') {
        message = "Camera is already in use or cannot be accessed.";
      }
      setError(message);
      if (onScanError) onScanError(new Error(message));
      setIsScanning(false);
    }
  }, [onScanSuccess, onScanError]);

  const stopScan = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null; // Release the camera
    }
    setIsScanning(false);
  }, []);

  return { startScan, stopScan, isScanning, error, videoRef };
};
