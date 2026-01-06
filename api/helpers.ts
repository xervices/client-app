import { toast } from 'sonner-native';
import { paths } from './schema';

export type RequestBody<T extends keyof paths, M extends keyof paths[T]> = paths[T][M] extends {
  requestBody?: { content: { 'application/json': infer B } };
}
  ? B
  : never;

export type ResponseData<T extends keyof paths, M extends keyof paths[T]> = paths[T][M] extends {
  responses: { 200: { content: { 'application/json': infer R } } };
}
  ? R
  : never;

export const showErrorMessage = (message: string) => {
  return toast.error(message);
};

export const showSuccessMessage = (message: string) => {
  return toast.success(message);
};

export function getErrorMessage(
  error: { message?: string | string[] },
  fallback = 'An error occurred'
): string {
  if (!error.message) return fallback;

  if (Array.isArray(error.message)) {
    return error.message.join(', ');
  }

  return error.message;
}
