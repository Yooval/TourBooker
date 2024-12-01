## Overview
**TourBooker** is an e-commerce web application for browsing, booking, and reviewing tours. It supports full CRUD operations to manage users, tours, reviews, and bookings, with features like advanced filtering, sorting, and pagination for easy tour discovery. Users can book tours, leave reviews, and reset passwords via email links.

The app uses Mapbox for geolocation, showing starting points and nearby tours. Built-in error handling ensures smooth operation. A web page built with Pug displays detailed tour information, including images, descriptions, maps, and reviews. Authentication secures access for all users, with admins having additional permissions to manage content and moderate reviews.

Payments are securely processed with Stripe, enabling users to view transactions and request refunds. API documentation is available in Postman for easy integration and testing.

**Here you can see all stages of the web page: Login page, Tours presentation, detailed views of specific tours.**


![עיצוב ללא שם](https://github.com/user-attachments/assets/6be797b1-b08a-4255-b4ea-4fe9e223c757)


**Here, you can view all Stripe transactions along with their details, including a comprehensive example of a single transaction:**


![עיצובggg שם (1)](https://github.com/user-attachments/assets/da7e66ff-98d3-41e5-a28f-170cc55d5a55)


## Installation

1. Clone the repository:
   ```cmd
   git clone <repository-url>
   cd <repository-directory>
2. Ensure you have Node.js installed on your machine.




      ## Local Development
      
      Set up your environment variables by creating a `.env` file in the root directory:
      
   ```bash
         PORT=3000
         DATABASE=<your-mongodb-database-url>
         DATABASE_PASSWORD=<your-database-password>
         JWT_SECRET=<your-jwt-secret>
         JWT_EXPIRES_IN=90d
         JWT_COOKIE_EXPIRES_IN=90
         STRIPE_SECRET_KEY=<your-stripe-secret-key>
## Install the required dependencies and run the app:
   ```bash
   npm install

   npm run dev
