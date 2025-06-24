import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CameraPhoto {
  webPath?: string;
  format: string;
  saved: boolean;
}

export class CameraService {
  /**
   * Take a photo using the device camera
   */
  static async takePhoto(): Promise<CameraPhoto | null> {
    try {
      // Check if running on native platform
      if (!Capacitor.isNativePlatform()) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Camera is only available on native platforms');
        }
        return null;
      }

      // Request camera permissions
      const permissions = await Camera.requestPermissions();
      if (permissions.camera !== 'granted') {
        throw new Error('Camera permission denied');
      }

      // Take photo
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: false // Don't save to gallery for privacy
      });

      return {
        webPath: image.webPath,
        format: image.format,
        saved: false
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error taking photo:', error);
      }
      throw error;
    }
  }

  /**
   * Pick a photo from the gallery
   */
  static async pickPhoto(): Promise<CameraPhoto | null> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return null;
      }

      const permissions = await Camera.requestPermissions();
      if (permissions.photos !== 'granted') {
        throw new Error('Photos permission denied');
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      return {
        webPath: image.webPath,
        format: image.format,
        saved: false
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error picking photo:', error);
      }
      throw error;
    }
  }

  /**
   * Convert a photo to base64 for API submission
   */
  static async photoToBase64(photo: Photo): Promise<string> {
    if (!photo.webPath) {
      throw new Error('No photo path available');
    }

    // On web, fetch the photo and convert to blob
    if (!Capacitor.isNativePlatform()) {
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // On native, the base64 is available if we request it
    const base64Photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });

    return `data:image/${photo.format};base64,${base64Photo.base64String}`;
  }
}