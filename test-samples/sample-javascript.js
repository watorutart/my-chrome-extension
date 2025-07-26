// サンプルJavaScriptファイル - GitHub Copilot日本語レビューテスト用

// このファイルには意図的にいくつかの改善点を含めています
// GitHub Copilotが日本語でレビューコメントを生成するかテストします

// 問題1: letを使用している（constの方が適切）
let userName = 'testuser';

// 問題2: エラーハンドリングが不十分
function fetchData(url) {
    return fetch(url).then(response => response.json());
}

// 問題3: 関数が複数の責務を持っている
function processUserDataAndDisplay(userData) {
    // データ処理
    const processedData = userData.map(user => ({
        id: user.id,
        name: user.name.toUpperCase(),
        email: user.email.toLowerCase()
    }));
    
    // DOM操作
    const container = document.getElementById('user-list');
    container.innerHTML = '';
    
    processedData.forEach(user => {
        const div = document.createElement('div');
        div.innerHTML = `<h3>${user.name}</h3><p>${user.email}</p>`;
        container.appendChild(div);
    });
    
    // ログ出力
    console.log('User data processed and displayed');
}

// 問題4: 非同期処理でawaitを使用していない
function loadAndDisplayUsers() {
    fetchData('/api/users')
        .then(data => {
            processUserDataAndDisplay(data);
        })
        .catch(error => {
            console.log('Error:', error);
        });
}

// 問題5: マジックナンバーの使用
function paginateUsers(users, page) {
    const startIndex = (page - 1) * 10;  // 10はマジックナンバー
    return users.slice(startIndex, startIndex + 10);
}

// 問題6: 型チェックが不十分
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    return today.getFullYear() - birth.getFullYear();
}

// 問題7: セキュリティ上の懸念（innerHTML使用）
function displayMessage(message) {
    document.getElementById('message').textContent = message;
}

// 期待される日本語レビューコメント例：
// 1. "パフォーマンス向上のため、letの代わりにconstの使用を検討してください"
// 2. "エラーハンドリングが不十分です。try-catch文またはcatch句での適切な処理を追加してください"
// 3. "この関数は責務が多すぎるため、単一責任の原則に従って複数の関数に分割することを推奨します"
// 4. "async/await（非同期処理）を使用してより読みやすいコードにしてください"
// 5. "マジックナンバーの代わりに名前付き定数を使用してください"
// 6. "型安全性を向上させるため、引数の型チェックを追加してください"
// 7. "XSS攻撃を防ぐため、innerHTMLの代わりにtextContentまたはcreateTextNodeを使用してください"