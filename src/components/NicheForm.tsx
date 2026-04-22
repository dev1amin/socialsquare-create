import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { FormStepProps, Niche } from '../types/form';
import { ONBOARDING_ENDPOINTS } from '../config/api';

interface NicheOption {
  id: string;
  name: string;
}

const removeDuplicateNiches = (niches: NicheOption[]): NicheOption[] => {
  const seen = new Map<string, NicheOption>();

  niches.forEach(niche => {
    const key = niche.id.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.set(key, niche);
    }
  });

  return Array.from(seen.values());
};

export default function NicheForm({ onContinue, onBack, formData }: FormStepProps) {
  const [availableNiches, setAvailableNiches] = useState<NicheOption[]>([]);
  const [isLoadingNiches, setIsLoadingNiches] = useState(true);

  const [customNiche, setCustomNiche] = useState('');
  const [niches, setNiches] = useState<Niche[]>([]);

  // Fetch niches from webhook on component mount
  useEffect(() => {
    const fetchNiches = async () => {
      try {
        setIsLoadingNiches(true);
        const response = await fetch(ONBOARDING_ENDPOINTS.niches, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log('Niches response:', responseData);

          if (responseData && Array.isArray(responseData) && responseData.length > 0 && responseData[0].niches) {
            const uniqueNiches = removeDuplicateNiches(responseData[0].niches);
            setAvailableNiches(uniqueNiches);
          } else if (responseData && responseData.niches && Array.isArray(responseData.niches)) {
            const uniqueNiches = removeDuplicateNiches(responseData.niches);
            setAvailableNiches(uniqueNiches);
          } else {
            console.warn('Unexpected niches format, using fallback');
            setAvailableNiches([]);
          }
        } else {
          console.error('Failed to fetch niches:', response.status);
          setAvailableNiches([]);
        }
      } catch (error) {
        console.error('Error fetching niches:', error);
        setAvailableNiches([]);
      } finally {
        setIsLoadingNiches(false);
      }
    };

    fetchNiches();
  }, []);

  const matchNichesWithPredefined = (nichesToMatch: any[], predefinedList: NicheOption[]): Niche[] => {
    return nichesToMatch.map(niche => {
      const nicheText = typeof niche === 'string' ? niche : niche.text;
      const nicheType = (typeof niche === 'object' && niche.type) || 'manualAdded' as const;

      const matched = predefinedList.find(
        predefined => predefined.name.toLowerCase().trim() === nicheText.toLowerCase().trim()
      );

      if (matched) {
        return {
          text: matched.name,
          type: nicheType,
          id: matched.id
        };
      }

      const slug = nicheText.toLowerCase().trim().replace(/\s+/g, '-');
      const customId = `custom-${slug}`;

      return {
        text: nicheText,
        type: nicheType,
        id: customId
      };
    });
  };

  // sincroniza niches iniciais com formData, mas NÃO briga com alterações manuais
  useEffect(() => {
    if (availableNiches.length > 0 && formData?.niches && formData.niches.length > 0 && niches.length === 0) {
      const matchedNiches = matchNichesWithPredefined(formData.niches, availableNiches);
      setNiches(matchedNiches);
      console.log('Matched niches:', matchedNiches);
    }
  }, [availableNiches, formData?.niches]); // não depende de `niches` aqui

  const handleSelectNiche = (nicheId: string) => {
    const selectedNicheOption = availableNiches.find(n => n.id === nicheId);
    if (!selectedNicheOption) return;

    const isAlreadySelected = niches.some(n => n.id === nicheId);

    if (isAlreadySelected) {
      setNiches(prev => prev.filter(n => n.id !== nicheId));
    } else if (niches.length < 6) {
      setNiches(prev => [
        ...prev,
        {
          text: selectedNicheOption.name,
          type: 'manualAdded',
          id: selectedNicheOption.id
        }
      ]);
    }
  };

  const handleAddCustomNiche = () => {
    const trimmedNiche = customNiche.trim();
    if (
      !trimmedNiche ||
      niches.some(n => n.text.toLowerCase() === trimmedNiche.toLowerCase()) ||
      niches.length >= 6
    ) return;

    const matched = availableNiches.find(
      predefined => predefined.name.toLowerCase() === trimmedNiche.toLowerCase()
    );

    if (matched) {
      // Já existe nas sugestões → só seleciona
      if (!niches.some(n => n.id === matched.id)) {
        setNiches(prev => [
          ...prev,
          { text: matched.name, type: 'manualAdded', id: matched.id }
        ]);
      }
    } else {
      // Custom 100% novo → entra em `niches` como custom-*
      const slug = trimmedNiche.toLowerCase().replace(/\s+/g, '-');
      const customId = `custom-${slug}`;

      setNiches(prev => [
        { text: trimmedNiche, type: 'manualAdded', id: customId },
        ...prev,
      ]);
    }

    setCustomNiche('');
  };

  const handleRemoveNiche = (index: number) => {
    setNiches(prev => prev.filter((_, i) => i !== index));
  };

  const handleCustomNicheKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomNiche();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCustomNiche('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (niches.length > 0 && onContinue) {
      const predefinedNiches = niches.filter(
        niche => niche.id && !niche.id.startsWith('custom-')
      );
      const customNichesTexts = niches
        .filter(niche => niche.id && niche.id.startsWith('custom-'))
        .map(niche => niche.text);

      onContinue({ niches: predefinedNiches, custom_niches: customNichesTexts });
    }
  };

  const isValidToSubmit = niches.length > 0;

  return (
    <div className="onboard-container">
      <div className="onboard-header">
        <Logo />
      </div>

      <div className="onboard-content">
        <form onSubmit={handleSubmit} className="onboard-form">
          <div className="onboard-question">
            <h1 className="onboard-title">
              Qual ou quais são os seus nicho(s)?
            </h1>
            {formData?.niches && formData.niches.length > 0 && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Nichos sugeridos baseados no seu website
              </p>
            )}
            <p className="onboard-subtitle">Selecione até 6 nichos</p>
          </div>

          <div className="onboard-input-section max-h-[55vh] overflow-y-auto">
            {/* Input para adicionar nicho personalizado */}
            <div className="mb-4">
              <label className="block text-sm text-gray-dark mb-2">
                Adicione um nicho personalizado
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  onKeyDown={handleCustomNicheKeyDown}
                  className="flex-1 px-4 py-2 text-sm text-gray-dark bg-white border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:border-primary hover:border-primary placeholder-gray-400"
                  placeholder="Digite seu nicho"
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={handleAddCustomNiche}
                  disabled={
                    !customNiche.trim() ||
                    niches.some(n => n.text.toLowerCase() === customNiche.trim().toLowerCase()) ||
                    niches.length >= 6
                  }
                  className={`px-5 py-2 rounded-xl font-medium transition-all duration-200 ${
                    customNiche.trim() &&
                    !niches.some(n => n.text.toLowerCase() === customNiche.trim().toLowerCase()) &&
                    niches.length < 6
                      ? 'bg-primary text-white hover:bg-[#5a54e3]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {niches.length}/6 selecionados
              </p>
            </div>

            {/* Lista única de nichos (sugestões + customs adicionados) */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              {isLoadingNiches ? (
                <div className="w-full py-4 text-center">
                  <div className="inline-flex items-center space-x-3">
                    <div className="animate-spin rounded-xl h-6 w-6 border-b-2 border-primary"></div>
                    <span className="text-sm text-gray-medium">
                      Carregando nichos...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const combined: { id: string; name: string; isCustom?: boolean }[] = [
                      ...availableNiches.map(n => ({ id: n.id, name: n.name })),
                    ];
                    niches.forEach(n => {
                      const id = n.id || `custom-${n.text.toLowerCase().replace(/\s+/g, '-')}`;
                      const exists = combined.some(
                        c => c.id === id || c.name.toLowerCase() === n.text.toLowerCase()
                      );
                      if (!exists) combined.push({ id, name: n.text, isCustom: true });
                    });

                    return combined.map((niche) => {
                      const isSelected = niches.some(
                        n => n.id === niche.id || n.text.toLowerCase() === niche.name.toLowerCase()
                      );
                      const isDisabled = !isSelected && niches.length >= 6;

                      const baseClasses =
                        'rounded-full border-2 px-3 py-1.5 text-sm font-normal transition-all duration-200';

                      const selectedClasses = 'bg-primary border-primary text-white';
                      const disabledClasses =
                        'bg-white border-gray-300 text-gray-400 cursor-not-allowed';
                      const defaultClasses =
                        'bg-white border-gray-300 text-gray-700 hover:border-primary hover:bg-primary/5';

                      const handleClick = () => {
                        if (isDisabled) return;
                        if (niche.isCustom) {
                          if (isSelected) {
                            const idx = niches.findIndex(
                              n => n.id === niche.id || n.text.toLowerCase() === niche.name.toLowerCase()
                            );
                            if (idx !== -1) handleRemoveNiche(idx);
                          }
                        } else {
                          handleSelectNiche(niche.id);
                        }
                      };

                      return (
                        <button
                          key={niche.id}
                          type="button"
                          onClick={handleClick}
                          disabled={isDisabled}
                          className={`${baseClasses} ${
                            isSelected
                              ? selectedClasses
                              : isDisabled
                              ? disabledClasses
                              : defaultClasses
                          }`}
                        >
                          {niche.name}
                        </button>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className="onboard-buttons">
            <button
              type="submit"
              disabled={!isValidToSubmit}
              className="onboard-btn-primary"
            >
              Continuar
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="onboard-btn-secondary"
              >
                Voltar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}