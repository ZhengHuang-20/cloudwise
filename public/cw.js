/*! 云端智荐采集脚本：<script async src="https://<本站>/cw.js" data-site="sk_xxx"></script>
 * 自动上报页面浏览（/api/public/collect）；带 data-cw-lead 的 <form> 自动提交线索（/api/public/leads）；
 * 也可手动调用 CloudWise.submitLead({ name, phone, email, company, message })。 */
(function () {
  var s = document.currentScript;
  if (!s) return;
  var site = s.getAttribute('data-site');
  if (!site) return;
  var base = new URL(s.src).origin;
  var vid;
  try {
    vid = localStorage.getItem('cw_vid');
    if (!vid) {
      vid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2)).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 36);
      localStorage.setItem('cw_vid', vid);
    }
  } catch (e) { vid = 'anon' + Math.random().toString(36).slice(2, 12); }

  var lastPath = null;
  function pageview() {
    var path = location.pathname + location.search;
    if (path === lastPath) return;
    lastPath = path;
    var body = JSON.stringify({ siteKey: site, visitorId: vid, path: path, referrer: document.referrer });
    try {
      if (!(navigator.sendBeacon && navigator.sendBeacon(base + '/api/public/collect', new Blob([body], { type: 'text/plain' })))) throw 0;
    } catch (e) {
      fetch(base + '/api/public/collect', { method: 'POST', body: body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(function () {});
    }
  }
  pageview();
  // 单页应用：路由变化时再上报
  ['pushState', 'replaceState'].forEach(function (k) {
    var orig = history[k];
    history[k] = function () { var r = orig.apply(this, arguments); setTimeout(pageview, 0); return r; };
  });
  window.addEventListener('popstate', function () { setTimeout(pageview, 0); });

  function submitLead(data) {
    var payload = Object.assign({}, data, { siteKey: site, visitorId: vid, sourcePage: location.pathname + location.search });
    return fetch(base + '/api/public/leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error(j.error || '提交失败');
        return j;
      });
    });
  }
  window.CloudWise = { submitLead: submitLead };

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.hasAttribute || !f.hasAttribute('data-cw-lead')) return;
    e.preventDefault();
    var d = {};
    ['name', 'phone', 'email', 'company', 'message', 'website'].forEach(function (k) {
      var el = f.elements[k];
      if (el && el.value) d[k] = el.value;
    });
    var btn = f.querySelector('[type=submit]');
    if (btn) btn.disabled = true;
    submitLead(d).then(function () {
      f.dispatchEvent(new CustomEvent('cw:success', { bubbles: true }));
      if (!f.hasAttribute('data-cw-keep')) f.reset();
    }).catch(function (err) {
      f.dispatchEvent(new CustomEvent('cw:error', { bubbles: true, detail: err.message }));
    }).then(function () { if (btn) btn.disabled = false; });
  }, true);
})();
