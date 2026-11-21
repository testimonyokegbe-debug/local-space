export type ProductVariant = {
  id: string;
  name: string;
  price: string; // optional: empty means "use the product's price"
  quantity: string;
  image: string | null;
};

export type Product = {
  id: string;
  name: string;
  price: string;
  quantity: string;
  image: string | null;
  details?: string;
  description?: string;
  variants?: ProductVariant[];
};

export type ServiceVariant = {
  id: string;
  name: string;
  price: string; // optional: empty means "use the service's price"
  priceTo: string; // optional: for ranges like 6,000 - 9,000
  description: string; // optional
  image: string | null; // optional
};

export type Service = {
  id: string;
  name: string;
  price: string; // can be empty when every sub service has its own price
  availability: string;
  days: string[];
  timeFrom: string;
  timeTo: string;
  phone: string;
  location: string;
  social: string;
  image: string | null;
  variants: ServiceVariant[];
};

export type ServiceForm = Omit<Service, "id">;

export type Business = {
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  location: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export const categories = [
  "Cleaning",
  "Plumbing",
  "Electrical",
  "Beauty",
  "Fashion",
  "Food",
  "Repairs",
  "Other",
];

export const emptyService: ServiceForm = {
  name: "",
  price: "",
  availability: "",
  days: [],
  timeFrom: "09:00",
  timeTo: "17:00",
  phone: "",
  location: "",
  social: "",
  image: null,
  variants: [],
};

export const emptyBusiness: Business = {
  name: "",
  description: "",
  category: "",
  phone: "",
  email: "",
  address: "",
  location: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
};