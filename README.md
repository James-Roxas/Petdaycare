# 🐾 Purrfect Stay – Pet Daycare Monitoring System

**Purrfect Stay** is a web-based pet daycare platform designed to help pet owners book and monitor pet care services. Built using **Node.js**, **Express.js**, and **MongoDB**, the system features:

- **Real-time pet status updates** (simulated)  
- **Appointment booking**  
- **Role-based dashboards** for users and workers  

---

## 🚀 Features

✅ **User & Worker authentication** with role-based routing  
✅ **Create and manage pet profiles**  
✅ **Book appointments** linked to existing pet profiles  
✅ **Real-time simulated pet status updates** via dashboard  
✅ **Workers can manage pet activities and appointments**  
✅ **Secure password encryption** using bcrypt  
✅ **MongoDB Atlas integration**  

---

## 🧱 Technologies Used

- **Backend**: Node.js, Express.js  
- **Database**: MongoDB (MongoDB Atlas)  
- **Frontend**: EJS, HTML, CSS  
- **Authentication**: bcrypt, cookie-parser  
- **Deployment**: Docker + Render  

---

## ⚙️ Installation

```bash
git clone https://github.com/yourusername/purrfect-stay.git
cd purrfect-stay
npm install
npm start  # or node src/index.js


## 🐳 Docker Deployment

To run the application locally using Docker:

```bash
docker build -t purrfect-stay .
docker run -p 3000:3000 purrfect-stay

---

## 📁 Project Structure
/models # Mongoose schemas for users, pets, appointments
/routes # Express route handlers
/controllers # Logic for routes and DB interaction
/views # EJS templates for frontend rendering
/public # Static assets (CSS, images)


---

## 🌐 Live Demo

🔗 [https://purrfect-stay.onrender.com](https://purrfect-stay.onrender.com)

---

## 👨‍💻 Contributors

| Name                      | Role                                                                 |
|---------------------------|----------------------------------------------------------------------|
| **Amate, Ruby Ann**       | Frontend & UI Design (User & Worker Dashboard, Login/Signup, Booking) |
| **Colo, Jenny Mae**       | Frontend & UI Design (Homepage, Gallery, About Us), Deployment       |
| **Piñgol, Zandra Nicole A.** | Backend (Pet Profile System, Worker Dashboard)                      |
| **Roxas, James Martin C.**| Backend (Authentication, Appointments), Deployment                   |

