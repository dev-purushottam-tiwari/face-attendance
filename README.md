# 🚀 Face Recognition Attendance Management System

A **production-ready Face Recognition Attendance Management System** built using the **MERN Stack (MongoDB, Express.js, React + Vite, Node.js)** with **JWT Authentication**, **Email OTP Verification**, **Face Recognition**, **Liveness Detection**, and a modern **Tailwind CSS** interface.

Designed for organizations to automate attendance securely through AI-powered facial recognition while providing powerful administration, analytics, reporting, and employee management.


🌐 Live Demo

🔗 Live Application: face-attendance-eta-six.vercel.app

---

# 📌 Features

## 🔐 Authentication & Security

* Employee Registration
* Admin Approval before Login
* JWT Authentication
* Secure Password Hashing (bcrypt)
* Email OTP Verification
* Forgot Password via Email OTP
* Role-Based Access Control (Admin & Employee)
* Rate Limiting
* Helmet Security
* CORS Protection
* Environment Variables
* Input Validation
* Secure Error Handling

---

## 👨‍💼 Employee Module

* Employee Registration
* Employee Login
* Email OTP Verification
* Face Registration
* Face Verification
* Check-In
* Check-Out
* Attendance History
* Today's Attendance
* Attendance Percentage
* Working Hours Calculation
* Leave Application
* Notifications
* Profile Management
* Change Password

---

## 👨‍💻 Admin Module

* Modern Analytics Dashboard
* Employee Management
* Approve/Reject Employee Registrations
* Approve/Reject Face Registrations
* Attendance Management
* Leave Management
* Attendance Reports
* Export Reports (CSV/PDF)
* Search & Filter
* Pagination
* Dashboard Statistics

---

## 🤖 AI Face Recognition

* Webcam Face Registration
* Multiple Face Samples
* Secure Face Embeddings Storage
* No Raw Images Stored
* Duplicate Face Detection
* Face Verification
* Liveness Detection

  * Blink Detection
  * Head Movement Detection
* Admin Approval Required
* Attendance Allowed Only After Face Approval

---

## 📅 Attendance Rules

* Face Verification Required
* One Check-In Per Day
* One Check-Out Per Day
* Duplicate Attendance Prevention
* Automatic Working Hours Calculation
* Automatic Absent Marking using Cron Jobs
* Late Attendance Detection

---

## 📧 Email Notifications

* Registration Approval
* Face Approval
* OTP Verification
* Forgot Password
* Leave Approval
* Leave Rejection
* Attendance Updates

---

# 🛠 Tech Stack

## Frontend

* React 19
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* React Hook Form
* Framer Motion
* React Icons
* Recharts
* Context API

---

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Nodemailer
* Multer
* Express Validator
* Helmet
* Morgan
* CORS
* Express Rate Limit
* Node Cron

---

## AI & Face Recognition

* Face-api.js
* TensorFlow.js
* MediaPipe Face Detection
* Face Embeddings
* Face Matching
* Liveness Detection

---

# 📂 Project Structure

```
Face-Recognition-Attendance-System
│
├── client
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── pages
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── utils
│   ├── cron
│   ├── uploads
│   ├── server.js
│   └── app.js
│
├── README.md
└── package.json
```

---

# 🔄 System Workflow

### Employee Registration

```
Register
      ↓
Admin Approval
      ↓
Login
      ↓
Password Verification
      ↓
Email OTP Verification
      ↓
JWT Token
      ↓
Face Registration
      ↓
Admin Face Approval
      ↓
Attendance Enabled
```

---

### Attendance Workflow

```
Employee Login
      ↓
Face Verification
      ↓
Liveness Detection
      ↓
Identity Match
      ↓
Check-In
      ↓
Working Hours Calculation
      ↓
Check-Out
      ↓
Attendance Report
```

---

# 🔒 Security Features

* JWT Authentication
* Refresh Token Support
* Secure Password Hashing
* HTTP-only Cookies (optional)
* Helmet
* CORS
* Rate Limiting
* Input Validation
* Duplicate Face Detection
* Duplicate Attendance Prevention
* Role-Based Authorization
* Secure Environment Variables

---

# 📊 Dashboard Features

### Employee Dashboard

* Attendance Summary
* Attendance Calendar
* Working Hours
* Attendance Percentage
* Leave Status
* Notifications
* Profile Settings

---

### Admin Dashboard

* Total Employees
* Present Employees
* Absent Employees
* Late Employees
* Leave Requests
* Attendance Trends
* Department-wise Statistics
* Search & Filter
* CSV Export
* PDF Export

---

# 📸 Face Recognition Highlights

* High Accuracy Face Detection
* Face Embedding Generation
* Duplicate Face Detection
* Anti-Spoofing
* Blink Detection
* Head Movement Detection
* Fast Face Matching
* Secure Embedding Storage

---

# 📈 Future Enhancements

* GPS-Based Attendance
* QR Code Attendance
* Mobile Application
* Face Recognition API
* Multi-Company Support
* Department Analytics
* Payroll Integration
* Shift Management
* AI Attendance Insights
* Cloud Storage Integration

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/dev-purushottam-tiwari/face-attendance.git
```

```bash
cd face-recognition-attendance
```

---

## Backend

```bash
cd server

npm install

npm run dev
```

---

## Frontend

```bash
cd client

npm install

npm run dev
```

---

# 🔑 Environment Variables

### Backend (.env)

```env
PORT=5000

MONGODB_URI=

JWT_SECRET=

JWT_EXPIRE=

SMTP_HOST=

SMTP_PORT=

SMTP_EMAIL=

SMTP_PASSWORD=

CLIENT_URL=

NODE_ENV=development
```

---

# 📷 Screens

* Login
* Registration
* OTP Verification
* Face Registration
* Face Verification
* Employee Dashboard
* Admin Dashboard
* Attendance History
* Leave Management
* Analytics Dashboard

---

# 🎯 Learning Outcomes

This project demonstrates expertise in:

* MERN Stack Development
* Authentication & Authorization
* Face Recognition
* AI Integration
* REST API Development
* MongoDB Data Modeling
* Secure Backend Development
* React Architecture
* Enterprise Folder Structure
* Production-Level Coding Standards

---

# 👨‍💻 Author

**Purushottam Tiwari**

**Full Stack MERN Developer**

* Passionate about building scalable web applications.
* Skilled in JavaScript, React, Node.js, Express.js, MongoDB, REST APIs, and AI-powered web applications.

---

# ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the project

🐞 Report issues

📢 Share your feedback

---

## 📄 License

This project is licensed under the MIT License.

---

> **Production-Level MERN Stack Project featuring AI-powered Face Recognition, Email OTP Authentication, Role-Based Access Control, Liveness Detection, and Enterprise-Grade Attendance Management.**
