# My Chrome Extension

Chrome拡張機能プロジェクト

## GitHub Copilot 日本語レビューシステム

このプロジェクトでは、GitHub Copilotによるコードレビューを全て日本語で実行するカスタムルールを実装しています。

### 主な機能

- ✅ **自動日本語レビュー**: Pull Request作成時に自動的に日本語でコードレビューを実行
- ✅ **技術用語説明**: 英語の技術用語に日本語説明を自動付加
- ✅ **具体的改善提案**: 改善理由と具体的方法を日本語で詳細説明
- ✅ **全ファイル対応**: JavaScript, CSS, HTML等すべてのファイルタイプに対応

### 設定ファイル

- `.github/workflows/copilot-review.yml` - 自動レビューワークフロー
- `.github/copilot-rules.yml` - 詳細な日本語レビュールール
- `.github/copilot-workspace.json` - ワークスペース設定
- `.vscode/settings.json` - VSCode統合設定

### 使用方法

1. 新しいPull Requestを作成
2. 自動的に日本語レビューが実行されます
3. レビューコメントが日本語で投稿されます

詳細な設定とカスタマイズ方法は [日本語レビューシステムドキュメント](.github/COPILOT_JAPANESE_RULES.md) を参照してください。

### テストサンプル

`test-samples/` ディレクトリに日本語レビューをテストするためのサンプルファイルが含まれています：
- `sample-javascript.js` - JavaScript改善点のテスト
- `sample-styles.css` - CSS改善点のテスト  
- `sample-html.html` - HTML改善点のテスト