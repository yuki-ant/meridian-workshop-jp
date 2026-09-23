# 紹介スライドの保守

ステップ 01 でページサーバーが表示する紹介スライド（`tutor/pages/intro/deck.html`）のソースです。参加者は何もビルドしません。ビルド済みの `deck.js` と React の本番ビルドをコミットしてあるので、ブラウザ側に Babel も CDN も要らず、`file://` で直接開いても動きます（日本語フォントだけは、ほかのページと同じく Google Fonts から取得します）。

| ファイル | 役割 |
| --- | --- |
| `shell.jsx` | 小さなランタイム。1280×720 のキャンバスをウィンドウに合わせて拡大縮小し、キー操作、ページ番号、講師用ノート（N）、印刷表示（`?print`）を受け持つ。配色とフォントは `tutor/pages/assets/page.css` と同じ |
| `slides.jsx` | 各ページと、講師用ノート（末尾の `SLIDES`） |
| `build.mjs` | 上の2つを `tutor/pages/intro/deck.js` にコンパイルする |
| `tutor/pages/intro/presenter.js` | 講師紹介ページの内容。**ここだけはビルド不要**で、書き換えればそのまま反映される。このページが出るのは `deck.html?present` で開いたときだけ（参加者がステップ 01 で自分で読むときには出ない）。`name` を消すと `?present` でも出ない |

## スライドを直したら

```bash
# ビルド用の依存はこのリポジトリに入れていません。好きな場所に用意します（一度だけ）
npm i --no-save --prefix /some/dir @babel/standalone@7 react@18 react-dom@18

BUILD_MODULES=/some/dir/node_modules node tutor/maint/intro-deck/build.mjs      # deck.js を作り直す
node tutor/maint/intro-deck/build.mjs --check                                    # deck.js がいまのソースから作られているか（Babel 不要）
```

`.jsx` と `deck.js` は必ず一緒にコミットしてください。`--check` は、ソースのハッシュと `deck.js` の先頭に記録されたハッシュを比べます。`--vendor` は React の本番ビルドを `tutor/pages/intro/vendor/` にコピーし直します（React を上げるときだけ）。

表示の確認は `node tutor/bin/tutor.mjs serve` で http://localhost:8766/intro/deck.html を開きます。`?present` で講師紹介のページが入り、`?static` でアニメーションが止まり、`?print` で1ページ1枚の印刷表示（PDF 保存用）になります（`?present&print` のように組み合わせられます）。

## 守ること

- ステップを足したり時間を変えたりしたら、ページ「今日の流れ」の `STEPS_P1` / `STEPS_P2` と合計の行、ノートの数字も直す（`tutor/steps/index.json` が正）。
- 参加者が自分で見つけるはずのこと（RFP の穴、引き継ぎメモの薄さ、どの KPI がフィルターに連動しないか）を、スライドで先に明かさない。
- 「いまどこ？」ページと進捗レポートの画像（`assets/map-*.png`、`assets/report-*.png`）は、サンプルの進捗データで表示したページを撮ったものです。ページのデザインを変えたら撮り直し、`slides.jsx` のピンの位置（画像全体に対する % 指定）も合わせます。
