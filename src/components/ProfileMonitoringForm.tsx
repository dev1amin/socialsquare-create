import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';
import FormButtons from './FormButtons';

export default function ProfileMonitoringForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedAnswer, setSelectedAnswer] = useState(formData?.profileMonitoring || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
    
    if (answer === 'Não') {
      // Send POST request to webhook
      handleNoSelection(answer);
    } else {
      // Auto-forward for "Sim" - go directly to targets without suggestions
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
      const response = await fetch('https://webhook.workez.online/webhook/trendspy/lander/findTargetes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profileMonitoring: answer
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Webhook response:', responseData);
        
        // Extract profiles from webhook response and format for targets step
        let suggestedProfiles = [];
        if (Array.isArray(responseData)) {
          suggestedProfiles = responseData.map((profileObj: any) => ({
            text: profileObj.username, // username already without @
            niche: profileObj.niche, // Store niche for display
            type: 'aiRecommend'
          }));
        }

        // Continue to targets step with the AI suggestions
        if (onContinue) {
          onContinue({ 
            profileMonitoring: answer,
            aiSuggestedProfiles: suggestedProfiles
          });
        }
      } else {
        console.error('Webhook request failed:', response.status, response.statusText);
        // Continue to targets step without suggestions on error
        if (onContinue) {
          onContinue({ 
            profileMonitoring: answer,
            aiSuggestedProfiles: []
          });
        }
      }
    } catch (error) {
      console.error('Webhook request error:', error);
      // Continue to targets step without suggestions on error
      if (onContinue) {
        onContinue({ 
          profileMonitoring: answer,
          aiSuggestedProfiles: []
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue({ profileMonitoring: selectedAnswer });
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header with Logo */}
      <div className="pt-12 pb-16 px-6">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 max-w-sm mx-auto w-full">
        <div className="flex flex-col h-full">
          {/* Question */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-dark text-left">
              Você já sabe quais influencers quer acompanhar?
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              (Você pode fazer isso depois - opcional)
            </p>
          </div>

          {/* Options */}
          <div className="flex-1 space-y-4 pb-20">
            {isLoading ? (
              <div className="w-full py-8 text-center">
                <div className="inline-flex items-center space-x-3">
                  <div className="animate-spin rounded-xl h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-sm text-gray-medium ">
                    Buscando perfis para você...
                  </span>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleAnswerSelection('Sim')}
                  className={`w-full py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200  text-left ${
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
                  className={`w-full py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200  text-left ${
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
      </div>

      {selectedAnswer && !isLoading && (
        <FormButtons
          onBack={onBack}
          onContinue={handleContinue}
          continueText="Continuar"
          showBack={!!onBack}
        />
      )}
    </div>
  );
}