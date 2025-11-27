import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { FormStepProps, Niche } from '../types/form';

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

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Fetch niches from webhook on component mount
  useEffect(() => {
    const fetchNiches = async () => {
      try {
        setIsLoadingNiches(true);
        const response = await fetch('https://api.workez.online/webhook/getNiches', {
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
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleEditNiche = (index: number) => {
    if (niches[index].type === 'aiRecommend') return;
    setEditingIndex(index);
    setEditingValue(niches[index].text);
  };

  const handleSaveEdit = (index: number) => {
    const trimmedValue = editingValue.trim();
    if (
      trimmedValue &&
      !niches.some((niche, i) => i !== index && niche.text.toLowerCase() === trimmedValue.toLowerCase())
    ) {
      const updatedNiches = [...niches];

      const matched = availableNiches.find(
        predefined => predefined.name.toLowerCase() === trimmedValue.toLowerCase()
      );

      if (matched) {
        updatedNiches[index] = {
          text: matched.name,
          type: updatedNiches[index].type,
          id: matched.id
        };
      } else {
        const slug = trimmedValue.toLowerCase().replace(/\s+/g, '-');
        const customId = `custom-${slug}`;

        updatedNiches[index] = {
          ...updatedNiches[index],
          text: trimmedValue,
          id: customId
        };
      }

      setNiches(updatedNiches);
    }
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
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

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(index);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setEditingValue(value);
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

          <div className="onboard-input-section max-h-[50vh] overflow-y-auto">
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
            </div>

            {/* Niche Selection Pills */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 overflow-y-auto flex-1">
              {/* Nichos selecionados */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Nichos selecionados
                </p>
                {niches.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    Nenhum nicho selecionado ainda.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {niches.map((niche, index) => (
                      <div key={niche.id || `${niche.text}-${index}`} className="flex items-center gap-1">
                        {editingIndex === index ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={handleEditChange}
                            onKeyDown={(e) => handleEditKeyDown(e, index)}
                            onBlur={() => handleSaveEdit(index)}
                            autoFocus
                            className="px-3 py-1 text-xs border border-gray-300 rounded-full focus:outline-none focus:border-primary"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEditNiche(index)}
                            className="rounded-full border-2 px-3 py-1 text-xs font-normal bg-primary border-primary text-white"
                          >
                            {niche.text}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveNiche(index)}
                          className="text-xs text-gray-500 hover:text-gray-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sugestões de nichos */}
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
                <>
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Sugestões de nichos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableNiches.map((niche) => {
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

                      return (
                        <div key={niche.id} className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSelectNiche(niche.id)}
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
                          {isSelected && (
                            <button
                              type="button"
                              onClick={() => {
                                const index = niches.findIndex(
                                  n => n.id === niche.id || n.text.toLowerCase() === niche.name.toLowerCase()
                                );
                                if (index !== -1) handleRemoveNiche(index);
                              }}
                              className="text-xs text-gray-500 hover:text-gray-800"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
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