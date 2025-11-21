import { FormStep, FormData } from '../types/form';
import AccountNameForm from '../components/AccountNameForm';
import PasswordForm from '../components/PasswordForm';
import SocialNetworkTypeForm from '../components/SocialNetworkTypeForm';
import InstagramHandleForm from '../components/InstagramHandleForm';
import InstagramConfirmationForm from '../components/InstagramConfirmationForm';
import LinkedinHandleForm from '../components/LinkedinHandleForm';
import WebsiteLinkForm from '../components/WebsiteLinkForm';
import NicheForm from '../components/NicheForm';
import ProfileMonitoringForm from '../components/ProfileMonitoringForm';
import TargetsForm from '../components/TargetsForm';
import WeightChangeForm from '../components/WeightChangeForm';
import MainObjectiveForm from '../components/MedicalConditionsForm';
import Phase1LoadingPage from '../components/Phase1LoadingPage';

export const onboardConfig: FormStep[] = [
  {
    id: 'account_name',
    component: AccountNameForm,
    title: 'Account Name Question',
    nextStepLogic: (formData: FormData) => {
      if (formData.skipPassword || formData.jwtToken) {
        return 'social_network_type';
      }
      return 'password';
    }
  },
  {
    id: 'password',
    component: PasswordForm,
    title: 'Password Question',
    nextStepLogic: (formData: FormData) => {
      return 'social_network_type';
    },
    prevStepId: 'account_name'
  },
  {
    id: 'social_network_type',
    component: SocialNetworkTypeForm,
    title: 'Social Network Type Question',
    nextStepLogic: (formData: FormData) => {
      return 'instagram_handle';
    },
    prevStepId: 'password'
  },
  {
    id: 'instagram_handle',
    component: InstagramHandleForm,
    title: 'Instagram Handle Question',
    nextStepLogic: (formData: FormData) => {
      return 'instagram_confirmation';
    },
    prevStepId: 'social_network_type'
  },
  {
    id: 'instagram_confirmation',
    component: InstagramConfirmationForm,
    title: 'Instagram Profile Confirmation',
    nextStepLogic: (formData: FormData) => {
      // Check if user wants to go back to Instagram handle
      if (formData.goBackToInstagramHandle) {
        return 'instagram_handle';
      }
      return 'linkedin_handle';
    },
    prevStepId: 'instagram_handle'
  },
  {
    id: 'linkedin_handle',
    component: LinkedinHandleForm,
    title: 'LinkedIn Handle Question',
    nextStepLogic: (formData: FormData) => {
      return 'has_website';
    },
    prevStepId: 'instagram_confirmation'
  },
  {
    id: 'has_website',
    component: WeightChangeForm,
    title: 'Website Availability Question',
    nextStepLogic: (formData: FormData) => {
      // If user has a website, ask for the link
      if (formData.hasWebsite === 'Sim') {
        return 'website_link';
      } else {
        // If no website, continue to niches question
        return 'niches';
      }
    },
    prevStepId: 'linkedin_handle'
  },
  {
    id: 'website_link',
    component: WebsiteLinkForm,
    title: 'Website Link Question',
    nextStepLogic: (formData: FormData) => {
      return 'niches';
    },
    prevStepId: 'has_website'
  },
  {
    id: 'niches',
    component: NicheForm,
    title: 'Niche Selection Question',
    nextStepLogic: (formData: FormData) => {
      return 'main_objective';
    },
    prevStepId: (formData: FormData) => {
      if (formData.hasWebsite === 'Sim') {
        return 'website_link';
      } else {
        return 'has_website';
      }
    }
  },
  {
    id: 'main_objective',
    component: MainObjectiveForm,
    title: 'Main Objective Question',
    nextStepLogic: (formData: FormData) => {
      return 'profile_monitoring';
    },
    prevStepId: 'niches'
  },
  {
    id: 'profile_monitoring',
    component: ProfileMonitoringForm,
    title: 'Profile Monitoring Question',
    nextStepLogic: (formData: FormData) => {
      return 'targets';
    },
    prevStepId: 'main_objective'
  },
  {
    id: 'targets',
    component: TargetsForm,
    title: 'Targets to Monitor Question',
    nextStepLogic: (formData: FormData) => {
      return 'phase1_loading';
    },
    prevStepId: 'profile_monitoring'
  },
  {
    id: 'phase1_loading',
    component: Phase1LoadingPage,
    title: 'Phase 1 Loading Screen',
    nextStepLogic: (formData: FormData) => {
      // This funnel ends here - Phase1LoadingPage will handle redirect
      return null;
    },
    prevStepId: 'targets'
  }
];

// Helper function to find step by ID
export const findOnboardStepById = (id: string): FormStep | undefined => {
  return onboardConfig.find(step => step.id === id);
};

// Helper function to find step index by ID
export const findOnboardStepIndexById = (id: string): number => {
  return onboardConfig.findIndex(step => step.id === id);
};

// Get the first step
export const getOnboardFirstStep = (): FormStep => {
  return onboardConfig[0];
};