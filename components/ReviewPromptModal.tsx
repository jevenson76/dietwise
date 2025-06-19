import React, { useState } from 'react';
import Modal from './common/Modal';

interface ReviewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (rating: number, feedbackText?: string) => void;
}

const ReviewPromptModal: React.FC<ReviewPromptModalProps> = ({ isOpen, onClose, onSubmitFeedback }) => {
  const [rating, setRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [step, setStep] = useState<'rating' | 'feedback' | 'appstore' | 'thankyou'>('rating');

  const handleRating = (newRating: number) => {
    setRating(newRating);
    if (newRating >= 4) {
      // For PWA, direct "app store" link is conceptual. We'll show a "share feedback" message.
      setStep('appstore'); 
    } else if (newRating > 0) {
      setStep('feedback');
    }
  };

  const handleSubmit = () => {
    onSubmitFeedback(rating, feedbackText);
    setStep('thankyou'); 
    // Auto close after a bit, or user closes manually
    setTimeout(() => {
        if(isOpen) onClose(); // Check if still open before closing
        // Reset state for next time
        setRating(0);
        setFeedbackText('');
        setStep('rating');
    }, 3000);
  };
  
  const handleCloseAndReset = () => {
    onClose();
    // Reset state for next time
    setTimeout(() => { // Delay reset to avoid UI flicker if modal reopens quickly
        setRating(0);
        setFeedbackText('');
        setStep('rating');
    }, 300);
  }

  const renderContent = () => {
    switch (step) {
      case 'rating':
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-text-default mb-2">Enjoying DietWise?</h3>
            <p className="text-sm text-text-alt mb-4">Let us know how we're doing!</p>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={`text-3xl transition-colors duration-150 ${
                    star <= rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600 hover:text-yellow-300'
                  }`}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <i className="fas fa-star"></i>
                </button>
              ))}
            </div>
            <button onClick={handleCloseAndReset} className="text-xs text-text-alt hover:underline">Maybe later</button>
          </div>
        );
      case 'feedback':
        return (
          <div>
            <h3 className="text-lg font-medium text-text-default mb-2">Thanks for your feedback!</h3>
            <p className="text-sm text-text-alt mb-3">
              We're sorry to hear you're not fully satisfied. What can we do to improve your experience? (Optional)
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              className="w-full p-2 border border-border-default rounded-md bg-bg-card text-text-default placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Your suggestions..."
            />
            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
            >
              Submit Feedback
            </button>
          </div>
        );
      case 'appstore': // Conceptual "app store" step for PWA
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-text-default mb-2">That's great to hear!</h3>
            <p className="text-sm text-text-alt mb-4">
              Your positive feedback helps others discover DietWise. 
              If you have a moment, we'd love for you to share your experience.
            </p>
            {/* 
              This would ideally link to an app store if it was a native app.
              For PWA, we can just thank them or ask to share the app.
              navigator.share can be used if appropriate.
            */}
            <button
              onClick={handleSubmit} // Submits the internal rating
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
            >
              Sounds Good!
            </button>
             <button onClick={handleCloseAndReset} className="mt-2 text-xs text-text-alt hover:underline">No, thanks</button>
          </div>
        );
        case 'thankyou':
        return (
          <div className="text-center py-4">
            <i className="fas fa-check-circle text-5xl text-green-500 dark:text-green-400 mb-4"></i>
            <h3 className="text-lg font-medium text-text-default mb-2">Thank You!</h3>
            <p className="text-sm text-text-alt">We appreciate your feedback.</p>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndReset} title="Rate Your Experience">
      {renderContent()}
    </Modal>
  );
};

export default ReviewPromptModal;
