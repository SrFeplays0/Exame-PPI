document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/usuarios')
        .then(response => response.json())
        .then(data => {
            const recipientSelect = document.getElementById('recipient');
            recipientSelect.innerHTML = ''; // Limpar o select antes de adicionar as opções
            data.forEach(user => {
                const option = document.createElement('option');
                option.value = user.email;
                option.textContent = user.nome;
                recipientSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao carregar usuários:', error));
});

document.getElementById('chatForm').addEventListener('submit', (event) => {
    event.preventDefault();  // Impede o envio tradicional do formulário
    sendMessage();
});

function sendMessage() {
    const recipient = document.getElementById('recipient').value;
    const message = document.getElementById('message').value;

    if (message.trim() !== '') {
        fetch('/postarMensagem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `recipient=${encodeURIComponent(recipient)}&message=${encodeURIComponent(message)}`
        })
        .then(response => response.text())
        .then(data => {
            document.open();
            document.write(data);
            document.close();
        })
        .catch(error => console.error('Erro ao enviar mensagem:', error));
    }
}
