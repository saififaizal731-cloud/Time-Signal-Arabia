const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'Network Switches',
      'Routers & Gateways',
      'Network Cables',
      'Wireless Access Points',
      'Network Storage',
      'Networking Tools',
      'Security & Firewalls',
      'Modems & Converters',
      'Patch Panels',
      'Accessories',
    ],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: String,
  specifications: mongoose.Schema.Types.Mixed,
  image: String,
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 5;
      },
      message: 'Maximum 5 images allowed per product'
    }
  },
  brand: String,
  stock: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: String,
      rating: Number,
      comment: String,
      date: { type: Date, default: Date.now },
    },
  ],
  featured: {
    type: Boolean,
    default: false,
  },
  bestseller: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
