import React, { useState } from 'react';
import { CameraService, CameraPhoto } from '../../services/cameraService';
import { Capacitor } from '@capacitor/core';

interface FoodPhotoCaptureProps {
  onPhotoCapture: (photo: CameraPhoto) => void;
  onCancel: () => void;
}

const FoodPhotoCapture: React.FC<FoodPhotoCaptureProps> = ({ 
  onPhotoCapture, 
  onCancel 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    try {
      setIsCapturing(true);
      setError(null);
      
      const photo = await CameraService.takePhoto();
      if (photo) {
        onPhotoCapture(photo);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickPhoto = async () => {
    try {
      setIsCapturing(true);
      setError(null);
      
      const photo = await CameraService.pickPhoto();
      if (photo) {
        onPhotoCapture(photo);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsCapturing(false);
    }
  };

  // Show fallback for web
  if (!Capacitor.isNativePlatform()) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Camera Not Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Photo capture is only available in the mobile app.
          </p>
          <button
            onClick={onCancel}
            className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white dark:bg-gray-800 w-full rounded-t-2xl p-4 pb-8 animate-slide-up">
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
        
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Food Photo
        </h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleTakePhoto}
            disabled={isCapturing}
            className="w-full py-4 px-4 bg-primary-600 text-white rounded-lg font-medium active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <i className="fas fa-camera text-xl"></i>
            <span>Take Photo</span>
          </button>

          <button
            onClick={handlePickPhoto}
            disabled={isCapturing}
            className="w-full py-4 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium active:bg-gray-200 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <i className="fas fa-images text-xl"></i>
            <span>Choose from Gallery</span>
          </button>

          <button
            onClick={onCancel}
            disabled={isCapturing}
            className="w-full py-4 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium active:bg-gray-300 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>

        {isCapturing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center rounded-t-2xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3">
                <svg 
                  className="animate-spin h-8 w-8 text-primary-600" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodPhotoCapture;