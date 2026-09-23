GOAL  合意した範囲を実装し、ブラウザでフィルターが Reports に効くことを参加者が自分の目で確かめ、コミットする。

SAY
- 目安は20分です。15分を過ぎたら、バックエンド（①）は次フェーズに回し、フロントエンドの接続（②③）だけでコミットします。

YOU DO
1. 計画どおりに実装する。順番は ① → ② → ③。各段階で何を変えたかを1〜2行で伝える。既存の他のビュー（例: `client/src/views/Orders.vue`）が `useFilters` と `api.js` をどう使っているかを手本にし、同じ書き方に揃える。
   - ①: `server/main.py` の `/api/reports/quarterly` と `/api/reports/monthly-trends` に `warehouse`、`category`、`status`、`month` の任意パラメータを足す。既存の `apply_filters` と `filter_by_month` を再利用する。
   - ②: `client/src/api.js` に `getQuarterlyReports(filters)` と `getMonthlyTrends(filters)` を追加する。既存の関数と同じく URLSearchParams を使う。
   - ③: `Reports.vue` で `useFilters` を使い、`api.js` 経由で取得し、フィルターの変更を `watch` して再読み込みする。Options API のままでもよい（`setup()` から返す）。全面移行はしない。
2. バックエンドを変えた場合は、既存のテストが壊れていないか確認する: `cd tests && uv run --project ../server pytest -q`（pytest は server の開発用依存に入っている）。元から2件失敗することは知られている（demand データの不整合）。新しい失敗がなければよい。
3. 参加者にブラウザで確かめてもらう。倉庫やカテゴリを切り替えて、Reports の数字が変わるか。ここは参加者の目で確認する場面なので、あなたが「動きました」と言い切らない。
4. 動いたら、コミットしてよいか聞いてからコミットする。メッセージ例: `R1: Reports をフィルターに接続（D-01, D-02, D-07）`。proposal/ の下書きは、参加者が望まない限りこのコミットに含めない。

時間切れの場合: その時点で動いている部分をコミットし、残りを次のステップの引き継ぎメモに書く。

DONE WHEN  Reports.vue が useFilters と watch を使い、api.js に reports のエンドポイントがあり、Reports.vue を変更したコミットがあり、client/ と server/ に未コミットの変更がない。
