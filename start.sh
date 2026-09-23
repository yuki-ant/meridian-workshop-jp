#!/usr/bin/env bash
# Meridian ワークショップを始める: tutor プラグインをこのセッションだけ読み込んで Claude Code を起動する。
set -e
cd "$(dirname "$0")"

command -v claude >/dev/null 2>&1 || { echo "Claude Code がインストールされていません: https://docs.claude.com/en/docs/claude-code/overview"; exit 1; }
command -v node   >/dev/null 2>&1 || { echo "Node.js 18 以上が必要です: https://nodejs.org"; exit 1; }
command -v git    >/dev/null 2>&1 || { echo "git が必要です"; exit 1; }
command -v uv     >/dev/null 2>&1 || echo "（注意）uv が見つかりません。第2幕の前に Claude が導入を案内します。"

[ -d .git ] || { echo "このフォルダは git リポジトリではありません。fork したリポジトリを git clone してください。"; exit 1; }

# 出発点に印を付ける（初回だけ）。チューターの確認と reset-demo.sh はここを基準にします。
if ! git rev-parse -q --verify refs/tags/tutor-base >/dev/null; then
  git tag tutor-base
  echo "出発点にタグ tutor-base を付けました。"
fi

exec claude --plugin-dir tutor --settings tutor/settings.json "$@"
