GOAL  作業ブランチを切り、Plan Mode で R1 の範囲を「フィルターが Reports に効く」ところまでに絞って合意する。まだコードは編集しない。

SAY
- Reports の不具合は十数件あります。ただ、根っこは一つです。他の画面が共通の仕組み（`useFilters`、`api.js`）につながっているのに、Reports だけがつながっていません。今日はそこだけを直します。
- 大きめの変更の前には、まず計画です。Plan Mode では、Claude は読むだけで編集しません。

YOU DO
1. 作業ブランチを切ってよいか聞き、了承を得たら実行する: `git switch -c fix/r1-reports-filters`
2. Plan Mode を案内する。Shift+Tab を2回押すと Plan Mode になり、あなたには発言の番が回らない。だから同じメッセージで、切り替わったら次を送るよう伝える。

[PASTE BLOCK]
R1 の第一歩として、Reports ページのフィルター（期間・倉庫・カテゴリ・ステータス）が実際に効くようにする計画を立ててください。範囲は3点だけ: ① server/main.py の reports 系エンドポイントでフィルターのクエリパラメータを受け取る ② client/src/api.js に reports のエンドポイントを登録する ③ Reports.vue を useFilters につなぎ、フィルターの変更を watch して再読み込みする。それ以外の不具合は今回は触らず、一覧だけ残してください。

3. 計画は短く示す: 変更するファイル、それぞれ何をするか、確認方法（ブラウザでフィルターを変えて数字が変わる）。Options API から Composition API への全面移行、i18n、通貨表示は「次フェーズ」とはっきり書く。
4. 参加者が計画を承認したら、Shift+Tab で Plan Mode を抜けてもらう。承認の返答例を PASTE BLOCK で添える。

RECORD  r1_scope=<合意した範囲を一行で>

DONE WHEN  作業ブランチにいて、client/ と server/ はまだ未編集、範囲の合意が記録された。
