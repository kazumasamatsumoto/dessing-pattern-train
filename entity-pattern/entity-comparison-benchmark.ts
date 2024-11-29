// entity-comparison-benchmark.ts
import { Benchmark } from "../common/common";

// エンティティパターンを使用した実装
class UserEntity {
  private _id: number;
  private _name: string;
  private _email: string;
  private _age: number;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _status: "active" | "inactive";
  private _lastLoginAt?: Date;

  constructor(
    id: number,
    name: string,
    email: string,
    age: number,
    status: "active" | "inactive" = "active"
  ) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._age = age;
    this._status = status;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // ゲッターとセッター
  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this.validateName(value);
    this._name = value;
    this._updatedAt = new Date();
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this.validateEmail(value);
    this._email = value;
    this._updatedAt = new Date();
  }

  get age(): number {
    return this._age;
  }

  set age(value: number) {
    this.validateAge(value);
    this._age = value;
    this._updatedAt = new Date();
  }

  get status(): "active" | "inactive" {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  // ビジネスロジック
  deactivate(): void {
    this._status = "inactive";
    this._updatedAt = new Date();
  }

  activate(): void {
    this._status = "active";
    this._updatedAt = new Date();
  }

  recordLogin(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  isAdult(): boolean {
    return this._age >= 18;
  }

  // バリデーション
  private validateName(name: string): void {
    if (!name || name.length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }
    if (name.length > 100) {
      throw new Error("Name must be less than 100 characters");
    }
  }

  private validateEmail(email: string): void {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email format");
    }
  }

  private validateAge(age: number): void {
    if (age < 0 || age > 150) {
      throw new Error("Invalid age");
    }
  }

  // シリアライズ
  toJSON(): object {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      age: this._age,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      lastLoginAt: this._lastLoginAt,
    };
  }
}

// プレーンなオブジェクトを使用した実装
interface UserPlain {
  id: number;
  name: string;
  email: string;
  age: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

class UserServiceWithEntity {
  private users: Map<number, UserEntity> = new Map();

  createUser(name: string, email: string, age: number): UserEntity {
    const id = this.generateId();
    const user = new UserEntity(id, name, email, age);
    this.users.set(id, user);
    return user;
  }

  getUser(id: number): UserEntity | undefined {
    return this.users.get(id);
  }

  updateUser(id: number, name: string, email: string, age: number): UserEntity {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    user.name = name;
    user.email = email;
    user.age = age;
    return user;
  }

  deactivateUser(id: number): void {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    user.deactivate();
  }

  private generateId(): number {
    return Math.floor(Math.random() * 1000000);
  }
}

class UserServiceWithPlainObject {
  private users: Map<number, UserPlain> = new Map();

  createUser(name: string, email: string, age: number): UserPlain {
    this.validateUserData(name, email, age);

    const now = new Date();
    const user: UserPlain = {
      id: this.generateId(),
      name,
      email,
      age,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);
    return user;
  }

  getUser(id: number): UserPlain | undefined {
    return this.users.get(id);
  }

  updateUser(id: number, name: string, email: string, age: number): UserPlain {
    this.validateUserData(name, email, age);

    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    user.name = name;
    user.email = email;
    user.age = age;
    user.updatedAt = new Date();

    return user;
  }

  deactivateUser(id: number): void {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    user.status = "inactive";
    user.updatedAt = new Date();
  }

  private generateId(): number {
    return Math.floor(Math.random() * 1000000);
  }

  private validateUserData(name: string, email: string, age: number): void {
    if (!name || name.length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }
    if (name.length > 100) {
      throw new Error("Name must be less than 100 characters");
    }
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email format");
    }
    if (age < 0 || age > 150) {
      throw new Error("Invalid age");
    }
  }
}

async function runEntityBenchmark() {
  console.log("Running Entity Pattern Comparison Benchmark...");

  const serviceWithEntity = new UserServiceWithEntity();
  const serviceWithPlain = new UserServiceWithPlainObject();

  const testDataSize = 10000;
  const operationIterations = 1000;

  console.log("\n=== Create Operations ===");

  // エンティティを使用した作成操作のベンチマーク
  await Benchmark.measurePerformance(
    "User Creation (With Entity)",
    testDataSize,
    () => {
      const name = `User${Math.random()}`;
      const email = `user${Math.random()}@example.com`;
      const age = Math.floor(Math.random() * 50) + 18;
      serviceWithEntity.createUser(name, email, age);
    }
  );

  // プレーンオブジェクトを使用した作成操作のベンチマーク
  await Benchmark.measurePerformance(
    "User Creation (Plain Object)",
    testDataSize,
    () => {
      const name = `User${Math.random()}`;
      const email = `user${Math.random()}@example.com`;
      const age = Math.floor(Math.random() * 50) + 18;
      serviceWithPlain.createUser(name, email, age);
    }
  );

  // テストユーザーの準備
  const entityUser = serviceWithEntity.createUser(
    "Test Entity",
    "test.entity@example.com",
    25
  );
  const plainUser = serviceWithPlain.createUser(
    "Test Plain",
    "test.plain@example.com",
    25
  );

  console.log("\n=== Read Operations ===");

  // 取得操作のベンチマーク
  await Benchmark.measurePerformance(
    "User Retrieval (With Entity)",
    operationIterations,
    () => {
      serviceWithEntity.getUser(entityUser.id);
    }
  );

  await Benchmark.measurePerformance(
    "User Retrieval (Plain Object)",
    operationIterations,
    () => {
      serviceWithPlain.getUser(plainUser.id);
    }
  );

  console.log("\n=== Update Operations ===");

  // 更新操作のベンチマーク
  await Benchmark.measurePerformance(
    "User Update (With Entity)",
    operationIterations,
    () => {
      const name = `UpdatedUser${Math.random()}`;
      const email = `updated${Math.random()}@example.com`;
      const age = Math.floor(Math.random() * 50) + 18;
      serviceWithEntity.updateUser(entityUser.id, name, email, age);
    }
  );

  await Benchmark.measurePerformance(
    "User Update (Plain Object)",
    operationIterations,
    () => {
      const name = `UpdatedUser${Math.random()}`;
      const email = `updated${Math.random()}@example.com`;
      const age = Math.floor(Math.random() * 50) + 18;
      serviceWithPlain.updateUser(plainUser.id, name, email, age);
    }
  );

  console.log("\n=== Status Change Operations ===");

  // ステータス変更操作のベンチマーク
  await Benchmark.measurePerformance(
    "User Deactivation (With Entity)",
    operationIterations,
    () => {
      serviceWithEntity.deactivateUser(entityUser.id);
    }
  );

  await Benchmark.measurePerformance(
    "User Deactivation (Plain Object)",
    operationIterations,
    () => {
      serviceWithPlain.deactivateUser(plainUser.id);
    }
  );
}

runEntityBenchmark().catch(console.error);
