// chain-benchmark.ts
import {
  User,
  Request,
  Response,
  RequestHandler,
  Benchmark,
} from "../common/common";

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

  async handle(request: Request): Promise<Response> {
    const userId = request.user.id;
    const userRequests = this.requests.get(userId) || 0;

    if (userRequests >= this.limit) {
      return { status: 429, headers: {}, body: "Too Many Requests" };
    }

    this.requests.set(userId, userRequests + 1);
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

// 従来の方式での実装
class TraditionalRequestProcessor {
  private readonly adminPaths = ["/admin", "/settings"];
  private requests: Map<number, number> = new Map();
  private readonly rateLimit = 100;

  async processRequest(request: Request): Promise<Response> {
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      return { status: 401, headers: {}, body: "Unauthorized" };
    }

    const userId = request.user.id;
    const userRequests = this.requests.get(userId) || 0;
    if (userRequests >= this.rateLimit) {
      return { status: 429, headers: {}, body: "Too Many Requests" };
    }
    this.requests.set(userId, userRequests + 1);

    if (
      this.adminPaths.some((path) => request.path.startsWith(path)) &&
      request.user.role !== "admin"
    ) {
      return { status: 403, headers: {}, body: "Forbidden" };
    }

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
  // generateTestRequest 関数内のbaseRequestの生成部分を以下のように修正
  const baseRequest: Request = {
    user: new User(
      Math.floor(Math.random() * 1000),
      "Test User",
      "test@example.com",
      "user"
    ),
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
      baseRequest.user.id = 1;
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

async function main() {
  // Setup handlers
  const authHandler = new AuthenticationHandler();
  const rateLimitHandler = new RateLimitHandler();
  const authorizationHandler = new AuthorizationHandler();
  const validationHandler = new ValidationHandler();

  authHandler
    .setNext(rateLimitHandler)
    .setNext(authorizationHandler)
    .setNext(validationHandler);

  const traditionalProcessor = new TraditionalRequestProcessor();
  const iterations = 1000;

  console.log("Running Chain of Responsibility Pattern Benchmark...");

  // Success case
  await Benchmark.measurePerformance(
    "Chain of Responsibility - Success Case",
    iterations,
    () => {
      authHandler.handle(generateTestRequest("success"));
    }
  );

  await Benchmark.measurePerformance(
    "Traditional - Success Case",
    iterations,
    () => {
      traditionalProcessor.processRequest(generateTestRequest("success"));
    }
  );

  // Auth error case
  await Benchmark.measurePerformance(
    "Chain of Responsibility - Auth Error",
    iterations,
    () => {
      authHandler.handle(generateTestRequest("auth-error"));
    }
  );

  await Benchmark.measurePerformance(
    "Traditional - Auth Error",
    iterations,
    () => {
      traditionalProcessor.processRequest(generateTestRequest("auth-error"));
    }
  );

  // Forbidden case
  await Benchmark.measurePerformance(
    "Chain of Responsibility - Forbidden",
    iterations,
    () => {
      authHandler.handle(generateTestRequest("forbidden"));
    }
  );

  await Benchmark.measurePerformance(
    "Traditional - Forbidden",
    iterations,
    () => {
      traditionalProcessor.processRequest(generateTestRequest("forbidden"));
    }
  );
}

main().catch(console.error);
