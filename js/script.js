function mostrarMensagem(id, texto, cor = 'black') {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = texto;
    el.style.color = cor;
  }
}

// cadsatro
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

// login
const formLogin = document.getElementById('formLogin');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

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

//lógica da parte de esqueci a senha 
const formEsqueci = document.getElementById('formEsqueci');
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

// lógica para redefinir a senha 
const formRedefinir = document.getElementById('formRedefinir');
if (formRedefinir) {
  formRedefinir.addEventListener('submit', async (e) => {
    e.preventDefault();
    const senha = document.getElementById('senha').value;
    const confirma = document.getElementById('confirma').value;
    if (senha !== confirma) return mostrarMensagem('mensagem', 'Senhas não coincidem.', 'red');

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) return mostrarMensagem('mensagem', 'Token ausente.', 'red');

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

// página home
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

//historicos 
const tabelaNotas = document.getElementById('tabelaNotas');
if (tabelaNotas) {
  async function carregarNotas() {
    try {
      const res = await fetch('/historico');
      const dados = await res.json();
      const tbody = tabelaNotas.querySelector('tbody');
      tbody.innerHTML = '';
      dados.forEach(n => {
        tbody.innerHTML += `
          <tr>
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

// relatorios 
const relatorioSemanal = document.getElementById('relatorioSemanal');
if (relatorioSemanal) {
  async function carregarRelatorio() {
    try {
      const res = await fetch('/relatorios-semanais');
      const dados = await res.json();
      const tbody = relatorioSemanal.querySelector('tbody');
      tbody.innerHTML = '';
      dados.forEach(n => {
        tbody.innerHTML += `
          <tr>
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

// registrador das notas
const formNota = document.getElementById('formNota');
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
