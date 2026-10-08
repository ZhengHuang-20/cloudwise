/*! 云端智荐采集脚本：<script async src="https://<本站>/cw.js" data-site="sk_xxx"></script>
 * 自动上报页面浏览与参与时长（/api/public/collect），带会话 ID（30 分钟无操作算新会话）、浏览器语言；
 * 来源渠道、UTM、国家地区与设备由服务端判断。带 data-cw-lead 的 <form> 自动提交线索（/api/public/leads）；
 * 也可手动调用 CloudWise.submitLead({ name, phone, email, company, message })。
 * 排除自己的访问：在网址后加 ?cw_ignore=1（恢复用 ?cw_ignore=0），记在这台浏览器上。
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

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
    return null;
  }
  function rid() {
    var c = w.crypto;
    return (c && c.randomUUID ? c.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2)).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 36);
  }

  var ignoreParam = /[?&]cw_ignore=([01])/.exec(location.search);
  if (ignoreParam) store('cw_ignore', ignoreParam[1]);
  var ignored = store('cw_ignore') === '1';

  var vid = store('cw_vid');
  var newVisitor = false;
  if (!vid || !/^[A-Za-z0-9_-]{8,40}$/.test(vid)) {
    vid = rid();
    newVisitor = true;
    store('cw_vid', vid);
    if (store('cw_vid') !== vid) { vid = 'anon' + Math.random().toString(36).slice(2, 12); newVisitor = false; }
  }

  // 会话：30 分钟无操作后新开；带着站外来源或广告参数进来时也新开，来源归因才准
  var GAP = 30 * 60 * 1000;
  var sid = store('cw_sid');
  var refHost = '';
  try { refHost = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
  var landing = (refHost && refHost !== location.hostname) || /[?&](utm_[a-z]+|gclid|gbraid|wbraid|msclkid|ttclid)=/.test(location.search);
  if (!sid || landing || Date.now() - (Number(store('cw_sts')) || 0) > GAP) sid = rid();
  function touch() {
    if (Date.now() - (Number(store('cw_sts')) || Date.now()) > GAP) sid = rid();
    store('cw_sid', sid);
    store('cw_sts', String(Date.now()));
  }
  log('已加载，站点 ' + site + '，上报到 ' + base + (ignored ? '（已排除本浏览器的访问，?cw_ignore=0 恢复）' : ''));

  /** 把非 2xx 响应转成带服务端说明的错误 */
  function readError(r) {
    return r.json().catch(function () { return {}; }).then(function (j) {
      var err = new Error(j.error || '请求失败');
      err.status = r.status;
      throw err;
    });
  }
  var blockedHint = '请求没有发出或被浏览器拦截：检查广告/隐私拦截插件，以及页面 Content-Security-Policy 的 connect-src 是否允许 ' + base;

  function post(body, beacon) {
    var url = base + '/api/public/collect';
    var text = JSON.stringify(body);
    // 页面关闭时（或没有 fetch 的旧浏览器）用 sendBeacon，不会被中断；其余用 fetch（开发者工具里归在 Fetch/XHR 下，也能读到失败原因）；text/plain 不触发预检
    if ((beacon || !w.fetch) && navigator.sendBeacon && navigator.sendBeacon(url, new Blob([text], { type: 'text/plain' }))) return;
    if (!w.fetch) return;
    fetch(url, { method: 'POST', body: text, keepalive: true, credentials: 'omit', headers: { 'Content-Type': 'text/plain' } })
      .then(function (r) { return r.ok ? log('已上报 ' + (body.type || 'pageview') + ' ' + body.path) : readError(r); }, function () { throw new Error(blockedHint); })
      .catch(function (err) { warn('访问上报失败' + (err.status ? '（HTTP ' + err.status + '）' : '') + '：' + err.message); });
  }

  // 参与时长：只计页面在前台的时间；切到后台、关闭或单页应用换页时补报
  var engaged = 0, since = 0, scroll = 0;
  function resume() { if (!since && document.visibilityState === 'visible') since = Date.now(); }
  function pause() { if (since) { engaged += Date.now() - since; since = 0; } }
  function onScroll() {
    var el = document.documentElement;
    var h = Math.max(el.scrollHeight, document.body ? document.body.scrollHeight : 0);
    if (h > 0) scroll = Math.max(scroll, Math.min(100, Math.round(((w.scrollY || el.scrollTop) + w.innerHeight) / h * 100)));
  }
  function flush(beacon) {
    pause();
    if (lastPath === null || ignored || (engaged < 500 && !scroll)) { engaged = 0; return; }
    post({ type: 'engage', siteKey: site, visitorId: vid, sessionId: sid, path: lastPath, engagedMs: engaged, scroll: scroll }, beacon);
    touch();
    engaged = 0;
  }

  var lastPath = null;
  function pageview() {
    var path = location.pathname + location.search;
    if (path === lastPath) return;
    if (lastPath !== null) flush(false);
    lastPath = path;
    scroll = 0;
    resume();
    onScroll();
    if (ignored) return log('已排除本浏览器的访问，不上报 ' + path);
    touch();
    post({
      siteKey: site, visitorId: vid, sessionId: sid, newVisitor: newVisitor, path: path, referrer: document.referrer,
      lang: navigator.language || '', webdriver: navigator.webdriver === true
    }, false);
    newVisitor = false;
  }
  pageview();
  // 单页应用：路由变化时再上报
  ['pushState', 'replaceState'].forEach(function (k) {
    var orig = history[k];
    history[k] = function () { var r = orig.apply(this, arguments); setTimeout(pageview, 0); return r; };
  });
  w.addEventListener('popstate', function () { setTimeout(pageview, 0); });
  w.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush(true); else resume();
  });
  w.addEventListener('pagehide', function () { flush(true); });

  function submitLead(data) {
    var payload = Object.assign({}, data, { siteKey: site, visitorId: vid, sessionId: sid, sourcePage: location.pathname + location.search });
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
