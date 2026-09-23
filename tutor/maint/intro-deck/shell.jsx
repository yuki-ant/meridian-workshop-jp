/* shell.jsx — the small runtime of the introduction deck: one 1280×720 canvas scaled to the window, keyboard and
   button navigation, a page counter, an overview of page thumbnails (Esc), presenter notes (N) and a print view (?print). Everything the slides share
   (palette, fonts, Slide, the phrase helpers, the animation hook) is defined here. build.mjs compiles this file and
   slides.jsx into one script, so they share a scope; nothing is put on window. */

const { useState, useEffect, useRef } = React;

const CANVAS_W = 1280;
const CANVAS_H = 720;
const QS = new URLSearchParams(location.search);
const IS_PRINT = QS.has('print');
// ?static freezes every animation on its most telling frame (screenshots, print).
const IS_STATIC = IS_PRINT || QS.has('static');
// ?present adds the speaker page: for an instructor showing the deck to a room. A learner reading alone does not get it.
const IS_PRESENT = QS.has('present');

// Same palette and font stacks as tutor/pages/assets/page.css, so the deck reads as one of the workshop's pages.
const C = {
  IVORY: '#FAF9F5', SLATE: '#141413', CLAY: '#D97757', OAT: '#E3DACC', TINT: '#F0EEE6',
  SKY: '#6A9BCC', OLIVE: '#788C5D', MINERAL: '#629987', GRAY: '#73726C', LINE: 'rgba(31,30,29,0.12)',
  INK: '#3d3d3a', GREEN: '#3d6f60', RUST: '#a5482b',
};
const SANS = '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, -apple-system, "Segoe UI", system-ui, sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Noto Sans JP", monospace';

// Japanese breaks anywhere, so long titles are given as phrases: a line may only break between two of them.
const ph = (...a) => a.map((x, i) => <span key={i} style={{ display: 'inline-block' }}>{x}</span>);
// A number stays with its counter (1 つ, 90 分): wrap the pair so no line can break between them.
const nb = (t) => <span style={{ whiteSpace: 'nowrap' }}>{t}</span>;

function Slide({ bg = C.IVORY, color = C.SLATE, children, label, padding = '44px 72px 60px', center = false }) {
  return (
    <div data-screen-label={label} style={{ position: 'absolute', inset: 0, background: bg }}>
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%', width: CANVAS_W, height: CANVAS_H,
          transform: 'translate(-50%, -50%) scale(var(--deck-scale, 1))',
          color, padding, display: 'flex', flexDirection: 'column', fontFamily: SANS, overflow: 'hidden', lineBreak: 'strict',
          justifyContent: center ? 'center' : 'flex-start', alignItems: center ? 'center' : 'stretch',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Cycles 0 … count-1 every `ms`; in static mode it stays on `fixed`.
function useLoop(count, ms, fixed) {
  const [i, setI] = useState(IS_STATIC ? fixed : 0);
  useEffect(() => {
    if (IS_STATIC) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % count), ms);
    return () => clearInterval(t);
  }, [count, ms]);
  return i;
}

function readHash(n) {
  const k = parseInt(String(location.hash).replace('#', ''), 10);
  return Number.isFinite(k) && k >= 1 && k <= n ? k - 1 : 0;
}

function Deck({ slides }) {
  const N = slides.length;
  const [idx, setIdx] = useState(() => readHash(N));
  const [notes, setNotes] = useState(false);
  // Esc opens the overview: every page as a live thumbnail, so a reader can jump back and forth without paging.
  const [overview, setOverview] = useState(false);
  const [vw, setVw] = useState(() => window.innerWidth);
  const root = useRef(null);
  const cols = vw >= 1100 ? 4 : vw >= 760 ? 3 : 2;

  useEffect(() => {
    if (IS_PRINT) return undefined;
    const fit = () => {
      const s = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
      if (root.current) root.current.style.setProperty('--deck-scale', String(s));
      setVw(window.innerWidth);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    if (IS_PRINT) return undefined;
    const go = (d) => setIdx((i) => Math.max(0, Math.min(N - 1, i + d)));
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (overview) {
        // In the overview the arrows move the highlight, and Enter, Space or Esc goes back to the highlighted page.
        if (k === 'Escape' || k === 'Enter' || k === ' ') { e.preventDefault(); setOverview(false); }
        else if (k === 'ArrowRight') { e.preventDefault(); go(1); }
        else if (k === 'ArrowLeft') { e.preventDefault(); go(-1); }
        else if (k === 'ArrowDown') { e.preventDefault(); go(cols); }
        else if (k === 'ArrowUp') { e.preventDefault(); go(-cols); }
        else if (k === 'Home') setIdx(0);
        else if (k === 'End') setIdx(N - 1);
        return;
      }
      if (k === 'Escape') { e.preventDefault(); setOverview(true); }
      else if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); go(1); }
      else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); go(-1); }
      else if (k === 'Home') setIdx(0);
      else if (k === 'End') setIdx(N - 1);
      else if (k === 'n' || k === 'N') setNotes((v) => !v);
      else if (k === 'f' || k === 'F') {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    const onHash = () => setIdx(readHash(N));
    window.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onHash);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('hashchange', onHash); };
  }, [N, overview, cols]);

  useEffect(() => {
    if (IS_PRINT) return;
    const want = `#${idx + 1}`;
    if (location.hash !== want) history.replaceState(null, '', want);
    document.title = `${idx + 1} / ${N} · ${slides[idx].title}`;
  }, [idx]);

  if (IS_PRINT) {
    return (
      <div>
        {slides.map((s, i) => (
          <div key={i} className="print-page" style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, overflow: 'hidden' }}>
            <s.c />
          </div>
        ))}
      </div>
    );
  }

  const Cur = slides[idx].c;
  const PAD = 40;
  const GAP = 22;
  const tw = Math.floor((vw - PAD * 2 - GAP * (cols - 1)) / cols);
  const th = Math.round((tw * CANVAS_H) / CANVAS_W);
  const btn = (label, d, off) => (
    <button
      type="button" aria-label={label} disabled={off} onClick={() => setIdx((i) => Math.max(0, Math.min(N - 1, i + d)))}
      style={{ all: 'unset', cursor: off ? 'default' : 'pointer', opacity: off ? 0.3 : 1, padding: '4px 10px', fontSize: 18, lineHeight: 1 }}
    >
      {d < 0 ? '‹' : '›'}
    </button>
  );
  return (
    <div ref={root} style={{ position: 'absolute', inset: 0 }}>
      <Cur key={idx} />
      {notes && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '34%', overflow: 'auto', background: 'rgba(20,20,19,0.94)', color: '#EDEBE3', font: `15px/1.75 ${SANS}`, padding: '16px 28px 56px', borderTop: `2px solid ${C.CLAY}` }}>
          <div style={{ font: `600 11px/1.4 ${MONO}`, letterSpacing: '0.12em', color: C.CLAY, marginBottom: 6 }}>講師用ノート · N で閉じる</div>
          {slides[idx].notes}
        </div>
      )}
      {overview && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: C.SLATE, overflow: 'auto', padding: `28px ${PAD}px 64px`, fontFamily: SANS }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: C.IVORY }}>ページ一覧</span>
            <span style={{ font: `12px/1.4 ${MONO}`, color: 'rgba(250,249,245,0.6)' }}>クリックでそのページへ · 矢印キーで選んで Enter · Esc で戻る</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${tw}px)`, gap: `${GAP}px` }}>
            {slides.map((s, i) => (
              <div
                key={i} role="button" tabIndex={-1} aria-label={`${i + 1} ページへ`} onClick={() => { setIdx(i); setOverview(false); }}
                ref={i === idx ? (el) => { if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); } : null}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ position: 'relative', width: tw, height: th, overflow: 'hidden', borderRadius: 8, outline: i === idx ? `3px solid ${C.CLAY}` : '1px solid rgba(250,249,245,0.2)', outlineOffset: i === idx ? 3 : 0, '--deck-scale': String(tw / CANVAS_W) }}>
                  <s.c />
                  <div style={{ position: 'absolute', inset: 0 }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 12.5, lineHeight: 1.45, color: i === idx ? C.IVORY : 'rgba(250,249,245,0.72)' }}>
                  <span style={{ font: `600 12px/1.5 ${MONO}`, color: C.CLAY, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 3, width: `${((idx + 1) / N) * 100}%`, background: C.CLAY, transition: 'width 0.3s ease', zIndex: 6 }} />
      <div style={{ position: 'absolute', right: 14, bottom: 12, display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(20,20,19,0.78)', color: '#FAF9F5', border: '1px solid rgba(250,249,245,0.22)', borderRadius: 999, padding: '3px 6px', font: `12px/1 ${MONO}`, userSelect: 'none', zIndex: 6 }}>
        <button type="button" aria-label="ページ一覧" title="ページ一覧（Esc）" onClick={() => setOverview((v) => !v)} style={{ all: 'unset', cursor: 'pointer', padding: '4px 8px 4px 10px', display: 'inline-flex' }}>
          <svg viewBox="0 0 14 14" width="13" height="13" aria-hidden="true"><path d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
        </button>
        {btn('前のページ', -1, idx === 0)}
        <span style={{ minWidth: 52, textAlign: 'center' }}>{idx + 1} / {N}</span>
        {btn('次のページ', 1, idx === N - 1)}
      </div>
      {!overview && (
        <div style={{ position: 'absolute', left: 14, bottom: 12, font: `12px/1 ${MONO}`, color: 'rgba(115,114,108,0.9)', userSelect: 'none' }}>
          ← → で移動 · Esc 一覧 · N ノート · F 全画面
        </div>
      )}
    </div>
  );
}

function mountDeck(slides) {
  if (IS_PRINT) document.documentElement.classList.add('print');
  ReactDOM.createRoot(document.getElementById('deck-root')).render(<Deck slides={slides} />);
}
