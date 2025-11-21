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
    <div className="fixed bottom-[50px] left-0 right-0 px-6 max-w-sm mx-auto w-full">
      <div className="space-y-3">
        {/* Continue/Submit Button */}
        <button
          type="submit"
          onClick={onContinue}
          disabled={continueDisabled || isSubmitting}
          className={`w-full py-4 px-6 rounded-xl font-medium text-white text-sm transition-all duration-200 ${
            continueDisabled || isSubmitting
              ? 'bg-gray-medium cursor-not-allowed'
              : 'bg-primary hover:bg-[#5A54E3] active:scale-95'
          }`}
        >
          {isSubmitting ? 'Processando...' : continueText}
        </button>

        {/* Back Button (always full width below Continue) */}
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 px-4 rounded-xl font-medium text-gray-dark bg-gray-light hover:bg-gray-200 text-sm transition-all duration-200"
          >
            Voltar
          </button>
        )}

        {/* Skip Button (optional, full width) */}
        {showSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-3 px-4 rounded-xl font-medium text-gray-dark bg-gray-light hover:bg-gray-200 text-sm transition-all duration-200"
          >
            {skipText}
          </button>
        )}
      </div>
    </div>
  );
}
