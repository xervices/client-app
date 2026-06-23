import { create } from 'zustand';

interface Step1 {
  categoryId: string;
  requiresDestination?: boolean;
}

interface Step2 {
  title: string;
  description: string;
  media: { url: string; mimeType: string; isVideo?: boolean }[];
}

interface Step3 {
  serviceAddress: string;
  destinationAddress?: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  latitude: number;
  longitude: number;
  contactPhone: string;
}

interface ServiceFormState extends Step1, Step2, Step3 {
  setStep1: (data: Step1) => void;
  setStep2: (data: Step2) => void;
  setStep3: (data: Step3) => void;
  resetForm: () => void;
  getFormData: () => Step1 & Step2 & Step3;
}

const initialState: Step1 & Step2 & Step3 = {
  categoryId: '',
  requiresDestination: false,
  description: '',
  title: '',
  media: [],
  serviceAddress: '',
  latitude: 0,
  longitude: 0,
  contactPhone: '',
};

export const useServiceStore = create<ServiceFormState>((set, get) => ({
  ...initialState,
  setStep1: (data) => set(data),
  setStep2: (data) => set(data),
  setStep3: (data) => set(data),
  resetForm: () => set(initialState),
  getFormData: () => {
    const state = get();
    return {
      categoryId: state.categoryId,
      requiresDestination: state.requiresDestination,
      description: state.description,
      media: state.media,
      title: state.title,
      serviceAddress: state.serviceAddress,
      latitude: state.latitude,
      longitude: state.longitude,
      destinationAddress: state.destinationAddress,
      destinationLatitude: state.destinationLatitude,
      destinationLongitude: state.destinationLongitude,
      contactPhone: state.contactPhone,
    };
  },
}));
