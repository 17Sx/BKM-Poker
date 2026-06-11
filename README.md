# BKM Poker

A modern poker bankroll management platform built with Next.js, Drizzle ORM, and Neon PostgreSQL.

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/17Sx/BKM-Poker.git
```

2. Enter the project directory

```bash
cd BKM-Poker
```

3. Prepare environment variables

```bash
copy .env.example .env.local
```

Generate a random secret (min 32 characters) for `BETTER_AUTH_SECRET`.

For local development, start the Postgres container:

```bash
bun run docker:up
```

Use the default `DATABASE_URL` from `.env.example`, or create a [Neon](https://neon.tech) project for production.

4. Install dependencies

```bash
bun install
```

5. Push the database schema

```bash
bun run db:push
```

6. Start the development server

```bash
bun dev
```

The app serves on `http://localhost:3000`.

## License

This project is licensed under the MIT License.
