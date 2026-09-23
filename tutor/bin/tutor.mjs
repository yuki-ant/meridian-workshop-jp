#!/usr/bin/env node
// tutor — the state machine behind the Meridian workshop (RFP bid → first delivery).
// Claude (the tutor) calls this; the learner never has to. Node built-ins only, so it runs wherever Claude Code runs.
// Ported from the "Claude teaches Claude" todo-app tutor; eval / board / report / skip machinery removed.
//
//   tutor hook                 what the session-start hook prints: the teaching rules, where we are, the current step's script
//   tutor status               the map of all steps with ✓ / ▶ / ·
//   tutor show                 the current step's script again
//   tutor check                verify the current step's definition of done against the repository (exit 0 = all pass)
//   tutor next [--force]       check, then move to the next step and print its script
//   tutor goto <step-id>       jump (maintainers and "I already did this" cases)
//   tutor note key=value …     remember something the learner said or decided
//   tutor serve [--stop]       start / stop the local page server (http://localhost:8766)
//   tutor open <page>          print the page's URL and try to open it in the browser
//   tutor stop-all             stop the page server and the app (ports 3000 / 8001)
//   tutor reset                forget all progress (reset-demo.sh calls this)

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync, spawn } from "node:child_process";

const BIN = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN = path.resolve(BIN, "..");
const ROOT = path.resolve(PLUGIN, ".."); // the workshop repository itself; Claude's working directory
const STATE_DIR = path.join(PLUGIN, "state");
const STATE = path.join(STATE_DIR, "progress.json");
const LOG = path.join(STATE_DIR, "log.jsonl");
// 8766, not the todo-app tutor's 8765, so both tutorials can run on one machine without fighting over the port.
const BASE_PORT = Number(process.env.TUTOR_PORT || 8766);
let PORT = BASE_PORT;
const INDEX = JSON.parse(
  fs.readFileSync(path.join(PLUGIN, "steps", "index.json"), "utf8"),
);
const STEPS = INDEX.steps;
const SELF = "node tutor/bin/tutor.mjs";
const SERVER_NAME = "meridian-tutor";
const TOTAL_MIN = STEPS.reduce((a, s) => a + (s.minutes || 0), 0);

// ── state ────────────────────────────────────────────────────────────────────
function now() {
  return new Date().toISOString();
}
function load() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE, "utf8"));
    s.seen ||= [];
    s.notes ||= {};
    s.done ||= [];
    return s;
  } catch {
    return {
      version: 1,
      startedAt: null,
      step: STEPS[0].id,
      done: [],
      notes: {},
      seen: [],
      baseBranch: null,
    };
  }
}
function markSeen(s) {
  if (!s.seen.includes(s.step)) s.seen.push(s.step);
}
// Checks that only read git state, files or recorded notes. A step made only of these is re-verified at session start;
// portOpen is left to `next` because the app is usually stopped when a session starts.
const CHEAP = new Set([
  "repoReady",
  "noteSet",
  "fileExists",
  "globExists",
  "fileContains",
  "onFeatureBranch",
  "committedSince",
  "commitTouches",
  "treeClean",
]);
function save(s) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(s, null, 2));
}
function log(ev, data = {}) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.appendFileSync(LOG, JSON.stringify({ t: now(), ev, ...data }) + "\n");
}
function stepIndex(id) {
  const i = STEPS.findIndex((s) => s.id === id);
  return i < 0 ? 0 : i;
}
function current(s) {
  return STEPS[stepIndex(s.step)];
}

// ── small helpers ────────────────────────────────────────────────────────────
const WIN = process.platform === "win32";
const NEEDS_SHELL = new Set(["npm", "npx"]);
function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 60000,
    shell: WIN && NEEDS_SHELL.has(cmd),
    windowsHide: true,
    ...opts,
  });
  return {
    code: r.status === null ? 1 : r.status,
    out: r.stdout || "",
    all: (r.stdout || "") + (r.stderr || ""),
    err: r.error,
  };
}
function git(...args) {
  return sh("git", args);
}
function canon(p) {
  let r;
  try {
    r = fs.realpathSync.native(p);
  } catch {
    r = path.resolve(p);
  }
  return WIN || process.platform === "darwin" ? r.toLowerCase() : r;
}
function branch() {
  return git("rev-parse", "--abbrev-ref", "HEAD").out.trim();
}
function ownRepo() {
  const top = git("rev-parse", "--show-toplevel");
  if (top.code !== 0)
    return {
      ok: false,
      msg: "このフォルダは git リポジトリではありません（fork をクローンしてください）",
    };
  if (canon(top.out.trim()) !== canon(ROOT))
    return {
      ok: false,
      msg: `ワークショップのフォルダが別のリポジトリ（${top.out.trim()}）の中にあります`,
    };
  if (git("rev-parse", "-q", "--verify", "refs/tags/tutor-base").code !== 0)
    return {
      ok: false,
      msg: "タグ tutor-base がありません（./start.sh を使うと自動で付きます）",
    };
  return {
    ok: true,
    msg: "リポジトリの準備ができています（出発点はタグ tutor-base）",
  };
}
function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}
function read(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), "utf8");
  } catch {
    return "";
  }
}
function has(cmd, flag = "--version") {
  return (
    spawnSync(cmd, [flag], {
      encoding: "utf8",
      shell: WIN && NEEDS_SHELL.has(cmd),
      windowsHide: true,
    }).status === 0
  );
}
// Any HTTP answer at all means something is listening; vite may bind ::1 only, so ask by name, not by 127.0.0.1.
function httpAlive(port, p = "/") {
  return new Promise((resolve) => {
    const req = http.request(
      { host: "localhost", port, path: p, method: "GET", timeout: 1500 },
      (r) => {
        r.resume();
        resolve(true);
      },
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// ── checks: each returns { ok, msg } (or a promise of it) ─────────────────────
const CHECKS = {
  env() {
    const need = [
      ["git", "git"],
      ["node", "Node 18+"],
      ["npm", "npm"],
      ["uv", "uv"],
      [WIN ? "python" : "python3", "Python 3.11+", "-V"],
    ];
    const missing = need
      .filter(([c, , f]) => !has(c, f))
      .map(([, label]) => label);
    return missing.length
      ? {
          ok: false,
          msg: `このマシンに見つからないもの: ${missing.join(", ")}`,
        }
      : { ok: true, msg: "git、Node、npm、uv、Python が揃っています" };
  },
  repoReady() {
    return ownRepo();
  },
  noteSet(key) {
    const s = load();
    return s.notes[key] !== undefined && String(s.notes[key]).trim() !== ""
      ? { ok: true, msg: `${key} = ${s.notes[key]}` }
      : {
          ok: false,
          msg: `「${key}」がまだ記録されていません（${SELF} note ${key}=… で記録）`,
        };
  },
  fileExists(rel) {
    return exists(rel)
      ? { ok: true, msg: `${rel} があります` }
      : { ok: false, msg: `${rel} はまだありません` };
  },
  globExists(dir, ext, min = 1) {
    const d = path.join(ROOT, dir);
    const files = fs.existsSync(d)
      ? fs
          .readdirSync(d)
          .filter(
            (f) => f.endsWith(ext) && fs.statSync(path.join(d, f)).size > 200,
          )
      : [];
    return files.length >= min
      ? {
          ok: true,
          msg: `${dir}/ に ${ext} が ${files.length} 件: ${files.join(", ")}`,
        }
      : {
          ok: false,
          msg: `${dir}/ の ${ext} は ${files.length} 件（${min} 件以上が必要）${files.length ? ": " + files.join(", ") : ""}`,
        };
  },
  fileContains(rel, pattern, label) {
    const t = read(rel);
    if (!t) return { ok: false, msg: `${rel} が読めません` };
    return new RegExp(pattern).test(t)
      ? { ok: true, msg: `${rel}: ${label || pattern} を確認` }
      : { ok: false, msg: `${rel}: ${label || pattern} がまだ見当たりません` };
  },
  async portOpen(port, label) {
    return (await httpAlive(Number(port)))
      ? { ok: true, msg: `${label || "ポート"} ${port} が応答しています` }
      : {
          ok: false,
          msg: `${label || "ポート"} ${port} が応答しません（/start か ./scripts/start.sh で起動）`,
        };
  },
  onFeatureBranch() {
    const b = branch();
    const base = load().baseBranch;
    const ok =
      b &&
      b !== "HEAD" &&
      b !== base &&
      !["main", "main-jp", "master"].includes(b);
    return ok
      ? { ok: true, msg: `作業ブランチ ${b} にいます` }
      : {
          ok: false,
          msg: `まだ ${b || "?"} にいます。改修用のブランチ（例: fix/r1-reports-filters）を切ってください`,
        };
  },
  committedSince(ref) {
    const n = Number(
      git("rev-list", "--count", `${ref}..HEAD`).out.trim() || 0,
    );
    return n > 0
      ? { ok: true, msg: `${ref} 以降のコミット: ${n} 件` }
      : { ok: false, msg: `${ref} 以降のコミットがまだありません` };
  },
  commitTouches(rel) {
    const out = git(
      "log",
      "--format=%h %s",
      "tutor-base..HEAD",
      "--",
      rel,
    ).out.trim();
    return out
      ? { ok: true, msg: `${rel} を変更したコミット: ${out.split("\n")[0]}` }
      : { ok: false, msg: `${rel} を変更したコミットがまだありません` };
  },
  // Only the code the learner is delivering has to be committed; proposal/ drafts from Act 1 may stay untracked.
  treeClean(...paths) {
    const d = git(
      "status",
      "--porcelain",
      "--",
      ...(paths.length ? paths : ["."]),
    ).out.trim();
    return d === ""
      ? {
          ok: true,
          msg: `${paths.join(", ") || "作業ツリー"} に未コミットの変更はありません`,
        }
      : {
          ok: false,
          msg: `未コミットの変更が残っています:\n${d.split("\n").slice(0, 6).join("\n")}`,
        };
  },
};

async function runChecks(step) {
  const out = [];
  for (const [name, ...args] of step.checks || []) {
    const fn = CHECKS[name];
    if (!fn) {
      out.push({ name, ok: false, msg: `未知のチェック ${name}` });
      continue;
    }
    try {
      out.push({ name, ...(await fn(...args)) });
    } catch (e) {
      out.push({ name, ok: false, msg: `チェックが異常終了: ${e.message}` });
    }
  }
  return out;
}

// ── output ───────────────────────────────────────────────────────────────────
function mapText(s) {
  const cur = s.finishedAt ? -1 : stepIndex(s.step);
  const lines = [];
  for (const part of INDEX.parts) {
    lines.push(`${part.title}  (約 ${part.minutes} 分)`);
    STEPS.forEach((st, i) => {
      if (st.part !== part.id) return;
      const mark =
        i === cur ? "▶" : s.done.some((d) => d.id === st.id) ? "✓" : "·";
      lines.push(
        `  ${mark} ${String(i).padStart(2, "0")}  ${st.title}  · ${st.minutes} 分${st.where === "browser" ? "  · ブラウザ" : ""}`,
      );
    });
  }
  return lines.join("\n");
}
function elapsedMin(s) {
  return s.startedAt
    ? Math.round((Date.now() - Date.parse(s.startedAt)) / 60000)
    : 0;
}
// Minutes the plan allows up to the end of the current step: the dashboard and the tutor compare this with the clock.
function plannedUntil(id) {
  let m = 0;
  for (const st of STEPS) {
    m += st.minutes || 0;
    if (st.id === id) break;
  }
  return m;
}
function stepScript(st) {
  const f = path.join(PLUGIN, "steps", `${st.id}.md`);
  const body = fs.existsSync(f)
    ? fs.readFileSync(f, "utf8")
    : `(${st.id} の台本がありません)`;
  const head = `═══ STEP ${String(stepIndex(st.id)).padStart(2, "0")} · ${st.title} · 目安 ${st.minutes} 分 · ${st.where === "browser" ? "学習者はブラウザでページを読む" : "ターミナルで作業"} ═══`;
  const page = st.page
    ? `\nこのステップのページ: http://localhost:${PORT}/${st.page}   (ファイル: ${path.join(PLUGIN, "pages", st.page)})`
    : "";
  return `${head}${page}\n\n${body.trim()}\n\n学習者が「できました」と言ったら \`${SELF} next\` を実行してください。完了条件を確認し、次のステップの台本を出力します。`;
}
function closingScript() {
  const body = fs
    .readFileSync(path.join(PLUGIN, "steps", "_closing.md"), "utf8")
    .trim();
  return `═══ ワークショップ完了 · 全 ${STEPS.length} ステップ終了 ═══\n\n${body}`;
}
function preamble() {
  return fs
    .readFileSync(path.join(PLUGIN, "steps", "_tutor-rules.md"), "utf8")
    .trim();
}

// ── page server ──────────────────────────────────────────────────────────────
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
  ".woff2": "font/woff2",
};
function publicState() {
  const s = load();
  const cur = stepIndex(s.step);
  const curStep = s.finishedAt ? null : STEPS[cur];
  return {
    title: INDEX.title,
    startedAt: s.startedAt,
    elapsedMin: elapsedMin(s),
    totalMinutes: TOTAL_MIN,
    budgetMinutes: INDEX.budgetMinutes || 90,
    plannedUntilNow: curStep ? plannedUntil(curStep.id) : TOTAL_MIN,
    plannedBeforeNow: curStep
      ? plannedUntil(curStep.id) - (curStep.minutes || 0)
      : TOTAL_MIN,
    current: curStep ? curStep.id : null,
    finishedAt: s.finishedAt || null,
    hint: curStep && curStep.hint ? curStep.hint : null,
    parts: INDEX.parts,
    steps: STEPS.map((st, i) => {
      const d = s.done.find((x) => x.id === st.id);
      return {
        id: st.id,
        n: i,
        part: st.part,
        title: st.title,
        minutes: st.minutes,
        where: st.where,
        page: st.page || null,
        doneAt: d ? d.at : null,
        status: !s.finishedAt && i === cur ? "current" : d ? "done" : "todo",
      };
    }),
  };
}
// See the todo-app tutor for the reasoning: loopback Host only, opaque id, quit only with this copy's secret.
function buildId() {
  const sig = (p) => {
    try {
      const st = fs.statSync(p);
      return `${st.size}.${Math.round(st.mtimeMs)}`;
    } catch {
      return "0";
    }
  };
  return `${sig(fileURLToPath(import.meta.url))}-${sig(path.join(PLUGIN, "steps", "index.json"))}`;
}
function readToken() {
  try {
    return fs.readFileSync(path.join(STATE_DIR, "server.token"), "utf8").trim();
  } catch {
    return "";
  }
}
function serverId(token) {
  return crypto
    .createHash("sha256")
    .update(`${token}\n${buildId()}`)
    .digest("hex")
    .slice(0, 24);
}
function serve(port) {
  const root = path.join(PLUGIN, "pages");
  const token = process.env.TUTOR_TOKEN || "";
  const id = serverId(token);
  const okHosts = new Set([
    `localhost:${port}`,
    `127.0.0.1:${port}`,
    `[::1]:${port}`,
  ]);
  const handle = (req, res) => {
    if (!okHosts.has(String(req.headers.host || "").toLowerCase())) {
      res.writeHead(403, { "content-type": "text/plain" });
      return res.end("forbidden");
    }
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    if (url === "/__tutor") {
      res.writeHead(200, {
        "content-type": MIME[".json"],
        "cache-control": "no-store",
      });
      return res.end(JSON.stringify({ tutor: true, name: SERVER_NAME, id }));
    }
    if (url === "/__quit") {
      if (req.method !== "POST") {
        res.writeHead(403, { "content-type": "text/plain" });
        return res.end("forbidden");
      }
      const g = Buffer.from(String(req.headers["x-tutor-token"] || ""), "utf8"),
        t = Buffer.from(token, "utf8");
      const match =
        t.length > 0 && g.length === t.length && crypto.timingSafeEqual(g, t);
      if (!match) {
        res.writeHead(403, { "content-type": "text/plain" });
        return res.end("forbidden");
      }
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("bye");
      return void setTimeout(() => process.exit(0), 50);
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      return res.end();
    }
    if (url === "/state.json") {
      res.writeHead(200, {
        "content-type": MIME[".json"],
        "cache-control": "no-store",
      });
      return res.end(JSON.stringify(publicState()));
    }
    const rel = url === "/" ? "/index.html" : url;
    const file = path.normalize(path.join(root, rel));
    if (
      !file.startsWith(root) ||
      !fs.existsSync(file) ||
      fs.statSync(file).isDirectory()
    ) {
      res.writeHead(404);
      return res.end("not found");
    }
    res.writeHead(200, {
      "content-type": MIME[path.extname(file)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    const stream = fs.createReadStream(file);
    stream.on("error", () => {
      try {
        res.destroy();
      } catch {
        /* already closed */
      }
    });
    stream.pipe(res);
  };
  const server = http.createServer((req, res) => {
    try {
      handle(req, res);
    } catch {
      try {
        if (!res.headersSent)
          res.writeHead(500, { "content-type": "text/plain" });
        res.end("error");
      } catch {
        /* connection already gone */
      }
    }
  });
  server.on("clientError", (err, socket) => {
    try {
      socket.destroy();
    } catch {
      /* already closed */
    }
  });
  server.listen(port, "127.0.0.1");
}
function httpReq(port, p, { method = "GET", headers = {} } = {}) {
  return new Promise((resolve) => {
    const req = http.request(
      { host: "127.0.0.1", port, path: p, method, headers, timeout: 700 },
      (r) => {
        let body = "";
        r.setEncoding("utf8");
        r.on("data", (d) => {
          if (body.length < 200000) body += d;
        });
        r.on("end", () => resolve({ status: r.statusCode, body }));
      },
    );
    req.on("error", (e) =>
      resolve({ status: 0, refused: e.code === "ECONNREFUSED" }),
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0 });
    });
    req.end();
  });
}
// nothing / this copy's server / an older server of THIS tutorial / anything else (including the todo-app tutor: never touched)
async function probe(port) {
  const who = await httpReq(port, "/__tutor");
  if (who.status === 0) return who.refused ? "none" : "foreign";
  if (who.status === 200) {
    try {
      const j = JSON.parse(who.body);
      if (j.tutor && j.name === SERVER_NAME) {
        const t = readToken();
        return t && j.id === serverId(t) ? "ours" : "stale";
      }
    } catch {
      /* not ours */
    }
  }
  return "foreign";
}
const isTutorCmd = (cmdline) => /tutor\.mjs["']?\s+_server/.test(cmdline || "");
function cmdlineOf(pid) {
  if (!/^\d+$/.test(String(pid))) return "";
  return WIN
    ? spawnSync(
        "powershell",
        [
          "-NoProfile",
          "-Command",
          `(Get-CimInstance Win32_Process -Filter "ProcessId=${pid}").CommandLine`,
        ],
        { encoding: "utf8", windowsHide: true },
      ).stdout
    : spawnSync("ps", ["-p", String(pid), "-o", "args="], { encoding: "utf8" })
        .stdout;
}
function killStaleTutorServer(port) {
  try {
    if (WIN) {
      const line = spawnSync(
        "cmd",
        ["/c", `netstat -ano -p tcp | findstr LISTENING | findstr :${port}`],
        { encoding: "utf8", windowsHide: true },
      )
        .stdout.split(/\r?\n/)
        .find((l) => new RegExp(`[:.]${port}\\s`).test(l));
      const pid = line && line.trim().split(/\s+/).pop();
      if (!pid || !/^\d+$/.test(pid)) return;
      if (isTutorCmd(cmdlineOf(pid)))
        spawnSync("taskkill", ["/PID", pid, "/F"], { windowsHide: true });
    } else {
      for (const pid of (
        spawnSync("lsof", [`-ti:${port}`, "-sTCP:LISTEN"], { encoding: "utf8" })
          .stdout || ""
      )
        .trim()
        .split("\n")
        .filter(Boolean)) {
        if (isTutorCmd(cmdlineOf(pid))) process.kill(Number(pid));
      }
    }
  } catch {
    /* fall through: the caller moves to another port */
  }
}
async function freed(port) {
  for (let i = 0; i < 20; i++) {
    if ((await probe(port)) === "none") return true;
    await new Promise((r) => setTimeout(r, 120));
  }
  return false;
}
function savedPort() {
  try {
    const p = Number(
      fs.readFileSync(path.join(STATE_DIR, "server.port"), "utf8"),
    );
    return p > 0 ? p : 0;
  } catch {
    return 0;
  }
}
PORT = savedPort() || BASE_PORT;
async function ensureServer() {
  const candidates = [
    ...new Set([
      savedPort() || BASE_PORT,
      ...Array.from({ length: 10 }, (_, i) => BASE_PORT + i),
    ]),
  ];
  for (const port of candidates) {
    let kind = await probe(port);
    if (kind === "ours") {
      PORT = port;
      return true;
    }
    if (kind === "stale") {
      killStaleTutorServer(port);
      if (await freed(port)) kind = "none";
    }
    if (kind !== "none") continue;
    const token = crypto.randomBytes(24).toString("hex");
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(path.join(STATE_DIR, "server.token"), token, {
      mode: 0o600,
    });
    const child = spawn(
      process.execPath,
      [fileURLToPath(import.meta.url), "_server", String(port)],
      {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
        env: { ...process.env, TUTOR_TOKEN: token },
      },
    );
    child.unref();
    fs.writeFileSync(path.join(STATE_DIR, "server.pid"), String(child.pid));
    fs.writeFileSync(path.join(STATE_DIR, "server.port"), String(port));
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 150));
      if ((await probe(port)) === "ours") {
        PORT = port;
        return true;
      }
    }
  }
  return false;
}
async function stopServer() {
  let pid = "";
  try {
    pid = fs.readFileSync(path.join(STATE_DIR, "server.pid"), "utf8").trim();
  } catch {
    /* none on file */
  }
  if (pid && isTutorCmd(cmdlineOf(pid))) {
    try {
      process.kill(Number(pid));
      if (await freed(PORT)) return true;
    } catch {
      /* already gone */
    }
  }
  if ((await probe(PORT)) === "ours") {
    await httpReq(PORT, "/__quit", {
      method: "POST",
      headers: { "x-tutor-token": readToken() },
    });
    return freed(PORT);
  }
  return false;
}
function openInBrowser(url) {
  const cmd =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];
  try {
    const c = spawn(cmd[0], cmd[1], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    c.on("error", () => {});
    c.unref();
  } catch {
    /* the URL is printed either way */
  }
}
// Late = past the planned END of the current step; early = still before its planned START. Time inside the step is on plan.
function paceLine(s) {
  if (s.finishedAt) return "";
  const el = elapsedMin(s), end = plannedUntil(s.step), start = end - (current(s).minutes || 0);
  return el > end + 2
    ? `予定より約 ${el - end} 分遅れています。`
    : el < start - 5
      ? `予定より約 ${start - el} 分早く進んでいます。`
      : "予定どおりのペースです。";
}

// ── commands ─────────────────────────────────────────────────────────────────
const [, , cmd = "status", ...args] = process.argv;
const s = load();

switch (cmd) {
  case "hook": {
    if (!s.startedAt) {
      s.startedAt = now();
      s.baseBranch = branch() || null;
      save(s);
      log("start", { branch: s.baseBranch });
    } else log("resume", { step: s.step });
    let moved = null;
    const cur0 = current(s);
    if (
      !s.finishedAt &&
      s.seen.includes(cur0.id) &&
      cur0.checks.length &&
      cur0.checks.every(([n]) => CHEAP.has(n)) &&
      stepIndex(cur0.id) + 1 < STEPS.length
    ) {
      if ((await runChecks(cur0)).every((r) => r.ok)) {
        s.done.push({ id: cur0.id, at: now() });
        s.step = STEPS[stepIndex(cur0.id) + 1].id;
        moved = cur0;
        log("auto-advance", { step: cur0.id });
      }
    }
    markSeen(s);
    save(s);
    let dash = "";
    try {
      dash = (await ensureServer()) ? `http://localhost:${PORT}/map.html` : "";
    } catch {
      /* the dashboard is a convenience; never block the session on it */
    }
    // Claude Code shows the model only about 10,000 characters of hook output, so keep a hard budget (see the todo-app tutor).
    const BUDGET = 9000;
    const parts = [preamble()];
    parts.push(
      dash
        ? `── ダッシュボード ──\n「いまどこ？」ページは ${dash} で配信中です（このセッションと一緒に起動）。学習者には STEP 00 から開いたままにしてもらいます。現在地を聞かれたら、口頭で答えつつこのタブも案内してください。`
        : `── ダッシュボード ──\nページサーバーを起動できませんでした。ページはファイルとして ${path.join(PLUGIN, "pages")} から開けます。`,
    );
    if (moved)
      parts.push(
        `── 補足 ──\n学習者はこのセッションの前に「${moved.title}」を終えていました（完了条件を満たしています）。現在地を先に進めてあります。そのステップに戻さないでください。`,
      );
    const doneCount = s.done.filter((d) =>
      STEPS.some((x) => x.id === d.id),
    ).length;
    parts.push(
      s.finishedAt
        ? `── 学習者の現在地 ──\nワークショップは完了しています（全 ${STEPS.length} ステップ、開始から ${elapsedMin(s)} 分）。\`${SELF} status\` で全体マップを表示できます。`
        : `── 学習者の現在地 ──\nSTEP ${String(stepIndex(s.step)).padStart(2, "0")}（00〜${String(STEPS.length - 1).padStart(2, "0")}）· ${current(s).title} · ${doneCount}/${STEPS.length} 完了 · 開始から ${elapsedMin(s)} 分（予算 ${INDEX.budgetMinutes || 90} 分）。${paceLine(s)} \`${SELF} status\` で全体マップを表示できます。`,
    );
    const script = s.finishedAt
      ? `${closingScript()}\n\n新しいセッションの場合: 1行で挨拶し、ワークショップは完了していること、やり直すなら ./reset-demo.sh があることを伝え、以降は普通のペアとして振る舞ってください。`
      : stepScript(current(s));
    const head = parts.join("\n\n");
    if (head.length + script.length + 2 <= BUDGET)
      console.log(`${head}\n\n${script}`);
    else
      console.log(
        `${head}\n\n═══ ${s.finishedAt ? "ワークショップ完了" : `STEP ${String(stepIndex(s.step)).padStart(2, "0")} · ${current(s).title}`} ═══\nこのステップの台本はここに収まりません。学習者の最初のメッセージに返信する前に、内容にかかわらず次のコマンドを1回だけ実行し、出力に従ってください:\n\n    ${SELF} show\n\n記憶で答えたり、内容を推測したり、先に別のことをしたりしないでください。`,
      );
    break;
  }
  case "status":
    console.log(
      `${INDEX.title}\n${s.finishedAt ? `開始から ${elapsedMin(s)} 分 · 完了（全 ${STEPS.length} ステップ）` : `開始から ${elapsedMin(s)} 分 / 予算 ${INDEX.budgetMinutes || 90} 分 · 現在のステップ: ${current(s).title} · ${paceLine(s)}`}\n\n${mapText(s)}`,
    );
    break;
  case "show":
    console.log(s.finishedAt ? closingScript() : stepScript(current(s)));
    break;
  case "check": {
    if (s.finishedAt) {
      console.log(
        "すべてのステップが完了しています。確認するものはありません。",
      );
      break;
    }
    const res = await runChecks(current(s));
    if (!res.length)
      console.log(
        "（このステップには自動確認がありません。学習者の「できました」で十分です）",
      );
    for (const r of res) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.msg}`);
    log("check", { step: s.step, ok: res.every((r) => r.ok) });
    process.exit(res.every((r) => r.ok) ? 0 : 1);
  }
  case "next": {
    if (s.finishedAt) {
      console.log(`すべてのステップが完了しています。\n\n${closingScript()}`);
      break;
    }
    const st = current(s);
    const res = args.includes("--force") ? [] : await runChecks(st);
    const bad = res.filter((r) => !r.ok);
    if (bad.length) {
      for (const r of res) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.msg}`);
      console.log(
        `\nまだ次に進めません: 完了条件のうち ${bad.length} 件が未達です。学習者がそれを片付けるのを手伝い（頼まれない限り代わりにやらない）、もう一度 \`${SELF} next\` を実行してください。時間切れや行き詰まりの場合は、学習者に確認のうえ \`${SELF} next --force\` で先に進めます。`,
      );
      log("next-blocked", { step: s.step, open: bad.map((b) => b.name) });
      process.exit(1);
    }
    for (const r of res) console.log(`PASS  ${r.msg}`);
    s.done.push({ id: st.id, at: now() });
    const i = stepIndex(s.step);
    if (i + 1 < STEPS.length) s.step = STEPS[i + 1].id;
    else s.finishedAt = now();
    markSeen(s);
    save(s);
    log("done", { step: st.id, forced: args.includes("--force") });
    console.log(
      `\n${st.title} — 完了。開始から ${elapsedMin(s)} 分。${paceLine(s)}\n`,
    );
    console.log(s.finishedAt ? closingScript() : stepScript(current(s)));
    break;
  }
  case "goto": {
    const id = args[0];
    if (!STEPS.some((x) => x.id === id)) {
      console.error(`そのステップはありません: ${id}`);
      process.exit(2);
    }
    s.step = id;
    delete s.finishedAt;
    markSeen(s);
    save(s);
    log("goto", { step: id });
    console.log(stepScript(current(s)));
    break;
  }
  case "note": {
    for (const a of args) {
      const k = a.slice(0, a.indexOf("=")),
        v = a.slice(a.indexOf("=") + 1);
      if (k) s.notes[k] = v;
    }
    save(s);
    log("note", { notes: args });
    console.log("記録しました: " + args.join(" · "));
    break;
  }
  case "serve": {
    if (args.includes("--stop")) {
      console.log(
        (await stopServer())
          ? "ページサーバーを停止しました"
          : "ページサーバーは動いていませんでした",
      );
      break;
    }
    const ok = await ensureServer();
    console.log(
      ok
        ? `ページは http://localhost:${PORT}/ で配信中です`
        : `ポート ${PORT} でページサーバーを起動できませんでした。ファイルを直接開いてください: ${path.join(PLUGIN, "pages")}`,
    );
    break;
  }
  case "_server":
    serve(Number(args[0]) || PORT);
    break;
  case "open": {
    const page = args[0] || "index.html";
    const ok = await ensureServer();
    const url = ok
      ? `http://localhost:${PORT}/${page}`
      : `file://${path.join(PLUGIN, "pages", page)}`;
    if (!process.env.TUTOR_NO_OPEN) openInBrowser(url);
    console.log(
      `${url}\n（ブラウザが開かない場合、たとえばリモート環境では、このアドレスを自分で開いてもらってください。ファイルは ${path.join(PLUGIN, "pages", page)}）`,
    );
    log("open", { page });
    break;
  }
  case "stop-all": {
    const out = [
      (await stopServer())
        ? "ページサーバーを停止しました"
        : "ページサーバーは動いていませんでした",
    ];
    const stop = path.join(ROOT, "scripts", "stop.sh");
    if (!WIN && fs.existsSync(stop)) {
      const r = sh("bash", [stop]);
      out.push(
        r.code === 0
          ? "アプリ（3000 / 8001）を停止しました（scripts/stop.sh）"
          : `scripts/stop.sh が終了コード ${r.code} で終わりました`,
      );
    } else
      out.push(
        "アプリ: Windows では、起動したウィンドウで Ctrl+C を押して止めてください",
      );
    log("stop-all");
    console.log(out.join("\n"));
    break;
  }
  case "reset":
    fs.rmSync(STATE_DIR, { recursive: true, force: true });
    console.log("ワークショップの進捗を消去しました");
    break;
  default:
    console.error(`未知のコマンド: ${cmd}`);
    process.exit(2);
}
