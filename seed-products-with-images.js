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
    image: 'https://www.cisco.com/c/dam/en/us/products/switches/catalyst-9200-series/model-overview-c95-740x416.jpg',
    images: ['https://www.cisco.com/c/dam/en/us/products/switches/catalyst-9200-series/model-overview-c95-740x416.jpg']
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
    image: 'https://www.juniper.net/assets/images/products/mx-series/mx480-front-03.png',
    images: ['https://www.juniper.net/assets/images/products/mx-series/mx480-front-03.png']
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
    image: 'https://cdn.shopify.com/s/files/1/0054/1191/5190/products/cat6a.jpg',
    images: ['https://cdn.shopify.com/s/files/1/0054/1191/5190/products/cat6a.jpg']
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
    image: 'https://images.ui.com/f5fb76d0-2ef2-4c4e-81b5-aec6ab5ab8c4',
    images: ['https://images.ui.com/f5fb76d0-2ef2-4c4e-81b5-aec6ab5ab8c4']
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
    image: 'https://www.synology.com/img/product/overview/RS1219plus/rs1219-plus-01.png',
    images: ['https://www.synology.com/img/product/overview/RS1219plus/rs1219-plus-01.png']
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
    image: 'https://www.fluke.com/en-us/-/media/corporate/fluke/images/product-image/cable-testers.jpg',
    images: ['https://www.fluke.com/en-us/-/media/corporate/fluke/images/product-image/cable-testers.jpg']
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
    image: 'https://www.fortinet.com/content/dam/fortinet/images/products/fg-200f-front.jpg',
    images: ['https://www.fortinet.com/content/dam/fortinet/images/products/fg-200f-front.jpg']
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
    image: 'https://www.arista.com/assets/images/product-dcs7050.jpg',
    images: ['https://www.arista.com/assets/images/product-dcs7050.jpg']
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
    image: 'https://www.paloaltonetworks.com/content/dam/pan/en_US/images/products/appliances/pa-5220.jpg',
    images: ['https://www.paloaltonetworks.com/content/dam/pan/en_US/images/products/appliances/pa-5220.jpg']
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
    image: 'https://www.netgear.com/images/datasheet/networking/managedswitch.png',
    images: ['https://www.netgear.com/images/datasheet/networking/managedswitch.png']
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
    image: 'https://www.mikrotik.com/img/CCR2116.png',
    images: ['https://www.mikrotik.com/img/CCR2116.png']
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
    image: 'https://www.corning.com/media/images/cable-fiber.jpg',
    images: ['https://www.corning.com/media/images/cable-fiber.jpg']
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
    image: 'https://www.tp-link.com/en/business/download/EAP245.jpg',
    images: ['https://www.tp-link.com/en/business/download/EAP245.jpg']
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
    image: 'https://documents.westerndigital.com/content/dam/doc-library/en_us/assets/public/western-digital/product/nas/my-cloud-pro-series/wdmc-pr4100.jpg',
    images: ['https://documents.westerndigital.com/content/dam/doc-library/en_us/assets/public/western-digital/product/nas/my-cloud-pro-series/wdmc-pr4100.jpg']
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
    image: 'https://www.startech.com/en-us/~/media/images/products/cable-organizer-kit.jpg',
    images: ['https://www.startech.com/en-us/~/media/images/products/cable-organizer-kit.jpg']
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
    image: 'https://www.checkpoint.com/img/products/gateway-5400.jpg',
    images: ['https://www.checkpoint.com/img/products/gateway-5400.jpg']
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
    image: 'https://www.dell.com/en-us/dt/network/switches/networking-n-series/n3248p.jpg',
    images: ['https://www.dell.com/en-us/dt/network/switches/networking-n-series/n3248p.jpg']
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
    image: 'https://www.keysight.com/content/dam/keysightpublic/Images/Products/Network/Analyzers/8510C.jpg',
    images: ['https://www.keysight.com/content/dam/keysightpublic/Images/Products/Network/Analyzers/8510C.jpg']
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
    image: 'https://images.ui.com/e3d5e2d0-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
    images: ['https://images.ui.com/e3d5e2d0-1a2b-3c4d-5e6f-7a8b9c0d1e2f']
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
