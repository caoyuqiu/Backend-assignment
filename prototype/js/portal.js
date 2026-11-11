/* ============================================================
   云枢智学 · 学员端页面
   ============================================================ */
window.Portal = (function () {
  "use strict";
  const S = App.state;

  /* ---------- 通用布局 ---------- */
  const navItems = [
    ["", "首页"], ["roadmap", "学习路线"], ["bank", "题库中心"],
    ["interview", "AI 面试"], ["ability", "能力中心"]
  ];

  function topbar(active) {
    const logged = !!S.user;
    return `
    <header class="topbar">
      <div class="container topbar-inner">
        <a class="brand" href="#/">
          <span class="brand-mark">☁</span>
          <span>云枢智学<small>YUNSHU AI LEARNING</small></span>
        </a>
        <nav class="nav">
          ${logged ? navItems.map(([k, label]) =>
            `<a href="#/${k}" class="${active === k ? "active" : ""}">${label}</a>`).join("") : ""}
        </nav>
        <div class="topbar-right">
          ${logged ? `
            <a class="btn btn-ghost btn-sm" href="#/admin">管理后台</a>
            <a class="btn btn-ghost btn-icon" href="#/messages" title="消息" style="position:relative">
              🔔${App.unreadCount() ? `<span style="position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:50%;background:var(--red)"></span>` : ""}
            </a>
            <div class="user-menu" id="user-menu">
              <div class="avatar" data-act="portal.menu" title="${App.esc(S.user.name)}">${App.esc(S.user.initial)}</div>
              <div class="dropdown">
                <div style="padding:8px 10px 10px">
                  <div style="font-weight:700;font-size:13px">${App.esc(S.user.name)}</div>
                  <div class="text-xs text-muted">${App.esc(S.user.phone)}</div>
                </div>
                <div class="divider"></div>
                <a href="#/profile">👤 个人中心</a>
                <a href="#/interview/records">🎙️ 我的面试</a>
                <a href="#/messages">🔔 消息中心</a>
                <div class="divider"></div>
                <button data-act="portal.logout">↩ 退出登录</button>
              </div>
            </div>` : `
            <a class="btn btn-ghost btn-sm" href="#/login">登录</a>
            <a class="btn btn-primary btn-sm" href="#/register">免费注册</a>`}
        </div>
      </div>
    </header>`;
  }

  function footer() {
    return `
    <footer style="border-top:1px solid var(--line);margin-top:50px;padding:28px 0 40px;color:var(--muted);font-size:12px">
      <div class="container row between wrap gap-16">
        <div>
          <div class="brand" style="font-size:14px"><span class="brand-mark" style="width:26px;height:26px;font-size:13px">☁</span> 云枢智学</div>
          <div class="mt-8">AI 驱动的学习与面试训练平台 · 交互原型</div>
        </div>
        <div class="row gap-24">
          <a href="#/">首页</a><a href="#/bank">题库</a><a href="#/interview">AI 面试</a><a href="#/admin">管理后台</a><a href="#/entry">切换入口</a>
        </div>
        <div class="row gap-12">
          <span>© 2026 云枢智学 · 原型演示，数据均为模拟</span>
          <button class="btn btn-sm btn-ghost" data-act="portal.resetDemo">重置演示数据</button>
        </div>
      </div>
    </footer>`;
  }

  function shell(content, active) {
    return topbar(active) + `<main class="container" style="padding-bottom:10px">${content}</main>` + footer();
  }

  function pageHead(title, desc, extra) {
    return `<div class="page-hd row between wrap gap-16">
      <div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ""}</div>
      ${extra || ""}
    </div>`;
  }

  function requireLogin(key) {
    if (S.user) return false;
    sessionStorage.setItem("ys_redirect", "#/" + key);
    return true;
  }

  /* ---------- 计算 ---------- */
  function totalAnswered() {
    let n = 236;
    Object.values(S.progress).forEach(p => { n += Object.keys(p.answers || {}).length; });
    return n;
  }
  function learnedCount() { return Object.keys(S.learned).length; }
  function subjectStats(s) {
    const qn = s.stages.reduce((n, st) => n + st.questions.length, 0);
    const learned = s.courses.filter(c => S.learned[c.id]).length;
    return { stages: s.stages.length, questions: qn, learned, courses: s.courses.length };
  }
  function continueTarget() {
    for (const key of Object.keys(S.progress)) {
      const p = S.progress[key];
      if (p && !p.finished && p.answers && Object.keys(p.answers).length < 999) {
        const [subjectId, stageId] = key.split("|");
        if (DB.stageById[stageId]) return { subjectId, stageId };
      }
    }
    const s = DB.subjects[0];
    return { subjectId: s.id, stageId: s.stages[0].id };
  }
  function greeting() {
    const h = new Date().getHours();
    return h < 6 ? "夜深了" : h < 12 ? "早上好" : h < 18 ? "下午好" : "晚上好";
  }

  /* ---------- 首页 ---------- */
  function homePage() {
    if (!S.user) return guestHome();
    const s0 = DB.subjects[0];
    const cont = continueTarget();
    const stage = DB.stageById[cont.stageId];
    const prog = App.getProgress(cont.subjectId, cont.stageId);
    const answered = prog ? Object.keys(prog.answers || {}).length : 0;
    const pct = Math.round((answered / stage.questions.length) * 100);
    const week = last7Days();
    const maxV = Math.max(...week.map(d => d.v), 1);
    const unread = App.unreadCount();

    return shell(`
      <section class="hero">
        <div class="hero-inner">
          <span class="eyebrow">☀️ 学习概览</span>
          <h1>${greeting()}，${App.esc(S.user.name)}<br>把今天学的，<em>练成能说的</em></h1>
          <p>你已连续学习 ${18 + Math.min(6, Object.keys(S.progress).length)} 天。继续保持，离目标更近一步。</p>
          <div class="hero-actions">
            <a class="btn btn-lg btn-primary" href="#/practice?subject=${cont.subjectId}&stage=${cont.stageId}&mode=sequence" style="background:#fff;color:var(--primary);box-shadow:none">继续练习 →</a>
            <a class="btn btn-lg btn-ghost" href="#/interview">开始 AI 面试</a>
          </div>
        </div>
        <div class="hero-float">
          <div class="hero-card">
            <div class="line"><span>继续上次学习</span><span>${pct}%</span></div>
            <div style="font-weight:700;font-size:14px;margin-bottom:10px">${App.esc(stage.name)}</div>
            <div class="bar"><i style="width:${pct}%"></i></div>
            <div class="hero-mini">
              <div><b>${answered}</b><span>已答题目</span></div>
              <div><b>${stage.questions.length}</b><span>本阶段题量</span></div>
              <div><b>${S.interviews.length}</b><span>面试场次</span></div>
            </div>
          </div>
        </div>
      </section>

      <div class="section-hd">
        <div><h2>快速开始</h2><p>今天想练点什么？</p></div>
      </div>
      <div class="grid g3">
        <div class="card pad-22 hover" onclick="location.hash='#/practice?subject=${cont.subjectId}&stage=${cont.stageId}&mode=sequence'">
          <div class="feature-ico">📝</div>
          <h3 style="font-size:15px">继续刷题</h3>
          <p class="text-sm text-muted mt-6">${App.esc(stage.name)} · 还剩 ${stage.questions.length - answered} 题</p>
          <div class="mt-12">${App.progress(pct)}</div>
          <div class="row between mt-8 text-xs text-muted"><span>已完成 ${answered} 题</span><span>${pct}%</span></div>
        </div>
        <div class="card pad-22 hover" onclick="location.hash='#/interview'">
          <div class="feature-ico g">🎙️</div>
          <h3 style="font-size:15px">AI 模拟面试</h3>
          <p class="text-sm text-muted mt-6">8 个技术方向 · 3 档难度 · 每日 5 次</p>
          <div class="mt-16 row gap-8"><span class="badge badge-green">今日剩余 5 次</span></div>
        </div>
        <div class="card pad-22 hover" onclick="location.hash='#/bank?tab=wrong'">
          <div class="feature-ico a">🔁</div>
          <h3 style="font-size:15px">复习错题</h3>
          <p class="text-sm text-muted mt-6">待复习 ${S.wrong.filter(w => w.status === "review").length} 题 · 连续答对 3 次自动掌握</p>
          <div class="mt-16 row gap-8"><span class="badge badge-amber">${S.wrong.filter(w => w.status === "review").length} 道待复习</span></div>
        </div>
      </div>

      <div class="section-hd">
        <div><h2>核心功能</h2><p>学、练、面、评，一条链路走完</p></div>
      </div>
      <div class="grid g4">
        <a class="core-card" href="#/roadmap">
          <span class="core-arrow">→</span>
          <div class="core-ico">🧭</div>
          <div>
            <h3>学习路线</h3>
            <p class="mt-4">8 个方向 · 课程按顺序组织，学完可手动标记</p>
          </div>
        </a>
        <a class="core-card" href="#/bank">
          <span class="core-arrow">→</span>
          <div class="core-ico g">📚</div>
          <div>
            <h3>海量题库</h3>
            <p class="mt-4">8 大学科 · ${DB.allQuestions.length} 道题，覆盖 6 个能力维度</p>
          </div>
        </a>
        <a class="core-card" href="#/practice?subject=${cont.subjectId}&stage=${cont.stageId}&mode=random">
          <span class="core-arrow">→</span>
          <div class="core-ico a">✍️</div>
          <div>
            <h3>刷题练习</h3>
            <p class="mt-4">顺序 / 随机 / 错题重练 · 每题即时判分</p>
          </div>
        </a>
        <a class="core-card" href="#/interview">
          <span class="core-arrow">→</span>
          <div class="core-ico c">🎙️</div>
          <div>
            <h3>AI 模拟面试</h3>
            <p class="mt-4">3 档难度 · 单题 5 分钟 · 6 维能力报告</p>
          </div>
        </a>
      </div>

      <div class="section-hd">
        <div><h2>学习统计</h2><p>数据来自你的学习足迹、刷题与面试记录</p></div>
        <a class="link" href="#/ability">查看能力中心 →</a>
      </div>
      <div class="grid g4">
        <div class="stat"><div class="stat-top"><span>学习天数</span><span class="stat-ico">📅</span></div><div class="stat-value">18<small>天</small></div><div class="stat-sub">有任意学习活动的日期</div></div>
        <div class="stat"><div class="stat-top"><span>已学课程</span><span class="stat-ico" style="background:var(--green-soft)">✅</span></div><div class="stat-value">${learnedCount()}<small>门</small></div><div class="stat-sub">由你手动标记</div></div>
        <div class="stat"><div class="stat-top"><span>做题总数</span><span class="stat-ico" style="background:var(--amber-soft)">📝</span></div><div class="stat-value">${totalAnswered()}<small>题</small></div><div class="stat-sub">含历史练习记录</div></div>
        <div class="stat"><div class="stat-top"><span>面试场次</span><span class="stat-ico" style="background:#e6f7fa">🎙️</span></div><div class="stat-value">${S.interviews.length}<small>场</small></div><div class="stat-sub">最近一次 ${S.interviews[0] ? S.interviews[0].score + " 分" : "—"}</div></div>
      </div>

      <div class="grid" style="grid-template-columns:1.55fr 1fr;margin-top:20px">
        <div class="card">
          <div class="card-hd"><div class="card-title"><span class="dot"></span>近 7 天练习</div><span class="text-xs text-muted">单位：题</span></div>
          <div class="card-bd">
            <div class="chart-bars">
              ${week.map(d => `<div class="bar-col"><b>${d.v}</b><div class="bar ${d.v === 0 ? "zero" : ""}" style="height:${Math.max(6, (d.v / maxV) * 110)}px"></div><span>${d.label}</span></div>`).join("")}
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><div class="card-title"><span class="dot"></span>待办提醒</div></div>
          <div class="card-bd" style="padding-top:8px">
            <div class="row between" style="padding:11px 0;border-bottom:1px solid var(--line-2)">
              <div><div class="text-strong text-sm">错题复习</div><div class="text-xs text-muted">${S.wrong.filter(w => w.status === "review").length} 道待复习</div></div>
              <a class="btn btn-sm btn-soft" href="#/bank?tab=wrong">去复习</a>
            </div>
            <div class="row between" style="padding:11px 0;border-bottom:1px solid var(--line-2)">
              <div><div class="text-strong text-sm">今日面试</div><div class="text-xs text-muted">还剩 5 次额度</div></div>
              <a class="btn btn-sm btn-soft" href="#/interview">去面试</a>
            </div>
            <div class="row between" style="padding:11px 0">
              <div><div class="text-strong text-sm">未读消息</div><div class="text-xs text-muted">${unread} 条未读</div></div>
              <a class="btn btn-sm btn-soft" href="#/messages">查看</a>
            </div>
          </div>
        </div>
      </div>

      <div class="section-hd">
        <div><h2>热门阶段</h2><p>从 8 个 AI 方向中挑一个开始</p></div>
        <a class="link" href="#/bank">进入题库中心 →</a>
      </div>
      <div class="grid g4">
        ${["s1-st1", "s2-st1", "s5-st1", "s8-st1"].map(id => {
          const st = DB.stageById[id]; const sub = DB.subjectById[st ? st.id.split("-")[0] : "s1"];
          if (!st) return "";
          return `<div class="card subject-card hover" onclick="location.hash='#/bank/${sub.id}'">
            <div class="row between"><div class="subject-ico" style="background:${sub.color}18">${sub.icon}</div><span class="badge badge-gray">${st.level}</span></div>
            <h3>${App.esc(st.name)}</h3>
            <div class="meta">${App.esc(sub.name)}</div>
            <div class="row between mt-8"><span class="text-xs text-muted">${st.questions.length} 道题</span><span class="text-xs" style="color:${sub.color}">去练习 →</span></div>
          </div>`;
        }).join("")}
      </div>

      <section class="interview-hero" style="margin-top:36px">
        <h1>准备好被 AI 面试官追问了吗？</h1>
        <p>按技术方向与难度抽题，覆盖 6 个能力维度。结束后生成完整报告，包含逐题点评、能力雷达与提升建议。</p>
        <div class="hero-actions">
          <a class="btn btn-lg" href="#/interview" style="background:#fff;color:var(--primary)">开始模拟面试</a>
          <a class="btn btn-lg btn-ghost" href="#/interview/records">查看历史报告</a>
        </div>
      </section>
    `, "");
  }

  function last7Days() {
    const base = [12, 0, 8, 15, 6, 10];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const todayN = S.practiceLog.filter(x => x.date === key).length;
      days.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        v: i === 0 ? (base[5] + todayN) : base[6 - i] || 0
      });
    }
    return days;
  }

  function guestHome() {
    return shell(`
      <section class="hero">
        <div class="hero-inner">
          <span class="eyebrow">✨ AI 驱动的学习与面试训练平台</span>
          <h1>把 AI 学的，<br><em>练成能说的</em></h1>
          <p>8 个 AI 技术方向，系统化题库与学习路线；AI 模拟面试按维度评分，生成可复盘的能力报告。</p>
          <div class="hero-actions">
            <a class="btn btn-lg" href="#/register" style="background:#fff;color:var(--primary)">免费注册</a>
            <a class="btn btn-lg btn-ghost" href="#/login">已有账号，登录</a>
          </div>
        </div>
        <div class="hero-float">
          <div class="hero-card">
            <div class="line"><span>平台能力</span><span>持续更新</span></div>
            <div class="hero-mini" style="margin-top:8px">
              <div><b>8</b><span>AI 方向</span></div>
              <div><b>6</b><span>能力维度</span></div>
              <div><b>24h</b><span>报告留存</span></div>
            </div>
            <div style="margin-top:14px;font-size:11.5px;color:#c9cdf0;line-height:1.7">注册后即可使用题库、学习路线与 AI 面试全部功能。</div>
          </div>
        </div>
      </section>

      <div class="section-hd"><div><h2>选择你的方向</h2><p>8 个 AI 技术方向，每个方向都有阶段题库与学习路线</p></div></div>
      <div class="grid g4">
        ${DB.subjects.map(s => `<div class="card subject-card hover" onclick="location.hash='#/login'">
          <div class="subject-ico" style="background:${s.color}18">${s.icon}</div>
          <h3>${App.esc(s.name)}</h3>
          <div class="meta clamp-2">${App.esc(s.desc)}</div>
          <div class="row between mt-8"><span class="text-xs text-muted">${s.stages.length} 个阶段</span><span class="text-xs" style="color:${s.color}">了解 →</span></div>
        </div>`).join("")}
      </div>

      <div class="section-hd"><div><h2>怎么练</h2><p>学、练、面、评，形成闭环</p></div></div>
      <div class="grid g3">
        <div class="card pad-22"><div class="feature-ico">📚</div><h3 style="font-size:15px">按路线学</h3><p class="text-sm text-muted mt-6">课程库按方向组织，学习路线给出顺序；点击课程记录足迹，学完可手动标记。</p></div>
        <div class="card pad-22"><div class="feature-ico c">📝</div><h3 style="font-size:15px">逐题练</h3><p class="text-sm text-muted mt-6">顺序、随机、错题重练三种模式；每题提交即时批改，答错自动进入错题本。</p></div>
        <div class="card pad-22"><div class="feature-ico g">🎙️</div><h3 style="font-size:15px">AI 面试</h3><p class="text-sm text-muted mt-6">按方向与难度抽题，覆盖 6 个能力维度；文本作答并支持语音，结束后生成能力报告。</p></div>
      </div>

      <section class="interview-hero" style="margin-top:36px">
        <h1>先注册，再开始第一次 AI 面试</h1>
        <p>开放注册，注册即学员。首次使用 AI 面试前会单独征得录音同意，录音仅用于你本人回放，90 天后自动删除。</p>
        <div class="hero-actions"><a class="btn btn-lg" href="#/register" style="background:#fff;color:var(--primary)">免费注册</a></div>
      </section>
    `, "");
  }

  /* ---------- 认证 ---------- */
  function authPage(mode, notice) {
    const isLogin = mode === "login", isRegister = mode === "register";
    const tab = App.ui.loginTab || "password";
    const title = isLogin ? "登录云枢智学" : isRegister ? "创建你的账号" : "找回密码";
    const sub = isLogin ? "继续你的学习与面试训练" : isRegister ? "注册即学员，全部功能免费使用" : "通过手机号验证后重置密码";
    let form = "";

    if (isLogin) {
      form = `
        <div class="auth-tabs">
          <button class="${tab === "password" ? "active" : ""}" data-act="auth.tab" data-tab="password">密码登录</button>
          <button class="${tab === "code" ? "active" : ""}" data-act="auth.tab" data-tab="code">验证码登录</button>
        </div>
        <form id="login-form" class="col gap-16">
          <div class="field"><label class="label">手机号 / 账号</label>
            <input class="input" name="account" placeholder="请输入手机号" value="13800002043" /></div>
          ${tab === "password" ? `
          <div class="field"><label class="label">密码</label>
            <input class="input" type="password" name="password" placeholder="请输入密码" value="123456" /></div>` : `
          <div class="field"><label class="label">验证码</label>
            <div class="input-row"><input class="input" name="code" placeholder="6 位验证码" value="123456" />
              <button type="button" class="btn btn-ghost" data-act="auth.sendCode" style="min-width:112px">获取验证码</button></div></div>`}
          <div class="row between">
            <label class="row gap-8" style="font-size:12px;color:var(--muted)"><span class="checkbox on" data-act="auth.remember">✓</span> 记住我</label>
            <a class="link" href="#/forgot" style="font-size:12px">忘记密码？</a>
          </div>
          <button class="btn btn-primary btn-lg btn-block" type="submit">登 录</button>
        </form>
        <div class="row gap-12" style="margin:20px 0;color:var(--muted-2);font-size:11px"><div style="flex:1;height:1px;background:var(--line)"></div>其他方式<div style="flex:1;height:1px;background:var(--line)"></div></div>
        <div class="grid g3" style="gap:10px">
          <button class="btn btn-ghost" data-act="auth.demo">微信</button>
          <button class="btn btn-ghost" data-act="auth.demo">QQ</button>
          <button class="btn btn-ghost" data-act="auth.demo">GitHub</button>
        </div>
        <div class="auth-foot">还没有账号？<a class="link" href="#/register">免费注册</a></div>`;
    } else if (isRegister) {
      form = `
        <form id="register-form" class="col gap-14">
          <div class="field"><label class="label">昵称<span class="req">*</span></label>
            <input class="input" name="name" placeholder="给自己起个名字" /></div>
          <div class="field"><label class="label">手机号<span class="req">*</span></label>
            <input class="input" name="phone" placeholder="11 位手机号" /></div>
          <div class="field"><label class="label">验证码<span class="req">*</span></label>
            <div class="input-row"><input class="input" name="code" placeholder="6 位验证码" />
              <button type="button" class="btn btn-ghost" data-act="auth.sendCode" style="min-width:112px">获取验证码</button></div></div>
          <div class="field"><label class="label">设置密码<span class="req">*</span></label>
            <input class="input" type="password" name="password" placeholder="至少 6 位，建议包含字母与数字" />
            <div class="hint">密码长度 6–20 位，需包含字母和数字</div></div>
          <div class="field"><label class="label">确认密码<span class="req">*</span></label>
            <input class="input" type="password" name="password2" placeholder="再次输入密码" /></div>
          <label class="agree"><span class="checkbox" id="agree1" data-act="auth.check" data-target="agree1"></span>
            <span>我已阅读并同意 <a class="link" href="javascript:void(0)" data-act="auth.policy">《用户协议》</a> 与 <a class="link" href="javascript:void(0)" data-act="auth.policy">《隐私政策》</a>，知悉学习足迹与 AI 面试录音的处理方式。</span></label>
          <label class="agree"><span class="checkbox" id="agree2" data-act="auth.check" data-target="agree2"></span>
            <span>我已年满 18 周岁</span></label>
          <button class="btn btn-primary btn-lg btn-block" type="submit" style="margin-top:6px">注册并登录</button>
        </form>
        <div class="auth-foot">已有账号？<a class="link" href="#/login">直接登录</a></div>`;
    } else {
      const step = App.ui.forgotStep || 1;
      form = `
        <div class="row gap-8" style="margin-bottom:22px">
          ${[1, 2, 3].map(i => `<div style="flex:1"><div style="height:4px;border-radius:9px;background:${i <= step ? "var(--primary)" : "var(--bg-soft)"}"></div><div class="text-xs ${i <= step ? "text-strong" : "text-muted"}" style="margin-top:7px">${["验证手机", "重置密码", "完成"][i - 1]}</div></div>`).join("")}
        </div>
        ${step === 1 ? `
        <form id="forgot-form" class="col gap-16">
          <div class="field"><label class="label">注册手机号</label><input class="input" name="phone" placeholder="请输入注册时使用的手机号" /></div>
          <div class="field"><label class="label">验证码</label>
            <div class="input-row"><input class="input" name="code" placeholder="6 位验证码" />
              <button type="button" class="btn btn-ghost" data-act="auth.sendCode" style="min-width:112px">获取验证码</button></div></div>
          <button class="btn btn-primary btn-block" type="submit">下一步</button>
        </form>` : step === 2 ? `
        <form id="reset-form" class="col gap-16">
          <div class="field"><label class="label">新密码</label><input class="input" type="password" name="password" placeholder="至少 6 位" /></div>
          <div class="field"><label class="label">确认新密码</label><input class="input" type="password" name="password2" placeholder="再次输入" /></div>
          <button class="btn btn-primary btn-block" type="submit">确认重置</button>
        </form>` : `
        <div class="center" style="padding:20px 0">
          <div style="font-size:44px">✅</div>
          <h3 class="mt-12">密码已重置</h3>
          <p class="text-sm text-muted mt-8">请使用新密码重新登录</p>
          <a class="btn btn-primary btn-block mt-24" href="#/login">返回登录</a>
        </div>`}`;
    }

    return `
    <div class="auth-wrap">
      <div class="auth-side">
        <a class="brand" href="#/" style="position:relative">
          <span class="brand-mark">☁</span><span>云枢智学<small>YUNSHU AI LEARNING</small></span>
        </a>
        <h2>学得进去，<br>也要说得出来。</h2>
        <p>系统化题库、学习路线与 AI 模拟面试，帮你把知识变成能落地的能力。</p>
        <div class="points">
          <div><span>✓</span> 8 个 AI 方向 · 阶段化题库</div>
          <div><span>✓</span> 逐题即时批改 · 错题自动归集</div>
          <div><span>✓</span> AI 面试 6 维能力报告</div>
        </div>
      </div>
      <div class="auth-main">
        <a class="auth-back" href="#/">← 返回首页</a>
        <div class="auth-card">
          ${notice ? `<div class="help-block mb-16" style="border-style:solid;background:var(--primary-soft);color:var(--primary);border-color:#dcdffb">${App.esc(notice)}</div>` : ""}
          <h1>${title}</h1>
          <p class="sub">${sub}</p>
          ${form}
        </div>
      </div>
    </div>`;
  }

  /* ---------- 题库中心 ---------- */
  function bankPage(tab) {
    const active = tab === "wrong" ? "wrong" : "subjects";
    const reviewN = S.wrong.filter(w => w.status === "review").length;
    return shell(`
      ${pageHead("题库中心",
        active === "wrong" ? "学科练习与错题复习统一入口，集中攻克薄弱知识点" : "按学科 → 阶段 → 题目逐层进入，支持顺序、随机与错题重练",
        active === "wrong" ? "" : `<div class="search-box" style="width:240px"><input class="input" placeholder="搜索学科 / 阶段" oninput="Portal.searchBank(this.value)" /></div>`)}
      <div class="tabs">
        <a class="tab ${active === "subjects" ? "active" : ""}" href="#/bank">学科题库</a>
        <a class="tab ${active === "wrong" ? "active" : ""}" href="#/bank?tab=wrong">错题本 <span class="badge badge-red" style="margin-left:4px">${reviewN}</span></a>
      </div>
      ${active === "wrong" ? wrongContent() : bankSubjectContent()}
    `, "bank");
  }

  function bankSubjectContent() {
    const filter = App.ui.bankFilter || "all";
    const list = filter === "all" ? DB.subjects : DB.subjects.filter(s => s.id === filter);
    return `
      <div class="chip-row mb-16">
        <button class="chip ${filter === "all" ? "active" : ""}" data-act="portal.bankFilter" data-id="all">全部学科</button>
        ${DB.subjects.map(s => `<button class="chip ${filter === s.id ? "active" : ""}" data-act="portal.bankFilter" data-id="${s.id}">${s.icon} ${s.short}</button>`).join("")}
      </div>
      <div class="grid g3" id="subject-grid">
        ${list.map(s => {
          const st = subjectStats(s);
          const pct = st.courses ? Math.round((st.learned / st.courses) * 100) : 0;
          return `<div class="card pad-22 hover" data-search="${App.esc(s.name)} ${App.esc(s.short)}" onclick="location.hash='#/bank/${s.id}'">
            <div class="row between">
              <div class="subject-ico" style="background:${s.color}18">${s.icon}</div>
              <span class="badge badge-gray">${st.stages} 个阶段</span>
            </div>
            <h3 class="mt-12" style="font-size:15.5px">${App.esc(s.name)}</h3>
            <p class="text-sm text-muted mt-6 clamp-2" style="min-height:40px">${App.esc(s.desc)}</p>
            <div class="row gap-16 mt-12 text-xs text-muted">
              <span>📝 ${st.questions} 道题</span><span>▶️ ${st.courses} 门课</span>
            </div>
            <div class="mt-12">${App.progress(pct)}</div>
            <div class="row between mt-8 text-xs text-muted"><span>已学 ${st.learned}/${st.courses} 门</span><span style="color:${s.color}">进入学科 →</span></div>
          </div>`;
        }).join("")}
      </div>
    `;
  }

  function bankSubjectPage(subjectId) {
    const s = DB.subjectById[subjectId];
    if (!s) return shell(`<div class="empty"><div class="big">🔍</div><p>学科不存在</p><a class="btn btn-primary" href="#/bank">返回题库</a></div>`, "bank");
    const st = subjectStats(s);
    return shell(`
      <div class="page-hd">
        <div class="crumb"><a href="#/bank">题库中心</a><span class="sep">/</span><span>${App.esc(s.name)}</span></div>
        <div class="card" style="background:linear-gradient(120deg,${s.color},${s.color}cc);border:0;color:#fff;margin-top:6px">
          <div class="pad-26 row between wrap gap-16">
            <div class="row gap-16">
              <div style="width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.18);display:grid;place-items:center;font-size:27px">${s.icon}</div>
              <div><h1 style="font-size:23px">${App.esc(s.name)}</h1><p style="color:rgba(255,255,255,.82);font-size:12.5px;margin-top:4px">${App.esc(s.desc)}</p></div>
            </div>
            <div class="row gap-24">
              <div class="center"><b style="font-size:19px">${st.stages}</b><div style="font-size:11px;opacity:.8">阶段</div></div>
              <div class="center"><b style="font-size:19px">${st.questions}</b><div style="font-size:11px;opacity:.8">题目</div></div>
              <div class="center"><b style="font-size:19px">${st.courses}</b><div style="font-size:11px;opacity:.8">课程</div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="row between mb-12">
        <h2 style="font-size:17px">阶段列表</h2>
        <a class="link text-sm" href="#/roadmap">查看学习路线 →</a>
      </div>
      <div class="col gap-12">
        ${s.stages.map((stage, i) => {
          const prog = App.getProgress(s.id, stage.id);
          const answered = prog ? Object.keys(prog.answers || {}).length : 0;
          const pct = Math.round((answered / stage.questions.length) * 100);
          return `<div class="card stage-card hover">
            <div class="stage-num">${String(i + 1).padStart(2, "0")}</div>
            <div class="grow">
              <div class="row between wrap gap-8">
                <div><h3 style="font-size:15px">${App.esc(stage.name)}</h3>
                <p class="text-sm text-muted mt-4">${App.esc(stage.desc)}</p></div>
                <span class="badge ${stage.level === "入门" ? "badge-green" : "badge-amber"}">${stage.level}</span>
              </div>
              <div class="row between mt-12 text-xs text-muted">
                <span>${stage.questions.length} 道题 · 已完成 ${answered} 题</span><span>${pct}%</span>
              </div>
              <div class="mt-6">${App.progress(pct)}</div>
            </div>
            <button class="btn btn-primary btn-sm" data-act="portal.modeModal" data-subject="${s.id}" data-stage="${stage.id}">开始练习</button>
          </div>`;
        }).join("")}
      </div>
    `, "bank");
  }

  function searchBank(v) {
    const kw = (v || "").trim().toLowerCase();
    document.querySelectorAll("[data-search]").forEach(el => {
      el.style.display = !kw || el.dataset.search.toLowerCase().includes(kw) ? "" : "none";
    });
  }

  function modeModal(subjectId, stageId) {
    const stage = DB.stageById[stageId];
    const wrongN = stage.questions.filter(q => S.wrong.some(w => w.qid === q.id && w.status === "review")).length;
    const modes = [
      { id: "sequence", icon: "➡️", name: "顺序练习", desc: `${stage.questions.length} 道题，按题目顺序作答` },
      { id: "random", icon: "🔀", name: "随机练习", desc: "打乱顺序，检验真实掌握程度" },
      { id: "wrong", icon: "🔁", name: "错题重练", desc: wrongN ? `本阶段 ${wrongN} 道待复习错题` : "本阶段暂无待复习错题", disabled: !wrongN }
    ];
    App.modal({
      title: "选择练习方式",
      body: `<p class="text-sm text-muted mb-16">${App.esc(stage.name)} · 共 ${stage.questions.length} 题</p>
        <div class="col gap-10">
        ${modes.map(m => `<button class="config-tile ${m.disabled ? "" : ""}" style="text-align:left;width:100%;${m.disabled ? "opacity:.5;cursor:not-allowed" : ""}"
          ${m.disabled ? "disabled" : `data-act="portal.startPractice" data-subject="${subjectId}" data-stage="${stageId}" data-mode="${m.id}"`}>
          <div class="row gap-12"><span style="font-size:20px">${m.icon}</span><div><b>${m.name}</b><div style="font-size:11.5px;color:var(--muted)">${m.desc}</div></div></div>
        </button>`).join("")}
        </div>`,
      footer: null
    });
  }

  /* ---------- 错题本（题库中心内的 Tab 内容） ---------- */
  function wrongContent() {
    const tab = App.ui.wrongTab || "review";
    const sel = App.ui.wrongSel || [];
    const items = S.wrong.filter(w => w.status === tab && DB.qById[w.qid]);
    const reviewN = S.wrong.filter(w => w.status === "review").length;
    const masteredN = S.wrong.filter(w => w.status === "mastered").length;
    return `
      <div class="row between wrap gap-12 mb-12">
        <p class="text-sm text-muted">答错自动收录；连续答对 3 次自动标记为已掌握</p>
        <button class="btn btn-primary" data-act="portal.startWrongPractice" ${reviewN ? "" : "disabled"}>全部错题重练</button>
      </div>
      <div class="tabs">
        <div class="tab ${tab === "review" ? "active" : ""}" data-act="portal.wrongTab" data-tab="review">待复习 <span class="badge badge-red" style="margin-left:4px">${reviewN}</span></div>
        <div class="tab ${tab === "mastered" ? "active" : ""}" data-act="portal.wrongTab" data-tab="mastered">已掌握 <span class="badge badge-gray" style="margin-left:4px">${masteredN}</span></div>
      </div>
      ${sel.length ? `<div class="card pad-18 mb-16 row between wrap gap-12" style="border-color:#c7cbf0;background:var(--primary-soft)">
        <div class="text-sm text-strong">已选择 ${sel.length} 道题</div>
        <div class="row gap-8">
          <button class="btn btn-sm btn-ghost" data-act="portal.wrongClear">取消选择</button>
          <button class="btn btn-sm btn-green" data-act="portal.batchMaster">标记已掌握</button>
          <button class="btn btn-sm btn-danger" data-act="portal.batchRemove">移除错题</button>
        </div>
      </div>` : ""}
      <div class="card">
        ${items.length ? items.map(w => {
          const q = DB.qById[w.qid];
          const on = sel.includes(w.qid);
          return `<div class="wrong-item">
            <span class="checkbox ${on ? "on" : ""}" data-act="portal.wrongToggle" data-qid="${w.qid}">${on ? "✓" : ""}</span>
            <div class="grow">
              <div class="row between gap-12">
                <div class="q-stem" style="font-size:13.5px;font-weight:600;margin:0;line-height:1.7">${App.esc(q.stem)}</div>
                <button class="btn btn-sm btn-ghost" data-act="portal.wrongDetail" data-qid="${q.id}">查看</button>
              </div>
              <div class="wrong-meta">
                ${App.typeBadge(q.type)} ${App.dimBadge(q.dim)}
                <span>${App.esc(q.subjectName)} · ${App.esc(q.stageName)}</span>
                <span>答错 ${w.count} 次</span>
                ${tab === "review" ? `<span class="badge badge-indigo">再答对 ${3 - w.streak} 次掌握</span>` : `<span class="badge badge-green">已掌握</span>`}
              </div>
            </div>
          </div>`;
        }).join("") : `<div class="empty"><div class="big">${tab === "review" ? "🎉" : "📚"}</div><p>${tab === "review" ? "暂无待复习错题，继续保持" : "还没有已掌握的错题"}</p><a class="btn btn-soft" href="#/bank">去题库练习</a></div>`}
      </div>
    `;
  }

  /* ---------- 学习路线 ---------- */
  function roadmapPage() {
    const sid = App.ui.roadmapSubject || "s1";
    const s = DB.subjectById[sid] || DB.subjects[0];
    return shell(`
      ${pageHead("学习路线", "路线引用课程库；点击课程记录学习足迹，学完可手动标记「已学」",
        `<span class="badge badge-indigo">已学 ${learnedCount()} 门课程</span>`)}
      <div class="chip-row mb-16">
        ${DB.subjects.map(x => `<button class="chip ${x.id === s.id ? "active" : ""}" data-act="portal.roadmapSubject" data-id="${x.id}">${x.icon} ${x.short}</button>`).join("")}
      </div>
      ${s.routes.map(route => {
        const learned = route.courseIds.filter(id => S.learned[id]).length;
        const pct = Math.round((learned / route.courseIds.length) * 100);
        return `<div class="card mb-16">
          <div class="card-hd">
            <div>
              <div class="card-title">${App.esc(route.name)} <span class="badge badge-gray">${route.level}</span></div>
              <p class="text-sm text-muted mt-4">${App.esc(route.desc)}</p>
            </div>
            <div class="center" style="min-width:90px"><b style="font-size:17px">${pct}%</b><div class="text-xs text-muted">已完成</div></div>
          </div>
          <div class="card-bd">
            <div class="mb-16">${App.progress(pct, "green")}</div>
            ${route.courseIds.map((cid, i) => {
              const c = DB.courseById[cid];
              if (!c) return "";
              const done = !!S.learned[cid];
              return `<div class="course-row ${done ? "learned" : ""}">
                <div class="course-cover">
                  <img src="${c.cover || ""}" alt="${App.esc(c.title)} 课程封面" loading="lazy" />
                  ${done ? `<span class="cover-done" title="已学">✓</span>` : ""}
                </div>
                <div class="grow">
                  <div class="row gap-8"><span class="badge badge-gray">第 ${i + 1} 课</span>${done ? `<span class="badge badge-green">已学</span>` : ""}</div>
                  <div class="text-strong mt-4">${App.esc(c.title)}</div>
                  <div class="text-xs text-muted mt-4">${App.esc(c.up)} · ${c.duration}</div>
                </div>
                <div class="row gap-8">
                  <button class="btn btn-sm btn-ghost" data-act="portal.openCourse" data-id="${c.id}">去学习</button>
                  <button class="btn btn-sm ${done ? "btn-green" : "btn-soft"}" data-act="portal.markLearned" data-id="${c.id}">${done ? "已学 ✓" : "标记已学"}</button>
                </div>
              </div>`;
            }).join("")}
          </div>
        </div>`;
      }).join("")}
      <div class="help-block">说明：学习足迹仅记录你点击课程的时间；「已学」由你手动标记，标记前会二次确认是否完成课程视频，平台不根据播放时长自动判定完成度。</div>
    `, "roadmap");
  }

  /* ---------- 能力中心 ---------- */
  function practiceDimScores() {
    const agg = {};
    Object.values(S.progress).forEach(p => {
      Object.entries(p.answers || {}).forEach(([qid, a]) => {
        const q = DB.qById[qid]; if (!q || !q.dim) return;
        agg[q.dim] = agg[q.dim] || { e: 0, m: 0 };
        agg[q.dim].e += a.score || 0; agg[q.dim].m += q.score;
      });
    });
    return DB.dimensions.map(d => agg[d.id] ? Math.round((agg[d.id].e / agg[d.id].m) * 100) : null);
  }
  function interviewDimScores() {
    const last = S.interviews[0];
    return DB.dimensions.map(d => last && last.dims[d.id] != null ? last.dims[d.id] : null);
  }
  function abilityPage() {
    const pDims = practiceDimScores();
    const iDims = interviewDimScores();
    const fallbackP = [78, 64, 71, 66, 58, 52];
    const pVals = pDims.map((v, i) => v == null ? fallbackP[i] : v);
    const iVals = iDims.map(v => v == null ? 0 : v);
    const combined = DB.dimensions.map((d, i) => {
      const vals = [pDims[i], iDims[i]].filter(v => v != null);
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    });
    const cVals = combined.map((v, i) => v == null ? Math.round((pVals[i] + (iVals[i] || pVals[i])) / 2) : v);
    const weakestIdx = cVals.indexOf(Math.min(...cVals));
    const weak = DB.dimensions[weakestIdx];

    return shell(`
      ${pageHead("能力中心", "刷题与面试分开统计，再合成综合能力；缺失数据不虚构分数",
        `<span class="badge badge-indigo">共 6 个能力维度</span>`)}
      <div class="grid g3">
        <div class="card">
          <div class="card-hd"><div class="card-title">刷题能力</div><span class="badge badge-gray">${Object.keys(S.progress).length} 个练习</span></div>
          <div class="card-bd radar-box">
            ${App.radar(pVals, { size: 240, color: "#4f46e5" })}
            <div class="radar-legend"><span><i style="background:#4f46e5"></i>刷题均分 ${Math.round(pVals.reduce((a, b) => a + b, 0) / 6)}</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><div class="card-title">面试能力</div><span class="badge badge-gray">最近 1 场</span></div>
          <div class="card-bd radar-box">
            ${App.radar(iVals, { size: 240, color: "#7c3aed" })}
            <div class="radar-legend"><span><i style="background:#7c3aed"></i>最近得分 ${S.interviews[0] ? S.interviews[0].score : "—"}</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><div class="card-title">综合能力</div><span class="badge badge-indigo">两来源合成</span></div>
          <div class="card-bd radar-box">
            ${App.radar(cVals, { size: 240, color: "#059669" })}
            <div class="radar-legend"><span><i style="background:#059669"></i>综合均分 ${Math.round(cVals.reduce((a, b) => a + b, 0) / 6)}</span></div>
          </div>
        </div>
      </div>

      <div class="section-hd"><div><h2>维度明细</h2><p>对比刷题与面试两个来源的得分</p></div></div>
      <div class="grid g2">
        ${DB.dimensions.map((d, i) => `<div class="card dim-card">
          <div class="row between"><div class="row gap-8"><span style="width:9px;height:9px;border-radius:3px;background:${d.color};display:inline-block"></span><b style="font-size:13.5px">${d.name}</b></div><span class="dim-score" style="color:${d.color}">${combined[i] == null ? "—" : combined[i]}</span></div>
          <div class="text-xs text-muted mt-4">${d.desc}</div>
          <div class="mt-12">
            <div class="row between text-xs text-muted mb-4"><span>刷题</span><span>${pDims[i] == null ? "本项暂无数据" : pDims[i] + " 分"}</span></div>
            ${App.progress(pDims[i] == null ? 0 : pDims[i])}
            <div class="row between text-xs text-muted mb-4" style="margin-top:10px"><span>面试</span><span>${iDims[i] == null ? "本项暂无数据" : iDims[i] + " 分"}</span></div>
            ${App.progress(iDims[i] == null ? 0 : iDims[i])}
          </div>
        </div>`).join("")}
      </div>

      <div class="card pad-22 mt-20" style="border-color:#f0d9b5;background:linear-gradient(120deg,#fffdf7,#fff)">
        <div class="row between wrap gap-16">
          <div>
            <div class="row gap-8"><span class="badge badge-amber">优先补强</span><b>${weak.name}</b></div>
            <p class="text-sm text-muted mt-8">${weak.desc}。建议先复习相关阶段，再安排一次同方向的 AI 面试验证提升。</p>
          </div>
          <div class="row gap-8">
            <a class="btn btn-ghost" href="#/bank">去刷题</a>
            <a class="btn btn-primary" href="#/interview">去面试</a>
          </div>
        </div>
      </div>
    `, "ability");
  }

  /* ---------- 个人中心 ---------- */
  function profilePage() {
    return shell(`
      ${pageHead("个人中心", "管理账号资料、安全设置与隐私数据")}
      <div class="grid" style="grid-template-columns:320px 1fr">
        <div class="card">
          <div class="card-bd center" style="padding:30px 22px">
            ${App.avatar(S.user.name, 74)}
            <h3 class="mt-12" style="font-size:18px">${App.esc(S.user.name)}</h3>
            <div class="text-sm text-muted mt-4">${App.esc(S.user.phone)}</div>
            <div class="badge badge-indigo mt-12">学员</div>
            <div class="row gap-16 mt-24" style="justify-content:space-around">
              <div class="center"><b style="font-size:17px">18</b><div class="text-xs text-muted">学习天数</div></div>
              <div class="center"><b style="font-size:17px">${learnedCount()}</b><div class="text-xs text-muted">已学课程</div></div>
              <div class="center"><b style="font-size:17px">${S.interviews.length}</b><div class="text-xs text-muted">面试场次</div></div>
            </div>
            <div class="help-block mt-24 text-xs">注册于 2026-08-12 · 账号状态正常</div>
          </div>
        </div>

        <div class="col gap-16">
          <div class="card">
            <div class="card-hd"><div class="card-title">账号资料</div></div>
            <div class="card-bd">
              <form id="profile-form" class="grid g2" style="gap:16px">
                <div class="field"><label class="label">昵称</label><input class="input" name="name" value="${App.esc(S.user.name)}" /></div>
                <div class="field"><label class="label">手机号</label><input class="input" value="${App.esc(S.user.phone)}" disabled /><div class="hint">手机号用于登录与找回密码，暂不支持修改</div></div>
                <div class="field"><label class="label">邮箱（选填）</label><input class="input" name="email" placeholder="用于接收学习提醒" /></div>
                <div class="field"><label class="label">目标方向</label>
                  <select class="input" name="goal">${DB.subjects.map(s => `<option>${s.name}</option>`).join("")}</select></div>
              </form>
            </div>
            <div class="card-ft"><button class="btn btn-primary" data-act="portal.saveProfile">保存修改</button></div>
          </div>

          <div class="card">
            <div class="card-hd"><div class="card-title">安全设置</div></div>
            <div class="card-bd col gap-16">
              <div class="row between"><div><div class="text-strong text-sm">登录密码</div><div class="text-xs text-muted">建议定期更换密码</div></div><button class="btn btn-sm btn-ghost" data-act="portal.changePwd">修改</button></div>
              <div class="row between"><div><div class="text-strong text-sm">登录设备</div><div class="text-xs text-muted">当前 1 台设备在线</div></div><button class="btn btn-sm btn-ghost" data-act="portal.devices">查看</button></div>
            </div>
          </div>

          <div class="card">
            <div class="card-hd"><div class="card-title">通知与隐私</div></div>
            <div class="card-bd col gap-16">
              <div class="row between"><div><div class="text-strong text-sm">面试报告完成提醒</div><div class="text-xs text-muted">报告生成后发送站内消息</div></div><button class="switch on" data-act="portal.toggleSwitch"></button></div>
              <div class="row between"><div><div class="text-strong text-sm">学习提醒</div><div class="text-xs text-muted">连续 3 天未学习时提醒</div></div><button class="switch on" data-act="portal.toggleSwitch"></button></div>
              <div class="row between"><div><div class="text-strong text-sm">录音单独同意</div><div class="text-xs text-muted">已同意 · 录音保留 90 天，仅本人可回放</div></div><button class="btn btn-sm btn-ghost" data-act="portal.consent">管理</button></div>
              <div class="row between"><div><div class="text-strong text-sm" style="color:var(--red)">注销账号</div><div class="text-xs text-muted">注销后账号软删除，30 天后彻底清除</div></div><button class="btn btn-sm btn-danger" data-act="portal.deactivate">注销</button></div>
            </div>
          </div>
        </div>
      </div>
    `, "profile");
  }

  /* ---------- 消息 ---------- */
  function messagesPage() {
    const list = S.messages;
    return shell(`
      ${pageHead("消息中心", `共 ${list.length} 条消息，${App.unreadCount()} 条未读`,
        `<button class="btn btn-ghost" data-act="portal.readAll">全部标为已读</button>`)}
      <div class="card">
        ${list.length ? list.map(m => `<div class="msg-list-item ${m.unread ? "unread" : ""}" data-act="portal.msgOpen" data-id="${m.id}">
          <div class="msg-ico">${m.type === "复核" ? "⚖️" : m.type === "提醒" ? "⏰" : "🔔"}</div>
          <div class="grow">
            <div class="row between gap-12"><b style="font-size:13.5px">${App.esc(m.title)}</b><span class="text-xs text-muted nowrap">${App.esc(m.time)}</span></div>
            <div class="text-sm text-muted mt-4 clamp-2">${App.esc(m.body)}</div>
            <div class="mt-6 row gap-8"><span class="badge badge-gray">${m.type}</span>${m.unread ? `<span class="badge badge-indigo">未读</span>` : ""}</div>
          </div>
        </div>`).join("") : `<div class="empty"><div class="big">🔔</div><p>暂无消息</p></div>`}
      </div>
    `, "messages");
  }

  /* ---------- 入口选择 ---------- */
  function entryPage() {
    const qCount = DB.allQuestions.length;
    return `
    <div class="entry">
      <header class="entry-top">
        <div class="brand"><span class="brand-mark">☁</span><span>云枢智学<small>YUNSHU AI LEARNING</small></span></div>
        <span class="badge badge-indigo">交互原型 · v0.2</span>
      </header>

      <main class="entry-main">
        <div class="entry-head">
          <div class="entry-tag">CHOOSE YOUR PORTAL</div>
          <h1>请选择要进入的端</h1>
          <p>学员端用于学习、刷题与 AI 模拟面试；管理端用于内容录入、审核与学员管理。<br />两端共用同一套模拟数据，可随时切换。</p>
        </div>

        <div class="entry-cards">
          <a class="entry-card student" href="#/">
            <div class="row between"><div class="entry-ico">🎓</div><span class="entry-arrow">→</span></div>
            <div>
              <h2>学员端</h2>
              <p>从学习路线到能力报告，完成「学 → 练 → 面 → 评」的完整闭环。</p>
            </div>
            <div class="entry-points">
              <span>8 个技术方向</span><span>${qCount} 道刷题</span><span>AI 模拟面试</span><span>能力雷达</span>
            </div>
            <div class="entry-cta">进入学员端 <b>→</b></div>
          </a>

          <a class="entry-card admin" href="#/admin">
            <div class="row between"><div class="entry-ico">🛠️</div><span class="entry-arrow">→</span></div>
            <div>
              <h2>管理端</h2>
              <p>维护学科与课程，审核题库，查看学员记录并处理简答题复核。</p>
            </div>
            <div class="entry-points">
              <span>题库审核</span><span>课程库</span><span>学员管理</span><span>批改复核</span>
            </div>
            <div class="entry-cta">进入管理端 <b>→</b></div>
          </a>
        </div>

        <div class="entry-foot">管理端需使用管理员账号登录（演示账号已预填） · 演示数据保存在浏览器本地</div>
      </main>
    </div>`;
  }

  /* ---------- 渲染入口 ---------- */
  function render(segs, query) {
    const key = segs[0] || "home";
    if (key === "entry") return entryPage();
    if (key === "login" || key === "register" || key === "forgot") {
      return authPage(key, sessionStorage.getItem("ys_notice") || "");
    }
    if (key !== "home" && !S.user) {
      sessionStorage.setItem("ys_redirect", "#/" + segs.join("/"));
      return authPage("login", "请先登录后继续");
    }
    if (["practice", "interview"].includes(key)) {
      return window.Practice ? Practice.render(segs, query) : "";
    }
    const map = {
      home: homePage,
      bank: () => segs[1] ? bankSubjectPage(segs[1]) : bankPage(query.tab),
      wrong: () => bankPage("wrong"),
      roadmap: roadmapPage,
      ability: abilityPage,
      profile: profilePage,
      messages: messagesPage
    };
    const fn = map[key];
    return fn ? fn(query) : shell(`<div class="empty"><div class="big">🧭</div><p>页面不存在</p><a class="btn btn-primary" href="#/">返回首页</a></div>`, "");
  }

  /* ---------- 动作 ---------- */
  App.on("portal.menu", () => {
    const el = document.getElementById("user-menu");
    if (el) el.classList.toggle("open");
  });
  App.on("portal.logout", () => App.confirm("退出登录", "确定要退出当前账号吗？", () => {
    S.user = null; App.save(); App.toast("已退出登录", "ok"); App.go("#/");
  }, "退出"));
  App.on("portal.resetDemo", () => App.confirm("重置演示数据", "将清空当前浏览器中的学习进度、错题和面试记录，恢复初始演示数据，确定吗？", () => {
    App.reset(); App.toast("演示数据已重置", "ok"); App.go("#/");
  }, "重置"));
  App.on("portal.bankFilter", el => { App.ui.bankFilter = el.dataset.id; App.render(); });
  App.on("portal.modeModal", el => modeModal(el.dataset.subject, el.dataset.stage));
  App.on("portal.startPractice", el => {
    App.closeModal();
    App.go(`#/practice?subject=${el.dataset.subject}&stage=${el.dataset.stage}&mode=${el.dataset.mode}`);
  });
  App.on("portal.searchBank", el => searchBank(el.value));
  App.on("portal.wrongTab", el => { App.ui.wrongTab = el.dataset.tab; App.ui.wrongSel = []; App.render(); });
  App.on("portal.wrongToggle", el => {
    const id = el.dataset.qid;
    App.ui.wrongSel = App.ui.wrongSel || [];
    App.ui.wrongSel = App.ui.wrongSel.includes(id) ? App.ui.wrongSel.filter(x => x !== id) : [...App.ui.wrongSel, id];
    App.render();
  });
  App.on("portal.wrongClear", () => { App.ui.wrongSel = []; App.render(); });
  App.on("portal.batchMaster", () => {
    (App.ui.wrongSel || []).forEach(qid => {
      const w = S.wrong.find(x => x.qid === qid); if (w) w.status = "mastered";
    });
    App.ui.wrongSel = []; App.save(); App.toast("已标记为掌握", "ok"); App.render();
  });
  App.on("portal.batchRemove", () => {
    App.confirm("移除错题", "确定从错题本中移除所选题目吗？", () => {
      S.wrong = S.wrong.filter(w => !(App.ui.wrongSel || []).includes(w.qid));
      App.ui.wrongSel = []; App.save(); App.toast("已移除", "ok"); App.render();
    });
  });
  App.on("portal.wrongDetail", el => {
    const q = DB.qById[el.dataset.qid];
    App.modal({
      title: "错题详情",
      size: "lg",
      body: `<div class="row gap-8 mb-12">${App.typeBadge(q.type)}${App.diffBadge(q.difficulty)}${App.dimBadge(q.dim)}</div>
        <div style="font-size:15px;font-weight:650;line-height:1.8">${App.esc(q.stem)}</div>
        ${q.options ? `<div class="col gap-8 mt-16">${q.options.map((o, i) => `<div class="q-option disabled ${q.answer.includes(i) ? "correct" : ""}"><span class="key">${String.fromCharCode(65 + i)}</span><span class="opt-text">${App.esc(o)}</span></div>`).join("")}</div>` : ""}
        <div class="answer-feedback ok mt-16"><div class="fb-title">解析</div><div class="fb-explain" style="border:0;padding:0;margin:0">${App.esc(q.explanation || q.reference || "")}</div></div>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">关闭</button>
        <button class="btn btn-primary" data-act="portal.practiceOne" data-qid="${q.id}">立即重练</button>`
    });
  });
  App.on("portal.practiceOne", el => {
    const q = DB.qById[el.dataset.qid];
    App.closeModal();
    App.go(`#/practice?subject=${q.subjectId}&stage=${q.stageId}&mode=wrong&single=${q.id}`);
  });
  App.on("portal.startWrongPractice", () => App.go("#/practice?mode=wrong"));
  App.on("portal.roadmapSubject", el => { App.ui.roadmapSubject = el.dataset.id; App.render(); });
  App.on("portal.markLearned", el => {
    const id = el.dataset.id;
    const c = DB.courseById[id] || {};
    if (S.learned[id]) {
      delete S.learned[id];
      App.toast("已取消标记");
      App.save(); App.render();
      return;
    }
    App.modal({
      title: "确认完成课程学习",
      body: `
        <div class="text-sm" style="color:var(--text-2);line-height:1.8">请确认你已完成以下课程视频的学习，再将课程标记为「已学」。</div>
        <div class="course-row" style="margin-top:16px;background:var(--bg-soft);border:1px solid var(--line);border-radius:12px">
          <div class="course-cover">
            <img src="${c.cover || ""}" alt="${App.esc(c.title || "")} 课程封面" />
          </div>
          <div class="grow">
            <div class="text-strong">${App.esc(c.title || "")}</div>
            <div class="text-xs text-muted mt-4">${App.esc(c.up || "")} · ${App.esc(c.duration || "")}</div>
          </div>
        </div>
        <label class="agree mt-16" style="background:var(--surface-2);padding:12px;border-radius:10px;border:1px solid var(--line);cursor:pointer">
          <input type="checkbox" id="learned-confirm" style="margin-top:2px;accent-color:var(--primary)" />
          <span>我已完整学习该视频课程，确认标记为「已学」。</span>
        </label>
        <div class="help-block mt-12">标记后会计入「已学课程」数量；如误操作，可在学习路线中再次点击取消。</div>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">还没学完</button>
               <button class="btn btn-primary" id="confirm-learned" data-act="portal.confirmLearned" data-id="${id}" disabled>确认标记</button>`,
      onMount(root) {
        const cb = root.querySelector("#learned-confirm");
        const btn = root.querySelector("#confirm-learned");
        cb.addEventListener("change", () => { btn.disabled = !cb.checked; });
      }
    });
  });
  App.on("portal.confirmLearned", el => {
    const id = el.dataset.id;
    S.learned[id] = Date.now();
    App.save();
    App.closeModal();
    App.toast("已标记为已学", "ok");
    App.render();
  });
  App.on("portal.openCourse", el => {
    const c = DB.courseById[el.dataset.id];
    App.modal({
      title: "课程学习",
      body: `<div class="row gap-14"><div class="course-cover">
          <img src="${c.cover || ""}" alt="${App.esc(c.title)} 课程封面" />
        </div>
        <div><b>${App.esc(c.title)}</b><div class="text-xs text-muted mt-4">${App.esc(c.up)} · ${c.duration}</div></div></div>
        <div class="help-block mt-16">原型演示：点击「打开 B 站」会记录一条学习足迹（课程 ID + 时间），实际项目将跳转到 B 站视频页。</div>`,
      footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button>
        <button class="btn btn-primary" data-act="portal.footprint" data-id="${c.id}">打开 B 站</button>`
    });
  });
  App.on("portal.footprint", el => {
    S.practiceLog.push({ date: new Date().toISOString().slice(0, 10), ts: Date.now(), type: "course", id: el.dataset.id });
    App.save(); App.closeModal(); App.toast("已记录学习足迹，正在跳转（演示）", "ok");
  });
  App.on("portal.saveProfile", () => {
    const form = document.getElementById("profile-form");
    const name = form.querySelector('[name="name"]').value.trim();
    if (!name) return App.toast("昵称不能为空", "err");
    S.user.name = name; S.user.initial = name.slice(0, 1); App.save();
    App.toast("资料已保存", "ok"); App.render();
  });
  App.on("portal.changePwd", () => App.modal({
    title: "修改密码",
    body: `<div class="col gap-14">
      <div class="field"><label class="label">当前密码</label><input class="input" type="password" placeholder="请输入当前密码" /></div>
      <div class="field"><label class="label">新密码</label><input class="input" type="password" placeholder="至少 6 位" /></div>
      <div class="field"><label class="label">确认新密码</label><input class="input" type="password" placeholder="再次输入" /></div></div>`,
    footer: `<button class="btn btn-ghost" data-act="ui.closeModal">取消</button><button class="btn btn-primary" data-act="portal.pwdSaved">保存</button>`
  }));
  App.on("portal.pwdSaved", () => { App.closeModal(); App.toast("密码已更新（原型演示）", "ok"); });
  App.on("portal.devices", () => App.modal({
    title: "登录设备",
    body: `<div class="list-row" style="padding:12px 0"><div class="idx done">💻</div><div class="grow"><b class="text-sm">Windows · Chrome</b><div class="text-xs text-muted">当前设备 · 上海 · 2026-11-11 09:20</div></div><span class="badge badge-green">在线</span></div>`
  }));
  App.on("portal.toggleSwitch", el => el.classList.toggle("on"));
  App.on("portal.consent", () => App.modal({
    title: "录音授权",
    body: `<p class="text-sm text-muted" style="line-height:1.9">AI 面试中的语音会以录音形式保存 90 天，仅用于你本人回放复盘，不用于评分，不对外提供。90 天后自动删除。</p>
      <div class="help-block mt-12">你可以随时在个人中心关闭语音作答，改用文字作答；关闭不影响已有报告。</div>`,
    footer: `<button class="btn btn-ghost" data-act="ui.closeModal">关闭</button><button class="btn btn-danger" data-act="portal.revokeConsent">撤回同意</button>`
  }));
  App.on("portal.revokeConsent", () => { App.closeModal(); App.toast("已撤回录音同意，语音作答已关闭", "ok"); });
  App.on("portal.deactivate", () => App.confirm("注销账号", "注销后账号将被软删除，30 天后彻底清除，且无法恢复。确定继续吗？", () => {
    S.user = null; App.save(); App.toast("账号已注销（原型演示）", "ok"); App.go("#/");
  }, "确认注销"));
  App.on("portal.readAll", () => { S.messages.forEach(m => m.unread = false); App.save(); App.render(); });
  App.on("portal.msgOpen", el => {
    const m = S.messages.find(x => x.id === el.dataset.id);
    m.unread = false; App.save();
    App.modal({ title: m.title, body: `<div class="text-xs text-muted mb-12">${m.time}</div><p style="line-height:1.9;color:var(--text-2)">${App.esc(m.body)}</p>` });
    App.render();
  });

  /* ---------- 认证动作 ---------- */
  App.on("auth.tab", el => { App.ui.loginTab = el.dataset.tab; App.render(); });
  App.on("auth.check", el => el.classList.toggle("on"));
  App.on("auth.policy", () => App.modal({
    title: "协议与隐私说明（原型）",
    body: `<p class="text-sm" style="line-height:1.9;color:var(--text-2)">本原型仅用于交互演示。真实项目中，注册需勾选《用户协议》与《隐私政策》，并明确告知：<br>1）学习足迹（课程点击记录）会保留 1 年；<br>2）AI 面试录音属敏感个人信息，需单独同意，保留 90 天；<br>3）答题与面试内容会用于生成评分与报告。</p>`
  }));
  App.on("auth.sendCode", el => {
    if (el.disabled) return;
    let n = 60; el.disabled = true; el.textContent = `${n}s 后重发`;
    const t = setInterval(() => {
      n--; if (n <= 0) { clearInterval(t); el.disabled = false; el.textContent = "获取验证码"; }
      else el.textContent = `${n}s 后重发`;
    }, 1000);
    App.toast("验证码已发送（演示：123456）", "ok");
  });
  App.on("auth.demo", () => {
    S.user = { name: "林晓", phone: "138****2043", initial: "林", joined: "2026-08-12" };
    App.save(); App.toast("已登录（第三方登录演示）", "ok");
    const r = sessionStorage.getItem("ys_redirect"); sessionStorage.removeItem("ys_redirect");
    App.go(r || "#/");
  });

  function loginSuccess(name, phone) {
    S.user = { name, phone, initial: name.slice(0, 1), joined: new Date().toISOString().slice(0, 10) };
    App.save();
    App.toast("登录成功", "ok");
    const r = sessionStorage.getItem("ys_redirect"); sessionStorage.removeItem("ys_redirect");
    App.go(r || "#/");
  }

  function bindAuth() {
    const login = document.getElementById("login-form");
    if (login) login.addEventListener("submit", e => {
      e.preventDefault();
      const f = new FormData(login);
      const acc = (f.get("account") || "").trim();
      if (!acc) return App.toast("请输入手机号或账号", "err");
      loginSuccess("林晓", "138****2043");
    });
    const reg = document.getElementById("register-form");
    if (reg) reg.addEventListener("submit", e => {
      e.preventDefault();
      const f = new FormData(reg);
      const name = (f.get("name") || "").trim();
      const phone = (f.get("phone") || "").trim();
      const pwd = f.get("password") || "", pwd2 = f.get("password2") || "";
      if (!name) return App.toast("请输入昵称", "err");
      if (!/^1[3-9]\d{9}$/.test(phone)) return App.toast("请输入正确的手机号", "err");
      if (!(f.get("code") || "").trim()) return App.toast("请输入验证码", "err");
      if (pwd.length < 6) return App.toast("密码至少 6 位", "err");
      if (pwd !== pwd2) return App.toast("两次输入的密码不一致", "err");
      if (!document.getElementById("agree1").classList.contains("on")) return App.toast("请先同意用户协议与隐私政策", "err");
      if (!document.getElementById("agree2").classList.contains("on")) return App.toast("请确认已满 18 周岁", "err");
      loginSuccess(name, phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"));
    });
    const forgot = document.getElementById("forgot-form");
    if (forgot) forgot.addEventListener("submit", e => {
      e.preventDefault();
      const phone = (forgot.querySelector('[name="phone"]').value || "").trim();
      if (!/^1[3-9]\d{9}$/.test(phone)) return App.toast("请输入正确的手机号", "err");
      App.ui.forgotStep = 2; App.render();
    });
    const reset = document.getElementById("reset-form");
    if (reset) reset.addEventListener("submit", e => {
      e.preventDefault();
      const p1 = reset.querySelector('[name="password"]').value;
      const p2 = reset.querySelector('input[name="password2"]').value;
      if (p1.length < 6) return App.toast("密码至少 6 位", "err");
      if (p1 !== p2) return App.toast("两次密码不一致", "err");
      App.ui.forgotStep = 3; App.render();
    });
  }

  /* ---------- 挂载 ---------- */
  function mountCommon() {
    document.addEventListener("click", e => {
      const menu = document.getElementById("user-menu");
      if (menu && menu.classList.contains("open") && !menu.contains(e.target)) menu.classList.remove("open");
    }, { once: true });
  }

  const originalRender = render;
  render = function (segs, query) {
    const html = originalRender(segs, query);
    setTimeout(() => { if (document.getElementById("login-form") || document.getElementById("register-form") || document.getElementById("forgot-form") || document.getElementById("reset-form")) bindAuth(); }, 0);
    return html;
  };

  return { render, shell, topbar, footer, pageHead, homePage, authPage, bindAuth, mountCommon, last7Days, modeModal, searchBank };
})();
