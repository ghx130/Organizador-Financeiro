// server.js - Backend para notificações Discord
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Sua URL do Webhook Discord
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1463720246530539603/eykuSaKHxx-z_I-v9PU-FuZFtAU-tSjGCW8EHq8aKt9-xH5u-u3Ymrn3iAgCLYO8Peze;

// Rota para notificar novo login
app.post('/notify-login', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username é obrigatório' });
    }

    const timestamp = new Date().toLocaleString('pt-BR');
    
    // Enviar mensagem para Discord
    const discordMessage = {
      content: `🔐 **Novo Login Detectado!**`,
      embeds: [
        {
          color: 0x0099ff,
          title: '✅ Novo Usuário Registrado',
          fields: [
            {
              name: '👤 Usuário',
              value: `\`${username}\``,
              inline: true
            },
            {
              name: '⏰ Horário',
              value: `\`${timestamp}\``,
              inline: true
            }
          ],
          footer: {
            text: 'Sistema de Notificações • Nossas Finanças'
          }
        }
      ]
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage)
    });

    if (!response.ok) {
      throw new Error(`Discord Error: ${response.statusText}`);
    }

    res.json({ success: true, message: 'Notificação enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: 'Erro ao enviar notificação' });
  }
});

// Rota simples para testar
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor rodando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📱 Webhooks Discord configurado!`);
});
