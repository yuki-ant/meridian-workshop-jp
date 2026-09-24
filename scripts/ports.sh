#!/usr/bin/env bash

# ポートの確認と解放 - Linux / macOS / Windows の Git Bash 共通
#   ./scripts/ports.sh                 3000 と 8001 の使用状況を表示する
#   ./scripts/ports.sh free [ポート…]   そのポートで待ち受けているプロセスを止める(省略時は 3000 と 8001)
# プロセス名ではなくポート番号で止めるので、実行中のシェルを巻き込まない。

case "$(uname -s)" in
    MINGW*|MSYS*|CYGWIN*) IS_WINDOWS=1 ;;
    *) IS_WINDOWS=0 ;;
esac

# Windows の netstat -ano の出力(標準入力)から、ポート $1 で待ち受けている PID を拾う。
# 状態の列(LISTENING)は言語によって訳されるので使わず、相手側アドレスが :0 の TCP 行を待ち受けとみなす。
parse_netstat() {
    tr -d '\r' | awk -v p=":$1" '
        $1 == "TCP" && substr($2, length($2) - length(p) + 1) == p && $3 ~ /:0$/ && $5 != "0" { print $5 }
    ' | sort -u
}

pids_on_port() {
    if [ "$IS_WINDOWS" = 1 ]; then
        netstat -ano | parse_netstat "$1"
    elif command -v lsof >/dev/null 2>&1; then
        lsof -ti:"$1" -sTCP:LISTEN 2>/dev/null || true   # 何もなければ終了コード 1 になる
    elif command -v fuser >/dev/null 2>&1; then
        fuser "$1"/tcp 2>/dev/null | tr -s ' \t' '\n' | grep -E '^[0-9]+$' || true
    else
        echo "lsof も fuser も見つからないため、ポート $1 を調べられません" >&2
        return 1
    fi
}

free_port() {
    local pids pid
    pids=$(pids_on_port "$1") || return 1
    [ -z "$pids" ] && return 0
    for pid in $pids; do
        if [ "$IS_WINDOWS" = 1 ]; then
            # // は Git Bash がオプションをパスに書き換えないようにするため。/T で子プロセスごと止める
            taskkill //F //T //PID "$pid" >/dev/null 2>&1 || true
        else
            kill "$pid" 2>/dev/null || true
        fi
    done
    echo "ポート $1 を解放しました (PID: $(echo $pids))"
}

# source されたときは関数を定義するだけ
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    if [ "$1" = "free" ]; then
        shift
        [ $# -eq 0 ] && set -- 3000 8001
        for port in "$@"; do free_port "$port"; done
    else
        for port in 3000 8001; do
            pids=$(pids_on_port "$port") || exit 1
            if [ -n "$pids" ]; then
                echo "$port : 使用中 (PID: $(echo $pids))"
            else
                echo "$port : free"
            fi
        done
    fi
fi
