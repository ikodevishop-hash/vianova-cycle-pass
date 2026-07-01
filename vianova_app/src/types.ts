/**
 * Vianova Cycle Pass — domain data models.
 *
 * These types are the single source of truth for the shape of everything the
 * app stores. The legacy localStorage prototype kept the same fields as loose
 * objects; here they are formalised so screens and the store are type-checked
 * end to end.
 */

/** A rentable bike registered by the operator (1 record = 1 physical unit). */
export interface Bike {
  id: string;
  name: string;
  /** Emoji shown when no photo is registered. */
  emoji: string;
  /** Short one-line spec (gears / wheel size / frame …). */
  specShort: string;
  /** Long-form description. */
  specLong: string;
  /** Monthly fee in JPY. */
  priceMonthly: number;
  /** Frame / body number. */
  frameNo: string;
  /** Insurance expiry (YYYY-MM-DD). */
  insurance: string;
  /** Body color. */
  color: string;
  /** Anti-theft registration number (防犯登録番号). */
  securityNo: string;
  /** Whether this unit is currently rented out. */
  rented: boolean;
  /** Free-form operator note. */
  note: string;
  /** Data-URI / remote photo URLs (max 4). */
  photos: string[];
}

/** A registered member account. */
export interface User {
  memberId: string;
  email: string;
  /** Plain in the prototype; hash server-side when a backend is added. */
  password: string;
  /** ISO timestamp. */
  createdAt: string;
}

/** A rental reception store, managed in the admin. */
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  /** Regular holiday; empty string = none (定休日なし). */
  holiday: string;
}

/** An active rental contract created at checkout. */
export interface Rental {
  rentalId: string;
  memberId: string;
  bikeId: string;
  bikeName: string;
  specShort: string;
  priceMonthly: number;
  customerName: string;
  birthdate: string;
  address: string;
  phone: string;
  /** Data-URI of the photographed ID document. */
  idPhoto: string;
  /** ISO timestamp of when the rental started. */
  startedAt: string;
  /** Snapshot of the rented bike's color and anti-theft registration number. */
  bikeColor: string;
  bikeSecurityNo: string;
  /** Snapshot of the reception store chosen at checkout. */
  storeId: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeHours: string;
  storeHoliday: string;
}

/** An announcement; `target` empty = broadcast, otherwise a memberId. */
export interface NewsItem {
  id: string;
  /** YYYY-MM-DD. */
  date: string;
  title: string;
  body: string;
  target: string;
}

/** In-flight rental application carried from the form to the payment screen. */
export interface RentalDraft {
  bikeId: string;
  /** Chosen reception store id. */
  storeId: string;
  name: string;
  birth: string;
  addr: string;
  tel: string;
  idPhoto: string;
}

/** The full persisted database shape. */
export interface VianovaDB {
  users: User[];
  bikes: Bike[];
  rentals: Rental[];
  news: NewsItem[];
  terms: string;
  /** memberId of the signed-in user, or null. */
  session: string | null;
}
