export type ProductSearchResult = {
  id: string;
  name: string;
  brand: string | null;
  product_type: string | null;
  price: number | null;
  image_url: string | null;
};

export type ProductVariant = {
  id: string;
  size: string | null;
  shipping_mode: string | null;
  sale_price: number | null;
  compare_at_price: number | null;
};

export type ProductImage = {
  url: string;
  name: string | null;
  alt: string | null;
  sort_order: number | null;
};

export type Product = {
  id: string;
  name: string;
  brand: string | null;
  product_type: string | null;
  product_category: string | null;
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  currency: string;
  description: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
};
