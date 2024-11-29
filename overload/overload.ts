class Calculator {
  // オーバーロード宣言
  add(a: number, b: number): number;
  add(a: string, b: string): string;
  add(a: number, b: number, c: number): number;

  // 実装
  add(a: number | string, b: number | string, c?: number): number | string {
    // 文字列の場合
    if (typeof a === "string" && typeof b === "string") {
      return a.concat(b);
    }

    // 数値3つの場合
    if (
      typeof a === "number" &&
      typeof b === "number" &&
      typeof c === "number"
    ) {
      return a + b + c;
    }

    // 数値2つの場合
    if (typeof a === "number" && typeof b === "number") {
      return a + b;
    }

    throw new Error("Invalid arguments");
  }
}

// 使用例
const calc = new Calculator();
console.log(calc.add(1, 2)); // 3
console.log(calc.add("Hello ", "World")); // "Hello World"
console.log(calc.add(1, 2, 3)); // 6
