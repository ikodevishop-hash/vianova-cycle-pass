/**
 * Network layer for the Vianova Cycle Pass API.
 *
 * Holds the base URL (overridable at runtime via the login "server settings")
 * and the auth token, and exposes a small typed `api()` fetch wrapper. Errors
 * are normalised to `ApiError` carrying the server's error code.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Priority: build-time env (EXPO_PUBLIC_API_URL) → app.json extra.apiUrl → dev default.
// Set EXPO_PUBLIC_API_URL to your deployed HTTPS URL for production builds.
const DEFAULT_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ||
  'http://localhost:4080';

const BASE_KEY = 'vcp_api_base';
const TOKEN_KEY = 'vcp_token';

let baseUrl = DEFAULT_BASE;
let token: string | null = null;

export async function loadConfig() {
  const [b, t] = await Promise.all([AsyncStorage.getItem(BASE_KEY), AsyncStorage.getItem(TOKEN_KEY)]);
  if (b) baseUrl = b;
  token = t;
  return { baseUrl, token };
}

export const getBaseUrl = () => baseUrl;
export async function setBaseUrl(u: string) {
  baseUrl = u.trim().replace(/\/$/, '');
  await AsyncStorage.setItem(BASE_KEY, baseUrl);
}

export const getToken = () => token;
export async function setToken(t: string | null) {
  token = t;
  if (t) await AsyncStorage.setItem(TOKEN_KEY, t);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export async function api<T>(
  path: string,
  opts: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.auth !== false && token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(baseUrl + path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError('NETWORK', 0);
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const code = (data as { error?: string } | null)?.error || `HTTP_${res.status}`;
    throw new ApiError(code, res.status);
  }
  return data as T;
}

/** Map an error to a translation key the screens can show. */
export function errKey(e: unknown): string {
  const code = e instanceof ApiError ? e.code : 'NETWORK';
  switch (code) {
    case 'NETWORK':
      return 'errNetwork';
    case 'BAD_CREDENTIALS':
      return 'loginErr';
    case 'EMAIL_NOT_VERIFIED':
      return 'errEmailNotVerified';
    case 'ID_TAKEN':
      return 'errIdTaken';
    case 'INVALID_EMAIL':
      return 'errEmail';
    case 'WEAK_PASSWORD':
      return 'errPw';
    case 'INVALID_ID':
      return 'errIdAlnum';
    case 'ACTIVE_RENTAL':
      return 'errActiveRental';
    default:
      return 'errGeneric';
  }
}
