import path from 'path';
import express from 'express';
import session from 'express-session';

const porta = 3000;
const host = '0.0.0.0';

let listaUsuarios = [];
let listaMensagens = [];

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'MinH4CH4v3S3cr3t4',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 15
    }
}));

function usuarioEstaAutenticado(requisicao, resposta, next) {
    if (requisicao.session.usuarioAutenticado) {
        next();
    } else {
        resposta.redirect('/login.html');
    }
}

function cadastroUsuario(requisicao, resposta) {
    const nome = requisicao.body.nome;
    const email = requisicao.body.email;
    const senha = requisicao.body.senha;

    if (nome && email && senha) {
        listaUsuarios.push({
            nome: nome,
            email: email,
            senha: senha,
        });
        resposta.send(renderCadastroPage("Cadastro realizado com sucesso!"));
    } else {
        resposta.send(renderCadastroPage("Por favor, preencha todos os campos."));
    }
}

function renderCadastroPage(message = '') {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cadastro de Usuarios</title>
        <link rel="stylesheet" href="CadStyle.css">
    </head>
    <body>
        <div class="registration-form">
            <h2>Cadastro</h2>
            <form action="/cadastroUsuario" method="POST">
                <div class="form-group">
                    <label for="nome">Nome:</label>
                    <input type="text" id="nome" name="nome">
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email">
                </div>
                <div class="form-group">
                    <label for="senha">Senha:</label>
                    <input type="password" id="senha" name="senha">
                </div>
                <button type="submit">Registrar</button>
            </form>
            <button class="back-button" onclick="window.location.href='index.html'">Voltar</button>
            ${message ? `<div class="message">${message}</div>` : ''}
        </div>
    </body>
    </html>`;
}

function autenticarUsuario(requisicao, resposta) {
    const usuario = requisicao.body.usuario;
    const senha = requisicao.body.senha;
    if (usuario === 'admin' && senha === '123456') {
        requisicao.session.usuarioAutenticado = true;
        requisicao.session.ultimoAcesso = new Date().toLocaleString();
        resposta.redirect('/');
    } else {
        resposta.write('<!DOCTYPE html>');
        resposta.write('<html>');
        resposta.write('<head>');
        resposta.write('<meta charset="UTF-8">');
        resposta.write('<title>Falha ao realizar Login</title>');
        resposta.write('</head>');
        resposta.write('<body>');
        resposta.write('<h1>Login</h1>');
        resposta.write('<p>Usuario ou senha invalidos! </p>');
        resposta.write('<input type="button" value="voltar" onclick="history.go(-1)"/>');
        resposta.write('</body>');
        resposta.write('</html>');
        resposta.end();
    }
}

app.post('/login', autenticarUsuario);

app.get('/login', (req, resp) => {
    resp.redirect('/login.html');
});

app.get('/logout', (req, resp) => {
    const ultimoAcesso = req.session.ultimoAcesso;
    req.session.destroy();
    resp.send(renderLogoutPage(ultimoAcesso));
});

function renderLogoutPage(ultimoAcesso) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Logout</title>
    </head>
    <body>
        <h1>Logout</h1>
        <p>Você saiu do sistema.</p>
        <p>Último acesso: ${ultimoAcesso}</p>
        <button onclick="window.location.href='/login.html'">Login</button>
    </body>
    </html>`;
}

app.use(express.static(path.join(process.cwd(), 'publico')));

app.use(usuarioEstaAutenticado, express.static(path.join(process.cwd(), 'protegido')));

app.post('/cadastroUsuario', usuarioEstaAutenticado, cadastroUsuario);

app.post('/postarMensagem', usuarioEstaAutenticado, (req, res) => {
    const recipient = req.body.recipient;
    const message = req.body.message;

    if (recipient && message.trim() !== '') {
        const novaMensagem = {
            recipient: recipient,
            message: message,
            timestamp: new Date().toLocaleString()
        };
        listaMensagens.push(novaMensagem);
        res.send(renderChatPage(listaMensagens)); // Renderizar a página com mensagens atualizadas
    } else {
        res.send(renderChatPage(listaMensagens, "Selecione um usuário e preencha a mensagem."));
    }
});

function renderChatPage(mensagens, errorMsg = '') {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat de Conversa</title>
        <link rel="stylesheet" href="chatStyle.css">
    </head>
    <body>
        <div class="chat-container">
            <div class="chat-header">
                <h2>Chat de Conversa</h2>
            </div>
            <div class="chat-window">
                <div class="messages">`;
    mensagens.forEach(msg => {
        html += `<div class="message"><strong>${msg.recipient}</strong>: ${msg.message} <span class="timestamp">${msg.timestamp}</span></div>`;
    });
    html += `</div>
            </div>
            <div class="chat-input">
                <form id="chatForm" action="/postarMensagem" method="POST">
                    <select id="recipient" name="recipient">`;
    listaUsuarios.forEach(user => {
        html += `<option value="${user.email}">${user.nome}</option>`;
    });
    html += `</select>
                    <input type="text" id="message" name="message" placeholder="Digite sua mensagem aqui">
                    <button type="submit">Enviar</button>
                </form>`;
    if (errorMsg) {
        html += `<div class="error">${errorMsg}</div>`;
    }
    html += `</div>
        </div>
        <script src="/chat.js"></script>
    </body>
    </html>`;
    return html;
}

app.get('/api/usuarios', (req, res) => {
    res.json(listaUsuarios);
});

app.listen(porta, host, () => {
    console.log(`Servidor executando na porta http://${host}:${porta}`);
});
