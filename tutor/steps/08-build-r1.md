GOAL  合意した範囲を A（概要ページ）→ B（Reports のフィルター）の順に実装し、それぞれブラウザで確かめてコミットする。

SAY
- 目安は22分です。A で約10分、B で約12分。15分を過ぎても B が終わらなければ、動いているところまでをコミットし、残りは次フェーズに回します。

YOU DO
1. **A: 概要ページ。** 各段階で何を変えたかを1〜2行で伝える。
   - ①: `Dashboard.vue` の「Create PO」「View PO」を `t()` に置き換え、`client/src/locales/ja.js` と `en.js` の `dashboard` の下にキーを足す（例: 発注書を作成／発注書を見る）。既存のキーの並びに合わせる。
   - ②: `server/main.py` に `/api/tasks` を実装する: GET（一覧）、POST（追加。id を振り、status は "pending"）、DELETE `/api/tasks/{id}`、PATCH `/api/tasks/{id}`（pending と completed を切り替え）。項目は `client/src/components/TasksModal.vue` が使う形（id、title、priority、dueDate、status）に合わせる。データはメモリ上のリストでよい。
   - バックエンドは自動で再起動しないので、変更後にバックエンドだけ再起動する（`fuser -k 8001/tcp` で止め、`cd server && uv run python main.py` をバックグラウンドで起動）。
   - テスト: `cd tests && uv run --project ../server pytest -q`。元から2件失敗する（demand データの不整合）。新しい失敗がなければよい。
   - 参加者にブラウザで確かめてもらう: 言語を日本語にするとボタンが日本語になるか／ヘッダーのメニューからタスクを追加し、ページを再読み込みしても残るか／コンソールの 404 が消えたか。あなたが「動きました」と言い切らない。
   - コミットしてよいか聞いてからコミットする。例: `概要: 発注ボタンの日本語化と /api/tasks の実装`
2. **B: Reports のフィルター。** 既存の他のビュー（例: `client/src/views/Orders.vue`）が `useFilters` と `api.js` をどう使っているかを手本にし、同じ書き方に揃える。
   - ③: `server/main.py` の `/api/reports/quarterly` と `/api/reports/monthly-trends` に `warehouse`、`category`、`status`、`month` の任意パラメータを足す。既存の `apply_filters` と `filter_by_month` を再利用する。再起動とテストは A と同じ。
   - ④: `client/src/api.js` に `getQuarterlyReports(filters)` と `getMonthlyTrends(filters)` を追加する。
   - ⑤: `Reports.vue` で `useFilters` を使い、`api.js` 経由で取得し、フィルターの変更を `watch` して再読み込みする。Options API のままでよい（`setup()` から返す）。
   - 参加者にブラウザで確かめてもらう: 倉庫やカテゴリを切り替えて、Reports の数字が変わるか。
   - コミットしてよいか聞いてからコミットする。例: `R1: Reports をフィルターに接続（D-01, D-02, D-07）`
3. proposal/ の下書きは、参加者が望まない限りコミットに含めない。

時間切れの場合: 動いているところまでをコミットし、残りを最後の引き継ぎメモに書く。

DONE WHEN  Dashboard.vue に英語の「Create PO」「View PO」が残っておらず、server/main.py に /api/tasks があり、Reports.vue が useFilters と watch を使い、api.js に reports のエンドポイントがあり、Dashboard.vue と Reports.vue を変更したコミットがあり、client/ と server/ に未コミットの変更がない。
