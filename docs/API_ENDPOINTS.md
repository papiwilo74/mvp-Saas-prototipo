# API REST

Base local: `http://localhost:4000/api`

## Salud

- `GET /health`

## Autenticacion

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` requiere JWT

## Menu publico

- `GET /menu?restaurant=demo-burger`

## Configuracion del restaurante

- `GET /restaurant-config?restaurant=demo-burger`
- `PUT /restaurant-config` requiere admin

## Pedidos

- `POST /orders` crea pedido publico o autenticado
- `GET /orders/mine` requiere JWT
- `GET /orders/admin` requiere admin
- `PATCH /orders/:id/status` requiere admin

Estados: `PENDING`, `PREPARING`, `ON_THE_WAY`, `DELIVERED`, `CANCELLED`.
Pagos simulados: `CASH`, `NEQUI`, `CARD`.

## Categorias

- `GET /categories` requiere admin
- `POST /categories` requiere admin

## Productos

- `GET /products` requiere admin
- `POST /products` requiere admin
- `PUT /products/:id` requiere admin
- `DELETE /products/:id` requiere admin
