export interface User {
  id: string;
  username: string;
  role: 'admin' | 'client';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  created_at: string;
}

export interface Typology {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  barcode: string | null;
  brand: string | null;
  brand_id: string | null;
  brandData?: Brand;
  name: string;
  description: string | null;
  category_id: string | null;
  category?: Category;
  typology_id: string | null;
  typology?: Typology;
  supplier_id: string | null;
  supplier?: Contact;
  size: string | null;
  flavor: string | null;
  purchase_price: number;
  sale_price: number;
  stock: number;
  min_stock: number;
  availability: 'store_only' | 'online_only' | 'both';
  online_link: string | null;
  image_url: string | null;
  image_data: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  type: 'cliente' | 'fornitore';
  company_name: string;
  vat: string | null;
  fiscal_code: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  province: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceList {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceListItem {
  id: string;
  price_list_id: string;
  product_id: string;
  custom_price: number;
  created_at: string;
  updated_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  applies_to: 'cart' | 'product';
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
}

export type SaleStatus = 'completed' | 'cancelled';

export type CancellationReason =
  | 'customer_request'
  | 'defective_product'
  | 'cashier_error'
  | 'wrong_product'
  | 'other';

export interface Sale {
  id: string;
  sale_number: number;
  customer_id: string | null;
  customer?: Contact;
  price_list_id: string | null;
  price_list?: PriceList;
  subtotal: number;
  discount_code: string | null;
  discount_amount: number;
  cart_discounts?: AppliedDiscount[];
  total: number;
  status: SaleStatus;
  cancelled_at: string | null;
  cancellation_reason: CancellationReason | null;
  cancellation_notes: string | null;
  refund_issued: boolean;
  refund_number: number | null;
  created_at: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  product_barcode: string | null;
  quantity: number;
  original_price: number | null;
  unit_price: number;
  discounts?: AppliedDiscount[];
  subtotal: number;
  created_at: string;
}

export interface StockLoad {
  id: string;
  load_number: number;
  total_items: number;
  total_pieces: number;
  total_value: number;
  created_at: string;
  items?: StockLoadItem[];
}

export interface StockLoadItem {
  id: string;
  load_id: string;
  product_id: string | null;
  product_name: string;
  product_barcode: string | null;
  quantity: number;
  unit_cost: number;
  created_at: string;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  tagline: string;
  website: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  vat: string | null;
  logo_url: string | null;
  updated_at: string;
}

export interface AppliedDiscount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discounts?: AppliedDiscount[];
}

export interface LoadItem {
  product: Product;
  quantity: number;
}

export type ReturnReason =
  | 'defective_product'
  | 'wrong_product'
  | 'size_change'
  | 'customer_regret'
  | 'other';

export interface Return {
  id: string;
  return_number: number;
  customer_id: string | null;
  customer?: Contact;
  reason: ReturnReason;
  notes: string | null;
  total: number;
  created_at: string;
  items?: ReturnItem[];
}

export interface ReturnItem {
  id: string;
  return_id: string;
  product_id: string | null;
  product_name: string;
  product_barcode: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface ReturnCartItem {
  product: Product;
  quantity: number;
  unit_price: number;
}
