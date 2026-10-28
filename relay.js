'use strict';
(() => {
  const params = new URLSearchParams(location.search);
  const returned = location.href;
  // Clear the one-time code from this tab's current history entry before any navigation.
  history.replaceState(null, '', location.pathname);
  const status = document.getElementById('status');
  const link = document.getElementById('continue');
  if (params.has('error')) {
    status.textContent = '授权未完成。请回到本机同步页重新发起授权。';
    return;
  }
  const code = params.get('code') || '';
  const state = params.get('state') || '';
  if (params.getAll('code').length !== 1 || params.getAll('state').length !== 1 ||
      !/^[A-Za-z0-9_-]{43}$/.test(state) || !code || code.length > 4096 || /[\u0000-\u0020\u007f]/.test(code)) {
    status.textContent = '此地址是授权专用回调入口。请从本机同步页发起店铺授权。';
    return;
  }
  // Fixed loopback destination: never accept a redirect target supplied by a visitor.
  const target = new URL('http://127.0.0.1:8768/oauth/callback');
  target.search = new URLSearchParams({code, state}).toString();
  link.href = target.href;
  link.hidden = false;
  document.getElementById('returned').value = returned;
  document.getElementById('fallback').hidden = false;
  status.textContent = '授权参数已收到，正在返回本机校验并完成连接……';
  location.replace(target.href);
})();
