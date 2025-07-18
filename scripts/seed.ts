
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@seller.com' },
    update: {},
    create: {
      email: 'admin@seller.com',
      password: hashedPassword,
      name: 'Lemz Attire Stories',
      role: 'admin',
    },
  });

  // Create sample products
  const products = [
    {
      productCode: 'SAR001',
      name: 'Silk Saree - Red',
      type: 'saree',
      images: JSON.stringify(['https://i.pinimg.com/originals/b9/04/19/b904195c7e988c60d0ba784a2b4fe752.jpg', 'https://i.pinimg.com/originals/2f/e8/41/2fe841d3c885833e07b67ecdccb2b325.jpg']),
      stockQuantity: 15,
      price: 2500.00,
      description: 'Beautiful red silk saree with golden border'
    },
    {
      productCode: 'CHU001',
      name: 'Cotton Churidhar - Blue',
      type: 'churidhar',
      images: JSON.stringify(['https://www.biba.in/on/demandware.static/-/Sites-biba-product-catalog/default/dwdcb0823f/images/aw22/kw4791aw22blue_7.jpg', 'https://i.pinimg.com/originals/15/96/2d/15962d23e78c3f73f93f68957ece8556.jpg']),
      stockQuantity: 8,
      price: 1200.00,
      description: 'Comfortable blue cotton churidhar set'
    },
    {
      productCode: 'JEW001',
      name: 'Gold Necklace Set',
      type: 'jewellery',
      images: JSON.stringify(['https://i.pinimg.com/originals/6c/92/14/6c92143aff92a08d0d786b2e63efcec9.jpg', 'https://i.pinimg.com/originals/4b/04/07/4b0407f7ec3814780efd2b204e5651c2.jpg']),
      stockQuantity: 3,
      price: 15000.00,
      description: 'Traditional gold necklace with matching earrings'
    },
    {
      productCode: 'SAR002',
      name: 'Cotton Saree - Green',
      type: 'saree',
      images: JSON.stringify(['https://i.pinimg.com/originals/02/0b/75/020b753596cb652a42f5b82082e68112.jpg']),
      stockQuantity: 0,
      price: 800.00,
      description: 'Green cotton saree with floral print - Out of stock'
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { productCode: product.productCode },
      update: {},
      create: product,
    });
  }

  // Create sample orders
  const createdProducts = await prisma.product.findMany();
  
  const orders = [
    {
      orderNumber: 'ORD001',
      productName: 'Silk Saree - Red',
      customerName: 'Priya Sharma',
      status: 'Payment Received',
      totalAmount: 2500.00,
      productId: createdProducts[0].id,
      orderDate: new Date('2024-01-15'),
    },
    {
      orderNumber: 'ORD002',
      productName: 'Cotton Churidhar - Blue',
      customerName: 'Anita Patel',
      status: 'Packing Under Progress',
      totalAmount: 1200.00,
      productId: createdProducts[1].id,
      orderDate: new Date('2024-01-16'),
    },
    {
      orderNumber: 'ORD003',
      productName: 'Gold Necklace Set',
      customerName: 'Kavya Reddy',
      status: 'Shipped',
      totalAmount: 15000.00,
      productId: createdProducts[2].id,
      orderDate: new Date('2024-01-14'),
    },
    {
      orderNumber: 'ORD004',
      productName: 'Silk Saree - Red',
      customerName: 'Meera Gupta',
      status: 'Delivered',
      totalAmount: 2500.00,
      productId: createdProducts[0].id,
      orderDate: new Date('2024-01-12'),
    }
  ];

  for (const order of orders) {
    await prisma.order.upsert({
      where: { orderNumber: order.orderNumber },
      update: {},
      create: order,
    });
  }

  // Create sample coupons
  const coupons = [
    {
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

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }

  // Create sample coupon usage
  const couponUsages = [
    {
      couponCode: 'WELCOME10',
      customerName: 'Priya Sharma',
      orderAmount: 2500.00,
      usedAt: new Date('2024-01-15'),
    },
    {
      couponCode: 'FLAT200',
      customerName: 'Anita Patel',
      orderAmount: 1200.00,
      usedAt: new Date('2024-01-16'),
    },
    {
      couponCode: 'WELCOME10',
      customerName: 'Kavya Reddy',
      orderAmount: 15000.00,
      usedAt: new Date('2024-01-14'),
    }
  ];

  for (const usage of couponUsages) {
    await prisma.couponUsage.create({
      data: usage,
    });
  }

  console.log('Database has been seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
