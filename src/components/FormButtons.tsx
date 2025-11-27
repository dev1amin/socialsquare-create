import React from 'react';

interface FormButtonsProps {
  onBack?: () => void;
  onContinue?: () => void;
  onSkip?: () => void;
  continueDisabled?: boolean;
  continueText?: string;
  skipText?: string;
  showBack?: boolean;
  showSkip?: boolean;
  isSubmitting?: boolean;
}

export default function FormButtons({
  onBack,
  onContinue,
  onSkip,
  continueDisabled = false,
  continueText = 'Continuar',
  skipText = 'Pular',
  showBack = true,
  showSkip = false,
  isSubmitting = false,
}: FormButtonsProps) {
  return (
    <div className="onboard-buttons">
      {/* Continue/Submit Button */}
      <button
        type="submit"
        onClick={onContinue}
        disabled={continueDisabled || isSubmitting}
        className="onboard-btn-primary"
      >
        {isSubmitting ? 'Processando...' : continueText}
      </button>

      {/* Skip Button */}
      {showSkip && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="onboard-btn-outline"
        >
          {skipText}
        </button>
      )}

      {/* Back Button */}
      {showBack && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="onboard-btn-secondary"
        >
          Voltar
        </button>
      )}
    </div>
  );
}
