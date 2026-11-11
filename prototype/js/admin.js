/* ============================================================
   云枢智学 · 管理端
   ============================================================ */
window.Admin = (function () {
  "use strict";
  const S = App.state;

  /* ---------- 初始化演示状态字段 ---------- */
  DB.allQuestions.forEach(q => { if (!q.status) q.status = "已上架"; });
  ["q103", "q115", "q122"].forEach(id => { if (DB.qById[id]) DB.qById[id].status = "待审核"; });
  if (DB.qById["q105"]) DB.qById["q105"].status = "已驳回";
  if (DB.qById["q112"]) DB.qById["q112"].status = "已下架";
  Object.values(DB.interviewBank).flat().forEach(q => { if (!q.status) q.status = "已上架"; });
  DB.interviewBank["s1|中等"][0].status = "待审核";
  DB.interviewBank["s2|困难"][1].status = "待审核";

  const ui = App.ui.admin = App.ui.admin || {
    qStatus: "all", qSubject: "all", qSearch: "",
    studentSearch: "", studentStatus: "all",
    ivSubject: "all", reviewTab: "待复核"
  };

  /* ---------- 布局 ---------- */
  const navGroups = [
    { label: "概览", items: [["", "数据看板", "📊"]] },
    {
      label: "内容管理", items: [
        ["subjects", "学科管理", "🗂️"], ["courses", "B站课程库", "▶️"],
        ["questions", "刷题题库", "📝"], ["interview-q", "面试题库", "🎙️"],
        ["kb", "知识库", "📚"], ["routes", "学习路线", "🧭"],
        ["dimensions", "能力维度", "🧩"], ["mapping", "维度映射", "🔗"]
      ]
    },
    { label: "学员与复核", items: [["students", "学员管理", "👥"], ["review", "批改复核", "⚖️"]] },
    {
      label: "系统", items: [
        ["users", "用户管理", "👤"], ["roles", "角色权限", "🔐"],
        ["logs", "操作日志", "📜"], ["settings", "系统设置", "⚙️"]
      ]
    }
  ];
  const titles = {
    "": "数据看板", subjects: "学科管理", courses: "B站课程库", questions: "刷题题库",
    "interview-q": "面试题库", kb: "知识库", routes: "学习路线", dimensions: "能力维度",
    mapping: "维度映射", students: "学员管理", review: "批改复核", users: "用户管理",
    roles: "角色权限", logs: "操作日志", settings: "系统设置"
  };

  function adminShell(content, active) {
    return `
    <div class="admin-shell">
      <aside class="sidebar" id="admin-sidebar">
        <div class="side-brand"><span class="brand-mark">☁</span> 云枢智学 <span style="font-size:10px;color:#6c739b;font-weight:500">ADMIN</span></div>
        ${navGroups.map(g => `<div class="side-group">${g.label}</div>
          <nav class="side-nav">
            ${g.items.map(([k, label, icon]) => `<a href="#/admin${k ? "/" + k : ""}" class="${active === k ? "active" : ""}">
              <span class="ic">${icon}</span>${label}${k === "questions" ? `<span class="pill">${DB.allQuestions.filter(q => q.status === "待审核").length}</span>` : ""}${k === "review" ? `<span class="pill">${S.appeals.filter(a => a.status === "待复核").length}</span>` : ""}
            </a>`).join("")}
          </nav>`).join("")}
        <div class="side-bottom">
          <div class="avatar" style="width:30px;height:30px;font-size:12px">管</div>
          <div class="grow" style="min-width:0"><div style="color:#fff;font-size:12px;font-weight:600">${App.esc(S.admin ? S.admin.name : "管理员")}</div><div style="font-size:10px;color:#6c739b">${App.esc(S.admin ? S.admin.role : "")}</div></div>
          <button class="x-btn" style="background:rgba(255,255,255,.08);color:#c9cdf0" data-act="admin.logout" title="退出">↩</button>
        </div>
      </aside>

      <div class="admin-main">
        <div class="admin-top">
          <div class="row gap-12">
            <button class="x-btn" data-act="admin.sidebar" style="display:none" id="sidebar-toggle">☰</button>
            <div class="crumb" style="margin:0">管理后台 <span class="sep">/</span> <span style="color:var(--text)">${titles[active] || "数据看板"}</span></div>
          </div>
          <div class="row gap-12">
            <a class="btn btn-sm btn-ghost" href="#/">返回学员端 ↗</a>
            <span class="badge badge-green"><span class="dot-live"></span> 系统正常</span>
            <div class="avatar" style="width:30px;height:30px;font-size:12px">管</div>
          </div>
        </div>
        <div class="admin-body">${content}</div>
      </div>
    </div>`;
  }

  function head(title, desc, extra) {
    return `<div class="page-hd row between wrap gap-16">
      <div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ""}</div>${extra || ""}</div>`;
  }
  const statusBadge = s => `<span class="badge ${s === "已上架" || s === "启用" || s === "正常" ? "badge-green" : s === "待审核" || s === "待复核" ? "badge-amber" : s === "已驳回" || s === "禁用" || s === "停用" ? "badge-red" : "badge-gray"}">${s}</span>`;

  /* ---------- 登录 ---------- */
  function loginPage() {
    setTimeout(() => {
      const f = document.getElementById("admin-login-form");
      if (f) f.addEventListener("submit", e => {
        e.preventDefault();
        S.admin = { name: "超级管理员", account: "admin", role: "超级管理员" };
        App.save(); App.toast("登录成功", "ok"); App.go("#/admin");
      });
    }, 0);
    return `
    <div class="auth-wrap">
      <div class="auth-side" style="background:radial-gradient(120% 120% at 10% 0%, #0f172a 0%, #1e1b4b 45%, #4338ca 100%)">
        <div class="brand" style="color:#fff"><span class="brand-mark">☁</span><span>云枢智学<small style="color:#a5b4fc">ADMIN CONSOLE</small></span></div>
        <h2>内容、学员、数据，<br>一处管理。</h2>
        <p>运营录入内容，内容审核把关；题库状态流转全程可追溯。</p>
        <div class="points">
          <div><span>✓</span> 题库审核流转与操作日志</div>
          <div><span>✓</span> 学员学习足迹与面试记录</div>
          <div><span>✓</span> 简答申诉人工复核</div>
        </div>
      </div>
      <div class="auth-main">
        <a class="auth-back" href="#/entry">← 返回入口选择</a>
        <div class="auth-card">
          <h1>管理后台登录</h1>
          <p class="sub">请使用管理员账号登录</p>
          <form id="admin-login-form" class="col gap-16">
            <div class="field"><label class="label">账号</label><input class="input" value="admin" /></div>
            <div class="field"><label class="label">密码</label><input class="input" type="password" value="admin123" /></div>
            <div class="field"><label class="label">验证码</label>
              <div class="input-row"><input class="input" placeholder="请输入验证码" value="8888" />
                <div style="width:104px;height:42px;border-radius:10px;border:1px solid var(--line);display:grid;place-items:center;background:linear-gradient(135deg,#eef0ff,#f5f3ff);font-weight:800;letter-spacing:.2em;color:var(--primary);font-size:16px;user-select:none">8 8 8 8</div></div></div>
            <button class="btn btn-primary btn-lg btn-block" type="submit">登 录</button>
          </form>
          <div class="help-block mt-16 text-xs">原型演示：账号密码已预填，直接点击登录即可。</div>
        </div>
      </div>
    </div>`;
  }

  /* ---------- 看板 ---------- */
  function dashboardPage() {
    const pending = DB.allQuestions.filter(q => q.status === "待审核").slice(0, 5);
    const d = DB.dashboard;
    const week = [312, 268, 401, 356, 498, 522, 286];
    const max = Math.max(...week);
    return adminShell(`
      ${head("数据看板", "平台整体运行情况 · 数据每 10 分钟更新", `<span class="badge badge-gray">统计截至 2026-11-11 14:30</span>`)}
      <div class="grid g4">
        <div class="stat"><div class="stat-top"><span>注册学员</span><span class="stat-ico">👥</span></div><div class="stat-value">${d.users.total.toLocaleString()}</div><div class="stat-sub">今日新增 <b style="color:var(--green)">+${d.users.today}</b> · 7 日活跃 ${d.users.active7}</div></div>
        <div class="stat"><div class="stat-top"><span>学习访问</span><span class="stat-ico" style="background:var(--green-soft)">📚</span></div><div class="stat-value">${d.learn.visits.toLocaleString()}</div><div class="stat-sub">已学标记 ${d.learn.learned} 次 · 课程 ${d.learn.courses} 门</div></div>
        <div class="stat"><div class="stat-top"><span>刷题总量</span><span class="stat-ico" style="background:var(--amber-soft)">📝</span></div><div class="stat-value">${d.practice.count.toLocaleString()}</div><div class="stat-sub">整体正确率 <b style="color:var(--green)">${d.practice.accuracy}%</b> · 错题 ${d.practice.wrong}</div></div>
        <div class="stat"><div class="stat-top"><span>AI 面试</span><span class="stat-ico" style="background:#e6f7fa">🎙️</span></div><div class="stat-value">${d.interview.count}</div><div class="stat-sub">平均分 ${d.interview.avg} · 及格率 ${d.interview.pass}%</div></div>
      </div>

      <div class="grid mt-20" style="grid-template-columns:1.5fr 1fr">
        <div class="card">
          <div class="card-hd"><div class="card-title"><span class="dot"></span>近 7 天学习访问</div><span class="text-xs text-muted">单位：次</span></div>
          <div class="card-bd">
            <div class="chart-bars" style="height:170px">
              ${["11/05", "11/06", "11/07", "11/08", "11/09", "11/10", "11/11"].map((l, i) => `<div class="bar-col"><b>${week[i]}</b><div class="bar" style="height:${Math.max(8, week[i] / max * 120)}px"></div><span>${l}</span></div>`).join("")}
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><div class="card-title">学员分布</div><span class="text-xs text-muted">按方向</span></div>
          <div class="card-bd col gap-12">
            ${DB.subjects.slice(0, 5).map((s, i) => {
              const n = [34, 22, 15, 12, 9][i];
              return `<div><div class="row between text-xs mb-4"><span>${s.short}</span><span class="text-muted">${n}%</span></div>${App.progress(n)}</div>`;
            }).join("")}
          </div>
        </div>
      </div>

      <div class="grid mt-20" style="grid-template-columns:1.2fr 1fr">
        <div class="card">
          <div class="card-hd"><div class="card-title">待审核题目</div><a class="link text-xs" href="#/admin/questions">查看全部 →</a></div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>题目</th><th>阶段</th><th>类型</th><th>提交人</th><th></th></tr></thead>
              <tbody>
                ${pending.map(q => `<tr>
                  <td class="strong" style="max-width:280px"><div class="clamp-2">${App.esc(q.stem)}</div></td>
                  <td class="text-muted">${App.esc(q.stageName)}</td>
                  <td>${App.typeBadge(q.type)}</td>
                  <td class="text-muted nowrap">王运营</td>
                  <td><button class="btn btn-sm btn-soft" data-act="admin.qReview" data-id="${q.id}">审核</button></td>
                </tr>`).join("") || `<tr><td colspan="5"><div class="empty" style="padding:24px">暂无待审核题目</div></td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><div class="card-title">最新操作</div><a class="link text-xs" href="#/admin/logs">全部日志 →</a></div>
          <div class="card-bd" style="padding:6px 0">
            ${DB.logs.slice(0, 5).map(l => `<div class="list-row" style="padding:11px 20px">
              <div class="idx" style="width:32px;height:32px;font-size:11px">${l.user.slice(0, 1)}</div>
              <div class="grow"><div class="text-sm"><b>${App.esc(l.user)}</b> ${App.esc(l.action)}</div><div class="text-xs text-muted">${App.esc(l.target)}</div></div>
              <span class="text-xs text-muted nowrap">${l.time.slice(11, 16)}</span>
            </div>`).join("")}
          </div>
        </div>
      </div>
    `, "");
  }

  /* ---------- 学科 ---------- */
  function subjectsPage() {
    return adminShell(`
      ${head("学科管理", "8 个 AI 技术方向；学科下挂阶段、课程与学习路线",
        `<button class="btn btn-primary" data-act="admin.subjectAdd">+ 新增学科</button>`)}
      <div class="card">
        <div class="table-wrap"><table class="table">
          <thead><tr><th>学科</th><th>阶段</th><th>题目</th><th>课程</th><th>路线</th><th>状态</th><th>排序</th><th style="text-align:right">操作</th></tr></thead>
          <tbody>
            ${DB.subjects.map((s, i) => `<tr>
              <td><div class="row gap-10"><span class="subject-ico" style="width:30px;height:30px;font-size:14px;background:${s.color}18">${s.icon}</span><div><div class="strong">${App.esc(s.name)}</div><div class="text-xs text-muted">${s.short}</div></div></div></td>
              <td>${s.stages.length}</td>
              <td>${s.stages.reduce((n, st) => n + st.questions.length, 0)}</td>
              <td>${s.courses.length}</td>
              <td>${s.routes.length}</td>
              <td>${statusBadge("启用")}</td>
              <td class="text-muted">${i + 1}</td>
              <td><div class="actions"><button class="btn btn-sm btn-ghost" data-act="admin.subjectEdit" data-id="${s.id}">编辑</button></div></td>
            </tr>`).join("")}
          </tbody>
        </table></div>
      </div>
    `, "subjects");
  }

  /* ---------- 课程 ---------- */
  function coursesPage() {
    const rows = DB.subjects.flatMap(s => s.courses.map(c => ({ ...c, subject: s })));
    return adminShell(`
      ${head("B站课程库", `共 ${rows.length} 门课程 · 课程库独立维护，可被多条学习路线引用`,
        `<div class="row gap-8"><button class="btn btn-ghost" data-act="admin.excelTip" data-type="课程">下载模板</button>
         <button class="btn btn-primary" data-act="admin.courseImport">Excel 批量导入</button></div>`)}
      <div class="card">
        <div class="toolbar" style="padding:16px 20px 0">
          <div class="search-box"><input class="input" placeholder="搜索课程名称" /></div>
          <select class="input" style="width:160px"><option>全部学科</option>${DB.subjects.map(s => `<option>${s.name}</option>`).join("")}</select>
          <div class="spacer"></div>
          <span class="text-xs text-muted">支持 .xlsx / .xls，单次最多 500 条</span>
        </div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>课程</th><th>所属学科</th><th>时长</th><th>被引用</th><th>状态</th><th style="text-align:right">操作</th></tr></thead>
          <tbody>
            ${rows.slice(0, 24).map(c => {
              const refs = c.subject.routes.filter(r => r.courseIds.includes(c.id)).length;
              return `<tr>
                <td><div class="row gap-10"><img class="course-thumb" style="width:52px;height:34px;object-fit:cover;display:block" src="${c.cover || ""}" alt="" /><div class="strong" style="max-width:260px"><div class="clamp-2">${App.esc(c.title)}</div></div></div></td>
                <td class="text-muted">${App.esc(c.subject.name)}</td>
                <td>${c.duration}</td>
                <td>${refs} 条路线</td>
                <td>${statusBadge("已上架")}</td>
                <td><div class="actions"><button class="btn btn-sm btn-ghost" data-act="admin.courseEdit" data-id="${c.id}">编辑</button><button class="btn btn-sm btn-ghost" data-act="admin.excelTip" data-type="下架">下架</button></div></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table></div>
        <div class="card-ft"><span class="text-xs text-muted" style="margin-right:auto">显示前 24 条，共 ${rows.length} 条</span></div>
      </div>
    `, "courses");
  }

  /* ---------- 刷题题库 ---------- */
  function questionsPage() {
    const statuses = ["all", "待审核", "已上架", "已驳回", "已下架"];
    let rows = DB.allQuestions.slice();
    if (ui.qStatus !== "all") rows = rows.filter(q => q.status === ui.qStatus);
    if (ui.qSubject !== "all") rows = rows.filter(q => q.subjectId === ui.qSubject);
    if (ui.qSearch) rows = rows.filter(q => (q.stem + q.stageName).toLowerCase().includes(ui.qSearch.toLowerCase()));
    return adminShell(`
      ${head("刷题题库", `共 ${DB.allQuestions.length} 道题 · 状态流转：待审核 → 已上架 / 已驳回；已上架 → 已下架`,
        `<div class="row gap-8"><button class="btn btn-ghost" data-act="admin.excelTip" data-type="题库">下载模板</button>
         <button class="btn btn-ghost" data-act="admin.qImport">Excel 导入</button>
         <button class="btn btn-primary" data-act="admin.qAdd">+ 新增题目</button></div>`)}
      <div class="tabs">
        ${statuses.map(s => `<div class="tab ${ui.qStatus === s ? "active" : ""}" data-act="admin.qFilter" data-status="${s}">${s === "all" ? "全部" : s} <span class="badge badge-gray" style="margin-left:4px">${s === "all" ? DB.allQuestions.length : DB.allQuestions.filter(q => q.status === s).length}</span></div>`).join("")}
      </div>
      <div class="toolbar">
        <select class="input" style="width:180px" id="q-subject-filter" onchange="Admin.setQSubject(this.value)">
          <option value="all">全部学科</option>
          ${DB.subjects.map(s => `<option value="${s.id}" ${ui.qSubject === s.id ? "selected" : ""}>${s.name}</option>`).join("")}
        </select>
        <div class="search-box"><input class="input" placeholder="搜索题干 / 阶段，回车确认" value="${App.esc(ui.qSearch)}" onkeydown="if(event.key==='Enter'){Admin.qSearch(this.value)}" /></div>
        <div class="spacer"></div>
        <span class="text-xs text-muted">共 ${rows.length} 条</span>
      </div>
      <div class="card">
        <div class="table-wrap"><table class="table">
          <thead><tr><th>题目</th><th>学科 / 阶段</th><th>类型</th><th>难度</th><th>能力维度</th><th>状态</th><th style="text-align:right">操作</th></tr></thead>
          <tbody>
            ${rows.slice(0, 22).map(q => `<tr>
              <td class="strong" style="max-width:300px;min-width:220px"><div class="clamp-2">${App.esc(q.stem)}</div><div class="text-xs text-muted" style="font-weight:400">${q.id}</div></td>
              <td class="text-muted">${App.esc(q.subjectName)}<div class="text-xs">${App.esc(q.stageName)}</div></td>
              <td>${App.typeBadge(q.type)}</td>
              <td>${App.diffBadge(q.difficulty)}</td>
              <td>${App.dimBadge(q.dim)}</td>
              <td>${statusBadge(q.status)}</td>
              <td><div class="actions">
                ${q.status === "待审核" ? `<button class="btn btn-sm btn-green" data-act="admin.qApprove" data-id="${q.id}">通过</button><button class="btn btn-sm btn-danger" data-act="admin.qReject" data-id="${q.id}">驳回</button>` : ""}
                ${q.status === "已上架" ? `<button class="btn btn-sm btn-ghost" data-act="admin.qOffline" data-id="${q.id}">下架</button>` : ""}
                ${q.status === "已驳回" || q.status === "已下架" ? `<button class="btn btn-sm btn-soft" data-act="admin.qRelist" data-id="${q.id}">重新上架</button>` : ""}
                <button class="btn btn-sm btn-ghost" data-act="admin.qEdit" data-id="${q.id}">编辑</button>
              </div></td>
            </tr>`).join("") || `<tr><td colspan="7"><div class="empty" style="padding:30px">没有符合条件的题目</div></td></tr>`}
          </tbody>
        </table></div>
        <div class="card-ft"><span class="text-xs text-muted" style="margin-right:auto">显示前 22 条，共 ${rows.length} 条</span></div>
      </div>
    `, "questions");
  }

  function qSearch(v) { ui.qSearch = v; App.render(); }

  function questionModal(q) {
    const isEdit = !!q;
    const types = [["single", "单选题"], ["multiple", "多选题"], ["judge", "判断题"], ["short", "简答题"]];
    App.modal({
      title: isEdit ? "编辑题目" : "新增题目",
      size: "lg",
      body: `
        <div class="grid g3" style="gap:12px">
          <div class="field"><label class="label">学科<span class="req">*</span></label>
            <select class="input" id="qm-subject">${DB.subjects.map(s => `<option value="${s.id}" ${q && q.subjectId === s.id ? "selected" : ""}>${s.name}</option>`).join("")}</select></div>
          <div class="field"><label class="label">阶段<span class="req">*</span></label>
            <select class="input" id="qm-stage">${(DB.subjectById[q ? q.subjectId : "s1"] || DB.subjects[0]).stages.map(st => `<option value="${st.id}" ${q && q.stageId === st.id ? "selected" : ""}>${st.name}</option>`).join("")}</select></div>
          <div class="field"><label class="label">题型<span class="req">*</span></label>
            <select class="input" id="qm-type">${types.map(([v, l]) => `<option value="${v}" ${q && q.type === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
          <div class="field"><label class="label">难度<span class="req">*</span></label>
            <select class="input" id="qm-diff">${["简单", "中等", "困难"].map(d => `<option ${q && q.difficulty === d ? "selected" : ""}>${d}</option>`).join("")}</select></div>
          <div class="field"><label class="label">能力维度<span class="req">*</span></label>
            <select class="input" id="qm-dim">${DB.dimensions.map(d => `<option value="${d.id}" ${q && q.dim === d.id ? "selected" : ""}>${d.name}</option>`).join("")}</select></div>
          <div class="field"><label class="label">分值</label><input class="input" id="qm-score" type="number" value="${q ? q.score : 10}" /></div>
        </div>
        <div class="field mt-16"><label class="label">题干<span class="req">*</span></label>
          <textarea class="input" id="qm-stem" rows="3" placeholder="请输入题干">${q ? App.esc(q.stem) : ""}</textarea></div>
        <div id="qm-choice">
          <div class="field mt-16"><label class="label">选项（每行一个）</label>
            <textarea class="input" id="qm-options" rows="4" placeholder="选项 A&#10;选项 B&#10;选项 C&#10;选项 D">${q && q.options ? App.esc(q.options.join("\n")) : ""}</textarea></div>
          <div class="grid g2 mt-12">
            <div class="field"><label class="label">正确答案（如 A 或 A,C）<span class="req">*</span></label>
              <input class="input" id="qm-answer" value="${q && q.answer ? q.answer.map(i => String.fromCharCode(65 + i)).join(",") : ""}" placeholder="A" /></div>
            <div class="field"><label class="label">解析</label><input class="input" id="qm-explain" value="${q ? App.esc(q.explanation || "") : ""}" placeholder="答案解析" /></div>
          </div>
        </div>
        <div id="qm-short" class="hide">
          <div class="field mt-16"><label class="label">采分点（每行：采分点描述|分值）<span class="req">*</span></label>
            <textarea class="input" id="qm-points" rows="4" placeholder="说明核心概念|4&#10;说明实现方式|3&#10;给出应用场景|3">${q && q.points ? App.esc(q.points.map(p => p.text + "|" + p.score).join("\n")) : ""}</textarea></div>
          <div class="grid g2 mt-12">
            <div class="field"><label class="label">本题及格线（占满分比例）</label><input class="input" id="qm-pass" value="${q && q.pass ? q.pass : 0.6}" /></div>
            <div class="field"><label class="label">参考答案</label><input class="input" id="qm-reference" value="${q ? App.esc(q.reference || "") : ""}" /></div>
          </div>
        </div>
        <div class="help-block mt-16">题目保存后进入「待审核」，由内容审核角色通过后才会上架。能力维度为必填项，用于能力报告与推荐。</div>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button>
        <button class="btn btn-primary" data-act="admin.qSave" data-id="${q ? q.id : ""}">保存</button>`,
      onMount(root) {
        const subjectSel = root.querySelector("#qm-subject");
        const stageSel = root.querySelector("#qm-stage");
        const typeSel = root.querySelector("#qm-type");
        const syncStages = () => {
          const s = DB.subjectById[subjectSel.value];
          stageSel.innerHTML = s.stages.map(st => `<option value="${st.id}">${st.name}</option>`).join("");
        };
        const syncType = () => {
          const short = typeSel.value === "short";
          root.querySelector("#qm-choice").classList.toggle("hide", short);
          root.querySelector("#qm-short").classList.toggle("hide", !short);
        };
        subjectSel.addEventListener("change", syncStages);
        typeSel.addEventListener("change", syncType);
        syncType();
      }
    });
  }

  /* ---------- 面试题库 ---------- */
  function interviewQPage() {
    const all = Object.values(DB.interviewBank).flat();
    let rows = all;
    if (ui.ivSubject !== "all") rows = rows.filter(q => q.subjectId === ui.ivSubject);
    return adminShell(`
      ${head("面试题库", `共 ${all.length} 道面试题 · 按「学科 × 难度」组织，知识库导入后自动切题`,
        `<div class="row gap-8"><button class="btn btn-ghost" data-act="admin.kbUpload">从知识库导入</button><button class="btn btn-primary" data-act="admin.ivAdd">+ 新增面试题</button></div>`)}
      <div class="toolbar">
        <select class="input" style="width:200px" onchange="Admin.setIvSubject(this.value)">
          <option value="all">全部学科</option>
          ${DB.subjects.map(s => `<option value="${s.id}" ${ui.ivSubject === s.id ? "selected" : ""}>${s.name}</option>`).join("")}
        </select>
        <select class="input" style="width:140px"><option>全部难度</option>${DB.difficulties.map(d => `<option>${d}</option>`).join("")}</select>
        <div class="spacer"></div>
        <span class="text-xs text-muted">题干只读，知识库导入后不可直接修改</span>
      </div>
      <div class="card">
        <div class="table-wrap"><table class="table">
          <thead><tr><th>题目</th><th>学科</th><th>难度</th><th>能力维度</th><th>状态</th><th style="text-align:right">操作</th></tr></thead>
          <tbody>
            ${rows.slice(0, 18).map(q => `<tr>
              <td class="strong" style="max-width:380px"><div class="clamp-2">${App.esc(q.text)}</div></td>
              <td class="text-muted">${App.esc((DB.subjectById[q.subjectId] || {}).name || "")}</td>
              <td>${App.diffBadge(q.difficulty)}</td>
              <td>${App.dimBadge(q.dim)}</td>
              <td>${statusBadge(q.status)}</td>
              <td><div class="actions">
                <button class="btn btn-sm btn-ghost" data-act="admin.ivView" data-id="${q.id}">查看</button>
                ${q.status === "待审核" ? `<button class="btn btn-sm btn-green" data-act="admin.ivApprove" data-id="${q.id}">通过</button>` : `<button class="btn btn-sm btn-ghost" data-act="admin.ivOffline" data-id="${q.id}">${q.status === "已下架" ? "上架" : "下架"}</button>`}
              </div></td>
            </tr>`).join("")}
          </tbody>
        </table></div>
        <div class="card-ft"><span class="text-xs text-muted" style="margin-right:auto">显示前 18 条，共 ${rows.length} 条</span></div>
      </div>
    `, "interview-q");
  }

  /* ---------- 知识库 ---------- */
  function kbPage() {
    return adminShell(`
      ${head("知识库", "每个知识库绑定一个学科；支持 Markdown / 文本，按标题切题，不做 AI 抽题",
        `<div class="row gap-8"><button class="btn btn-ghost" data-act="admin.kbUpload">上传文档</button><button class="btn btn-primary" data-act="admin.kbAdd">+ 新建知识库</button></div>`)}
      <div class="grid g3">
        ${DB.knowledgeBases.map(kb => {
          const s = DB.subjectById[kb.subjectId];
          return `<div class="card pad-22">
            <div class="row between"><span class="subject-ico" style="background:${s.color}18">📚</span>${statusBadge(kb.status)}</div>
            <h3 class="mt-12" style="font-size:15px">${App.esc(kb.name)}</h3>
            <div class="text-xs text-muted mt-4">所属学科：${App.esc(s.name)}</div>
            <div class="row gap-16 mt-12 text-xs text-muted"><span>📄 ${kb.docs} 篇文档</span><span>❓ ${kb.questions} 道题</span></div>
            <div class="text-xs text-muted mt-8">更新于 ${kb.updated}</div>
            <div class="row gap-8 mt-16"><button class="btn btn-sm btn-soft" data-act="admin.kbUpload">上传文档</button><button class="btn btn-sm btn-ghost" data-act="admin.kbView" data-id="${kb.id}">查看切题</button></div>
          </div>`;
        }).join("")}
      </div>
      <div class="help-block mt-16">切题规则：按 Markdown 一级/二级标题切分，每个标题下内容生成一道面试题；导入前可预览并人工调整，确认后才写入题库。</div>
    `, "kb");
  }

  /* ---------- 学习路线 ---------- */
  function routesPage() {
    const rows = DB.subjects.flatMap(s => s.routes.map(r => ({ ...r, subject: s })));
    return adminShell(`
      ${head("学习路线", "一条路线只属于一个学科；路线引用课程库中的课程，课程顺序即学习顺序",
        `<button class="btn btn-primary" data-act="admin.routeAdd">+ 新建路线</button>`)}
      <div class="card">
        <div class="table-wrap"><table class="table">
          <thead><tr><th>路线</th><th>学科</th><th>难度</th><th>课程数</th><th>状态</th><th style="text-align:right">操作</th></tr></thead>
          <tbody>
            ${rows.map(r => `<tr>
              <td><div class="strong">${App.esc(r.name)}</div><div class="text-xs text-muted clamp-2" style="max-width:420px">${App.esc(r.desc)}</div></td>
              <td class="text-muted">${App.esc(r.subject.name)}</td>
              <td><span class="badge badge-gray">${r.level}</span></td>
              <td>${r.courseIds.length} 门</td>
              <td>${statusBadge("已上架")}</td>
              <td><div class="actions"><button class="btn btn-sm btn-ghost" data-act="admin.routeEdit" data-id="${r.id}">编辑课程</button></div></td>
            </tr>`).join("")}
          </tbody>
        </table></div>
      </div>
    `, "routes");
  }

  /* ---------- 能力维度 ---------- */
  function dimensionsPage() {
    return adminShell(`
      ${head("能力维度", "全局 6 个维度，所有学科共用；题库与面试题均需标注维度",
        `<span class="badge badge-indigo">固定 6 个</span>`)}
      <div class="grid g3">
        ${DB.dimensions.map((d, i) => `<div class="card pad-22">
          <div class="row between"><span class="subject-ico" style="background:${d.color}18;color:${d.color}">${i + 1}</span>
            <button class="btn btn-sm btn-ghost" data-act="admin.dimEdit" data-id="${d.id}">编辑</button></div>
          <h3 class="mt-12" style="font-size:15px">${d.name}</h3>
          <p class="text-sm text-muted mt-6" style="min-height:40px">${d.desc}</p>
          <div class="row between mt-12 text-xs text-muted"><span>已标注题目</span><span>${DB.allQuestions.filter(q => q.dim === d.id).length} 道</span></div>
          ${App.progress(100, "green")}
        </div>`).join("")}
      </div>
      <div class="card mt-20">
        <div class="card-hd"><div class="card-title">维度 → 内容映射</div><a class="link text-xs" href="#/admin/mapping">前往维护 →</a></div>
        <div class="card-bd text-sm text-muted">用于面试报告中的「能力提升建议」：每个维度关联推荐课程与阶段，报告生成时据此推荐复习内容。</div>
      </div>
    `, "dimensions");
  }

  /* ---------- 维度映射 ---------- */
  function mappingPage() {
    return adminShell(`
      ${head("维度映射", "维护「能力维度 → 推荐课程 / 阶段」，供面试报告与能力中心推荐使用", `<span class="badge badge-amber">必填</span>`)}
      <div class="card">
        <div class="table-wrap"><table class="table">
          <thead><tr><th>能力维度</th><th>推荐阶段</th><th>推荐课程</th><th>状态</th><th style="text-align:right">操作</th></tr></thead>
          <tbody>
            ${DB.dimensions.map((d, i) => `<tr>
              <td><div class="row gap-8"><span style="width:9px;height:9px;border-radius:3px;background:${d.color}"></span><b>${d.name}</b></div></td>
              <td class="text-muted">${["Prompt 与上下文工程", "RAG 与知识库", "Agent 与工具调用", "RAG 与知识库", "Prompt 与上下文工程", "Agent 与工具调用"][i]}</td>
              <td class="text-muted">${["Prompt 工程实战", "RAG 从入门到上线", "LangGraph 多智能体", "大模型应用评估", "Prompt 工程实战", "LangGraph 多智能体"][i]}</td>
              <td>${statusBadge("已启用")}</td>
              <td><div class="actions"><button class="btn btn-sm btn-ghost" data-act="admin.mapEdit" data-id="${d.id}">编辑</button></div></td>
            </tr>`).join("")}
          </tbody>
        </table></div>
      </div>
      <div class="help-block mt-16">未配置映射的维度，报告中将只给出通用建议，不推荐具体内容。</div>
    `, "mapping");
  }

  /* ---------- 学员 ---------- */
  function studentsPage() {
    let rows = DB.students.slice();
    if (ui.studentStatus !== "all") rows = rows.filter(s => s.status === ui.studentStatus);
    if (ui.studentSearch) rows = rows.filter(s => (s.name + s.phone).includes(ui.studentSearch));
    return adminShell(`
      ${head("学员管理", `共 ${DB.students.length} 名学员 · 学习天数按“有任意活动”计算，已学课程按手动标记计算`,
        `<div class="row gap-8"><button class="btn btn-ghost" data-act="admin.exportStudents">导出 Excel</button></div>`)}
      <div class="toolbar">
        <div class="search-box"><input class="input" placeholder="搜索昵称 / 手机号，回车确认" value="${App.esc(ui.studentSearch)}" onkeydown="if(event.key==='Enter'){Admin.studentSearch(this.value)}" /></div>
        <select class="input" style="width:140px" onchange="Admin.setStudentStatus(this.value)">
          <option value="all">全部状态</option>
          <option value="正常" ${ui.studentStatus === "正常" ? "selected" : ""}>正常</option>
          <option value="禁用" ${ui.studentStatus === "禁用" ? "selected" : ""}>已禁用</option>
        </select>
        <div class="spacer"></div>
        <span class="text-xs text-muted">导出默认脱敏，明文导出需超管权限并记录日志</span>
      </div>
      <div class="card">
        <div class="table-wrap"><table class="table">
          <thead><tr><th>学员</th><th>手机号</th><th>状态</th><th>学习天数</th><th>做题</th><th>面试</th><th>注册时间</th><th>最近活跃</th><th style="text-align:right">操作</th></tr></thead>
          <tbody>
            ${rows.map(s => `<tr>
              <td><div class="row gap-10"><div class="avatar" style="width:30px;height:30px;font-size:12px">${App.esc(s.name.slice(0, 1))}</div><b>${App.esc(s.name)}</b></div></td>
              <td class="mono text-muted">${s.phone}</td>
              <td>${statusBadge(s.status)}</td>
              <td>${s.learnDays} 天</td>
              <td>${s.questions}</td>
              <td>${s.interviews}</td>
              <td class="text-muted">${s.registered}</td>
              <td class="text-muted">${s.lastActive}</td>
              <td><div class="actions">
                <button class="btn btn-sm btn-ghost" data-act="admin.studentDetail" data-id="${s.id}">详情</button>
                <button class="btn btn-sm ${s.status === "正常" ? "btn-danger" : "btn-green"}" data-act="admin.studentToggle" data-id="${s.id}">${s.status === "正常" ? "禁用" : "启用"}</button>
              </div></td>
            </tr>`).join("")}
          </tbody>
        </table></div>
      </div>
      <div class="card mt-20">
        <div class="card-hd"><div class="card-title">合规说明</div></div>
        <div class="card-bd text-sm text-muted" style="line-height:1.9">
          机构可查看学员的学习足迹与练习记录，学员在注册时已知情；手机号默认脱敏展示；导出行为全部写入操作日志；注销账号软删除 30 天后彻底清除。
        </div>
      </div>
    `, "students");
  }
  function studentSearch(v) { ui.studentSearch = v; App.render(); }

  /* ---------- 复核 ---------- */
  function reviewPage() {
    const rows = S.appeals.filter(a => ui.reviewTab === "全部" || a.status === ui.reviewTab);
    return adminShell(`
      ${head("批改复核", "处理学员对简答题 AI 评分的申诉；复核结果通过站内消息通知学员",
        `<span class="badge badge-amber">${S.appeals.filter(a => a.status === "待复核").length} 条待处理</span>`)}
      <div class="tabs">
        ${["待复核", "已通过", "已驳回", "全部"].map(t => `<div class="tab ${ui.reviewTab === t ? "active" : ""}" data-act="admin.reviewTab" data-tab="${t}">${t}</div>`).join("")}
      </div>
      <div class="card">
        <div class="table-wrap"><table class="table">
          <thead><tr><th>学员</th><th>题目</th><th>AI 评分</th><th>学员申诉</th><th>申诉理由</th><th>时间</th><th>状态</th><th style="text-align:right">操作</th></tr></thead>
          <tbody>
            ${rows.map(a => {
              const q = DB.qById[a.question] || {};
              return `<tr>
                <td><b>${App.esc(a.student)}</b></td>
                <td class="text-muted" style="max-width:240px"><div class="clamp-2">${App.esc(q.stem || a.question)}</div></td>
                <td><b style="color:var(--amber)">${a.score}</b> / ${q.score || 10}</td>
                <td><b style="color:var(--primary)">${a.studentScore}</b> / ${q.score || 10}</td>
                <td class="text-muted" style="max-width:260px"><div class="clamp-2">${App.esc(a.reason)}</div></td>
                <td class="text-muted nowrap">${a.time}</td>
                <td>${statusBadge(a.status)}</td>
                <td><div class="actions">${a.status === "待复核" ? `<button class="btn btn-sm btn-primary" data-act="admin.reviewOpen" data-id="${a.id}">复核</button>` : `<button class="btn btn-sm btn-ghost" data-act="admin.reviewOpen" data-id="${a.id}">查看</button>`}</div></td>
              </tr>`;
            }).join("") || `<tr><td colspan="8"><div class="empty" style="padding:30px">暂无记录</div></td></tr>`}
          </tbody>
        </table></div>
      </div>
    `, "review");
  }

  /* ---------- 系统 ---------- */
  function usersPage() {
    return adminShell(`
      ${head("用户管理", "管理后台账号；账号与角色绑定，权限由角色决定",
        `<button class="btn btn-primary" data-act="admin.userAdd">+ 新增用户</button>`)}
      <div class="card">
        <div class="table-wrap"><table class="table">
          <thead><tr><th>用户</th><th>账号</th><th>角色</th><th>状态</th><th>最近登录</th><th style="text-align:right">操作</th></tr></thead>
          <tbody>
            ${DB.adminUsers.map(u => `<tr>
              <td><div class="row gap-10"><div class="avatar" style="width:30px;height:30px;font-size:12px">${u.name.slice(0, 1)}</div><b>${u.name}</b></div></td>
              <td class="mono text-muted">${u.account}</td>
              <td><span class="role-tag">${u.role}</span></td>
              <td>${statusBadge(u.status === "启用" ? "正常" : "禁用")}</td>
              <td class="text-muted">${u.lastLogin}</td>
              <td><div class="actions"><button class="btn btn-sm btn-ghost" data-act="admin.userEdit" data-id="${u.id}">编辑</button><button class="btn btn-sm btn-ghost" data-act="admin.userToggle" data-id="${u.id}">${u.status === "启用" ? "停用" : "启用"}</button></div></td>
            </tr>`).join("")}
          </tbody>
        </table></div>
      </div>
    `, "users");
  }

  function rolesPage() {
    return adminShell(`
      ${head("角色权限", "3 个内置角色 · 共 25 个权限点；内容审核只审不改，运营只录入不审核",
        `<button class="btn btn-primary" data-act="admin.roleAdd">+ 新增角色</button>`)}
      <div class="grid g3">
        ${DB.roles.map(r => `<div class="card pad-22">
          <div class="row between"><span class="role-tag">${r.name}</span><span class="text-xs text-muted">${r.count} 名用户</span></div>
          <p class="text-sm text-muted mt-12" style="min-height:44px">${r.desc}</p>
          <div class="row between mt-12 text-xs"><span class="text-muted">权限点</span><b>${r.perms} / 25</b></div>
          ${App.progress(Math.round(r.perms / 25 * 100))}
          <button class="btn btn-sm btn-ghost btn-block mt-16" data-act="admin.roleEdit" data-id="${r.id}">编辑权限</button>
        </div>`).join("")}
      </div>
      <div class="card mt-20">
        <div class="card-hd"><div class="card-title">权限点清单</div><span class="text-xs text-muted">共 ${DB.permissionGroups.reduce((n, g) => n + g.perms.length, 0)} 项</span></div>
        <div class="card-bd col gap-16">
          ${DB.permissionGroups.map(g => `<div><div class="text-xs text-muted mb-8">${g.group}</div><div class="perm-grid">${g.perms.map(p => `<span class="perm">${p}</span>`).join("")}</div></div>`).join("")}
        </div>
      </div>
    `, "roles");
  }

  function logsPage() {
    return adminShell(`
      ${head("操作日志", "记录后台关键操作，日志保留 180 天", `<span class="badge badge-gray">共 ${DB.logs.length} 条</span>`)}
      <div class="toolbar">
        <div class="search-box"><input class="input" placeholder="搜索操作人 / 内容" /></div>
        <select class="input" style="width:150px"><option>全部操作</option><option>新增</option><option>审核</option><option>导出</option></select>
        <input class="input" type="date" style="width:160px" value="2026-11-11" />
      </div>
      <div class="card">
        <div class="table-wrap"><table class="table">
          <thead><tr><th>时间</th><th>操作人</th><th>操作</th><th>对象</th><th>IP</th></tr></thead>
          <tbody>
            ${DB.logs.map(l => `<tr class="log-row">
              <td class="text-muted">${l.time}</td>
              <td>${App.esc(l.user)}</td>
              <td><span class="badge badge-indigo tag">${App.esc(l.action)}</span></td>
              <td class="text-muted">${App.esc(l.target)}</td>
              <td class="text-muted">${l.ip}</td>
            </tr>`).join("")}
          </tbody>
        </table></div>
      </div>
    `, "logs");
  }

  function settingsPage() {
    return adminShell(`
      ${head("系统设置", "基础信息、注册安全、AI 配额与数据保留策略", `<button class="btn btn-primary" data-act="admin.saveSettings">保存设置</button>`)}
      <div class="grid g2">
        <div class="card">
          <div class="card-hd"><div class="card-title">基础信息</div></div>
          <div class="card-bd col gap-14">
            <div class="field"><label class="label">平台名称</label><input class="input" value="云枢智学" /></div>
            <div class="field"><label class="label">客服邮箱</label><input class="input" value="support@yunshu.ai" /></div>
            <div class="field"><label class="label">备案号</label><input class="input" placeholder="选填" /></div>
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><div class="card-title">注册与安全</div></div>
          <div class="card-bd col gap-14">
            <div class="row between"><div><div class="text-sm text-strong">开放注册</div><div class="text-xs text-muted">关闭后仅后台可创建学员</div></div><button class="switch on" data-act="admin.switch"></button></div>
            <div class="row between"><div><div class="text-sm text-strong">注册需勾选 18 岁</div><div class="text-xs text-muted">不强制验证</div></div><button class="switch on" data-act="admin.switch"></button></div>
            <div class="field"><label class="label">密码错误锁定</label><input class="input" value="5 次错误锁定 5 分钟" /></div>
            <div class="field"><label class="label">验证码频率</label><input class="input" value="60 秒 1 次，每日 10 次" /></div>
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><div class="card-title">AI 配额</div></div>
          <div class="card-bd col gap-14">
            <div class="field"><label class="label">AI 面试每日次数（每人）</label><input class="input" value="5" /></div>
            <div class="field"><label class="label">单题超时（分钟）</label><input class="input" value="5" /></div>
            <div class="field"><label class="label">简答判分每日额度（每人）</label><input class="input" value="100" /></div>
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><div class="card-title">数据保留</div></div>
          <div class="card-bd col gap-14">
            <div class="field"><label class="label">学习足迹</label><input class="input" value="1 年" /></div>
            <div class="field"><label class="label">练习记录</label><input class="input" value="2 年" /></div>
            <div class="field"><label class="label">面试录音</label><input class="input" value="90 天（到期自动删除）" /></div>
            <div class="help-block">面试报告永久保留；账号注销后软删除 30 天再彻底清除。</div>
          </div>
        </div>
      </div>
      <div class="card mt-20" style="border-color:#f3d2cf">
        <div class="card-hd"><div class="card-title" style="color:var(--red)">演示数据</div></div>
        <div class="card-bd row between wrap gap-12">
          <div class="text-sm text-muted">将所有学习进度、错题、面试记录恢复为初始演示数据。</div>
          <button class="btn btn-danger" data-act="admin.resetDemo">重置演示数据</button>
        </div>
      </div>
    `, "settings");
  }

  /* ---------- 动作 ---------- */
  App.on("admin.sidebar", () => document.getElementById("admin-sidebar").classList.toggle("open"));
  App.on("admin.logout", () => { S.admin = null; App.save(); App.toast("已退出管理后台", "ok"); App.go("#/admin/login"); });
  App.on("admin.switch", el => el.classList.toggle("on"));
  App.on("admin.saveSettings", () => App.toast("设置已保存（原型演示）", "ok"));
  App.on("admin.resetDemo", () => App.confirm("重置演示数据", "将清空当前所有演示进度并恢复初始状态，确定吗？", () => {
    App.reset(); App.go("#/admin/login");
  }, "重置"));

  App.on("admin.qFilter", el => { ui.qStatus = el.dataset.status; App.render(); });
  function setQSubject(v) { ui.qSubject = v; App.render(); }
  function setIvSubject(v) { ui.ivSubject = v; App.render(); }
  function setStudentStatus(v) { ui.studentStatus = v; App.render(); }

  App.on("admin.qAdd", () => questionModal(null));
  App.on("admin.qEdit", el => questionModal(DB.qById[el.dataset.id]));
  App.on("admin.qReview", el => questionModal(DB.qById[el.dataset.id]));
  App.on("admin.qApprove", el => { const q = DB.qById[el.dataset.id]; q.status = "已上架"; addLog("审核通过", q.id + " · " + q.stageName); App.toast("已上架", "ok"); App.render(); });
  App.on("admin.qReject", el => { const q = DB.qById[el.dataset.id]; q.status = "已驳回"; addLog("驳回题目", q.id + " · " + q.stageName); App.toast("已驳回", "ok"); App.render(); });
  App.on("admin.qOffline", el => { const q = DB.qById[el.dataset.id]; q.status = "已下架"; addLog("下架题目", q.id); App.toast("已下架", "ok"); App.render(); });
  App.on("admin.qRelist", el => { const q = DB.qById[el.dataset.id]; q.status = "待审核"; addLog("重新提交审核", q.id); App.toast("已提交审核", "ok"); App.render(); });
  App.on("admin.qSave", el => {
    const id = el.dataset.id;
    const type = document.getElementById("qm-type").value;
    const subjectId = document.getElementById("qm-subject").value;
    const stageId = document.getElementById("qm-stage").value;
    const stem = document.getElementById("qm-stem").value.trim();
    const dim = document.getElementById("qm-dim").value;
    if (!stem) return App.toast("请填写题干", "err");
    const score = Number(document.getElementById("qm-score").value) || 10;
    let payload = {
      type, subjectId, stageId, stem, dim, score,
      difficulty: document.getElementById("qm-diff").value,
      subjectName: DB.subjectById[subjectId].name,
      stageName: (DB.stageById[stageId] || {}).name || "",
      status: "待审核"
    };
    if (type === "short") {
      const pts = document.getElementById("qm-points").value.split("\n").filter(Boolean).map(line => {
        const [text, s] = line.split("|");
        return { text: (text || "").trim(), score: Number(s) || 0 };
      });
      if (!pts.length) return App.toast("请配置至少一个采分点", "err");
      payload.points = pts;
      payload.pass = Number(document.getElementById("qm-pass").value) || 0.6;
      payload.reference = document.getElementById("qm-reference").value;
      payload.options = null; payload.answer = [];
    } else {
      const opts = document.getElementById("qm-options").value.split("\n").map(x => x.trim()).filter(Boolean);
      if (opts.length < 2) return App.toast("请至少填写两个选项", "err");
      const ansRaw = document.getElementById("qm-answer").value.toUpperCase().replace(/\s/g, "");
      const answer = ansRaw.split(/[,，]/).filter(Boolean).map(x => x.charCodeAt(0) - 65).filter(i => i >= 0 && i < opts.length);
      if (!answer.length) return App.toast("请填写正确答案", "err");
      payload.options = opts; payload.answer = answer;
      payload.explanation = document.getElementById("qm-explain").value;
    }
    if (id) {
      Object.assign(DB.qById[id], payload);
      addLog("编辑题目", id);
    } else {
      const nq = { id: "q" + Date.now().toString().slice(-6), ...payload };
      DB.allQuestions.push(nq); DB.qById[nq.id] = nq;
      const stage = DB.stageById[stageId]; if (stage) stage.questions.push(nq);
      addLog("新增题目", nq.id + " · " + nq.stageName);
    }
    App.closeModal(); App.toast("已保存，等待内容审核", "ok"); App.render();
  });

  App.on("admin.ivView", el => {
    const q = Object.values(DB.interviewBank).flat().find(x => x.id === el.dataset.id);
    App.modal({ title: "面试题详情", body: `<div class="row gap-8 mb-12">${App.diffBadge(q.difficulty)}${App.dimBadge(q.dim)}${statusBadge(q.status)}</div>
      <div style="font-size:15px;font-weight:600;line-height:1.8">${App.esc(q.text)}</div>
      <div class="help-block mt-16"><b>参考要点：</b>${App.esc(q.reference)}</div>` });
  });
  App.on("admin.ivApprove", el => { const q = Object.values(DB.interviewBank).flat().find(x => x.id === el.dataset.id); q.status = "已上架"; addLog("审核通过面试题", q.id); App.toast("已上架", "ok"); App.render(); });
  App.on("admin.ivOffline", el => { const q = Object.values(DB.interviewBank).flat().find(x => x.id === el.dataset.id); q.status = q.status === "已下架" ? "已上架" : "已下架"; App.toast(q.status === "已下架" ? "已下架" : "已上架", "ok"); App.render(); });
  App.on("admin.ivAdd", () => App.modal({
    title: "新增面试题",
    body: `<div class="grid g3" style="gap:12px">
        <div class="field"><label class="label">学科</label><select class="input" id="ivm-subject">${DB.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join("")}</select></div>
        <div class="field"><label class="label">难度</label><select class="input" id="ivm-diff">${DB.difficulties.map(d => `<option>${d}</option>`).join("")}</select></div>
        <div class="field"><label class="label">能力维度</label><select class="input" id="ivm-dim">${DB.dimensions.map(d => `<option value="${d.id}">${d.name}</option>`).join("")}</select></div>
      </div>
      <div class="field mt-16"><label class="label">题干</label><textarea class="input" id="ivm-text" rows="4"></textarea></div>
      <div class="field mt-12"><label class="label">参考要点</label><textarea class="input" id="ivm-ref" rows="2"></textarea></div>`,
    footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.ivSave">保存</button>`
  }));
  App.on("admin.ivSave", () => {
    const subjectId = document.getElementById("ivm-subject").value;
    const difficulty = document.getElementById("ivm-diff").value;
    const text = document.getElementById("ivm-text").value.trim();
    if (!text) return App.toast("请填写题干", "err");
    DB.interviewBank[`${subjectId}|${difficulty}`].push({
      id: "iq-new-" + Date.now(), subjectId, difficulty,
      dim: document.getElementById("ivm-dim").value, text,
      reference: document.getElementById("ivm-ref").value, status: "待审核"
    });
    App.closeModal(); App.toast("已保存，等待审核", "ok"); App.render();
  });

  App.on("admin.kbAdd", () => App.modal({
    title: "新建知识库",
    body: `<div class="col gap-14">
      <div class="field"><label class="label">知识库名称</label><input class="input" id="kbm-name" placeholder="例如：智能体开发知识库" /></div>
      <div class="field"><label class="label">所属学科<span class="req">*</span></label><select class="input" id="kbm-subject">${DB.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join("")}</select></div>
      <div class="help-block">一个知识库只能绑定一个学科；绑定后导入的题目将归入该方向的面试题库。</div></div>`,
    footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.kbSave">创建</button>`
  }));
  App.on("admin.kbSave", () => {
    const name = document.getElementById("kbm-name").value.trim();
    if (!name) return App.toast("请输入名称", "err");
    DB.knowledgeBases.push({ id: "kb" + Date.now(), name, subjectId: document.getElementById("kbm-subject").value, docs: 0, questions: 0, updated: new Date().toISOString().slice(0, 16).replace("T", " "), status: "草稿" });
    App.closeModal(); App.toast("知识库已创建", "ok"); App.render();
  });
  App.on("admin.kbUpload", () => App.modal({
    title: "上传知识库文档",
    size: "lg",
    body: `<div class="upload-zone" id="kb-drop"><div class="big">📄</div>
        <div class="text-strong">点击选择或拖拽文件到此处</div>
        <div class="text-xs text-muted mt-4">支持 .md / .txt，单个文件不超过 5MB</div>
        <input type="file" id="kb-file" accept=".md,.txt" style="display:none" /></div>
      <div class="mt-16">
        <div class="row between mb-8"><b class="text-sm">切题预览</b><span class="badge badge-indigo">按标题切分 · 共 3 题</span></div>
        ${["1. 什么是 RAG？", "2. 向量检索与关键词检索的区别", "3. 如何评估 RAG 的召回质量"].map(t => `<div class="help-block mb-8" style="background:#fff;border-style:solid"><div class="row between"><span class="text-sm">${t}</span><span class="badge badge-gray">待确认</span></div></div>`).join("")}
      </div>
      <div class="text-xs text-muted mt-8">导入前可人工调整切题结果；确认后写入面试题库，状态为「待审核」。</div>`,
    footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.kbImport">确认导入 3 题</button>`,
    onMount(root) {
      const zone = root.querySelector("#kb-drop"), file = root.querySelector("#kb-file");
      zone.addEventListener("click", () => file.click());
      file.addEventListener("change", () => { if (file.files[0]) zone.querySelector(".text-strong").textContent = file.files[0].name; });
    }
  }));
  App.on("admin.kbImport", () => {
    const kb = DB.knowledgeBases[0]; kb.docs += 1; kb.questions += 3;
    App.closeModal(); App.toast("已导入 3 道题，等待审核（原型演示）", "ok"); App.render();
  });
  App.on("admin.kbView", () => App.modal({
    title: "切题预览",
    body: `<div class="help-block mb-12">文档：智能体开发知识库.md · 按二级标题切分</div>
      ${["1. 什么是 RAG？", "2. 向量检索与关键词检索的区别", "3. 如何评估 RAG 的召回质量"].map(t => `<div class="list-row" style="padding:12px 0"><div class="idx done">✓</div><div class="grow text-sm">${t}</div><button class="btn btn-sm btn-ghost" data-act="ui.toastDemo" data-msg="切题内容编辑（原型演示）">编辑</button></div>`).join("")}`
  }));

  App.on("admin.routeEdit", el => {
    const r = DB.routeById[el.dataset.id];
    const s = DB.subjectById[DB.subjects.find(x => x.routes.some(y => y.id === r.id)).id];
    App.modal({
      title: "编辑路线课程",
      size: "lg",
      body: `<div class="field mb-16"><label class="label">路线名称</label><input class="input" value="${App.esc(r.name)}" /></div>
        <div class="text-sm text-strong mb-8">选择课程（顺序即学习顺序）</div>
        <div class="col gap-8">${s.courses.map(c => `<label class="course-row" style="cursor:pointer;padding:10px 14px">
          <span class="checkbox ${r.courseIds.includes(c.id) ? "on" : ""}" style="margin:0">${r.courseIds.includes(c.id) ? "✓" : ""}</span>
          <div class="grow"><div class="text-sm text-strong">${App.esc(c.title)}</div><div class="text-xs text-muted">${c.duration}</div></div></label>`).join("")}</div>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.routeSaved">保存</button>`
    });
  });
  App.on("admin.routeSaved", () => { App.closeModal(); App.toast("路线已更新（原型演示）", "ok"); });
  App.on("admin.routeAdd", () => App.modal({
    title: "新建学习路线",
    body: `<div class="col gap-14"><div class="field"><label class="label">路线名称</label><input class="input" placeholder="例如：RAG 工程师进阶路线" /></div>
      <div class="field"><label class="label">所属学科</label><select class="input">${DB.subjects.map(s => `<option>${s.name}</option>`).join("")}</select></div>
      <div class="field"><label class="label">路线描述</label><textarea class="input" rows="3"></textarea></div></div>`,
    footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.routeSaved">创建</button>`
  }));

  App.on("admin.subjectEdit", el => {
    const s = DB.subjectById[el.dataset.id];
    App.modal({ title: "编辑学科", body: `<div class="col gap-14">
      <div class="field"><label class="label">学科名称</label><input class="input" value="${App.esc(s.name)}" /></div>
      <div class="field"><label class="label">简介</label><textarea class="input" rows="3">${App.esc(s.desc)}</textarea></div></div>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.subjectSaved">保存</button>` });
  });
  App.on("admin.subjectAdd", () => App.modal({
    title: "新增学科",
    body: `<div class="col gap-14"><div class="field"><label class="label">学科名称</label><input class="input" placeholder="请输入名称" /></div>
      <div class="field"><label class="label">简介</label><textarea class="input" rows="3"></textarea></div></div>`,
    footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.subjectSaved">创建</button>`
  }));
  App.on("admin.subjectSaved", () => { App.closeModal(); App.toast("已保存（原型演示）", "ok"); });

  App.on("admin.dimEdit", el => {
    const d = el.dataset.id ? DB.dimById[el.dataset.id] : DB.dimensions[0];
    App.modal({ title: "编辑能力维度", body: `<div class="col gap-14">
      <div class="field"><label class="label">维度名称</label><input class="input" value="${App.esc(d.name)}" /></div>
      <div class="field"><label class="label">维度说明</label><textarea class="input" rows="3">${App.esc(d.desc)}</textarea></div>
      <div class="help-block">维度为全局配置，所有学科共用；修改名称会影响所有题库标注与历史报告展示。</div></div>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.dimSaved">保存</button>` });
  });
  App.on("admin.dimSaved", () => { App.closeModal(); App.toast("维度已更新（原型演示）", "ok"); });
  App.on("admin.mapEdit", el => {
    const d = DB.dimById[el.dataset.id];
    App.modal({ title: `编辑映射 · ${d.name}`, body: `<div class="col gap-14">
      <div class="field"><label class="label">推荐阶段</label><select class="input">${DB.subjects[0].stages.map(st => `<option>${st.name}</option>`).join("")}</select></div>
      <div class="field"><label class="label">推荐课程</label><select class="input">${DB.subjects[0].courses.map(c => `<option>${c.title}</option>`).join("")}</select></div>
      <div class="help-block">报告中的「能力提升建议」会优先展示这里配置的内容。</div></div>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.mapSaved">保存</button>` });
  });
  App.on("admin.mapSaved", () => { App.closeModal(); App.toast("映射已保存（原型演示）", "ok"); });

  App.on("admin.studentToggle", el => {
    const s = DB.students.find(x => x.id === el.dataset.id);
    s.status = s.status === "正常" ? "禁用" : "正常";
    App.toast(s.status === "正常" ? "账号已启用" : "账号已禁用", "ok"); App.render();
  });
  App.on("admin.studentDetail", el => {
    const s = DB.students.find(x => x.id === el.dataset.id);
    App.drawer({
      title: "学员详情",
      body: `<div class="row gap-14"><div class="avatar" style="width:52px;height:52px;font-size:20px">${s.name.slice(0, 1)}</div>
        <div><h3 style="font-size:17px">${App.esc(s.name)}</h3><div class="text-sm text-muted">${s.phone} · ${statusBadge(s.status)}</div></div></div>
        <div class="grid g3 mt-20" style="gap:10px">
          <div class="stat" style="padding:14px"><div class="text-xs text-muted">学习天数</div><div style="font-size:20px;font-weight:800">${s.learnDays}</div></div>
          <div class="stat" style="padding:14px"><div class="text-xs text-muted">做题总数</div><div style="font-size:20px;font-weight:800">${s.questions}</div></div>
          <div class="stat" style="padding:14px"><div class="text-xs text-muted">面试场次</div><div style="font-size:20px;font-weight:800">${s.interviews}</div></div>
        </div>
        <div class="card mt-16"><div class="card-hd" style="padding:13px 16px"><div class="card-title">最近记录</div></div>
          <div class="list-row" style="padding:12px 16px"><div class="idx done">📝</div><div class="grow"><div class="text-sm">完成「RAG 与知识库」练习</div><div class="text-xs text-muted">2026-11-10 · 正确率 78%</div></div></div>
          <div class="list-row" style="padding:12px 16px"><div class="idx">🎙️</div><div class="grow"><div class="text-sm">AI 面试 · 中等 · 76 分</div><div class="text-xs text-muted">2026-11-04</div></div></div>
          <div class="list-row" style="padding:12px 16px"><div class="idx">▶️</div><div class="grow"><div class="text-sm">学习课程「RAG 从入门到上线」</div><div class="text-xs text-muted">2026-11-03 · 足迹</div></div></div>
        </div>
        <div class="row gap-8 mt-16"><button class="btn btn-ghost" data-act="admin.exportStudents">导出学习记录</button>
          <button class="btn btn-danger" data-act="admin.studentToggle" data-id="${s.id}">${s.status === "正常" ? "禁用账号" : "启用账号"}</button></div>`
    });
  });
  App.on("admin.exportStudents", () => {
    addLog("导出学员", `学员列表 · ${DB.students.length} 条（已脱敏）`);
    App.toast("导出成功：学员列表.xlsx（手机号已脱敏）", "ok");
  });

  App.on("admin.reviewTab", el => { ui.reviewTab = el.dataset.tab; App.render(); });
  App.on("admin.reviewOpen", el => {
    const a = S.appeals.find(x => x.id === el.dataset.id);
    const q = DB.qById[a.question] || {};
    const canAct = a.status === "待复核";
    App.modal({
      title: "简答题复核",
      size: "lg",
      body: `<div class="row gap-8 mb-12">${App.typeBadge("short")}${App.dimBadge(q.dim)}${statusBadge(a.status)}</div>
        <div style="font-weight:650;line-height:1.8">${App.esc(q.stem || a.question)}</div>
        <div class="help-block mt-16"><b>学员申诉理由：</b>${App.esc(a.reason)}</div>
        <div class="grid g2 mt-16" style="gap:12px">
          <div class="field"><label class="label">AI 评分</label><input class="input" value="${a.score} / ${q.score || 10}" disabled /></div>
          <div class="field"><label class="label">学员期望分数</label><input class="input" value="${a.studentScore} / ${q.score || 10}" disabled /></div>
        </div>
        <div class="field mt-12"><label class="label">复核后分数</label><input class="input" id="review-score" value="${a.studentScore}" ${canAct ? "" : "disabled"} /></div>
        <div class="field mt-12"><label class="label">复核意见</label><textarea class="input" rows="2" placeholder="填写复核说明，将通知学员" ${canAct ? "" : "disabled"}></textarea></div>
        <div class="fb-points mt-12">${(q.points || []).map(p => `<div class="fb-point hit"><span class="pp">✓</span><span>${App.esc(p.text)}（${p.score} 分）</span></div>`).join("")}</div>`,
      footer: canAct
        ? `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button>
           <button class="btn btn-danger" data-act="admin.reviewReject" data-id="${a.id}">维持原分</button>
           <button class="btn btn-primary" data-act="admin.reviewPass" data-id="${a.id}">通过并改分</button>`
        : `<button class="btn btn-ghost" data-act="ui.closeModal">关闭</button>`
    });
  });
  App.on("admin.reviewPass", el => {
    const a = S.appeals.find(x => x.id === el.dataset.id);
    const score = Number((document.getElementById("review-score") || {}).value) || a.studentScore;
    a.status = "已通过";
    S.messages.unshift({ id: "m" + Date.now(), type: "复核", title: "简答题复核结果", body: `你对题目「${(DB.qById[a.question] || {}).stem || ""}」的申诉已通过，分数由 ${a.score} 分调整为 ${score} 分。`, time: new Date().toISOString().slice(0, 16).replace("T", " "), unread: true });
    addLog("复核改分", `${a.question} · ${a.score} → ${score}`);
    App.closeModal(); App.toast("已通过并通知学员", "ok"); App.render();
  });
  App.on("admin.reviewReject", el => {
    const a = S.appeals.find(x => x.id === el.dataset.id);
    a.status = "已驳回";
    S.messages.unshift({ id: "m" + Date.now(), type: "复核", title: "简答题复核结果", body: `你对题目「${(DB.qById[a.question] || {}).stem || ""}」的申诉未通过，维持原评分 ${a.score} 分。`, time: new Date().toISOString().slice(0, 16).replace("T", " "), unread: true });
    addLog("复核驳回", a.question);
    App.closeModal(); App.toast("已驳回并通知学员", "ok"); App.render();
  });

  App.on("admin.userAdd", () => App.modal({
    title: "新增后台用户",
    body: `<div class="col gap-14">
      <div class="field"><label class="label">姓名</label><input class="input" /></div>
      <div class="field"><label class="label">登录账号</label><input class="input" /></div>
      <div class="field"><label class="label">角色</label><select class="input">${DB.roles.map(r => `<option>${r.name}</option>`).join("")}</select></div>
      <div class="field"><label class="label">初始密码</label><input class="input" type="password" placeholder="至少 8 位" /></div></div>`,
    footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.userSaved">创建</button>`
  }));
  App.on("admin.userSaved", () => { App.closeModal(); App.toast("用户已创建（原型演示）", "ok"); });
  App.on("admin.userEdit", el => App.modal({
    title: "编辑用户",
    body: `<div class="col gap-14"><div class="field"><label class="label">姓名</label><input class="input" value="${App.esc(DB.adminUsers.find(u => u.id === el.dataset.id).name)}" /></div>
      <div class="field"><label class="label">角色</label><select class="input">${DB.roles.map(r => `<option>${r.name}</option>`).join("")}</select></div></div>`,
    footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.userSaved">保存</button>`
  }));
  App.on("admin.userToggle", el => { const u = DB.adminUsers.find(x => x.id === el.dataset.id); u.status = u.status === "启用" ? "停用" : "启用"; App.toast("状态已更新", "ok"); App.render(); });

  App.on("admin.roleEdit", el => {
    const r = DB.roles.find(x => x.id === el.dataset.id);
    App.modal({
      title: `编辑权限 · ${r.name}`,
      size: "lg",
      body: `<div class="col gap-16">${DB.permissionGroups.map((g, gi) => `<div>
        <div class="row between mb-8"><b class="text-sm">${g.group}</b><button class="btn btn-sm btn-ghost" data-act="admin.permAll" data-group="${gi}">全选</button></div>
        <div class="perm-grid">${g.perms.map(p => `<label class="perm" style="cursor:pointer;background:var(--primary-soft);color:var(--primary)"><input type="checkbox" checked style="margin-right:5px" />${p}</label>`).join("")}</div>
      </div>`).join("")}</div>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.roleSaved">保存</button>`
    });
  });
  App.on("admin.roleSaved", () => { App.closeModal(); App.toast("权限已保存（原型演示）", "ok"); });
  App.on("admin.roleAdd", () => App.modal({
    title: "新增角色",
    body: `<div class="col gap-14"><div class="field"><label class="label">角色名称</label><input class="input" /></div>
      <div class="field"><label class="label">角色说明</label><textarea class="input" rows="3"></textarea></div></div>`,
    footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.roleSaved">创建</button>`
  }));

  function excelModal(type) {
    App.modal({
      title: `${type} Excel 导入`,
      body: `<div class="upload-zone" id="excel-drop"><div class="big">📊</div><div class="text-strong">点击选择或拖拽 Excel 文件</div>
        <div class="text-xs text-muted mt-4">支持 .xlsx / .xls${type === "题库" ? " · 模板包含能力维度、采分点、及格线列" : ""}</div>
        <input type="file" accept=".xlsx,.xls" style="display:none" id="excel-file" /></div>
        <div class="help-block mt-16">模板：${type === "题库" ? "题库导入模板.xlsx（含 12 列）" : "课程导入模板.xlsx（含 6 列）"}<br />导入后逐行校验，错误行可下载后修正再传。</div>
        <div class="row gap-8 mt-12"><button class="btn btn-sm btn-ghost" data-act="admin.excelDone">下载模板</button><span class="text-xs text-muted">原型环境不会真正读取文件</span></div>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">关闭</button><button class="btn btn-primary" data-act="admin.excelDone">开始导入</button>`,
      onMount(root) {
        const z = root.querySelector("#excel-drop"), f = root.querySelector("#excel-file");
        z.addEventListener("click", () => f.click());
        f.addEventListener("change", () => { if (f.files[0]) z.querySelector(".text-strong").textContent = f.files[0].name; });
      }
    });
  }
  App.on("admin.excelTip", el => {
    if (el.dataset.type === "下架") { App.toast("课程已下架（原型演示）", "ok"); return; }
    excelModal(el.dataset.type);
  });
  App.on("admin.excelDone", () => { App.closeModal(); App.toast("操作完成（原型演示）", "ok"); });
  App.on("admin.courseImport", () => excelModal("课程"));
  App.on("admin.qImport", () => excelModal("题库"));
  App.on("admin.courseEdit", el => App.modal({
    title: "编辑课程",
    body: `<div class="col gap-14"><div class="field"><label class="label">课程标题</label><input class="input" value="${App.esc((DB.courseById[el.dataset.id] || {}).title || "")}" /></div>
      <div class="field"><label class="label">B站链接</label><input class="input" placeholder="https://www.bilibili.com/video/..." /></div>
      <div class="field"><label class="label">时长</label><input class="input" value="${(DB.courseById[el.dataset.id] || {}).duration || ""}" /></div></div>`,
    footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="admin.subjectSaved">保存</button>`
  }));

  function addLog(action, target) {
    DB.logs.unshift({ id: "l" + Date.now(), time: new Date().toISOString().slice(0, 16).replace("T", " "), user: S.admin ? S.admin.name : "超级管理员", action, target, ip: "10.12.3.10" });
  }

  /* ---------- 入口 ---------- */
  function render(segs) {
    const key = segs[0] || "";
    if (key === "login") return loginPage();
    if (!S.admin) return loginPage();
    const map = {
      "": dashboardPage, subjects: subjectsPage, courses: coursesPage, questions: questionsPage,
      "interview-q": interviewQPage, kb: kbPage, routes: routesPage, dimensions: dimensionsPage,
      mapping: mappingPage, students: studentsPage, review: reviewPage, users: usersPage,
      roles: rolesPage, logs: logsPage, settings: settingsPage
    };
    return (map[key] || dashboardPage)();
  }

  return { render, qSearch, studentSearch, setQSubject, setIvSubject, setStudentStatus };
})();
