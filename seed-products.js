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
    image: 'https://via.placeholder.com/300x200?text=Cisco+Switch',
    images: ['https://via.placeholder.com/500x400?text=Cisco+Switch+1', 'https://via.placeholder.com/500x400?text=Cisco+Switch+2']
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
    image: 'https://via.placeholder.com/300x200?text=Juniper+Router',
    images: ['https://via.placeholder.com/500x400?text=Juniper+Router+1']
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
    image: 'https://via.placeholder.com/300x200?text=Cat6A+Cable',
    images: ['https://via.placeholder.com/500x400?text=Cat6A+Cable+1']
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
    image: 'https://via.placeholder.com/300x200?text=Ubiquiti+AP',
    images: ['https://via.placeholder.com/500x400?text=Ubiquiti+AP+1']
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
    image: 'https://via.placeholder.com/300x200?text=Synology+NAS',
    images: ['https://via.placeholder.com/500x400?text=Synology+NAS+1']
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
    image: 'https://via.placeholder.com/300x200?text=Fluke+Tester',
    images: ['https://via.placeholder.com/500x400?text=Fluke+Tester+1']
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
    image: 'https://via.placeholder.com/300x200?text=Fortinet+Firewall',
    images: ['https://via.placeholder.com/500x400?text=Fortinet+Firewall+1']
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
    image: 'https://via.placeholder.com/300x200?text=Arista+Switch',
    images: ['https://via.placeholder.com/500x400?text=Arista+Switch+1']
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
    image: 'https://via.placeholder.com/300x200?text=PaloAlto+Firewall',
    images: ['https://via.placeholder.com/500x400?text=PaloAlto+Firewall+1']
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
    image: 'https://via.placeholder.com/300x200?text=Netgear+Switch',
    images: ['https://via.placeholder.com/500x400?text=Netgear+Switch+1']
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
    image: 'https://via.placeholder.com/300x200?text=MikroTik+Router',
    images: ['https://via.placeholder.com/500x400?text=MikroTik+Router+1']
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
    image: 'https://via.placeholder.com/300x200?text=Fiber+Optic',
    images: ['https://via.placeholder.com/500x400?text=Fiber+Optic+1']
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
    image: 'https://via.placeholder.com/300x200?text=TP-Link+AP',
    images: ['https://via.placeholder.com/500x400?text=TP-Link+AP+1']
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
    image: 'https://via.placeholder.com/300x200?text=WD+NAS',
    images: ['https://via.placeholder.com/500x400?text=WD+NAS+1']
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
    image: 'https://via.placeholder.com/300x200?text=Cable+Organizer',
    images: ['https://via.placeholder.com/500x400?text=Cable+Organizer+1']
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
    image: 'https://via.placeholder.com/300x200?text=CheckPoint+Gateway',
    images: ['https://via.placeholder.com/500x400?text=CheckPoint+Gateway+1']
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
    image: 'https://via.placeholder.com/300x200?text=Dell+Switch',
    images: ['https://via.placeholder.com/500x400?text=Dell+Switch+1']
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
    image: 'https://via.placeholder.com/300x200?text=Keysight+Analyzer',
    images: ['https://via.placeholder.com/500x400?text=Keysight+Analyzer+1']
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
    image: 'https://via.placeholder.com/300x200?text=EdgeRouter+Pro',
    images: ['https://via.placeholder.com/500x400?text=EdgeRouter+Pro+1']
  }
];

async function seedProducts() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('✓ Cleared existing products');

    // Insert new products
    const inserted = await Product.insertMany(products);
    console.log(`✓ Successfully seeded ${inserted.length} products!`);

    console.log('\n--- Sample Products Added ---');
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - ${p.price} SAR`);
    });

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding products:', error.message);
    process.exit(1);
  }
}

seedProducts();
