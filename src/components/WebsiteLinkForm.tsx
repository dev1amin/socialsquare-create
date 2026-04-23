import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';
import FormButtons from './FormButtons';
import { ONBOARDING_ENDPOINTS } from '../config/api';

export default function WebsiteLinkForm({ onContinue, onBack, formData }: FormStepProps) {
  const [websiteLink, setWebsiteLink] = useState(formData?.websiteLink || 'https://');
  const [isLoading, setIsLoading] = useState(false);

  const handleWebsiteLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value.startsWith('https://https://')) {
      setWebsiteLink(value.replace('https://https://', 'https://'));
    } else if (value.startsWith('http://https://')) {
      setWebsiteLink(value.replace('http://https://', 'https://'));
    } else if (value.startsWith('https://http://')) {
      setWebsiteLink(value.replace('https://http://', 'https://'));
    } else {
      if (!value.startsWith('https://')) {
        setWebsiteLink('https://' + value.replace(/^https?:\/\//, ''));
      } else {
        setWebsiteLink(value);
      }
    }
  };

  const isValidWebsiteLink = () => {
    const trimmed = websiteLink.trim();
    if (trimmed.length <= 10) return false;
    
    const urlPattern = /^https:\/\/[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*([\/\w\.\-\?\&\%\#\=]*)*\/?$/i;
    return urlPattern.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (websiteLink.trim() && isValidWebsiteLink()) {
      setIsLoading(true);
      
      try {
        const response = await fetch(ONBOARDING_ENDPOINTS.analyzeWebsite, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            websiteLink: websiteLink.trim()
          })
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log('Website analysis response:', responseData);
          
          let extractedNiches: { text: string; type: string }[] = [];
          if (Array.isArray(responseData.niches) && responseData.niches.length > 0 && responseData.success === true) {
            extractedNiches = responseData.niches
              .slice(0, 3)
              .map((niche: { name: string; is_custom: boolean } | string) => ({
                text: typeof niche === 'string' ? niche : niche.name,
                type: 'aiRecommend',
              }));
          }
          
          if (onContinue) {
            onContinue({ 
              websiteLink: websiteLink.trim(),
              websiteAnalysis: responseData,
              niches: extractedNiches.length > 0 ? extractedNiches : undefined
            });
          }
        } else {
          console.error('Website analysis request failed:', response.status, response.statusText);
          if (onContinue) {
            onContinue({ websiteLink: websiteLink.trim() });
          }
        }
      } catch (error) {
        console.error('Website analysis request error:', error);
        if (onContinue) {
          onContinue({ websiteLink: websiteLink.trim() });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="onboard-container">
      <div className="onboard-header">
        <Logo />
      </div>

      <div className="onboard-content">
        <form onSubmit={handleSubmit} className="onboard-form">
          <div className="onboard-question">
            <h1 className="onboard-title">
              Qual o link do site?
            </h1>
            <p className="onboard-subtitle">(Obrigatório)</p>
          </div>

          <div className="onboard-input-section">
            {isLoading ? (
              <div className="w-full py-8 text-center">
                <div className="inline-flex items-center space-x-3">
                  <div className="animate-spin rounded-xl h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-sm text-gray-medium">
                    Analisando website...
                  </span>
                </div>
              </div>
            ) : (
              <input
                type="url"
                value={websiteLink}
                onChange={handleWebsiteLinkChange}
                className="w-full px-4 py-3 text-sm text-gray-dark bg-white border border-[#E5E5E5] rounded-xl transition-all duration-200 focus:outline-none focus:border-primary hover:border-primary placeholder-gray-400"
                autoFocus
                placeholder="https://www.seusite.com.br"
              />
            )}
          </div>

          {!isLoading && (
            <FormButtons
              onBack={onBack}
              continueDisabled={!isValidWebsiteLink()}
              continueText="Continuar"
              showBack={!!onBack}
            />
          )}
        </form>
      </div>
    </div>
  );
}
