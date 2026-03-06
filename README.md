# Order API

API simples desenvolvida em Node.js com JavaScript e PostgreSQL para gerenciamento de pedidos.

## Funcionalidades

- Criar um novo pedido
- Buscar pedido por ID
- Listar todos os pedidos
- Atualizar um pedido existente
- Deletar um pedido

## Tecnologias utilizadas

- Node.js
- Express
- PostgreSQL
- dotenv
- pg
- nodemon

## Estrutura do projeto
```
order-api/
├─ controllers/
│  └─ orderController.js
├─ routes/
│  └─ orderRoutes.js
├─ sql/
│  └─ schema.sql
├─ utils/
│  └─ mapper.js
├─ .gitignore
├─ db.js
├─ package.json
├─ server.js

Como executar o projeto

1. Clonar o repositório
git clone <url-do-repositorio>
cd order-api

3. Instalar as dependências
npm install

4. Criar o banco de dados
Crie um banco PostgreSQL com o nome:
orderdb

5. Executar o script SQL
Execute o arquivo sql/schema.sql no banco para criar as tabelas:
Order
Items

6. Criar o arquivo .env
Crie um arquivo .env na raiz do projeto com o conteúdo:

PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=orderdb

6. Rodar a aplicação
npm run dev

A API estará disponível em:

http://localhost:3000
Endpoints
Criar pedido
POST /order

Exemplo de body:
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}

Buscar pedido por ID
GET /order/:orderId

Exemplo:
/order/v10089015vdb

Listar pedidos
GET /order/list

Atualizar pedido
PUT /order/:orderId

Deletar pedido
DELETE /order/:orderId

Mapeamento dos dados
A API recebe os dados no formato:

{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}

E transforma para o formato salvo no banco:
{
  "orderId": "v10089015vdb",
  "value": 10000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1,
      "price": 1000
    }
  ]
}

Respostas HTTP utilizadas:
201 Created para criação com sucesso
200 OK para leitura, atualização e remoção
400 Bad Request para payload inválido
404 Not Found para pedido não encontrado
409 Conflict para pedido já existente
500 Internal Server Error para erros inesperados

Autor
Giovana Tochtrop.
