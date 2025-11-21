import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function TargetAudienceForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(formData?.targetAudience || []);

  const audiences = [
    // B2C Options
    { category: 'B2C', name: 'Jovens Adultos Urbanos', description: '18–30 anos, conectados digitalmente, adotantes rápidos de novidades' },
    { category: 'B2C', name: 'Famílias e Pais/Mães', description: 'adultos 30–50 com filhos, preocupados com conforto, segurança e economia para a família' },
    { category: 'B2C', name: 'Adolescentes / Geração Z', description: 'público até ~20 anos, altamente engajado em tendências online, valoriza autenticidade e propósito' },
    { category: 'B2C', name: 'Profissionais em Início de Carreira', description: '20–35 anos, buscando desenvolvimento profissional, networking e estilo de vida ativo' },
    { category: 'B2C', name: 'Classe Alta / Público Premium', description: 'consumidores de alto poder aquisitivo, buscam produtos exclusivos, luxo, qualidade superior e status' },
    { category: 'B2C', name: 'Nichos de Interesse Específico', description: 'entusiastas de um tema (ex: gamers, fitness, sustentabilidade, veganismo, arte/design) altamente engajados nessa paixão' },
    { category: 'B2C', name: 'Seniors da Melhor Idade', description: 'acima de 60 anos, foco em saúde, conforto, atendimento confiável e fácil usabilidade' },
    
    // B2B Options  
    { category: 'B2B', name: 'Pequenas e Médias Empresas', description: 'negócios de menor porte que buscam soluções acessíveis e práticas para crescer' },
    { category: 'B2B', name: 'Grandes Empresas / Corporativo', description: 'organizações de grande porte que exigem soluções escaláveis, robustas, com alto nível de serviço e customização' },
    { category: 'B2B', name: 'Startups e Empresas Inovadoras', description: 'negócios emergentes, focados em rapidez e inovação, abertos a novas soluções para ganhar vantagem' },
    { category: 'B2B', name: 'Setor Público/Instituições', description: 'órgãos governamentais, ONGs ou instituições que valorizam confiabilidade, compliance e impacto social' },
    { category: 'B2B', name: 'Por Área de Atuação', description: 'empresas de um setor específico (ex: indústria automotiva, setor saúde, comércio varejista)' },
    { category: 'B2B', name: 'Decisores e Personas Específicas', description: 'em contexto B2B, quem dentro da empresa é o foco? (ex: "Diretores de TI em empresas financeiras", "Equipe de RH de indústrias")' }
  ];

  const handleAudienceToggle = (audienceName: string) => {
    if (selectedAudiences.includes(audienceName)) {
      // Remove if already selected
      setSelectedAudiences(selectedAudiences.filter(a => a !== audienceName));
    } else {
      // Add if not selected (no limit specified, so allow multiple)
      setSelectedAudiences([...selectedAudiences, audienceName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAudiences.length > 0 && onContinue) {
      onContinue({ targetAudience: selectedAudiences });
    }
  };

  const isValidToSubmit = selectedAudiences.length > 0;

  const groupedAudiences = {
    'B2C': audiences.filter(a => a.category === 'B2C'),
    'B2B': audiences.filter(a => a.category === 'B2B')
  };

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
              Quem é o público-alvo principal da marca?
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              Selecione as descrições que mais se aproximam do seu público ({selectedAudiences.length} selecionados)
            </p>
          </div>

          {/* Audience Options */}
          <div className="flex-1">
            <div className="space-y-6 max-h-80 overflow-y-auto pr-2">
              {/* B2C Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-dark mb-3">
                  Consumidores Finais (B2C)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {groupedAudiences.B2C.map((audience) => {
                    const isSelected = selectedAudiences.includes(audience.name);
                    
                    return (
                      <button
                        key={audience.name}
                        type="button"
                        onClick={() => handleAudienceToggle(audience.name)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary text-secondary'
                            : 'bg-gray-100 text-gray-dark hover:bg-accent hover:text-white'
                        }`}
                        title={audience.description}
                      >
                        {audience.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* B2B Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-dark mb-3">
                  Empresas/Organizações (B2B)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {groupedAudiences.B2B.map((audience) => {
                    const isSelected = selectedAudiences.includes(audience.name);
                    
                    return (
                      <button
                        key={audience.name}
                        type="button"
                        onClick={() => handleAudienceToggle(audience.name)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary text-secondary'
                            : 'bg-gray-100 text-gray-dark hover:bg-accent hover:text-white'
                        }`}
                        title={audience.description}
                      >
                        {audience.name}
                      </button>
                    );
                  })}
                </div>
              </div>
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