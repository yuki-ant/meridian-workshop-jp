/* slides.jsx — the pages of the introduction deck: eleven, ending on a thank-you page, plus a speaker page when the deck is opened with ?present and
   presenter.js names a presenter. Layout is sized off the 1280×720 canvas with flex and %, never a literal canvas width.
   Copy stays short: what a presenter would say lives in each slide's `notes`.
   The deck must not give away what the learner is meant to find out (the gaps in the RFP, how thin the hand-off memo is,
   which KPI tiles ignore the filters): the app mock shows every tile as the app does and never shows values reacting or
   failing to react. */

function Head({ kicker, h2, sub, dark }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ font: `600 12.5px/1.4 ${MONO}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.CLAY, marginBottom: 9 }}>{kicker}</div>
      <h2 style={{ font: `700 35px/1.28 ${SANS}`, letterSpacing: '-0.01em', margin: 0, color: dark ? C.IVORY : C.SLATE }}>{h2}</h2>
      {sub && <div style={{ fontSize: 16.5, lineHeight: 1.6, color: dark ? 'rgba(250,249,245,0.72)' : C.GRAY, marginTop: 8, maxWidth: '80%' }}>{sub}</div>}
    </div>
  );
}
const code = (t, size) => <code style={{ fontFamily: MONO, fontSize: size || 13.5, background: C.TINT, padding: '2px 6px', borderRadius: 5, whiteSpace: 'nowrap' }}>{t}</code>;

function Pin({ n, c, size, style }) {
  const d = size || 22;
  return (
    <span style={Object.assign({ flex: '0 0 auto', width: d, height: d, borderRadius: d / 2, background: c || C.CLAY, color: '#fff', fontFamily: MONO, fontSize: d * 0.57, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px rgba(255,255,255,0.92), 0 2px 8px rgba(20,20,19,0.35)' }, style)}>{n}</span>
  );
}

/* ── Title ─────────────────────────────────────────────────────────────────── */
function Slide_Title() {
  const dot = (c, k) => <span key={k} style={{ width: 10, height: 10, borderRadius: 5, background: c, display: 'inline-block' }} />;
  const lbl = { font: `600 13px/1 ${MONO}`, letterSpacing: '0.08em', color: 'rgba(250,249,245,0.72)', whiteSpace: 'nowrap' };
  return (
    <Slide bg={C.SLATE} color={C.IVORY} label="Title" padding="0 112px">
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
          <span style={{ width: 44, height: 4, background: C.CLAY, display: 'inline-block', borderRadius: 2 }} />
          <span style={{ font: `600 13px/1 ${MONO}`, letterSpacing: '0.16em', color: C.CLAY, border: `1.5px solid ${C.CLAY}`, borderRadius: 999, padding: '7px 14px' }}>パートナー向け</span>
        </div>
        <div style={{ fontSize: 68, lineHeight: 1.12, fontWeight: 700, letterSpacing: '-0.015em', whiteSpace: 'nowrap' }}>Claude が Claude を教える</div>
        <div style={{ fontSize: 33, fontWeight: 500, color: C.CLAY, marginTop: 16 }}>セルフペース型 Claude ハンズオンワークショップ</div>
        <div style={{ fontSize: 18.5, color: 'rgba(250,249,245,0.76)', marginTop: 34, lineHeight: 1.75 }}>
          Meridian Components の RFP に応札し、最初の改修を納品します · {nb('約 90 分')}<br />
          自分のターミナルで、Claude が {nb('1 ステップ')}ずつ案内します。
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 44 }}>
          <span style={lbl}>第1幕 · 応札</span>
          <span style={{ display: 'inline-flex', gap: 6 }}>{[0, 1, 2, 3, 4, 5, 6].map((i) => dot(C.SKY, i))}</span>
          <span style={Object.assign({}, lbl, { color: C.CLAY })}>→ 受注 →</span>
          <span style={lbl}>第2幕 · 納品</span>
          <span style={{ display: 'inline-flex', gap: 6 }}>{[0, 1, 2, 3].map((i) => dot(C.CLAY, i))}</span>
          <span style={{ width: 12, height: 14, borderRadius: 2, border: '2px solid #9CC3B5', display: 'inline-block' }} />
          <span style={Object.assign({}, lbl, { color: '#9CC3B5' })}>進捗レポート</span>
        </div>
      </div>
    </Slide>
  );
}

/* ── Speaker — with ?present, and only when tutor/pages/intro/presenter.js names a presenter ── */
function Slide_Speaker() {
  const P = window.PRESENTER || {};
  const initials = String(P.name || '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const career = P.career || [];
  return (
    <Slide label="Speaker" padding="44px 72px 60px">
      <div style={{ display: 'flex', gap: 56, flex: 1, minHeight: 0, alignItems: 'center' }}>
        <div style={{ flex: 0.82, minWidth: 0 }}>
          <div style={{ font: `600 12.5px/1.4 ${MONO}`, letterSpacing: '0.14em', color: C.CLAY, marginBottom: 26 }}>講師紹介</div>
          {P.photo
            ? <img src={P.photo} alt="" style={{ width: 132, height: 132, borderRadius: 66, objectFit: 'cover', boxShadow: `0 0 0 4px ${C.IVORY}, 0 0 0 6px ${C.CLAY}` }} />
            : <div style={{ width: 132, height: 132, borderRadius: 66, background: C.SLATE, color: C.IVORY, fontSize: 46, fontWeight: 700, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 4px ${C.IVORY}, 0 0 0 6px ${C.CLAY}` }}>{initials}</div>}
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.015em', marginTop: 26 }}>{P.name}</div>
          <div style={{ fontSize: 25, fontWeight: 500, color: C.CLAY, marginTop: 10 }}>{P.role}</div>
          <div style={{ fontSize: 20, color: C.GRAY, marginTop: 4 }}>{P.org}</div>
        </div>
        <div style={{ flex: 1.18, minWidth: 0 }}>
          <div style={{ font: `600 12px/1.4 ${MONO}`, letterSpacing: '0.12em', color: C.GRAY, marginBottom: 14 }}>経歴</div>
          <div style={{ position: 'relative', paddingLeft: 34 }}>
            <span style={{ position: 'absolute', left: 8, top: 10, bottom: 22, width: 2, background: C.OAT }} />
            {career.map((c, i) => (
              <div key={i} style={{ position: 'relative', paddingBottom: i === career.length - 1 ? 0 : 20 }}>
                <span style={{ position: 'absolute', left: -34, top: 5, width: 18, height: 18, borderRadius: 9, background: i === 0 ? C.CLAY : C.IVORY, border: `2.5px solid ${i === 0 ? C.CLAY : C.SKY}` }} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <span style={{ font: `600 14px/1.4 ${MONO}`, color: i === 0 ? C.RUST : C.GRAY, width: 104, flexShrink: 0 }}>{c.years}</span>
                  <span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.3 }}>{c.org}</span>
                </div>
                {c.role && <div style={{ fontSize: 15, color: C.INK, lineHeight: 1.5, paddingLeft: 118, marginTop: 1 }}>{c.role}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ── How it works ──────────────────────────────────────────────────────────── */
function TermLine({ who, children, dim }) {
  const c = who === 'you' ? C.CLAY : who === 'check' ? '#9CC3B5' : 'rgba(250,249,245,0.92)';
  return (
    <div style={{ display: 'flex', gap: 10, fontFamily: MONO, fontSize: 14.5, lineHeight: 1.65, opacity: dim ? 0.55 : 1 }}>
      <span style={{ color: c, width: 58, flexShrink: 0, textAlign: 'right' }}>{who === 'check' ? '✓' : who}</span>
      <span style={{ color: who === 'you' ? C.IVORY : c }}>{children}</span>
    </div>
  );
}
function Slide_How() {
  const beat = (n, t, s, c) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <span style={{ width: 22, height: 22, borderRadius: 11, background: c, color: '#fff', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{t}</span>
      </div>
      <div style={{ fontSize: 12.5, lineHeight: 1.5, color: C.GRAY, paddingLeft: 30 }}>{s}</div>
    </div>
  );
  const days = [['4/17', '発行'], ['4/28', '質問'], ['5/8', '提出']];
  return (
    <Slide label="How it works" padding="40px 72px 58px">
      <Head kicker="進み方" h2={ph('Claude が 1 ステップずつ案内し、', 'あなたが判断して手を動かす')} />
      <div style={{ display: 'flex', gap: 22, flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1.2, background: C.SLATE, borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.18)' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(250,249,245,0.45)', marginBottom: 4 }}>~/meridian-workshop-jp · claude</div>
          <TermLine who="claude">ステップ 03 · 4 分。Meridian から届いた RFP を読みましょう。次は、あなたが入力します。</TermLine>
          <TermLine who="you">@docs/rfp/MC-2026-0417.md を読んで、私たちの理解を整理してください</TermLine>
          <TermLine who="claude" dim>…RFP と背景資料を読み、依頼の内容、必須と希望、日程、評価配点を整理</TermLine>
          <TermLine who="claude">同じ内容を図にしたページを開きました。読み終えたら「Done」と送ってください。</TermLine>
          <TermLine who="you">Done</TermLine>
          <TermLine who="check">RFP の理解が記録されている</TermLine>
          <TermLine who="claude">ステップ 04 · 6 分。この RFP で、決めないと見積もれないところはどこでしょう？</TermLine>
        </div>
        <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <div style={{ flex: 1, background: '#fff', border: `1px solid ${C.LINE}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ background: C.TINT, padding: '7px 12px', fontFamily: MONO, fontSize: 11, color: C.GRAY }}>localhost:8766 · あなたのマシンから配信</div>
            <div style={{ padding: '12px 18px' }}>
              <div style={{ font: `600 12px/1.4 ${MONO}`, letterSpacing: '0.12em', color: C.CLAY }}>第1幕 · ステップ 03 · 私たちの理解</div>
              <div style={{ fontSize: 18.5, fontWeight: 700, lineHeight: 1.4, margin: '5px 0 14px' }}>今回の RFP を読み解く</div>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <span style={{ position: 'absolute', left: 24, right: 24, top: 7, height: 2, background: C.OAT }} />
                {days.map(([d, t], i) => (
                  <span key={t} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 16, height: 16, borderRadius: 8, background: i === 2 ? C.CLAY : '#fff', border: `2px solid ${i === 2 ? C.CLAY : C.SKY}` }} />
                    <span style={{ font: `600 12px/1 ${MONO}` }}>{d}</span>
                    <span style={{ fontSize: 12, color: C.GRAY }}>{t}</span>
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 14, borderTop: `1px solid ${C.LINE}`, paddingTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 14px', fontSize: 13, color: C.INK }}>
                {['1 · スケジュール', '2 · 必須と希望', '3 · 評価配点', '4 · 意思決定者', '5 · 求められている提案書', '6 · 勝ち筋の候補'].map((t) => <span key={t} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</span>)}
              </div>
            </div>
          </div>
          <div style={{ background: '#fff', border: `1.5px solid ${C.MINERAL}`, borderRadius: 12, padding: '10px 14px', fontSize: 13.5, lineHeight: 1.6 }}>
            <b style={{ color: C.GREEN }}>「Done」のあとは、Claude が確かめます。</b>ファイル、ブランチ、コミット、起動中のアプリを見てから、次へ進みます。
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 12, paddingTop: 11, borderTop: `1px solid ${C.LINE}` }}>
        {beat(1, 'Claude が説明する', '目安の時間も伝える', C.SLATE)}
        {beat(2, 'あなたが手を動かす', '読む、決める、/start や @ の入力', C.SKY)}
        {beat(3, '「Done」と伝える', '「できました」でも構いません', C.CLAY)}
        {beat(4, 'Claude が確かめる', 'リポジトリの状態と記録を見て', C.MINERAL)}
        {beat(5, '次のステップへ', '全部で 12 ステップ', C.SLATE)}
      </div>
    </Slide>
  );
}

/* ── The case ──────────────────────────────────────────────────────────────── */
function FileIcon({ kind }) {
  const s = { width: 28, height: 28, flexShrink: 0 };
  if (kind === 'code') {
    return (
      <svg viewBox="0 0 26 26" style={s} aria-hidden="true">
        <path d="M3 7.5a2 2 0 0 1 2-2h5l2 2.5h9a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke={C.SKY} strokeWidth="1.8" />
        <path d="M11 12.5 8.8 15l2.2 2.5M15 12.5l2.2 2.5-2.2 2.5" fill="none" stroke={C.SKY} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  const stroke = kind === 'memo' ? C.OLIVE : kind === 'note' ? C.MINERAL : C.CLAY;
  return (
    <svg viewBox="0 0 26 26" style={s} aria-hidden="true">
      <path d="M6 3.5h9.5L20 8v14.5H6z" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M15.5 3.5V8H20" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12.5h8M9 15.5h8M9 18.5h5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function Slide_Case() {
  const req = (id, t, top) => (
    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${C.LINE}`, fontSize: 15.5 }}>
      <b style={{ fontFamily: MONO, fontSize: 13, width: 26, color: top ? C.RUST : C.GRAY }}>{id}</b>
      <span style={{ fontWeight: top ? 700 : 400 }}>{t}</span>
      {top && <span style={{ marginLeft: 'auto', font: `600 12px/1 ${MONO}`, letterSpacing: '0.08em', color: '#fff', background: C.CLAY, borderRadius: 6, padding: '5px 8px', whiteSpace: 'nowrap' }}>最優先</span>}
    </div>
  );
  const day = (d, t, on) => (
    <span key={t} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 14, height: 14, borderRadius: 7, background: on ? C.CLAY : '#fff', border: `2px solid ${on ? C.CLAY : C.SKY}` }} />
      <span style={{ font: `600 12px/1 ${MONO}`, color: C.SLATE }}>{d}</span>
      <span style={{ fontSize: 12, color: C.GRAY }}>{t}</span>
    </span>
  );
  const file = (kind, path, what) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '17px 0', borderBottom: `1px solid ${C.LINE}` }}>
      <FileIcon kind={kind} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 15.5, color: C.SLATE, overflowWrap: 'anywhere' }}>{path}</div>
        <div style={{ fontSize: 15.5, color: C.GRAY, marginTop: 3 }}>{what}</div>
      </div>
    </div>
  );
  return (
    <Slide label="The case" padding="40px 72px 58px">
      <Head kicker="あなたの役" h2={ph('あなたはコンサルタント。', 'Meridian Components から RFP が届いた')} />
      <div style={{ display: 'flex', gap: 34, flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1.08, minWidth: 0, background: '#fff', border: `1px solid ${C.LINE}`, borderRadius: 6, padding: '18px 26px 16px', boxShadow: '0 14px 34px rgba(20,20,19,0.12)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `2px solid ${C.SLATE}`, paddingBottom: 8 }}>
            <span style={{ fontSize: 19, fontWeight: 700 }}>提案依頼書（RFP）</span>
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.GRAY }}>MC-2026-0417</span>
          </div>
          <div style={{ fontSize: 13.5, color: C.INK, lineHeight: 1.6, margin: '8px 0 6px' }}>
            <b>Meridian Components, Inc.</b> · 産業用オートメーション部品のディストリビューター。倉庫はサンフランシスコ、ロンドン、東京。<br />
            依頼：<b>在庫管理ダッシュボードのモダナイズと機能拡張</b>
          </div>
          <div style={{ font: `600 12px/1.4 ${MONO}`, letterSpacing: '0.1em', color: C.GRAY, marginTop: 4 }}>必須項目（優先順位順）</div>
          {req('R1', '概要ページ（ダッシュボード）の改修', true)}
          {req('R2', 'Reports モジュールの改修')}
          {req('R3', '発注推奨機能（新規）')}
          {req('R4', 'ブラウザテストの自動化')}
          {req('R5', 'アーキテクチャドキュメント')}
          <div style={{ fontSize: 13, color: C.GRAY, marginTop: 7 }}>希望項目：D1 UI のモダナイズ · D2 国際化対応 · D3 ダークモード</div>
          <div style={{ font: `600 12px/1.4 ${MONO}`, letterSpacing: '0.1em', color: C.GRAY, marginTop: 14, marginBottom: 5 }}>評価基準（配点比率）</div>
          <div style={{ display: 'flex', height: 26, borderRadius: 6, overflow: 'hidden', fontSize: 12.5, fontWeight: 500, color: '#fff' }}>
            {[['技術アプローチと要件理解 40%', 40, C.SLATE], ['関連実績 25%', 25, C.SKY], ['スケジュール 20%', 20, C.MINERAL], ['価格 15%', 15, C.CLAY]].map(([t, w, c]) => (
              <span key={t} style={{ flex: w, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>{t}</span>
            ))}
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', marginTop: 'auto', padding: '10px 18px 0' }}>
            <span style={{ position: 'absolute', left: 30, right: 30, top: 16, height: 2, background: C.OAT }} />
            {day('4/17', '発行')}
            {day('4/28', '質問の締切')}
            {day('5/8', '提案の提出', true)}
          </div>
        </div>
        <div style={{ flex: 0.92, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ font: `600 12px/1.4 ${MONO}`, letterSpacing: '0.12em', color: C.GRAY }}>手元にある資料</div>
          {file('doc', 'docs/rfp/MC-2026-0417.md', 'RFP の本体')}
          {file('note', 'docs/rfp/meridian-background.md', '自社でまとめた、クライアントの背景メモ')}
          {file('memo', 'docs/rfp/vendor-handoff.md', '前任ベンダーの引き継ぎメモ')}
          {file('code', 'client/ · server/', '前任ベンダーが残したソースコード')}
          <div style={{ marginTop: 'auto', background: C.SLATE, color: C.IVORY, borderRadius: 12, padding: '14px 20px' }}>
            <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.4, marginBottom: 4 }}>エンジニアでなくても進められます</div>
            <div style={{ fontSize: 15, color: 'rgba(250,249,245,0.82)', lineHeight: 1.6 }}>決めるのはあなた。文章とコードは Claude が書きます。</div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ── Agenda: one bar per step, sized by its planned minutes (tutor/steps/index.json is the source) ── */
const STEPS_P1 = [
  ['00', 'ようこそ · 環境の確認と「いまどこ？」', 3],
  ['01', '読む：このワークショップの進め方', 4],
  ['02', '読む：RFP とは', 4],
  ['03', 'RFP を読み込み、理解を整理する', 4, '@ でファイルを参照'],
  ['04', 'RFP の穴を探す', 6],
  ['05', '提案の方針を決める · 提案書は Claude が書く', 8, '選択式の質問'],
  ['06', 'HTML ページとスライドにする', 5],
];
const STEPS_P2 = [
  ['07', '受注 · アプリを起動して症状を確かめる', 6, '/start（カスタムコマンド）'],
  ['08', 'R1 の原因を調べて計画する', 6, 'Plan Mode（Shift+Tab）'],
  ['09', 'R1 を直し、ブラウザで確かめてコミット', 22],
  ['10', 'コードレビュー · 直す指摘を選ぶ', 10, 'サブエージェント'],
  ['11', 'まとめ · 進捗レポート', 7],
];
function Slide_Agenda() {
  const rowOf = (color) => ([n, t, m, chip]) => (
    <div key={n}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 15.5 }}>
        <span style={{ font: `12px/1 ${MONO}`, color: C.GRAY, width: 20, flexShrink: 0 }}>{n}</span>
        <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</span>
        {chip && <span style={{ marginLeft: 'auto', fontSize: 12.5, padding: '3px 8px', borderRadius: 6, background: '#D9775722', border: '1px solid #D9775755', color: C.RUST, whiteSpace: 'nowrap', flexShrink: 0 }}>{chip}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingLeft: 28 }}>
        <span style={{ height: 11, width: `${(m / 22) * 86}%`, background: color, borderRadius: 6 }} />
        <span style={{ font: `12px/1 ${MONO}`, color: C.GRAY, whiteSpace: 'nowrap' }}>{m} 分</span>
      </div>
    </div>
  );
  const part = (flex, bg, k, title, mins, rows, color) => (
    <div style={{ flex, background: bg, borderRadius: 14, padding: '14px 20px 8px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span><span style={{ font: `600 12px/1 ${MONO}`, letterSpacing: '0.12em', color: C.CLAY, marginRight: 10 }}>{k}</span><b style={{ fontSize: 19 }}>{title}</b></span>
        <span style={{ font: `13px/1 ${MONO}`, color: C.GRAY, whiteSpace: 'nowrap' }}>約 {mins} 分</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingBottom: 6 }}>{rows.map(rowOf(color))}</div>
    </div>
  );
  return (
    <Slide label="Agenda" padding="38px 72px 56px">
      <Head kicker="今日の流れ" h2={ph('応札する第1幕、', '納品する第2幕、', '最後に進捗レポート')} />
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {part(1, C.TINT, '第1幕', 'RFP に応札する', 34, STEPS_P1, C.SKY)}
        {part(1, '#F4E9E3', '第2幕', '受注した案件を納品する', 51, STEPS_P2, C.CLAY)}
      </div>
      <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.6, color: C.GRAY, display: 'flex', justifyContent: 'space-between', gap: 24 }}>
        <span>合計 {nb('約 85 分')} + 予備 {nb('約 5 分')} = 予算 {nb('90 分')}</span>
        <span><span style={{ color: C.RUST }}>色付きのラベル</span> = そのステップで初めて使う Claude Code の機能</span>
      </div>
    </Slide>
  );
}

/* ── The app and R1 — drawn in the app's own light palette, every KPI tile as the app shows it ── */
const APP = { bg: '#f8fafc', card: '#ffffff', ink: '#0f172a', sub: '#64748b', line: '#e2e8f0', blue: '#2563eb', blueBg: '#eff6ff', green: '#10b981' };
function AppMock({ phase }) {
  const sel = (label, value, on) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10.5, color: APP.sub, marginBottom: 3 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: '5px 8px', fontSize: 12, color: APP.ink, outline: `2.5px solid ${on ? C.CLAY : 'transparent'}`, outlineOffset: 2, transition: 'outline-color 0.35s ease' }}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{value}</span><span style={{ color: APP.sub, fontSize: 9 }}>▼</span>
      </div>
    </div>
  );
  const kpi = (label, value, goal, w, ok, flex) => (
    <div style={{ flex: flex || 1, minWidth: 0, background: APP.card, border: `1px solid ${APP.line}`, borderRadius: 9, padding: '8px 9px' }}>
      <div style={{ fontSize: 10, color: APP.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: APP.ink, margin: '2px 0 1px', whiteSpace: 'nowrap' }}>{value}</div>
      <div style={{ fontSize: 9, color: APP.sub, whiteSpace: 'nowrap', overflow: 'hidden' }}>{goal}</div>
      <div style={{ height: 4, background: APP.line, borderRadius: 2, marginTop: 5 }}><div style={{ width: w, height: '100%', background: ok ? APP.green : APP.blue, borderRadius: 2 }} /></div>
    </div>
  );
  const tab = (t, on) => <span key={t} style={{ fontSize: 12, padding: '5px 9px', borderRadius: 6, color: on ? APP.blue : APP.sub, background: on ? APP.blueBg : 'transparent', fontWeight: on ? 700 : 400, whiteSpace: 'nowrap' }}>{t}</span>;
  return (
    <div style={{ background: APP.bg, borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 34px rgba(20,20,19,0.18)', border: `1px solid ${C.LINE}`, color: APP.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ background: C.TINT, padding: '6px 12px', fontFamily: MONO, fontSize: 11, color: C.GRAY }}>localhost:3000 · 概要</div>
      <div style={{ background: '#fff', borderBottom: `1px solid ${APP.line}`, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ whiteSpace: 'nowrap' }}><b style={{ fontSize: 14.5 }}>触媒コンポーネンツ</b><span style={{ fontSize: 10.5, color: APP.sub, marginLeft: 8 }}>在庫管理システム</span></div>
        <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>{['概要', '在庫', '注文', '財務', '需要予測', 'Reports'].map((t, i) => tab(t, i === 0))}</div>
      </div>
      <div style={{ position: 'relative', background: '#fff', borderBottom: `1px solid ${APP.line}`, padding: '9px 16px 11px', display: 'flex', gap: 10 }}>
        <Pin n={1} style={{ position: 'absolute', left: -2, top: -8, zIndex: 2 }} />
        {sel('期間', 'すべての月', phase === 0)}
        {sel('場所', 'すべて', phase === 1)}
        {sel('カテゴリ', 'すべて')}
        {sel('注文ステータス', 'すべて')}
      </div>
      <div style={{ padding: '12px 16px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>概要</div>
        <div style={{ position: 'relative' }}>
          <Pin n={2} style={{ position: 'absolute', left: -14, top: -4, zIndex: 2 }} />
          <div style={{ fontSize: 11.5, fontWeight: 700, color: APP.sub, margin: '0 0 6px 16px' }}>主要業績評価指標</div>
          <div style={{ display: 'flex', gap: 7 }}>
            {kpi('在庫回転率', '4.2', '目標: 4.5 (-6.67%)', '93%')}
            {kpi('注文履行数', '187', '目標: 200 (93.50%)', '93%')}
            {kpi('注文充足率', '96.8%', '目標: 95% (+1.80%)', '100%', true)}
            {kpi('収益（注文）年初来', '$31,166,853', '目標: $9.6M (+224.7%)', '100%', false, 1.4)}
            {kpi('平均処理時間（日）', '2.8', '目標: 3.0 (-6.67%)', '93%', true, 1.2)}
          </div>
        </div>
        <div style={{ position: 'relative', flex: 1, minHeight: 0, marginTop: 14, display: 'flex', gap: 10, overflow: 'hidden' }}>
          <div style={{ flex: 1, background: APP.card, border: `1px solid ${APP.line}`, borderRadius: 9, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>注文状況</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <svg viewBox="0 0 42 42" style={{ width: 84, height: 84, flexShrink: 0 }} aria-hidden="true">
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="62 38" strokeDashoffset="25" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="63" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="6" strokeDasharray="12 88" strokeDashoffset="43" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray="6 94" strokeDashoffset="31" />
              </svg>
              <div style={{ fontSize: 11, color: APP.sub, lineHeight: 1.9 }}>
                {[['#10b981', '配達済み'], ['#3b82f6', '出荷済み'], ['#f59e0b', '処理中'], ['#ef4444', 'バックオーダー']].map(([c, t]) => <div key={t}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: c, marginRight: 6 }} />{t}</div>)}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, background: APP.card, border: `1px solid ${APP.line}`, borderRadius: 9, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>カテゴリ別在庫価値</div>
            {[['回路基板', 92], ['センサー', 74], ['コントローラー', 58], ['アクチュエータ', 46], ['電源', 33]].map(([t, w]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, fontSize: 10.5, color: APP.sub }}>
                <span style={{ width: 84, flexShrink: 0, whiteSpace: 'nowrap' }}>{t}</span><span style={{ height: 9, width: `${w * 0.6}%`, background: APP.blue, borderRadius: 3, opacity: 0.85 }} />
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 46, background: `linear-gradient(rgba(248,250,252,0), ${APP.bg})` }} />
        </div>
      </div>
    </div>
  );
}
function Slide_App() {
  // The ring only moves between the two filters the learner is about to try; no value on the mock ever changes.
  const phase = useLoop(2, 1600, 0);
  const pin = (n) => <Pin n={n} size={20} style={{ verticalAlign: '-4px', boxShadow: 'none', margin: '0 3px' }} />;
  return (
    <Slide label="The app and R1" padding="40px 72px 58px">
      <Head kicker="第2幕の題材" h2={ph('最初に直すのは R1：', '概要ページの指標が、', 'フィルターに連動しない')} />
      <div style={{ display: 'flex', gap: 32, flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1.12, minWidth: 0 }}><AppMock phase={phase} /></div>
        <div style={{ flex: 0.88, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#fff', borderLeft: `4px solid ${C.CLAY}`, borderRadius: '0 12px 12px 0', padding: '16px 20px', boxShadow: '0 1px 0 rgba(31,30,29,0.06)' }}>
            <div style={{ fontSize: 17.5, lineHeight: 1.7, fontWeight: 500 }}>「概要ページの主要指標（KPI）が、画面上部の期間・拠点などのフィルターを変えても更新されない。」</div>
            <div style={{ font: `12px/1.4 ${MONO}`, color: C.GRAY, marginTop: 7 }}>RFP §3.1 · R1（クライアントの最優先）</div>
          </div>
          <div style={{ fontSize: 15, color: C.INK, lineHeight: 1.7, margin: '14px 0 0' }}>オペレーションチームは数字を信用できず、表計算ソフトで集計し直しています。</div>
          <div style={{ marginTop: 18, background: '#fff', border: `1.5px solid ${C.CLAY}`, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ font: `600 12px/1.4 ${MONO}`, letterSpacing: '0.12em', color: C.CLAY, marginBottom: 5 }}>まず、自分の目で確かめる</div>
            <div style={{ fontSize: 16.5, lineHeight: 1.75 }}>{pin(1)}を切り替えると、{pin(2)}のどの数字が変わり、どれが変わらないか。</div>
          </div>
          <div style={{ marginTop: 'auto', background: C.SLATE, color: C.IVORY, borderRadius: 12, padding: '12px 18px', fontSize: 14.5, lineHeight: 1.6 }}>
            <b>R2〜R5 は次のフェーズです。</b>今日の進捗レポートに、引き継ぎとしてまとめます。
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ── Live map and progress report: captures of the real pages, fed with one sample run ── */
function Shot({ src, url, alt, flex, size, pins, bg, bare, fit }) {
  // The image always fills the frame's width. `size` is the image's own width / height: with it, `pins` (x and y in
  // percent of the whole image) stay on their spot at any frame size. `bare` drops the browser bar and sizes the frame
  // to the image. `fit` keeps the browser bar but lets the frame take the image's height instead of the column's.
  const body = (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', aspectRatio: String(size) }}>
      <img src={src} alt={alt} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto', display: 'block' }} />
      {(pins || []).map((p) => <span key={p.n} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)', display: 'inline-flex' }}><Pin n={p.n} c={p.c} /></span>)}
    </div>
  );
  if (bare) {
    return <div style={{ position: 'relative', flex: '0 0 auto', width: '100%', aspectRatio: String(size), background: bg || '#fff', border: `1px solid ${C.LINE}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 6px 18px rgba(20,20,19,0.08)' }}>{body}</div>;
  }
  return (
    <div style={{ flex: flex || 1, minHeight: 0, minWidth: 0, alignSelf: fit ? 'flex-start' : 'stretch', display: 'flex', flexDirection: 'column', background: bg || '#fff', border: `1px solid ${C.LINE}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 28px rgba(20,20,19,0.10)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.TINT, padding: '6px 12px', fontFamily: MONO, fontSize: 12, color: C.GRAY, flex: '0 0 auto' }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: '#D9CFC0' }} /><span style={{ width: 8, height: 8, borderRadius: 4, background: '#D9CFC0' }} /><span style={{ width: 8, height: 8, borderRadius: 4, background: '#D9CFC0', marginRight: 6 }} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{url}</span>
      </div>
      <div style={fit ? { position: 'relative', aspectRatio: String(size), overflow: 'hidden' } : { flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>{body}</div>
    </div>
  );
}
function Callout({ n, c, title, children }) {
  return (
    <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
      <span style={{ position: 'relative', top: 2, display: 'inline-flex' }}><Pin n={n} c={c} /></span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 17.5, fontWeight: 700, lineHeight: 1.35, color: C.SLATE }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: C.INK, marginTop: 1 }}>{children}</div>
      </div>
    </div>
  );
}
function Slide_Map() {
  return (
    <Slide label="Live map" padding="40px 72px 56px">
      <Head kicker="途中で" h2={ph('「いまどこ？」ページが、', '現在地とペースを示し続ける')} />
      <div style={{ display: 'flex', gap: 26, flex: 1, minHeight: 0 }}>
        <Shot fit flex={1.25} src="assets/map-top.png" size={1300 / 910} url="localhost:8766/map.html" alt="ステップ 09 の時点の「いまどこ？」ページの上半分。現在のステップ、経過時間、予定終了、ペース、90 分の予算の帯、いまやること" pins={[{ n: 1, x: 22, y: 30.4 }, { n: 2, x: 67.5, y: 63.8 }, { n: 3, x: 42, y: 80.6 }]} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
          <Callout n={1} title="現在地が 1 行でわかる">いまのステップと、完了した数。このタブは開いたままにします。</Callout>
          <Callout n={2} title="90 分の予算とペース">帯が経過時間、縦線がいまのステップの予定終了。遅れたら、Claude が次を短めに運びます。</Callout>
          <Callout n={3} title="いまやること">ターミナルに戻らなくても、次の一手がわかります。</Callout>
          <Shot bare src="assets/map-act2.png" size={1100 / 480} alt="同じページの下にある全体マップの第2幕。終わったステップにはチェックと完了時刻が付き、いまのステップは黒い帯で示される" pins={[{ n: 4, x: 66, y: 24.5 }]} />
          <Callout n={4} title="全体マップ">チェックは、Claude が完了を確かめた時点で付きます。</Callout>
        </div>
      </div>
    </Slide>
  );
}
function Slide_Report() {
  const G = C.GREEN;
  const chip = (t) => <span key={t} style={{ fontSize: 12.5, padding: '3px 8px', borderRadius: 6, background: '#fff', border: `1px solid ${C.LINE}`, color: C.INK, whiteSpace: 'nowrap' }}>{t}</span>;
  return (
    <Slide label="Progress report" padding="40px 72px 56px">
      <Head kicker="最後に" h2={ph('今日の進捗を、', 'レポートに自動でまとめる')} />
      <div style={{ display: 'flex', gap: 26, flex: 1, minHeight: 0 }}>
        <Shot fit flex={1.25} src="assets/report-top.png" size={1300 / 894} url="localhost:8766/proposal/progress-report.html" alt="進捗レポートの冒頭。今日の見出しと要約、日付、案件、完了したステップ、かかった時間。その下に概要の 4 つの数字" pins={[{ n: 1, x: 95.5, y: 17.3, c: G }, { n: 2, x: 50, y: 78.2, c: G }]} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
          <Callout n={1} c={G} title="今日の成果を、見出しひとつで">文章は Claude が書き、数字はあなたの実行記録から取ります。</Callout>
          <Callout n={2} c={G} title="概要の数字">成果物、納品したコミット、テスト、かかった時間。</Callout>
          <Shot bare src="assets/report-timeline.png" size={1100 / 498} alt="同じレポートのタイムライン。1 ステップにつき 1 行で、目安の時間の帯と、実際にかかった時間の帯が並ぶ" pins={[{ n: 3, x: 56, y: 39, c: G }]} />
          <Callout n={3} c={G} title="予定と実績のタイムライン">{nb('1 ステップ')}につき {nb('1 行')}。目安の時間と、実際の時間。</Callout>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ font: `600 12px/1.4 ${MONO}`, letterSpacing: '0.1em', color: C.GRAY, marginBottom: 5 }}>さらに下</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{['提案書', '納品', 'コードレビュー', '判断と軌道修正', '引き継ぎ', '使った機能'].map(chip)}</div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ── What you keep: the repository itself, drawn as a tree ─────────────────── */
function Slide_Keep() {
  const dim = 'rgba(250,249,245,0.55)';
  const row = (glyph, name, what, c) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, padding: '7px 0' }}>
      <span style={{ fontFamily: MONO, fontSize: 17, whiteSpace: 'pre', width: '44%', flexShrink: 0 }}><span style={{ color: dim }}>{glyph}</span><span style={{ color: c || C.IVORY }}>{name}</span></span>
      <span style={{ fontSize: 16, color: 'rgba(250,249,245,0.82)', lineHeight: 1.5 }}>{what}</span>
    </div>
  );
  return (
    <Slide bg={C.SLATE} color={C.IVORY} label="What you keep" padding="42px 72px 60px">
      <Head dark kicker="終わったあと" h2={ph('作ったものは、', 'リポジトリのファイルとコミットとして', '手元に残る')} />
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(250,249,245,0.05)', border: '1px solid rgba(250,249,245,0.14)', borderRadius: 14, padding: '14px 30px' }}>
        {row('', 'meridian-workshop-jp/', 'あなたの fork', '#E8A48C')}
        {row('├─ ', 'proposal/', '')}
        {row('│  ├─ ', 'proposal.md', <span>あなたの{nb(' 4 つ')}の判断をもとに、Claude が書いた提案書</span>, '#E8A48C')}
        {row('│  ├─ ', 'proposal.html', '同じ提案書の、読む用のページ', '#E8A48C')}
        {row('│  ├─ ', 'capabilities-deck.html', '同じ提案書の、プレゼン用のスライド', '#E8A48C')}
        {row('│  └─ ', 'progress-report.html', '今日の成果、レビューの指摘と判断、次フェーズへの引き継ぎ', '#9CC3B5')}
        {row('└─ ', 'client/ · server/', <span>ブランチ <span style={{ fontFamily: MONO, fontSize: 15 }}>fix/overview-filters</span></span>)}
        {row('   ● ', '概要ページの KPI を直したコミット', '', '#9CC3B5')}
        {row('   ● ', 'レビューの指摘を直したコミット', '', '#9CC3B5')}
      </div>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, fontSize: 16 }}>
        <span style={{ background: C.CLAY, color: '#fff', borderRadius: 999, padding: '7px 16px', fontWeight: 700, whiteSpace: 'nowrap' }}>fork に push → Pull Request</span>
        <span style={{ color: 'rgba(250,249,245,0.82)' }}>最後に Pull Request を作るところまで、Claude が手伝います。</span>
      </div>
    </Slide>
  );
}

/* ── Help ──────────────────────────────────────────────────────────────────── */
function Slide_Help() {
  const term = (lines) => (
    <div style={{ marginTop: 'auto', background: C.SLATE, borderRadius: 10, padding: '13px 16px', fontFamily: MONO, fontSize: 14.5, lineHeight: 1.75, color: 'rgba(250,249,245,0.9)' }}>
      {lines.map(([who, t], i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: who === 'claude' ? 'rgba(250,249,245,0.5)' : C.CLAY, flexShrink: 0 }}>{who === 'claude' ? '◆' : who === 'out' ? ' ' : who === 'you' ? '>' : '$'}</span>
          <span style={{ color: who === 'out' ? '#9CC3B5' : who === 'claude' ? 'rgba(250,249,245,0.9)' : C.IVORY }}>{t}</span>
        </div>
      ))}
    </div>
  );
  const card = (k, t, body, lines) => (
    <div style={{ flex: 1, background: '#fff', border: `1px solid ${C.LINE}`, borderRadius: 14, padding: '22px 26px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ font: `600 13.5px/1.4 ${MONO}`, letterSpacing: '0.12em', color: C.CLAY }}>{k}</div>
      <div style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.4, margin: '8px 0 10px' }}>{t}</div>
      <div style={{ fontSize: 17, color: C.INK, lineHeight: 1.75, marginBottom: 16 }}>{body}</div>
      {term(lines)}
    </div>
  );
  return (
    <Slide label="Help" padding="42px 72px 58px">
      <Head kicker="知っておくとよいこと" h2={ph('行き詰まっても、中断しても、', '続きから再開できる')} />
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center' }}><div style={{ display: 'flex', gap: 16, alignItems: 'stretch', width: '100%' }}>
        {card('行き詰まったら', ph('そのまま Claude に', '伝えます。'), '足りないものを一緒に片付けます。時間がなければ、確認して先へ進めます。', [['you', 'アプリが起動しません'], ['claude', 'uv が見つからないようです。入れ方を案内します。']])}
        {card('中断するとき', ph('./start.sh を', 'もう一度実行します。'), 'いつ終了しても構いません。同じステップから再開します。', [['sh', './start.sh'], ['you', 'こんにちは'], ['claude', 'おかえりなさい。ステップ 08 の続きから始めます。']])}
        {card('やり直すとき', ph('スクリプト 1 つで', '戻せます。'), 'リポジトリを出発点に戻します。作業は、退避用のブランチに残ります。', [['sh', './reset-demo.sh'], ['out', 'これまでの作業はブランチ tutor-backup-20260923-141205 に残しました。'], ['out', 'リセットしました。']])}
      </div></div>
    </Slide>
  );
}

/* ── Getting started, and back to the terminal ─────────────────────────────── */
function Slide_Start() {
  const need = (t, s) => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '9px 0', borderBottom: `1px solid ${C.LINE}` }}>
      <b style={{ fontSize: 17, width: 160, flexShrink: 0 }}>{t}</b><span style={{ fontSize: 14.5, color: C.GRAY, lineHeight: 1.5 }}>{s}</span>
    </div>
  );
  const ln = (n, body) => <div><span style={{ color: C.CLAY }}>{n}</span>&nbsp;&nbsp;{body}</div>;
  return (
    <Slide label="Start" padding="40px 72px 58px">
      <Head kicker="始め方" h2={ph('リポジトリを clone して、', 'コマンドを 1 つ実行する')} />
      {/* The terminal spans the full width so the clone command is never cut off, whatever monospace font the machine has. */}
      <div style={{ background: C.SLATE, borderRadius: 14, padding: '12px 28px', fontFamily: MONO, fontSize: 18, lineHeight: 2, whiteSpace: 'nowrap', color: C.IVORY, boxShadow: '0 10px 30px rgba(0,0,0,0.18)' }}>
        {ln(1, 'git clone https://github.com/yuki-ant/meridian-workshop-jp')}
        {ln(2, <span>cd meridian-workshop-jp && ./start.sh<span style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(250,249,245,0.5)', marginLeft: 22 }}>Windows では start.cmd</span></span>)}
        <div style={{ borderTop: '1px solid rgba(250,249,245,0.18)', marginTop: 4 }}>
          <span style={{ color: C.CLAY }}>3</span>&nbsp;&nbsp;<span style={{ color: 'rgba(250,249,245,0.6)' }}>&gt;</span> こんにちは<span style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(250,249,245,0.5)', marginLeft: 22 }}>Claude が起動したら、こう話しかけます</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 36, flex: 1, minHeight: 0, alignItems: 'stretch', marginTop: 14 }}>
        <div style={{ flex: 1.12, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <div style={{ fontSize: 15, color: C.GRAY, lineHeight: 1.75 }}>
            {code('start.sh', 14)} は、チューターのプラグインをこのセッションにだけ読み込んで {code('claude', 14)} を起動します。最後に Pull Request を作りたい方は、先に GitHub で fork して、自分の fork を clone してください。
          </div>
          <div style={{ background: '#fff', border: `1.5px solid ${C.CLAY}`, borderRadius: 12, padding: '13px 20px' }}>
            <div style={{ fontSize: 21, fontWeight: 700, marginBottom: 3 }}>あなたの Claude Code には、何も追加されません。</div>
            <div style={{ fontSize: 14.5, color: C.INK, lineHeight: 1.65 }}>チューター（Claude を案内役にするプラグイン）が働くのは、このセッションだけです。ほかの場所で {code('claude', 13.5)} を起動したときの動きは変わりません。</div>
          </div>
        </div>
        <div style={{ flex: 0.88, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ font: `600 12px/1.4 ${MONO}`, letterSpacing: '0.12em', color: C.GRAY }}>必要なもの</div>
          {need('Claude Code', 'インストール済み、サインイン済み')}
          {need('Node.js 18 以上', 'チューターとフロントエンドが使用')}
          {need('uv', '第2幕でバックエンドが使用。なければ Claude が案内')}
          {need('Python 3.11 以上', '第2幕でバックエンドが使用')}
          {need('git', 'リポジトリを clone し、作業をコミット')}
          {need('ブラウザ', '「いまどこ？」ページと、読むページを表示')}
        </div>
      </div>
      <div style={{ marginTop: 12, background: C.CLAY, color: '#fff', borderRadius: 12, padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 18, boxShadow: '0 6px 24px rgba(0,0,0,0.15)' }}>
        <span style={{ fontSize: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>では、ターミナルへ。</span>
        <span style={{ fontSize: 15, lineHeight: 1.6 }}>Claude が待っている方は、戻って <b style={{ fontFamily: MONO }}>Done</b> と送ってください。これから始める方は、上のコマンドを実行してください。</span>
      </div>
    </Slide>
  );
}

/* ── Thanks ────────────────────────────────────────────────────────────────── */
function Slide_Thanks() {
  return (
    <Slide bg={C.SLATE} color={C.IVORY} label="Thanks" center>
      <span style={{ width: 44, height: 4, background: C.CLAY, display: 'inline-block', borderRadius: 2, marginBottom: 30 }} />
      <h1 style={{ fontSize: 54, fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 16px' }}>ありがとうございました</h1>
      <div style={{ fontSize: 24, fontWeight: 500, color: C.CLAY, textAlign: 'center' }}>ここからは、Claude が案内します。</div>
    </Slide>
  );
}

const SLIDES = [
  { c: Slide_Title, title: 'Claude が Claude を教える', notes: 'パートナー向けの、セルフペース型の Claude ハンズオンワークショップです。進めるのは講師ではなく、Claude Code 自身です。あなたのターミナルの中で、約 90 分かけて 1 ステップずつ案内します。題材は、Meridian Components という架空のクライアントの RFP です。第1幕でコンサルタントとして応札し、受注した第2幕で、最初の改修を納品します。' },
  IS_PRESENT && window.PRESENTER && window.PRESENTER.name && { c: Slide_Speaker, title: '講師紹介', notes: '自己紹介です。名前と所属、これまでの経歴を、30 秒ほどで話します。' },
  { c: Slide_How, title: 'Claude が 1 ステップずつ案内し、あなたが判断して手を動かす', notes: '進み方は、いつも同じです。Claude が次にやることと目安の時間を伝えます。短いページを読むこともあります。読み終えたり、作業が終わったりしたら、ターミナルに戻って「Done」と送ります。「できました」でも構いません。スラッシュコマンド、Shift+Tab、@ によるファイル参照、許可の確認は、あなたにしか入力できないので、Claude は何を入力するかを伝えて待ちます。そのあと Claude が、リポジトリの状態と記録を見て、そのステップの完了条件が満たされているかを確かめます。読むだけのステップは、「Done」でそのまま進みます。[ターミナル、ページ、緑の囲みの順に指す]' },
  { c: Slide_Case, title: 'あなたはコンサルタント。Meridian Components から RFP が届いた', notes: 'あなたの役は、RFP に応札するコンサルタントです。クライアントは Meridian Components。産業用オートメーション部品のディストリビューターで、倉庫はサンフランシスコ、ロンドン、東京にあります。依頼は、在庫管理ダッシュボードのモダナイズと機能拡張です。必須項目は R1 から R5 までで、優先順位順に並んでいます。最優先の R1 が、今日の第2幕で直すものです。手元には、RFP の本体、自社でまとめた背景メモ、前任ベンダーの引き継ぎメモ、そしてソースコードがあります。エンジニアでなくても進められます。決めるのはあなたで、提案書の文章とコードは Claude が書きます。' },
  { c: Slide_Agenda, title: '応札する第1幕、納品する第2幕、最後に進捗レポート', notes: '全体は 12 ステップです。第1幕は約 34 分。RFP とは何かを読み、実際の RFP を @ で読み込み、決めないと見積もれない点を探し、提案の方針を 4 つ決めます。提案書の文章は Claude が一気に書き、HTML のページとスライドにもします。第2幕は約 51 分。/start でアプリを起動して症状を確かめ、Plan Mode で原因を調べ、直してコミットし、サブエージェントのレビューから直す指摘を選びます。いちばん長いのは R1 を直すステップで、22 分です。最後に Claude が進捗レポートを作ります。合計は約 85 分で、5 分ほどの予備があります。色付きのラベルは、そのステップで初めて使う Claude Code の機能です。必要になったときに Claude が紹介します。' },
  { c: Slide_App, title: '最初に直すのは R1：概要ページの指標が、フィルターに連動しない', notes: '第2幕で手を入れるのが、このアプリです。Vue 3 と FastAPI の小さな在庫ダッシュボードで、データは JSON ファイル、データベースはありません。画面の上に期間や場所のフィルターがあり、その下に主要な指標が並びます。RFP には、フィルターを変えても指標が更新されない、と書かれています。ただし、書かれているのは症状だけです。どの数字が変わって、どれが変わらないのかは、アプリを起動して自分の目で確かめます。そのうえで Plan Mode で原因を調べ、直してコミットし、サブエージェントにレビューさせます。R2 から R5 は次のフェーズで、最後のレポートに引き継ぎとしてまとめます。[1 番のフィルター、2 番の指標の順に指す]' },
  { c: Slide_Map, title: '「いまどこ？」ページが、現在地とペースを示し続ける', notes: '進行中の様子です。最初のステップで Claude がこのページをブラウザで開き、あとは自動で更新し続けます。タブは開いたままにしておいてください。1 番、いまのステップと完了した数。2 番、90 分の予算に対する経過時間の帯と、いまのステップを予定どおり終えたときの時刻を示す縦線。3 番、いまやること。4 番、同じページの下にある全体マップです。チェックは「Done」と言った時点ではなく、Claude が完了を確かめた時点で付きます。画面は、サンプルのデータで表示した例です。' },
  { c: Slide_Report, title: '今日の進捗を、レポートに自動でまとめる', notes: '終わったときの様子です。最後のステップで Claude にレポートを頼むと、数字はチューターが実行記録から埋め、文章は Claude が書いて、ブラウザで開きます。コンサルタントがクライアントと自社に渡す進捗レポートの形になっていて、今日の成果、予定と実績のタイムライン、提案書、納品したコミット、コードレビュー、判断と軌道修正、そして次フェーズへの引き継ぎが 1 ページにまとまります。画面は、サンプルのデータで表示した例です。' },
  { c: Slide_Keep, title: '作ったものは、リポジトリのファイルとコミットとして手元に残る', notes: 'ここで作るものは、どれもリポジトリの中の実際のファイルとコミットです。proposal フォルダーには、提案書と、その HTML ページとスライド、そして進捗レポートが入ります。コードの変更は、作業ブランチ fix/overview-filters のコミットとして残ります。概要ページを直したコミットと、レビューの指摘を直したコミットです。最後に、自分の fork に push して Pull Request を作るところまで、Claude が手伝います。' },
  { c: Slide_Help, title: '行き詰まっても、中断しても、続きから再開できる', notes: '行き詰まったら、そのまま Claude に伝えてください。足りないものを一緒に片付けるか、時間がなければ確認のうえで先へ進めます。中断したときは、start.sh をもう一度実行すれば同じステップに戻れます。進捗は tutor/state フォルダーに保存されています。最初からやり直すときは reset-demo.sh です。それまでの作業は退避用のブランチに残ります。' },
  { c: Slide_Start, title: 'リポジトリを clone して、コマンドを 1 つ実行する', notes: '始め方です。リポジトリを clone して、start.sh を実行し、Claude に「こんにちは」と声をかけるだけです。最後に Pull Request を作りたい方は、先に GitHub で fork して、自分の fork を clone してください。start.sh は、このセッションにだけチューターのプラグインを読み込んで Claude Code を起動します。あなたの Claude Code には何も追加されません。必要なのは、Claude Code、Node.js 18 以上、uv、Python 3.11 以上、git、ブラウザです。uv と Python は第2幕まで使いません。では、ターミナルに戻りましょう。Claude が待っている方は「Done」と送ってください。これから始める方は、このコマンドを実行してください。' },
  { c: Slide_Thanks, title: 'ありがとうございました', notes: '説明は以上です。ここからは、Claude が 1 ステップずつ案内します。ご質問があればどうぞ。' },
].filter(Boolean);

mountDeck(SLIDES);
