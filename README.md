# Bitespeed Identity Reconciliation Service

🌐 **Live Demo:** [https://bitespeed-zeta.vercel.app/](https://bitespeed-zeta.vercel.app/)

The service uses a hierarchical contact linking system:
- **Primary Contacts**: The main contact record that serves as the consolidation point
- **Secondary Contacts**: Related contacts that are linked to a primary contact
- **Automatic Linking**: When contacts share email/phone, they're automatically linked under a single primary contact

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bitespeed-identity-reconciliation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/bitespeed_db"
   PORT=3000
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npm prisma migrate dev
   ```

5. **Build and Start**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## 📡 API Documentation

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Bitespeed Identity Reconciliation Service is running"
}
```

### Identify Contact
```http
POST /identify
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["user@example.com", "user.alt@example.com"],
    "phoneNumbers": ["+1234567890", "+0987654321"],
    "secondaryContactIds": [2, 3]
  }
}
```

**Notes:**
- At least one of `email` or `phoneNumber` must be provided
- Returns consolidated contact information including all linked emails and phone numbers

## 💡 Usage Examples

### Example 1: New Contact
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "phoneNumber": "+1234567890"}'
```

### Example 2: Linking Existing Contacts
```bash
# First contact
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'

# Second contact with same email - will be linked
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "phoneNumber": "+1234567890"}'
```

## 🗄️ Database Schema

The service uses a single `Contact` table with the following structure:

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key (auto-increment) |
| phoneNumber | String | Contact's phone number |
| email | String | Contact's email address |
| linkedId | Integer | Reference to primary contact |
| linkPrecedence | Enum | Either 'primary' or 'secondary' |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| deletedAt | DateTime | Soft delete timestamp |

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run test suite |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port number | 3000 |

### Database Configuration

The service uses PostgreSQL with Prisma ORM. You can modify the database configuration in `prisma/schema.prisma`.

## 🏃‍♂️ Development

### Project Structure
```
src/
├── index.ts          # Main application entry point
├── types.ts          # TypeScript type definitions
├── database.ts       # Database connection and operations
└── contactService.ts # Core business logic

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migration files
```

### Adding New Features

1. Define types in `src/types.ts`
2. Add database operations in `src/database.ts`
3. Implement business logic in `src/contactService.ts`
4. Add API endpoints in `src/index.ts`

### Environment Setup for Production

Ensure these environment variables are set in your production environment:
- `DATABASE_URL`: Your production PostgreSQL connection string
- `PORT`: Port number (usually provided by hosting platform)

## ❤️ Support

For support, please open an issue on GitHub or contact the development team.