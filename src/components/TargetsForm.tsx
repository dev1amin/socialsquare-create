import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import { FormStepProps, Niche } from '../types/form';

// Interface unificada para dados de influencer (usado por findTargetes e getUserProfileInfluencers)
interface InfluencerData {
  username: string;
  niche: string;
  profilePicture: string;
  bio: string;
  following: string;
  followers: string;
  media: string;
  name: string;
  userId: string;
  verified: string;
  instagramLink: string;
  success: boolean;
}

// Interface para influencer selecionado (para envio ao backend)
interface SelectedInfluencer {
  handle: string;
  lang: string;
  country: string;
  niche_ids: string[];
  niche_names: string[];
  profileData: InfluencerData;
}

// Componente de Card do Influencer
function InfluencerCard({
  influencer,
  isSelected,
  onToggle,
}: {
  influencer: InfluencerData;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const formatFollowers = (count: string) => {
    const num = parseInt(count, 10);
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return count;
  };

  return (
    <div
      onClick={onToggle}
      className={`
        relative cursor-pointer rounded-2xl p-4 transition-all duration-300 border-2
        ${
          isSelected
            ? 'bg-blue-500/20 border-blue-500 backdrop-blur-md shadow-lg'
            : 'bg-white/80 border-gray-200 hover:border-gray-300 hover:shadow-md backdrop-blur-sm'
        }
      `}
    >
      {/* Indicador de seleção */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Foto de perfil */}
        <div className="flex-shrink-0 relative">
          <img
            src={influencer.profilePicture}
            alt={influencer.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/64?text=@';
            }}
          />
          {influencer.verified === 'true' && (
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {influencer.name}
            </h3>
          </div>

          <p className="text-sm text-gray-500 mb-1">@{influencer.username}</p>

          {influencer.niche && (
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full mb-2">
              {influencer.niche}
            </span>
          )}

          <p
            className="text-sm text-gray-600 line-clamp-2 mb-3"
            title={influencer.bio}
          >
            {influencer.bio}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <span className="font-semibold text-gray-900">
                {formatFollowers(influencer.followers)}
              </span>
              <span className="text-gray-500 ml-1">seguidores</span>
            </div>
            <div className="text-center">
              <span className="font-semibold text-gray-900">
                {influencer.media}
              </span>
              <span className="text-gray-500 ml-1">posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Link para o Instagram */}
      <a
        href={influencer.instagramLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-3 flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
        Ver feed
      </a>
    </div>
  );
}

export default function TargetsForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedInfluencers, setSelectedInfluencers] =
    useState<Map<string, SelectedInfluencer>>(new Map());

  const initialSuggestions: InfluencerData[] = (formData?.aiSuggestedProfiles || []).filter(
    (item: InfluencerData) => item && item.success === true
  );

  const [suggestions] = useState<InfluencerData[]>(initialSuggestions);
  const [currentHandle, setCurrentHandle] = useState('');
  const [currentNiche, setCurrentNiche] = useState(''); // <<< NICHO DIGITADO
  const [showNicheDropdown, setShowNicheDropdown] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [manualProfiles, setManualProfiles] = useState<InfluencerData[]>([]);
  const nicheInputRef = useRef<HTMLInputElement>(null);
  const nicheDropdownRef = useRef<HTMLDivElement>(null);

  // Nichos disponíveis do formData (reutilizando a chamada anterior)
  const availableNiches: Niche[] = formData?.niches || [];

  // Filtrar nichos baseado no que o usuário digitou
  const filteredNiches = availableNiches.filter(niche =>
    niche.text.toLowerCase().includes(currentNiche.toLowerCase())
  );

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        nicheDropdownRef.current &&
        !nicheDropdownRef.current.contains(event.target as Node) &&
        nicheInputRef.current &&
        !nicheInputRef.current.contains(event.target as Node)
      ) {
        setShowNicheDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // manual primeiro, depois sugestões
  const allInfluencers = [...manualProfiles, ...suggestions].filter(
    (influencer, index, self) =>
      index === self.findIndex((i) => i.username === influencer.username)
  );

  const handleAddManualProfile = async () => {
    const trimmedHandle = currentHandle.trim().replace(/^@/, '');
    const trimmedNiche = currentNiche.trim();
    if (!trimmedHandle) return;

    if (
      allInfluencers.some(
        (p) => p.username.toLowerCase() === trimmedHandle.toLowerCase()
      )
    ) {
      setProfileError('Este perfil já está na lista.');
      return;
    }

    setLoadingProfile(true);
    setProfileError(null);

    try {
      const response = await fetch(
        'https://api.workez.online/webhook/getUserProfileInfluencers',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: trimmedHandle }),
        }
      );

      const data = await response.json();
      console.log('getUserProfileInfluencers response:', data);

      let profileData: InfluencerData | null = null;

      if (Array.isArray(data) && data.length > 0 && data[0].success === true) {
        profileData = data[0];
      } else if (data && data.success === true) {
        profileData = data as InfluencerData;
      }

      if (profileData) {
        // sobrescreve niche com o que o usuário digitou, se houver
        // gera o instagramLink correto
        const finalProfile: InfluencerData = {
          ...profileData,
          niche: trimmedNiche || profileData.niche || '',
          instagramLink: `https://www.instagram.com/${profileData.username}`,
        };

        // adiciona no início da lista manual
        setManualProfiles((prev) => [finalProfile, ...prev]);
        setCurrentHandle('');
        setCurrentNiche('');
        setProfileError(null);

        // já marca como selecionado, usando o niche que o usuário definiu
        setSelectedInfluencers((prev) => {
          const newMap = new Map(prev);
          newMap.set(finalProfile.username, {
            handle: finalProfile.username,
            lang: 'pt',
            country: 'BR',
            niche_ids: [],
            niche_names: finalProfile.niche ? [finalProfile.niche] : [],
            profileData: finalProfile,
          });
          return newMap;
        });
      } else {
        setProfileError('Perfil não encontrado. Verifique se o @ está correto.');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileError('Erro ao buscar perfil. Tente novamente.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleToggleSelection = (influencer: InfluencerData) => {
    setSelectedInfluencers((prev) => {
      const newMap = new Map(prev);

      if (newMap.has(influencer.username)) {
        newMap.delete(influencer.username);
      } else {
        newMap.set(influencer.username, {
          handle: influencer.username,
          lang: 'pt',
          country: 'BR',
          niche_ids: [],
          niche_names: influencer.niche ? [influencer.niche] : [],
          profileData: influencer,
        });
      }

      return newMap;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddManualProfile();
    }
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^@/, '');
    if (/^[a-zA-Z0-9._]*$/.test(value) && value.length <= 30) {
      setCurrentHandle(value);
      setProfileError(null);
    }
  };

  const handleNicheChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentNiche(e.target.value);
    setShowNicheDropdown(true);
  };

  const handleSelectNiche = (niche: Niche) => {
    setCurrentNiche(niche.text);
    setShowNicheDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInfluencers.size >= 3 && onContinue) {
      const profilesArray = Array.from(selectedInfluencers.values()).map(
        ({ profileData, ...rest }) => ({
          text: rest.handle,
          type: 'suggestionAdded' as const,
          lang: rest.lang,
          country: rest.country,
          niche_ids: rest.niche_ids,
          niche_names: rest.niche_names,
        })
      );

      onContinue({ profilesToMonitor: profilesArray });
    }
  };

  const handleSkip = () => {
    if (onContinue) {
      onContinue({ profilesToMonitor: null });
    }
  };

  const isValidToSubmit = selectedInfluencers.size >= 3;

  return (
    // 100vh: header + conteúdo + botões
    <div className="onboard-container h-screen flex flex-col">
      <div className="onboard-header">
        <Logo />
      </div>

      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl px-4 py-4 flex flex-col">
          {/* TÍTULO + INPUT */}
          <div className="shrink-0">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Escolha no mínimo 3 influencers para acompanhar
              </h1>
              <p className="text-gray-600">
                Selecione clicando nos cards ou adicione manualmente
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedInfluencers.size} de 3 selecionados
              </p>
            </div>

            <div className="mb-4">
              <div className="flex flex-col md:flex-row gap-2 max-w-xl mx-auto">
                {/* Input handle */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="text-gray-400">@</span>
                  </div>
                  <input
                    type="text"
                    value={currentHandle}
                    onChange={handleHandleChange}
                    onKeyPress={handleKeyPress}
                    disabled={loadingProfile}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    placeholder="adicionar_perfil"
                    maxLength={30}
                  />
                </div>

                {/* Input niche com autocomplete */}
                <div className="flex-1 relative">
                  <input
                    ref={nicheInputRef}
                    type="text"
                    value={currentNiche}
                    onChange={handleNicheChange}
                    onFocus={() => setShowNicheDropdown(true)}
                    disabled={loadingProfile}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    placeholder="nicho do perfil (ex: marketing, fitness)"
                    maxLength={60}
                  />
                  {/* Dropdown de nichos */}
                  {showNicheDropdown && (filteredNiches.length > 0 || currentNiche.trim()) && (
                    <div
                      ref={nicheDropdownRef}
                      className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                    >
                      {filteredNiches.length > 0 ? (
                        filteredNiches.map((niche, index) => (
                          <button
                            key={niche.id || index}
                            type="button"
                            onClick={() => handleSelectNiche(niche)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
                          >
                            {niche.text}
                          </button>
                        ))
                      ) : currentNiche.trim() ? (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          Nicho personalizado: <span className="font-medium text-gray-700">{currentNiche}</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Botão adicionar */}
                <button
                  type="button"
                  onClick={handleAddManualProfile}
                  disabled={!currentHandle.trim() || loadingProfile}
                  className={`px-5 py-3 rounded-xl font-medium transition-all md:self-stretch ${
                    currentHandle.trim() && !loadingProfile
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loadingProfile ? (
                    <svg className="w-5 h-5 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    '+'
                  )}
                </button>
              </div>

              {profileError && (
                <p className="text-center text-sm text-red-500 mt-2">{profileError}</p>
              )}
            </div>
          </div>

          {/* CONTAINER FIXO COM SCROLL – height: 200px (1 card mobile, 2 no resto) */}
          <div className="shrink-0 mb-4">
            <div className="h-[200px] overflow-y-auto pr-1">
              {allInfluencers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allInfluencers.map((influencer) => (
                    <InfluencerCard
                      key={influencer.username}
                      influencer={influencer}
                      isSelected={selectedInfluencers.has(influencer.username)}
                      onToggle={() => handleToggleSelection(influencer)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum influencer encontrado.</p>
                  <p className="text-sm mt-1">
                    Adicione manualmente usando o campo acima.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* BOTÕES */}
          <div className="shrink-0 flex flex-col gap-3 pb-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValidToSubmit}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                isValidToSubmit
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continuar ({selectedInfluencers.size}/3)
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-3 rounded-xl font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Fazer depois
            </button>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Voltar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}