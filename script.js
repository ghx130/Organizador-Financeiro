// script.js - Validação simples do formulário de login (cliente)
(function(){
  const form = document.getElementById('loginForm');
  const messageEl = document.getElementById('message');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    messageEl.textContent = '';
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if(!user || !pass){
      messageEl.textContent = 'Por favor preencha usuário e senha.';
      return;
    }

    // Demo: simular autenticação local (qualquer credencial funciona aqui)
      // salvar sessão simples e redirecionar para dashboard
      localStorage.setItem('username', user);
      localStorage.setItem('loggedIn', '1');
      
      // Notificar o servidor sobre o novo login
      notifyLogin(user);
      showSuccess();
  });

  function showSuccess(){
    messageEl.style.color = '#1a6e43';
    messageEl.textContent = 'Login efetuado com sucesso (demo). Redirecionando...';
      // limpar e ir para dashboard
      setTimeout(()=>{
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        // redireciona para a dashboard local
        window.location.href = 'dashboard.html';
      },900);
  }

})();
  function notifyLogin(username){
    // Adicionar à lista de pendentes
    const PENDING_KEY = 'pendingUsers';
    const pending = JSON.parse(localStorage.getItem(PENDING_KEY)) || [];
    
    // Verificar se já existe
    if (!pending.find(u => u.username === username)) {
      pending.push({
        username,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    }

    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1463720246530539603/eykuSaKHxx-z_I-v9PU-FuZFtAU-tSjGCW8EHq8aKt9-xH5u-u3Ymrn3iAgCLYO8Peze'
    
    const timestamp = new Date().toLocaleString('pt-BR');
    
    const payload = JSON.stringify({
      content: `🔐 **Novo Login Pendente!** - ${username}`,
      embeds: [{
        color: 0xffc107,
        title: '⏳ Novo Usuário Aguardando Aprovação',
        fields: [
          { name: '👤 Usuário', value: username, inline: true },
          { name: '⏰ Horário', value: timestamp, inline: true }
        ]
      }]
    });

    // Enviar para Discord de forma simples
    try {
      new Image().src = DISCORD_WEBHOOK + '?wait=true';
    } catch(e) {}

    // Também tentar com fetch
    try {
      fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors'
      });
    } catch(e) {}
  }
