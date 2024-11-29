// repository-benchmark.ts
import { User, Benchmark } from "../common/common";

// リポジトリのインターフェース
interface UserRepository {
  findById(id: number): User;
  findAll(): User[];
  save(user: User): void;
  update(user: User): void;
  delete(id: number): void;
}

// インメモリ実装
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

// 配列ベースの実装（比較用）
class ArrayUserRepository implements UserRepository {
  private users: User[] = [];

  findById(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error(`User not found: ${id}`);
    return user;
  }

  findAll(): User[] {
    return [...this.users];
  }

  save(user: User): void {
    this.users.push(user);
  }

  update(user: User): void {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      throw new Error(`User not found: ${user.id}`);
    }
    this.users[index] = user;
  }

  delete(id: number): void {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User not found: ${id}`);
    }
    this.users.splice(index, 1);
  }
}

// オブジェクトベースの実装（比較用）
class ObjectUserRepository implements UserRepository {
  private users: { [key: number]: User } = {};

  findById(id: number): User {
    const user = this.users[id];
    if (!user) throw new Error(`User not found: ${id}`);
    return user;
  }

  findAll(): User[] {
    return Object.values(this.users);
  }

  save(user: User): void {
    this.users[user.id] = user;
  }

  update(user: User): void {
    if (!(user.id in this.users)) {
      throw new Error(`User not found: ${user.id}`);
    }
    this.users[user.id] = user;
  }

  delete(id: number): void {
    if (!(id in this.users)) {
      throw new Error(`User not found: ${id}`);
    }
    delete this.users[id];
  }
}

async function runRepositoryBenchmark() {
  console.log("Running Repository Pattern Benchmark...");

  const repositories = {
    "Map-based Repository": new InMemoryUserRepository(),
    "Array-based Repository": new ArrayUserRepository(),
    "Object-based Repository": new ObjectUserRepository(),
  };

  const testDataSize = 10000;
  const operationIterations = 1000;

  // 各リポジトリ実装に対してベンチマークを実行
  for (const [name, repository] of Object.entries(repositories)) {
    console.log(`\n=== Testing ${name} ===`);

    // データ追加のベンチマーク
    await Benchmark.measurePerformance(
      `${name} - Bulk Insert`,
      testDataSize,
      () => {
        const user = new User(
          Math.floor(Math.random() * 1000000),
          `User${Math.random()}`,
          `user${Math.random()}@example.com`
        );
        repository.save(user);
      }
    );

    // テストデータの準備
    const testUser = new User(1, "Test User", "test@example.com");
    repository.save(testUser);

    // 単一ユーザー取得のベンチマーク
    await Benchmark.measurePerformance(
      `${name} - Single User Retrieval`,
      operationIterations,
      () => {
        repository.findById(1);
      }
    );

    // 全ユーザー取得のベンチマーク
    await Benchmark.measurePerformance(
      `${name} - Get All Users`,
      100, // 全件取得は重い操作なので少なめの反復回数
      () => {
        repository.findAll();
      }
    );

    // 更新のベンチマーク
    await Benchmark.measurePerformance(
      `${name} - Update User`,
      operationIterations,
      () => {
        const updatedUser = new User(
          1,
          `Updated${Math.random()}`,
          "test@example.com"
        );
        repository.update(updatedUser);
      }
    );

    // 削除のベンチマーク
    await Benchmark.measurePerformance(
      `${name} - Delete and Insert`,
      operationIterations,
      () => {
        const userId = Math.floor(Math.random() * testDataSize);
        try {
          repository.delete(userId);
        } catch (e) {
          // ユーザーが見つからない場合は無視
        }
        const newUser = new User(
          userId,
          `User${Math.random()}`,
          `user${Math.random()}@example.com`
        );
        repository.save(newUser);
      }
    );
  }
}

runRepositoryBenchmark().catch(console.error);
