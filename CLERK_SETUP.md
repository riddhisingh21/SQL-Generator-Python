# Clerk Authentication Setup Guide

Your SQL Generator now includes Clerk authentication with separate pages for history and schema management!

## 1. Create a Clerk Account

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up for a free account
3. Create a new application
4. Choose your preferred authentication methods (email, Google, GitHub, etc.)

## 2. Get Your Publishable Key

1. In your Clerk dashboard, go to "API Keys"
2. Copy the "Publishable Key"
3. Open the `.env` file in your project root
4. Replace `your_clerk_publishable_key_here` with your actual key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

## 3. Configure Authentication Methods

In your Clerk dashboard:
1. Go to "User & Authentication" → "Email, Phone, Username"
2. Enable your preferred sign-in methods
3. Configure social providers if desired (Google, GitHub, etc.)

## 4. Restart Your Development Server

After updating the `.env` file:

```bash
npm run dev
```

## 5. Test the Authentication

1. Open your application
2. You'll be redirected to the sign-in page
3. Create an account or sign in
4. Navigate between the different pages:
   - **Home**: SQL Generator with AI-powered query generation
   - **History**: View and manage your query history
   - **Schemas**: Save and manage database schemas

## Features

### 🔐 **Secure Authentication**
- Multiple sign-in options (email, social providers)
- Secure session management
- User profile management

### 📱 **Responsive Navigation**
- Clean navigation bar with user menu
- Mobile-friendly design
- Theme toggle (dark/light mode)

### 👤 **User-Specific Data**
- Each user has their own query history
- Personal schema collections
- Data isolation between users

### 🎨 **Modern UI**
- Consistent styling across all pages
- Dark mode support
- Intuitive user experience

## Pages Overview

### Home Page (`/`)
- Main SQL generator interface
- AI-powered query generation with Gemini
- Schema selection and dialect options

### History Page (`/history`)
- View all your generated queries
- Copy SQL to clipboard
- Delete individual queries or clear all
- Expandable query details with explanations

### Schema Page (`/schemas`)
- Save and manage database schemas
- Edit existing schemas
- Use schemas in query generation

## Security Notes

- Never commit your `.env` file to version control
- Your Clerk publishable key is safe to use in frontend applications
- User data is stored locally but isolated per user
- Clerk handles all authentication security

## Troubleshooting

- **"Missing Publishable Key" error**: Make sure you've set `VITE_CLERK_PUBLISHABLE_KEY` in your `.env` file
- **Authentication not working**: Check that your Clerk app is configured correctly
- **Data not persisting**: Ensure you're signed in and the user ID is available

## Next Steps

1. Customize the authentication flow in your Clerk dashboard
2. Add more social providers if needed
3. Configure user profile fields
4. Set up webhooks for advanced user management (optional)
