// ユーザー関連の型定義
type UserId = string;
type UserRole = 'admin' | 'user' | 'guest';

interface UserData {
  id: UserId;
  name: string;
  role: UserRole;
  email: string;
}

// カスタムエラークラスの定義
class UserOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserOperationError';
  }
}

// ユーザー操作のインターフェース定義
interface IUserOperations {
  // ユーザー検索のオーバーロード
  findUser(id: UserId): UserData;
  findUser(email: string): UserData;
  findUser(name: string, role: UserRole): UserData[];
}

// インターフェースの実装
class UserManager implements IUserOperations {
  private users: UserData[] = [
    {
      id: "1",
      name: "John Doe",
      role: "admin",
      email: "john@example.com"
    },
    {
      id: "2",
      name: "Jane Smith",
      role: "user",
      email: "jane@example.com"
    }
  ];

  findUser(id: UserId): UserData;
  findUser(email: string): UserData;
  findUser(name: string, role: UserRole): UserData[];
  findUser(searchParam: string, role?: UserRole): UserData | UserData[] {
    // IDによる検索
    if (role === undefined && this.isUserId(searchParam)) {
      const user = this.users.find(u => u.id === searchParam);
      if (!user) throw new UserOperationError('User not found');
      return user;
    }

    // メールアドレスによる検索
    if (role === undefined && this.isEmail(searchParam)) {
      const user = this.users.find(u => u.email === searchParam);
      if (!user) throw new UserOperationError('User not found');
      return user;
    }

    // 名前とロールによる検索
    if (role !== undefined) {
      const users = this.users.filter(u => u.name === searchParam && u.role === role);
      return users;
    }

    throw new UserOperationError('Invalid search parameters');
  }

  updateUser(id: UserId, data: Partial<UserData>): boolean;
  updateUser(email: string, data: Partial<UserData>): boolean;
  updateUser(identifier: string, data: Partial<UserData>): boolean {
    let userIndex: number = -1;

    if (this.isUserId(identifier)) {
      userIndex = this.users.findIndex(u => u.id === identifier);
    } else if (this.isEmail(identifier)) {
      userIndex = this.users.findIndex(u => u.email === identifier);
    }

    if (userIndex === -1) return false;

    this.users[userIndex] = { ...this.users[userIndex], ...data };
    return true;
  }

  deleteUser(id: UserId): boolean;
  deleteUser(email: string): boolean;
  deleteUser(ids: UserId[]): boolean;
  deleteUser(target: UserId | string | UserId[]): boolean {
    if (Array.isArray(target)) {
      target.forEach(id => {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.users.splice(index, 1);
        }
      });
      return true;
    } else {
      const index = this.isEmail(target)
        ? this.users.findIndex(u => u.email === target)
        : this.users.findIndex(u => u.id === target);

      if (index === -1) return false;
      this.users.splice(index, 1);
      return true;
    }
  }

  // ヘルパーメソッド
  private isUserId(value: any): value is UserId {
    return typeof value === 'string' && /^\d+$/.test(value);
  }

  private isEmail(value: any): value is string {
    return typeof value === 'string' && value.includes('@');
  }
}

// 使用例
const userManager = new UserManager();

try {
  // findUserの使用例
  const userById = userManager.findUser("1");
  console.log("Find by ID:", userById);

  const userByEmail = userManager.findUser("john@example.com");
  console.log("Find by Email:", userByEmail);

  const usersByRole = userManager.findUser("John Doe", "admin");
  console.log("Find by Name and Role:", usersByRole);

  // updateUserの使用例
  const updated = userManager.updateUser("1", { name: "John Doe Updated" });
  console.log("Update result:", updated);

  // deleteUserの使用例
  const deleted = userManager.deleteUser("2");
  console.log("Delete result:", deleted);

  // 複数ユーザーの削除
  const multipleDeleted = userManager.deleteUser(["1", "2"]);
  console.log("Multiple delete result:", multipleDeleted);

} catch (err) {
  if (err instanceof UserOperationError) {
    console.error("User Operation Error:", err.message);
  } else {
    console.error("Unexpected Error:", err);
  }
}