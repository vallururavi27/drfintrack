# DrFinTrack - Personal Finance Web Application

DrFinTrack is a modern personal finance management web application designed to help users track their finances, manage investments, and gain insights into their spending habits.

## Features

- **Secure Authentication**: Email verification and two-factor authentication (2FA)
- **Dashboard**: Overview of financial status with key metrics and visualizations
- **Banking**: Manage multiple bank accounts and track balances
- **Transaction Management**: Track income and expenses with categorization
- **Investments**: Track investment portfolio and performance
- **Reports**: Generate financial reports and visualize data
- **Data Export**: Export data in Excel and PDF formats
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- Recharts for data visualization
- Heroicons for icons

### Backend
- Supabase (PostgreSQL database, Authentication, Storage)
- Row Level Security (RLS) for data protection
- Edge Functions for custom server logic

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Note your Supabase URL and anon key from the API settings
3. Run the database schema setup:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/schema.sql`
   - Create a new query, paste the SQL, and run it
4. Configure authentication:
   - Go to Authentication → Settings
   - Enable Email Signup
   - Set up your Site URL (your frontend URL)
   - Customize email templates for confirmation and password reset

### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Create a `.env.local` file in the frontend directory:
   ```
   REACT_APP_SUPABASE_URL=https://bqurvqysmwsropdaqwot.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application at:
   - Frontend: http://localhost:5173

### Authentication
The application uses Supabase Authentication for secure user management.

## Project Structure

```
drfintrack/
├── frontend/                # React frontend
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── index.js         # Entry point
│   └── package.json         # Dependencies
├── supabase/                # Supabase configuration
│   └── schema.sql           # Database schema
└── README.md                # Project documentation
```

## Security Features

- **Email Verification**: Ensures users provide valid contact information
- **Two-Factor Authentication**: Adds an additional layer of security
- **Backup Codes**: Provides emergency access if a user loses their authenticator device
- **Login History**: Tracks login attempts for security monitoring
- **Row Level Security**: Ensures users can only access their own data

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables for Supabase URL and anon key
4. Deploy with a single click

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Supabase](https://supabase.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)
