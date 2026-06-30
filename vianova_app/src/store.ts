/**
 * Vianova Cycle Pass — client data store.
 *
 * Backed by the API server. Data is fetched into an in-memory cache so screens
 * keep reading synchronously via selectors (`getBikes()`, `myRentals()`, …) and
 * re-render through `useDB()`. Mutators call the API and refresh the cache.
 */
import { useEffect, useState } from 'react';
import { api, getToken, loadConfig, setToken } from './api';
import { Bike, NewsItem, Rental, RentalDraft, User } from './types';
import { currentLang, Lang } from './i18n';

type Terms = Record<Lang, string>;
interface Cache {
  user: User | null;
  bikes: Bike[];
  rentals: Rental[];
  news: NewsItem[];
  terms: Terms;
}

let cache: Cache = {
  user: null,
  bikes: [],
  rentals: [],
  news: [],
  terms: { ja: '', en: '', zh: '', ko: '' },
};
let draft: RentalDraft | null = null;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/* ---------- loaders ---------- */
async function loadBikes() {
  cache.bikes = (await api<{ bikes: Bike[] }>('/api/bikes', { auth: false })).bikes;
}
async function loadTerms() {
  cache.terms = { ...cache.terms, ...(await api<{ terms: Terms }>('/api/terms', { auth: false })).terms };
}
async function loadRentals() {
  cache.rentals = (await api<{ rentals: Rental[] }>('/api/rentals')).rentals;
}
async function loadNews() {
  cache.news = (await api<{ news: NewsItem[] }>('/api/news')).news;
}
async function refreshMe() {
  cache.user = (await api<{ user: User }>('/api/me')).user;
}

/** Boot: load config + public data, and member data if a token is stored. */
export async function hydrate(): Promise<void> {
  await loadConfig();
  await Promise.allSettled([loadBikes(), loadTerms()]);
  if (getToken()) {
    try {
      await refreshMe();
      await Promise.allSettled([loadRentals(), loadNews()]);
    } catch {
      await setToken(null);
      cache.user = null;
    }
  }
  emit();
}

/** Re-fetch everything currently relevant (e.g. after returning to home). */
export async function reload(): Promise<void> {
  await Promise.allSettled([loadBikes(), loadTerms()]);
  if (cache.user) await Promise.allSettled([loadRentals(), loadNews()]);
  emit();
}

/* ---------- selectors ---------- */
export const getBikes = () => cache.bikes;
export const getNews = () => cache.news;
export const getTerms = () => cache.terms[currentLang()] || cache.terms.ja || '';
export const getSession = () => cache.user?.memberId ?? null;
export const currentUser = () => cache.user;
export const myRentals = () => cache.rentals;
export const myNews = () => cache.news;
export const findBike = (id: string): Bike | null => cache.bikes.find((b) => b.id === id) ?? null;
export const findRental = (id: string): Rental | null =>
  cache.rentals.find((r) => r.rentalId === id) ?? null;

/* ---------- auth / mutators ---------- */
export function register(memberId: string, email: string, password: string) {
  return api<{ ok: true; devConfirmUrl?: string }>('/api/register', {
    method: 'POST',
    auth: false,
    body: { memberId, email, password },
  });
}

export function resendVerification(idOrEmail: string) {
  return api<{ ok: true; devConfirmUrl?: string; alreadyVerified?: boolean }>('/api/resend', {
    method: 'POST',
    auth: false,
    body: { memberId: idOrEmail, email: idOrEmail },
  });
}

export async function login(memberId: string, password: string): Promise<void> {
  const r = await api<{ token: string; user: User }>('/api/login', {
    method: 'POST',
    auth: false,
    body: { memberId, password },
  });
  await setToken(r.token);
  cache.user = r.user;
  await Promise.allSettled([loadBikes(), loadRentals(), loadNews(), loadTerms()]);
  emit();
}

export async function logout(): Promise<void> {
  await setToken(null);
  cache.user = null;
  cache.rentals = [];
  cache.news = [];
  emit();
}

export async function createRental(d: RentalDraft): Promise<Rental> {
  const r = await api<{ rental: Rental }>('/api/rentals', {
    method: 'POST',
    body: { bikeId: d.bikeId, name: d.name, birth: d.birth, addr: d.addr, tel: d.tel, idPhoto: d.idPhoto },
  });
  await Promise.allSettled([loadBikes(), loadRentals()]);
  emit();
  return r.rental;
}

/* ---------- rental application draft (transient) ---------- */
export const setDraft = (d: RentalDraft | null) => {
  draft = d;
};
export const getDraft = () => draft;

/* ---------- React binding ---------- */
/** Re-renders the calling component whenever the cache changes. */
export function useDB(): Cache {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((v) => v + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return cache;
}
