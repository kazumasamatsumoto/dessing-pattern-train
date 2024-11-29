// command-pattern.ts
import { Benchmark } from "../common/common";

// コマンドのインターフェース
interface Command {
  execute(): void;
  undo(): void;
}

// 文書を表すクラス
class Document {
  private content: string = "";

  getContent(): string {
    return this.content;
  }

  setContent(content: string): void {
    this.content = content;
  }
}

// テキスト追加コマンド
class AddTextCommand implements Command {
  private previousContent: string;

  constructor(private document: Document, private textToAdd: string) {
    this.previousContent = document.getContent();
  }

  execute(): void {
    const currentContent = this.document.getContent();
    this.document.setContent(currentContent + this.textToAdd);
  }

  undo(): void {
    this.document.setContent(this.previousContent);
  }
}

// テキスト削除コマンド
class DeleteTextCommand implements Command {
  private previousContent: string;

  constructor(
    private document: Document,
    private startIndex: number,
    private length: number
  ) {
    this.previousContent = document.getContent();
  }

  execute(): void {
    const currentContent = this.document.getContent();
    const newContent =
      currentContent.substring(0, this.startIndex) +
      currentContent.substring(this.startIndex + this.length);
    this.document.setContent(newContent);
  }

  undo(): void {
    this.document.setContent(this.previousContent);
  }
}

// コマンドの実行を管理するクラス
class CommandInvoker {
  private commandHistory: Command[] = [];

  executeCommand(command: Command): void {
    command.execute();
    this.commandHistory.push(command);
  }

  undo(): void {
    const command = this.commandHistory.pop();
    if (command) {
      command.undo();
    }
  }
}

async function main() {
  console.log("Running Command Pattern Benchmark...");

  const document = new Document();
  const invoker = new CommandInvoker();

  // テキスト追加のベンチマーク
  await Benchmark.measurePerformance("Add Text (Command Pattern)", 100, () => {
    const command = new AddTextCommand(document, "Hello, World! ");
    invoker.executeCommand(command);
  });

  // テキスト削除のベンチマーク
  await Benchmark.measurePerformance(
    "Delete Text (Command Pattern)",
    100,
    () => {
      const command = new DeleteTextCommand(document, 0, 5);
      invoker.executeCommand(command);
    }
  );

  // Undoのベンチマーク
  await Benchmark.measurePerformance(
    "Undo Operations (Command Pattern)",
    100,
    () => {
      invoker.undo();
    }
  );
}

main().catch(console.error);
