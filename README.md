# Banking API

Uma API simples para realizar o controle de contas e saldos. 

## Tabela de Conteúdos

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Testes](#testes)
- [Rotas](#rotas)

## Pré-requisitos

Certifique-se de ter os seguintes softwares instalados em sua máquina:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## Instalação

1. Clone o repositório:

    ```sh
    git clone https://github.com/ricardoltt/banking-api.git
    ```

2. Entre na pasta do projeto e instale as dependências:

    ```sh
    npm install
    ```

## Configuração

1. Copie o arquivo de exemplo de variáveis de ambiente .env e .env.test:

    Edite o arquivo `.env` com as configurações do seu banco de dados e outras variáveis necessárias. Nesse projeto, foi escolhido o sqlite pra manter o banco de dados em formato de arquivos dentro do projeto, sem a necessidade de subir um servidor.

    ```dotenv
    NODE_ENV=
    DATABASE_URL=
    ```

    No caso do .env.test, não precisamos adicionar o NODE_ENV.

2. Execute as migrações do banco de dados para criar as tabelas necessárias, conforme o script criado no package.json:

    ```sh
    npm run knex -- migrate:latest
    ```

## Execução

Para rodar o servidor de desenvolvimento, utilize o script "dev" pra utilizar a lib tsx para rodar o projeto:

    ```sh
    npm run dev
    ```

## Testes

Para rodar os testes:

    ```sh
    npm test
    ```

O servidor estará disponível em http://localhost:3333

Exportei a collection utilizada para testar as rotas, disponível no arquivo 'collections.json' do projeto.

# Descrição das Rotas da API

Este documento descreve as rotas disponíveis na API, conforme definido na collection do Insomnia.

## Base URL

http://localhost:3333/api/v1


## Rotas

### 1. Criar Conta

- **Endpoint:** `POST /accounts`
- **Descrição:** Cria uma nova conta.
- **Body:**
    ```json
    {
        "account_number": "123"
    }
    ```
- **Headers:**
    - `Content-Type: application/json`

### 2. Criar Depósito

- **Endpoint:** `POST /accounts/1234/deposit`
- **Descrição:** Cria um depósito em uma conta existente.
- **Body:**
    ```json
    {
        "amount": 1000
    }
    ```
- **Headers:**
    - `Content-Type: application/json`

### 3. Criar Transferência

- **Endpoint:** `POST /accounts/transfer`
- **Descrição:** Cria uma transferência entre contas.
- **Body:**
    ```json
    {
        "amount": 200,
        "from": "1234",
        "to": "123"
    }
    ```
- **Headers:**
    - `Content-Type: application/json`

### 4. Obter Detalhes da Conta

- **Endpoint:** `GET /accounts/1234`
- **Descrição:** Obtém os detalhes de uma conta específica.

### 5. Obter Saldo da Conta

- **Endpoint:** `GET /accounts/1234/balance`
- **Descrição:** Obtém o saldo de uma conta específica.

### 6. Obter Transferências da Conta

- **Endpoint:** `GET /accounts/123/transfers`
- **Descrição:** Obtém as transferências de uma conta específica.

### 7. Login

- **Endpoint:** `POST /login`
- **Descrição:** Realiza login na aplicação. Essa rota é utilizada caso precise utilizar as outras rotas para um account_number diferente. O login é "realizado" automaticamente ao criar a conta.
- **Body:**
    ```json
    {
        "account_number": "123"
    }
    ```
- **Headers:**
    - `Content-Type: application/json`

### 8. Obter Descrição

- **Endpoint:** `GET /description`
- **Descrição:** Obtém a descrição do serviço.