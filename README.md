# 🚀 Cybrex — Secure Multi-Session Authentication System

A production-grade authentication system inspired by **Google-style multi-session login**, built using **MERN Stack**, featuring:

- ✅ JWT Access + Refresh Token  
- ✅ HttpOnly Secure Cookies  
- ✅ Multi-Device Session Tracking  
- ✅ Suspicious Login Detection (IP / Location / Device-based)  
- ✅ Google OAuth 2.0 Login  
- ✅ Token Auto-Refresh via Axios Interceptor  
- ✅ Logout From Specific Device or All Devices  
- ✅ Fully Responsive Dark UI  

---

## 🔗 Live Demo  
*(Add your deployment links here)*

Frontend (Netlify): https://your-netlify-url  
Backend (Render): https://your-render-url  

---

# ⭐ Features

### 🧩 Authentication
- Email & Password login  
- Google OAuth login  
- Access token (15 min) stored **in-memory only**  
- Refresh token (7 days) in **HttpOnly secure cookie**  

### 📱 Multi-Session Management
- Track all logged-in devices  
- Stores Browser, OS, Device, IP, Time  
- Logout from one device  
- Logout from all devices  

### 🔐 Suspicious Login Detection
Checks for unusual activity based on:
- New device  
- New IP/location  
- Different OS or Browser  

Displays:
- Popup warning  
- Banner notification  

### 🔄 Token Auto-Refresh (Axios Interceptor)
- Prevents forced logout  
- Automatically gets new access token when expired  

### 🎨 Beautiful UI
- Dark theme  
- Lottie animation dashboard  
- Centered Google login button  
- Smooth responsive layout  

---

# 🖥 Tech Stack

### Frontend:
- React (Vite)
- Axios + Interceptor
- Context API
- React Router
- @react-oauth/google
- Lottie

### Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT
- bcryptjs
- google-auth-library
- UA-Parser-JS

---

