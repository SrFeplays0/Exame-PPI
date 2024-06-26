import path from 'path';
import express from 'express';

const porta = 3000;
const host = '0.0.0.0';

let listaUsuarios = [];

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), ' publico')));

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
    }
    else {
        resposta.write(`<!DOCTYPE html>
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
        <form action="/cadastroUsuario.html" method="POST">
            <div class="form-group">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" name="nome">`);
        if (nome == "") {
            resposta.write(`
                <div class="alert" id="alert">Por favor, informe o nome de usuario.</div>
                `);
        }
        resposta.write(`
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email">`)
        if (email == "") {
            resposta.write(`
                <div class="alert" id="alert">Por favor, informe o email.</div>
                `);
        }
        resposta.write(`
            </div>
            <div class="form-group">
                <label for="senha">Senha:</label>
                <input type="password" id="senha" name="senha">`)
        if (senha == "") {
            resposta.write(`
                <div class="alert" id="alert">Por favor, informe a senha.</div>
                `);
        }
        resposta.write(` </div>
            <button type="submit">Registrar</button>
        </form>
        <button class="back-button" onclick="window.location.href='index.html'">Voltar</button>
    </div>
</body>
</html>`);
        resposta.end();
    }
}

app.post('/cadastroUsuario', cadastroUsuario);;


app.listen(porta, host, () => {
    console.log(`Servidor executando na porta http:${host}:${porta}`);
})