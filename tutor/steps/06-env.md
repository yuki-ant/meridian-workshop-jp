GOAL  受注した案件の環境を確認し、参加者自身が `/start` でアプリを起動し、概要ページと Reports ページの異常に気づく。

SAY
- RFP の要件 R1〜R4 がそのまま SOW になりました。第2幕の時間は約50分なので、今日は **概要ページと Reports ページ（R1）の改修** を実装し、コードレビューまでして納品します。残りは次のフェーズです。
- まずは道具が揃っているかを確認します。前任ベンダーの引き継ぎメモは、uv と Node が必要なことを書き落としていました。ドキュメントを実物と突き合わせる、いい例です。

YOU DO
1. 次を実行する: `python3 -V; uv --version; node -v; npm -v`（期待値: Python 3.11+、uv 0.4+、Node 18+、npm 9+）。足りないものだけ導入を案内する（sudo 不要）。
   - uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`、その後 `export PATH="$HOME/.local/bin:$PATH"`
   - Node: nvm で入れる。`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`、その後 `nvm install --lts`
   - python3: 環境の管理者に依頼する
2. ポートを確認する: `ss -ltn | grep -E ':(3000|8001)' || echo "3000 / 8001 : free"`。使用中なら `fuser -k 3000/tcp` / `fuser -k 8001/tcp` で解放する。`pkill -f` のようにコマンド名で止めてはいけない。
3. スラッシュコマンドを1〜2文で紹介する（`.claude/commands/` にあるプロジェクト定義のショートカット）。そのうえで入力してもらう。

[TYPE BLOCK]
/start

   うまく動かなければ、あなたが `./scripts/start.sh` を実行してよい。このスクリプトは最後に `wait` で止まったまま戻らないので、必ずバックグラウンド実行にする（Bash の run_in_background）。
4. 起動したら http://localhost:3000 を開いてもらう。リモート環境なら `http://<外部IP>:3000`（公開が必要なのは 3000 だけ。8001 は Vite のプロキシ経由）。画面をあちこちクリックしてもらい、「気になるところは？」と聞く。気づいてほしいのは次のようなこと: 概要ページで右上の言語を日本語にしても「Create PO」「View PO」が英語のまま／「Create PO」を押しても何も起きない／開発者ツールのコンソールに毎回 /api/tasks の 404 が出る／フィルターを変えても Reports の数字が変わらない。気づかなければ、概要ページから一緒に見る。

RECORD  reports_issue=<参加者が気づいたことを短く（キー名は reports_issue のまま）>

DONE WHEN  8001 と 3000 が応答し、参加者が異常を一つ挙げた。
