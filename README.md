# Meridian ワークショップ

コンサルタントになったつもりで RFP に応札し、受注した案件の最初の改修を納品する。その流れを通して Claude Code を学ぶ、自習型のワークショップです。所要時間は **約90分** です。

| 幕    | 内容                                                                                       | 目安   |
| ----- | ------------------------------------------------------------------------------------------ | ------ |
| 第1幕 | RFP を読み解き、提案の方針を決めて、Claude に提案書と HTML ページ・スライドを作らせる | 約30分 |
| 第2幕 | 受注後、アプリを起動し、概要ページと Reports ページの不具合を直し、サブエージェントでコードレビューしてコミットする | 約49分 |

## 事前準備

次のツールをあらかじめインストールしておいてください。

- **Claude Code**: [docs.claude.com/claude-code](https://docs.claude.com/en/docs/claude-code/overview)
- **Node.js 18 以上**: [nodejs.org](https://nodejs.org)
- **uv**（Python パッケージマネージャー）: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **git**

## 始め方

最後に PR を作れるように、**最初にこのリポジトリを fork** してから、自分の fork をクローンしてください。

```bash
git clone https://github.com/<your-username>/meridian-workshop-jp.git
cd meridian-workshop-jp
./start.sh          # Windows は start.cmd
```

Claude が起動したら「こんにちは」と一声かけてください。あとは Claude が一歩ずつ案内します。最初に、ブラウザで **「いまどこ？」ページ**（http://localhost:8766/map.html）が開きます。現在のステップ、経過時間と90分の予算、全体マップが自動で更新されるので、開いたままにしておいてください。

`./start.sh` は Claude Code に tutor プラグインを `--plugin-dir` で渡すだけで、何もインストールしません。

## 途中で接続が切れてしまったら

もう一度 `./start.sh` を実行してください。進捗は `tutor/state/` に保存されているので、続きから再開できます。

## やり直すとき

```bash
./reset-demo.sh
```

進捗を消し、リポジトリを出発点（タグ `tutor-base`）に戻します。それまでの作業は `tutor-backup-<日時>` ブランチに残ります。

## リポジトリの構成

- `docs/rfp/`: RFP とクライアントの背景資料
- `proposal/`: 提案書の置き場所（最初は空です）
- `client/`、`server/`: 第2幕で手を入れるアプリケーション本体
- `tutor/`: ワークショップのチューター（Claude Code プラグイン。ステップの台本、解説ページ、「いまどこ？」ページ）
- `.claude/`: このワークショップ用に用意した、プロジェクトレベルの Claude Code 設定（`/start` コマンド、code-reviewer サブエージェントなど）
- `instruction/`: 講師用資料
