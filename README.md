# unfiltered — A Digital Journaling Sanctuary

**unfiltered** is a full-stack digital journaling platform designed to provide a safe, cozy space for recording daily thoughts, mood tracking, and personal reflections. Built as a monorepo, it seamlessly connects a Laravel API backend with web and mobile clients.

---

## Group Members
* Andong, Bai Fatima
* Cahilig, Christian James
* Gellica, Karylle Mish

## Course 
CCE 106L – Applications Development and Emerging Technologies

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

### Prerequisites

Make sure to have the following installed:

* PHP >= 8.2
* Composer
* Node.js >= 18.x
* npm
* MySQL


