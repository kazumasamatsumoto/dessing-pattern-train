// no-di-benchmark.ts
import { User, Benchmark } from "../common/common";

class UserServiceWithoutDI {
  private users: Map<number, User> = new Map();

  registerUser(name: string, email: string): User {
    console.log(`[LOG]: Registering new user: ${name}`);

    const id = Math.floor(Math.random() * 1000000);
    const user = new User(id, name, email);

    this.users.set(user.id, user);

    console.log(`Sending email to ${email}`);
    console.log(`Subject: Welcome!`);
    console.log(`Body: Welcome to our service, ${name}!`);

    return user;
  }

  getUser(id: number): User {
    console.log(`[LOG]: Fetching user: ${id}`);
    const user = this.users.get(id);
    if (!user) throw new Error(`User not found: ${id}`);
    return user;
  }
}

async function main() {
  console.log("Running Non-DI Pattern Benchmark...");
  const userService = new UserServiceWithoutDI();

  await Benchmark.measurePerformance("User Registration (Non-DI)", 10, () => {
    userService.registerUser(
      `User${Math.random()}`,
      `user${Math.random()}@example.com`
    );
  });

  const testUser = userService.registerUser("Test User", "test@example.com");
  await Benchmark.measurePerformance("User Retrieval (Non-DI)", 10, () => {
    userService.getUser(testUser.id);
  });
}

main().catch(console.error);
