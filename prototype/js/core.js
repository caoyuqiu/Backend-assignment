/* ============================================================
   云枢智学 · 核心层
   状态管理 / 路由 / 通用组件 / 判分
   ============================================================ */
window.App = (function () {
  "use strict";
  const LS_KEY = "ys_prototype_state_v1";

  const clone = obj => JSON.parse(JSON.stringify(obj));
  const esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  /* ---------- 初始状态 ---------- */
  function defaultState() {
    return {
      user: { name: "林晓", phone: "138****2043", initial: "林", joined: "2026-08-12" },
      admin: null,
      learned: { c101: 1, c102: 1 },
      progress: {
        "s1|s1-st1|sequence": {
          key: "s1|s1-st1|sequence", mode: "sequence",
          subjectId: "s1", stageId: "s1-st1",
          queue: ["q101", "q102", "q103", "q104", "q105"],
          idx: 1,
          answers: { q101: { selected: [1], text: "", correct: true, score: 10, partial: false } },
          startedAt: Date.now() - 185000,
          finished: false
        }
      },
      wrong: clone(DB.seedWrong),
      interviews: clone(DB.seedInterviews).sort((a, b) => b.date.localeCompare(a.date)),
      messages: clone(DB.messages),
      appeals: clone(DB.appeals),
      practiceLog: [],
      interviewLog: [],
      settings: { voice: true, autoNext: false }
    };
  }

  let state;
  try {
    const raw = localStorage.getItem(LS_KEY);
    state = raw ? Object.assign(defaultState(), JSON.parse(raw)) : defaultState();
  } catch (e) { state = defaultState(); }

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* file:// 环境忽略 */ }
  }
  function reset() {
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    // 就地替换属性，保证各模块持有的 state 引用不失效
    const fresh = defaultState();
    Object.keys(state).forEach(k => { delete state[k]; });
    Object.assign(state, fresh);
    save();
  }

  /* ---------- 路由 ---------- */
  const ui = { query: {}, segs: [], mount: null };
  function parseHash() {
    const raw = (location.hash || "").replace(/^#\/?/, "");
    const [path, qs] = raw.split("?");
    return {
      segs: path.split("/").filter(Boolean),
      query: Object.fromEntries(new URLSearchParams(qs || ""))
    };
  }
  function go(hash) {
    if (location.hash === hash) { render(); }
    else location.hash = hash;
  }
  function currentPath() { return "#" + (location.hash.replace(/^#/, "") || "/"); }

  /* ---------- 通用 UI ---------- */
  function toast(msg, type) {
    const root = document.getElementById("toast-root");
    const el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.innerHTML = (type === "ok" ? "✓ " : type === "err" ? "! " : "") + esc(msg);
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transition = ".25s"; setTimeout(() => el.remove(), 260); }, 2200);
  }

  function closeModal() {
    const root = document.getElementById("modal-root");
    root.innerHTML = "";
    document.body.style.overflow = "";
  }
  function modal(opts) {
    const root = document.getElementById("modal-root");
    root.innerHTML = `
      <div class="mask" data-mask="1">
        <div class="modal ${opts.size === "lg" ? "lg" : ""}" role="dialog" aria-modal="true">
          <div class="modal-hd">
            <h3>${esc(opts.title || "")}</h3>
            <button class="x-btn" data-act="ui.closeModal" aria-label="关闭">✕</button>
          </div>
          <div class="modal-bd">${opts.body || ""}</div>
          ${opts.footer === null ? "" : `<div class="modal-ft">${opts.footer || `<button class="btn btn-ghost" data-act="ui.closeModal">关闭</button>`}</div>`}
        </div>
      </div>`;
    document.body.style.overflow = "hidden";
    if (typeof opts.onMount === "function") opts.onMount(root);
    const mask = root.querySelector(".mask");
    mask.addEventListener("click", e => { if (e.target === mask) closeModal(); });
  }

  function closeDrawer() {
    document.getElementById("drawer-root").innerHTML = "";
    document.body.style.overflow = "";
  }
  function drawer(opts) {
    const root = document.getElementById("drawer-root");
    root.innerHTML = `
      <div class="drawer-mask" data-act="ui.closeDrawer"></div>
      <aside class="drawer">
        <div class="drawer-hd">
          <h3 style="font-size:16px">${esc(opts.title || "")}</h3>
          <button class="x-btn" data-act="ui.closeDrawer">✕</button>
        </div>
        <div class="drawer-bd">${opts.body || ""}</div>
      </aside>`;
    document.body.style.overflow = "hidden";
    if (typeof opts.onMount === "function") opts.onMount(root);
  }

  function confirm(title, text, onYes, yesLabel) {
    modal({
      title,
      body: `<p style="color:var(--text-2);line-height:1.8">${text}</p>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button>
               <button class="btn btn-primary" id="confirm-yes">${esc(yesLabel || "确认")}</button>`,
      onMount(root) {
        root.querySelector("#confirm-yes").addEventListener("click", () => { closeModal(); onYes && onYes(); });
      }
    });
  }

  /* ---------- 视觉组件 ---------- */
  function progress(pct, cls) {
    return `<div class="progress ${cls || ""}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;
  }

  function scoreRing(score, size) {
    const s = size || 128, r = (s - 16) / 2, c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, score));
    const color = pct >= 80 ? "#059669" : pct >= 60 ? "#4f46e5" : "#d97706";
    return `<div class="score-ring" style="width:${s}px;height:${s}px">
      <svg width="${s}" height="${s}">
        <circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="#eef0f6" stroke-width="9"/>
        <circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="9"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}"/>
      </svg>
      <div class="num" style="color:${color}">${score}<small>分</small></div>
    </div>`;
  }

  function radar(values, opts) {
    const o = opts || {};
    const size = o.size || 260;
    const cx = size / 2, cy = size / 2, R = size * 0.33;
    const labels = o.labels || DB.dimensions.map(d => d.name);
    const n = values.length;
    const pt = (i, ratio) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [cx + Math.cos(a) * R * ratio, cy + Math.sin(a) * R * ratio];
    };
    let grid = "";
    [0.25, 0.5, 0.75, 1].forEach(r => {
      const pts = values.map((_, i) => pt(i, r).join(",")).join(" ");
      grid += `<polygon points="${pts}" fill="none" stroke="#e8eaf3" stroke-width="1"/>`;
    });
    let axes = "";
    values.forEach((_, i) => {
      const [x, y] = pt(i, 1);
      axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e8eaf3" stroke-width="1"/>`;
    });
    const poly = (vals, color, fill, dash) => {
      const pts = vals.map((v, i) => pt(i, Math.max(0, Math.min(100, v)) / 100).join(",")).join(" ");
      return `<polygon points="${pts}" fill="${fill}" stroke="${color}" stroke-width="2" ${dash ? 'stroke-dasharray="5 4"' : ""} stroke-linejoin="round"/>`;
    };
    let body = "";
    if (o.compare) body += poly(o.compare, "#9ca3af", "rgba(156,163,175,.08)", true);
    body += poly(values, o.color || "#4f46e5", "rgba(79,70,229,.16)", false);
    let texts = "";
    labels.forEach((label, i) => {
      const [x, y] = pt(i, 1.24);
      const anchor = Math.abs(x - cx) < 6 ? "middle" : x > cx ? "start" : "end";
      texts += `<text x="${x}" y="${y + 4}" text-anchor="${anchor}" font-size="10.5" fill="#6b7280" font-family="inherit">${esc(label)}</text>`;
    });
    return `<svg class="radar" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${grid}${axes}${body}${texts}
    </svg>`;
  }

  function avatar(name, size) {
    const s = size || 34;
    const ch = (name || "云").slice(0, 1);
    return `<div class="avatar" style="width:${s}px;height:${s}px;font-size:${Math.round(s * 0.38)}px">${esc(ch)}</div>`;
  }

  /* ---------- 评级 / 徽章 ---------- */
  const typeMap = { single: "单选题", multiple: "多选题", judge: "判断题", short: "简答题" };
  const typeCls = { single: "badge-indigo", multiple: "badge-cyan", judge: "badge-gray", short: "badge-amber" };
  const diffCls = { "简单": "badge-green", "中等": "badge-amber", "困难": "badge-red" };
  function typeBadge(t) { return `<span class="badge ${typeCls[t] || ""}">${typeMap[t] || t}</span>`; }
  function diffBadge(d) { return `<span class="badge ${diffCls[d] || ""}">${d}</span>`; }
  function dimBadge(id) {
    const d = DB.dimById[id];
    return d ? `<span class="badge" style="background:${d.color}18;color:${d.color}">${d.name}</span>` : "";
  }

  /* ---------- 判分 ---------- */
  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    const x = [...a].sort().join(","), y = [...b].sort().join(",");
    return x === y;
  }
  function grade(q, selected) {
    const sel = selected || [];
    if (q.type === "multiple") {
      const wrongPick = sel.some(i => !q.answer.includes(i));
      if (wrongPick) return { correct: false, score: 0, partial: false };
      if (sameSet(sel, q.answer)) return { correct: true, score: q.score, partial: false };
      if (sel.length === 0) return { correct: false, score: 0, partial: false };
      const ratio = sel.length / q.answer.length;
      return { correct: false, score: Math.round(q.score * ratio), partial: true };
    }
    return { correct: sameSet(sel, q.answer), score: sameSet(sel, q.answer) ? q.score : 0, partial: false };
  }
  function mockShortGrade(q, text) {
    const len = (text || "").trim().length;
    let hits = 0;
    const pointStates = q.points.map((p, i) => {
      const threshold = 20 + i * 18;
      const hit = len >= threshold;
      if (hit) hits++;
      return { ...p, hit };
    });
    const earned = pointStates.filter(p => p.hit).reduce((s, p) => s + p.score, 0);
    const total = q.points.reduce((s, p) => s + p.score, 0) || q.score;
    const score = Math.round((earned / total) * q.score);
    const passScore = q.score * (q.pass || 0.6);
    return {
      score, correct: score >= passScore, partial: score > 0 && score < passScore,
      points: pointStates,
      comment: score >= passScore
        ? "回答覆盖了主要采分点，结构清晰。建议补充具体场景与取舍说明，让论证更有说服力。"
        : "回答覆盖了部分采分点，但关键要素仍有缺失。建议按“概念 → 做法 → 结果”的结构补充完整。",
      simulated: true
    };
  }

  /* ---------- 状态辅助 ---------- */
  const practiceKey = (subjectId, stageId) => `${subjectId}|${stageId}`;
  function getProgress(subjectId, stageId) {
    const direct = state.progress[practiceKey(subjectId, stageId)];
    if (direct) return direct;
    const prefix = `${subjectId}|${stageId}|`;
    const key = Object.keys(state.progress).find(k => k.startsWith(prefix));
    return key ? state.progress[key] : null;
  }
  function saveProgress(subjectId, stageId, data) {
    state.progress[practiceKey(subjectId, stageId)] = data;
    save();
  }
  function markWrong(qid, isCorrect) {
    let item = state.wrong.find(w => w.qid === qid);
    if (!isCorrect) {
      if (!item) { state.wrong.push({ qid, count: 1, streak: 0, status: "review" }); }
      else { item.count++; item.streak = 0; item.status = "review"; }
    } else if (item && item.status === "review") {
      item.streak++;
      if (item.streak >= 3) item.status = "mastered";
    }
    save();
  }
  function learnedCount() { return Object.keys(state.learned).length; }
  function unreadCount() { return state.messages.filter(m => m.unread).length; }
  function updateLearnedStats() { return { learned: learnedCount() }; }

  /* ---------- 事件委托 ---------- */
  const actions = {};
  function on(name, fn) { actions[name] = fn; }
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const name = el.getAttribute("data-act");
    if (actions[name]) { e.preventDefault(); actions[name](el, e); }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(); closeDrawer(); }
  });

  on("ui.closeModal", () => closeModal());
  on("ui.closeDrawer", () => closeDrawer());
  on("ui.toastDemo", el => toast(el.dataset.msg || "原型提示", "ok"));

  /* ---------- 渲染 ---------- */
  let rootEl = null;
  function render() {
    if (!rootEl) rootEl = document.getElementById("app");
    const { segs, query } = parseHash();
    ui.segs = segs; ui.query = query;
    ui.mount = null;
    closeModal(); closeDrawer();
    let out = "";
    if (segs[0] === "admin") {
      out = window.Admin ? Admin.render(segs.slice(1), query) : "<p>管理端未加载</p>";
    } else {
      out = window.Portal ? Portal.render(segs, query) : "<p>学员端未加载</p>";
    }
    rootEl.innerHTML = out;
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    if (typeof ui.mount === "function") { try { ui.mount(); } catch (err) { console.error(err); } }
    ui.mount = null;
  }
  function setMount(fn) { ui.mount = fn; }

  window.addEventListener("hashchange", render);

  return {
    get state() { return state; },
    set state(v) { state = v; },
    save, reset, clone, esc,
    go, render, setMount, parseHash, currentPath,
    toast, modal, closeModal, confirm, drawer, closeDrawer,
    progress, scoreRing, radar, avatar,
    typeMap, typeBadge, diffBadge, dimBadge,
    grade, mockShortGrade, sameSet,
    getProgress, saveProgress, markWrong, learnedCount, unreadCount,
    on, actions,
    ui
  };
})();
