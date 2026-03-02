🚑 Smart Emergency Response Platform

> A real-time, location-aware emergency coordination platform that connects people in need with nearby volunteers.

---

🏆 Hackathon Project

Built to improve emergency response time through smart prioritization, real-time updates, and distance-based volunteer coordination.

---

🌍 Problem

During emergencies, response coordination is often slow and disorganized. There is no centralized system to prioritize urgent cases and match them with nearby volunteers.

---
💡 Solution

A web-based platform powered by Google Maps and Firebase that:

- Allows users to submit categorized emergency requests
- Prioritizes requests based on urgency
- Sorts volunteers based on proximity
- Updates request status in real-time
- Displays live analytics for better decision-making

---

✨ Key Features

🚨 Emergency Requests
- Category-based (Medical, Food, Shelter)
- Priority tagging (High / Medium / Low)
- Real-time status updates (Accepted / In Progress / Completed)

📍 Smart Location Matching
- Live Google Maps integration
- Distance-based sorting (nearest volunteer first)
- Real-time request markers

📊 Analytics Dashboard
- Active cases count
- Resolved cases count
- Graph visualization

---

🛠 Tech Stack

Frontend:
- Next.js
- React
- Tailwind CSS
- Google Maps JavaScript API

Backend:
- Firebase Authentication
- Firebase Firestore (Real-time Database)

Analytics:
- Recharts

Deployment:
- Vercel / Firebase Hosting

---

⚙️ How to Run Locally

1️⃣ Clone Repository
git clone https://github.com/your-username/your-repo-name.git  
cd your-repo-name  

2️⃣ Install Dependencies
npm install  

3️⃣ Add Environment Variables

Create `.env.local`:

NEXT_PUBLIC_FIREBASE_API_KEY=  
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=  
NEXT_PUBLIC_FIREBASE_PROJECT_ID=  
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=  
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=  
NEXT_PUBLIC_FIREBASE_APP_ID=  
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=  

4️⃣ Run Development Server
npm run dev  

---

🎯 Expected Impact

- Faster emergency response
- Better volunteer coordination
- Improved visibility of high-risk cases
- Real-time tracking & transparency

---

👨‍💻 Team / Author

Haseen Afridi

---

🚀 Future Improvements

- Push notifications
- AI-based urgency prediction
- Heatmap visualization
- Mobile application version
