# Web3LMS Frontend 🎨

> Modern Next.js 14 frontend for the Web3LMS Learning Management System

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Authentication**: JWT with Cookie-based storage
- **Rich Text Editor**: CKEditor
- **Video Player**: React Player
- **Animations**: Framer Motion
- **Icons**: Lucide React

## ✨ Features

### 🎓 Student Features
- Browse and search courses
- Shopping cart with Razorpay payment integration
- Course enrollment and progress tracking
- Video lessons with progress markers
- Quiz taking and assessment
- Certificate generation and download
- NFT minting for course completion
- Wishlist management
- Course reviews and ratings
- Q&A discussions

### 🧑‍🏫 Instructor Features
- Course creation and management
- Rich content editor (CKEditor)
- Video and file uploads
- Curriculum builder with modules and lectures
- Quiz creation and management
- Student analytics and tracking
- Earnings dashboard
- Coupon management
- Review management

### 🌐 General Features
- Responsive design for all devices
- Dark mode support
- Real-time notifications
- Certificate verification
- Wallet integration for blockchain features
- Multi-language support ready

## 🛠️ Setup & Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

### Installation

```bash
# Navigate to frontend directory
cd frontend/next14frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Running Locally

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
frontend/next14frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (base)/            # Public pages
│   │   ├── student/           # Student dashboard
│   │   ├── instructor/        # Instructor dashboard
│   │   └── courses/           # Course pages
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── student/          # Student-specific components
│   │   └── instructor/       # Instructor-specific components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── providers/             # Context providers
│   ├── store/                 # Zustand state management
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Helper utilities
│   │   ├── axios.ts          # API client configuration
│   │   ├── auth.ts           # Authentication utilities
│   │   └── constants.ts      # App constants
│   └── views/                 # Complex view components
├── public/                    # Static assets
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1/
NEXT_PUBLIC_MINT_API_BASE_URL=https://vinitmint.vercel.app/

# Payment
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## 🎨 UI Components

The project uses [shadcn/ui](https://ui.shadcn.com/) for consistent, accessible components:

- Cards, Buttons, Inputs
- Dialogs, Dropdowns, Modals
- Tables, Tabs, Tooltips
- Carousels, Badges, Avatars
- And many more...

## 🔐 Authentication Flow

1. User logs in via `/login`
2. JWT tokens stored in cookies
3. Middleware checks authentication on protected routes
4. Automatic token refresh on expiry
5. Redirect to login if unauthorized

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Optimized for all screen sizes
- Touch-friendly interfaces

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 🧪 Testing

```bash
# Run tests (when configured)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📝 License

This project is licensed under the GPL License

## 🙌 Credits

- Built with [Next.js 14](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
