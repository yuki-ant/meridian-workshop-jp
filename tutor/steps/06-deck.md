GOAL  書き上げた提案書が、数分で読みやすい HTML ページとスライドになることを見せる。細かいレビューはしない。第1幕を締める。

SAY
- 同じ提案書から、クライアントに見せる形をすぐ作れます。読む用の HTML ページと、最終候補のプレゼン用のスライドを、まとめて作りましょう。

YOU DO
1. `proposal/proposal.md`（なければ proposal/ にある提案書の .md ファイル一式）から、次の2つを**1回で**生成する。途中で確認しない。
   - `proposal/proposal.html`: 読みやすい1ページの提案書。見出し、要件対応表、スケジュールを整える。
   - `proposal/capabilities-deck.html`: 自己完結型のスライド。矢印キーで送る。5部構成（タイトル、課題、アプローチ、スケジュール、選ばれる理由）で、6〜8枚。
   どちらも日本語フォントに Noto Sans JP（Google Fonts）を使う。
2. ページサーバーで開く: `node tutor/bin/tutor.mjs open proposal/proposal.html` と `node tutor/bin/tutor.mjs open proposal/capabilities-deck.html` を実行し、T が出力した2つのアドレスを、それぞれ「→ 開く:」の行で伝える。「いまどこ？」ページの「あなたの成果物」からも開ける、と一言添える。
3. 見てもらうのは基本的な点だけでよい: ちゃんと表示されるか、明らかにおかしいところがないか。気になる点があれば1つだけ直す。なければそのまま進む。細かい文言や色の調整には誘わない。
4. 一言だけ添える: 「配布用に .pptx が必要なら、後で変換できます」。
5. 第1幕を締める。「提案書一式が揃いました。提出から2週間後、Meridian は当社を選びました。ここからは実際のコードベースに手を入れます」。

DONE WHEN  proposal/proposal.html と proposal/capabilities-deck.html がある。
