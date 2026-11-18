/*! 云端智荐采集脚本：<script async src="https://<本站>/cw.js" data-site="sk_xxx"></script>
 * 自动上报页面浏览与参与时长（/api/public/collect），带会话 ID（30 分钟无操作算新会话）、浏览器语言；
 * 来源渠道、UTM、国家地区与设备由服务端判断。带 data-cw-lead 的 <form> 自动提交线索（/api/public/leads）；
 * 也可手动调用 CloudWise.submitLead({ name, phone, email, company, message, fields: { 任意字段名: 值 } })。
 * 脚本标签加 data-cw-auto 后，页面上任何含手机或邮箱输入的表单（含不是 <form> 的自定义提交按钮）提交时自动识别并入库，
 * 字段名取页面上用户看到的标题，选项按钮与勾选框按选中状态收集；某个表单不想被收，加 data-cw-ignore。
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

  var lastManual = 0; // 手动或 data-cw-lead 提交的时间：自动识别在这之后不再重复上报
  function submitLead(data) {
    lastManual = Date.now();
    return sendLead(data);
  }
  function sendLead(data) {
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
  // ---------- 自动识别表单（脚本标签带 data-cw-auto 才启用，不影响已接入的站点）----------
  if (!s.hasAttribute('data-cw-auto')) return;

  var SKIP_TYPES = /^(password|hidden|file|submit|button|reset|image|range|color)$/i;
  var CONSENT_RE = /同意|阅读|协议|隐私|条款|agree|consent|privacy|terms/i;
  var SUBMIT_RE = /提交|预约|申请|报名|咨询|获取|领取|立即|免费|联系|留言|索取|订阅|加盟|下单|submit|send|apply|book|contact|request|subscribe|sign.?up|get /i;
  var SEL_CLS = /(^|[-_\s])(active|selected|checked|chosen|current|on)($|[-_\s])/i;
  var CHIP_SEL = 'button,[role=radio],[role=checkbox],[role=option],[role=button],[role=tab]';

  function txt(el) { return ((el && (el.innerText || el.textContent)) || '').replace(/\s+/g, ' ').trim(); }
  function cleanLabel(t) {
    return String(t || '').replace(/[（(][^）)]*(选填|必填|可选|optional|required)[^）)]*[）)]/ig, '').replace(/[*＊:：]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
  }
  /** 控件（或它的外层容器）前面紧挨着的一小段文字，通常就是这一项的标题 */
  function headingBefore(el, root, depth) {
    var n = el;
    for (var i = 0; i < depth && n && n !== root && n.parentElement; i++, n = n.parentElement) {
      var p = n.previousElementSibling;
      if (p && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(p.tagName) && !p.querySelector('input,select,textarea,button')) {
        var t = txt(p);
        if (t && t.length <= 30) return t;
      }
    }
    return '';
  }
  function labelOf(el, root) {
    var t = el.getAttribute('aria-label');
    var by = el.getAttribute('aria-labelledby');
    if (!t && by) t = txt(document.getElementById(by.split(' ')[0]));
    if (!t && el.labels && el.labels[0]) t = txt(el.labels[0]);
    if (!t) t = headingBefore(el, root, 3);
    if (!t) t = el.getAttribute('placeholder') || el.name || el.id || '';
    return cleanLabel(t);
  }

  /** 选项按钮是否被选中：优先看语义属性与类名；样式全靠 CSS 的按钮由 chipsByStyle 兜底 */
  function chipOn(el) {
    if (el.getAttribute('aria-pressed') === 'true' || el.getAttribute('aria-checked') === 'true' || el.getAttribute('aria-selected') === 'true') return true;
    if (/^(on|checked|active|selected)$/.test(el.getAttribute('data-state') || '')) return true;
    if (el.getAttribute('data-selected') === 'true' || el.getAttribute('data-active') === 'true') return true;
    return SEL_CLS.test(typeof el.className === 'string' ? el.className : '');
  }
  function styleSig(el) {
    var c = getComputedStyle(el);
    return [c.backgroundColor, c.color, c.borderTopColor, c.fontWeight].join('|');
  }
  /** 一组选项按钮（同一个父元素下 2 个以上的按钮）*/
  function chipGroups(root) {
    var groups = [], seen = [];
    var all = root.querySelectorAll(CHIP_SEL);
    for (var i = 0; i < all.length; i++) {
      var b = all[i];
      if (b.type === 'submit' || b.disabled || !b.getClientRects().length) continue;
      var par = b.parentElement;
      if (!par || seen.indexOf(par) >= 0) continue;
      var kids = [];
      for (var j = 0; j < par.children.length; j++) if (par.children[j].matches(CHIP_SEL) && par.children[j].type !== 'submit') kids.push(par.children[j]);
      if (kids.length >= 2 && kids.length <= 16) { seen.push(par); groups.push({ el: par, chips: kids }); }
    }
    return groups;
  }

  /** 收集一个容器里用户填写的内容：[{ k: 字段名, v: 值, t: 控件类型, n: name }]，并判断是否像线索表单、是否被卡住（必填的协议没勾、有校验错误） */
  function collect(root) {
    var out = [], blocked = false, contact = '';
    function add(k, v, t, n) {
      v = String(v || '').trim();
      if (!v) return;
      k = k || cleanLabel(n) || '未命名';
      for (var i = 0; i < out.length; i++) if (out[i].k === k && !t) { out[i].v += '、' + v; return; }
      out.push({ k: k, v: v.slice(0, 500), t: t || '', n: n || '' });
      var digits = v.replace(/[\s\-()+]/g, '');
      if (!contact && (t === 'email' || t === 'tel' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^1[3-9]\d{9}$/.test(digits))) contact = digits.toLowerCase();
    }
    var els = root.querySelectorAll('input,select,textarea');
    var radios = {};
    for (var i = 0; i < els.length; i++) {
      var el = els[i], type = (el.type || '').toLowerCase();
      if (el.disabled || SKIP_TYPES.test(type)) continue;
      if (el.getAttribute('aria-invalid') === 'true') blocked = true;
      if (type === 'checkbox' || type === 'radio') {
        var opt = txt(el.labels && el.labels[0] ? el.labels[0] : el.closest('label')) || el.value;
        if (CONSENT_RE.test(opt) && type === 'checkbox') {
          if (el.checked) add('同意协议', '是'); else blocked = true;
          continue;
        }
        if (!el.checked) continue;
        var fs = el.closest('fieldset');
        var legend = fs && fs.querySelector('legend');
        var gk = cleanLabel(legend ? txt(legend) : headingBefore(el.closest('label') || el, root, 3)) || cleanLabel(el.name) || '选项';
        radios[gk] = (radios[gk] ? radios[gk] + '、' : '') + opt;
        continue;
      }
      if (!el.getClientRects().length) continue;
      var v = el.tagName === 'SELECT' ? (el.value ? txt(el.options[el.selectedIndex]) : '') : el.value;
      if (/^请选择|^select\b|^choose\b/i.test(v)) continue;
      add(labelOf(el, root), v, type, el.name || el.id);
    }
    for (var gk2 in radios) add(gk2, radios[gk2]);

    // 自定义选项按钮：语义属性 / 类名 → 否则比较同组按钮的样式（和多数不同的算选中）
    var groups = chipGroups(root), explicit = false, sigCount = {}, i2, j2;
    for (i2 = 0; i2 < groups.length; i2++) for (j2 = 0; j2 < groups[i2].chips.length; j2++) {
      if (chipOn(groups[i2].chips[j2])) explicit = true;
      var sg = styleSig(groups[i2].chips[j2]);
      sigCount[sg] = (sigCount[sg] || 0) + 1;
    }
    // 「没选中」的样式：出现次数最多的；数量相当时偏向白底 / 透明底、常规字重的那个
    var base = '', max = 0;
    for (var sg2 in sigCount) {
      var parts = sg2.split('|'), score = sigCount[sg2];
      if (/^(rgba?\(0, 0, 0, 0\)|rgb\(2[45]\d, 2[45]\d, 2[45]\d\))$/.test(parts[0])) score += 0.5;
      if (Number(parts[3]) <= 400) score += 0.25;
      if (score > max) { max = score; base = sg2; }
    }
    for (i2 = 0; i2 < groups.length; i2++) {
      var picked = [];
      for (j2 = 0; j2 < groups[i2].chips.length; j2++) {
        var c = groups[i2].chips[j2];
        if (explicit ? chipOn(c) : styleSig(c) !== base) picked.push(txt(c));
      }
      if (picked.length) add(cleanLabel(headingBefore(groups[i2].el, root, 3)) || '选项', picked.join('、'));
    }
    return { fields: out, blocked: blocked, contact: contact };
  }

  var sentAt = {}; // 联系方式 → 上报时间，20 秒内同一联系方式只报一次
  function schedule(root) {
    if (ignored || root.closest('[data-cw-ignore],[data-cw-lead]')) return;
    var snap = collect(root); // 现在就取值：网站提交成功后常会清空表单
    if (!snap.contact || snap.blocked) return log('自动识别：这次提交没有可用的联系方式，或必填项未完成，不上报');
    var t0 = Date.now();
    setTimeout(function () {
      // 等网站自己的校验与提交先走完：手动上报过、出现校验错误、同一联系方式刚报过都不再上报
      if (lastManual >= t0 || (Date.now() - (sentAt[snap.contact] || 0)) < 20000) return;
      if (root.isConnected && root.querySelector('[aria-invalid="true"]')) return log('自动识别：表单有校验错误，不上报');
      sentAt[snap.contact] = Date.now();
      log('自动识别到线索表单，字段 ' + snap.fields.length + ' 个');
      sendLead({ fields: snap.fields, auto: true }).catch(function (err) { warn('自动识别的线索提交失败：' + err.message); });
    }, 700);
  }

  // 表单提交（浏览器原生校验通过后才触发）
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && f.tagName === 'FORM') schedule(f);
  }, true);

  // 没有 <form> 或按钮类型不是 submit 的自定义提交：点击「提交类」按钮时，向上找到包含联系方式的最小容器
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('button,[type=submit],[type=button],[role=button]');
    if (!b || (b.form && b.type === 'submit')) return;
    var label = txt(b) || b.value || '';
    if (!label || label.length > 24 || !SUBMIT_RE.test(label)) return;
    var n = b.parentElement;
    for (var i = 0; n && i < 8 && n !== document.body; i++, n = n.parentElement) {
      if (collect(n).contact) return schedule(n);
    }
  }, true);
})();
