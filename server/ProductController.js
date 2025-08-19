const { response } = require('express');
const Product = require('./ProductModel');
const Review = require('./ReviewModel');
const axios = require('axios'); // Import axios
const mongoose = require('mongoose');
const sanitizeHtml = require("sanitize-html");

const getProducts = (req, res, next) => {
    Product.find()
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({message:error})
        });
};

const addProduct = (req, res, next) => {
    const {
        ProductId,
        ProductName,
        Categories, 
        Areas,
        Variations,
        ImgUrls,
        sizeImg,
        Description,
        QuickDeliveryAvailable,
        DiscountPercentage
    } = req.body;

    const sanitizedDescription = sanitizeHtml(Description, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 
          'b', 'i', 'strong', 'em', 'u', 'a', 'br', 'span'
        ]),
        allowedAttributes: {
          a: ['href', 'target'], // Allow links
          span: ['style'], // Allow inline styles (optional)
          '*': ['class'], // Allow class attributes
        },
        allowedSchemes: ['http', 'https', 'mailto'], // Allow safe URL schemes
      });
      
    
    const product = new Product({
        ProductId: ProductId,
        ProductName: ProductName,
        Categories: Categories,
        Areas:Areas,
        Variations:Variations,
        ImgUrls: ImgUrls,
        sizeImg: sizeImg,
        Description: sanitizedDescription, // Save sanitized description
        QuickDeliveryAvailable: QuickDeliveryAvailable,
        DiscountPercentage:DiscountPercentage
    });

    // Save the product to the database
    product.save()
        .then(response =>{
            res.json({response});
        })
        .catch(error=> {
            res.json({error});
        });
};

const updateProduct = (req, res, next) => {
    const { ProductId, ProductName, Categories, Areas, Variations, ImgUrls,sizeImg, Description, QuickDeliveryAvailable,DiscountPercentage } = req.body;

    // Corrected the parameter name to match the route parameter
    Product.findOneAndUpdate(
        { ProductId: req.params.productId }, // Corrected here
        { $set: { ProductName, Categories, Areas, Variations, ImgUrls,sizeImg, Description, QuickDeliveryAvailable,DiscountPercentage } },
        { new: true }
    )
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};




const deleteProduct = (req, res, next) => {
    const ProductId = req.params.ProductId;

    Product.deleteOne({
        ProductId: ProductId
    })
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

const getProductById = (req, res, next) => {
    const productId = req.params.productId;

    Product.findOne({ ProductId: productId })
        .then(product => {
            if (!product) {
                return res.json({ message: 'Product not found' });
            }
            res.json({ product });
        })
        .catch(error => {
            res.json({ error: error.message });
        });
};
// Search products by name or ID

const searchProducts = async (req, res, next) => {
    const { query, country } = req.query;
    console.log('Search query:', query);
    console.log('Country:', country);
  
    if (!query || query.trim() === '') {
      return res.json({ products: [] });
    }
  
    const regex = new RegExp(query, 'i');
    let countryFilter;
    if (country === 'Sri Lanka') {
      countryFilter = { Areas: { $in: ['Sri Lanka', 'International'] } };
    } else {
      countryFilter = { Areas: { $in: ['International', 'Both'] } };
    }
  
    try {
      let exchangeRate = 1; // Default exchange rate
      if (country !== 'Sri Lanka') {
        const exchangeRateResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/LKR');
        exchangeRate = exchangeRateResponse.data.rates.USD;
      }
  
      const products = await Product.find({
        $and: [
          {
            $or: [
              { ProductId: regex },
              { ProductName: regex },
              { Categories: regex }
            ]
          },
          countryFilter
        ]
      });
  
      const updatedProducts = products.map(product => {
        product.Variations = product.Variations.map(variation => {
          const originalPrice = variation.price; // Original price
          const convertedPrice = country !== 'Sri Lanka'
            ? parseFloat((originalPrice * exchangeRate).toFixed(2))
            : null; // Convert price only if not in Sri Lanka
  
          return {
            ...variation.toObject(),
            originalPrice, // Add original price
            convertedPrice // Add converted price
          };
        });
  
        return product;
      });
  
      console.log('Final Search Results:', updatedProducts);
      res.json({ products: updatedProducts });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Failed to process search request' });
    }
  };
  

const getReviewsWithProductNames = async (req, res) => {
    const userId = req.params.userId;

    try {
        const reviews = await Review.find({ customerId: userId });

        // Extract unique ProductIds from the reviews
        const productIds = reviews.map(review => review.ProductId);
        const uniqueProductIds = [...new Set(productIds)]; // Ensure unique ProductIds

        // Fetch product names for each unique ProductId
        const products = await Product.find({ ProductId: { $in: uniqueProductIds } });

        // Map the ProductId to the corresponding ProductName
        const productMap = products.reduce((acc, product) => {
            acc[product.ProductId] = product.ProductName;
            return acc;
        }, {});

        // Attach the product names to the reviews
        const reviewsWithProductNames = reviews.map(review => ({
            ...review._doc,
            ProductName: productMap[review.ProductId] || 'Unknown Product'
        }));

        res.json({ reviews: reviewsWithProductNames });
    } catch (error) {
        console.error('Error fetching reviews with product names:', error);
        res.status(500).json({ message: error.message });
    }
};

const validateAndPlaceOrder = async (req, res) => {
    const { items } = req.body; // Array of products to order
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Fetch products from the database
        const productIds = items.map(item => item.productId);
        const products = await Product.find({ ProductId: { $in: productIds } }).session(session);

        // Validation: Check availability
        const unavailableProducts = [];
        for (const item of items) {
            const product = products.find(p => p.ProductId === item.productId);
            if (!product) {
                unavailableProducts.push({ 
                    productId: item.productId, 
                    productName: "Unknown Product", 
                    message: 'Product not found' 
                });
                continue;
            }

            const variation = product.Variations.find(
                v => v.size === item.size && v.name === item.color
            );

            if (!variation) {
                unavailableProducts.push({
                    productId: item.productId,
                    productName: product.ProductName,
                    message: `Variation not found for size: ${item.size}, color: ${item.color}`
                });
                continue;
            }

            if (variation.count < item.quantity) {
                unavailableProducts.push({
                    productId: item.productId,
                    productName: product.ProductName,
                    message: `Only ${variation.count} units available`
                });
            }
        }

        if (unavailableProducts.length > 0) {
            // Rollback and return errors
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, unavailableProducts });
        }

        // Deduct quantities
        for (const item of items) {
            const product = products.find(p => p.ProductId === item.productId);
            const variation = product.Variations.find(
                v => v.size === item.size && v.name === item.color
            );
            variation.count -= item.quantity; // Deduct quantity
        }

        // Save updates
        for (const product of products) {
            await product.save({ session });
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Proceed with order creation (handled elsewhere)
        return res.status(200).json({ success: true, message: 'Order placed successfully' });

    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        session.endSession();
        console.error('Error during order validation/placement:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



module.exports = { getProducts, addProduct, updateProduct, deleteProduct, getProductById, searchProducts, getReviewsWithProductNames, validateAndPlaceOrder  };