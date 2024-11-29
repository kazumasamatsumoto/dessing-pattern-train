// result-pattern-benchmark.ts
import { Benchmark } from "../common/common";

// Result型の定義
interface Success<T> {
  type: "success";
  value: T;
}

interface Failure {
  type: "failure";
  error: string;
}

type Result<T> = Success<T> | Failure;

// ドメインモデル
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Result パターンを使用した実装
class UserServiceWithResult {
  private users: Map<number, User> = new Map();
  private nextId: number = 1;

  createUser(name: string, email: string, age: number): Result<User> {
    // バリデーション
    if (!name || name.trim().length < 2) {
      return {
        type: "failure",
        error: "Name must be at least 2 characters long",
      };
    }

    if (!email || !email.includes("@")) {
      return { type: "failure", error: "Invalid email format" };
    }

    if (age < 0 || age > 150) {
      return { type: "failure", error: "Invalid age" };
    }

    // 重複チェック
    const normalizedEmail = email.toLowerCase();
    const exists = Array.from(this.users.values()).some(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (exists) {
      return { type: "failure", error: `Email already exists: ${email}` };
    }

    // ユーザー作成
    const user: User = {
      id: this.nextId++,
      name: name.trim(),
      email: normalizedEmail,
      age,
    };

    // 保存
    this.users.set(user.id, user);
    return { type: "success", value: user };
  }

  getUser(id: number): Result<User> {
    const user = this.users.get(id);
    if (!user) {
      return { type: "failure", error: `User not found with id: ${id}` };
    }
    return { type: "success", value: user };
  }
}

// 従来の例外処理を使用した実装
class UserServiceTraditional {
  private users: Map<number, User> = new Map();
  private nextId: number = 1;

  createUser(name: string, email: string, age: number): User {
    if (!name || name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }

    if (!email || !email.includes("@")) {
      throw new Error("Invalid email format");
    }

    if (age < 0 || age > 150) {
      throw new Error("Invalid age");
    }

    const normalizedEmail = email.toLowerCase();
    const exists = Array.from(this.users.values()).some(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (exists) {
      throw new Error(`Email already exists: ${email}`);
    }

    const user: User = {
      id: this.nextId++,
      name: name.trim(),
      email: normalizedEmail,
      age,
    };

    this.users.set(user.id, user);
    return user;
  }

  getUser(id: number): User {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User not found with id: ${id}`);
    }
    return user;
  }
}

// 改善されたテストデータジェネレーター
function generateTestData(index: number): {
  name: string;
  email: string;
  age: number;
} {
  return {
    name: `User${index}`,
    email: `user${Date.now()}.${index}@example.com`, // タイムスタンプを追加してユニーク性を確保
    age: 20 + (index % 50),
  };
}

async function runResultPatternBenchmark() {
  const resultService = new UserServiceWithResult();
  const traditionalService = new UserServiceTraditional();

  const iterations = 10000;
  const successCases = Math.floor(iterations * 0.8); // 80% 成功ケース
  const errorCases = iterations - successCases; // 20% エラーケース

  console.log("\n=== Success Case Benchmarks ===");

  // Result パターンの成功ケース
  await Benchmark.measurePerformance(
    "Create User (Result Pattern) - Success Cases",
    successCases,
    () => {
      const index = Math.floor(Math.random() * 1000000);
      const data = generateTestData(index);
      const result = resultService.createUser(data.name, data.email, data.age);
      if (result.type === "failure") {
        throw new Error(`Unexpected failure: ${result.error}`);
      }
    }
  );

  // 従来の実装の成功ケース
  await Benchmark.measurePerformance(
    "Create User (Traditional) - Success Cases",
    successCases,
    () => {
      const index = Math.floor(Math.random() * 1000000);
      const data = generateTestData(index);
      traditionalService.createUser(data.name, data.email, data.age);
    }
  );

  console.log("\n=== Error Case Benchmarks ===");

  // Result パターンのエラーケース
  await Benchmark.measurePerformance(
    "Create User (Result Pattern) - Error Cases",
    errorCases,
    () => {
      const result = resultService.createUser("A", "invalid-email", -1);
      if (result.type === "success") {
        throw new Error("Unexpected success");
      }
    }
  );

  // 従来の実装のエラーケース
  await Benchmark.measurePerformance(
    "Create User (Traditional) - Error Cases",
    errorCases,
    () => {
      try {
        traditionalService.createUser("A", "invalid-email", -1);
      } catch (error) {
        // 期待されるエラー
      }
    }
  );

  console.log("\n=== Retrieval Benchmarks ===");

  // テストデータの準備
  const resultUser = resultService.createUser(
    "Test User",
    `test${Date.now()}@example.com`,
    25
  );
  const traditionalUser = traditionalService.createUser(
    "Test User",
    `test${Date.now() + 1}@example.com`,
    25
  );

  if (resultUser.type === "success") {
    await Benchmark.measurePerformance(
      "Get User (Result Pattern)",
      iterations,
      () => {
        const result = resultService.getUser(resultUser.value.id);
        if (result.type === "failure") {
          throw new Error("Unexpected failure in get user");
        }
      }
    );
  }

  await Benchmark.measurePerformance(
    "Get User (Traditional)",
    iterations,
    () => {
      traditionalService.getUser(traditionalUser.id);
    }
  );

  console.log("\n=== Not Found Case Benchmarks ===");

  await Benchmark.measurePerformance(
    "Get Non-existent User (Result Pattern)",
    iterations,
    () => {
      const result = resultService.getUser(999999);
      if (result.type === "success") {
        throw new Error("Unexpected success in get non-existent user");
      }
    }
  );

  await Benchmark.measurePerformance(
    "Get Non-existent User (Traditional)",
    iterations,
    () => {
      try {
        traditionalService.getUser(999999);
      } catch (error) {
        // 期待されるエラー
      }
    }
  );
}

runResultPatternBenchmark().catch(console.error);
