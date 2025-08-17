# 🏰 Adventure Academy

Welcome to **Adventure Academy**, where learning becomes an epic adventure! This is a gamified educational platform that transforms life skills learning into magical quests and exciting challenges.

## 🌟 Overview

Adventure Academy is a React-based web application that provides an immersive learning experience for children, teaching essential life skills through gamified adventures. Students explore magical worlds, complete quests, and earn rewards while mastering skills like time management, emotional intelligence, financial literacy, and wellness.

## 🚀 Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** components library
- **React Router DOM** for navigation
- **Lucide React** for icons

### Backend & Database

- **Supabase** for backend services
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row-level security

### AI & Integrations

- **Google Gemini AI** for content generation
- **YouTube API** for video content
- **YouTube Transcript** for content processing

### Development Tools

- **ESLint** for code linting
- **TypeScript** for type safety
- **PostCSS** for CSS processing
- **Vite** for development server

## 🎯 Features

### 🌍 Magical Learning Worlds

- **World of Time**: Master scheduling, punctuality, and time management
- **World of Emotions**: Learn emotional intelligence and social skills
- **World of Money**: Discover budgeting, saving, and financial responsibility
- **World of Wellness**: Build healthy habits and self-care routines

### 🎮 Gamified Learning System

- **Interactive Quizzes**: Fun MCQs and true/false challenges
- **Progress Tracking**: Real-time progress monitoring
- **Achievement System**: Badges, points, and leaderboards
- **Parent Dashboard**: Track child's progress and set limits

### 👥 User Roles

- **Students**: Complete quests and earn rewards
- **Parents**: Monitor progress and manage settings
- **Admins**: Manage content and user accounts

### 📊 Analytics & Reporting

- **Real-time Progress Tracking**
- **Detailed Analytics Dashboard**
- **Performance Reports**
- **Achievement Certificates**

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sadiya-125/Adventure-Academy.git
   cd Adventure-Academy
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   VITE_GEMINI_API_KEY=your_google_gemini_api_key
   VITE_YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 📁 Project Structure

```
adventure-academy/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── app/
│   │   └── api/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── ui/
│   │   └── ...
│   ├── contexts/
│   ├── hooks/
│   ├── integrations/
│   │   └── supabase/
│   ├── lib/
│   ├── pages/
│   └── styles/
├── supabase/
│   ├── config.toml
│   └── migrations/
├── package.json
├── README.md
└── ...
```

## 🎮 Getting Started

### For Students

1. Visit the application
2. Click "Start Your Quest" to register
3. Choose your first world to explore
4. Complete quests and earn rewards
5. Track your progress in the dashboard

### For Parents

1. Register as a parent
2. Add your child as a student
3. Monitor progress through the parent dashboard
4. Set limits and manage settings

Built with ❤️ by Sadiya Maheen Siddiqui
