// repository-comparison-benchmark.ts
import { User, Benchmark } from "../common/common";

// リポジトリパターン実装
interface UserRepository {
  findById(id: number): User;
  findAll(): User[];
  save(user: User): void;
  update(user: User): void;
  delete(id: number): void;
}

class InMemoryUserRepository implements UserRepository {
  private users: Map<number, User> = new Map();

  findById(id: number): User {
    const user = this.users.get(id);
    if (!user) throw new Error(`User not found: ${id}`);
    return user;
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  save(user: User): void {
    this.users.set(user.id, user);
  }

  update(user: User): void {
    if (!this.users.has(user.id)) {
      throw new Error(`User not found: ${user.id}`);
    }
    this.users.set(user.id, user);
  }

  delete(id: number): void {
    if (!this.users.delete(id)) {
      throw new Error(`User not found: ${id}`);
    }
  }
}

// リポジトリパターンを使用するサービス
class UserServiceWithRepository {
  constructor(private repository: UserRepository) {}

  registerUser(name: string, email: string): User {
    const id = Math.floor(Math.random() * 1000000);
    const user = new User(id, name, email);
    this.repository.save(user);
    return user;
  }

  getUser(id: number): User {
    return this.repository.findById(id);
  }

  getAllUsers(): User[] {
    return this.repository.findAll();
  }

  updateUser(id: number, name: string, email: string): User {
    const user = new User(id, name, email);
    this.repository.update(user);
    return user;
  }

  deleteUser(id: number): void {
    this.repository.delete(id);
  }
}

// リポジトリパターンを使用しない直接データアクセス実装
class UserServiceDirect {
  private users: Map<number, User> = new Map();

  registerUser(name: string, email: string): User {
    const id = Math.floor(Math.random() * 1000000);
    const user = new User(id, name, email);
    this.users.set(id, user);
    return user;
  }

  getUser(id: number): User {
    const user = this.users.get(id);
    if (!user) throw new Error(`User not found: ${id}`);
    return user;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  updateUser(id: number, name: string, email: string): User {
    if (!this.users.has(id)) {
      throw new Error(`User not found: ${id}`);
    }
    const user = new User(id, name, email);
    this.users.set(id, user);
    return user;
  }

  deleteUser(id: number): void {
    if (!this.users.delete(id)) {
      throw new Error(`User not found: ${id}`);
    }
  }
}

// 複雑なビジネスロジックを含むサービス（比較用）
class ComplexUserServiceWithRepository {
  constructor(private repository: UserRepository) {}

  registerUserWithValidation(name: string, email: string): User {
    // バリデーションロジック
    if (!name || name.length < 2) throw new Error("Invalid name");
    if (!email || !email.includes("@")) throw new Error("Invalid email");

    // 重複チェック
    const existingUsers = this.repository.findAll();
    if (existingUsers.some((u) => u.email === email)) {
      throw new Error("Email already exists");
    }

    // ユーザー作成
    const id = Math.floor(Math.random() * 1000000);
    const user = new User(id, name.trim(), email.toLowerCase());

    // 保存前の追加処理
    this.validateUserQuota(existingUsers.length);

    this.repository.save(user);
    return user;
  }

  private validateUserQuota(currentCount: number): void {
    if (currentCount >= 1000) {
      throw new Error("User quota exceeded");
    }
  }
}

class ComplexUserServiceDirect {
  private users: Map<number, User> = new Map();

  registerUserWithValidation(name: string, email: string): User {
    // バリデーションロジック
    if (!name || name.length < 2) throw new Error("Invalid name");
    if (!email || !email.includes("@")) throw new Error("Invalid email");

    // 重複チェック
    const existingUsers = Array.from(this.users.values());
    if (existingUsers.some((u) => u.email === email)) {
      throw new Error("Email already exists");
    }

    // ユーザー作成
    const id = Math.floor(Math.random() * 1000000);
    const user = new User(id, name.trim(), email.toLowerCase());

    // 保存前の追加処理
    this.validateUserQuota(this.users.size);

    this.users.set(id, user);
    return user;
  }

  private validateUserQuota(currentCount: number): void {
    if (currentCount >= 1000) {
      throw new Error("User quota exceeded");
    }
  }
}

async function runComparisonBenchmark() {
  console.log("Running Repository Pattern Comparison Benchmark...");

  // 基本的な操作のベンチマーク
  const repository = new InMemoryUserRepository();
  const serviceWithRepo = new UserServiceWithRepository(repository);
  const serviceDirect = new UserServiceDirect();

  const testDataSize = 10000;
  const operationIterations = 1000;

  console.log("\n=== Basic Operations ===");

  // データ登録のベンチマーク
  await Benchmark.measurePerformance(
    "User Registration (With Repository)",
    testDataSize,
    () => {
      serviceWithRepo.registerUser(
        `User${Math.random()}`,
        `user${Math.random()}@example.com`
      );
    }
  );

  await Benchmark.measurePerformance(
    "User Registration (Direct Access)",
    testDataSize,
    () => {
      serviceDirect.registerUser(
        `User${Math.random()}`,
        `user${Math.random()}@example.com`
      );
    }
  );

  // テストユーザーの準備
  const testUserRepo = serviceWithRepo.registerUser(
    "Test Repo",
    "test.repo@example.com"
  );
  const testUserDirect = serviceDirect.registerUser(
    "Test Direct",
    "test.direct@example.com"
  );

  // ユーザー取得のベンチマーク
  await Benchmark.measurePerformance(
    "User Retrieval (With Repository)",
    operationIterations,
    () => {
      serviceWithRepo.getUser(testUserRepo.id);
    }
  );

  await Benchmark.measurePerformance(
    "User Retrieval (Direct Access)",
    operationIterations,
    () => {
      serviceDirect.getUser(testUserDirect.id);
    }
  );

  // 全ユーザー取得のベンチマーク
  await Benchmark.measurePerformance(
    "Get All Users (With Repository)",
    100,
    () => {
      serviceWithRepo.getAllUsers();
    }
  );

  await Benchmark.measurePerformance(
    "Get All Users (Direct Access)",
    100,
    () => {
      serviceDirect.getAllUsers();
    }
  );

  // 複雑なビジネスロジックのベンチマーク
  console.log("\n=== Complex Operations ===");

  const complexServiceWithRepo = new ComplexUserServiceWithRepository(
    repository
  );
  const complexServiceDirect = new ComplexUserServiceDirect();

  await Benchmark.measurePerformance(
    "Complex User Registration (With Repository)",
    operationIterations,
    () => {
      try {
        complexServiceWithRepo.registerUserWithValidation(
          `User${Math.random()}`,
          `user${Math.random()}@example.com`
        );
      } catch (e) {
        // クォータ超過エラーは無視
      }
    }
  );

  await Benchmark.measurePerformance(
    "Complex User Registration (Direct Access)",
    operationIterations,
    () => {
      try {
        complexServiceDirect.registerUserWithValidation(
          `User${Math.random()}`,
          `user${Math.random()}@example.com`
        );
      } catch (e) {
        // クォータ超過エラーは無視
      }
    }
  );
}

runComparisonBenchmark().catch(console.error);
