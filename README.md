🐾 Purrfect Stay – Pet Daycare Monitoring System
Purrfect Stay is a web-based pet daycare platform designed to help pet owners book and monitor pet care services. Built using Node.js, Express.js, and MongoDB, the system features real-time pet status updates (simulated), appointment booking, and role-based dashboards for users and workers.

🚀 Features
- User & Worker authentication with role-based routing
- Create and manage pet profiles
- Book appointments linked to existing pet profiles
- Real-time simulated pet status updates via dashboard
- Workers can manage pet activities and appointments
- Secure password encryption using bcrypt
- MongoDB Atlas integration

🧱 Technologies Used
- Backend: Node.js, Express.js
- Database: MongoDB (MongoDB Atlas)
- Frontend: EJS, HTML, CSS
- Authentication: bcrypt, cookie-parser
- Deployment: Docker + Render

⚙️ Installation
git clone https://github.com/yourusername/purrfect-stay.git
cd purrfect-stay
npm install
npm start or node src/index.js

🐳 Docker Deployment
To run locally with Docker:
docker build -t purrfect-stay .
docker run -p 3000:3000 purrfect-stay

📂 Project Structure
/models
/routes
/controllers
/views
/public

🔴 Live Demo
🔗 https://purrfect-stay.onrender.com

👨‍💻 Contributors
Amate, Ruby Ann – Frontend & UI Design (User & Worker dashboard, Login/Signup, User/Pet Profiles, Booking)
Colo, Jenny Mae – Frontend & UI Design (Defaulthomepage get started, Gallery, about us), Deployment
Piñgol, Zandra Nicole A. – Backend, Pet Profile System, & Worker Dashboard
Roxas, James Martin C. – Backend, Authentication, Appoinment & Deployment
