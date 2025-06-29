
import React, { useState, useCallback, useEffect } from 'react';
import Modal from '@components/common/Modal';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Alert from '@components/common/Alert';
import LoadingState from '@components/common/LoadingState';
import ErrorMessage, { ErrorTemplates } from '@components/common/ErrorMessage';
import { createContextualError } from '../utils/errorMessages';
import { useCameraBarcodeScanner } from '@hooks/useCameraBarcodeScanner';
import { getFoodInfoFromUPC, API_KEY_ERROR_MESSAGE } from '@services/geminiService'; 
import { trackEvent } from '@services/analyticsService';
import { ScannedFoodInfo, FoodItem, GroundingSource } from '@appTypes';
import type { GroundingChunk } from '@google/genai';

interface UPCScannerComponentProps {
  onFoodScanned: (foodItem: FoodItem, source: 'scan' | 'manual') => void;
  apiKeyMissing: boolean; 
  isOpen: boolean; 
  onClose: () => void;
  canScanBarcode: { allowed: boolean; remaining: number };
  onBarcodeScan: () => void;
  onUpgradeClick: () => void;
}

const VIDEO_ELEMENT_ID_PREFIX = "barcode-video-instance-"; // For multiple instances

const UPCScannerComponent: React.FC<UPCScannerComponentProps> = ({ 
  onFoodScanned, 
  apiKeyMissing, 
  isOpen, 
  onClose,
  canScanBarcode,
  onBarcodeScan,
  onUpgradeClick
}) => {
  const [videoElementId] = useState(() => `${VIDEO_ELEMENT_ID_PREFIX}${Math.random().toString(36).substring(7)}`);

  const [scannedUpc, setScannedUpc] = useState<string | null>(null);
  const [foodInfo, setFoodInfo] = useState<ScannedFoodInfo | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null); 
  const [scannerError, setScannerError] = useState<string | null>(null); 
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);

  const handleScanSuccess = useCallback((text: string) => {
    // Check if user can scan
    if (!canScanBarcode.allowed) {
      setScannerError('scan_limit_reached');
      return;
    }

    // Increment the scan count
    onBarcodeScan();

    trackEvent('upc_scan_success', { upc: text, context: 'global_scanner' });
    setScannedUpc(text);
    setIsLoadingApi(true);
    setApiError(null);
    setScannerError(null); 
    setFoodInfo(null);
    setGroundingSources([]);

    if (apiKeyMissing) {
      setApiError(API_KEY_ERROR_MESSAGE);
      setIsLoadingApi(false);
      trackEvent('upc_food_info_error_apikey_missing', { upc: text });
      return;
    }

    getFoodInfoFromUPC(text)
      .then(response => {
        if (response.foodInfo && response.foodInfo.name && response.foodInfo.name !== "Product (parsing issue)" && response.foodInfo.name !== "Product (data extraction issue)") {
          setFoodInfo(response.foodInfo);
          trackEvent('upc_food_info_retrieved', { upc: text, foodName: response.foodInfo.name });
        } else {
          setApiError(response.error || "Could not retrieve valid food information for this UPC.");
          if (response.error === API_KEY_ERROR_MESSAGE) {
            setApiError(API_KEY_ERROR_MESSAGE);
          }
          trackEvent('upc_food_info_error', { upc: text, error: response.error });
        }
        if (response.sources) {
          const validSources: GroundingSource[] = response.sources
            .filter((chunk): chunk is GroundingChunk & { web: { uri?: string; title?: string } } => chunk.web !== undefined)
            .map(chunk => ({ web: chunk.web! }));
          setGroundingSources(validSources);
        }
      })
      .catch(err => {
        let message = err.message || "An unexpected error occurred while fetching food data.";
        if (err.message && err.message.includes("API_KEY")) { 
            message = API_KEY_ERROR_MESSAGE;
        }
        setApiError(message);
        trackEvent('upc_food_info_exception', { upc: text, error: err.message });
      })
      .finally(() => setIsLoadingApi(false));
  }, [apiKeyMissing]);

  const handleScanErrorFromHook = useCallback((error: Error) => { 
    setScannerError(`Scanner Error: ${error.message}. Please ensure camera access is allowed.`);
    trackEvent('upc_scan_error_hook', { error: error.message });
    setIsLoadingApi(false); 
  }, []);

  const { startScan, stopScan, isScanning, error: scannerHookErrorInternal, videoRef } = useCameraBarcodeScanner({
    onScanSuccess: handleScanSuccess,
    onScanError: handleScanErrorFromHook,
    videoElementId: videoElementId,
  });

  useEffect(() => {
    if (scannerHookErrorInternal) {
      setScannerError(`Scanner Initialization Error: ${scannerHookErrorInternal}. Check camera permissions.`);
    }
  }, [scannerHookErrorInternal]);

  useEffect(() => {
    if (isOpen) {
      trackEvent('upc_scanner_modal_opened_via_prop');
      setScannedUpc(null);
      setFoodInfo(null);
      setApiError(null);
      setScannerError(null);
      setIsLoadingApi(false);
      setGroundingSources([]);

      if (apiKeyMissing) {
        setScannerError(API_KEY_ERROR_MESSAGE + " Barcode scanning is disabled.");
        trackEvent('upc_scanner_disabled_apikey_missing');
        return;
      }

      const timer = setTimeout(() => {
        const videoElement = document.getElementById(videoElementId) as HTMLVideoElement;
        if (videoRef.current && videoElement && videoElement.isConnected) { 
            startScan().catch(err => {
                 setScannerError(`Failed to start camera: ${err.message}. Please try again or check permissions.`);
                 trackEvent('upc_scanner_start_failed_exception', { error: err.message });
            });
        } else {
            const errMessage = "Camera element not ready. Please close and reopen the scanner.";
            setScannerError(errMessage);
            trackEvent('upc_scanner_start_failed_no_video_element', { error: errMessage });
        }
      }, 150); 
      return () => clearTimeout(timer);
    } else {
      stopScan();
    }
  }, [isOpen, startScan, stopScan, videoElementId, videoRef, apiKeyMissing]);

  const handleCloseScanner = () => {
    trackEvent('upc_scanner_modal_closed_via_prop_handler');
    onClose(); 
  };

  const handleLogFood = () => {
    if (foodInfo && foodInfo.name && foodInfo.calories !== undefined) {
      const newFoodItem: FoodItem = {
        id: scannedUpc || `scanned-${Date.now()}`,
        name: foodInfo.name,
        calories: foodInfo.calories,
        protein: foodInfo.protein,
        carbs: foodInfo.carbs,
        fat: foodInfo.fat,
        servingSize: foodInfo.servingSize,
        timestamp: Date.now(),
      };
      onFoodScanned(newFoodItem, 'scan');
      handleCloseScanner(); 
    } else {
        const errMessage = "Cannot log food: essential information (name or calories) is missing or invalid.";
        setApiError(errMessage); 
        trackEvent('upc_log_food_failed_missing_info', { foodInfo });
    }
  };

  const currentError = apiError || scannerError;

  return (
      <Modal isOpen={isOpen} onClose={handleCloseScanner} title={scannedUpc && !foodInfo && !isLoadingApi ? `UPC: ${scannedUpc}`: (foodInfo?.name || "Scan Barcode")} size="xl">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden mb-4 shadow-inner relative">
            <video id={videoElementId} ref={videoRef} className={`w-full h-full object-cover ${(isScanning || isLoadingApi || foodInfo || scannedUpc) ? '' : 'hidden'}`} playsInline />
            {/* DietWise Logo */}
            {isScanning && (
              <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-lg p-2 shadow-lg">
                <img src="/logo.svg" alt="DietWise" className="w-10 h-10" />
              </div>
            )}
            {!(isScanning || isLoadingApi || foodInfo || scannedUpc || currentError) && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4">
                    <i className="fas fa-camera text-5xl mb-3 text-slate-400 dark:text-slate-500"></i>
                    <p className="text-center text-sm">{apiKeyMissing ? "Barcode scanning disabled (API Key missing)" : "Initializing camera..."}</p>
                    {!apiKeyMissing && <p className="text-center text-xs mt-1">Point at a barcode to scan.</p>}
                </div>
            )}
            {isScanning && !foodInfo && !isLoadingApi && !currentError && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-30 p-4">
                    <i className="fas fa-barcode text-5xl mb-3 animate-pulse"></i>
                    <p className="text-center text-sm font-semibold">Scanning...</p>
                </div>
            )}
          </div>

          {currentError && currentError !== 'scan_limit_reached' && (
            <div className="w-full max-w-md">
              <ErrorMessage
                {...createContextualError('barcode-scan', currentError, { item: 'barcode' })}
                actions={[
                  {
                    label: 'Try Again',
                    action: () => {
                      setApiError(null);
                      setScannerError(null);
                      if (videoRef.current) startScan().catch(err => setScannerError(`Retry failed: ${err.message}`));
                    },
                    icon: 'fas fa-redo',
                  },
                  {
                    label: 'Enter Manually',
                    action: () => {
                      onClose();
                      // Navigate to manual food entry
                    },
                    variant: 'secondary',
                  },
                ]}
                onClose={() => { setApiError(null); setScannerError(null); }}
                compact
              />
            </div>
          )}

          {scannerError === 'scan_limit_reached' && (
            <div className="w-full max-w-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-start">
                <i className="fas fa-lock text-yellow-600 dark:text-yellow-400 mr-3 mt-1"></i>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Daily Scan Limit Reached</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    You've used all {canScanBarcode.remaining === 0 ? 'your' : canScanBarcode.remaining} free barcode scans for today.
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    Upgrade to Premium for unlimited barcode scanning!
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onUpgradeClick();
                    }}
                    className="mt-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:shadow-md transition-all text-sm"
                  >
                    <i className="fas fa-crown mr-2"></i>Upgrade to Premium
                  </button>
                </div>
              </div>
            </div>
          )}
           {!isScanning && !isLoadingApi && !scannedUpc && currentError && !apiKeyMissing && ( 
            <button 
              onClick={() => { 
                setScannerError(null);
                setApiError(null);
                if (videoRef.current) startScan().catch(err => setScannerError(`Retry failed: ${err.message}`));
              }} 
              className="mt-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:shadow-md transition-all">
              <i className="fas fa-sync-alt mr-2"></i>Retry Camera
            </button>
          )}

          {isLoadingApi && (
            <div className="my-4 w-full max-w-md">
              <LoadingState
                message="Looking up product information"
                submessage={`UPC: ${scannedUpc}`}
                estimatedTime={5}
                tips={[
                  "Searching nutritional databases...",
                  "Verifying product details...",
                  "Calculating serving sizes..."
                ]}
                size="sm"
              />
            </div>
          )}

          {foodInfo && !isLoadingApi && (
            <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-700 rounded-lg w-full max-w-md shadow-md border border-border-default">
              <h3 className="text-xl font-semibold text-teal-700 dark:text-teal-400">{foodInfo.name}</h3>
              {foodInfo.brand && <p className="text-sm text-text-alt">Brand: {foodInfo.brand}</p>}
              {foodInfo.servingSize && <p className="text-sm text-text-alt mb-2">Serving Size: {foodInfo.servingSize}</p>}

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm border-t border-border-default pt-3">
                {foodInfo.calories !== undefined && <p><strong className="text-text-default">Calories:</strong> <span className="text-orange-600 dark:text-orange-400 font-medium">{foodInfo.calories} kcal</span></p>}
                {foodInfo.protein !== undefined && <p><strong className="text-text-default">Protein:</strong> <span className="text-text-alt">{foodInfo.protein} g</span></p>}
                {foodInfo.carbs !== undefined && <p><strong className="text-text-default">Carbs:</strong> <span className="text-text-alt">{foodInfo.carbs} g</span></p>}
                {foodInfo.fat !== undefined && <p><strong className="text-text-default">Fat:</strong> <span className="text-text-alt">{foodInfo.fat} g</span></p>}
              </div>

              {foodInfo.calories !== undefined && foodInfo.name && !foodInfo.name.startsWith("Product (") && ( 
                <button
                    onClick={handleLogFood}
                    className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all"
                >
                    <i className="fas fa-plus-circle mr-2"></i>Log This Food
                </button>
              )}
            </div>
          )}
          {groundingSources.length > 0 && (
            <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-800/50 border border-sky-200 dark:border-sky-700 rounded-lg w-full max-w-md text-xs">
              <h4 className="text-xs font-semibold text-sky-700 dark:text-sky-300 mb-1">Data Sources (from Google Search):</h4>
              <ul className="list-disc list-inside space-y-1">
                {groundingSources.map((source, index) => (
                  source.web.uri ? (
                    <li key={index}>
                      <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline hover:text-sky-800 dark:hover:text-sky-300">
                        {source.web.title || source.web.uri}
                      </a>
                    </li>
                  ) : null
                ))}
              </ul>
            </div>
          )}
           {!foodInfo && scannedUpc && !isLoadingApi && !apiError && (
             <Alert type="info" message={`Attempted to find info for UPC: ${scannedUpc}. If nothing appears, the product may not be in the database or an error occurred.`} className="w-full max-w-md mt-4" />
           )}

          <button
            onClick={handleCloseScanner}
            className="mt-6 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 font-semibold py-2.5 px-6 rounded-lg shadow hover:shadow-md transition-all"
          >
            {foodInfo && !isLoadingApi ? 'Done' : 'Close Scanner'}
          </button>
        </div>
      </Modal>
  );
};

export default UPCScannerComponent;