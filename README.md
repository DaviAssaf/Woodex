# Woodex

Sistema de registro de especies de madeira com autenticacao por usuario e senha.

## Visao Geral

- Tela de login em `index.html` na raiz do projeto
- Front-end principal em `client/public/index.html`
- API PHP em `server/public/api.php`
- Banco MySQL com tabelas `users` e `woods`

## Requisitos

- PHP com extensao `mysqli`
- MySQL
- Servidor local como XAMPP, Laragon ou similar

## Configuracao do Banco

Crie ou ajuste as tabelas necessarias no MySQL.

### Tabela `users`

Campos esperados:

- `id`
- `username`
- `password`

O campo `password` deve armazenar hash `bcrypt`.

Exemplo para gerar a senha no PHP:

```php
password_hash('minha_senha', PASSWORD_BCRYPT);
```

Também pode ser feito usando um conversor para bcrypt online

### Tabela `woods`

Campos esperados:

- `id`
- `popular_name`
- `cientific_name`
- `category`

## Configuracao do Ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais do banco:

```env
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=woodex_db
```

O backend tambem pode ler configuracoes por `server/config/database.php`, se esse arquivo existir.

## Estrutura do Projeto

- `index.html`: tela de login
- `client/`: arquivos HTML, CSS e JS do front-end
- `server/`: API, controllers, models e configuracao
- `.env`: credenciais do banco

## Como Executar

1. Configure o banco MySQL com as tabelas `users` e `woods`.
2. Crie o arquivo `.env` na raiz do projeto.
3. Inicie o servidor PHP no ambiente local.
4. Acesse `index.html` na raiz do projeto.
5. Faça login para acessar o cadastro de especies.

## Fluxo de Login

- O usuario entra pela pagina `index.html`
- O login consulta a tabela `users`
- A senha digitada e validada com `password_verify()`
- O sistema aceita hashes `bcrypt` com prefixo `$2a$`, `$2b$` e `$2y$`
- A sessao e mantida no backend em PHP

## Observacoes

- Sem login ativo, a tela principal redireciona para `index.html`
- As operacoes de listar, criar, editar e remover especies exigem autenticacao
- O projeto usa um estilo visual simples e consistente entre login e area principal
