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

export type Service = {
  id: string;
  name: string;
  description: string;
  price: string;
  availability: string;
  phone: string;
  location: string;
  social: string;
  image: string | null;
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
  description: "",
  price: "",
  availability: "",
  phone: "",
  location: "",
  social: "",
  image: null,
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