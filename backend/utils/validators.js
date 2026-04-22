// backend/utils/validators.js
const Joi = require('joi');

const phoneRegex = /^[6-9]\d{9}$/;

const schemas = {
  registerCustomer: Joi.object({
    phone: Joi.string()
      .pattern(phoneRegex)
      .required()
      .messages({
        'string.pattern.base': 'Invalid phone number',
      }),
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email(),
    firebase_uid: Joi.string(),
  }),

  addAddress: Joi.object({
    name: Joi.string().max(255),
    phone: Joi.string().pattern(phoneRegex),
    street: Joi.string().max(500).required(),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    pincode: Joi.string().length(6).required(),
    type: Joi.string().valid('home', 'work', 'other'),
    is_default: Joi.boolean(),
  }),

  addToCart: Joi.object({
    product_id: Joi.number().required(),
    quantity_kg: Joi.number().min(0.5).max(100).required(),
  }),

  createOrder: Joi.object({
    address_id: Joi.number().required(),
    items: Joi.array()
      .items({
        product_id: Joi.number().required(),
        quantity_kg: Joi.number().min(0.5).required(),
      })
      .required(),
    coupon_code: Joi.string(),
    payment_method: Joi.string().valid('upi', 'gpay', 'bank_transfer'),
  }),

  verifyPayment: Joi.object({
    order_id: Joi.number().required(),
    screenshot_url: Joi.string().uri(),
    transaction_id: Joi.string(),
    notes: Joi.string(),
  }),

  createProduct: Joi.object({
    category_id: Joi.number().required(),
    supplier_id: Joi.number(),
    name: Joi.string().max(255).required(),
    description: Joi.string(),
    price_per_kg: Joi.number().required(),
    stock_kg: Joi.number(),
    min_order_kg: Joi.number(),
    max_order_kg: Joi.number(),
    freshness_status: Joi.string().valid('fresh', 'super_fresh', 'standard'),
    harvest_date: Joi.date(),
    expiry_date: Joi.date(),
  }),

  createCoupon: Joi.object({
    code: Joi.string().required(),
    discount_type: Joi.string().valid('percentage', 'fixed').required(),
    discount_value: Joi.number().required(),
    min_order_amount: Joi.number(),
    max_discount_amount: Joi.number(),
    usage_limit: Joi.number(),
    valid_from: Joi.date().required(),
    valid_till: Joi.date().required(),
  }),

  addFeedback: Joi.object({
    order_id: Joi.number().required(),
    product_id: Joi.number().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(1000),
    image_url: Joi.string().uri(),
  }),

  createSupportTicket: Joi.object({
    subject: Joi.string().max(255).required(),
    description: Joi.string().required(),
    category: Joi.string().valid('product_issue', 'delivery', 'payment', 'other'),
    order_id: Joi.number(),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({ success: false, errors: messages });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = { schemas, validate };
