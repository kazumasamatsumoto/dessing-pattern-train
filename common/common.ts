// common.ts
export type UserRole = "admin" | "user";

export class User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public role: UserRole = "user"
  ) {}
}

export interface Request {
  user: User;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers: Record<string, string>;
}

export interface Response {
  status: number;
  body?: any;
  headers: Record<string, string>;
}

export abstract class RequestHandler {
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

export class Benchmark {
  private static formatBytes(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  static async measurePerformance(
    name: string,
    iterations: number,
    fn: () => void
  ): Promise<void> {
    const initialMemory = process.memoryUsage();

    console.log(`\nBenchmarking: ${name}`);
    console.log(`Iterations: ${iterations}`);

    const startTime = process.hrtime.bigint();

    for (let i = 0; i < iterations; i++) {
      fn();
    }

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000;

    const finalMemory = process.memoryUsage();

    console.log("\nResults:");
    console.log(`Total Time: ${duration.toFixed(2)}ms`);
    console.log(
      `Average Time per Operation: ${(duration / iterations).toFixed(2)}ms`
    );

    console.log("\nMemory Usage:");
    console.log(
      "Heap Used:",
      this.formatBytes(finalMemory.heapUsed - initialMemory.heapUsed)
    );
    console.log(
      "Heap Total:",
      this.formatBytes(finalMemory.heapTotal - initialMemory.heapTotal)
    );
    console.log("RSS:", this.formatBytes(finalMemory.rss - initialMemory.rss));
  }
}
