import React from 'react';
import { SharePayload } from '@appTypes';
import { trackEvent } from '@services/analyticsService';

interface ShareButtonProps {
  shareData: SharePayload;
  className?: string;
  buttonText?: string;
  iconClassName?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  shareData, 
  className = "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all",
  buttonText = "Share",
  iconClassName = "fas fa-share-alt mr-2"
}) => {
  const handleShare = async () => {
    trackEvent('share_button_clicked', { title: shareData.title, text: shareData.text });
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackEvent('share_successful_native', { title: shareData.title });

      } catch (error) {
        trackEvent('share_failed_native', { error: (error as Error).message });
        console.error('Error sharing content:', error);
        // Fallback or specific error handling can be added here
        alert("Sharing failed. You can manually copy this: " + shareData.text + (shareData.url ? ` URL: ${shareData.url}` : ''));
      }
    } else {
      trackEvent('share_fallback_clipboard_prompt', { title: shareData.title });
      // Fallback for browsers that don't support navigator.share
      // Attempt to copy to clipboard (requires HTTPS and user interaction context)
      const fullTextToCopy = `${shareData.title ? shareData.title + '\n' : ''}${shareData.text}${shareData.url ? '\n' + shareData.url : ''}`;
      try {
        await navigator.clipboard.writeText(fullTextToCopy);
        alert('Sharing not available, content copied to clipboard!');
        trackEvent('share_fallback_clipboard_copied');
      } catch (err) {

        alert("Sharing not available. Content logged to console. You can copy it from there.");
        trackEvent('share_fallback_console_log');
      }
    }
  };

  return (
    <button onClick={handleShare} className={className}>
      <i className={iconClassName}></i>{buttonText}
    </button>
  );
};

export default ShareButton;