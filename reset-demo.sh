#!/usr/bin/env bash
# ワークショップを最初からやり直す。進捗を消し、リポジトリを出発点（タグ tutor-base）に戻す。
# 参加者の作業は消さずに、退避用のブランチ tutor-backup-<日時> に残す。退避に失敗したら、何も戻さずに止まる。
set -e
cd "$(dirname "$0")"

if ! git rev-parse -q --verify refs/tags/tutor-base >/dev/null; then
  node tutor/bin/tutor.mjs stop-all >/dev/null 2>&1 || true
  node tutor/bin/tutor.mjs reset
  echo "タグ tutor-base がないので、リポジトリには触れていません。./start.sh でもう一度始められます。"
  exit 0
fi

keep="tutor-backup-$(date +%Y%m%d-%H%M%S)"
base_branch="$(git for-each-ref --format='%(refname:short)' --points-at tutor-base refs/heads | grep -v '^tutor-backup-' | head -1 || true)"
# git の名前とメールが未設定のマシンでも退避コミットが作れるように、このコミットにだけ仮の名前を使う
ident=()
[ -n "$(git config user.name 2>/dev/null)" ]  || ident+=(-c user.name="Meridian workshop")
[ -n "$(git config user.email 2>/dev/null)" ] || ident+=(-c user.email="workshop@example.invalid")

# 未コミットの変更と proposal/ の下書きも含めて、いまの状態をまるごと退避ブランチにコミットする
git switch -q -c "$keep"
git add -A
if ! git diff --cached --quiet; then
  if ! git "${ident[@]}" -c commit.gpgsign=false commit -q -m "ワークショップの作業を退避（reset-demo.sh）"; then
    echo "退避コミットに失敗しました。作業を守るため、リセットを中止します（いまはブランチ $keep にいます）。" >&2
    exit 1
  fi
fi
echo "これまでの作業はブランチ $keep に残しました。"

node tutor/bin/tutor.mjs stop-all >/dev/null 2>&1 || true
node tutor/bin/tutor.mjs reset
if [ -n "$base_branch" ]; then git switch -q "$base_branch"; else git switch -q --detach tutor-base; fi
git reset -q --hard tutor-base
git clean -q -fd -- proposal client server
echo "リセットしました。./start.sh でもう一度始められます。"
