export interface Niche {
  text: string;
  type: 'aiRecommend' | 'manualAdded';
  id?: string;
}

export interface Profile {
  text: string;
  niche?: string;
  type: 'aiRecommend' | 'manualAdded';
  lang?: string;
  country?: string;
  niche_ids?: string[];
  niche_names?: string[];
}

export interface FormData {
  age?: string;
  password?: string;
  linkedinHandle?: string;
  sex?: string;
  niches?: Niche[];
  profileMonitoring?: string;
  heightUnit?: 'feet' | 'inches' | 'centimeters';
  heightFeet?: string;
  heightInches?: string;
  heightTotalInches?: string;
  heightCentimeters?: string;
  hasWebsite?: string;
  weight?: string;
  weightChange?: string;
  pregnancyStatus?: string;
  hormoneTherapy?: string;
  ht1Medications?: string[];
  htMedications?: {
    [medicationName: string]: {
      method?: string;
      duration?: string;
      doseChange?: string;
    };
  };
  walkingActivity?: string;
  sleepHours?: string;
  sleepSchedule?: string;
  snoringStatus?: string;
  stairsCapacity?: string;
  liftingCapability?: string;
  stressLevel?: string;
  alcoholConsumption?: string;
  eatingHabits?: string;
  mainObjective?: string;
  familyHistory?: string[];
  profilesToMonitor?: Profile[] | string[];
  aiSuggestedProfiles?: Profile[];
  lonelinessFactors?: string[];
  brandMissions?: string[];
  coreValues?: string[];
  competitiveDifferentials?: string[];
  marketSegment?: string;
  customMarketSegment?: string;
  competitiveContext?: string;
  targetAudience?: string[];
  publicPerception?: string;
  emotionalBenefit?: string;
  reasonsToBelieves?: string[];
  personalityAttributes?: string[];
  brandConsistencyElements?: string[];
  userProfileMetrics?: {
    profilePicture?: string;
    bio?: string;
    following?: string;
    followers?: string;
    media?: string;
    name?: string;
    username?: string;
    userId?: string;
    success?: boolean;
    verified?: boolean;
  };
  email?: string;
  accountName?: string;
  instagramHandle?: string;
  socialNetworkType?: string;
  websiteLink?: string;
  activationToken?: string;
  jwtToken?: string;
  skipPassword?: boolean;
  registrationComplete?: boolean;
  needsBusinessSetup?: boolean;
  goBackToInstagramHandle?: boolean;
  [key: string]: any;
}

export interface FormStep {
  id: string;
  component: React.ComponentType<FormStepProps>;
  nextStepLogic: (formData: FormData) => string | null; // null means form is complete
  prevStepId?: string | ((formData: FormData, history: string[]) => string | null);
  title?: string; // Optional title for debugging/admin purposes
}

export interface FormStepProps {
  onContinue: (data: any) => void;
  onBack?: () => void;
  formData?: FormData;
  currentMedication?: string; // For dynamic sub-flow questions
}