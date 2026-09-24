---
description: フロントエンドとバックエンドのサーバーを起動します
---

ポート 3000 と 8001 で動いている既存のサーバーをすべて停止してから、バックエンド(FastAPI、ポート 8001)とフロントエンド(Vite、ポート 3000)の開発サーバーをバックグラウンドで起動してください。

**バックエンド:** `cd server && uv run python main.py`
**フロントエンド:** `cd client && npm run dev`

ポートを使用中のプロセスを停止する方法:
`./scripts/ports.sh free 3000 8001`（Linux / macOS / Windows の Git Bash 共通。ポート番号で止めるので、コマンド名で止めないこと）

起動後、次の URL で動作を確認してください:
- バックエンド: http://localhost:8001/docs
- フロントエンド: http://localhost:3000
