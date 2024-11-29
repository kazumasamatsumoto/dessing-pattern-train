// chain-of-responsibility-benchmark.ts
import { Benchmark } from "./common/common";

// 共通のインターフェースとデータ型
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  lastLoginAt?: Date;
}

interface Request {
  user: User;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers: Record<string, string>;
}

interface Response {
  status: number;
  body?: any;
  headers: Record<string, string>;
}

// Chain of Responsibility パターンの実装
abstract class RequestHandler {
  private nextHandler: RequestHandler | null = null;

  setNext(handler: RequestHandler): RequestHandler {
    this.nextHandler = handler;
    return handler;
  }

  protected async handleNext(request: Request): Promise<Response> {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return { status: 200, headers: {}, body: "OK" };
  }

  abstract handle(request: Request): Promise<Response>;
}

// 具体的なハンドラーの実装
class AuthenticationHandler extends RequestHandler {
  async handle(request: Request): Promise<Response> {
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      return { status: 401, headers: {}, body: "Unauthorized" };
    }
    return this.handleNext(request);
  }
}

class RateLimitHandler extends RequestHandler {
  private requests: Map<number, number> = new Map();
  private readonly limit = 100;
  private readonly windowMs = 60000; // 1分

  async handle(request: Request): Promise<Response> {
    const now = Date.now();
    const userId = request.user.id;
    const userRequests = this.requests.get(userId) || 0;

    if (userRequests >= this.limit) {
      return { status: 429, headers: {}, body: "Too Many Requests" };
    }

    this.requests.set(userId, userRequests + 1);
    setTimeout(() => this.requests.set(userId, userRequests), this.windowMs);

    return this.handleNext(request);
  }
}

class AuthorizationHandler extends RequestHandler {
  private readonly adminPaths = ["/admin", "/settings"];

  async handle(request: Request): Promise<Response> {
    if (
      this.adminPaths.some((path) => request.path.startsWith(path)) &&
      request.user.role !== "admin"
    ) {
      return { status: 403, headers: {}, body: "Forbidden" };
    }
    return this.handleNext(request);
  }
}

class ValidationHandler extends RequestHandler {
  async handle(request: Request): Promise<Response> {
    if (request.method === "POST" || request.method === "PUT") {
      if (!request.body) {
        return {
          status: 400,
          headers: {},
          body: "Bad Request: Body is required",
        };
      }
      if (typeof request.body !== "object") {
        return {
          status: 400,
          headers: {},
          body: "Bad Request: Invalid body format",
        };
      }
    }
    return this.handleNext(request);
  }
}

// 従来の方式（条件分岐）での実装
class TraditionalRequestProcessor {
  private readonly adminPaths = ["/admin", "/settings"];
  private requests: Map<number, number> = new Map();
  private readonly rateLimit = 100;
  private readonly rateLimitWindowMs = 60000;

  async processRequest(request: Request): Promise<Response> {
    // 認証チェック
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      return { status: 401, headers: {}, body: "Unauthorized" };
    }

    // レートリミットチェック
    const now = Date.now();
    const userId = request.user.id;
    const userRequests = this.requests.get(userId) || 0;

    if (userRequests >= this.rateLimit) {
      return { status: 429, headers: {}, body: "Too Many Requests" };
    }

    this.requests.set(userId, userRequests + 1);
    setTimeout(
      () => this.requests.set(userId, userRequests),
      this.rateLimitWindowMs
    );

    // 認可チェック
    if (
      this.adminPaths.some((path) => request.path.startsWith(path)) &&
      request.user.role !== "admin"
    ) {
      return { status: 403, headers: {}, body: "Forbidden" };
    }

    // バリデーションチェック
    if (request.method === "POST" || request.method === "PUT") {
      if (!request.body) {
        return {
          status: 400,
          headers: {},
          body: "Bad Request: Body is required",
        };
      }
      if (typeof request.body !== "object") {
        return {
          status: 400,
          headers: {},
          body: "Bad Request: Invalid body format",
        };
      }
    }

    return { status: 200, headers: {}, body: "OK" };
  }
}

// テストデータ生成
function generateTestRequest(
  type:
    | "success"
    | "auth-error"
    | "rate-limit"
    | "forbidden"
    | "validation-error"
): Request {
  const baseRequest: Request = {
    user: {
      id: Math.floor(Math.random() * 1000),
      name: "Test User",
      email: "test@example.com",
      role: "user",
    },
    path: "/api/data",
    method: "GET",
    headers: {
      authorization: "Bearer token123",
    },
  };

  switch (type) {
    case "auth-error":
      delete baseRequest.headers["authorization"];
      break;
    case "rate-limit":
      baseRequest.user.id = 1; // 同じIDを使用してレートリミットを発生させる
      break;
    case "forbidden":
      baseRequest.path = "/admin/settings";
      break;
    case "validation-error":
      baseRequest.method = "POST";
      baseRequest.body = "invalid-body";
      break;
  }

  return baseRequest;
}

async function runChainOfResponsibilityBenchmark() {
  // Chain of Responsibility パターンのセットアップ
  const authHandler = new AuthenticationHandler();
  const rateLimitHandler = new RateLimitHandler();
  const authorizationHandler = new AuthorizationHandler();
  const validationHandler = new ValidationHandler();

  authHandler
    .setNext(rateLimitHandler)
    .setNext(authorizationHandler)
    .setNext(validationHandler);

  // 従来の実装
  const traditionalProcessor = new TraditionalRequestProcessor();

  const iterations = 10000;

  console.log("\n=== Success Case Benchmarks ===");

  // 成功ケースのベンチマーク
  await Benchmark.measurePerformance(
    "Request Processing (Chain of Responsibility) - Success",
    iterations,
    async () => {
      await authHandler.handle(generateTestRequest("success"));
    }
  );

  await Benchmark.measurePerformance(
    "Request Processing (Traditional) - Success",
    iterations,
    async () => {
      await traditionalProcessor.processRequest(generateTestRequest("success"));
    }
  );

  console.log("\n=== Authentication Error Benchmarks ===");

  await Benchmark.measurePerformance(
    "Request Processing (Chain of Responsibility) - Auth Error",
    iterations,
    async () => {
      await authHandler.handle(generateTestRequest("auth-error"));
    }
  );

  await Benchmark.measurePerformance(
    "Request Processing (Traditional) - Auth Error",
    iterations,
    async () => {
      await traditionalProcessor.processRequest(
        generateTestRequest("auth-error")
      );
    }
  );

  console.log("\n=== Rate Limit Benchmarks ===");

  await Benchmark.measurePerformance(
    "Request Processing (Chain of Responsibility) - Rate Limit",
    iterations,
    async () => {
      await authHandler.handle(generateTestRequest("rate-limit"));
    }
  );

  await Benchmark.measurePerformance(
    "Request Processing (Traditional) - Rate Limit",
    iterations,
    async () => {
      await traditionalProcessor.processRequest(
        generateTestRequest("rate-limit")
      );
    }
  );

  console.log("\n=== Forbidden Access Benchmarks ===");

  await Benchmark.measurePerformance(
    "Request Processing (Chain of Responsibility) - Forbidden",
    iterations,
    async () => {
      await authHandler.handle(generateTestRequest("forbidden"));
    }
  );

  await Benchmark.measurePerformance(
    "Request Processing (Traditional) - Forbidden",
    iterations,
    async () => {
      await traditionalProcessor.processRequest(
        generateTestRequest("forbidden")
      );
    }
  );

  console.log("\n=== Validation Error Benchmarks ===");

  await Benchmark.measurePerformance(
    "Request Processing (Chain of Responsibility) - Validation Error",
    iterations,
    async () => {
      await authHandler.handle(generateTestRequest("validation-error"));
    }
  );

  await Benchmark.measurePerformance(
    "Request Processing (Traditional) - Validation Error",
    iterations,
    async () => {
      await traditionalProcessor.processRequest(
        generateTestRequest("validation-error")
      );
    }
  );
}

runChainOfResponsibilityBenchmark().catch(console.error);
