export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DiscountCode {
  code: string;
  percentage: number;
  used: boolean;
  createdAt: Date;
  orderId?: number;
}

export interface Order {
  id: number;
  items: CartItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  createdAt: Date;
}

export interface StoreStats {
  totalItemsPurchased: number;
  totalRevenue: number;
  discountCodes: DiscountCode[];
  totalDiscountsGiven: number;
}

export interface StoreConfig {
  nthOrderForDiscount: number;
  discountPercentage: number;
}
