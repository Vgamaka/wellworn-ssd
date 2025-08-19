

# Well Worn Private Limited - E-Commerce Management System

## Overview
Well Worn Private Limited is a leading online fashion retailer in Sri Lanka, specializing in shoes and bags for men and women. With over 20,000 followers on Facebook and Instagram, Well Worn combines social media power with robust e-commerce functionality to deliver high-quality products from reliable suppliers such as Shein and AliExpress. This system enhances operations across various departments, including user management, product management, order tracking, and customer response, ensuring a seamless shopping experience.

 Key Features
 1. User Management
- **Register User**: Allows users to create accounts, viewable by administrators.
- **Login User**: Secure authentication system for accessing accounts.
- **View/Edit User Profile**: Enables users to manage their profiles and update contact details.
- **Manage User Accounts**: Administrators can manage or delete user accounts through the admin dashboard.

 2. **Product Management**
- **Add/Update/Delete Products**: Administrators can manage the product catalog efficiently.
- **Filter Options**: Users can refine searches for targeted product discovery.
- **Admin Dashboard**: Provides an overview of user demographics, sales, and revenue insights.

 3. **Order Management**
- **Order Total Calculation**: Calculates totals with shipping, discounts, and promotions.
- **Payment Integration**: Supports multiple payment gateways like Webex, KOKO Pay, and Mint Pay.
- **Order Tracking**: Instant order confirmation and tracking features enhance customer trust.
- **Dashboard Analytics**: Provides insights into sales trends and customer data for better decision-making.

 4. **Item Tracking Management**
- Real-time tracking status for customer orders.
- Manage delayed order inquiries with editing and deletion capabilities.
- Order cancellation options for customers.

 5. **Refund Management**
- Easy refund initiation and request submission.
- Admin-managed refund processing with notifications and reports.
- Refund percentage calculation ensures fairness.

 7. **Customer Response Management**
- FAQ access for quick resolutions.
- Reviews and ratings management for customer feedback.
- Feedback removal for maintaining product quality transparency.

---

 Technical Specifications
 **Framework**
- **MERN Stack (MongoDB, Express.js, React.js, Node.js)**

 **Libraries**
- **Node.js**: Server-side development.
- **email.js**: For transactional emails like order confirmations and refund updates.
- **Chart.js**: For visualizing warehouse stock levels.
- **React-Toastify**: Notifications for real-time updates.

 **APIs**
- **Facebook Graph API / Instagram API**: Integrating social media functionalities.
- **Google Charts**: Displaying profit, product, and user insights.
- **Google Maps Platform**: Order tracking visualization.
- **Payment Gateways**: Webex, KOKO Pay, Mint Pay for secure transactions.



## Installation and Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/username/well-worn.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   - API keys for payment gateways (Webex, KOKO Pay, Mint Pay).
   - Database connection details.
4. Start the development server:
   ```bash
   npm start
   ```


 Usage
- **Admin**: Manage users, products, orders, and analytics through the dashboard.
- **Users**: Shop for products, manage profiles, and track orders.
- **Warehouse Team**: Monitor stock and communicate with suppliers for restocking.

 Future Enhancements
- Improve feature extraction for color and texture in the image classification model.
- Enhance chatbot interaction for resolving complex customer queries.
- Expand analytics with AI-based predictive modeling for sales trends.


 License
This project is licensed under the [MIT License]
