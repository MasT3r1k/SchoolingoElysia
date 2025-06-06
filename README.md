# Schoolingo API

Moderní REST API pro školní systém postavené na Elysia frameworku.

## Funkce

- 🚀 Vysoký výkon díky Bun runtime
- 🔒 Zabudovaná bezpečnost (XSS, CORS, Rate Limiting)
- 📚 Automatická dokumentace API (Swagger)
- 🎯 Typová bezpečnost s TypeScript
- 📝 Strukturované logování
- 🛠️ Vývojové nástroje (ESLint, Prettier)

## Požadavky

- Bun >= 1.0.0
- MySQL >= 8.0

## Instalace

1. Naklonujte repozitář:
```bash
git clone https://github.com/yourusername/schoolingo-elysia.git
cd schoolingo-elysia
```

2. Nainstalujte závislosti:
```bash
bun install
```

3. Vytvořte soubor `.env`:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=schoolingo
DB_CONNECTION_LIMIT=10
JWT_SECRET=your-secret-key-min-32-chars
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Vývoj

Spusťte vývojový server:
```bash
bun run dev
```

## Produkce

Sestavte a spusťte produkční server:
```bash
bun run build
bun run start
```

## Testování

Spusťte testy:
```bash
bun test
```

## Linting a formátování

```bash
bun run lint
bun run format
```

## Struktura projektu

```
src/
  ├── config/         # Konfigurační soubory
  ├── controllers/    # Route handlery
  ├── services/       # Business logika
  ├── repositories/   # Databázové operace
  ├── middleware/     # Middleware funkce
  ├── utils/          # Pomocné funkce
  ├── types/          # TypeScript typy
  └── constants/      # Konstanty
```

## Licence

MIT
