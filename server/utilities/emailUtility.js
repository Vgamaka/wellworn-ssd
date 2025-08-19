const nodemailer = require("nodemailer");

const sendEmaill = async (orderData) => {
    const {
        email,
        firstName,
        lastName,
        orderId,
        orderDate,
        address,
        city,
        postalCode,
        country,
        products,
        total,
    } = orderData;

    // Format the order date
    let formattedOrderDate = "Invalid Date";
    try {
        const date = new Date(orderDate);
        if (!isNaN(date.getTime())) {
            formattedOrderDate = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Colombo",
                year: "numeric",
                month: "long",
                day: "numeric",
            }).format(date);
        }
    } catch (error) {
        console.error("Error formatting order date:", error);
    }

    // Parse total
    const parsedTotal = parseFloat(total);
    if (isNaN(parsedTotal)) {
        console.error("Error parsing total amount:", total);
    }

    // Generate product details
    const productDetails = products
        .map((product, index) => {
            const parsedPrice = parseFloat(product.price);
            const parsedQuantity = parseInt(product.quantity, 10);

            if (isNaN(parsedPrice) || isNaN(parsedQuantity)) {
                console.error(`Invalid price or quantity for product: ${product.ProductName}`);
                return ""; // Skip this product if data is invalid
            }

            const productImage = product.image && product.image[0]
                ? `<img src="cid:productimage${index}" alt="${product.ProductName}" width="100" style="border: 2px solid black; border-radius: 10px;" />`
                : "<p>Image not available</p>";

            return `
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div>${productImage}</div>
                    <div style="margin-left: 20px;">
                        <p style="margin: 0; font-size: 16px; font-weight: bold; color: black;">${product.ProductName}</p>
                        <p style="margin: 0; font-size: 14px; color: #ff3c00;">Price: ${parsedPrice.toFixed(2)}</p>
                        <p style="margin: 0; font-size: 14px; color: black;">Size: ${product.size || "Not specified"}, Color: ${product.color || "Not specified"}</p>
                        <p style="margin: 0; font-size: 14px; color: black;">Quantity: ${parsedQuantity}</p>
                        <p style="margin: 0; font-size: 14px; color: black;">Total: ${(parsedPrice * parsedQuantity).toFixed(2)}</p>
                    </div>
                </div>
            `;
        })
        .join("");

    // Prepare image attachments
    const attachments = products
        .map((product, index) => {
            try {
                if (
                    product.image &&
                    Array.isArray(product.image) &&
                    product.image[0].startsWith("data:image/")
                ) {
                    const matches = product.image[0].match(/^data:(image\/\w+);base64,(.+)$/);
                    if (matches) {
                        console.log(`Adding attachment for product: ${product.ProductName}`);
                        return {
                            filename: `product${index}.${matches[1].split("/")[1]}`,
                            content: matches[2],
                            encoding: "base64",
                            cid: `productimage${index}`,
                        };
                    } else {
                        console.error(`Invalid base64 format for product: ${product.ProductName}`);
                    }
                } else {
                    console.error(`Missing or invalid image for product: ${product.ProductName}`);
                }
            } catch (error) {
                console.error(`Error processing image for product: ${product.ProductName}`, error);
            }
            return null; // Return null if image is invalid
        })
        .filter(Boolean); // Filter out null values

    try {
        const transporter = nodemailer.createTransport({
            host: "mail.wellworn.lk",
            port: 465,
            secure: true,
            auth: {
                user: "orders@wellworn.lk",
                pass: "123wellhelp#$",
            },
        });

        const mailOptions = {
            from: '"WellWorn Private Limited" <orders@wellworn.lk>',
            to: email,
            subject: `Order Confirmation - ${orderId}`,
            html: `
                <p>Dear ${firstName} ${lastName},</p>
                <p>Thank you for choosing to shop with us. This email is to confirm that we have received your order with the following details:</p>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Order Date:</strong> ${orderDate}</p>
                <p><strong>Shipping Address:</strong><br>
                ${address},<br>
                ${city},<br>
                ${postalCode},<br>
                ${country}</p>
                <p><strong>Product Details:</strong></p>
                ${productDetails}
                <hr />
                <p style="font-size: 16px; font-weight: bold;">Total Amount: ${parsedTotal.toFixed(2)}</p>
                <hr />
                <p>Please note that your order is now being processed and will be shipped to the provided address within the estimated delivery time frame. You will receive a separate email with tracking information once your order has been dispatched.</p>
                <p>If you have any questions or require further assistance, feel free to contact us at help@wellworn.lk or reply directly to this email.</p>
                <p>Thank you once again for your purchase. We appreciate your business and look forward to serving you again in the future.</p>
                <p>Warm regards,</p>
                <p>WellWorn Private Limited</p>
            `,
            attachments,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = { sendEmaill };
