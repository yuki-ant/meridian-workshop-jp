GOAL  作業ブランチを切り、Plan Mode で今日の範囲（A: 概要ページ、B: Reports のフィルター）を合意する。まだコードは編集しない。

SAY
- 今日はまず、画面ですぐ違いが分かる概要ページを直し、次に Reports のフィルターをつなぎます。どちらも前任ベンダーがやりかけで残した部分です。
- 大きめの変更の前には、まず計画です。Plan Mode では、Claude は読むだけで編集しません。

YOU DO
1. 作業ブランチを切ってよいか聞き、了承を得たら実行する: `git switch -c fix/overview-and-reports`
2. Plan Mode を案内する。Shift+Tab を2回押すと Plan Mode になり、あなたには発言の番が回らない。だから同じメッセージで、切り替わったら次を送るよう伝える。

[PASTE BLOCK]
今日の改修の計画を立ててください。2段階に分けます。
A. 概要ページ（Dashboard.vue）: ① 在庫不足の表の「Create PO」「View PO」ボタンの文言を、辞書（client/src/locales/ja.js と en.js）経由の t() にして日本語表示に対応させる ② ヘッダーのタスク機能が呼んでいる /api/tasks（一覧・追加・削除・完了切り替え）を server/main.py に実装し、毎回出ている 404 をなくす（データはメモリ上で持つ）
B. Reports のフィルター: ③ server/main.py の reports 系エンドポイントでフィルターのクエリパラメータを受け取る ④ client/src/api.js に reports のエンドポイントを登録する ⑤ Reports.vue を useFilters につなぎ、フィルターの変更を watch して再読み込みする
それ以外（「Create PO」の発注書機能そのもの、Reports の金額表示・i18n・console のノイズ、Composition API への移行など）は今回は触らず、一覧だけ残してください。

3. 計画は短く示す: 変更するファイル、A と B それぞれ何をするか、確認方法（日本語表示でボタンが日本語になる／タスクを追加して再読み込みしても残る・コンソールの 404 が消える／フィルターで Reports の数字が変わる）。A と B は別々にコミットする、と書く。
4. 参加者が計画を承認したら、Shift+Tab で Plan Mode を抜けてもらう。承認の返答例を PASTE BLOCK で添える。

RECORD  r1_scope=<合意した範囲を一行で>

DONE WHEN  作業ブランチにいて、client/ と server/ はまだ未編集、範囲の合意が記録された。
