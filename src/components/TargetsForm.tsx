import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';
import FormButtons from './FormButtons';

// Profile type definition
interface Profile {
  text: string;
  niche?: string;
  type: 'aiRecommend' | 'manualAdded';
}

export default function TargetsForm({ onContinue, onBack, formData }: FormStepProps) {
  // Get only manually added profiles for initial state
  const getInitialProfiles = (): Profile[] => {
    if (formData?.profilesToMonitor && formData.profilesToMonitor.length > 0) {
      return formData.profilesToMonitor.map(profile => {
        if (typeof profile === 'string') {
          return { text: profile, type: 'manualAdded' as const };
        }
        return profile;
      });
    }
    return [];
  };
  
  // Separate AI suggestions and manually added profiles
  const [profiles, setProfiles] = useState<Profile[]>(getInitialProfiles());
  const [aiSuggestions] = useState<Profile[]>(formData?.aiSuggestedProfiles || []);
  const [currentProfile, setCurrentProfile] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // React to formData changes
  useEffect(() => {
    const newProfiles = getInitialProfiles();
    if (newProfiles.length > 0) {
      setProfiles(newProfiles);
    }
  }, [formData?.profilesToMonitor]);

  const handleAddProfile = () => {
    const trimmedProfile = currentProfile.trim();
    if (trimmedProfile && !profiles.some(p => p.text === trimmedProfile)) {
      setProfiles([...profiles, { text: trimmedProfile, type: 'manualAdded' }]);
      setCurrentProfile('');
    }
  };

  const handleAddSuggestion = (suggestion: Profile) => {
    const isAlreadyAdded = profiles.some(p => p.text === suggestion.text);

    if (isAlreadyAdded) {
      setProfiles(profiles.filter(p => p.text !== suggestion.text));
    } else {
      setProfiles([...profiles, suggestion]);
    }
  };

  const handleRemoveProfile = (index: number) => {
    setProfiles(profiles.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleEditProfile = (index: number) => {
    if (profiles[index].type === 'aiRecommend') {
      return;
    }
    setEditingIndex(index);
    setEditingValue(profiles[index].text);
  };

  const handleSaveEdit = (index: number) => {
    const trimmedValue = editingValue.trim();
    if (trimmedValue && !profiles.some((profile, i) => i !== index && profile.text === trimmedValue)) {
      const updatedProfiles = [...profiles];
      updatedProfiles[index] = { ...updatedProfiles[index], text: trimmedValue };
      setProfiles(updatedProfiles);
    }
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
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
    const cleanValue = value.replace(/^@/, '');
    if (/^[a-zA-Z0-9._]*$/.test(cleanValue) && cleanValue.length <= 30) {
      setEditingValue(cleanValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProfile();
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/^@/, '');
    if (/^[a-zA-Z0-9._]*$/.test(cleanValue) && cleanValue.length <= 30) {
      setCurrentProfile(cleanValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onContinue) {
      onContinue({ profilesToMonitor: profiles });
    }
  };

  const isValidToSubmit = profiles.length >= 3;

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="pt-12 pb-16 px-6">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col px-6 max-w-sm mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-dark text-left">
              Escolha no mínimo 3 influencers que você quer acompanhar
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              Digite um @ e pressione Enter para adicionar
            </p>
          </div>

          <div className="mb-4">
            <div className="flex space-x-2 mb-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="text-sm text-gray-medium ">@</span>
                </div>
                <input
                  type="text"
                  value={currentProfile}
                  onChange={handleProfileChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 text-sm text-gray-dark bg-white border border-[#E5E5E5] rounded-xl transition-all duration-200 focus:outline-none focus:border-primary hover:border-primary"
                  placeholder="perfil_para_monitorar"
                  maxLength={30}
                />
              </div>
              <button
                type="button"
                onClick={handleAddProfile}
                disabled={!currentProfile.trim() || profiles.some(p => p.text === currentProfile.trim())}
                className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentProfile.trim() && !profiles.some(p => p.text === currentProfile.trim())
                    ? 'bg-primary text-secondary hover:bg-accent/90'
                    : 'bg-gray-300 text-gray-medium cursor-not-allowed'
                }`}
              >
                +
              </button>
            </div>

            {/* LISTA DE PERFIS ADICIONADOS */}
            {profiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {profiles.map((profile, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg"
                  >
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={handleEditChange}
                        onKeyDown={(e) => handleEditKeyPress(e, index)}
                        className="flex-1 mr-2 text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <div className="flex-1 text-sm text-gray-dark truncate">
                        @{profile.text}
                      </div>
                    )}

                    <div className="flex items-center gap-2 ml-2">
                      {editingIndex === index ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(index)}
                            className="text-xs px-2 py-1 rounded-lg bg-primary text-white"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-xs px-2 py-1 rounded-lg bg-gray-200 text-gray-700"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          {profile.type !== 'aiRecommend' && (
                            <button
                              type="button"
                              onClick={() => handleEditProfile(index)}
                              className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700"
                            >
                              Editar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveProfile(index)}
                            className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-600"
                          >
                            Remover
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI SUGGESTIONS */}
            {aiSuggestions.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                {aiSuggestions.map((suggestion, index) => {
                  const isAlreadyAdded = profiles.some(p => p.text === suggestion.text);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAddSuggestion(suggestion)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-200 shadow-sm ${
                        isAlreadyAdded
                          ? 'bg-green-500/20 border-green-500 text-green-700 hover:bg-green-500/30'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="font-semibold text-base">@</span>
                        <div className="flex-1">
                          <div className="font-semibold text-base">{suggestion.text}</div>
                          {suggestion.niche && (
                            <div className="text-xs opacity-75 truncate mt-0.5">{suggestion.niche}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {isAlreadyAdded ? (
                          <div className="text-green-600 text-lg font-bold" title="Clique para remover">✓</div>
                        ) : (
                          <div className="text-gray-500 text-xl font-bold" title="Clique para adicionar">+</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0"></div>

          <div className="pt-4 pb-8">
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
          </div>
        </form>
      </div>
    </div>
  );
}
