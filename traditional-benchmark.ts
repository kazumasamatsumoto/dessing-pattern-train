// traditional-benchmark.ts
import { User, UserRole, Benchmark } from "./common/common";

// リクエストとレスポンスの型定義
interface RequestData {
  user: User;
  resource: string;
  action: "read" | "write" | "delete";
  payload?: any;
}

interface ResponseData {
  success: boolean;
  message: string;
  data?: any;
}

// 従来の方式での実装
class UserAccessManager {
  private users: Map<number, User> = new Map();
  private requestCounts: Map<number, number> = new Map();
  private readonly requestLimit = 100;

  processRequest(request: RequestData): ResponseData {
    // 認証チェック
    if (!this.isAuthenticated(request.user)) {
      return {
        success: false,
        message: "User is not authenticated",
      };
    }

    // レートリミットチェック
    if (!this.checkRateLimit(request.user.id)) {
      return {
        success: false,
        message: "Rate limit exceeded",
      };
    }

    // 権限チェック
    if (!this.hasPermission(request.user, request.resource, request.action)) {
      return {
        success: false,
        message: "Permission denied",
      };
    }

    // 入力バリデーション
    if (!this.validateInput(request)) {
      return {
        success: false,
        message: "Invalid input",
      };
    }

    // ビジネスロジックの実行
    return this.executeAction(request);
  }

  private isAuthenticated(user: User): boolean {
    return user.id > 0 && user.email.includes("@");
  }

  private checkRateLimit(userId: number): boolean {
    const currentCount = this.requestCounts.get(userId) || 0;
    if (currentCount >= this.requestLimit) {
      return false;
    }
    this.requestCounts.set(userId, currentCount + 1);
    return true;
  }

  private hasPermission(user: User, resource: string, action: string): boolean {
    const userRole: UserRole = user.role; // 明示的な型の割り当て

    // 管理者は全ての権限を持つ
    if (userRole === "admin") {
      return true;
    }

    // 一般ユーザーの権限チェック
    if (userRole === "user") {
      // 管理者専用リソースへのアクセス禁止
      if (resource.startsWith("/admin")) {
        return false;
      }

      // 書き込み操作の制限
      if (action === "write") {
        return false;
      }
    }

    return true;
  }

  private validateInput(request: RequestData): boolean {
    if (request.action === "write" && !request.payload) {
      return false;
    }

    if (request.resource.length === 0) {
      return false;
    }

    return true;
  }

  private executeAction(request: RequestData): ResponseData {
    return {
      success: true,
      message: "Action executed successfully",
      data: { timestamp: new Date().toISOString() },
    };
  }
}

// テストデータ生成関数
function generateRequest(
  type:
    | "success"
    | "auth-error"
    | "rate-limit"
    | "permission-error"
    | "validation-error"
): RequestData {
  const baseRequest: RequestData = {
    user: new User(1, "Test User", "test@example.com", "user"),
    resource: "/api/data",
    action: "read",
  };

  switch (type) {
    case "auth-error":
      baseRequest.user = new User(-1, "Invalid User", "invalid", "user");
      break;
    case "rate-limit":
      baseRequest.user = new User(
        2,
        "Limited User",
        "limited@example.com",
        "user"
      );
      break;
    case "permission-error":
      baseRequest.resource = "/admin/settings";
      baseRequest.action = "write";
      break;
    case "validation-error":
      baseRequest.action = "write";
      baseRequest.payload = null;
      break;
  }

  return baseRequest;
}

async function runTraditionalBenchmark() {
  console.log("Running Traditional Approach Benchmark...");

  const manager = new UserAccessManager();
  const iterations = 10000;

  // 正常系のベンチマーク
  await Benchmark.measurePerformance(
    "Successful Request Processing",
    iterations,
    () => {
      const request = generateRequest("success");
      manager.processRequest(request);
    }
  );

  // 認証エラーのベンチマーク
  await Benchmark.measurePerformance(
    "Authentication Error Processing",
    iterations,
    () => {
      const request = generateRequest("auth-error");
      manager.processRequest(request);
    }
  );

  // レートリミットのベンチマーク
  await Benchmark.measurePerformance(
    "Rate Limit Processing",
    iterations,
    () => {
      const request = generateRequest("rate-limit");
      manager.processRequest(request);
    }
  );

  // 権限エラーのベンチマーク
  await Benchmark.measurePerformance(
    "Permission Error Processing",
    iterations,
    () => {
      const request = generateRequest("permission-error");
      manager.processRequest(request);
    }
  );

  // バリデーションエラーのベンチマーク
  await Benchmark.measurePerformance(
    "Validation Error Processing",
    iterations,
    () => {
      const request = generateRequest("validation-error");
      manager.processRequest(request);
    }
  );

  // 複合ベンチマーク（ランダムなリクエスト）
  await Benchmark.measurePerformance(
    "Mixed Request Processing",
    iterations,
    () => {
      const types: Array<
        | "success"
        | "auth-error"
        | "rate-limit"
        | "permission-error"
        | "validation-error"
      > = [
        "success",
        "auth-error",
        "rate-limit",
        "permission-error",
        "validation-error",
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const request = generateRequest(randomType);
      manager.processRequest(request);
    }
  );
}

runTraditionalBenchmark().catch(console.error);
