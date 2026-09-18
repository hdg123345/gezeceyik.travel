// Development-only diagnostics for the cinematic navigation (loaded by the
// bootstrap in index.html when ?debug=nav is set; excluded from deployment
// by .vercelignore). Shows the master state, and flags the two things a
// visual change must never add: a second scroll/wheel owner and a second
// render loop.
(function () {
  var panel = document.createElement("pre");
  panel.id = "gez-nav-debug";
  panel.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:2147483647;margin:0;padding:8px 10px;font:11px/1.45 ui-monospace,Menlo,monospace;color:#dff;background:rgba(5,19,29,.88);border:1px solid rgba(255,255,255,.18);border-radius:6px;pointer-events:none;white-space:pre;max-width:60vw";
  document.body.appendChild(panel);

  var lastRafs = {}, rafRates = {};
  setInterval(function () {
    var now = window.__gezRafs || {};
    for (var k in now) { rafRates[k] = (now[k] - (lastRafs[k] || 0)) * 2; }
    lastRafs = Object.assign({}, now);
  }, 500);

  function census() {
    var lis = window.__gezListeners || [], byType = {};
    lis.forEach(function (l) { var k = l.type + "@" + l.target; byType[k] = (byType[k] || 0) + 1; });
    return byType;
  }
  var warned = {};
  function warnOnce(key, msg) { if (warned[key]) return; warned[key] = true; console.warn("[nav-debug] " + msg); }

  function tick() {
    var n = window.__gezNav, lines = [];
    if (!n) {
      lines.push("__gezNav: not present (card-first page, reduced motion, or the map has not loaded)");
    } else {
      lines.push("masterProgress  " + n.progress.toFixed(4) + "   (0 world, 1 thailand, 2 contact)");
      lines.push("targetProgress  " + n.target.toFixed(4) + "   direction " + (n.direction > 0 ? "down" : n.direction < 0 ? "up" : "-"));
      lines.push("navigationState " + n.state + "   phase " + n.phase + " (" + n.stops[n.phase] + ")");
      lines.push("scrollMode      " + n.scrollMode + "   docLocked " + n.locked + "   flying " + n.flying + "   loop " + (n.loopRunning ? "running" : "asleep"));
      lines.push("scrollY         " + Math.round(window.scrollY) + "   body: " + Array.prototype.filter.call(document.body.classList, function (c) { return /^(th-|view-)/.test(c); }).join(" "));
    }
    var c = census(), wheelOwners = 0, loops = [];
    lines.push("");
    lines.push("listeners (registered since load):");
    Object.keys(c).sort().forEach(function (k) { lines.push("  " + k + " x" + c[k]); if (/^wheel@(window|document)/.test(k)) wheelOwners += c[k]; });
    Object.keys(rafRates).forEach(function (k) { if (rafRates[k] > 0) loops.push(k + " " + rafRates[k] + "/s"); });
    lines.push("rAF callbacks/s: " + (loops.join(", ") || "none"));
    if (wheelOwners > 1) { lines.push("!! " + wheelOwners + " wheel listeners on window/document -- there must be exactly one (thailandHeroZoom)"); warnOnce("wheel", wheelOwners + " wheel listeners registered; the cinematic must be the only wheel owner"); }
    var running = loops.filter(function (l) { return !/^(tick|loop|anonymous) /.test(l); });
    if (running.length) warnOnce("loops:" + running.join(), "unexpected rAF loops: " + running.join(", "));
    panel.textContent = lines.join("\n");
  }
  setInterval(tick, 250);
  tick();
})();
