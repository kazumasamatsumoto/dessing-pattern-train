20:00 LT1 @ken7253 「オーバーロード関数について(仮)」

オーバーロード関数

```ts
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
```

20:06 LT2 ＠fujitani_sora 「考え中」

20:12 LT3 ＠tsukahara_w 「Prisma TypedSQL のススメ (仮)」

Prisma の queryRaw について説明させていただきます。

queryRaw は Prisma で生の SQL クエリを実行するための機能です。主な特徴と使用方法は以下の通りです：

```typescript
// 基本的な使い方
const result = await prisma.$queryRaw`SELECT * FROM User WHERE age > 18`;

// パラメータ化されたクエリ
const minAge = 18;
const result = await prisma.$queryRaw`
  SELECT * FROM User
  WHERE age > ${minAge}
`;
```

queryRaw の主な特徴：

1. 型の安全性：

- Prisma Client は返される結果の型を推論できます
- 明示的に型を指定することも可能です

```typescript
const result = await prisma.$queryRaw<User[]>`
  SELECT * FROM User WHERE age > 18
`;
```

2. SQL インジェクション対策：

- テンプレートリテラルを使用することで、自動的にパラメータがエスケープされます
- 安全なクエリの実行が可能です

3. 使用シーンの例：

- 複雑な SQL クエリを実行する場合
- パフォーマンスの最適化が必要な場合
- Prisma の API でカバーできない特殊なケース

注意点：

- データベースに依存した SQL を書くことになるため、データベースの移行が難しくなる可能性があります
- できるだけ Prisma の標準的な API を使用し、必要な場合のみ queryRaw を使用することをお勧めします

さらに詳しい使用例や特定のユースケースについて知りたい場合は、お気軽にお申し付けください。

20:18 LT4 @otsuky 「noUncheckedIndexedAccess」

noUncheckedIndexedAccess は TypeScript のコンパイラオプションの 1 つで、配列やオブジェクトのインデックスアクセスの型安全性を高めるための設定です。

主な特徴を説明します：

```typescript
// noUncheckedIndexedAccess: false（デフォルト）の場合
const arr = [1, 2, 3];
const item = arr[0]; // number型

// noUncheckedIndexedAccess: trueの場合
const arr = [1, 2, 3];
const item = arr[0]; // number | undefined型
```

このオプションを有効にする利点：

1. より厳密な型チェック：

```typescript
// より安全なコード記述が強制される
const arr = [1, 2, 3];
const item = arr[0];

// コンパイルエラーを防ぐため、undefined チェックが必要
if (item !== undefined) {
  console.log(item + 1); // OK
}
```

2. オブジェクトのプロパティアクセスでも同様：

```typescript
const obj = { a: 1, b: 2 };
const value = obj["a"]; // number | undefined型
```

3. 一般的な対処パターン：

```typescript
// 非null アサーション演算子を使用
const item = arr[0]!;

// デフォルト値を設定
const item = arr[0] ?? 0;

// 条件分岐で処理
if (typeof arr[0] === "number") {
  const item = arr[0];
}
```

tsconfig.json での設定方法：

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
```

このオプションを使用するメリット：

- 実行時エラーを防ぐ
- より堅牢なコードを書くことができる
- undefined チェックの明示的な記述が強制される

デメリット：

- 型チェックが厳密になるため、コードの記述量が増える
- 既存のコードベースに導入する場合、多くの修正が必要になる可能性がある

このオプションは、型安全性を重視するプロジェクトで特に有用です。必要に応じて、プロジェクトの要件に合わせて検討することをお勧めします。

20:24 LT5 ＠otokomigakimasu 「helmet を被って Express のセキュリティを強化する」

Helmet は Express アプリケーションのセキュリティを強化するための人気なミドルウェアです。HTTP ヘッダーを適切に設定することで、一般的なウェブの脆弱性からアプリケーションを保護します。

基本的な使い方：

```typescript
import express from "express";
import helmet from "helmet";

const app = express();
app.use(helmet()); // デフォルトの保護を有効化
```

Helmet が提供する主な保護機能：

1. XSS（クロスサイトスクリプティング）対策：

```typescript
// Content-Security-Policy ヘッダーの設定
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  })
);
```

2. クリックジャッキング対策：

```typescript
// X-Frame-Options ヘッダーの設定
app.use(helmet.frameguard({ action: "deny" }));
```

3. MIME タイプスニッフィング対策：

```typescript
// X-Content-Type-Options ヘッダーの設定
app.use(helmet.noSniff());
```

4. その他の主要な保護機能：

```typescript
// 個別の機能を設定する例
app.use(
  helmet({
    // DNS Prefetch Control を無効化
    dnsPrefetchControl: false,

    // HSTS を設定
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },

    // IE8の XSS フィルターを有効化
    ieNoOpen: true,

    // キャッシュ制御
    noCache: true,
  })
);
```

Helmet が設定する主な HTTP ヘッダー：

1. Content-Security-Policy

- スクリプト、スタイル、画像などのリソースの読み込み元を制限

2. X-Frame-Options

- iframe でのページの表示を制御

3. Strict-Transport-Security

- HTTPS の使用を強制

4. X-Content-Type-Options

- MIME タイプのスニッフィングを防止

5. X-XSS-Protection

- ブラウザの XSS フィルターを有効化

導入時の注意点：

1. デフォルト設定の確認：

```typescript
// 必要に応じて個別の機能を無効化
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
```

2. 開発環境での設定：

```typescript
if (process.env.NODE_ENV === "development") {
  // 開発環境用の緩和された設定
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
} else {
  // 本番環境用の厳密な設定
  app.use(helmet());
}
```

Helmet を使用することで、多くの一般的なセキュリティリスクから保護することができます。ただし、これはセキュリティ対策の一部であり、総合的なセキュリティ戦略の一環として考える必要があります。

はい、"Helmet"（ヘルメット）は実際に「ヘルメット」という防具からインスピレーションを得て名付けられました。

この命名には以下のような意味が込められています：

1. 防御の象徴

- ヘルメットが頭部を保護するように、このミドルウェアは Web アプリケーションを保護します
- セキュリティの「防具」としての役割を果たすというメタファー

2. わかりやすさ

- セキュリティミドルウェアの役割を直感的に理解しやすい名前
- "Put on a helmet to protect your Express app"（Express アプリにヘルメットを被せて保護する）という説明がよく使われます

3. 覚えやすさ

- 技術的な専門用語ではなく、日常的な物の名前を使うことで、記憶に残りやすい
- セキュリティ対策の重要性を印象付けやすい

このように、「ヘルメット」という身近な防具の名前を使うことで、Web アプリケーションのセキュリティ保護という役割を分かりやすく表現しています。

Strict-Transport-Security（HSTS）は、Web サイトを HTTPS で強制的にアクセスさせるための HTTP セキュリティヘッダーです。このヘッダーは、ブラウザに対してそのサイトへのすべての通信を HTTPS で行うように指示します。

主な特徴と使用例を説明します：

1. 基本的な設定：

```typescript
// Express + Helmetでの設定例
app.use(
  helmet.hsts({
    maxAge: 31536000, // 有効期間（秒）: この例では1年
    includeSubDomains: true, // サブドメインにも適用
    preload: true, // ブラウザのHSTSプリロードリストに登録可能に
  })
);
```

2. 生成されるヘッダー：

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

主な保護効果：

1. SSL ストリッピング攻撃の防止

```plaintext
通常の通信：
ユーザー → HTTP → リダイレクト → HTTPS

HSTS有効時：
ユーザー → 強制的にHTTPS
```

2. 中間者攻撃の防止

- HTTPS へのダウングレード攻撃を防ぐ
- 安全でない通信を自動的にブロック

注意点：

1. 初回アクセス時の考慮

```typescript
// 初回アクセスは保護されない可能性があるため
// プリロードリストへの登録を検討する
app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  })
);
```

2. 開発環境での設定

```typescript
// 開発環境ではHSTSを無効にすることも
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet.hsts({
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    })
  );
}
```

3. プリロードリストについて

- プリロードリストに登録すると、初回アクセス時から保護が有効
- 登録には https://hstspreload.org/ で申請が必要
- 登録解除には時間がかかる可能性がある

4. サブドメインの考慮

```typescript
// すべてのサブドメインでHTTPS対応が必要な場合のみ
// includeSubDomainsを有効にする
app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true, // すべてのサブドメインがHTTPS対応している場合のみtrue
  })
);
```

実装時のベストプラクティス：

1. 適切な max-age の設定

```typescript
// 推奨は1年（31536000秒）
app.use(
  helmet.hsts({
    maxAge: 31536000, // 本番環境での推奨値
  })
);
```

2. 段階的な導入

```typescript
// まずは短いmax-ageで試験導入
app.use(
  helmet.hsts({
    maxAge: 300, // 5分間
    includeSubDomains: false,
    preload: false,
  })
);
```

3. 監視とログ記録

```typescript
// HSTSによるリダイレクトを監視
app.use((req, res, next) => {
  if (req.secure) {
    console.log("HTTPS接続: ", req.url);
  }
  next();
});
```

このように、HSTS は重要なセキュリティ機能ですが、慎重な導入と設定が必要です。特に本番環境での導入時は、すべての要件と影響を十分に考慮することが重要です。
