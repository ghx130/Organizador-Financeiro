function fazerLogin() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (email === "" || senha === "") {
    alert("Preencha todos os campos");
    return;
  }

  // salva quem está logado
  localStorage.setItem("usuarioLogado", email);

  // cria estrutura do usuário se não existir
  if (!localStorage.getItem(`dados_${email}`)) {
    localStorage.setItem(
      `dados_${email}`,
      JSON.stringify({
        entradas: [],
        gastos: [],
        meta: 0
      })
    );
  }

  window.location.href = "dashboard.html";
}  

const usuario = localStorage.getItem("usuarioLogado");

if (!usuario) {
  window.location.href = "login.html";
}

let dados = JSON.parse(localStorage.getItem(`dados_${usuario}`));

function adicionarGasto(descricao, valor) {
  dados.gastos.push({
    descricao,
    valor: Number(valor),
    data: new Date().toLocaleDateString()
  });

  salvarDados();
}

function salvarDados() {
  localStorage.setItem(`dados_${usuario}`, JSON.stringify(dados));
}

function salvarMeta(valor) {
  dados.meta = Number(valor);
  salvarDados();
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}
