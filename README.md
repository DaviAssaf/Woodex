# Woodex - Sistema de Registro de Espécies de Madeira

## Configuração

1. Crie o banco de dados MySQL executando o script `create_table.sql`.

2. Edite o arquivo `.env` na raiz do projeto com suas credenciais do banco de dados:

    ```
    DB_HOST=localhost
    DB_USER=seu_usuario
    DB_PASS=sua_senha
    DB_NAME=woodex_db
    ```

3. Certifique-se de que o servidor PHP tem acesso ao banco de dados.

## Estrutura do Projeto

- `client/`: Front-end em HTML/CSS/JS
- `server/`: Back-end em PHP com API
- `.env`: Arquivo de configuração de ambiente
- `create_table.sql`: Script para criar a tabela no banco

## Como Executar

1. Execute o script SQL no seu servidor MySQL.
2. Configure o .env com suas credenciais.
3. Abra o `client/public/index.html` no navegador (pode precisar de um servidor local para evitar CORS).

Para desenvolvimento, use um servidor PHP local como XAMPP ou similar.
