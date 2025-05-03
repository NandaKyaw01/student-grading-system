# 🎓 UCSH Student Grading System

A modern web application for managing student grades at the **University of Computer Studies, Hinthada (UCSH)**. Built using **Next.js**, **Prisma**, **Tailwind CSS**, and **shadcn/ui** for a fast, scalable, and user-friendly experience.

---

## 🚀 Tech Stack

- **[Next.js 15](https://nextjs.org/)** – Full-stack React framework
- **[Prisma ORM](https://www.prisma.io/)** – Type-safe database access
- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.dev/)** – Prebuilt UI components with Radix & Tailwind
- **TypeScript** – Safer and predictable codebase

---

## 📦 Full Project Setup Guide

Follow these steps to get the project running locally.

---

### ✅ 1. Clone the Repository

```bash
git clone https://github.com/your-username/ucsh-grading-system.git
cd ucsh-grading-system
```

### ✅ 2. Install Dependencies

```bash
npm install
```

### ✅ 3. Create Environment Variables

Create a .env file at the project root and configure the database and secret keys:

```bash
# .env

# Prisma Database URL (PostgreSQL example)
DATABASE_URL="postgresql://user:password@localhost:5432/ucsh_grading"

# Optional: other envs
```

### ✅ 4. Set Up the Database with Prisma

a. Generate the Prisma Client

```bash
npx prisma generate
```

b. Create Database & Apply Migrations

```bash
npx prisma migrate dev --name init
```

c. (Optional) Seed the Database

```bash
npx prisma db seed
```

### ✅ 5. Run the Development Server

```bash
npm run dev
```

### 🗂️ Folder Structure

```bash
.
├── .vscode/                 # VSCode settings
├── public/                  # Static assets
│   └── assets/
│       └── image/
├── src/                     # Source code
│   ├── app/                 # Next.js App Router pages and routes
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Database helpers, utilities, config
│   │   └── prisma.ts        # Prisma client setup
│   └── styles/              # Tailwind & global CSS
│       └── globals.css
├── prisma/                  # Prisma schema and migrations
│   ├── schema.prisma
│   └── seed.ts              # Optional seed script
├── .env                     # Local environment variables
├── tailwind.config.ts       # Tailwind CSS configuration
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── .prettierrc              # Prettier configuration
├── eslint.config.mjs        # ESLint configuration
└── package.json             # Project metadata and scripts
```

### 🧪 Sample Prisma Model (Example)

```bash
model Student {
  id        String   @id @default(cuid())
  name      String
  rollNo    String   @unique
  grades    Grade[]
}

model Grade {
  id         String   @id @default(cuid())
  subject    String
  score      Int
  studentId  String
  student    Student  @relation(fields: [studentId], references: [id])
}
```

### 🏫 About UCSH

This platform was developed for the University of Computer Studies, Hinthada to digitize and streamline the grading process.

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
