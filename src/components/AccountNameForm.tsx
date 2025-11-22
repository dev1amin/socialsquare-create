import React, { useState } from 'react';
import { useEffect } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';
import FormButtons from './FormButtons';

export default function AccountNameForm({ onContinue, onBack, formData }: FormStepProps) {
  // Get initial value from localStorage or formData
  const getInitialAccountName = () => {
    if (formData?.accountName) {
      return formData.accountName;
    }
    
    try {
      const storedUserName = localStorage.getItem('user_name');
      if (storedUserName) {
        // Check if we need to split the name
        const firstName = storedUserName.includes(' ') ? storedUserName.split(' ')[0] : storedUserName;
        return `Trends de ${firstName}`;
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }
    
    return '';
  };

  const [accountName, setAccountName] = useState(getInitialAccountName());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountName.trim() && isValidAccountName() && onContinue) {
      onContinue({ accountName: accountName.trim() });
    }
  };

  const handleAccountNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow letters, numbers, spaces, and basic punctuation, but limit length
    if (value.length <= 50) {
      setAccountName(value);
    }
  };

  const isValidAccountName = () => {
    const trimmed = accountName.trim();
    return trimmed.length >= 2 && trimmed.length <= 50;
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
              Escolha um nome para sua conta:
            </h1>
          </div>

          {/* Input Field */}
          <div className="flex-1">
            <input
              type="text"
              value={accountName}
              onChange={handleAccountNameChange}
              className="w-full px-4 py-4 text-sm text-gray-dark bg-secondary border border-[#E5E5E5] rounded-xl transition-all duration-200 focus:outline-none focus:border-primary hover:border-primary placeholder-gray-medium"
              maxLength={50}
              autoFocus
              placeholder="Digite o nome da sua conta..."
            />
          </div>

          {/* Bottom Section with Button */}
          <FormButtons
            onBack={onBack}
            continueDisabled={!isValidAccountName()}
            continueText="Continuar"
            showBack={!!onBack}
          />
        </form>
      </div>
    </div>
  );
}