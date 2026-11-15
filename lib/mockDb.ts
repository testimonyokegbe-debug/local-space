export type DbProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
};

export type DbService = {
  id: string;
  name: string;
  description: string;
  price: number;
  availability: string;
  phone: string;
  location: string;
  social: string;
  image: string | null;
};

// Kept on globalThis so the data survives Next.js hot reloads in dev
const g = globalThis as unknown as {
  __products?: DbProduct[];
  __services?: DbService[];
};

export const products: DbProduct[] = (g.__products ??= []);
export const services: DbService[] = (g.__services ??= []);