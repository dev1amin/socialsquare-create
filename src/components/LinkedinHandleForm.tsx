import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';
import FormButtons from './FormButtons';

export default function LinkedinHandleForm({ onContinue, onBack, formData }: FormStepProps) {
  const [linkedinHandle, setLinkedinHandle] = useState(formData?.linkedinHandle || '');

  const extractSlugFromUrl = (input: string): string => {
    try {
      const linkedinPattern = /linkedin\.com\/in\/([^\/\?]+)/i;
      const match = input.match(linkedinPattern);
      if (match && match[1]) {
        return match[1];
      }
    } catch (error) {
      console.warn('Error extracting LinkedIn slug:', error);
    }
    return input;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkedinHandle.trim() && isValidLinkedinHandle()) {
      const slug = extractSlugFromUrl(linkedinHandle.trim());
      if (onContinue) {
        onContinue({ linkedinHandle: slug });
      }
    }
  };

  const handleSkip = () => {
    if (onContinue) {
      onContinue({ linkedinHandle: '' });
    }
  };

  const handleLinkedinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLinkedinHandle(value);
  };

  const isValidLinkedinHandle = () => {
    const trimmed = linkedinHandle.trim();
    return trimmed.length >= 1 && trimmed.length <= 200;
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header with Logo */}
      <div className="pt-12 pb-16 px-6">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 max-w-sm mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          
          {/* Question */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-dark text-left">
              Qual o seu LinkedIn?
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              (Opcional - Cole a URL ou digite o slug do perfil)
            </p>
          </div>

          {/* Input Field */}
          <div className="flex-1">
            <div className="space-y-3">
              <div className="relative">

                {/* Ícone */}
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-[#0077B5]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.27-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065C3.274 4.23 4.194 3.305 5.337 3.305c1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
                  </svg>
                </div>

                {/* Prefixo dentro do input */}
                <span className="absolute inset-y-0 left-12 flex items-center text-sm text-gray-medium pointer-events-none">
                  https://www.linkedin.com/in/
                </span>

                {/* Input */}
                <input
                  type="text"
                  value={linkedinHandle}
                  onChange={handleLinkedinChange}
                  className="w-full pl-[237px] pr-4 py-4 text-sm text-gray-dark bg-white border border-[#E5E5E5] rounded-xl transition-all duration-200 focus:outline-none focus:border-primary hover:border-primary placeholder-gray-400"
                  maxLength={200}
                  autoFocus
                  placeholder="seu-perfil"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <FormButtons
            onBack={onBack}
            onSkip={handleSkip}
            continueDisabled={!isValidLinkedinHandle()}
            continueText="Continuar"
            skipText="Pular"
            showBack={!!onBack}
            showSkip={true}
          />

        </form>
      </div>
    </div>
  );
}