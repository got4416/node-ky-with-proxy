# Node.js `ky` CLI

## 概要 (Overview)

`ky` を利用したコマンドラインで実行可能な HTTP(S) クライアントです。`curl` のように、コマンドラインからウェブ上のリソースを取得するために使用できます。

## 主な機能 (Features)

*   指定された URL の内容を標準出力に表示します。
*   リダイレクトを自動で追跡します。
*   HTTP/2 に対応しています。
*   シンプルなインターフェースで、簡単に利用できます。

## インストール (Installation)

リポジトリをクローンした後、依存関係をインストールしてください。

```bash
npm install
```

その後、`node index.js` で直接スクリプトを実行できます。

将来的には、npmパッケージとしてインストールできるようになる予定です。

```bash
# (今後、npm に公開した場合)
npm install -g node-ky-cli
```

## 使い方 (Usage)

```bash
node index.js [options] <url>
```

### オプション (Options)

*   `-o, --output <file>`: レスポンスを指定されたファイルに出力します。
*   `-p, --proxy <proxy_url>`: プロキシサーバーのURLを指定します (例: `http://proxy.example.com:8080`)。環境変数 `HTTP_PROXY` または `HTTPS_PROXY` も利用できます。

## 実行例 (Examples)

### 1. ウェブページの内容をコンソールに表示する

```bash
node index.js https://www.google.com
```

### 2. レスポンスをファイルに保存する

```bash
node index.js https://www.google.com -o google.html
```

### 3. プロキシ経由でリクエストする

```bash
node index.js --proxy http://localhost:8080 https://httpbin.org/get
```

## 技術ノート (Technical Notes)

### プロキシ実装について

当初、HTTP(S)プロキシ機能の実装には `https-proxy-agent` ライブラリの利用を検討しました。しかし、このライブラリはNode.jsの標準的な `http.Agent` を対象としており、`ky` が内部で利用するHTTPクライアント `undici` の `dispatcher` 機構とは互換性がないことが判明しました。

この問題を解決するため、`undici` にネイティブで提供されている `ProxyAgent` を直接利用する方針に切り替えました。`ProxyAgent` のインスタンスを `ky` の `dispatcher` オプションに渡すことで、プロキシ機能が正しく動作することを確認しています。

---
このプロジェクトは、[GoogleのGemini CLI](https://gemini.google.com/)の協力を受けて開発されました。
