type Vector = number[];
type FeatureVectors = Vector[];

class CosineSimilarity {
  /**
   * ベクトルのノルムを計算
   */
  private static calculateNorm(v: Vector): number {
    return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
  }

  /**
   * 2つのベクトル間のコサイン類似度を計算
   */
  private static calculateSimilarity(v1: Vector, v2: Vector): number {
    if (v1.length !== v2.length) {
      throw new Error("ベクトルの次元が一致しません");
    }

    const dotProduct = v1.reduce((sum, x, i) => sum + x * v2[i], 0);
    const norm1 = this.calculateNorm(v1);
    const norm2 = this.calculateNorm(v2);

    return dotProduct / (norm1 * norm2);
  }

  /**
   * 入力ベクトルと比較対象ベクトル群の間で最大のコサイン類似度を計算
   * @param inputVector 入力ベクトル
   * @param compareVectors 比較対象のベクトル群
   * @returns 最大の類似度
   */
  private static calculateMaxSimilarity(
    inputVector: Vector,
    compareVectors: FeatureVectors
  ): number {
    const similarities = compareVectors.map((compareVector) =>
      this.calculateSimilarity(inputVector, compareVector)
    );

    const maxSimilarity = Math.max(...similarities);
    const maxIndex = similarities.indexOf(maxSimilarity);

    console.log(`\n入力ベクトル [${inputVector}] の類似度計算結果:`);
    similarities.forEach((sim, index) => {
      console.log(
        `比較ベクトル${index + 1} [${compareVectors[index]}]: ${sim.toFixed(4)}`
      );
    });
    console.log(
      `最大類似度: ${maxSimilarity.toFixed(4)} (ベクトル${
        maxIndex + 1
      }と最も類似)`
    );

    return maxSimilarity;
  }

  /**
   * 複数の入力ベクトルと比較対象ベクトル群の間で類似度を計算し、平均を算出
   * @param inputVectors 入力ベクトル群
   * @param compareVectors 比較対象のベクトル群
   * @returns 平均類似度（入力ベクトル数で割った値）
   */
  static calculateAverageSimilarity(
    inputVectors: FeatureVectors,
    compareVectors: FeatureVectors
  ): number {
    // 各入力ベクトルについて、比較対象との最大類似度を計算
    const maxSimilarities = inputVectors.map((inputVector) =>
      this.calculateMaxSimilarity(inputVector, compareVectors)
    );

    // 合計を入力ベクトル数で割って平均を計算
    const averageSimilarity =
      maxSimilarities.reduce((sum, sim) => sum + sim, 0) / inputVectors.length;

    console.log("\n=== 最終結果 ===");
    console.log(
      `最大類似度の配列: [${maxSimilarities.map((s) => s.toFixed(4))}]`
    );
    console.log(
      `平均類似度 (${maxSimilarities
        .reduce((sum, sim) => sum + sim, 0)
        .toFixed(4)} / ${inputVectors.length} = ${averageSimilarity.toFixed(
        4
      )})`
    );

    return averageSimilarity;
  }
}

// 使用例
function calculateAvarage() {
  // 入力ベクトル（2つ）
  const inputVectors: FeatureVectors = [
    [1, 2, 3],
    [2, 3, 4],
  ];

  // 比較対象ベクトル（3つ）
  const compareVectors: FeatureVectors = [
    [2, 3, 4],
    [3, 4, 5],
    [1, 2, 3],
  ];

  console.log("=== 入力データ ===");
  console.log("入力ベクトル:");
  inputVectors.forEach((v, i) => console.log(`${i + 1}: [${v}]`));
  console.log("\n比較対象ベクトル:");
  compareVectors.forEach((v, i) => console.log(`${i + 1}: [${v}]`));

  try {
    const averageSimilarity = CosineSimilarity.calculateAverageSimilarity(
      inputVectors,
      compareVectors
    );

    // 結果の解釈
    console.log("\n結果の解釈:");
    if (averageSimilarity > 0.8) {
      console.log("非常に高い類似性 (0.8以上)");
    } else if (averageSimilarity > 0.5) {
      console.log("中程度の類似性 (0.5-0.8)");
    } else if (averageSimilarity > 0) {
      console.log("低い類似性 (0-0.5)");
    } else {
      console.log("類似性なし または 逆の関係");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("エラー:", error.message);
    }
  }
}

calculateAvarage();
