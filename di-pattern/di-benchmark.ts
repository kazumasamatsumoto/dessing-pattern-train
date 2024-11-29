// di-benchmark.ts
import { User, Benchmark } from "../common/common";

interface Logger {
  log(message: string): void;
}

interface UserRepository {
  findById(id: number): User;
  save(user: User): void;
}

interface EmailService {
  sendEmail(to: string, subject: string, body: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG]: ${message}`);
  }
}

class InMemoryUserRepository implements UserRepository {
  private users: Map<number, User> = new Map();

  findById(id: number): User {
    const user = this.users.get(id);
    if (!user) throw new Error(`User not found: ${id}`);
    return user;
  }

  save(user: User): void {
    this.users.set(user.id, user);
  }
}

class SimpleEmailService implements EmailService {
  sendEmail(to: string, subject: string, body: string): void {
    console.log(`Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
  }
}

class UserService {
  constructor(
    private logger: Logger,
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  registerUser(name: string, email: string): User {
    this.logger.log(`Registering new user: ${name}`);

    const id = Math.floor(Math.random() * 1000000);
    const user = new User(id, name, email);

    this.userRepository.save(user);

    this.emailService.sendEmail(
      email,
      "Welcome!",
      `Welcome to our service, ${name}!`
    );

    return user;
  }

  getUser(id: number): User {
    this.logger.log(`Fetching user: ${id}`);
    return this.userRepository.findById(id);
  }
}

async function main() {
  console.log("Running DI Pattern Benchmark...");
  const logger = new ConsoleLogger();
  const userRepository = new InMemoryUserRepository();
  const emailService = new SimpleEmailService();

  const userService = new UserService(logger, userRepository, emailService);

  await Benchmark.measurePerformance("User Registration (DI)", 10, () => {
    userService.registerUser(
      `User${Math.random()}`,
      `user${Math.random()}@example.com`
    );
  });

  const testUser = userService.registerUser("Test User", "test@example.com");
  await Benchmark.measurePerformance("User Retrieval (DI)", 10, () => {
    userService.getUser(testUser.id);
  });
}

main().catch(console.error);
