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
  if (state.startsWith('RI_')) {
    // A remote seller has no access to the inviter's loopback service.
    // Return the one-time result manually; PKCE verifier stays with the inviter.
    const clean = new URL(location.origin + location.pathname);
    clean.search = new URLSearchParams({code, state}).toString();
    document.getElementById('returned').value = clean.href;
    const fallback = document.getElementById('fallback');
    fallback.hidden = false;
    fallback.open = true;
    fallback.querySelector('summary').textContent = '授权结果 / Resultado da autorização';
    fallback.querySelector('p').textContent = '将下方一次性结果通过与邀请方的私下可信渠道交回，请立即处理。不要发送到AI聊天，不含密码或访问令牌。 Envie este resultado somente à pessoa que convidou você, por um canal privado e confiável.';
    status.textContent = '已收到官方授权结果，等待邀请方完成连接。请复制下方结果交回邀请方；无需安装本机服务。 Autorização recebida. Copie o resultado e envie à pessoa que convidou você para concluir a conexão.';
    const localHelp = document.getElementById('local-help');
    if (localHelp) localHelp.textContent = '远程店主无需安装或打开本机服务。授权结果只交给邀请方，不需要提供账号密码。 Não é necessário instalar nenhum serviço local nem fornecer sua senha.';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '复制授权结果 / Copiar resultado';
    button.onclick = async () => {
      try { await navigator.clipboard.writeText(clean.href); button.textContent = '已复制 / Copiado'; }
      catch { document.getElementById('returned').select(); button.textContent = '请按 Ctrl+C / Pressione Ctrl+C'; }
    };
    fallback.appendChild(button);
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
