🚑 Smart Emergency Response Platform

A web-based emergency response platform powered by the Google Maps API and Firebase that enables users to submit categorized emergency requests while allowing volunteers to respond based on urgency and proximity.

The system features smart prioritization, real-time updates, and a basic analytics dashboard to improve coordination and response efficiency.

🌍 Overview

This platform connects people in need with nearby volunteers through:

📍 Location-based request mapping

⚡ Real-time database updates

🔎 Smart filtering & prioritization

📊 Basic analytics dashboard

It is designed to provide faster emergency response and better visibility of critical cases.

✨ Features
🔹 Core Features

Category-based requests:

Medical

Food

Shelter

Priority tagging:

High

Medium

Low

Filter requests by urgency

Real-time status updates:

Accepted

In Progress

Completed

Distance-based sorting (nearest volunteer first)

Live map visualization

📊 Dashboard Features

Active cases count

Resolved cases count

Graph-based visualization of requests

🛠 Technology Stack
🎨 Frontend

Next.js

React

Tailwind CSS

Google Maps JavaScript API

🔥 Backend & Database

Firebase Authentication

Cloud Firestore

📈 Analytics

Recharts

🚀 Deployment

Firebase Hosting

Vercel

⚙️ How It Works

Users submit emergency requests with:

Category

Priority level

Location (via map)

Requests are stored in Firestore in real-time.

Volunteers view nearby requests sorted by urgency and distance.

Volunteers update the request status as they respond.

Dashboard updates automatically with real-time analytics.

📂 Project Structure (Example)
/app
/components
/context
/lib
/types
/public
🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
2️⃣ Install Dependencies
npm install
3️⃣ Configure Environment Variables

Create a .env.local file and add:

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
4️⃣ Run Development Server
npm run dev
🎯 Expected Impact

🚑 Faster emergency response time

🤝 Efficient volunteer coordination

📊 Improved visibility of high-risk cases

📍 Location-aware assistance

🔮 Future Improvements

Push notifications

Admin moderation panel

Heatmap visualization

AI-based priority prediction

Mobile app version

📜 License

This project is developed for educational and practical implementation purposes.
