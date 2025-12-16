import { SheetRegister, SheetDefinition } from 'react-native-actions-sheet';
import { SuccessSheet } from './success-sheet';
import { DeleteAccountSheet } from './delete-account-sheet';
import { OngoingJobSheet } from './ongoing-job-sheet';
import { ImagePreviewSheet } from './image-preview-sheet';
import { DeleteImageSheet } from './delete-image-sheet';
import { CounterOfferSheet } from './counter-offer-sheet';
import { AddPromoCodeSheet } from './add-promo-code-sheet';
import { CameraSheet } from './camera-sheet';

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
        onSelect?: (url: string, isVideo?: boolean) => void;
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
      }}
    />
  );
};
