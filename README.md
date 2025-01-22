# FabriCare
<div align="center">
  <img src="frontend/public/images/Fabricare.png" alt="FabriCare Logo">
</div>

## Introduction
**FabriCare** is an innovative online platform designed for the sale of clothes, sweaters, and other fashion outfits. This application provides a seamless solution for managing product sales and inventory, offering an exceptional user experience for both customers and administrators.

## Application Features

### Frontend
1. **Responsive Design**: Built with React.js to ensure a seamless user experience across all devices.
2. **Dedicated API Clients**: Handles API requests and responses efficiently across components.
3. **State Management**: Utilizes Context API for effective state handling.
4. **Admin Dashboard**: Empowers administrators to create, track, and manage inventories.

## Additional Features
1. User-Friendly Interface: Easy navigation for both customers and administrators.
2. Inventory Management: Efficient tracking of stock levels and sales data.
3. Secure Transactions: Ensures safe and reliable payment processing.
4. Order Tracking: Real-time updates on order status for customers.
5. Customizable Listings: Detailed product descriptions and images for better customer engagement.

### Backend
1. **REST API**: Provides paginated JSON responses for all services.
2. **Database Migrations**: Simplifies database integration and version control.
3. **Media Storage**: Robust system for handling uploaded media files.
4. **Caching**: Implements Redis for improved performance and reduced latency.
5. **Dynamic Database**: Supports switching between SQLite (development) and MySQL (production).
6. **Shell Context**: Enables real-time interaction with the application and database.
7. **Payment Gateway**: Integrated Stripe API for secure and convenient payment processing.
8. **Comprehensive Documentation**: Utilizes Marshmallow and APIFairy for consistent API documentation.
9. **Role-Based Authentication**: Ensures secure access based on user roles.
10. **Dummy Data Creation**: One-command setup for populating the database with test data.

### DevOps
1. **Docker Compose**: Orchestrates services including frontend, backend, Redis, MySQL, and Nginx.
2. **SSL Protection**: Ensures database security against penetration attacks.
3. **Nginx Proxy Manager**: Simplifies proxy service management with a graphical interface.
4. **Service Health Checks**: Monitors microservice safety and performance.
5. **CI/CD Pipeline**: Leverages GitHub Actions for automatic deployment of successfully tested changes to production.

## Use Cases
FabriCare can be deployed using two methods:

### 1. Python Internal (Local) Server
This approach utilizes the Python WSGI application server with SQLite for development purposes. It is not recommended for production environments. For production, update the `SQLALCHEM_DATABASE_URI` in the `.env` file to use MySQL or other stable databases.

#### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Usool-Data-Science/FabriCare.git
   ```
2. **Navigate to the Project Directory**
   ```bash
   cd Fabricare/
   ```
3. **Set Up Backend**
   - Navigate to the backend directory and create a virtual environment:
     ```bash
     cd backend/
     python3 -m venv venv
     ```
   - Activate the virtual environment:
     - On Linux/Mac:
       ```bash
       source venv/bin/activate
       ```
     - On Windows:
       ```bash
       venv\Scripts\activate
       ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Initialize and populate the database:
     ```bash
     flask db init && flask db migrate -m "Initialize Database" && flask db upgrade
     flask fakes create 5
     ```
     **Note:** Ensure the `ENV` variable in the `.env` file is set to `local`.

4. **Start the Backend Server**
   - Run the application:
     ```bash
     flask run
     ```
   - Access the API at [http://localhost:5000](http://localhost:5000).

5. **Set Up Frontend**
   - Open a new terminal and navigate to the frontend directory:
     ```bash
     cd frontend/
     ```
   - Install dependencies and start React:
     ```bash
     npm install
     npm run dev
     ```
   - Access the frontend at [http://localhost:3000](http://localhost:3000).

6. **Test User Login**
   - Client: `username=testuser`, `password=123456`
   - Admin: `username=testadmin`, `password=123456`

### 2. Docker Deployment
For a production-ready setup, use Docker.

#### Instructions
1. Ensure Docker is installed and running on your system.
2. Clone the repository and update the `.env` files in both the frontend and backend directories to set `ENV=docker`.
3. Navigate to the project directory and start the services:
   ```bash
   docker-compose up
   ```
4. Access the application at [http://127.0.0.1:81](http://127.0.0.1:81).

#### Default Admin Credentials
- **Username:** `admin@example.com`
- **Password:** `changeme`

**Important:** Update admin credentials and configure Nginx Proxy Manager for optimal performance.

---

## Contributing
We welcome contributions to improve FabriCare. Feel free to open issues or submit pull requests.

## License
FabriCare is licensed under the [MIT License](LICENSE).
