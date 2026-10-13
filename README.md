# 🎓 UCSH Student Grading System

A full-stack web application designed for the **University of Computer Studies, Hinthada (UCSH)** to digitize, streamline, and manage academic curriculum, student enrollments, grade processing, and result certification.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.dev/) & [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/), [Prisma ORM 6](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) (English `en` & Myanmar `mm`)
- **State & Data**: [TanStack Query](https://tanstack.com/query), [TanStack Table](https://tanstack.com/table), [Zustand](https://zustand-demo.pmnd.rs/), [Nuqs](https://nuqs.47ng.com/)
- **Reporting & Export**: [xlsx-js-style](https://github.com/gitbrent/xlsx-js-style) (Excel import/export), [Puppeteer](https://pptr.dev/) & [docx-templates](https://github.com/guillermorr/docx-templates)
- **Code Quality**: TypeScript 5, ESLint 9 (Native Flat Config), Prettier, Commitlint & Husky

---

## ✨ Features

- **Academic Structure Management**: Configure academic years, semesters, and departments (CST, CS, CT) across all academic year levels.
- **Curriculum & Grading Scales**: Manage subjects with customizable credit hours, exam weights, assignment weights, and grading rubrics (`A+` to `F`).
- **Student Enrollment**: Register students, manage status, and track semester-specific enrollments.
- **Result & Grade Computation**: Record marks, automatically compute subject grades, GPA, and CGPA with ranking and performance analytics.
- **Bulk Excel Import & Export**: Import student results in bulk from spreadsheet templates and export structured marksheets.
- **PDF & Certificate Generation**: Automated report generation and grading certification with template support.
- **Bilingual Interface**: Full internationalization for English and Myanmar languages with language switcher.
- **Theme Support**: Seamless Dark, Light, and System themes.

---

## 📦 Getting Started

### Prerequisites

- **Node.js**: `20.x` or higher
- **Package Manager**: `npm` (v10+)
- **Database**: PostgreSQL (v14+)

---

### 1. Clone the Repository

```bash
git clone https://github.com/NandaKyaw01/student-grading-system.git
cd student-grading-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root based on `env.example.txt`:

```env
APP_URL=http://localhost:3000
VERCEL_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-nextauth-secret

# PostgreSQL Database Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/student_grading_system?schema=public"
DATABASE_URL_UNPOOLED="postgresql://postgres:password@localhost:5432/student_grading_system?schema=public"
```

> [!TIP]
> If your database password includes special characters (like `@`, `#`, `%`), remember to URL-encode them (e.g. `@` becomes `%40`).

---

### 4. Database Setup & Seeding

Sync the database schema and seed the initial data:

```bash
# Push schema to PostgreSQL and generate Prisma client
npx prisma db push

# (Alternatively) Run migrations
npx prisma migrate deploy

# Seed initial academic years, semesters, classes, subjects, grade scales, and admin user
npm run prisma:seed
```

#### Default Admin Credentials

- **Email**: `admin@ucsh.edu.mm`
- **Password**: `admin123`

---

### 5. Run the Application

#### Development Mode (Turbopack)

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

#### Production Build & Start

```bash
npm run build
npm start
```

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Deploys database migrations and compiles production build |
| `npm start` | Starts the production server |
| `npm run type-check` | Runs TypeScript type checking via `tsc -b` |
| `npm run lint` | Runs ESLint 9 Flat Config across the codebase |
| `npm run lint:fix` | Automatically fixes autofixable ESLint errors |
| `npm run format` | Formats all files with Prettier |
| `npm run prisma:push` | Pushes Prisma schema changes directly to the database |
| `npm run prisma:migrate` | Creates and applies new Prisma migrations |
| `npm run prisma:seed` | Populates the database with initial seed records |
| `npm run prisma:reset-dev` | Resets the database and reseeds development data |

---

## 🗂️ Project Structure

```text
student-grading-system/
├── prisma/
│   ├── schema.prisma            # Prisma database models
│   ├── seed.ts                  # Database seeding script
│   └── migrations/              # Database migration history
├── public/                      # Static assets, fonts, icons, manifest
├── src/
│   ├── actions/                 # Next.js Server Actions (CRUD, revalidation)
│   ├── app/                     # App Router pages, layouts, and API routes
│   │   ├── [locale]/            # Internationalized route tree
│   │   │   ├── admin/           # Administrative portal (dashboard, classes, results)
│   │   │   ├── auth/            # Authentication pages (login)
│   │   │   ├── search/          # Public result search
│   │   │   └── page.tsx         # Home landing page
│   │   └── api/                 # Backend API routes (NextAuth, file serving)
│   ├── components/              # Reusable React UI components
│   │   ├── admin-panel/         # Sidebar, navbar, layout components
│   │   ├── data-table/          # TanStack Table components & pagination
│   │   └── ui/                  # shadcn/ui components (Radix primitives)
│   ├── hooks/                   # Custom React hooks
│   ├── i18n/                    # next-intl configuration & routing
│   ├── lib/                     # Database client, auth options, utilities, schemas
│   └── types/                   # TypeScript definitions
├── eslint.config.mjs            # ESLint 9 Flat Config
├── next.config.ts               # Next.js 16 configuration
├── tsconfig.json                # TypeScript compiler configuration
└── package.json                 # Project dependencies and npm scripts
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
