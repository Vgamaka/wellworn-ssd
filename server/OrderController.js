const { response } = require('express');
const Order = require('./OrdersModel');
const Coupon = require('./CouponModel');
const { sendEmail } = require('../server/util/email_templates/orderStatusEmailTemplate');
const { sendEmaill } = require('../server/utilities/emailUtility');
const OrderCancellation = require('./OrderCancellationCModel'); // Import the model

async function generateUniqueOrderId() {
    const prefix = 'OID';
    let isUnique = false;
    let orderId = '';
    let iterationCount = 0; // Track the number of attempts to generate a unique ID

    while (!isUnique) {
        try {
            // Generate a 6-digit random number
            const randomNum = Math.floor(100000 + Math.random() * 900000); // Range: 100000 to 999999
            orderId = prefix + randomNum.toString();

            // Log the generated ID for debugging
            console.log(`[INFO] Attempting to generate orderId: ${orderId}`);

            // Check both Orders and OrderCancellations collections
            const existingOrder = await Order.findOne({ orderId });
            const existingCancellation = await OrderCancellation.findOne({ OrderID: orderId });

            if (existingOrder) {
                console.warn(`[WARNING] Duplicate orderId found in Orders table: ${orderId}`);
            }

            if (existingCancellation) {
                console.warn(`[WARNING] Duplicate orderId found in OrderCancellations table: ${orderId}`);
            }

            if (!existingOrder && !existingCancellation) {
                isUnique = true;
                console.log(`[SUCCESS] Unique orderId generated: ${orderId}`);
            }

            iterationCount++;
            if (iterationCount > 100) {
                console.error(`[ERROR] Too many attempts to generate a unique orderId. Failing.`);
                throw new Error("Too many attempts to generate a unique orderId.");
            }
        } catch (error) {
            console.error(`[ERROR] Error during orderId generation: ${error.message}`);
            throw new Error("Failed to generate a unique orderId. Please try again later.");
        }
    }

    console.log(`[INFO] Final unique orderId is: ${orderId}`);
    return orderId;
}


const getOrders = (req, res, next) => {
    Order.find()
        .then(orders => {
            const sriLankanOffset = 5.5 * 60 * 60 * 1000; // Offset in milliseconds

            // Adjust `orderDate` to Sri Lankan time
            const adjustedOrders = orders.map(order => {
                order.orderDate = new Date(order.orderDate.getTime() + sriLankanOffset);
                return order;
            });

            res.json({ orders: adjustedOrders });
        })
        .catch(error => res.status(500).json({ error: error.message }));
};


const addOrder = async (req, res, next) => {
    const {
        customerId,
        country,
        email,
        firstName,
        lastName,
        contactNumber,
        State,
        address,
        address02,
        city,
        postalCode,
        additionalDetails,
        shippingMethod,
        paymentMethod,
        couponCode,
        items,
        total,
        Status,
        ContactStatus
    } = req.body;

    try {
        console.log(`[INFO] Starting order creation process...`);
        
        console.log(`[INFO] Generating unique orderId...`);
        const orderId = await generateUniqueOrderId();
        console.log(`[SUCCESS] Generated unique orderId: ${orderId}`);

        const sriLankanOffset = 5.5 * 60 * 60 * 1000; // Offset in milliseconds
        const orderDate = new Date(Date.now() + sriLankanOffset);

        const products = Array.isArray(items)
            ? items.map(item => ({
                ...item,
                image: Array.isArray(item.image) ? item.image.join(',') : item.image || ''
            }))
            : [{
                ...items,
                image: Array.isArray(items.image) ? items.image.join(',') : items.image || ''
            }];

        const order = new Order({
            orderId,
            orderDate,
            customerId,
            country,
            email,
            firstName,
            lastName,
            contactNumber,
            State,
            address,
            address02,
            city,
            postalCode,
            additionalDetails,
            shippingMethod,
            paymentMethod,
            couponCode,
            products,
            total,
            Status,
            ContactStatus
        });

        console.log(`[INFO] Saving order to database...`);
        const savedOrder = await order.save();
        console.log(`[SUCCESS] Order saved successfully with orderId: ${savedOrder.orderId}`);

        if (couponCode) {
            console.log(`[INFO] Processing coupon: ${couponCode}`);
            const coupon = await Coupon.findOne({ code: couponCode });
            if (coupon) {
                coupon.usageCount += 1;
                if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
                    coupon.isActive = false;
                }
                await coupon.save();
                console.log(`[SUCCESS] Coupon updated successfully: ${couponCode}`);
            } else {
                console.warn(`[WARNING] Coupon not found or already inactive: ${couponCode}`);
            }
        }

        try {
            console.log(`[INFO] Sending order confirmation email to: ${email}`);
            await sendEmaill(savedOrder.toObject());
            console.log(`[SUCCESS] Email sent successfully to: ${email}`);
            res.status(201).json({ message: "Order placed and email sent!", order: savedOrder });
        } catch (emailError) {
            console.error(`[ERROR] Email send error: ${emailError.message}`);
            res.status(201).json({ message: "Order placed but email could not be sent", order: savedOrder });
        }
    } catch (error) {
        console.error(`[ERROR] Error in addOrder: ${error.message}`);
        res.status(500).json({ error: "Failed to save order", details: error.toString() });
    }
};


const updateOrder = (req, res, next) => {
    const orderId = req.params.orderId;
    const updates = req.body;

    Order.findByIdAndUpdate(orderId, updates, { new: true })
        .then(updatedOrder => res.json({ updatedOrder }))
        .catch(error => res.status(500).json({ error: error.message }));
};

const updateContactStatus = async (req, res) => {
    const { orderId } = req.params;
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId },
            { $set: { ContactStatus: "Informed" } },
            { new: true }
        );
        if (updatedOrder) {
            res.json({ success: true, message: "Contact status updated successfully", data: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: "Order not found" });
        }
    } catch (error) {
        console.error("Error updating contact status:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        const updateResult = await Order.findOneAndUpdate(
            { orderId },
            { $set: { Status: "Dispatched" } },
            { new: true }
        );

        if (updateResult) {
            res.json({ success: true, message: "Order status updated successfully", data: updateResult });
        } else {
            res.status(404).json({ success: false, message: "Order not found" });
        }
    } catch (error) {
        console.error("Order status update failed:", error.message);
        res.status(500).json({ error });
    }
};

const sendOrderStatusEmail = async (req, res, next) => {
    try {
        const { toName, orderId, productName, Status, email } = req.body;

        const emailTemplate = orderStatusEmailTemplate(
            toName,
            orderId,
            productName,
            Status
        );
        sendEmail(email, "Order Status Update", emailTemplate);

        await Order.findOneAndUpdate(
            { orderId: orderId },
            { $set: { ContactStatus: "Informed" } },
            { new: true }
        );

        res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        res.json({ error });
    }
};

const sendOrderEmail = async (req, res) => {
    try {
        const orderDetails = req.body;

        // Ensure total is parsed correctly
        if (typeof orderDetails.total !== 'number') {
            orderDetails.total = parseFloat(orderDetails.total);
        }
        if (isNaN(orderDetails.total)) {
            throw new Error("Invalid total amount received in order details.");
        }

        await sendEmaill(orderDetails);
        res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending order email:", error);
        res.status(500).json({ success: false, message: "Failed to send email" });
    }
};

const deleteOrder = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.deleteOne({ orderId })
        .then(result => {
            if (result.deletedCount === 1) {
                res.status(200).json({ message: 'Order deleted successfully' });
            } else {
                res.status(404).json({ error: 'Order not found' });
            }
        })
        .catch(error => res.status(500).json({ error: 'Internal Server error' }));
};

const getOrderById = async (req, res, next) => {
    const orderId = req.params.orderId;

    try {
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrdersByCustomerId = async (req, res) => {
    const { customerId } = req.params;
    try {
        const orders = await Order.find({ customerId }).sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        res.status (500).json({ error: error.message });
    }
};

module.exports = { getOrders, addOrder, updateOrder, deleteOrder, getOrderById, updateContactStatus, sendOrderStatusEmail,sendOrderEmail, updateOrderStatus, getOrdersByCustomerId };
