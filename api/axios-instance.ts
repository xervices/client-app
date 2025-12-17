import Axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Base URL - change based on environment
const BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api' // Android emulator
  : 'https://api.yourapp.com';

// Create axios instance
export const AXIOS_INSTANCE = Axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
AXIOS_INSTANCE.interceptors.request.use(
  async (config) => {
    try {
      // get auth token from storage
      //   const token = await AsyncStorage.getItem('authToken');
      //   if (token) {
      //     config.headers.Authorization = `Bearer ${token}`;
      //   }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // remove auth token
      //   await AsyncStorage.removeItem('authToken');
      // Navigate to login screen
      // router.replace('/login');
    }

    // Handle other errors
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Custom instance for Orval
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

// Type exports for Orval
export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
