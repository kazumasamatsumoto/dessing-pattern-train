// validation-benchmark.ts
import { User, Benchmark } from "../common/common";

// ドメインモデル
interface ProductData {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
  tags: string[];
  imageUrls: string[];
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

// バリデーションの結果
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// バリデーションパターンを使用した実装
interface Validator<T> {
  validate(data: T): ValidationResult;
}

// 製品名のバリデーター
class ProductNameValidator implements Validator<ProductData> {
  validate(data: ProductData): ValidationResult {
    const errors: string[] = [];

    if (!data.name) {
      errors.push("Product name is required");
    } else if (data.name.length < 3) {
      errors.push("Product name must be at least 3 characters long");
    } else if (data.name.length > 100) {
      errors.push("Product name must not exceed 100 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// 価格のバリデーター
class PriceValidator implements Validator<ProductData> {
  validate(data: ProductData): ValidationResult {
    const errors: string[] = [];

    if (data.price === undefined || data.price === null) {
      errors.push("Price is required");
    } else if (data.price < 0) {
      errors.push("Price must be non-negative");
    } else if (data.price > 1000000) {
      errors.push("Price must not exceed 1,000,000");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// 在庫のバリデーター
class StockValidator implements Validator<ProductData> {
  validate(data: ProductData): ValidationResult {
    const errors: string[] = [];

    if (data.stock === undefined || data.stock === null) {
      errors.push("Stock quantity is required");
    } else if (!Number.isInteger(data.stock)) {
      errors.push("Stock quantity must be an integer");
    } else if (data.stock < 0) {
      errors.push("Stock quantity must be non-negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// 複合バリデーター
class CompositeValidator implements Validator<ProductData> {
  private validators: Validator<ProductData>[];

  constructor(validators: Validator<ProductData>[]) {
    this.validators = validators;
  }

  validate(data: ProductData): ValidationResult {
    const errors: string[] = [];

    for (const validator of this.validators) {
      const result = validator.validate(data);
      errors.push(...result.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// 従来の方式（単一の関数でのバリデーション）
class TraditionalProductValidator {
  validate(data: ProductData): ValidationResult {
    const errors: string[] = [];

    // 名前のバリデーション
    if (!data.name) {
      errors.push("Product name is required");
    } else if (data.name.length < 3) {
      errors.push("Product name must be at least 3 characters long");
    } else if (data.name.length > 100) {
      errors.push("Product name must not exceed 100 characters");
    }

    // 価格のバリデーション
    if (data.price === undefined || data.price === null) {
      errors.push("Price is required");
    } else if (data.price < 0) {
      errors.push("Price must be non-negative");
    } else if (data.price > 1000000) {
      errors.push("Price must not exceed 1,000,000");
    }

    // 在庫のバリデーション
    if (data.stock === undefined || data.stock === null) {
      errors.push("Stock quantity is required");
    } else if (!Number.isInteger(data.stock)) {
      errors.push("Stock quantity must be an integer");
    } else if (data.stock < 0) {
      errors.push("Stock quantity must be non-negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// テストデータ生成
function generateProductData(
  type:
    | "valid"
    | "invalid-name"
    | "invalid-price"
    | "invalid-stock"
    | "all-invalid"
): ProductData {
  const baseProduct: ProductData = {
    id: "prod-" + Math.random().toString(36).substr(2, 9),
    name: "Test Product",
    price: 99.99,
    description: "A test product description",
    stock: 100,
    category: "Test Category",
    tags: ["test", "sample"],
    imageUrls: ["http://example.com/image.jpg"],
    weight: 1.5,
    dimensions: {
      length: 10,
      width: 10,
      height: 10,
    },
  };

  switch (type) {
    case "invalid-name":
      baseProduct.name = "A"; // Too short
      break;
    case "invalid-price":
      baseProduct.price = -10; // Negative price
      break;
    case "invalid-stock":
      baseProduct.stock = -5; // Negative stock
      break;
    case "all-invalid":
      baseProduct.name = "A";
      baseProduct.price = -10;
      baseProduct.stock = -5;
      break;
  }

  return baseProduct;
}

async function runValidationBenchmark() {
  console.log("Running Validation Pattern Benchmark...");

  // バリデーションパターンのセットアップ
  const compositeValidator = new CompositeValidator([
    new ProductNameValidator(),
    new PriceValidator(),
    new StockValidator(),
  ]);

  // 従来の方式のセットアップ
  const traditionalValidator = new TraditionalProductValidator();

  const iterations = 10000;

  // 正常系のベンチマーク
  await Benchmark.measurePerformance(
    "Validation Pattern - Valid Product",
    iterations,
    () => {
      compositeValidator.validate(generateProductData("valid"));
    }
  );

  await Benchmark.measurePerformance(
    "Traditional Approach - Valid Product",
    iterations,
    () => {
      traditionalValidator.validate(generateProductData("valid"));
    }
  );

  // 名前エラーのベンチマーク
  await Benchmark.measurePerformance(
    "Validation Pattern - Invalid Name",
    iterations,
    () => {
      compositeValidator.validate(generateProductData("invalid-name"));
    }
  );

  await Benchmark.measurePerformance(
    "Traditional Approach - Invalid Name",
    iterations,
    () => {
      traditionalValidator.validate(generateProductData("invalid-name"));
    }
  );

  // 価格エラーのベンチマーク
  await Benchmark.measurePerformance(
    "Validation Pattern - Invalid Price",
    iterations,
    () => {
      compositeValidator.validate(generateProductData("invalid-price"));
    }
  );

  await Benchmark.measurePerformance(
    "Traditional Approach - Invalid Price",
    iterations,
    () => {
      traditionalValidator.validate(generateProductData("invalid-price"));
    }
  );

  // 全項目エラーのベンチマーク
  await Benchmark.measurePerformance(
    "Validation Pattern - All Invalid",
    iterations,
    () => {
      compositeValidator.validate(generateProductData("all-invalid"));
    }
  );

  await Benchmark.measurePerformance(
    "Traditional Approach - All Invalid",
    iterations,
    () => {
      traditionalValidator.validate(generateProductData("all-invalid"));
    }
  );

  // 複合ベンチマーク（ランダムなデータ）
  await Benchmark.measurePerformance(
    "Validation Pattern - Mixed Cases",
    iterations,
    () => {
      const types: Array<
        | "valid"
        | "invalid-name"
        | "invalid-price"
        | "invalid-stock"
        | "all-invalid"
      > = [
        "valid",
        "invalid-name",
        "invalid-price",
        "invalid-stock",
        "all-invalid",
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      compositeValidator.validate(generateProductData(randomType));
    }
  );

  await Benchmark.measurePerformance(
    "Traditional Approach - Mixed Cases",
    iterations,
    () => {
      const types: Array<
        | "valid"
        | "invalid-name"
        | "invalid-price"
        | "invalid-stock"
        | "all-invalid"
      > = [
        "valid",
        "invalid-name",
        "invalid-price",
        "invalid-stock",
        "all-invalid",
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      traditionalValidator.validate(generateProductData(randomType));
    }
  );
}

// ベンチマークの実行
runValidationBenchmark().catch(console.error);
