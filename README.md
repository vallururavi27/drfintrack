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
- Firebase (Firestore database, Authentication, Storage)
- Firestore Security Rules for data protection
- Cloud Functions for custom server logic

### Legacy Backend (Being Migrated)
- Supabase (PostgreSQL database, Authentication, Storage)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database:
   - Go to Firestore Database in your Firebase console
   - Create database in production mode
   - Choose a location close to your users
3. Set up Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password provider
   - Configure password requirements
4. Set up Security Rules:
   - Go to Firestore Database → Rules
   - Use the security rules from `firestore.rules`
5. Create a Web App:
   - Click on the web icon (</>) in the project overview
   - Register your app and get your Firebase configuration

### Supabase to Firebase Migration

1. Install required packages:
   ```
   npm install firebase-admin @supabase/supabase-js
   ```

2. Generate a Firebase service account key:
   - Go to Firebase Console → Project settings → Service accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-service-account.json` in the project root

3. Run the migration script:
   ```
   node migrate-data-to-firebase.js
   ```

### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Create a `.env.local` file in the frontend directory:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application at:
   - Frontend: http://localhost:5173

### Authentication
The application uses Firebase Authentication for secure user management.

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
├── firebase/                # Firebase configuration
│   ├── firestore.rules      # Firestore security rules
│   └── firestore.indexes.json # Firestore indexes
└── README.md                # Project documentation
```

## Security Features

- **Email Verification**: Ensures users provide valid contact information
- **Two-Factor Authentication**: Adds an additional layer of security
- **Backup Codes**: Provides emergency access if a user loses their authenticator device
- **Login History**: Tracks login attempts for security monitoring
- **Firestore Security Rules**: Ensures users can only access their own data

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables for Firebase configuration
4. Deploy with a single click

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Supabase](https://supabase.com/) (Legacy)
- [TailwindCSS](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)
