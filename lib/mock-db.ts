
import { Order, Product, Coupon, CouponUsage } from './types';

// Mock data storage
let orders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD001',
    productName: 'Silk Saree - Red',
    customerName: 'Priya Sharma',
    status: 'Payment Received',
    orderDate: new Date('2024-01-15'),
    totalAmount: 2500.00,
    productId: '1',
  },
  {
    id: '2',
    orderNumber: 'ORD002',
    productName: 'Cotton Churidhar - Blue',
    customerName: 'Anita Patel',
    status: 'Packing Under Progress',
    orderDate: new Date('2024-01-16'),
    totalAmount: 1200.00,
    productId: '2',
  },
  {
    id: '3',
    orderNumber: 'ORD003',
    productName: 'Gold Necklace Set',
    customerName: 'Kavya Reddy',
    status: 'Shipped',
    orderDate: new Date('2024-01-14'),
    totalAmount: 15000.00,
    productId: '3',
  },
  {
    id: '4',
    orderNumber: 'ORD004',
    productName: 'Silk Saree - Red',
    customerName: 'Meera Gupta',
    status: 'Delivered',
    orderDate: new Date('2024-01-12'),
    totalAmount: 2500.00,
    productId: '1',
  },
  {
    id: '5',
    orderNumber: 'ORD005',
    productName: 'Designer Lehenga',
    customerName: 'Sunita Joshi',
    status: 'Packing Completed',
    orderDate: new Date('2024-01-17'),
    totalAmount: 5000.00,
    productId: '5',
  }
];

let products: Product[] = [
  {
    id: '1',
    productCode: 'SAR001',
    name: 'Silk Saree - Red',
    type: 'saree',
    images: JSON.stringify(['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop', 'https://i.pinimg.com/originals/f9/52/18/f9521866b6a5b075311369eda6068f60.jpg']),
    stockQuantity: 15,
    price: 2500.00,
    description: 'Beautiful red silk saree with golden border'
  },
  {
    id: '2',
    productCode: 'CHU001',
    name: 'Cotton Churidhar - Blue',
    type: 'churidhar',
    images: JSON.stringify(['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop', 'https://i.pinimg.com/originals/fa/08/a6/fa08a6fc5fb9338beedd56089970cfdc.jpg']),
    stockQuantity: 8,
    price: 1200.00,
    description: 'Comfortable blue cotton churidhar set'
  },
  {
    id: '3',
    productCode: 'JEW001',
    name: 'Gold Necklace Set',
    type: 'jewellery',
    images: JSON.stringify(['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop']),
    stockQuantity: 3,
    price: 15000.00,
    description: 'Traditional gold necklace with matching earrings'
  },
  {
    id: '4',
    productCode: 'SAR002',
    name: 'Cotton Saree - Green',
    type: 'saree',
    images: JSON.stringify(['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop']),
    stockQuantity: 0,
    price: 800.00,
    description: 'Green cotton saree with floral print - Out of stock'
  },
  {
    id: '5',
    productCode: 'LEH001',
    name: 'Designer Lehenga',
    type: 'saree',
    images: JSON.stringify(['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop']),
    stockQuantity: 5,
    price: 5000.00,
    description: 'Elegant designer lehenga for special occasions'
  }
];

let coupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10.0,
    startDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    minOrderValue: 500.0,
    maxUsageCount: 100,
    currentUsage: 25,
    isActive: true,
  },
  {
    id: '2',
    code: 'FLAT200',
    discountType: 'flat',
    discountValue: 200.0,
    startDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-06-30'),
    minOrderValue: 1000.0,
    maxUsageCount: 50,
    currentUsage: 10,
    isActive: true,
  },
  {
    id: '3',
    code: 'EXPIRED15',
    discountType: 'percentage',
    discountValue: 15.0,
    startDate: new Date('2023-12-01'),
    expiryDate: new Date('2023-12-31'),
    minOrderValue: 800.0,
    maxUsageCount: 30,
    currentUsage: 30,
    isActive: false,
  }
];

let couponUsages: CouponUsage[] = [
  {
    id: '1',
    couponCode: 'WELCOME10',
    customerName: 'Priya Sharma',
    orderAmount: 2500.00,
    usedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    couponCode: 'FLAT200',
    customerName: 'Anita Patel',
    orderAmount: 1200.00,
    usedAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    couponCode: 'WELCOME10',
    customerName: 'Kavya Reddy',
    orderAmount: 15000.00,
    usedAt: new Date('2024-01-14'),
  }
];

// Mock database service
export class MockDatabase {
  // Order operations
  static async getOrders(): Promise<Order[]> {
    return Promise.resolve([...orders]);
  }

  static async getOrderById(id: string): Promise<Order | null> {
    return Promise.resolve(orders.find(order => order.id === id) || null);
  }

  static async updateOrderStatus(id: string, status: string): Promise<Order | null> {
    const orderIndex = orders.findIndex(order => order.id === id);
    if (orderIndex === -1) return null;
    
    orders[orderIndex] = { ...orders[orderIndex], status };
    return Promise.resolve(orders[orderIndex]);
  }

  // Product operations
  static async getProducts(): Promise<Product[]> {
    return Promise.resolve([...products]);
  }

  static async getProductById(id: string): Promise<Product | null> {
    return Promise.resolve(products.find(product => product.id === id) || null);
  }

  static async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const newProduct: Product = {
      id: (products.length + 1).toString(),
      ...productData,
    };
    products.push(newProduct);
    return Promise.resolve(newProduct);
  }

  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    const productIndex = products.findIndex(product => product.id === id);
    if (productIndex === -1) return null;
    
    products[productIndex] = { ...products[productIndex], ...productData };
    return Promise.resolve(products[productIndex]);
  }

  static async deleteProduct(id: string): Promise<boolean> {
    const productIndex = products.findIndex(product => product.id === id);
    if (productIndex === -1) return false;
    
    products.splice(productIndex, 1);
    return Promise.resolve(true);
  }

  // Coupon operations
  static async getCoupons(): Promise<Coupon[]> {
    return Promise.resolve([...coupons]);
  }

  static async getCouponById(id: string): Promise<Coupon | null> {
    return Promise.resolve(coupons.find(coupon => coupon.id === id) || null);
  }

  static async createCoupon(couponData: Omit<Coupon, 'id'>): Promise<Coupon> {
    const newCoupon: Coupon = {
      id: (coupons.length + 1).toString(),
      ...couponData,
    };
    coupons.push(newCoupon);
    return Promise.resolve(newCoupon);
  }

  static async updateCoupon(id: string, couponData: Partial<Coupon>): Promise<Coupon | null> {
    const couponIndex = coupons.findIndex(coupon => coupon.id === id);
    if (couponIndex === -1) return null;
    
    coupons[couponIndex] = { ...coupons[couponIndex], ...couponData };
    return Promise.resolve(coupons[couponIndex]);
  }

  static async deleteCoupon(id: string): Promise<boolean> {
    const couponIndex = coupons.findIndex(coupon => coupon.id === id);
    if (couponIndex === -1) return false;
    
    coupons.splice(couponIndex, 1);
    return Promise.resolve(true);
  }

  // Coupon usage operations
  static async getCouponUsages(): Promise<CouponUsage[]> {
    return Promise.resolve([...couponUsages]);
  }

  static async createCouponUsage(usageData: Omit<CouponUsage, 'id'>): Promise<CouponUsage> {
    const newUsage: CouponUsage = {
      id: (couponUsages.length + 1).toString(),
      ...usageData,
    };
    couponUsages.push(newUsage);
    return Promise.resolve(newUsage);
  }
}
