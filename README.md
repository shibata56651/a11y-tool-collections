# yours

## 案件について

SCSS、HTML、TypeScriptのモジュール化された開発環境プロジェクトです。

### 主な特徴
- **SCSS**: コンポーネント別にモジュール化（ボタン、テキスト、見出し、フォーム、ヘッダー）
- **TypeScript**: 機能別にモジュール化（モーダル、フォームバリデーター、ヘッダーナビゲーション、ユーティリティ）
- **SSI対応**: Server Side Includesによるヘッダー・フッターのインクルード対応
- **リアルタイム監視**: ファイル保存時に自動コンパイル・圧縮
- **コード品質**: Biome（TypeScript）とStylelint（SCSS）による静的解析
- **VSCode統合**: エディタ上でリアルタイムエラー表示・自動修正
- **レスポンシブ対応**: PC/SP対応のドロップダウンナビゲーション

## 案件に入る際に必要な実行コマンド等の説明

### 1. 依存関係のインストール
```bash
npm install
```
プロジェクトに必要な全てのパッケージをインストールします。

### 2. プロジェクト環境のセットアップ
```bash
npm run setup
```
このコマンドを実行することで：
- `.env.sample`から`.env`ファイルが作成されます
- 案件固有の設定（開発サーバー用ディレクトリ名など）を管理できます

**セットアップ後に行うこと：**
1. `.env`ファイルを開く
2. `DEMO_DIRECTORY_NAME=tmp-yours`を案件名に変更（例：`DEMO_DIRECTORY_NAME=tmp-client-project`）
3. この設定により、demo環境用のビルドで絶対パス（`/page/`）が`/案件ディレクトリ名/page/`に自動変換されます

### 3. VSCode拡張機能のインストール（推奨）
以下の拡張機能をインストールしてください：
- `biomejs.biome` - TypeScript/JavaScriptのリンター・フォーマッター
- `stylelint.vscode-stylelint` - SCSS/CSSのリンター・フォーマッター

### 4. 開発開始
```bash
npm run dev
```
開発モードを開始します（ファイル監視・自動コンパイル・SSI対応開発サーバー）。

## 使用可能なコマンドと説明

### 開発・ビルド関連

| コマンド | 説明 |
|----------|------|
| `npm run setup` | プロジェクト初期セットアップ（.envファイル作成） |
| `npm run dev` | 開発モード開始（SCSS・TypeScript監視・SSI対応サーバー） |
| `npm run serve` | SSI対応開発サーバーの単体起動 |
| `npm run build` | 本番用ビルド（SCSS・TypeScriptの圧縮コンパイル） |
| `npm run build:demo` | demo環境用ビルド（.envのディレクトリ名でパス変換） |
| `npm run build:production` | 本番環境用ビルド |
| `npm run watch:scss` | SCSSファイルの監視・自動コンパイル |
| `npm run watch:ts` | TypeScriptファイルの監視・自動コンパイル |
| `npm run build:scss` | SCSSを圧縮CSSにコンパイル |
| `npm run build:ts` | TypeScriptをJavaScriptにコンパイル |

### コード品質・リンター関連

#### TypeScript（Biome）
| コマンド | 説明 |
|----------|------|
| `npm run lint` | TypeScript/JavaScriptファイルのリント実行 |
| `npm run lint:fix` | TypeScript/JavaScriptファイルのリント自動修正 |
| `npm run format` | TypeScript/JavaScriptファイルのフォーマット確認 |
| `npm run format:write` | TypeScript/JavaScriptファイルのフォーマット適用 |
| `npm run check` | TypeScript/JavaScriptファイルの総合チェック |
| `npm run check:fix` | TypeScript/JavaScriptファイルの総合チェック・自動修正 |

#### SCSS（Stylelint）
| コマンド | 説明 |
|----------|------|
| `npm run lint:scss` | SCSSファイルのリント実行 |
| `npm run lint:scss:fix` | SCSSファイルのリント自動修正 |

#### 全体
| コマンド | 説明 |
|----------|------|
| `npm run lint:all` | TypeScript + SCSS 全体リント実行 |
| `npm run lint:all:fix` | TypeScript + SCSS 全体リント自動修正 |

## インストールしたパッケージとその説明

### 開発・ビルドツール

| パッケージ名 | バージョン | 用途 |
|------------|------------|------|
| `sass` | ^1.70.0 | SCSSをCSSにコンパイルするためのコンパイラ |
| `typescript` | ^5.3.3 | TypeScriptをJavaScriptにコンパイルするためのコンパイラ |
| `concurrently` | ^8.2.2 | 複数のnpmスクリプトを並行実行するためのツール |
| `browser-sync` | ^3.0.4 | ライブリロード機能付きの開発サーバー |
| `dotenv` | ^17.2.2 | .envファイルから環境変数を読み込むライブラリ |

### コード品質・静的解析

#### TypeScript/JavaScript関連（Biome）
| パッケージ名 | バージョン | 用途 |
|------------|------------|------|
| `@biomejs/biome` | ^2.1.2 | TypeScript/JavaScriptの高速リンター・フォーマッター。ESLint + Prettierの代替 |

#### SCSS/CSS関連（Stylelint）
| パッケージ名 | バージョン | 用途 |
|------------|------------|------|
| `stylelint` | ^16.22.0 | SCSS/CSSファイルの静的解析・リンター |
| `stylelint-config-standard-scss` | ^15.0.1 | SCSS用の標準的なスタイルガイド設定 |
| `stylelint-scss` | ^6.12.1 | Stylelint用のSCSS構文サポートプラグイン |

## ディレクトリ構造

```
yours/
├── src/
│   ├── scss/
│   │   ├── base/           # ベーススタイル
│   │   │   ├── _reset.scss
│   │   │   └── _variables.scss
│   │   ├── components/     # コンポーネント別スタイル
│   │   │   ├── _button.scss
│   │   │   ├── _text.scss
│   │   │   ├── _heading.scss
│   │   │   └── _form.scss
│   │   └── main.scss       # メインSCSSファイル
│   └── ts/
│       ├── modules/        # 機能別モジュール
│       │   ├── modal.ts
│       │   └── form-validator.ts
│       ├── utils/          # ユーティリティ
│       │   ├── dom.ts
│       │   └── events.ts
│       └── main.ts         # メインTypeScriptファイル
├── dist/                   # コンパイル済みファイル
│   ├── css/
│   └── js/
├── demo/                   # demo環境用ビルド出力（開発サーバーアップロード用）
│   ├── assets/             # 画像等のアセットファイル
│   ├── dist/               # コンパイル済みCSS・JS
│   ├── *.html              # パス変換済みHTMLファイル
│   └── include/            # SSI用インクルードファイル
├── scripts/                # ビルドスクリプト
│   ├── build-production.js
│   └── path-config.js
├── .env                    # 環境設定（gitignore対象）
├── .env.sample             # 環境設定テンプレート
├── index.html              # サンプルHTMLファイル
├── biome.json             # Biome設定ファイル
├── .stylelintrc.json      # Stylelint設定ファイル
└── tsconfig.json          # TypeScript設定ファイル
```

## demo環境向けビルド機能

このプロジェクトでは、開発サーバー上でのテスト用にパス変換機能を提供しています。

### 機能概要
- **ディレクトリ自動変換**: HTMLファイル内の絶対パス（`/page/`）を開発サーバー用パス（`/案件ディレクトリ名/page/`）に自動変換
- **.env管理**: 案件ごとに異なるディレクトリ名を`.env`ファイルで簡単管理
- **ローカル・本番との分離**: ローカル開発では通常のパス、demo環境では変換されたパスを使用

### 使用方法
1. `npm run setup`で`.env`ファイルを作成
2. `.env`の`DEMO_DIRECTORY_NAME`を案件に応じて編集
3. `npm run build:demo`で`demo`ディレクトリに変換済みファイルを出力

### 開発サーバーへのアップロード
`npm run build:demo`実行後、**`demo`ディレクトリの中身**をそのまま開発サーバーにアップロードしてください。

- ✅ アップロード対象: `demo`ディレクトリの**中身**（HTMLファイル、assetsフォルダ、distフォルダなど）
- ❌ `demo`ディレクトリ自体をアップロードするのではありません

**アップロード後の確認方法:**
- 開発サーバーのURL: `https://example.com/案件ディレクトリ名/`でアクセス
- 全てのリンクが正しく動作することを確認

### 変換例
```
元のパス: href="/company/"
↓
変換後: href="/tmp-yourproject/company/"
（.envでDEMO_DIRECTORY_NAME=tmp-yourprojectと設定した場合）
```

## VSCodeでの開発体験

- **自動フォーマット**: ファイル保存時に自動的にコードをフォーマット
- **リアルタイムエラー表示**: コード入力中にエラーや警告をリアルタイム表示
- **自動修正**: 修正可能な問題を自動的に修正
- **型チェック**: TypeScriptの型安全性をエディタ上で確認