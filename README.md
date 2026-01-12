# Warehouse Management System

## Tech Stack
- Frontend: Angular 21 (Standalone Components, Angular Material)
- Backend: Node.js (Express)
- Auth: Bearer Token (External API)

## Features
- Login with external API
- Protected route with AuthGuard
- Items list from external API (read-only)
- Local items CRUD (Create, Update, Delete)
- Search & filter
- Export CSV (All / Local)

## Architecture
- Standalone Angular components
- HTTP Interceptor for Authorization header
- AuthGuard for route protection
- Data normalization in frontend (API + local items)

## Prerequisites
- Node.js >= 18
- npm >= 9
- Angular CLI (optional): `npm install -g @angular/cli`

## How to Run

### Backend
Runs at: http://localhost:3001

```bash
cd backend
npm install
npm run dev
```

### Frontend

Runs at: http://localhost:4200

```bash
cd frontend/warehouse-frontend
npm install
ng serve
```

## Login Credential (Provided by Test)
Email: programmer@da
Password: Prog123!

## API Notes

### External API
Requires Header :
- Authorization: Bearer <api_token>
### Endpoint Login : POST https://auth.srs-ssms.com/api/dev/login
### Endpoint List items : GET https://auth.srs-ssms.com/api/dev/list-items

### Local Backend (CRUD)
Base URL: http://localhost:3001

get list item from local API :
### Endpoint : GET /local-items

create item from local API :
### Endpoint : POST /local-items
Request Body :

```json
{
  "name": "Obeng",
  "stock": 10,
  "unit": "Pcs"
}
```
update item from local API :
### Endpoint : PUT /local-items/:id

delete item from local API :
### Endpoint : DELETE /local-items/:id
