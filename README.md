# Frontend — Login (demo)

Pequeno frontend estático com formulário de login, fundo azul e decoração leve de finanças/casas.

Arquivos:
- `index.html` — página principal com o formulário de login.
- `styles.css` — estilos (fundo azul, cartão, decoração SVG).
- `script.js` — validação simples no cliente.
 - `dashboard.html` — área com gráficos e metas (acessível após login).
 - `dashboard.js` — script que renderiza gráficos de demonstração (Chart.js) e controla sessão.

Como testar (Windows PowerShell):

1. Abra o Explorador de Arquivos e clique duas vezes em `index.html`.
2. Ou, no PowerShell, execute:

```powershell
# abrir index.html no navegador padrão
Invoke-Item 'c:\Users\Guilherme Martins\Desktop\PJ NOVO\index.html'
```

Observações:
- Esta é uma demo front-end sem backend. A validação é local e serve apenas para demonstração.
- Para integrar com um backend real, envie as credenciais via HTTPS e implemente autenticação no servidor.

Dashboard:
- Faça login na tela inicial (qualquer usuário/senha funciona na demo). Você será redirecionado para `dashboard.html`.
- A dashboard mostra gráficos demo de fluxo de caixa e distribuição de despesas. Substitua os dados em `dashboard.js` por dados de sua API quando integrar.
