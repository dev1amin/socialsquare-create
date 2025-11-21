import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function ReasonsToBelieveForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>(formData?.reasonsToBelieves || []);

  const reasons = [
    'Expertise e Experiência',
    'Tecnologia Proprietária/Metodologia Comprovada',
    'Casos de Sucesso e Depoimentos',
    'Certificações/Prêmios/Recomendações',
    'Parcerias Estratégicas',
    'Qualidade Superior do Produto',
    'Garantias e Políticas Claras',
    'Comunidade de Usuários Engajada',
    'Resultados Mensuráveis',
    'Missão/Valores Fortes (Confiabilidade Moral)'
  ];

  const handleReasonToggle = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      // Remove if already selected
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      // Add if not selected and under limit
      if (selectedReasons.length < 2) {
        setSelectedReasons([...selectedReasons, reason]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReasons.length > 0 && onContinue) {
      onContinue({ reasonsToBelieves: selectedReasons });
    }
  };

  const isValidToSubmit = selectedReasons.length > 0;

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header with Logo */}
      <div className="pt-12 pb-8 px-6">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 max-w-sm mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Question */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-dark text-left leading-tight">
              Por que o cliente deve acreditar que a marca entrega esses benefícios?
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              Selecione até 2 razões de credibilidade – evidências ou "reasons to believe" ({selectedReasons.length}/2)
            </p>
          </div>

          {/* Reasons Options */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-3 max-h-80 overflow-y-auto pr-2">
              {reasons.map((reason) => {
                const isSelected = selectedReasons.includes(reason);
                const isDisabled = !isSelected && selectedReasons.length >= 2;
                
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => handleReasonToggle(reason)}
                    disabled={isDisabled}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary text-secondary'
                        : isDisabled
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-dark hover:bg-accent hover:text-white'
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Section with Continue Button */}
          <div className="pt-6 pb-8">
            <button
              type="submit"
              disabled={!isValidToSubmit}
              className={`w-full py-4 px-6 rounded-xl font-medium text-white text-sm transition-all duration-200  ${
                isValidToSubmit
                  ? 'bg-primary hover:bg-[#5A54E3] active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
      {/* Back Button */}
      {onBack && (
        <div className="fixed bottom-[50px] left-0 right-0 px-6 max-w-sm mx-auto w-full">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 px-4 rounded-xl font-medium text-gray-dark bg-gray-light hover:bg-gray-200 text-sm transition-all duration-200"
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  );
}