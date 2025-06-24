import React, { useState } from 'react';
import Modal from '../common/Modal';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'login' | 'signup';
}

type AuthMode = 'login' | 'signup' | 'forgot-password';

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  
  // Reset mode when modal opens with a different initial mode
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  const renderContent = () => {
    switch (mode) {
      case 'login':
        return (
          <Login
            onSuccess={handleSuccess}
            onSignupClick={() => setMode('signup')}
            onForgotPasswordClick={() => setMode('forgot-password')}
          />
        );
      case 'signup':
        return (
          <Signup
            onSuccess={handleSuccess}
            onLoginClick={() => setMode('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPassword
            onBackToLogin={() => setMode('login')}
          />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account" size="lg">
      <div className="p-6">
        {renderContent()}
      </div>
    </Modal>
  );
};

export default AuthModal;