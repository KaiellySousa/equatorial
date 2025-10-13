// ==================== UTIL ====================
function mostrarMensagem(id, texto, cor = 'black') {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = texto;
    el.style.color = cor;
  }
}

// ==================== CADASTRO ====================
const formCadastro = document.getElementById('formCadastro');
if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      const res = await fetch('/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });
      const data = await res.json();
      alert(data.mensagem || data.erro);
      if (data.mensagem) formCadastro.reset();
    } catch (err) {
      console.error(err);
      alert('Erro no servidor. Tente novamente.');
    }
  });
}

// ==================== LOGIN ====================
const formLogin = document.querySelector('form[action$="AuthController.php"]');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = formLogin.querySelector('input[name="email"]').value;
    const senha = formLogin.querySelector('input[name="senha"]').value;

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const data = await res.json();
      if (data.sucesso) {
        sessionStorage.setItem('usuario', data.usuario);
        window.location.href = 'home.html';
      } else {
        alert(data.mensagem || 'E-mail ou senha incorretos.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro no servidor. Tente novamente.');
    }
  });
}

// ==================== ESQUECI SENHA ====================
const formEsqueci = document.getElementById('form-esqueci');
if (formEsqueci) {
  formEsqueci.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    mostrarMensagem('mensagem', 'Enviando...', 'blue');

    try {
      const res = await fetch('/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      mostrarMensagem('mensagem', data.message || 'Verifique seu e-mail.', 'green');
      formEsqueci.reset();
    } catch (err) {
      console.error(err);
      mostrarMensagem('mensagem', 'Erro no servidor. Tente novamente.', 'red');
    }
  });
}

// ==================== REDEFINIR SENHA ====================
const formRedefinir = document.getElementById('form-redefinir');
if (formRedefinir) {
  formRedefinir.addEventListener('submit', async (e) => {
    e.preventDefault();
    const senha = document.getElementById('senha').value;
    const confirma = document.getElementById('confirma').value;
    if (senha !== confirma) { mostrarMensagem('mensagem', 'Senhas não coincidem.', 'red'); return; }

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) { mostrarMensagem('mensagem', 'Token ausente.', 'red'); return; }

    mostrarMensagem('mensagem', 'Enviando...', 'blue');
    try {
      const res = await fetch('/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, senha })
      });
      const data = await res.json();
      mostrarMensagem('mensagem', data.message || 'Senha redefinida com sucesso!', 'green');
      if (data.message) setTimeout(() => window.location.href = 'login.html', 1500);
    } catch (err) {
      console.error(err);
      mostrarMensagem('mensagem', 'Erro no servidor. Tente novamente.', 'red');
    }
  });
}

// ==================== HOME ====================
const usuario = sessionStorage.getItem('usuario');
const usuarioNomeEl = document.getElementById('usuarioNome');
if (usuarioNomeEl) {
  if (!usuario) {
    alert("Você precisa fazer login!");
    window.location.href = 'login.html';
  } else {
    usuarioNomeEl.textContent = usuario;
  }
}

const logoutBtn = document.getElementById('logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'login.html';
  });
}

// ==================== HISTÓRICO ====================
const tabelaNotas = document.getElementById('tabelaNotas');
if (tabelaNotas) {
  async function carregarNotas() {
    try {
      const res = await fetch('/historico');
      const dados = await res.json();
      const tbody = tabelaNotas.querySelector('tbody');
      tbody.innerHTML = '';
      dados.forEach(n => {
        tbody.innerHTML += `<tr>
          <td>${n.id}</td>
          <td>${n.usuario}</td>
          <td>${n.regional}</td>
          <td>${n.instalacao}</td>
          <td>${n.cliente}</td>
          <td>${n.stc}</td>
          <td>${n.status}</td>
          <td>${n.data_hora}</td>
        </tr>`;
      });
    } catch (err) {
      console.error(err);
    }
  }
  carregarNotas();
}

// ==================== RELATÓRIOS ====================
const relatorioSemanal = document.getElementById('relatorioSemanal');
if (relatorioSemanal) {
  async function carregarRelatorio() {
    try {
      const res = await fetch('/relatorios-semanais');
      const dados = await res.json();
      const tbody = relatorioSemanal.querySelector('tbody');
      tbody.innerHTML = '';
      dados.forEach(n => {
        tbody.innerHTML += `<tr>
          <td>${n.nome}</td>
          <td>${n.status}</td>
          <td>${n.total}</td>
          <td>${n.dia}</td>
        </tr>`;
      });
    } catch (err) {
      console.error(err);
    }
  }
  carregarRelatorio();
}

// ==================== REGISTRAR NOTA ====================
const formNota = document.querySelector('form[action$="NotaController.php"]');
if (formNota) {
  formNota.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formNota);
    try {
      const res = await fetch('/registrar-nota', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      alert(data.mensagem || 'Nota registrada com sucesso!');
      if (data.mensagem) formNota.reset();
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar a nota.');
    }
  });
}
