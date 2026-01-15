import { SheetRegister, SheetDefinition } from 'react-native-actions-sheet';
import { SuccessSheet } from './success-sheet';
import { DeleteAccountSheet } from './delete-account-sheet';
import { OngoingJobSheet } from './ongoing-job-sheet';
import { ImagePreviewSheet } from './image-preview-sheet';
import { DeleteImageSheet } from './delete-image-sheet';
import { CounterOfferSheet } from './counter-offer-sheet';
import { AddPromoCodeSheet } from './add-promo-code-sheet';
import { CameraSheet } from './camera-sheet';
import { LocationSearchSheet } from './location-search-sheet';

interface CameraSheetPayload {
  url: string;
  mimeType: string;
  isVideo?: boolean;
}

export interface LocationSearchSheetPayload {
  address: string;
  latitude: string;
  longitude: string;
  postal_code: string;
}

declare module 'react-native-actions-sheet' {
  interface Sheets {
    'image-preview-sheet': SheetDefinition<{
      payload: {
        imgSource: string;
      };
    }>;
    'add-promo-code-sheet': SheetDefinition<{
      payload: {
        onAdd?: (code: string) => void;
      };
    }>;
    'camera-sheet': SheetDefinition<{
      payload: {
        onSelect?: (media: CameraSheetPayload) => void;
      };
    }>;
    'location-search-sheet': SheetDefinition<{
      payload: {
        onSelect?: (location: LocationSearchSheetPayload) => void;
      };
    }>;
    'delete-account-sheet': SheetDefinition;
    'delete-image-sheet': SheetDefinition<{
      payload: {
        onDelete?: () => void;
      };
    }>;
    'ongoing-job-sheet': SheetDefinition;
    'counter-offer-sheet': SheetDefinition;
    'success-sheet': SheetDefinition<{
      payload: {
        title: string;
        subtitle: string;
        hideBackButton?: boolean;
        useCheckImage?: boolean;
        onRedirect?: () => void;
      };
    }>;
  }
}

export const Sheets = () => {
  return (
    <SheetRegister
      sheets={{
        'success-sheet': SuccessSheet,
        'delete-account-sheet': DeleteAccountSheet,
        'ongoing-job-sheet': OngoingJobSheet,
        'image-preview-sheet': ImagePreviewSheet,
        'delete-image-sheet': DeleteImageSheet,
        'counter-offer-sheet': CounterOfferSheet,
        'add-promo-code-sheet': AddPromoCodeSheet,
        'camera-sheet': CameraSheet,
        'location-search-sheet': LocationSearchSheet,
      }}
    />
  );
};
