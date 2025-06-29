import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface GoogleAdSenseProps {
  adClient: string;
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  testMode?: boolean; // For testing without real ads
}

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  adClient,
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  style = {},
  testMode = false
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (!testMode && !isAdLoaded.current && adRef.current) {
      try {
        // Initialize adsbygoogle array if it doesn't exist
        if (!window.adsbygoogle) {
          window.adsbygoogle = [];
        }
        
        // Push ad to render
        window.adsbygoogle.push({});
        isAdLoaded.current = true;
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('AdSense error:', error);
        }
      }
    }
  }, [testMode]);

  // In test mode, show a placeholder
  if (testMode || !adClient || !adSlot) {
    return (
      <div className={`bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-400 dark:border-slate-500 text-slate-500 dark:text-slate-400 text-sm flex flex-col items-center justify-center h-20 sm:h-24 my-6 rounded-md shadow text-center p-2 ${className}`}>
        <i className="fas fa-ad text-2xl text-slate-400 dark:text-slate-500 mb-1"></i>
        <p className="font-semibold">Advertisement</p>
        <p className="text-xs">{testMode ? 'Test Mode' : 'Configure AdSense'}</p>
      </div>
    );
  }

  return (
    <div className={`dietwise-ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
};

export default GoogleAdSense;