GOAL  合意した計画どおりに概要ページの KPI をフィルターに連動させ、参加者がブラウザで確かめてからコミットする。

SAY
- 目安は22分です。実装そのものは10分ほどで終わるはずです。時間が余ったら、同じ「フィルターが反映されない」症状を持つ Reports ページにも取り組めます（任意）。

YOU DO
1. **概要ページの KPI。** 計画した3つの KPI（出荷完了・注文充足率・平均処理時間）を `Dashboard.vue` の computed にし、固定値（テンプレートの `2.8`、`ref({ fulfilled: 187, goal: 200 })`、`ref(96.8)`、目標との差の直書き）をなくす。在庫回転率は直書きの `4.2` をやめて「—」と「定義を確認中」の表示にする。既存の `statusData` や `orderHealthMetrics` が `allOrders` からどう計算しているかを手本にし、同じ書き方に揃える。変えたことを1〜2行で伝える。
   - 0件のとき（例: 絞り込みで注文がない月）は、NaN や Infinity ではなく 0 や「—」を出す。
   - 参加者にブラウザで確かめてもらう: 期間（例: 3月）や場所（例: 東京）を切り替えて、3つの KPI が変わるか。在庫回転率が「—」になっているか。全件に戻すと元の値の近くに戻るか。あなたが「動きました」と言い切らない。
   - コミットしてよいか聞いてからコミットする。例: `概要: KPI をフィルター済みのデータから計算し、期間・場所の選択を反映`
2. **（任意・時間が余ったら）Reports ページ。** 同じ症状がある。`server/main.py` の `/api/reports/quarterly` と `/api/reports/monthly-trends` にフィルターのパラメータを足し（既存の `apply_filters` と `filter_by_month` を再利用、変更後はバックエンドを `./scripts/ports.sh free 8001` で止めて `cd server && uv run python main.py` をバックグラウンドで起動し直す）、`client/src/api.js` に登録し、`Reports.vue` を `useFilters` と `watch` でつなぐ。テストは `cd tests && uv run --project ../server pytest -q`（元から2件失敗）。確かめてから別のコミットにする。
3. proposal/ の下書きは、参加者が望まない限りコミットに含めない。

時間切れの場合: 動いているところまでをコミットし、残りを最後のレポートの「次フェーズ」に書く。

DONE WHEN  Dashboard.vue から KPI の固定値（187、96.8、4.2、2.8）がなくなり、Dashboard.vue を変更したコミットがあり、client/ と server/ に未コミットの変更がない。
