import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';
import { ONBOARDING_ENDPOINTS } from '../config/api';

// Mesmo shape que o retorno do findTargetes
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

export default function ProfileMonitoringForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedAnswer, setSelectedAnswer] = useState(formData?.profileMonitoring || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);

    if (answer === 'Não') {
      handleNoSelection(answer);
    } else {
      setTimeout(() => {
        if (onContinue) {
          onContinue({ profileMonitoring: answer });
        }
      }, 300);
    }
  };

  const handleNoSelection = async (answer: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(ONBOARDING_ENDPOINTS.findTargets, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profileMonitoring: answer,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Webhook response:', responseData);

        let suggestedProfiles: InfluencerData[] = [];

        if (Array.isArray(responseData)) {
          suggestedProfiles = responseData.filter(
            (p: InfluencerData) => p && p.success === true
          );
        } else if (responseData && responseData.success === true) {
          suggestedProfiles = [responseData as InfluencerData];
        }

        if (onContinue) {
          onContinue({
            profileMonitoring: answer,
            aiSuggestedProfiles: suggestedProfiles,
          });
        }
      } else {
        console.error('Webhook request failed:', response.status, response.statusText);
        if (onContinue) {
          onContinue({
            profileMonitoring: answer,
            aiSuggestedProfiles: [],
          });
        }
      }
    } catch (error) {
      console.error('Webhook request error:', error);
      if (onContinue) {
        onContinue({
          profileMonitoring: answer,
          aiSuggestedProfiles: [],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboard-container">
      <div className="onboard-header">
        <Logo />
      </div>

      <div className="onboard-content">
        <div className="onboard-form">
          <div className="onboard-question">
            <h1 className="onboard-title">
              Você já sabe quais influencers quer acompanhar?
            </h1>
            <p className="onboard-subtitle">
              (Você pode fazer isso depois - opcional)
            </p>
          </div>

          <div className="onboard-input-section">
            <div className="space-y-3">
              {isLoading ? (
                <div className="w-full py-8 text-center">
                  <div className="inline-flex items-center space-x-3">
                    <div className="animate-spin rounded-xl h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-sm text-gray-medium">
                      Buscando perfis para você...
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleAnswerSelection('Sim')}
                    className={`w-full py-3 lg:py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedAnswer === 'Sim'
                        ? 'border-primary bg-accent/5 text-primary'
                        : 'border-[#CFCFCF] text-gray-dark hover:border-primary'
                    }`}
                  >
                    Sim, vou escolher no mínimo 3 influencers
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnswerSelection('Não')}
                    className={`w-full py-3 lg:py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedAnswer === 'Não'
                        ? 'border-primary bg-accent/5 text-primary'
                        : 'border-[#CFCFCF] text-gray-dark hover:border-primary'
                    }`}
                  >
                    Não sei quais influencers acompanhar
                  </button>
                </>
              )}
            </div>
          </div>

          {onBack && !isLoading && (
            <div className="onboard-buttons">
              <button
                type="button"
                onClick={onBack}
                className="onboard-btn-secondary"
              >
                Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}