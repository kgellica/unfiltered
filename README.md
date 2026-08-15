# unfiltered — A Digital Journaling Sanctuary

**Unfiltered** is a full-stack digital journaling platform designed to provide a safe, cozy space for recording daily thoughts, mood tracking, and personal reflections. Built as a monorepo, it seamlessly connects a Laravel API backend with web and mobile clients.

---

## Repository Structure

```text
unfiltered/
├── unfiltered-api/       # Laravel Sanctum RESTful API & MySQL Database
├── unfiltered-web/       # React (Vite) + Tailwind CSS Web Client
└── unfiltered-mobile/    # React Native (Expo Router) Mobile Application
```

## Features

* **Authentication:** Secure email/password login and Google OAuth integration via Laravel Sanctum.
* **Journal Entries:** Rich creation, editing, and organization of daily diary entries.
* **Cross-Platform:** Access your journal seamlessly via web or mobile device.
* **Cozy UI/UX:** Warm, pastel-themed interface built for a distraction-free writing experience.

## Tech Stack

### Backend — `unfiltered-api`

* **Framework:** Laravel 11
* **Authentication:** Laravel Sanctum & Laravel Socialite
* **Database:** MySQL

### Web Frontend — `unfiltered-web`

* **Framework:** React + Vite
* **Styling:** Tailwind CSS & Lucide Icons
* **OAuth:** `@react-oauth/google`
* **HTTP Client:** Axios

### Mobile App — `unfiltered-mobile`

* **Framework:** React Native + Expo (Expo Router)
* **Styling:** React Native Stylesheets & Themed Components

## Quick Start & Local Setup

### Prerequisites

Make sure you have the following installed:

* PHP >= 8.2
* Composer
* Node.js >= 18.x
* npm
* MySQL

### 1. Backend Setup — `unfiltered-api`

```bash
cd unfiltered-api

# Install dependencies
composer install

# Create environment configuration
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database credentials and Google OAuth in .env
# DB_DATABASE=unfiltered_db
# GOOGLE_CLIENT_ID=your_client_id
# GOOGLE_CLIENT_SECRET=your_client_secret

# Run database migrations
php artisan migrate

# Start the Laravel development server
php artisan serve
```

API will be available at:

```text
http://127.0.0.1:8000
```

### 2. Web Frontend Setup — `unfiltered-web`

```bash
cd unfiltered-web

# Install dependencies
npm install

# Create a .env file and configure the following:
# VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
# VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Start the development server
npm run dev
```

The web application will be available at:

```text
http://localhost:5173
```

### 3. Mobile App Setup — `unfiltered-mobile`

```bash
cd unfiltered-mobile

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

Scan the displayed QR code using the **Expo Go** app on your iOS or Android device.

> **Note:** When testing the mobile application on a physical device, make sure the API base URL points to an address accessible from the device rather than `localhost`.

## Environment Variables

Ensure the required `.env` files are properly configured for each project.

### `unfiltered-api/.env`

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback
```

Configure your database credentials as required by your Laravel application:

```env
DB_DATABASE=unfiltered_db
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

### `unfiltered-web/.env`

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

> **Security:** Never commit `.env` files or OAuth credentials to the repository. Keep sensitive credentials private and use `.env.example` files for documenting required variables.

## Running the Full Application

For local development, run each part of the application in its own terminal:

**Terminal 1 — Laravel API**

```bash
cd unfiltered-api
php artisan serve
```

**Terminal 2 — Web Client**

```bash
cd unfiltered-web
npm run dev
```

**Terminal 3 — Mobile Client**

```bash
cd unfiltered-mobile
npx expo start
```

The application can then be accessed through the web browser or Expo Go mobile application.

