# Hena Books Frontend

A modern book showcase and reading platform built with Next.js 16, TypeScript, and Tailwind CSS.

## 🚀 Features

### Public Features
- **Landing Page** - Hero section, featured books, about section
- **Book Catalog** - Browse all books with search and pagination
- **Book Details** - View book information, stats, and metadata
- **PDF Reader** - Full-featured PDF reader with session tracking
- **Authentication** - Login and registration

### Admin Features
- **Dashboard Overview** - Platform statistics and insights
- **Book Management** - Upload, edit, and delete books
- **User Management** - View and manage users
- **Analytics** - Detailed book and reader analytics

## 📁 Project Structure

```
hena_books_front/
├── app/                          # Next.js App Router
│   ├── admin/
│   │   └── dashboard/            # Admin dashboard pages
│   │       ├── page.tsx          # Overview
│   │       ├── books/            # Book management
│   │       ├── users/            # User management
│   │       └── analytics/        # Analytics
│   ├── books/
│   │   ├── page.tsx              # Book catalog
│   │   └── [id]/
│   │       ├── page.tsx          # Book detail
│   │       └── read/
│   │           └── page.tsx      # PDF reader
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   └── page.tsx                  # Landing page
├── components/
│   ├── admin/                    # Admin components
│   │   └── AdminSidebar.tsx
│   ├── books/                    # Book-related components
│   │   └── BookCard.tsx
│   ├── ui/                       # shadcn/ui components
│   ├── About.tsx
│   ├── FeaturedBooks.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   └── Navbar.tsx
├── context/
│   └── AuthContext.tsx           # Authentication context
├── lib/
│   ├── api.ts                    # Axios instance
│   ├── services/                 # API service layer
│   │   ├── books.ts
│   │   ├── analytics.ts
│   │   └── users.ts
│   └── utils.ts                  # Utility functions
└── public/                       # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **PDF Viewer**: react-pdf
- **Notifications**: Sonner
- **Icons**: Lucide React

## 🎨 Design System

- **Primary Colors**: Deep Purple/Indigo theme
- **Accent Colors**: Amber/Gold
- **Effects**: Glassmorphism, smooth animations
- **Responsive**: Mobile-first approach

## 📡 API Integration

All API calls are organized in service files:
- `lib/services/books.ts` - Book operations
- `lib/services/analytics.ts` - Analytics and reading sessions
- `lib/services/users.ts` - User operations

## 🔐 Authentication

Authentication is handled via:
- JWT tokens stored in localStorage
- AuthContext for global state management
- Protected routes for admin and reader pages

## 🚦 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## 📝 Environment Variables

Make sure your backend API is running at `http://localhost:8000/api/v1`

## 🎯 Key Features Implementation

### Book Catalog
- Search functionality
- Pagination
- Responsive grid layout
- Loading states with skeletons

### PDF Reader
- Full-screen reading mode
- Zoom controls
- Page navigation
- Reading session tracking
- Time tracking

### Admin Dashboard
- Sidebar navigation
- Overview statistics
- Book upload with file handling
- User management
- Analytics dashboard

## 🎨 UI/UX Highlights

- Modern glassmorphism effects
- Smooth animations and transitions
- Consistent color scheme
- Responsive design
- Loading states
- Error handling with toast notifications
- Empty states

## 📦 Dependencies

Key dependencies:
- `next`: 16.1.1
- `react`: 19.2.3
- `react-pdf`: 10.3.0
- `axios`: 1.13.2
- `sonner`: 2.0.7
- `lucide-react`: 0.562.0
