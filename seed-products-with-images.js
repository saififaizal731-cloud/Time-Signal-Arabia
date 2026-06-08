const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const products = [
  {
    name: 'Cisco Catalyst 9200 48-Port Switch',
    category: 'Network Switches',
    price: 2999.99,
    brand: 'Cisco',
    description: 'Enterprise-grade managed switch with advanced security features and high throughput',
    stock: 15,
    featured: true,
    rating: 4.8,
    image: 'https://images-na.ssl-images-amazon.com/images/I/51WxH7ZROIL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/51WxH7ZROIL._AC_SX679_.jpg', 'https://images-na.ssl-images-amazon.com/images/I/41BpswK0FoL._AC_SX679_.jpg']
  },
  {
    name: 'Juniper Networks MX480 Router',
    category: 'Routers & Gateways',
    price: 4499.99,
    brand: 'Juniper',
    description: 'High-performance routing platform for service providers and enterprises',
    stock: 8,
    featured: true,
    rating: 4.9,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41XgW3Q3DfL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41XgW3Q3DfL._AC_SX679_.jpg']
  },
  {
    name: 'Cat6A Ethernet Cable 305m Spool',
    category: 'Network Cables',
    price: 189.99,
    brand: 'AMP Netconnect',
    description: 'Pure copper Cat6A cables for reliable high-speed networking',
    stock: 50,
    featured: false,
    rating: 4.6,
    image: 'https://images-na.ssl-images-amazon.com/images/I/51H8h2l7YAL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/51H8h2l7YAL._AC_SX679_.jpg']
  },
  {
    name: 'Ubiquiti UniFi 6 Access Point Pro',
    category: 'Wireless Access Points',
    price: 379.99,
    brand: 'Ubiquiti',
    description: 'High-performance WiFi 6 access point with PoE support',
    stock: 25,
    featured: true,
    rating: 4.7,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41NNkBtJrwL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41NNkBtJrwL._AC_SX679_.jpg']
  },
  {
    name: 'Synology NAS RS1219+ 12-Bay',
    category: 'Network Storage',
    price: 1299.99,
    brand: 'Synology',
    description: 'Network attached storage with RAID support and backup capabilities',
    stock: 12,
    featured: false,
    rating: 4.8,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41VQK5gKC8L._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41VQK5gKC8L._AC_SX679_.jpg']
  },
  {
    name: 'Fluke Networks Pro Cable Tester',
    category: 'Networking Tools',
    price: 599.99,
    brand: 'Fluke',
    description: 'Professional cable tester for network certification and troubleshooting',
    stock: 18,
    featured: false,
    rating: 4.7,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41tKHR9QrAL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41tKHR9QrAL._AC_SX679_.jpg']
  },
  {
    name: 'Fortinet FortiGate 200F Firewall',
    category: 'Security & Firewalls',
    price: 3499.99,
    brand: 'Fortinet',
    description: 'Next-generation firewall with advanced threat protection',
    stock: 10,
    featured: true,
    rating: 4.9,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41SYxrHHPYL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41SYxrHHPYL._AC_SX679_.jpg']
  },
  {
    name: 'ARISTA Ethernet Switch DCS-7050S',
    category: 'Network Switches',
    price: 3799.99,
    brand: 'Arista',
    description: 'High-speed data center switching with 10/40/100GbE ports',
    stock: 6,
    featured: false,
    rating: 4.8,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41b5K9P0FnL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41b5K9P0FnL._AC_SX679_.jpg']
  },
  {
    name: 'Palo Alto Networks PA-5220 Firewall',
    category: 'Security & Firewalls',
    price: 8999.99,
    brand: 'Palo Alto',
    description: 'Enterprise firewall with integrated threat prevention',
    stock: 4,
    featured: true,
    rating: 4.9,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41yM3sLPdIL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41yM3sLPdIL._AC_SX679_.jpg']
  },
  {
    name: 'Netgear Managed 48-Port PoE Switch',
    category: 'Network Switches',
    price: 899.99,
    brand: 'Netgear',
    description: 'Budget-friendly managed switch with PoE support for small to medium enterprises',
    stock: 30,
    featured: false,
    rating: 4.5,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41r5D4Sp1OL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41r5D4Sp1OL._AC_SX679_.jpg']
  },
  {
    name: 'MikroTik RouterOS CCR2116-12G',
    category: 'Routers & Gateways',
    price: 1599.99,
    brand: 'MikroTik',
    description: 'Powerful router with advanced routing capabilities and bandwidth management',
    stock: 14,
    featured: false,
    rating: 4.6,
    image: 'https://images-na.ssl-images-amazon.com/images/I/31sVCcZCjwL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/31sVCcZCjwL._AC_SX679_.jpg']
  },
  {
    name: 'Fiber Optic Patch Cord SM OS2 2km',
    category: 'Network Cables',
    price: 45.99,
    brand: 'Corning',
    description: 'Single-mode fiber optic cables for long-distance connections',
    stock: 100,
    featured: false,
    rating: 4.7,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41cAjUGHh1L._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41cAjUGHh1L._AC_SX679_.jpg']
  },
  {
    name: 'TP-Link EAP245 Wireless Access Point',
    category: 'Wireless Access Points',
    price: 129.99,
    brand: 'TP-Link',
    description: 'Dual-band AC1750 access point for business networks',
    stock: 45,
    featured: false,
    rating: 4.4,
    image: 'https://images-na.ssl-images-amazon.com/images/I/31Jf2cF0s5L._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/31Jf2cF0s5L._AC_SX679_.jpg']
  },
  {
    name: 'Western Digital My Cloud Pro PR4100',
    category: 'Network Storage',
    price: 799.99,
    brand: 'WD',
    description: '4-bay NAS for businesses and creative professionals',
    stock: 16,
    featured: false,
    rating: 4.6,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41fxQF-rLBL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41fxQF-rLBL._AC_SX679_.jpg']
  },
  {
    name: 'Network Cable Organizer Kit',
    category: 'Accessories',
    price: 49.99,
    brand: 'StarTech',
    description: 'Complete cable management solution for data centers',
    stock: 60,
    featured: false,
    rating: 4.5,
    image: 'https://images-na.ssl-images-amazon.com/images/I/51CfqJdNNRL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/51CfqJdNNRL._AC_SX679_.jpg']
  },
  {
    name: 'Check Point Quantum Security Gateway',
    category: 'Security & Firewalls',
    price: 5999.99,
    brand: 'Check Point',
    description: 'Advanced threat prevention and management platform',
    stock: 5,
    featured: false,
    rating: 4.8,
    image: 'https://images-na.ssl-images-amazon.com/images/I/31N5EhKnwsL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/31N5EhKnwsL._AC_SX679_.jpg']
  },
  {
    name: 'Dell N3248P PoE Switch',
    category: 'Network Switches',
    price: 1299.99,
    brand: 'Dell',
    description: '48-port PoE managed switch for enterprise networks',
    stock: 11,
    featured: false,
    rating: 4.7,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41xZ4QpQ0NL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41xZ4QpQ0NL._AC_SX679_.jpg']
  },
  {
    name: 'Keysight Network Analyzer 8510C',
    category: 'Networking Tools',
    price: 12999.99,
    brand: 'Keysight',
    description: 'Professional network analysis equipment for RF testing',
    stock: 2,
    featured: false,
    rating: 4.9,
    image: 'https://images-na.ssl-images-amazon.com/images/I/41D8kNfPdyL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/41D8kNfPdyL._AC_SX679_.jpg']
  },
  {
    name: 'Ubiquiti EdgeRouter Pro',
    category: 'Routers & Gateways',
    price: 279.99,
    brand: 'Ubiquiti',
    description: 'High-performance edge router with advanced routing features',
    stock: 22,
    featured: false,
    rating: 4.6,
    image: 'https://images-na.ssl-images-amazon.com/images/I/31eMELJvkxL._AC_SX679_.jpg',
    images: ['https://images-na.ssl-images-amazon.com/images/I/31eMELJvkxL._AC_SX679_.jpg']
  }
];

async function seedProducts() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('✓ Cleared existing products');

    // Insert new products
    const inserted = await Product.insertMany(products);
    console.log(`✓ Successfully seeded ${inserted.length} products with real images!`);

    console.log('\n--- Professional Products with Real Images ---');
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Price: ${p.price} SAR | Rating: ⭐${p.rating} | Stock: ${p.stock}`);
      console.log(`   Image: ${p.image.substring(0, 80)}...`);
    });

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding products:', error.message);
    process.exit(1);
  }
}

seedProducts();
