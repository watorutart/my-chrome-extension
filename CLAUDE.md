# CLAUDE.md

このファイルはClaude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

ドメイン別にタブを自動的にグループ化するChrome拡張機能。TypeScript で構築され、Vitest でテストし、esbuild でコンパイルします。

## 開発コマンド

### ビルドと開発
- `pnpm dev` - ウォッチモード付き開発ビルド
- `pnpm build` - 本番ビルド（圧縮あり）
- `pnpm copy:files` - manifest と icons を dist/ にコピー

### テスト
- `pnpm test` - Vitest で全テストを実行
- `pnpm test:ui` - UI インターフェースでテストを実行
- `pnpm test:coverage` - テストカバレッジレポートを生成

### コード品質
- `pnpm lint` - TypeScript ファイルをリント
- `pnpm lint:fix` - リントエラーを自動修正
- `pnpm type-check` - TypeScript 型チェック

## アーキテクチャ

### コア構造
- `src/background.ts` - メインサービスワーカーエントリーポイント、Chrome API イベントリスナーを設定
- `src/handlers/` - タブライフサイクル（作成、更新、移動）のイベントハンドラー
- `src/utils/` - ドメイン抽出、グループ管理、エラーハンドリングのユーティリティモジュール
- `src/types.ts` - タブとグループ管理のTypeScriptインターフェース

### 主要コンポーネント
- **イベントハンドラー**: `src/handlers/` 内の異なるタブイベント用のモジュラーハンドラー
- **グループ管理**: `src/utils/group.ts` が自動グループ作成とタブ割り当てを処理
- **ドメイン抽出**: `src/utils/domain.ts` がURLからドメインを抽出・検証
- **エラーハンドリング**: `src/utils/error-handler.ts` がChrome APIエラー管理を提供
- **URL検証**: `src/utils/url-validation.ts` が処理前にタブURLを検証

### テスト戦略
- テストはソースファイルと同じディレクトリの `__tests__/` に配置
- Chrome API モック用にjsdom環境でVitestを使用
- `src/__tests__/integration*.test.ts` に統合テスト
- カバレッジはテストファイルとdist/を除外するよう設定

### Chrome拡張機能固有事項
- Manifest V3 サービスワーカーアーキテクチャ
- `tabs` と `tabGroups` 権限が必要
- 自動生成グループは一貫した命名: `[Auto]` プレフィックス
- ドメインハッシュに基づく一貫した色割り当て

## 重要な注意点
- Chrome API操作前には必ずタブ/グループの状態を検証する
- Chrome API呼び出しには `src/utils/error-handler.ts` のエラーハンドラーを使用
- `src/types.ts` で定義されたTypeScriptインターフェースに従う
- Chrome API相互作用は適切なモックでテストする

# Claude Code Configuration

## Commit Message Rules

Always use Conventional Commits format following VSCode Conventional Commits extension:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

### Required Types:
- `feat`: 新機能追加 (MINOR in Semantic Versioning)
- `fix`: バグ修正 (PATCH in Semantic Versioning)

### Additional Common Types:
- `build`: ビルドシステムや外部依存関係の変更
- `chore`: その他の技術的作業（特定の機能やユーザーストーリーに関係しない）
- `ci`: CI設定やスクリプトの変更
- `docs`: ドキュメントのみの変更
- `perf`: パフォーマンス改善
- `refactor`: バグ修正も新機能追加もしないコード変更
- `revert`: 以前のコミットを取り消す
- `style`: コードの意味に影響しない変更（空白、フォーマット、コンマなど）
- `test`: テストの追加や修正

### Scope (Optional):
- コンテキスト情報を提供する任意の項目
- 括弧内に記載: `feat(parser): 配列解析機能を追加`

### Breaking Changes:
- `!` を型の後に追加: `feat!: 重大な変更を含む新機能`
- またはフッターに `BREAKING CHANGE:` を記載

### Body and Footer:
- Body: 変更の詳細な説明（任意）
- Footer: 関連するissueの参照やBREAKING CHANGEの説明（任意）

### Language Rule:
- **コミットメッセージは必ず日本語で記述する**
- Type（feat, fix等）は英語のまま使用
- Description, Body, Footerは日本語で記述

### Examples:
```
feat: 新しい認証システムを追加
fix: ログイン検証バグを修正
feat(parser): 配列解析機能を追加
fix(ui): ボタンの配置問題を修正
feat!: 商品出荷時に顧客にメールを送信
docs: インストール手順を更新
test: ペットインタラクションの包括的なテストスイートを追加
style: コードフォーマットを改善
perf: 画像読み込み速度を最適化
chore: 開発環境の設定を更新
```

### Emoji/Gitmoji Integration:
VSCode Conventional Commits拡張機能は絵文字サポートあり（`conventionalCommits.gitmoji: true`）
参考: https://gitmoji.dev/

#### 主要なGitmoji一覧（Conventional Commitタイプ別）:

**新機能・修正**
- ✨ `:sparkles:` - 新機能追加 (`feat`)
- 🐛 `:bug:` - バグ修正 (`fix`)
- 🚑️ `:ambulance:` - 重要なホットフィックス (`fix`)
- ⚡️ `:zap:` - パフォーマンス改善 (`perf`)
- 🔥 `:fire:` - コードやファイルの削除

**コード品質・構造**
- 🎨 `:art:` - コード構造・フォーマット改善 (`style`)
- ♻️ `:recycle:` - コードリファクタリング (`refactor`)
- 💚 `:green_heart:` - CI修正 (`ci`)
- 🔧 `:wrench:` - 設定ファイル変更 (`chore`)
- 🔨 `:hammer:` - 開発スクリプト変更 (`chore`)

**テスト・品質保証**
- ✅ `:white_check_mark:` - テスト追加・修正 (`test`)
- 🚨 `:rotating_light:` - Linterエラー修正 (`style`)
- 🤡 `:clown_face:` - モックファイル (`test`)
- 💥 `:boom:` - 破壊的変更 (`feat!` or `fix!`)

**ドキュメント・情報**
- 📝 `:memo:` - ドキュメント追加・更新 (`docs`)
- 💡 `:bulb:` - コメント追加・更新 (`docs`)
- 💬 `:speech_balloon:` - テキスト・リテラル更新 (`docs`)
- 📄 `:page_facing_up:` - ライセンス追加・更新 (`docs`)

**依存関係・環境**
- ⬆️ `:arrow_up:` - 依存関係のアップグレード (`build`)
- ⬇️ `:arrow_down:` - 依存関係のダウングレード (`build`)
- 📦 `:package:` - パッケージ・依存関係更新 (`build`)
- 🧱 `:bricks:` - インフラ関連変更 (`build`)

**デプロイ・リリース**
- 🚀 `:rocket:` - デプロイ関連 (`chore`)
- 🔖 `:bookmark:` - リリース・バージョンタグ (`chore`)
- 🎉 `:tada:` - プロジェクト開始 (`chore`)
- 🏗️ `:building_construction:` - アーキテクチャ変更 (`refactor`)

**UI・スタイル**
- 💄 `:lipstick:` - UI・スタイルファイルの追加・更新 (`style`)
- 🍱 `:bento:` - アセット追加・更新 (`style`)
- 📱 `:iphone:` - レスポンシブデザイン (`style`)
- ♿️ `:wheelchair:` - アクセシビリティ改善 (`feat`)

**セキュリティ・修正**
- 🔒️ `:lock:` - セキュリティ関連の修正 (`fix`)
- 🔐 `:closed_lock_with_key:` - 秘密・鍵追加 (`chore`)
- 🚨 `:rotating_light:` - セキュリティ脆弱性修正 (`fix`)

**プラットフォーム・環境**
- 🐧 `:penguin:` - Linux関連修正 (`fix`)
- 🍎 `:apple:` - macOS関連修正 (`fix`)
- 🏁 `:checkered_flag:` - Windows関連修正 (`fix`)
- 🐳 `:whale:` - Docker関連 (`chore`)
- ☸️ `:wheel_of_dharma:` - Kubernetes関連 (`chore`)

**その他**
- ⏪️ `:rewind:` - 変更の取り消し (`revert`)
- 🔀 `:twisted_rightwards_arrows:` - ブランチマージ (`chore`)
- 👷 `:construction_worker:` - ビルドシステム変更 (`build`)
- 🙈 `:see_no_evil:` - .gitignore追加・更新 (`chore`)
- 🎯 `:dart:` - メトリクス・アナリティクス (`feat`)
- 🥅 `:goal_net:` - エラーキャッチ (`fix`)
- 🧐 `:monocle_face:` - データ探索・検査 (`test`)
- ⚗️ `:alembic:` - 実験的機能 (`feat`)
- 🔍️ `:mag:` - SEO改善 (`feat`)
- 🌐 `:globe_with_meridians:` - 国際化・ローカライゼーション (`feat`)
- 🚩 `:triangular_flag_on_post:` - 機能フラグ追加・更新・削除 (`feat`)
- 🥽 `:goggles:` - 開発者体験改善 (`chore`)
- 🩹 `:adhesive_bandage:` - 非重要な修正 (`fix`)
- 🧑‍💻 `:technologist:` - 開発者体験改善 (`chore`)

### VSCode Extension Configuration:
- `conventionalCommits.gitmoji`: 絵文字を含めるオプション（デフォルト: true）
- `conventionalCommits.autoCommit`: メッセージ作成後に自動コミット（デフォルト: true）
- `conventionalCommits.promptScopes`: スコープの選択を促す（デフォルト: true）