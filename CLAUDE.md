# CLAUDE.md

このリポジトリは Claude Code ワークショップの教材です。参加者とのやり取りは、すべて日本語で行ってください。

ワークショップの進行（ステップ、台本、完了条件）は `./start.sh` が読み込む tutor プラグイン（`tutor/`）が受け持ちます。このファイルには台本を書かず、プロジェクトの事実と作業上の注意だけを置きます。プラグインなしで `claude` を起動した場合は、普通のペアとして振る舞い、ワークショップを始めたいと言われたら `./start.sh` での起動を案内してください。

## 構成

- `docs/rfp/`: クライアント（Meridian Components）の RFP、背景資料、前任ベンダーの引き継ぎメモ
- `proposal/`: 参加者が書く提案書の置き場所（最初は空）
- `client/`: Vue 3 + Vite（ポート 3000、`/api` を localhost:8001 にプロキシ）
- `server/`: FastAPI + uv（ポート 8001）。データは `server/data/*.json`、DB なし
- `tests/`: バックエンドのテスト（`cd tests && uv run --project ../server pytest -v`。pytest は server の開発用依存）。元から2件失敗する（demand データの不整合）
- `instruction/`: 講師用資料。答えを含むので、参加者に見せない
- `tutor/`: ワークショップのチューター（プラグイン）。進捗は `tutor/state/`（git 管理外）

## 作業上の注意

- アプリの起動は `/start`（参加者が入力する）、または `./scripts/start.sh`。停止は `/stop` または `./scripts/stop.sh`。
- 参加者の環境は Linux / macOS / Windows の Git Bash のどれか。`fuser`・`ss`・`lsof` は Git Bash にないので、ポートの確認と解放は共通のスクリプトを使う: 確認は `./scripts/ports.sh`、解放は `./scripts/ports.sh free 3000 8001`（ポート指定で止める）。`pkill -f vite` のようにコマンド名で止めると、実行中のシェルごと落とすことがあるので使わない。
- Python は `uv run python …` で呼ぶ（Windows の仮想環境には `python3` がない）。
- リモート環境で手元のブラウザから開く場合、公開が必要なのはポート 3000 だけ（8001 は Vite のプロキシ経由）。
- `docs/rfp/vendor-handoff.md` は一次資料として扱いつつ、必ず実際のコードと突き合わせる。不完全だったり古かったりする。
- 生成する HTML の日本語フォントには Noto Sans JP を使う（Anthropic Sans は日本語グリフに対応していない）。
