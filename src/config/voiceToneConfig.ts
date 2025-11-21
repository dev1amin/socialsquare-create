import { FormStep, FormData } from '../types/form';
import MissionSelectionForm from '../components/MissionSelectionForm';
import CoreValuesForm from '../components/CoreValuesForm';
import CompetitiveDifferentialsForm from '../components/CompetitiveDifferentialsForm';
import MarketSegmentForm from '../components/MarketSegmentForm';
import CompetitiveContextForm from '../components/CompetitiveContextForm';
import TargetAudienceForm from '../components/TargetAudienceForm';
import PublicPerceptionForm from '../components/PublicPerceptionForm';
import EmotionalBenefitsForm from '../components/EmotionalBenefitsForm';
import ReasonsToBelieveForm from '../components/ReasonsToBelieveForm';
import PersonalityAttributesForm from '../components/PersonalityAttributesForm';
import BrandConsistencyForm from '../components/BrandConsistencyForm';

export const voiceToneConfig: FormStep[] = [
  {
    id: 'mission_selection',
    component: MissionSelectionForm,
    title: 'Brand Mission Selection',
    nextStepLogic: (formData: FormData): string => {
      return 'core_values'; // returns the next step ID
    }
  },
  {
    id: 'core_values',
    component: CoreValuesForm,
    title: 'Core Values Selection',
    nextStepLogic: (formData: FormData): string => {
      return 'competitive_differentials';
    },
    prevStepId: 'mission_selection'
  },
  {
    id: 'competitive_differentials',
    component: CompetitiveDifferentialsForm,
    title: 'Competitive Differentials Selection',
    nextStepLogic: (formData: FormData): string => {
      return 'market_segment';
    },
    prevStepId: 'core_values'
  },
  {
    id: 'market_segment',
    component: MarketSegmentForm,
    title: 'Market Segment Selection',
    nextStepLogic: (formData: FormData): string => {
      return 'competitive_context';
    },
    prevStepId: 'competitive_differentials'
  },
  {
    id: 'competitive_context',
    component: CompetitiveContextForm,
    title: 'Competitive Context Selection',
    nextStepLogic: (formData: FormData): string => {
      return 'target_audience';
    },
    prevStepId: 'market_segment'
  },
  {
    id: 'target_audience',
    component: TargetAudienceForm,
    title: 'Target Audience Selection',
    nextStepLogic: (formData: FormData): string => {
      return 'public_perception';
    },
    prevStepId: 'competitive_context'
  },
  {
    id: 'public_perception',
    component: PublicPerceptionForm,
    title: 'Public Perception Question',
    nextStepLogic: (formData: FormData): string => {
      return 'emotional_benefits';
    },
    prevStepId: 'target_audience'
  },
  {
    id: 'emotional_benefits',
    component: EmotionalBenefitsForm,
    title: 'Emotional Benefits Question',
    nextStepLogic: (formData: FormData): string => {
      return 'reasons_to_believe';
    },
    prevStepId: 'public_perception'
  },
  {
    id: 'reasons_to_believe',
    component: ReasonsToBelieveForm,
    title: 'Reasons to Believe Question',
    nextStepLogic: (formData: FormData): string => {
      return 'personality_attributes';
    },
    prevStepId: 'emotional_benefits'
  },
  {
    id: 'personality_attributes',
    component: PersonalityAttributesForm,
    title: 'Personality Attributes Question',
    nextStepLogic: (formData: FormData): string => {
      return 'brand_consistency';
    },
    prevStepId: 'reasons_to_believe'
  },
  {
    id: 'brand_consistency',
    component: BrandConsistencyForm,
    title: 'Brand Consistency Question',
    nextStepLogic: (formData: FormData): string | null => {
      // This funnel ends here - BrandConsistencyForm will handle redirect
      return null; // Return null as it ends the funnel
    },
    prevStepId: 'personality_attributes'
  }
];

// Helper function to find step by ID
export const findVoiceToneStepById = (id: string): FormStep | undefined => {
  return voiceToneConfig.find(step => step.id === id);
};

// Helper function to find step index by ID  
export const findVoiceToneStepIndexById = (id: string): number => {
  return voiceToneConfig.findIndex(step => step.id === id);
};

// Get the first step
export const getVoiceToneFirstStep = (): FormStep => {
  return voiceToneConfig[0];
};