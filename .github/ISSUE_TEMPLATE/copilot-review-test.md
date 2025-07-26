---
name: GitHub Copilot レビュー設定確認
about: GitHub Copilotの日本語レビュー機能をテストする
title: "[Copilot Review] 日本語コメント機能テスト"
labels: ["copilot", "review", "japanese"]
assignees: []

---

## GitHub Copilot 日本語レビュー機能テスト

### 概要
GitHub Copilotのカスタムレビュールールが正しく動作し、日本語でコメントが生成されることを確認します。

### テスト対象
- [ ] JavaScript/TypeScriptファイルのレビュー
- [ ] HTMLファイルのレビュー
- [ ] CSSファイルのレビュー
- [ ] その他のファイルタイプ

### 期待される動作
1. **言語設定**: 全てのレビューコメントが日本語で出力される
2. **技術用語**: 日本語での説明が含まれる
3. **改善提案**: 日本語での具体的な説明が提供される
4. **対象範囲**: Pull Requestの全てのファイルに適用される

### 確認項目
- [ ] レビューコメントが日本語で生成される
- [ ] 技術用語に適切な日本語説明が付いている
- [ ] 改善提案が具体的で理解しやすい
- [ ] 全てのファイルタイプに対応している
- [ ] ワークフローが正常に実行される

### テスト手順
1. 新しいプルリクエストを作成
2. 各種ファイルタイプでコード変更を含める
3. GitHub Copilotによるレビューが自動実行されることを確認
4. 生成されたコメントが日本語であることを確認
5. コメントの品質と有用性を評価

### 関連ファイル
- `.github/workflows/copilot-review.yml`
- `.github/copilot-rules.yml`
- `.github/pull_request_template.md`

### 追加情報
GitHub Copilotの日本語カスタムルール実装に関する詳細は、プロジェクトドキュメントを参照してください。