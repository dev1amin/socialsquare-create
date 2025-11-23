import React, { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import { FormStepProps, Profile, Niche } from '../types/form';

export default function TargetsForm({ onContinue, onBack, formData }: FormStepProps) {
  // Get only manually added profiles for initial state
  const getInitialProfiles = (): Profile[] => {
    if (formData?.profilesToMonitor && formData.profilesToMonitor.length > 0) {
      return formData.profilesToMonitor.map(profile => {
        if (typeof profile === 'string') {
          return { text: profile, type: 'manualAdded' as const, lang: 'pt', country: 'BR', niche_ids: [], niche_names: [] };
        }
        return { 
          ...profile, 
          lang: profile.lang || 'pt', 
          country: profile.country || 'BR',
          niche_ids: profile.niche_ids || [],
          niche_names: profile.niche_names || []
        };
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
  const [availableNiches, setAvailableNiches] = useState<Niche[]>([]);
  const [loadingNiches, setLoadingNiches] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [customNicheInputs, setCustomNicheInputs] = useState<{[key: number]: string}>({});
  const [showCustomNicheInput, setShowCustomNicheInput] = useState<{[key: number]: boolean}>({});

  // refs para os containers de nichos de cada perfil
  const nicheListRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // React to formData changes
  useEffect(() => {
    const newProfiles = getInitialProfiles();
    if (newProfiles.length > 0) {
      setProfiles(newProfiles);
    }
  }, [formData?.profilesToMonitor]);

  // Fetch available niches on component mount
  useEffect(() => {
    const fetchNiches = async () => {
      setLoadingNiches(true);
      try {
        const response = await fetch('https://webhook.workez.online/webhook/getNiches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Niches response:', data);
          
          // Handle different response formats
          let nichesArray: any[] = [];
          if (Array.isArray(data) && data.length > 0 && data[0].niches) {
            nichesArray = data[0].niches;
          } else if (data.niches && Array.isArray(data.niches)) {
            nichesArray = data.niches;
          }
          
          if (nichesArray.length > 0) {
            const nichesWithIds = nichesArray.map((niche: any) => ({
              id: niche.id,
              text: niche.name || niche.text,
              type: 'aiRecommend' as const
            }));
            setAvailableNiches(nichesWithIds);
          }
        }
      } catch (error) {
        console.error('Error fetching niches:', error);
      } finally {
        setLoadingNiches(false);
      }
    };
    fetchNiches();
  }, []);

  const handleAddProfile = () => {
    const trimmedProfile = currentProfile.trim();
    if (trimmedProfile && !profiles.some(p => p.text === trimmedProfile)) {
      setProfiles([...profiles, { 
        text: trimmedProfile, 
        type: 'manualAdded',
        lang: 'pt',
        country: 'BR',
        niche_ids: [],
        niche_names: []
      }]);
      setCurrentProfile('');
    }
  };

  const handleAddSuggestion = (suggestion: Profile) => {
    const isAlreadyAdded = profiles.some(p => p.text === suggestion.text);

    if (isAlreadyAdded) {
      setProfiles(profiles.filter(p => p.text !== suggestion.text));
    } else {
      setProfiles([...profiles, {
        ...suggestion,
        lang: suggestion.lang || 'pt',
        country: suggestion.country || 'BR',
        niche_ids: suggestion.niche_ids || [],
        niche_names: suggestion.niche_names || []
      }]);
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

  const handleLanguageChange = (index: number, lang: string) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[index] = { ...updatedProfiles[index], lang };
    setProfiles(updatedProfiles);
  };

  const handleCountryChange = (index: number, country: string) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[index] = { ...updatedProfiles[index], country };
    setProfiles(updatedProfiles);
  };

  const handleNicheToggle = (profileIndex: number, nicheId: string) => {
    const updatedProfiles = [...profiles];
    const profile = updatedProfiles[profileIndex];
    const currentNiches = profile.niche_ids || [];
    
    if (currentNiches.includes(nicheId)) {
      profile.niche_ids = currentNiches.filter(id => id !== nicheId);
    } else {
      profile.niche_ids = [...currentNiches, nicheId];
    }
    
    setProfiles(updatedProfiles);
  };

  const handleCustomNicheToggle = (profileIndex: number) => {
    setShowCustomNicheInput(prev => ({
      ...prev,
      [profileIndex]: !prev[profileIndex]
    }));
    
    // Se desmarcar "Outro", remove todos os nichos custom desse perfil
    if (showCustomNicheInput[profileIndex]) {
      const updatedProfiles = [...profiles];
      const profile = updatedProfiles[profileIndex];
      profile.niche_names = [];
      setProfiles(updatedProfiles);
      setCustomNicheInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[profileIndex];
        return newInputs;
      });
    }
  };

  const handleCustomNicheInputChange = (profileIndex: number, value: string) => {
    setCustomNicheInputs(prev => ({
      ...prev,
      [profileIndex]: value
    }));
  };

  const handleAddCustomNiche = (profileIndex: number) => {
    const customValue = customNicheInputs[profileIndex]?.trim();
    if (!customValue) return;
    
    const updatedProfiles = [...profiles];
    const profile = updatedProfiles[profileIndex];
    const currentCustomNiches = profile.niche_names || [];
    
    // Avoid duplicates
    if (!currentCustomNiches.includes(customValue)) {
      profile.niche_names = [...currentCustomNiches, customValue];
    }

    setProfiles(updatedProfiles);
    setCustomNicheInputs(prev => ({
      ...prev,
      [profileIndex]: ''
    }));

    // scrolla para o topo da lista desse perfil
    const listEl = nicheListRefs.current[profileIndex];
    if (listEl) {
      listEl.scrollTop = 0;
    }
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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
              <div className="mt-4 space-y-3">
                {profiles.map((profile, index) => {
                  // Nichos custom desse perfil vão para o topo da lista
                  const customNichesForProfile: Niche[] = (profile.niche_names || [])
                    .map(name => ({
                      id: `custom-${name.toLowerCase().replace(/\s+/g, '-')}`,
                      text: name,
                      type: 'aiRecommend' as const
                    }));

                  const nichesForProfile: Niche[] = [
                    ...customNichesForProfile,
                    ...availableNiches
                  ];

                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-3 py-2">
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
                              <button
                                type="button"
                                onClick={() => toggleExpanded(index)}
                                className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-600"
                              >
                                {expandedIndex === index ? '▲' : '▼'}
                              </button>
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

                      {/* Expandable section for lang, country, and niches */}
                      {expandedIndex === index && (
                        <div className="px-3 py-3 border-t border-gray-200 bg-gray-50 space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Idioma</label>
                              <select
                                value={profile.lang || 'pt'}
                                onChange={(e) => handleLanguageChange(index, e.target.value)}
                                className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                              >
                                <option value="pt">Português</option>
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">País</label>
                              <select
                                value={profile.country || 'BR'}
                                onChange={(e) => handleCountryChange(index, e.target.value)}
                                className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                              >
                                <option value="BR">Brasil</option>
                                <option value="US">United States</option>
                                <option value="GB">United Kingdom</option>
                                <option value="ES">España</option>
                                <option value="FR">France</option>
                                <option value="DE">Deutschland</option>
                                <option value="PT">Portugal</option>
                                <option value="MX">México</option>
                                <option value="AR">Argentina</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Nichos (opcional)
                            </label>
                            {loadingNiches ? (
                              <div className="text-xs text-gray-500">Carregando nichos...</div>
                            ) : (
                              <div
                                className="max-h-40 overflow-y-auto space-y-1 border border-gray-300 rounded-lg p-2 bg-white"
                                ref={el => {
                                  nicheListRefs.current[index] = el;
                                }}
                              >
                                {nichesForProfile.length > 0 ? (
                                  nichesForProfile.map((niche) => {
                                    const isCustom = niche.id!.startsWith('custom-');
                                    const isChecked = isCustom 
                                      ? (profile.niche_names || []).some(name => 
                                          `custom-${name.toLowerCase().replace(/\s+/g, '-')}` === niche.id
                                        )
                                      : (profile.niche_ids || []).includes(niche.id!);
                                    
                                    return (
                                      <label
                                        key={niche.id}
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => {
                                            if (isCustom) {
                                              // Remove from niche_names
                                              const updatedProfiles = [...profiles];
                                              const prof = updatedProfiles[index];
                                              prof.niche_names = (prof.niche_names || []).filter(
                                                name => `custom-${name.toLowerCase().replace(/\s+/g, '-')}` !== niche.id
                                              );
                                              setProfiles(updatedProfiles);
                                            } else {
                                              handleNicheToggle(index, niche.id!);
                                            }
                                          }}
                                          className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-xs text-gray-700">
                                          {niche.text}
                                        </span>
                                      </label>
                                    );
                                  })
                                ) : (
                                  <div className="text-xs text-gray-500">Nenhum nicho disponível</div>
                                )}

                                {/* Outro DENTRO da lista */}
                                <div className="border-t border-gray-200 pt-2 mt-2">
                                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                                    <input
                                      type="checkbox"
                                      checked={showCustomNicheInput[index] || false}
                                      onChange={() => handleCustomNicheToggle(index)}
                                      className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs text-gray-700 font-medium">Outro</span>
                                  </label>
                                </div>
                              </div>
                            )}

                            {/* Input FORA da lista */}
                            {showCustomNicheInput[index] && (
                              <div className="mt-2 ml-1 flex gap-2">
                                <input
                                  type="text"
                                  value={customNicheInputs[index] || ''}
                                  onChange={(e) => handleCustomNicheInputChange(index, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddCustomNiche(index);
                                    }
                                  }}
                                  placeholder="Digite o nicho"
                                  className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-primary"
                                  maxLength={50}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddCustomNiche(index)}
                                  className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90"
                                >
                                  Add
                                </button>
                              </div>
                            )}

                            {((profile.niche_ids || []).length > 0 || (profile.niche_names || []).length > 0) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {(profile.niche_ids || []).length + (profile.niche_names || []).length} nicho(s) selecionado(s)
                                {(profile.niche_names || []).length > 0 && (
                                  <span className="ml-1">
                                    (inclui personalizado:{' '}
                                    {profile.niche_names!.join(', ')}
                                    )
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI SUGESTIONS */}
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