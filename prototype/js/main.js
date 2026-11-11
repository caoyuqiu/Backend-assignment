/* ============================================================
   云枢智学 · 启动入口
   ============================================================ */
(function () {
  "use strict";

  // 默认进入学员端首页
  if (!location.hash || location.hash === "#") {
    try { history.replaceState(null, "", "#/entry"); } catch (e) { location.hash = "#/entry"; }
  }

  function boot() {
    try {
      App.render();
    } catch (err) {
      console.error("[云枢智学原型] 启动失败：", err);
      document.getElementById("app").innerHTML =
        `<div style="max-width:640px;margin:80px auto;padding:24px;border:1px solid #f3d2cf;border-radius:16px;background:#fff">
          <h2 style="margin:0 0 8px;font-size:18px">原型启动失败</h2>
          <p style="color:#6b7280;font-size:13px">请打开浏览器控制台查看错误详情。</p>
          <pre style="background:#f8f9fc;padding:12px;border-radius:10px;font-size:12px;overflow:auto">${String(err && err.stack || err)}</pre>
        </div>`;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
