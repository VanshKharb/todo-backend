# Todo Backend

Simple backend API for managing todos with authentication.

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT

## Setup

```bash
git clone https://github.com/<your-username>/todo-backend.git
cd todo-backend
npm install
```

Create a `.env` file:
```
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the server:
```bash
node index.js
```

Server runs on `http://localhost:3000`

## API

### POST /signup
```
{
  "email": "test@example.com",
  "password": "123456",
  "name": "Vansh"
}
```

### POST /signin
Returns JWT token
```
{
  "email": "test@example.com",
  "password": "123456"
}
```

### POST /todo
Headers:
```
token: <jwt_token>
```

Body:
```
{
  "title": "Sample todo",
  "done": false
}
```

### GET /todos
Headers:
```
token: <jwt_token>
```

## Notes
- `.env` is ignored
- JWT required for protected routes
- Use `npm install` after cloning
