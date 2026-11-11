/* ============================================================
   云枢智学 · 刷题练习 & AI 面试
   ============================================================ */
window.Practice = (function () {
  "use strict";
  const S = App.state;
  const ivById = {};
  Object.values(DB.interviewBank).flat().forEach(q => { ivById[q.id] = q; });
  function ivQ(id) { return ivById[id] || DB.qById[id] || {}; }

  /* ---------- 工具 ---------- */
  function shuffle(a) {
    const arr = [...a];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function mmss(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  function todayKey() { return new Date().toISOString().slice(0, 10); }
  function clearTimer() { if (App.ui.timer) { clearInterval(App.ui.timer); App.ui.timer = null; } }

  /* ============================================================
     一、刷题练习
     ============================================================ */
  function sessionKey(query) {
    const mode = query.mode || "sequence";
    if (query.single) return `single|${query.single}`;
    if (mode === "wrong") return `wrong|${query.subject || "all"}|${query.stage || "all"}`;
    return `${query.subject}|${query.stage}|${mode}`;
  }

  function buildQueue(query) {
    const mode = query.mode || "sequence";
    if (query.single && DB.qById[query.single]) return [DB.qById[query.single]];
    if (mode === "wrong") {
      const ids = S.wrong.filter(w => w.status === "review").map(w => w.qid);
      let qs = ids.map(id => DB.qById[id]).filter(Boolean);
      if (query.subject) qs = qs.filter(q => q.subjectId === query.subject);
      if (query.stage) qs = qs.filter(q => q.stageId === query.stage);
      return qs;
    }
    const st = DB.stageById[query.stage];
    if (!st) return [];
    const qs = [...st.questions];
    return mode === "random" ? shuffle(qs) : qs;
  }

  function ensureSession(query) {
    const key = sessionKey(query);
    let sess = S.progress[key];
    if (!sess || sess.finished || !sess.queue || !sess.queue.length) {
      const mode = query.single ? "single" : (query.mode || "sequence");
      const queue = buildQueue(query);
      sess = {
        key, mode,
        subjectId: query.subject || (queue[0] ? queue[0].subjectId : ""),
        stageId: query.stage || (queue[0] ? queue[0].stageId : ""),
        queue: queue.map(q => q.id),
        idx: 0,
        answers: {},
        startedAt: Date.now(),
        finished: false
      };
      S.progress[key] = sess;
      App.save();
    }
    App.ui.practice = sess;
    return sess;
  }

  function elapsedText(start) { return mmss(Math.max(0, Math.floor((Date.now() - start) / 1000))); }

  function practicePage(query) {
    clearTimer();
    const sess = ensureSession(query);
    if (!sess.queue.length) {
      return Portal.shell(`<div class="empty" style="padding-top:80px"><div class="big">🎉</div>
        <h2 style="font-size:18px">这里暂时没有题目</h2>
        <p class="mt-8">${sess.mode === "wrong" ? "当前没有待复习的错题，先去题库练几道吧" : "该阶段还没有配置题目"}</p>
        <a class="btn btn-primary mt-16" href="#/bank">返回题库中心</a></div>`, "bank");
    }
    if (sess.finished) return resultPage(sess);
    const q = DB.qById[sess.queue[sess.idx]];
    const ans = sess.answers[q.id];
    const submitted = !!ans;
    if (!submitted && App.ui.selQid !== q.id) { App.ui.sel = []; App.ui.selQid = q.id; }
    const selected = submitted ? (ans.selected || []) : (App.ui.sel || []);

    const subject = DB.subjectById[sess.subjectId];
    const stage = DB.stageById[sess.stageId] || DB.stageById[q.stageId];
    const modeLabel = { sequence: "顺序练习", random: "随机练习", wrong: "错题重练", single: "单题重练" }[sess.mode] || "练习";

    App.setMount(() => {
      const el = document.getElementById("practice-timer");
      if (!el) return;
      const start = sess.startedAt;
      let t = null;
      const tick = () => {
        if (!document.body.contains(el)) { clearInterval(t); return; }
        el.textContent = mmss(Math.max(0, Math.floor((Date.now() - start) / 1000)));
      };
      tick();
      t = setInterval(tick, 1000);
      App.ui.timer = t;
    });

    return Portal.shell(`
      <div class="practice-top" style="padding-top:18px">
        <div class="left">
          <a class="btn btn-sm btn-ghost" href="#/bank/${sess.subjectId || q.subjectId}">← 退出</a>
          <span>${App.esc(subject ? subject.name : q.subjectName)} / ${App.esc(stage ? stage.name : q.stageName)}</span>
          <span class="badge badge-gray">${modeLabel}</span>
        </div>
        <div class="row gap-16">
          <span class="text-xs text-muted">用时</span><span class="timer" id="practice-timer">00:00</span>
          <button class="btn btn-sm btn-ghost" data-act="practice.restart">重新开始</button>
        </div>
      </div>

      <div class="practice-shell">
        <div>
          <div class="card q-card">
            <div class="q-head">
              <span class="q-index">第 ${sess.idx + 1} / ${sess.queue.length} 题</span>
              ${App.typeBadge(q.type)} ${App.diffBadge(q.difficulty)} ${App.dimBadge(q.dim)}
              ${q.type === "short" ? `<span class="badge badge-amber">及格线 ${Math.round((q.pass || 0.6) * 100)}%</span>` : ""}
            </div>
            <div class="q-stem">${App.esc(q.stem)}</div>

            ${q.type === "short" ? `
              <div class="field">
                <textarea class="input" id="short-answer" rows="7" placeholder="请在这里作答，建议按“概念 → 做法 → 结果”的结构展开……" ${submitted ? "disabled" : ""}>${submitted ? App.esc(ans.text || "") : ""}</textarea>
                <div class="hint">简答题由 AI 按采分点评分并给出评语；达到本题及格线即视为答对。</div>
              </div>
            ` : `
              <div class="q-options">
                ${q.options.map((opt, i) => {
                  let cls = "";
                  if (submitted) {
                    const isSel = selected.includes(i);
                    const isAns = q.answer.includes(i);
                    if (isAns) cls = "correct";
                    else if (isSel) cls = "wrong";
                    else if (isSel) cls = "selected";
                    cls += " disabled";
                  } else if (selected.includes(i)) cls = "selected";
                  return `<div class="q-option ${cls}" data-act="practice.select" data-idx="${i}">
                    <span class="key">${String.fromCharCode(65 + i)}</span>
                    <span class="opt-text">${App.esc(opt)}</span>
                  </div>`;
                }).join("")}
              </div>
              ${q.type === "multiple" ? `<div class="hint mt-12">多选题：漏选得部分分，错选不得分；满分才算答对。</div>` : ""}
            `}

            ${submitted ? feedbackHtml(q, ans) : ""}
          </div>

          <div class="row between mt-16">
            <button class="btn btn-ghost" data-act="practice.prev" ${sess.idx === 0 ? "disabled" : ""}>← 上一题</button>
            <div class="row gap-8">
              ${submitted
                ? (sess.idx === sess.queue.length - 1
                  ? `<button class="btn btn-primary" data-act="practice.finish">完成练习</button>`
                  : `<button class="btn btn-primary" data-act="practice.next">下一题 →</button>`)
                : `<button class="btn btn-primary" data-act="practice.submit">提交本题</button>`}
            </div>
          </div>
        </div>

        <aside class="practice-side">
          <div class="card">
            <div class="card-hd" style="padding:14px 18px"><div class="card-title">答题卡</div>
              <span class="text-xs text-muted">已答 ${Object.keys(sess.answers).length}/${sess.queue.length}</span></div>
            <div class="card-bd" style="padding:16px 18px">
              <div class="answer-grid">
                ${sess.queue.map((qid, i) => {
                  const a = sess.answers[qid];
                  const cls = a ? (a.correct ? "done" : "wrong") : (i === sess.idx ? "current" : "");
                  return `<div class="answer-dot ${cls}" data-act="practice.jump" data-idx="${i}">${i + 1}</div>`;
                }).join("")}
              </div>
              <div class="row gap-16 mt-16 text-xs text-muted" style="flex-wrap:wrap">
                <span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--green);margin-right:4px"></i>答对</span>
                <span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--red);margin-right:4px"></i>答错</span>
                <span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--bg-soft);margin-right:4px"></i>未答</span>
              </div>
            </div>
          </div>
          <div class="card pad-18">
            <div class="text-xs text-muted" style="line-height:1.9">
              · 逐题提交后立即批改，已批改题目不可修改<br>
              · 练习进度仅保存在本机浏览器<br>
              · 答错的题目会自动进入错题本
            </div>
            <button class="btn btn-ghost btn-block mt-12" data-act="practice.finish">提前交卷</button>
          </div>
        </aside>
      </div>
    `, "bank");
  }

  function feedbackHtml(q, ans) {
    if (q.type === "short") {
      const pass = ans.correct;
      return `<div class="answer-feedback ${pass ? "ok" : ans.score > 0 ? "partial" : "bad"}">
        <div class="row between wrap gap-8">
          <div class="fb-title" style="margin:0">${pass ? "✅ 达到及格线" : "⚠️ 未达到及格线"}</div>
          <div class="fb-score" style="color:${pass ? "var(--green)" : "var(--amber)"}">${ans.score} <span style="font-size:12px;color:var(--muted);font-weight:500">/ ${q.score} 分</span></div>
        </div>
        <div class="fb-explain" style="border:0;padding:0;margin-top:8px">${App.esc(ans.comment || "")}</div>
        <div class="fb-points">
          ${(ans.points || []).map(p => `<div class="fb-point ${p.hit ? "hit" : "miss"}"><span class="pp">${p.hit ? "✓" : "–"}</span><span>${App.esc(p.text)} <span class="text-muted">（${p.score} 分）</span></span></div>`).join("")}
        </div>
        <div class="fb-explain"><b>参考答案：</b>${App.esc(q.reference || "")}</div>
        ${ans.simulated ? `<div class="text-xs text-muted mt-8">注：本页为原型，评分与评语为模拟结果。</div>` : ""}
      </div>`;
    }
    const ok = ans.correct;
    return `<div class="answer-feedback ${ok ? "ok" : ans.partial ? "partial" : "bad"}">
      <div class="row between wrap gap-8">
        <div class="fb-title" style="margin:0">${ok ? "✅ 回答正确" : ans.partial ? "⚠️ 部分正确（漏选）" : "❌ 回答错误"}</div>
        <div class="fb-score" style="color:${ok ? "var(--green)" : ans.partial ? "var(--amber)" : "var(--red)"}">${ans.score} <span style="font-size:12px;color:var(--muted);font-weight:500">/ ${q.score} 分</span></div>
      </div>
      <div class="fb-answer">正确答案：<b>${q.answer.map(i => String.fromCharCode(65 + i)).join("、")}</b></div>
      <div class="fb-explain">${App.esc(q.explanation || "")}</div>
    </div>`;
  }

  function summary(sess) {
    const answers = sess.answers || {};
    const total = sess.queue.length;
    const answered = Object.keys(answers).length;
    let correct = 0, wrong = 0, earned = 0, max = 0;
    Object.entries(answers).forEach(([qid, a]) => {
      const q = DB.qById[qid]; if (!q) return;
      max += q.score; earned += a.score || 0;
      if (a.correct) correct++; else wrong++;
    });
    const unanswered = total - answered;
    const pct = max ? Math.round((earned / max) * 100) : 0;
    const mins = Math.max(1, Math.round((Date.now() - sess.startedAt) / 60000));
    return { total, answered, correct, wrong, unanswered, earned, max, pct, mins };
  }

  function resultPage(sess) {
    const sum = summary(sess);
    const wrongDims = {};
    Object.entries(sess.answers).forEach(([qid, a]) => {
      if (a.correct) return;
      const q = DB.qById[qid]; if (!q) return;
      wrongDims[q.dim] = (wrongDims[q.dim] || 0) + 1;
    });
    const weak = Object.entries(wrongDims).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return Portal.shell(`
      <div class="practice-top" style="padding-top:18px">
        <a class="btn btn-sm btn-ghost" href="#/bank/${sess.subjectId}">← 返回学科</a>
        <span class="badge badge-indigo">练习完成</span>
      </div>
      <div class="card" style="max-width:760px;margin:10px auto 0">
        <div class="result-hero">
          ${App.scoreRing(sum.pct)}
          <h2 style="font-size:20px">${sum.pct >= 80 ? "表现不错，继续保持" : sum.pct >= 60 ? "基本掌握，还有提升空间" : "需要再巩固一下"}</h2>
          <p class="text-sm text-muted mt-6">本阶段共 ${sum.total} 题，用时约 ${sum.mins} 分钟</p>
          <div class="result-stats">
            <div><b style="color:var(--green)">${sum.correct}</b><span>答对</span></div>
            <div><b style="color:var(--red)">${sum.wrong}</b><span>答错</span></div>
            <div><b>${sum.unanswered}</b><span>未作答</span></div>
            <div><b>${sum.earned}<span style="font-size:11px;color:var(--muted)">/${sum.max}</span></b><span>得分</span></div>
          </div>
        </div>
        <div class="card-bd" style="border-top:1px solid var(--line-2)">
          ${sum.wrong ? `
            <div class="text-strong mb-8">薄弱维度</div>
            <div class="row gap-8 wrap mb-16">
              ${weak.map(([id, n]) => `${App.dimBadge(id)}<span class="text-xs text-muted">错 ${n} 题</span>`).join("")}
            </div>` : ""}
          <div class="row gap-10 wrap">
            <button class="btn btn-primary" data-act="practice.restart">再练一次</button>
            <a class="btn btn-ghost" href="#/bank?tab=wrong">查看错题本</a>
            <a class="btn btn-ghost" href="#/bank/${sess.subjectId}">返回学科</a>
            <a class="btn btn-soft" href="#/interview">去 AI 面试</a>
          </div>
        </div>
      </div>
    `, "bank");
  }

  /* ---------- 练习动作 ---------- */
  App.on("practice.select", el => {
    const sess = App.ui.practice;
    if (!sess) return;
    const q = DB.qById[sess.queue[sess.idx]];
    if (sess.answers[q.id]) return;
    const i = Number(el.dataset.idx);
    let sel = App.ui.sel || [];
    if (q.type === "multiple") sel = sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i];
    else sel = [i];
    App.ui.sel = sel;
    App.render();
  });

  App.on("practice.submit", () => {
    const sess = App.ui.practice;
    if (!sess) return;
    const q = DB.qById[sess.queue[sess.idx]];
    let res, selected = [], text = "";
    if (q.type === "short") {
      text = (document.getElementById("short-answer") || {}).value || "";
      text = text.trim();
      if (!text) return App.toast("请先输入作答内容", "err");
      res = App.mockShortGrade(q, text);
    } else {
      selected = App.ui.sel || [];
      if (!selected.length) return App.toast("请先选择答案", "err");
      res = App.grade(q, selected);
    }
    sess.answers[q.id] = { selected, text, correct: res.correct, score: res.score, partial: res.partial, points: res.points, comment: res.comment, simulated: res.simulated };
    App.markWrong(q.id, res.correct);
    S.practiceLog.push({ date: todayKey(), ts: Date.now(), qid: q.id });
    App.save();
    App.ui.sel = [];
    App.render();
  });

  App.on("practice.prev", () => {
    const sess = App.ui.practice; if (!sess || sess.idx === 0) return;
    sess.idx--; App.save(); App.ui.sel = []; App.render();
  });

  App.on("practice.next", () => {
    const sess = App.ui.practice; if (!sess) return;
    if (sess.idx < sess.queue.length - 1) { sess.idx++; App.save(); App.ui.sel = []; App.render(); }
    else App.actions["practice.finish"]();
  });

  App.on("practice.jump", el => {
    const sess = App.ui.practice; if (!sess) return;
    sess.idx = Number(el.dataset.idx); App.save(); App.ui.sel = []; App.render();
  });

  App.on("practice.finish", () => {
    const sess = App.ui.practice; if (!sess) return;
    const unanswered = sess.queue.length - Object.keys(sess.answers).length;
    const doFinish = () => { sess.finished = true; App.save(); App.render(); };
    if (unanswered > 0) App.confirm("确认交卷", `还有 ${unanswered} 道题未作答，未作答题目不计分。确定交卷吗？`, doFinish, "交卷");
    else doFinish();
  });

  App.on("practice.restart", () => {
    const sess = App.ui.practice; if (!sess) return;
    App.confirm("重新开始", "当前练习进度将被清空，确定重新开始吗？", () => {
      delete S.progress[sess.key];
      App.save();
      if (sess.mode === "single") App.go(`#/practice?subject=${sess.subjectId}&stage=${sess.stageId}&mode=wrong&single=${sess.queue[0]}`);
      else if (sess.mode === "wrong") App.go(`#/practice?mode=wrong${sess.subjectId ? "&subject=" + sess.subjectId : ""}${sess.stageId ? "&stage=" + sess.stageId : ""}`);
      else App.go(`#/practice?subject=${sess.subjectId}&stage=${sess.stageId}&mode=${sess.mode}`);
    }, "重新开始");
  });

  /* ============================================================
     二、AI 面试
     ============================================================ */
  const IV_KEY = "ys_interview_session";

  function getIvSession() {
    try { return JSON.parse(sessionStorage.getItem(IV_KEY) || "null"); } catch (e) { return null; }
  }
  function saveIvSession(s) {
    try { sessionStorage.setItem(IV_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function clearIvSession() { try { sessionStorage.removeItem(IV_KEY); } catch (e) {} }

  function pickQuestions(subjectId, difficulty, count) {
    const pool = (DB.interviewBank[`${subjectId}|${difficulty}`] || []).slice();
    const byDim = {};
    DB.dimensions.forEach(d => { byDim[d.id] = shuffle(pool.filter(q => q.dim === d.id)); });
    const picked = [];
    // 先保证 6 个维度各 1 题
    for (const d of DB.dimensions) {
      if (picked.length >= count) break;
      if (byDim[d.id].length) picked.push(byDim[d.id].pop());
    }
    // 不够再从剩余题目补
    const rest = shuffle(Object.values(byDim).flat());
    while (picked.length < count && rest.length) picked.push(rest.pop());
    return picked.slice(0, count);
  }

  function interviewConfigPage() {
    clearTimer();
    const subjectId = App.ui.ivSubject || "s1";
    const difficulty = App.ui.ivDifficulty || "中等";
    const count = App.ui.ivCount || 10;
    const subject = DB.subjectById[subjectId];
    const recent = S.interviews.slice(0, 3);
    const today = new Date().toISOString().slice(0, 10);
    const usedToday = S.interviews.filter(r => String(r.date).startsWith(today)).length;
    const leftToday = Math.max(0, 5 - usedToday);
    return Portal.shell(`
      <section class="interview-hero" style="margin-top:26px">
        <h1>AI 模拟面试</h1>
        <p>按技术方向与难度抽题，覆盖 6 个能力维度。单题限时 5 分钟，支持文字作答与语音输入；结束后生成可复盘的能力报告。</p>
        <div class="row gap-12 mt-16 wrap">
          <span class="badge" style="background:rgba(255,255,255,.16);color:#fff">每日 5 次</span>
          <span class="badge" style="background:rgba(255,255,255,.16);color:#fff">今日剩余 ${leftToday} 次</span>
          <span class="badge" style="background:rgba(255,255,255,.16);color:#fff">录音保留 90 天</span>
        </div>
      </section>

      <div class="grid mt-24" style="grid-template-columns:1.6fr 1fr">
        <div class="card">
          <div class="card-hd"><div class="card-title"><span class="dot"></span>面试配置</div><span class="text-xs text-muted">共 3 步</span></div>
          <div class="card-bd col gap-24">
            <div>
              <div class="row between mb-8"><span class="label">1. 选择技术方向</span><span class="text-xs text-muted">8 个方向</span></div>
              <div class="chip-row">
                ${DB.subjects.map(s => `<button class="chip ${s.id === subjectId ? "active" : ""}" data-act="interview.pick" data-kind="subject" data-value="${s.id}">${s.icon} ${s.short}</button>`).join("")}
              </div>
            </div>
            <div>
              <div class="row between mb-8"><span class="label">2. 选择难度</span></div>
              <div class="grid g3" style="gap:10px">
                ${["简单", "中等", "困难"].map(d => `<button class="config-tile ${d === difficulty ? "active" : ""}" data-act="interview.pick" data-kind="difficulty" data-value="${d}" style="text-align:left">
                  <b>${d}</b><span>${d === "简单" ? "基础概念与常见场景" : d === "中等" ? "原理理解与工程实践" : "深度追问与方案权衡"}</span></button>`).join("")}
              </div>
            </div>
            <div>
              <div class="row between mb-8"><span class="label">3. 选择题数</span><span class="text-xs text-muted">单题限时 5 分钟</span></div>
              <div class="row gap-8 wrap">
                ${[3, 5, 8, 10, 15].map(n => `<button class="chip ${n === count ? "active" : ""}" data-act="interview.pick" data-kind="count" data-value="${n}">${n} 题${n === 10 ? " · 推荐" : ""}</button>`).join("")}
              </div>
            </div>
            <label class="agree" style="background:var(--surface-2);padding:13px;border-radius:10px;border:1px solid var(--line)">
              <span class="checkbox ${App.ui.ivConsent === true ? "on" : ""}" data-act="interview.consent">${App.ui.ivConsent === true ? "✓" : ""}</span>
              <span>我已阅读并<strong>单独同意</strong>在本次面试中录音。录音仅用于本人回放复盘，保留 90 天后自动删除；不同意可仅用文字作答，麦克风将不可用。</span>
            </label>
            <div class="row between wrap gap-12">
              <div class="text-xs text-muted">将抽取 ${count} 道题 · ${subject.name} · ${difficulty}</div>
              <button class="btn btn-primary btn-lg" data-act="interview.start">开始面试 →</button>
            </div>
          </div>
        </div>

        <div class="col gap-16">
          <div class="card">
            <div class="card-hd"><div class="card-title">最近面试</div><a class="link text-xs" href="#/interview/records">全部 →</a></div>
            <div class="card-bd" style="padding:6px 0">
              ${recent.length ? recent.map(r => `<div class="list-row" style="padding:12px 20px">
                <div class="idx ${r.score >= 75 ? "done" : ""}">${r.score}</div>
                <div class="grow"><div class="text-sm text-strong">${App.esc(r.subjectName)}</div><div class="text-xs text-muted">${r.difficulty} · ${r.date.slice(0, 10)}</div></div>
                <button class="btn btn-sm btn-ghost" data-act="interview.reportLink" data-id="${r.id}">报告</button>
              </div>`).join("") : `<div class="empty" style="padding:28px">暂无记录</div>`}
            </div>
          </div>
          <div class="card pad-18" style="background:linear-gradient(150deg,#f7f7ff,#fff);border-color:#e3e4f8">
            <div class="row gap-8"><span class="badge badge-indigo">面试说明</span></div>
            <ul class="text-xs text-muted mt-12" style="line-height:2">
              <li>· 题目按方向 + 难度抽取，优先覆盖 6 个维度</li>
              <li>· 未覆盖到的维度会标注「本场未考察」，不虚构分数</li>
              <li>· 作答支持文字输入与浏览器语音识别</li>
              <li>· 报告永久保留；录音保留 90 天</li>
            </ul>
          </div>
        </div>
      </div>
    `, "interview");
  }

  function interviewSessionPage() {
    const sess = getIvSession();
    if (!sess) return interviewConfigPage();
    if (sess.finished) { clearIvSession(); return interviewConfigPage(); }
    const subject = DB.subjectById[sess.subjectId];
    const qid = sess.questions[sess.idx];
    const q = ivQ(qid).text ? ivQ(qid) : { text: "（题目缺失）", dim: "d1" };
    const answeredCount = sess.answers.length;

    App.setMount(() => {
      const stream = document.getElementById("chat-stream");
      if (stream) stream.scrollIntoView({ block: "end" });
      const cd = document.getElementById("iv-countdown");
      const tot = document.getElementById("iv-total");
      if (!cd) return;
      let t = null;
      const tick = () => {
        if (!document.body.contains(cd)) { clearInterval(t); return; }
        const left = Math.max(0, 300 - Math.floor((Date.now() - sess.questionStartedAt) / 1000));
        cd.textContent = mmss(left);
        if (left === 0) cd.style.color = "var(--red)";
        if (tot) tot.textContent = mmss(Math.max(0, Math.floor((Date.now() - sess.startedAt) / 1000)));
      };
      tick();
      t = setInterval(tick, 1000);
      App.ui.timer = t;
    });

    return Portal.shell(`
      <div class="chat-wrap" style="padding-top:18px">
        <div class="chat-top">
          <div class="row gap-12">
            <button class="btn btn-sm btn-ghost" data-act="interview.end">← 结束</button>
            <div>
              <div class="text-strong" style="font-size:13.5px">${App.esc(subject.name)} · ${sess.difficulty}</div>
              <div class="text-xs text-muted">第 ${sess.idx + 1} / ${sess.questions.length} 题 · 已作答 ${answeredCount} 题</div>
            </div>
          </div>
          <div class="row gap-14">
            <div class="center"><div class="timer" id="iv-countdown" style="font-size:16px">05:00</div><div class="text-xs text-muted">本题剩余</div></div>
            <div class="center"><div style="font-size:13px;font-weight:700" id="iv-total">00:00</div><div class="text-xs text-muted">总用时</div></div>
            <button class="btn btn-sm btn-ghost" data-act="interview.speakToggle" title="语音播报">${S.settings.voice ? "🔊 播报中" : "🔇 已静音"}</button>
          </div>
        </div>

        <div class="chat-stream" id="chat-stream">
          <div class="msg system"><div class="bubble">面试开始 · 共 ${sess.questions.length} 题 · 单题限时 5 分钟</div></div>
          ${sess.answers.map((a, i) => {
            const aq = ivQ(sess.questions[i]);
            return `<div class="msg ai"><div class="who">🤖</div><div class="bubble">
                <div class="text-xs text-muted mb-4">第 ${i + 1} 题 · ${(DB.dimById[aq.dim] || {}).name || ""}</div>
                ${App.esc(aq.text || "")}
              </div></div>
              <div class="msg me"><div class="who">我</div><div class="bubble">${App.esc(a.text)}</div></div>
              <div class="msg system"><div class="bubble">第 ${i + 1} 题已作答 · AI 评分 ${a.score} / 10</div></div>`;
          }).join("")}
          <div class="msg ai"><div class="who">🤖</div><div class="bubble">
            <div class="text-xs text-muted mb-4">第 ${sess.idx + 1} 题 · ${(DB.dimById[q.dim] || {}).name || ""}</div>
            ${App.esc(q.text)}
          </div></div>
        </div>

        <div class="chat-input-bar">
          <textarea class="input" id="iv-answer" placeholder="输入你的回答…… 也可以点击麦克风使用语音输入（原型模拟）"></textarea>
          <div class="chat-tools mt-8">
            <div class="row gap-8">
              <button class="mic-btn" id="mic-btn" data-act="interview.mic" title="语音输入">🎤</button>
              <span class="text-xs text-muted" id="mic-hint">点击麦克风开始语音输入</span>
            </div>
            <div class="row gap-8">
              <span class="text-xs text-muted" id="iv-count">${answeredCount}/${sess.questions.length}</span>
              <button class="btn btn-primary" data-act="interview.submit">提交回答 →</button>
            </div>
          </div>
        </div>
      </div>
    `, "interview");
  }

  function evalScore(text) {
    const len = (text || "").trim().length;
    let base = len < 15 ? 4 : len < 40 ? 6 : len < 100 ? 7 : 8;
    return Math.min(10, base + (Math.random() > 0.6 ? 1 : 0));
  }

  function finishInterview(manual) {
    const sess = getIvSession();
    if (!sess) return;
    if (!sess.answers.length) {
      App.toast("还没有作答，无法生成报告", "err");
      return;
    }
    if (manual) {
      const ok = () => actuallyFinish(sess);
      App.confirm("提前结束面试", `已作答 ${sess.answers.length} / ${sess.questions.length} 题。提前结束将只统计已作答题目，确定吗？`, ok, "结束并生成报告");
    } else actuallyFinish(sess);
  }

  function actuallyFinish(sess) {
    const dimAgg = {};
    sess.answers.forEach(a => {
      const q = ivQ(sess.questions[sess.answers.indexOf(a)]);
      const d = q.dim || "d1";
      dimAgg[d] = dimAgg[d] || { sum: 0, n: 0 };
      dimAgg[d].sum += a.score; dimAgg[d].n++;
    });
    const dims = {};
    DB.dimensions.forEach(d => {
      dims[d.id] = dimAgg[d.id] ? Math.round((dimAgg[d.id].sum / dimAgg[d.id].n) * 10) : null;
    });
    const valid = Object.values(dims).filter(v => v != null);
    const score = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
    const sorted = DB.dimensions.map(d => ({ d, v: dims[d.id] })).filter(x => x.v != null).sort((a, b) => b.v - a.v);
    const top = sorted.slice(0, 2), bottom = sorted.slice(-2);

    const id = "iv-" + Date.now();
    const record = {
      id,
      subjectId: sess.subjectId,
      subjectName: DB.subjectById[sess.subjectId].name,
      difficulty: sess.difficulty,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      duration: mmss(Math.floor((Date.now() - sess.startedAt) / 1000)),
      count: sess.answers.length,
      score,
      dims,
      answers: sess.answers.map((a, i) => ({ qid: sess.questions[i], text: a.text, score: a.score, dim: ivQ(sess.questions[i]).dim })),
      strengths: top.map(x => `${x.d.name}表现较好，得分 ${x.v} 分，回答能覆盖关键要点`),
      weaknesses: bottom.map(x => `${x.d.name}相对薄弱，得分 ${x.v} 分，建议补充具体做法与取舍`),
      suggestions: [
        "回答时先给结论，再分点展开，最后补充一个真实场景",
        "技术类问题尽量说明实现机制、边界条件与失败后的处理方式",
        "项目经验用「背景 - 做法 - 结果 - 复盘」的结构表达，并尽量量化结果"
      ],
      improvement: [
        { type: "题目", title: `${bottom[0] ? bottom[0].d.name : "薄弱维度"}专项练习`, meta: "12 道 · 中等", icon: "📝" },
        { type: "课程", title: `${DB.subjectById[sess.subjectId].name} · 系统课`, meta: "按路线补齐", icon: "▶️" },
        { type: "面试", title: "再来一次同方向同难度面试", meta: "预计 20 分钟", icon: "🎙️" }
      ]
    };
    S.interviews.unshift(record);
    S.messages.unshift({ id: "m" + Date.now(), type: "系统", title: "面试报告已生成", body: `你在「${record.subjectName} · ${record.difficulty}」的模拟面试已完成，综合得分 ${score} 分。`, time: record.date, unread: true });
    App.save();
    clearIvSession();
    App.toast("面试报告已生成", "ok");
    App.go(`#/interview/report/${id}`);
  }

  function interviewReportPage(id) {
    clearTimer();
    const r = S.interviews.find(x => x.id === id);
    if (!r) return Portal.shell(`<div class="empty"><div class="big">📄</div><p>报告不存在</p><a class="btn btn-primary" href="#/interview/records">返回记录</a></div>`, "interview");
    const dims = DB.dimensions;
    const values = dims.map(d => r.dims[d.id] == null ? 0 : r.dims[d.id]);
    const prev = S.interviews.filter(x => x.id !== r.id && x.subjectId === r.subjectId && x.difficulty === r.difficulty && x.date < r.date)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    const answered = r.answers || synthesizeAnswers(r);

    return Portal.shell(`
      <div class="page-hd">
        <div class="crumb"><a href="#/interview">AI 面试</a><span class="sep">/</span><a href="#/interview/records">面试记录</a><span class="sep">/</span><span>报告</span></div>
      </div>
      <div class="card report-hero">
        ${App.scoreRing(r.score, 132)}
        <div class="grow">
          <div class="row gap-8 wrap"><span class="badge badge-indigo">${App.esc(r.difficulty)}</span><span class="badge badge-gray">${r.count} 题</span><span class="badge badge-gray">${App.esc(r.duration || "")}</span></div>
          <h1 style="font-size:23px;margin-top:10px">${App.esc(r.subjectName)}</h1>
          <p class="text-sm text-muted mt-4">面试时间 ${App.esc(r.date)} · 报告永久保留 · 录音保留 90 天</p>
          <div class="row gap-8 mt-16 wrap">
            <button class="btn btn-primary" data-act="interview.again" data-subject="${r.subjectId}" data-difficulty="${r.difficulty}">再来一次</button>
            <button class="btn btn-ghost" data-act="interview.replay" data-id="${r.id}">🎧 查看回放</button>
            <a class="btn btn-ghost" href="#/interview/records">返回记录</a>
          </div>
        </div>
        ${prev ? `<div style="text-align:center;min-width:110px">
          <div class="text-xs text-muted">相比上次</div>
          <div style="font-size:26px;font-weight:800;color:${r.score >= prev.score ? "var(--green)" : "var(--red)"}">${r.score >= prev.score ? "+" : ""}${r.score - prev.score}<small style="font-size:12px">分</small></div>
          <div class="text-xs text-muted">上次 ${prev.score} 分</div>
        </div>` : ""}
      </div>

      <div class="grid mt-20" style="grid-template-columns:1fr 1.15fr">
        <div class="card">
          <div class="card-hd"><div class="card-title">能力雷达</div><span class="text-xs text-muted">满分 100</span></div>
          <div class="card-bd radar-box">
            ${App.radar(values, { size: 280, color: "#4f46e5", compare: prev ? dims.map(d => prev.dims[d.id] == null ? 0 : prev.dims[d.id]) : null })}
            <div class="radar-legend">
              <span><i style="background:#4f46e5"></i>本次</span>
              ${prev ? `<span><i style="background:#9ca3af"></i>上次（同方向同难度）</span>` : ""}
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><div class="card-title">维度得分</div><span class="text-xs text-muted">未考察维度不计分</span></div>
          <div class="card-bd" style="padding-top:10px">
            ${dims.map(d => `<div class="dim-row">
              <span class="name">${d.name}</span>
              ${r.dims[d.id] == null
                ? `<span class="text-xs text-muted grow">本场未考察</span>`
                : `<div class="progress"><i style="width:${r.dims[d.id]}%;background:${d.color}"></i></div><span class="val">${r.dims[d.id]}</span>`}
            </div>`).join("")}
            <div class="help-block mt-12 text-xs">维度得分 = 该维度下所有题目的平均分 × 10；本场没有对应题目的维度不参与计算。</div>
          </div>
        </div>
      </div>

      <div class="grid g2 mt-20">
        <div class="card"><div class="card-hd"><div class="card-title">✅ 优势</div></div><div class="card-bd">
          ${(r.strengths || []).map(x => `<div class="row gap-8" style="padding:7px 0;align-items:flex-start"><span style="color:var(--green)">•</span><span class="text-sm" style="line-height:1.8">${App.esc(x)}</span></div>`).join("") || `<p class="text-sm text-muted">暂无</p>`}
        </div></div>
        <div class="card"><div class="card-hd"><div class="card-title">⚠️ 待提升</div></div><div class="card-bd">
          ${(r.weaknesses || []).map(x => `<div class="row gap-8" style="padding:7px 0;align-items:flex-start"><span style="color:var(--amber)">•</span><span class="text-sm" style="line-height:1.8">${App.esc(x)}</span></div>`).join("") || `<p class="text-sm text-muted">暂无</p>`}
        </div></div>
      </div>

      <div class="card mt-20">
        <div class="card-hd"><div class="card-title">改进建议</div></div>
        <div class="card-bd col gap-10">
          ${(r.suggestions || []).map((x, i) => `<div class="row gap-12" style="align-items:flex-start"><span class="badge badge-indigo">${i + 1}</span><span class="text-sm" style="line-height:1.8">${App.esc(x)}</span></div>`).join("")}
        </div>
      </div>

      <div class="section-hd"><div><h2>能力提升建议</h2><p>按报告推荐下一步</p></div></div>
      <div class="grid g3">
        ${(r.improvement || []).map(x => `<div class="card pad-18 hover" onclick="location.hash='${x.type === "课程" ? "#/roadmap" : x.type === "面试" ? "#/interview" : "#/bank"}'">
          <div class="row between"><span style="font-size:20px">${x.icon}</span><span class="badge badge-gray">${x.type}</span></div>
          <div class="text-strong mt-8" style="font-size:13.5px">${App.esc(x.title)}</div>
          <div class="text-xs text-muted mt-4">${App.esc(x.meta)}</div>
        </div>`).join("")}
      </div>

      <div class="section-hd"><div><h2>逐题回顾</h2><p>你的回答与本题得分</p></div></div>
      <div class="col gap-12">
        ${answered.map((a, i) => {
          const q = ivQ(a.qid);
          return `<div class="card">
            <div class="card-hd" style="padding:14px 20px">
              <div class="row gap-8"><span class="q-index">第 ${i + 1} 题</span>${App.dimBadge(a.dim || q.dim)}</div>
              <span class="badge ${a.score >= 8 ? "badge-green" : a.score >= 6 ? "badge-amber" : "badge-red"}">${a.score} / 10</span>
            </div>
            <div class="card-bd" style="padding:16px 20px">
              <div style="font-weight:600;line-height:1.75">${App.esc(q.text || "（题目）")}</div>
              <div class="help-block mt-12" style="background:#fff;border-style:solid"><b class="text-xs">你的回答：</b><div class="text-sm mt-4" style="line-height:1.8">${App.esc(a.text)}</div></div>
            </div>
          </div>`;
        }).join("")}
      </div>
    `, "interview");
  }

  function synthesizeAnswers(r) {
    const pool = DB.interviewBank[`${r.subjectId}|${r.difficulty}`] || [];
    const picked = [];
    DB.dimensions.forEach(d => {
      const q = pool.find(x => x.dim === d.id);
      if (q) picked.push(q);
    });
    while (picked.length < (r.count || 10) && pool.length) picked.push(pool[picked.length % pool.length]);
    return picked.slice(0, r.count || 10).map((q, i) => ({
      qid: q.id,
      text: `我的理解是，${q.text.replace(/^请|^结合/g, "")}需要先明确目标与约束，再拆解为可验证的步骤。在实际项目中，我会先做小范围验证，确认效果后再逐步扩大，同时保留回退方案。`,
      score: Math.max(4, Math.min(10, Math.round(((r.dims[q.dim] || 60) / 10) + (i % 3) - 1))),
      dim: q.dim
    }));
  }

  function interviewRecordsPage() {
    const list = S.interviews;
    return Portal.shell(`
      ${Portal.pageHead("面试记录", `共 ${list.length} 场面试 · 报告永久保留`,
        `<a class="btn btn-primary" href="#/interview">开始新面试</a>`)}
      <div class="card">
        ${list.length ? list.map(r => `<div class="list-row">
          <div class="idx ${r.score >= 75 ? "done" : ""}" style="width:44px;height:44px;font-size:14px">${r.score}</div>
          <div class="grow">
            <div class="row gap-8 wrap"><b style="font-size:13.5px">${App.esc(r.subjectName)}</b><span class="badge badge-gray">${r.difficulty}</span><span class="badge badge-gray">${r.count} 题</span></div>
            <div class="text-xs text-muted mt-4">${App.esc(r.date)} · 用时 ${App.esc(r.duration || "—")}</div>
          </div>
          <div class="row gap-8">
            <button class="btn btn-sm btn-ghost" data-act="interview.replay" data-id="${r.id}">回放</button>
            <button class="btn btn-sm btn-soft" data-act="interview.reportLink" data-id="${r.id}">查看报告</button>
          </div>
        </div>`).join("") : `<div class="empty"><div class="big">🎙️</div><p>还没有面试记录</p><a class="btn btn-primary" href="#/interview">开始第一次面试</a></div>`}
      </div>
    `, "interview");
  }

  /* ---------- 面试动作 ---------- */
  App.on("interview.pick", el => {
    const kind = el.dataset.kind, val = el.dataset.value;
    if (kind === "subject") App.ui.ivSubject = val;
    if (kind === "difficulty") App.ui.ivDifficulty = val;
    if (kind === "count") App.ui.ivCount = Number(val);
    App.render();
  });
  App.on("interview.consent", () => { App.ui.ivConsent = App.ui.ivConsent !== true; App.render(); });

  App.on("interview.start", () => {
    const today = new Date().toISOString().slice(0, 10);
    if (S.interviews.filter(r => String(r.date).startsWith(today)).length >= 5) {
      return App.toast("今日 5 次 AI 面试额度已用完，请明天再来", "err");
    }
    const subjectId = App.ui.ivSubject || "s1";
    const difficulty = App.ui.ivDifficulty || "中等";
    const count = App.ui.ivCount || 10;
    const picked = pickQuestions(subjectId, difficulty, count);
    if (!picked.length) return App.toast("该方向暂无可用题目", "err");
    const sess = {
      id: "sess-" + Date.now(),
      subjectId, difficulty, count: picked.length,
      questions: picked.map(q => q.id),
      idx: 0, answers: [],
      startedAt: Date.now(),
      questionStartedAt: Date.now(),
      finished: false
    };
    saveIvSession(sess);
    App.go("#/interview/session");
  });

  App.on("interview.submit", () => {
    const sess = getIvSession(); if (!sess) return;
    const box = document.getElementById("iv-answer");
    const text = (box.value || "").trim();
    if (!text) return App.toast("请先输入回答内容", "err");
    const qid = sess.questions[sess.idx];
    const q = ivQ(qid);
    sess.answers.push({ qid, text, score: evalScore(text), dim: q.dim });
    sess.idx++;
    sess.questionStartedAt = Date.now();
    if (sess.idx >= sess.questions.length) {
      saveIvSession(sess);
      actuallyFinish(sess);
      return;
    }
    saveIvSession(sess);
    App.render();
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 30);
  });

  App.on("interview.end", () => finishInterview(true));
  App.on("interview.speakToggle", () => {
    S.settings.voice = !S.settings.voice; App.save();
    App.toast(S.settings.voice ? "已开启语音播报" : "已关闭语音播报");
    App.render();
  });

  App.on("interview.mic", el => {
    if (App.ui.ivConsent !== true) return App.toast("未同意录音，请仅使用文字作答", "err");
    el.classList.add("rec");
    const hint = document.getElementById("mic-hint");
    if (hint) hint.textContent = "正在聆听……（原型模拟）";
    setTimeout(() => {
      el.classList.remove("rec");
      const box = document.getElementById("iv-answer");
      if (box) {
        box.value = "语音识别结果：我会先明确问题的目标与约束，再拆解为可验证的步骤，最后用指标确认效果。";
        box.focus();
      }
      if (hint) hint.textContent = "已识别，可编辑后提交";
    }, 1600);
  });

  App.on("interview.reportLink", el => App.go(`#/interview/report/${el.dataset.id}`));
  App.on("interview.again", el => {
    App.ui.ivSubject = el.dataset.subject;
    App.ui.ivDifficulty = el.dataset.difficulty;
    App.go("#/interview");
  });

  App.on("interview.replay", el => {
    const r = S.interviews.find(x => x.id === el.dataset.id);
    if (!r) return;
    const answered = r.answers || synthesizeAnswers(r);
    App.modal({
      title: "面试回放",
      size: "lg",
      body: `
        <div class="help-block mb-16">录音仅本人可回放，保留 90 天；回放内容不参与评分。</div>
        <div class="card pad-18" style="border-radius:12px">
          <div class="row between">
            <div class="row gap-12"><button class="mic-btn" id="fake-play" data-act="interview.replayPlay">▶</button>
              <div><b class="text-sm">第 1 题 · 录音</b><div class="text-xs text-muted">${App.esc(r.date)}</div></div></div>
            <span class="text-xs text-muted" id="fake-time">00:00 / 01:12</span>
          </div>
          <div class="progress mt-12" id="fake-bar"><i style="width:0"></i></div>
        </div>
        <div class="mt-16">
          <div class="text-strong mb-8">转写文本（可编辑）</div>
          ${answered.slice(0, 3).map((a, i) => `<div class="help-block mb-8" style="background:#fff;border-style:solid">
            <div class="text-xs text-muted">第 ${i + 1} 题</div>
            <div class="text-sm mt-4" style="line-height:1.8">${App.esc(a.text)}</div>
          </div>`).join("")}
        </div>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">关闭</button>`
    });
  });

  App.on("interview.replayPlay", el => {
    const bar = document.querySelector("#fake-bar i");
    const time = document.getElementById("fake-time");
    if (!bar) return;
    let n = 0;
    el.textContent = "⏸";
    const t = setInterval(() => {
      if (!document.body.contains(bar)) { clearInterval(t); return; }
      n += 1;
      bar.style.width = Math.min(100, n) + "%";
      if (time) time.textContent = `00:${String(Math.min(59, n)).padStart(2, "0")} / 01:12`;
      if (n >= 100) { clearInterval(t); el.textContent = "▶"; }
    }, 120);
  });

  /* ---------- 入口 ---------- */
  function render(segs, query) {
    const key = segs[0];
    if (key === "practice") return practicePage(query);
    if (key === "interview") {
      const sub = segs[1];
      if (!sub) return interviewConfigPage();
      if (sub === "session") return interviewSessionPage();
      if (sub === "report") return interviewReportPage(segs[2]);
      if (sub === "records") return interviewRecordsPage();
    }
    return "";
  }

  return { render, practicePage, interviewConfigPage, interviewSessionPage, interviewReportPage, interviewRecordsPage, pickQuestions, mmss };
})();
