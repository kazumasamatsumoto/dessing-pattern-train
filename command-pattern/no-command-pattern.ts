// no-command-pattern.ts
import { Benchmark } from "../common/common";

class SimpleDocument {
  private content: string = "";
  private history: string[] = [];

  addText(text: string): void {
    this.history.push(this.content);
    this.content += text;
  }

  deleteText(startIndex: number, length: number): void {
    this.history.push(this.content);
    this.content =
      this.content.substring(0, startIndex) +
      this.content.substring(startIndex + length);
  }

  undo(): void {
    const previousContent = this.history.pop();
    if (previousContent !== undefined) {
      this.content = previousContent;
    }
  }

  getContent(): string {
    return this.content;
  }
}

async function main() {
  console.log("Running Non-Command Pattern Benchmark...");

  const document = new SimpleDocument();

  // テキスト追加のベンチマーク
  await Benchmark.measurePerformance(
    "Add Text (Non-Command Pattern)",
    100,
    () => {
      document.addText("Hello, World! ");
    }
  );

  // テキスト削除のベンチマーク
  await Benchmark.measurePerformance(
    "Delete Text (Non-Command Pattern)",
    100,
    () => {
      document.deleteText(0, 5);
    }
  );

  // Undoのベンチマーク
  await Benchmark.measurePerformance(
    "Undo Operations (Non-Command Pattern)",
    100,
    () => {
      document.undo();
    }
  );
}

main().catch(console.error);
