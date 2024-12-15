# TAlkai247 Daily

A modern AI-powered communication platform that helps you manage and automate your daily conversations.

## Server Setup

### Prerequisites
- Node.js (v20.x recommended)
- PostgreSQL database
- npm or yarn

### Environment Variables
Create a `.env` file in the `server` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/talkai247"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="24h"

# OpenRouter
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
```

### Database Setup
1. Create a PostgreSQL database named `talkai247`
2. Run Prisma migrations:
```bash
cd server
npx prisma migrate deploy
```

### Installation & Running
1. Install dependencies:
```bash
cd server
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`.

### Managing the Server

#### Development Mode
When running in development mode (`npm run dev`), the server uses nodemon which provides several useful commands:

- `rs` - Restart the server (just type `rs` and press Enter in the terminal)
- `Ctrl + C` - Stop the server
- `npm run dev` - Start the server again

#### Using PM2 (Recommended for Better Process Management)
1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the server with PM2:
```bash
# From the server directory
pm2 start npm --name "talkai247" -- run dev
```

PM2 Commands:
```bash
pm2 list                # List all processes
pm2 stop talkai247     # Stop the server
pm2 restart talkai247  # Restart the server
pm2 logs talkai247     # View logs
pm2 delete talkai247   # Remove from PM2
pm2 monit              # Monitor all processes
pm2 save               # Save process list
```

To ensure PM2 restarts your processes after system reboot:
```bash
pm2 startup            # Generate startup script
pm2 save               # Save process list
```

### Authentication Endpoints

#### Register a New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

### Troubleshooting Common Issues

#### Port Already in Use
If you see `EADDRINUSE: address already in use :::3000`, run:
```bash
lsof -i :3000  # Find the process using port 3000
kill -9 <PID>  # Kill the process
```

#### TypeScript/Module Issues
If you encounter TypeScript or module-related errors:
1. Check `tsconfig.json` is configured for CommonJS:
```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node"
  }
}
```
2. Ensure import statements don't use .js extensions
3. Make sure `package.json` doesn't have `"type": "module"`

### Database Reset
If you need to reset the database:
1. Drop the existing database:
```sql
DROP DATABASE talkai247;
CREATE DATABASE talkai247;
```

2. Run migrations again:
```bash
npx prisma migrate reset --force
```

This will create a fresh database with the default schema and no data.

## Client Setup

[Client setup instructions to be added]

## License

[License information to be added]