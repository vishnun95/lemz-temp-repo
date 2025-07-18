
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  productName: string;
  customerName: string;
  status: string;
  orderDate: Date;
  totalAmount: number;
  productId: string;
  product?: Product;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  type: string;
  images: string;
  stockQuantity: number;
  price: number;
  description?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  startDate: Date;
  expiryDate: Date;
  minOrderValue?: number;
  maxUsageCount: number;
  currentUsage: number;
  isActive: boolean;
}

export interface CouponUsage {
  id: string;
  couponCode: string;
  customerName: string;
  orderAmount: number;
  usedAt: Date;
}

export type OrderStatus = 
  | "Payment Received"
  | "Packing Under Progress"
  | "Packing Completed"
  | "Shipped"
  | "Delivered";

export type ProductType = "saree" | "churidhar" | "jewellery";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  token: string;
}
