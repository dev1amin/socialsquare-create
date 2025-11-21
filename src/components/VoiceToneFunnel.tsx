import React, { useState } from 'react';
import { FormData } from '../types/form';
import { voiceToneConfig, findVoiceToneStepById, getVoiceToneFirstStep } from '../config/voiceToneConfig';

// localStorage key for voice tone form data
const VOICE_TONE_DATA_STORAGE_KEY = 'prevent-quiz-voice-tone-data';

// Helper functions for localStorage
const saveVoiceToneDataToStorage = (data: FormData) => {
  try {
    localStorage.setItem(VOICE_TONE_DATA_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save voice tone data to localStorage:', error);
  }
};

const loadVoiceToneDataFromStorage = (): FormData => {
  try {
    const stored = localStorage.getItem(VOICE_TONE_DATA_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to load voice tone data from localStorage:', error);
    return {};
  }
};

export default function VoiceToneFunnel() {
  // State management
  const [formData, setFormData] = useState<FormData>(loadVoiceToneDataFromStorage());
  const [currentStepId, setCurrentStepId] = useState<string>(getVoiceToneFirstStep().id);
  const [history, setHistory] = useState<string[]>([]); // Track visited steps for back navigation
  
  // Development state
  const [showDevNavigation, setShowDevNavigation] = useState(false);

  // Get current step configuration
  const getCurrentStep = () => {
    return findVoiceToneStepById(currentStepId);
  };

  // Handle form submission from current step
  const handleContinue = (stepData: any) => {
    const currentStep = getCurrentStep();
    if (!currentStep) return;

    // Update form data with new step data
    const updatedFormData = { ...formData, ...stepData };
    setFormData(updatedFormData);
    saveVoiceToneDataToStorage(updatedFormData);

    // Add current step to history before moving to next
    setHistory(prev => [...prev, currentStepId]);

    // Determine next step using the step's logic
    const nextStepId = currentStep.nextStepLogic(updatedFormData);

    if (nextStepId === null) {
      // Form is complete - BrandConsistencyForm will handle redirect
      console.log('Voice tone funnel complete');
    } else {
      // Navigate to next step
      const nextStep = findVoiceToneStepById(nextStepId);
      if (nextStep) {
        setCurrentStepId(nextStepId);
      } else {
        console.error(`Next step with ID "${nextStepId}" not found in voice tone configuration`);
      }
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (history.length === 0) return;

    // Get the previous step from history
    const newHistory = [...history];
    const previousStepId = newHistory.pop();
    
    if (previousStepId) {
      setHistory(newHistory);
      setCurrentStepId(previousStepId);
    }
  };

  // Check if back button should be shown
  const canGoBack = () => {
    return history.length > 0;
  };

  // Development helper function to jump to any step
  const jumpToStep = (stepId: string) => {
    // Set new current step
    setCurrentStepId(stepId);
    
    // Clear history for clean navigation
    setHistory([]);
    
    // Save current form data when jumping (for development)
    saveVoiceToneDataToStorage(formData);
    
    // Hide the navigation dropdown
    setShowDevNavigation(false);
  };

  // Render the current step component
  const renderCurrentStep = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center font-outfit px-6">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-red-600 mb-4">
              Error: Step Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              Step "{currentStepId}" is not defined in the voice tone configuration.
            </p>
            <button
              onClick={() => {
                setCurrentStepId(getVoiceToneFirstStep().id);
                setHistory([]);
                setFormData({});
                localStorage.removeItem(VOICE_TONE_DATA_STORAGE_KEY);
              }}
              className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Reset Voice Tone
            </button>
          </div>
        </div>
      );
    }

    // Render the step's component with the required props
    const StepComponent = currentStep.component;
    return (
      <StepComponent 
        onContinue={handleContinue} 
        formData={formData}
      />
    );
  };

  return (
    <div className="relative">
      {renderCurrentStep()}
      
      {/* Back Button - Only show when navigation is possible */}
      {canGoBack() && (
        <button
          onClick={handleBack}
          className="fixed top-12 left-6 p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 z-10"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      {/* Development Helper - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/90 text-white p-3 rounded-lg text-xs font-mono z-20 max-w-xs">
          <div className="text-purple-300 font-bold mb-1">VOICE TONE FUNNEL</div>
          <div>Step: {currentStepId}</div>
          <div>History: {history.length}</div>
          
          {/* Step Navigation */}
          <div className="mt-3 border-t border-gray-600 pt-2">
            <button
              onClick={() => setShowDevNavigation(!showDevNavigation)}
              className="text-purple-300 hover:text-purple-200 underline text-xs"
            >
              {showDevNavigation ? 'Hide' : 'Jump to Step'}
            </button>
            
            {showDevNavigation && (
              <div className="mt-2 max-h-48 overflow-y-auto bg-gray-800 rounded p-2">
                <div className="mb-2 text-gray-300 font-bold">Voice Tone Steps:</div>
                {voiceToneConfig.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => jumpToStep(step.id)}
                    className={`block w-full text-left px-2 py-1 text-xs hover:bg-gray-700 rounded mb-1 ${
                      currentStepId === step.id ? 'bg-purple-600' : ''
                    }`}
                  >
                    {step.id}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}