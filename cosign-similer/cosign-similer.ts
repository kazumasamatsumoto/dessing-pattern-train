class CosineSimilarity2 {
  /**
   * ベクトルのノルム（大きさ）を計算する
   * 計算式: √(a₁² + a₂² + ... + aₙ²)
   * 例: ベクトル[3, 4]のノルム = √(3² + 4²) = √(9 + 16) = √25 = 5
   */
  private static calculateNorm(v: number[]): number {
    // 1. 各要素を2乗
    const squares = v.map((x) => x * x);

    // 2. 2乗した値の合計を計算
    const sumOfSquares = squares.reduce((sum, sq) => sum + sq, 0);

    // 3. 合計値の平方根を計算
    const norm = Math.sqrt(sumOfSquares);

    // 計算過程を表示
    console.log("\nノルムの計算過程:");
    console.log("1. 元のベクトル:", v);
    console.log("2. 各要素の2乗:", squares);
    console.log("3. 2乗の合計:", sumOfSquares);
    console.log("4. 平方根（ノルム）:", norm);

    return norm;
  }

  /**
   * 2つのベクトルの内積を計算する
   * 計算式: a₁・b₁ + a₂・b₂ + ... + aₙ・bₙ
   */
  private static calculateDotProduct(v1: number[], v2: number[]): number {
    const products = v1.map((x, i) => x * v2[i]);
    const dotProduct = products.reduce((sum, p) => sum + p, 0);

    console.log("\n内積の計算過程:");
    console.log("1. 各要素の積:", products);
    console.log("2. 積の合計（内積）:", dotProduct);

    return dotProduct;
  }

  /**
   * コサイン類似度を計算する
   * 計算式: cos(θ) = (v1・v2) / (||v1|| * ||v2||)
   */
  static calculate(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) {
      throw new Error("ベクトルの長さが一致しません");
    }

    console.log("===== コサイン類似度の計算開始 =====");

    // 1. 内積を計算
    const dotProduct = this.calculateDotProduct(v1, v2);

    // 2. 各ベクトルのノルムを計算
    console.log("\n--- ベクトル1のノルム計算 ---");
    const norm1 = this.calculateNorm(v1);
    console.log("\n--- ベクトル2のノルム計算 ---");
    const norm2 = this.calculateNorm(v2);

    // 3. コサイン類似度を計算
    const similarity = dotProduct / (norm1 * norm2);

    console.log("\n===== 最終計算 =====");
    console.log(
      `コサイン類似度 = ${dotProduct} / (${norm1} * ${norm2}) = ${similarity}`
    );

    return similarity;
  }
}

// テスト用の簡単な例
function main() {
  // 小さな値で試してみる
  const v1 = [3, 4, 5]; // 簡単な値で例示
  const v2 = [1, 2, 3];

  console.log("ベクトル1:", v1);
  console.log("ベクトル2:", v2);

  const similarity = CosineSimilarity2.calculate(v1, v2);

  console.log("\n結果の解釈:");
  if (similarity > 0.8) {
    console.log("非常に似ている (0.8以上)");
  } else if (similarity > 0.5) {
    console.log("やや似ている (0.5-0.8)");
  } else if (similarity > 0) {
    console.log("あまり似ていない (0-0.5)");
  } else if (similarity === 0) {
    console.log("無関係 (0)");
  } else {
    console.log("逆の関係 (負の値)");
  }
}

main();
