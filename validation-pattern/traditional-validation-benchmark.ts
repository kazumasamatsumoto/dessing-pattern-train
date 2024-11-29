// traditional-validation-benchmark.ts
import { User, Benchmark } from "../common/common";

// 商品データの型定義
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// 注文データの型定義
interface Order {
  id: string;
  userId: number;
  products: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
}

// ユーザーデータの型定義
interface UserData {
  id: number;
  name: string;
  email: string;
  password: string;
  age: number;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    newsletter: boolean;
    marketing: boolean;
  };
}

// 従来の方式でのバリデーション実装
class TraditionalValidator {
  validateProduct(product: Product): boolean {
    // 基本的な存在チェック
    if (
      !product.id ||
      !product.name ||
      product.price === undefined ||
      !product.category
    ) {
      return false;
    }

    // 文字列の長さチェック
    if (product.name.length < 3 || product.name.length > 100) {
      return false;
    }

    if (product.description && product.description.length > 1000) {
      return false;
    }

    // 数値の範囲チェック
    if (product.price < 0 || product.price > 1000000) {
      return false;
    }

    if (product.stock < 0 || product.stock > 10000) {
      return false;
    }

    // 配列のチェック
    if (!Array.isArray(product.tags) || product.tags.length > 10) {
      return false;
    }

    // 日付のチェック
    if (
      !(product.createdAt instanceof Date) ||
      !(product.updatedAt instanceof Date)
    ) {
      return false;
    }

    return true;
  }

  validateOrder(order: Order): boolean {
    // 基本的な存在チェック
    if (!order.id || !order.userId || !Array.isArray(order.products)) {
      return false;
    }

    // 商品配列のチェック
    if (order.products.length === 0 || order.products.length > 100) {
      return false;
    }

    // 商品の詳細チェック
    for (const product of order.products) {
      if (product.quantity <= 0 || product.price < 0) {
        return false;
      }
    }

    // 合計金額のチェック
    if (order.totalAmount <= 0) {
      return false;
    }

    // 配送先住所のチェック
    if (!this.validateAddress(order.shippingAddress)) {
      return false;
    }

    // 支払い方法のチェック
    const validPaymentMethods = [
      "credit_card",
      "debit_card",
      "bank_transfer",
      "paypal",
    ];
    if (!validPaymentMethods.includes(order.paymentMethod)) {
      return false;
    }

    // 注文ステータスのチェック
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(order.status)) {
      return false;
    }

    return true;
  }

  validateUser(user: UserData): boolean {
    // 基本的な存在チェック
    if (!user.id || !user.name || !user.email || !user.password) {
      return false;
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return false;
    }

    // パスワードの要件チェック
    if (
      user.password.length < 8 ||
      !/[A-Z]/.test(user.password) ||
      !/[0-9]/.test(user.password)
    ) {
      return false;
    }

    // 年齢チェック
    if (user.age < 18 || user.age > 120) {
      return false;
    }

    // 電話番号チェック
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(user.phoneNumber)) {
      return false;
    }

    // 住所のチェック
    if (!this.validateAddress(user.address)) {
      return false;
    }

    return true;
  }

  private validateAddress(address: any): boolean {
    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode ||
      !address.country
    ) {
      return false;
    }

    if (
      address.street.length < 5 ||
      address.city.length < 2 ||
      address.state.length < 2 ||
      address.zipCode.length < 5
    ) {
      return false;
    }

    return true;
  }
}

// テストデータ生成関数
function generateTestData(): {
  products: Product[];
  orders: Order[];
  users: UserData[];
} {
  const products: Product[] = [];
  const orders: Order[] = [];
  const users: UserData[] = [];

  // 有効なデータ生成
  for (let i = 0; i < 5; i++) {
    products.push({
      id: `prod-${i}`,
      name: `Test Product ${i}`,
      price: 100 + i,
      description: `Description for product ${i}`,
      category: "test",
      stock: 10,
      tags: ["test", "sample"],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    });

    orders.push({
      id: `order-${i}`,
      userId: 1,
      products: [
        {
          productId: `prod-${i}`,
          quantity: 1,
          price: 100,
        },
      ],
      totalAmount: 100,
      shippingAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
        country: "Test Country",
      },
      paymentMethod: "credit_card",
      status: "pending",
      createdAt: new Date(),
    });

    users.push({
      id: i,
      name: `Test User ${i}`,
      email: `test${i}@example.com`,
      password: "TestPass123",
      age: 25,
      phoneNumber: "+1234567890",
      address: {
        street: "123 Test St",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
        country: "Test Country",
      },
      preferences: {
        newsletter: true,
        marketing: false,
      },
    });
  }

  return { products, orders, users };
}

async function runTraditionalValidationBenchmark() {
  console.log("Running Traditional Validation Benchmark...");

  const validator = new TraditionalValidator();
  const { products, orders, users } = generateTestData();
  const iterations = 10000;

  // 商品バリデーションのベンチマーク
  await Benchmark.measurePerformance("Product Validation", iterations, () => {
    products.forEach((product) => {
      validator.validateProduct(product);
    });
  });

  // 注文バリデーションのベンチマーク
  await Benchmark.measurePerformance("Order Validation", iterations, () => {
    orders.forEach((order) => {
      validator.validateOrder(order);
    });
  });

  // ユーザーバリデーションのベンチマーク
  await Benchmark.measurePerformance("User Validation", iterations, () => {
    users.forEach((user) => {
      validator.validateUser(user);
    });
  });

  // 複合バリデーションのベンチマーク
  await Benchmark.measurePerformance("Combined Validation", iterations, () => {
    products.forEach((product) => validator.validateProduct(product));
    orders.forEach((order) => validator.validateOrder(order));
    users.forEach((user) => validator.validateUser(user));
  });
}

// ベンチマークの実行
runTraditionalValidationBenchmark().catch(console.error);
