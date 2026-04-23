import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';
import FormButtons from './FormButtons';

export default function PasswordForm({ onContinue, onBack, formData }: FormStepProps) {
  const [password, setPassword] = useState(formData?.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !isValidPassword() || !onContinue) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Não chama a API aqui — apenas avança o funil com name + password locais.
      // A criação real do usuário Auth acontece só em Phase1LoadingPage via
      // POST /api/auth/finalize-onboarding.
      onContinue({
        password: password.trim(),
      });
    } catch (err) {
      setError('Erro inesperado ao processar o registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setPassword(value);
    }
  };

  const isValidPassword = () => {
    const trimmed = password.trim();
    return trimmed.length >= 6 && trimmed.length <= 50;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="pt-12 pb-16 px-6">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col px-6 max-w-sm mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-dark text-left">
              Escolha uma senha:
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              Mínimo de 6 caracteres
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-4 pr-12 text-sm text-gray-dark bg-secondary border border-[#E5E5E5] rounded-xl transition-all duration-200 focus:outline-none focus:border-primary hover:border-primary placeholder-gray-medium"
                maxLength={50}
                autoFocus
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-medium hover:text-gray-dark transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center space-x-2">
                  <div className={`h-1 flex-1 rounded-xl ${
                    password.length >= 6 ? 'bg-success' : 'bg-danger'
                  }`}></div>
                </div>
                <p className={`text-xs mt-1 ${
                  password.length >= 6 ? 'text-success' : 'text-danger'
                }`}>
                  {password.length >= 6
                    ? '✓ Senha válida'
                    : `${6 - password.length} caracteres restantes`
                  }
                </p>
              </div>
            )}
          </div>

          <FormButtons
            onBack={onBack}
            continueDisabled={!isValidPassword()}
            continueText="Criar Conta"
            isSubmitting={isSubmitting}
            showBack={!!onBack}
          />
        </form>
      </div>
    </div>
  );
}
