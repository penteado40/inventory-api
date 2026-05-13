# inventory-api

> ⚠️ Projeto em desenvolvimento ativo.

API REST multi-tenant para gestão de inventário — controle de entrada e saída de produtos com isolamento por loja.

## Stack

| Camada | Tecnologia |
|--------|------------|
| HTTP | Hono |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL + Prisma |
| Validação | Zod + `@hono/zod-validator` |
| Documentação | hono-openapi + Scalar |
| Auth | JWT HS256 (access 15min + refresh 7d) |

---

## Instalação e setup local

### Pré-requisitos

- Node.js
- Docker e Docker Compose

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/inventory-api.git
cd inventory-api
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações (veja a seção [Variáveis de ambiente](#variáveis-de-ambiente)).

### 3. Suba o banco de dados

```bash
docker compose up -d
```

### 4. Instale as dependências

```bash
npm install
```

### 5. Execute as migrations

```bash
npx prisma migrate dev
```

### 6. Rode o seed inicial

Cria o usuário admin e a loja padrão:

```bash
npm run seed
```

### 7. Inicie o servidor

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000/api`.
A documentação interativa (Scalar) estará em `http://localhost:3000/api/docs`.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ | URL de conexão com o PostgreSQL |
| `JWT_SECRET` | ✅ | Secret para assinar e verificar JWTs |
| `ADMIN_EMAIL` | ✅ | Email do admin padrão (seed) |
| `ADMIN_PASSWORD` | ✅ | Senha do admin padrão (seed) |
| `ADMIN_NAME` | ✅ | Nome do admin padrão (seed) |
| `DEFAULT_STORE_NAME` | ⚪ | Nome da loja padrão — default: `"Loja Principal"` |
| `DEFAULT_STORE_SLUG` | ⚪ | Slug da loja padrão — default: `"loja-principal"` |

---

## Arquitetura

### Fluxo de um request protegido

```
HTTP request
  → db middleware            injeta cliente de banco no contexto
  → cors middleware          headers CORS
  → [rotas públicas]         POST /auth/login, POST /auth/refresh
  → auth.middleware          verifica JWT, injeta jwtPayload
  → storeContext.middleware  resolve storeId do JWT ou X-Store-Id
  → validator                valida entrada via Zod
  → requireRole              checa permissão
  → controller               chama service, retorna { data }
  → service                  lógica de negócio, acesso ao banco
  → model mapper             formata resposta, omite campos sensíveis
  → onError global           HTTPException | ZodError | Error genérico
```

### Estrutura de pastas

```
src/
├── index.ts                        # Wiring: app, middlewares, routes
├── types.ts                        # AppEnv, AppVariables, tipos globais
├── controllers/                    # Handlers HTTP — sem lógica de negócio
├── services/                       # Lógica de negócio — sem HTTP
├── schemas/                        # Validação Zod de entrada HTTP
├── models/                         # Tipos TypeScript + mappers de resposta
├── middlewares/
│   ├── auth.middleware.ts           # Verifica JWT, injeta jwtPayload
│   ├── store-context.middleware.ts  # Resolve e injeta storeId
│   └── role.middleware.ts          # Factory requireRole(...roles)
├── routes/
│   ├── index.ts                    # Barrel — agrega todos os controllers
│   └── *.routes.ts                 # Re-export de cada controller
└── scripts/
    └── seed.ts                     # Cria admin + loja padrão
```

### Convenções

- Respostas de sucesso: `{ "data": ... }`
- Respostas de erro: `{ "errors": "..." }`
- URLs em inglês, substantivos no plural
- JSON em camelCase
- `storeId` nunca recebido via body — sempre extraído do contexto Hono
- Lógica de negócio e Prisma exclusivamente nos services

---

## Autenticação e Roles

A API usa JWT HS256 com dois tokens:

| Token | Validade |
|-------|----------|
| Access token | 15 minutos |
| Refresh token | 7 dias |

Todas as rotas (exceto `/auth/login` e `/auth/refresh`) exigem o header:

```http
Authorization: Bearer <access_token>
```

### Perfis de acesso

| Role | storeId no token | Acesso |
|------|-----------------|--------|
| `admin` | `null` | Global — filtra por loja via header `X-Store-Id` |
| `operator` | `number` | Restrito à própria loja |
| `viewer` | `number` | Restrito à própria loja (somente leitura) |

O `storeId` é resolvido automaticamente pelo middleware `storeContext` — admins podem alternar entre lojas enviando o header `X-Store-Id`.

---

## Endpoints

A documentação interativa completa está disponível em `/api/docs`. Abaixo, um mapa dos módulos disponíveis.

### Auth — `/api/auth`

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| `POST` | `/auth/login` | Login com email e senha | Pública |
| `POST` | `/auth/refresh` | Renova o access token | Pública |
| `POST` | `/auth/logout` | Invalida o refresh token | ✅ |
| `POST` | `/auth/switch-store` | Troca de loja ativa (admin) | ✅ |

### Users — `/api/users`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/users` | Lista usuários |
| `POST` | `/users` | Cria usuário |
| `GET` | `/users/:id` | Busca usuário por ID |
| `PUT` | `/users/:id` | Atualiza usuário |
| `DELETE` | `/users/:id` | Remove usuário |

### Stores — `/api/stores`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/stores` | Lista lojas |
| `POST` | `/stores` | Cria loja |
| `GET` | `/stores/:id` | Busca loja por ID |
| `PUT` | `/stores/:id` | Atualiza loja (slug imutável) |
| `DELETE` | `/stores/:id` | Desativa loja (soft delete) |

### Location Types — `/api/location-types`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/location-types` | Lista tipos de localização |
| `POST` | `/location-types` | Cria tipo de localização |
| `GET` | `/location-types/:id` | Busca por ID |
| `PUT` | `/location-types/:id` | Atualiza |
| `DELETE` | `/location-types/:id` | Remove (bloqueado se houver localizações vinculadas) |

### Locations — `/api/locations`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/locations` | Lista localizações |
| `POST` | `/locations` | Cria localização |
| `GET` | `/locations/:id` | Busca por ID |
| `PUT` | `/locations/:id` | Atualiza |
| `DELETE` | `/locations/:id` | Remove (bloqueado se houver produtos ou filhos vinculados) |

### Movement Types — `/api/movement-types`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/movement-types` | Lista tipos de movimento |
| `POST` | `/movement-types` | Cria tipo (`behavior` imutável após criação) |
| `GET` | `/movement-types/:id` | Busca por ID |
| `PUT` | `/movement-types/:id` | Atualiza nome |
| `DELETE` | `/movement-types/:id` | Remove (bloqueado se houver movimentos vinculados) |

### Products — `/api/products`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/products` | Lista produtos ativos |
| `POST` | `/products` | Cria produto |
| `GET` | `/products/:id` | Busca por ID |
| `PUT` | `/products/:id` | Atualiza produto |
| `DELETE` | `/products/:id` | Remove produto |

### Movements — `/api/movements`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/movements` | Lista movimentos |
| `POST` | `/movements` | Cria cabeçalho do movimento |
| `GET` | `/movements/:id` | Busca por ID |
| `PUT` | `/movements/:id` | Atualiza movimento |
| `DELETE` | `/movements/:id` | Cancela movimento (reverte itens não finalizados) |
| `POST` | `/movements/:id/items` | Adiciona item ao movimento |
| `PUT` | `/movements/:id/items/:itemId` | Atualiza item |
| `DELETE` | `/movements/:id/items/:itemId` | Remove/cancela item |
| `POST` | `/movements/:id/payments` | Registra pagamento |

### Stats — `/api/stats`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/stats` | Estatísticas de estoque e movimentos |

---

## Status de implementação

| Fase | Módulos | Status |
|------|---------|--------|
| 1 | Auth, Store, Seeds | ✅ Concluído |
| 2 | LocationTypes, Locations, MovementTypes | 🔄 Em progresso |
| 3 | Products | — |
| 4 | Movements, MovementItems, MovementPayments | — |
| 5 | Stats | — |

---

## Licença

Projeto pessoal. Todos os direitos reservados.