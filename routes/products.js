const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const axios = require('axios');
const cheerio = require('cheerio');

router.post('/upload', (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    if (req.files.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 images allowed' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ imageUrls: imageUrls, filenames: req.files.map(f => f.filename) });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

router.post('/scrape-url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const name =
      $('h1[class*="product"]').first().text() ||
      $('h1[class*="title"]').first().text() ||
      $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      '';

    const price =
      $('[class*="price"]:not([class*="original"]):not([class*="old"])').first().text() ||
      $('meta[property="product:price:amount"]').attr('content') ||
      '';

    const description =
      $('[class*="description"]').first().text() ||
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const image =
      $('meta[property="og:image"]').attr('content') ||
      $('img[class*="product"]').first().attr('src') ||
      $('img[class*="main"]').first().attr('src') ||
      '';

    const cleanedData = {
      name: name.trim().slice(0, 200),
      price: parseFloat(price.replace(/[^0-9.]/g, '')) || 0,
      description: description.trim().slice(0, 1000),
      image: image.startsWith('//') ? 'https:' + image : image,
    };

    res.json(cleanedData);

  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({
      message: 'Failed to scrape URL. The site may be blocking requests or the URL is invalid.',
      error: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, sort, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    let productsQuery = Product.find(query);

    if (sort === 'bestseller') productsQuery = productsQuery.where('bestseller').equals(true);
    if (sort === 'featured') productsQuery = productsQuery.where('featured').equals(true);
    if (sort === 'newest') productsQuery = productsQuery.sort({ createdAt: -1 });
    if (sort === 'price-low') productsQuery = productsQuery.sort({ price: 1 });
    if (sort === 'price-high') productsQuery = productsQuery.sort({ price: -1 });
    if (sort === 'rating') productsQuery = productsQuery.sort({ rating: -1 });

    const result = await productsQuery.exec();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // Log incoming data for debugging
    console.log('Creating product with data:', req.body);

    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Product creation error:', error);

    // More detailed error message
    let errorMessage = error.message;
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      errorMessage = 'Validation Error: ' + messages.join(', ');
    }

    res.status(400).json({ message: errorMessage });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
