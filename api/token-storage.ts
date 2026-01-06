import Storage from 'expo-sqlite/kv-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return await Storage.getItem(ACCESS_TOKEN_KEY);
  },

  async setAccessToken(token: string): Promise<void> {
    await Storage.setItem(ACCESS_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return await Storage.getItem(REFRESH_TOKEN_KEY);
  },

  async setRefreshToken(token: string): Promise<void> {
    await Storage.setItem(REFRESH_TOKEN_KEY, token);
  },

  async clearTokens(): Promise<void> {
    await Storage.removeItem(ACCESS_TOKEN_KEY);
    await Storage.removeItem(REFRESH_TOKEN_KEY);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([this.setAccessToken(accessToken), this.setRefreshToken(refreshToken)]);
  },
};
