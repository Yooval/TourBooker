## Overview
TourBooker is a fully-featured e-commerce web application that allows users to browse, find, book, and review tours, utilizing full **CRUD (Create, Read, Update, Delete)** operations to manage users, tours, reviews, and bookings. Users can take advantage of advanced **filtering, sorting, and pagination** to easily find tours that match their preferences, book them, and leave reviews. The app also features a **geolocation** tool, enabling users to discover tours near their location, while built-in **error handling** ensures a seamless experience by catching and managing any issues that may arise.

Users, including admins, can explore their selected tours in greater detail on a web page that displays images, descriptions, maps showing starting points, and includes **reviews and star ratings**. The web page is secured with **user authentication**, ensuring that only registered users, regardless of their role, can access its features. Admins also have additional capabilities to manage content, such as creating, updating, and deleting tours, and moderating user reviews.

All API requests are fully documented and available in **Postman**. You can explore the full documentation [here](https://documenter.getpostman.com/view/38510958/2sAXxMfDTK#a79bb063-8e77-4261-9a3b-4c97fdfefc73). While it's recommended to download Postman for testing, you can also use the documentation to get a clear idea of how the API works.

Secure payment processing is handled by **Stripe**, allowing users to make payments, view transaction details, and process refunds. Stripe provides comprehensive information about payments, including the time of initiation, authorization, tour details, and the card used for the transaction.

The app is designed with best practices for security, scalability, and error handling, safeguarding user data and transactions.

## Installation

1. Clone the repository:
   ```cmd
   git clone <repository-url>
   cd <repository-directory>
2. Ensure you have Node.js installed on your machine.


3. Install the required dependencies:
   ### npm install

## Installation
Set up your environment variables by creating a .env file in the root directory:

****PORT=3000****
****DATABASE=<your-mongodb-database-url>****
****DATABASE_PASSWORD=<your-database-password>****
****JWT_SECRET=<your-jwt-secret>****
****JWT_EXPIRES_IN=90d****
****JWT_COOKIE_EXPIRES_IN=90****
****STRIPE_SECRET_KEY=<your-stripe-secret-key>****

## Start the application:
npm run dev
The API will be available at http://localhost:3000.

Use Postman to test the API endpoints.

## Key Packages
express: Web framework for building the API
mongoose: For MongoDB object modeling and database management
jsonwebtoken: For handling authentication and issuing JWT tokens
bcryptjs: For password hashing and security
dotenv: For environment variable management
Applications Used
Postman: For API testing and documentation
Mailtrap: For email testing in a development environment
MongoDB Compass: For visualizing and interacting with the database locally
MongoDB Atlas: A cloud-based MongoDB solution for storing and managing the database



