// 計算関連の関数オーバーロード
function calculate(x: number, y: number): number;
function calculate(x: number, y: number, z: number): number;
function calculate(x: string, y: string): string;
function calculate(
  x: number | string,
  y: number | string,
  z?: number
): number | string {
  if (typeof x === "string" && typeof y === "string") {
    return x.concat(y);
  }
  if (typeof x === "number" && typeof y === "number") {
    if (z !== undefined) {
      return x + y + z;
    }
    return x + y;
  }
  throw new Error("Invalid arguments");
}

// 配列処理の関数オーバーロード
function processArray(arr: number[]): number;
function processArray(arr: string[]): string;
function processArray(arr: boolean[]): boolean;
function processArray(arr: any[]): any {
  if (arr.length === 0) {
    throw new Error("Array is empty");
  }

  if (typeof arr[0] === "number") {
    return arr.reduce((sum, current) => sum + current, 0);
  }
  if (typeof arr[0] === "string") {
    return arr.join("");
  }
  if (typeof arr[0] === "boolean") {
    return arr.every((value) => value === true);
  }
  throw new Error("Unsupported array type");
}

// フォーマット関数のオーバーロード
function format(value: string): string;
function format(value: number, currency?: string): string;
function format(value: Date): string;
function format(value: string | number | Date, currency?: string): string {
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  if (typeof value === "number") {
    if (currency) {
      return `${currency}${value.toFixed(2)}`;
    }
    return value.toFixed(2);
  }
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  throw new Error("Invalid format argument");
}

// 使用例
try {
  // calculate関数の使用例
  console.log("数値の計算（2つの引数）:", calculate(10, 20)); // 30
  console.log("数値の計算（3つの引数）:", calculate(10, 20, 30)); // 60
  console.log("文字列の結合:", calculate("Hello ", "World")); // "Hello World"

  // processArray関数の使用例
  console.log("数値配列の処理:", processArray([1, 2, 3, 4, 5])); // 15
  console.log("文字列配列の処理:", processArray(["Hello", " ", "World"])); // "Hello World"
  console.log("ブール配列の処理:", processArray([true, true, true])); // true
  console.log("ブール配列の処理:", processArray([true, false, true])); // false

  // format関数の使用例
  console.log("文字列のフォーマット:", format("  HeLLo WoRLD  ")); // "hello world"
  console.log("数値のフォーマット:", format(123.456)); // "123.46"
  console.log("通貨のフォーマット:", format(123.456, "$")); // "$123.46"
  console.log("日付のフォーマット:", format(new Date("2024-01-15"))); // "2024-01-15"
} catch (error) {
  if (error instanceof Error) {
    console.error("エラー:", error.message);
  } else {
    console.error("予期せぬエラー:", error);
  }
}

// ジェネリック型を使用したオーバーロード関数の例
function convert<T extends number | string, U extends boolean>(
  value: T,
  toArray: U
): U extends true ? T[] : T;
function convert<T extends number | string, U extends boolean>(
  value: T,
  toArray: U
): any {
  if (toArray) {
    return [value];
  }
  return value;
}

// ジェネリック関数の使用例
console.log("数値を配列に変換:", convert(123, true)); // [123]
console.log("文字列をそのまま返す:", convert("hello", false)); // "hello"
