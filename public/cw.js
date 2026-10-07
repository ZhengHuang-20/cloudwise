/*! 云端智荐采集脚本：<script async src="https://<本站>/cw.js" data-site="sk_xxx"></script>
 * 自动上报页面浏览（/api/public/collect）；带 data-cw-lead 的 <form> 自动提交线索（/api/public/leads）；
 * 也可手动调用 CloudWise.submitLead({ name, phone, email, company, message })。
 * 排查：脚本标签加 data-debug，或在地址后加 ?cw_debug=1，控制台会打印每一步；配置错误总会以 [CloudWise] 警告输出。 */
(function () {
  var w = window;
  // 重复引入（模板里写了两次、框架重复挂载）时只执行一次
  if (w.CloudWise && w.CloudWise.loaded) return;

  function warn(m) { try { console.warn('[CloudWise] ' + m); } catch (e) {} }
  var s = document.currentScript;
  // type="module" 等方式加载时 currentScript 为空，按 src 找回脚本标签
  if (!s || !s.getAttribute('data-site')) s = document.querySelector('script[data-site][src*="/cw.js"]') || s;
  var site = s && s.getAttribute('data-site');
  if (!site) { warn('没有找到带 data-site 的 cw.js 脚本标签，访问统计未启用'); return; }
  var base = new URL(s.src, location.href).origin;
  var debug = s.hasAttribute('data-debug') || /[?&#]cw_debug=1/.test(location.href);
  try { if (localStorage.getItem('cw_debug') === '1') debug = true; } catch (e) {}
  function log(m) { if (debug) try { console.info('[CloudWise] ' + m); } catch (e) {} }

  var vid;
  try {
    vid = localStorage.getItem('cw_vid');
    if (!vid) {
      vid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2)).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 36);
      localStorage.setItem('cw_vid', vid);
    }
  } catch (e) { vid = 'anon' + Math.random().toString(36).slice(2, 12); }
  log('已加载，站点 ' + site + '，上报到 ' + base);

  /** 把非 2xx 响应转成带服务端说明的错误 */
  function readError(r) {
    return r.json().catch(function () { return {}; }).then(function (j) {
      var err = new Error(j.error || '请求失败');
      err.status = r.status;
      throw err;
    });
  }
  var blockedHint = '请求没有发出或被浏览器拦截：检查广告/隐私拦截插件，以及页面 Content-Security-Policy 的 connect-src 是否允许 ' + base;

  var lastPath = null;
  function pageview() {
    var path = location.pathname + location.search;
    if (path === lastPath) return;
    lastPath = path;
    var url = base + '/api/public/collect';
    var body = JSON.stringify({ siteKey: site, visitorId: vid, path: path, referrer: document.referrer });
    // 优先用 fetch（开发者工具里归在 Fetch/XHR 下，也能读到失败原因）；text/plain 不触发预检
    if (w.fetch) {
      fetch(url, { method: 'POST', body: body, keepalive: true, credentials: 'omit', headers: { 'Content-Type': 'text/plain' } })
        .then(function (r) { return r.ok ? log('已上报 ' + path) : readError(r); }, function () { throw new Error(blockedHint); })
        .catch(function (err) { warn('访问上报失败' + (err.status ? '（HTTP ' + err.status + '）' : '') + '：' + err.message); });
    } else if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }));
    }
  }
  pageview();
  // 单页应用：路由变化时再上报
  ['pushState', 'replaceState'].forEach(function (k) {
    var orig = history[k];
    history[k] = function () { var r = orig.apply(this, arguments); setTimeout(pageview, 0); return r; };
  });
  w.addEventListener('popstate', function () { setTimeout(pageview, 0); });

  function submitLead(data) {
    var payload = Object.assign({}, data, { siteKey: site, visitorId: vid, sourcePage: location.pathname + location.search });
    return fetch(base + '/api/public/leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) return readError(r);
      log('线索已提交');
      return r.json().catch(function () { return {}; });
    }, function () { throw new Error('提交失败，请检查网络后重试'); });
  }
  w.CloudWise = { submitLead: submitLead, loaded: true, site: site, base: base };

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
      warn('线索提交失败：' + err.message);
      f.dispatchEvent(new CustomEvent('cw:error', { bubbles: true, detail: err.message }));
    }).then(function () { if (btn) btn.disabled = false; });
  }, true);
})();
