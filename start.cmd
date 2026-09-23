@echo off
rem Meridian ワークショップを始める: tutor プラグインをこのセッションだけ読み込んで Claude Code を起動する。
chcp 65001 >nul
cd /d "%~dp0"
where claude >nul 2>nul || (echo Claude Code がインストールされていません & exit /b 1)
where node >nul 2>nul || (echo Node.js 18 以上が必要です & exit /b 1)
where git >nul 2>nul || (echo git が必要です & exit /b 1)
if not exist .git (echo このフォルダは git リポジトリではありません & exit /b 1)
git rev-parse -q --verify refs/tags/tutor-base >nul 2>nul || (git tag tutor-base & echo 出発点にタグ tutor-base を付けました。)
claude --plugin-dir tutor --settings tutor\settings.json %*
