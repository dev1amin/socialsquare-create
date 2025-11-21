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
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customNiche, setCustomNiche] = useState('');

  const [niches, setNiches] = useState<Niche[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Fetch niches from webhook on component mount
  useEffect(() => {
    const fetchNiches = async () => {
      try {
        setIsLoadingNiches(true);
        const response = await fetch('https://webhook.workez.online/webhook/getNiches', {
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

      return {
        text: nicheText,
        type: nicheType,
        id: undefined
      };
    });
  };

  useEffect(() => {
    if (availableNiches.length > 0 && formData?.niches && formData.niches.length > 0) {
      const currentNicheTexts = niches.map(n => n.text).sort().join(',');
      const formDataNicheTexts = formData.niches.map((n: any) =>
        typeof n === 'string' ? n : n.text
      ).sort().join(',');

      if (currentNicheTexts !== formDataNicheTexts) {
        const matchedNiches = matchNichesWithPredefined(formData.niches, availableNiches);
        setNiches(matchedNiches);
        console.log('Matched niches:', matchedNiches);
      }
    }
  }, [availableNiches, formData?.niches]);

  const handleSelectNiche = (nicheId: string) => {
    if (nicheId === 'Outro') {
      setShowOtherInput(true);
      return;
    }

    const selectedNicheOption = availableNiches.find(n => n.id === nicheId);
    if (!selectedNicheOption) return;

    const isAlreadySelected = niches.some(n => n.id === nicheId);

    if (isAlreadySelected) {
      setNiches(niches.filter(n => n.id !== nicheId));
    } else if (niches.length < 6) {
      setNiches([...niches, {
        text: selectedNicheOption.name,
        type: 'manualAdded',
        id: selectedNicheOption.id
      }]);
    }
  };

  const handleAddCustomNiche = () => {
    const trimmedNiche = customNiche.trim();
    if (trimmedNiche && !niches.some(n => n.text.toLowerCase() === trimmedNiche.toLowerCase()) && niches.length < 6) {
      const matched = availableNiches.find(
        predefined => predefined.name.toLowerCase() === trimmedNiche.toLowerCase()
      );

      if (matched) {
        if (!niches.some(n => n.id === matched.id)) {
          setNiches([...niches, { text: matched.name, type: 'manualAdded', id: matched.id }]);
        }
      } else {
        setNiches([...niches, { text: trimmedNiche, type: 'manualAdded', id: undefined }]);
      }

      setCustomNiche('');
      setShowOtherInput(false);
    }
  };

  const handleRemoveNiche = (index: number) => {
    setNiches(niches.filter((_, i) => i !== index));
    // Cancel editing if we're removing the niche being edited
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleEditNiche = (index: number) => {
    // Don't allow editing of AI-recommended niches
    if (niches[index].type === 'aiRecommend') {
      return;
    }
    setEditingIndex(index);
    setEditingValue(niches[index].text);
  };

  const handleSaveEdit = (index: number) => {
    const trimmedValue = editingValue.trim();
    if (trimmedValue && !niches.some((niche, i) => i !== index && niche.text.toLowerCase() === trimmedValue.toLowerCase())) {
      const updatedNiches = [...niches];

      const matched = availableNiches.find(
        predefined => predefined.name.toLowerCase() === trimmedValue.toLowerCase()
      );

      if (matched) {
        updatedNiches[index] = { text: matched.name, type: updatedNiches[index].type, id: matched.id };
      } else {
        updatedNiches[index] = { ...updatedNiches[index], text: trimmedValue, id: undefined };
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

  const handleCustomNicheKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomNiche();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowOtherInput(false);
      setCustomNiche('');
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, index: number) => {
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
      onContinue({ niches });
    }
  };

  const isValidToSubmit = niches.length > 0;

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header with Logo */}
      <div className="pt-12 pb-8 px-6">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col">
        {/* Question */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-dark text-center">
            Qual ou quais são os seus nicho(s)?
          </h1>
          {formData?.niches && formData.niches.length > 0 && (
            <p className="text-sm text-green-600 mt-2 text-center">
              ✓ Nichos sugeridos baseados no seu website
            </p>
          )}
          <p className="text-sm text-gray-medium mt-2 text-center">
            Selecione até 6 nichos
          </p>
        </div>

        {/* Niche Selection Pills */}
        <div className="mb-8 bg-white rounded-xl p-4 max-h-[400px] overflow-y-auto border border-gray-200">
          {isLoadingNiches ? (
            <div className="w-full py-8 text-center">
              <div className="inline-flex items-center space-x-3">
                <div className="animate-spin rounded-xl h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm text-gray-medium">
                  Carregando nichos...
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {availableNiches.map((niche) => {
                  const isSelected = niches.some(n => n.id === niche.id);
                  const isDisabled = !isSelected && niches.length >= 6;

                  return (
                    <button
                      key={niche.id}
                      type="button"
                      onClick={() => handleSelectNiche(niche.id)}
                      disabled={isDisabled}
                      className={`rounded-full border-2 px-3 py-2 text-sm font-normal transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary border-primary text-white'
                          : isDisabled
                          ? 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      {niche.name}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowOtherInput(true)}
                  disabled={niches.length >= 6}
                  className={`rounded-full border-2 px-3 py-2 text-sm font-normal transition-all duration-200 ${
                    niches.length >= 6
                      ? 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  Outro
                </button>
              </div>

              {/* Custom niche input */}
              {showOtherInput && (
                <div className="mt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customNiche}
                      onChange={(e) => setCustomNiche(e.target.value)}
                      onKeyPress={handleCustomNicheKeyPress}
                      className="flex-1 px-4 py-3 text-sm text-gray-dark bg-white border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:border-primary hover:border-primary placeholder-gray-400"
                      placeholder="Digite seu nicho personalizado"
                      maxLength={50}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomNiche}
                      disabled={!customNiche.trim() || niches.some(n => n.text === customNiche.trim())}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        customNiche.trim() && !niches.some(n => n.text === customNiche.trim())
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtherInput(false);
                      setCustomNiche('');
                    }}
                    className="mt-2 text-sm text-gray-medium hover:text-gray-dark"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={!isValidToSubmit}
            className={`w-full py-4 px-6 rounded-xl font-medium text-white text-sm transition-all duration-200 ${
              isValidToSubmit
                ? 'bg-primary hover:bg-[#5A54E3] active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 px-4 rounded-xl font-medium text-gray-dark bg-gray-light hover:bg-gray-200 text-sm transition-all duration-200"
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