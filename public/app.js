const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : `${window.location.protocol}//${window.location.host}/api`;
let currentUser = null;
let currentCart = null;
let currentProducts = [];
let selectedProductId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCart();
  checkUserStatus();
});

// Load Products
async function loadProducts(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/products?${query}`);
    currentProducts = await response.json();
    displayProducts(currentProducts);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Display Products
function displayProducts(products) {
  const grid = document.getElementById('productsGrid');

  if (!products || products.length === 0) {
    grid.innerHTML = '<div class="empty-state"><h3>No products found</h3><p>Try adjusting your filters</p></div>';
    return;
  }

  grid.innerHTML = products.map(product => {
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : (product.image || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(product.name));
    return `
    <div class="product-card">
      <div class="product-image">
        <img src="${imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=' + encodeURIComponent('${product.name}')">
        ${product.bestseller ? '<span class="product-badge">Best Seller</span>' : ''}
        ${product.featured ? '<span class="product-badge">Featured</span>' : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        ${product.brand ? `<div class="product-brand">Brand: ${product.brand}</div>` : ''}
        ${product.rating ? `<div class="product-rating">★ ${product.rating.toFixed(1)} Rating</div>` : ''}
        <div class="product-price">${product.price} SAR</div>
        <div class="product-actions">
          <button class="btn-view" onclick="viewProduct('${product._id}')">View Details</button>
          <button class="btn-add-cart" onclick="quickAddToCart('${product._id}')">Add</button>
          <button class="btn-wishlist" onclick="addToWishlist('${product._id}')">❤️</button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

// View Product Details
async function viewProduct(productId) {
  try {
    selectedProductId = productId;
    const response = await fetch(`${API_BASE}/products/${productId}`);
    const product = await response.json();

    // Set main image
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : (product.image || `https://via.placeholder.com/500x554?text=${encodeURIComponent(product.name)}`);
    const detailImageEl = document.getElementById('detailImage');
    detailImageEl.src = imageUrl;
    detailImageEl.onerror = function() {
      this.src = `https://via.placeholder.com/500x554?text=${encodeURIComponent(product.name)}`;
    };

    // Setup image gallery with thumbnails
    const imageGallery = document.getElementById('imageGallery');
    if (imageGallery && product.images && product.images.length > 1) {
      imageGallery.innerHTML = product.images.map((img, idx) =>
        `<img src="${img}" alt="Image ${idx + 1}" class="gallery-thumbnail" onclick="changeDetailImage('${img}')" title="Image ${idx + 1}">`
      ).join('');
    } else if (imageGallery) {
      imageGallery.innerHTML = '';
    }

    // Product Header Info
    document.getElementById('detailName').textContent = product.name;
    document.getElementById('detailBrand').textContent = `${product.brand || 'Unknown Brand'}`;
    document.getElementById('detailCategory').textContent = `Category: ${product.category}`;

    // Rating
    document.getElementById('detailRating').textContent = `★ ${product.rating ? product.rating.toFixed(1) : 'N/A'} / 5.0 Rating`;

    // Price Calculation (15% tax)
    const tax = product.price * 0.15;
    const total = product.price + tax;
    document.getElementById('productPriceDisplay').textContent = `${product.price.toFixed(2)} SAR`;
    document.getElementById('productTaxDisplay').textContent = `${tax.toFixed(2)} SAR`;
    document.getElementById('detailPrice').textContent = `${total.toFixed(2)} SAR`;

    // Stock Status
    const stockDiv = document.getElementById('detailStock');
    if (product.stock > 0) {
      stockDiv.className = 'stock-badge in-stock';
      stockDiv.innerHTML = `<span class="stock-icon">✓</span> In Stock (${product.stock} available)`;
    } else {
      stockDiv.className = 'stock-badge out-of-stock';
      stockDiv.innerHTML = `<span class="stock-icon">✗</span> Out of Stock`;
    }

    // Quantity Input - set max stock
    const quantityInput = document.getElementById('quantityInput');
    quantityInput.value = 1;
    quantityInput.dataset.max = product.stock;
    quantityInput.disabled = product.stock === 0;

    // Specifications
    let specsHtml = '';
    if (product.specifications && Object.keys(product.specifications).length > 0) {
      specsHtml = '<table class="specs-table">';
      Object.entries(product.specifications).forEach(([key, value]) => {
        specsHtml += `<tr><td class="spec-key">${key}</td><td class="spec-value">${value}</td></tr>`;
      });
      specsHtml += '</table>';
    } else {
      specsHtml = '<p class="no-specs">No specifications available</p>';
    }
    document.getElementById('detailSpecs').innerHTML = specsHtml;

    // Description
    document.getElementById('detailDescription').innerHTML = product.description ? `<p>${product.description}</p>` : '<p class="no-description">No description available</p>';

    // Load related products
    loadRelatedProducts(product.category, productId);

    // Reset to first tab
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-description').classList.add('active');
    document.querySelector('.tab-button').classList.add('active');

    // Show modal
    document.getElementById('productModal').style.display = 'block';
  } catch (error) {
    console.error('Error loading product:', error);
    showToast('Error loading product details', 'error');
  }
}

// Add to Cart
async function addToCart() {
  if (!currentUser) {
    alert('Please login first');
    openAccount();
    return;
  }

  const quantity = parseInt(document.getElementById('quantityInput').value) || 1;

  try {
    const response = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser._id,
        productId: selectedProductId,
        quantity: quantity,
      }),
    });

    if (response.ok) {
      showToast('✓ Product added to cart!', 'success');
      loadCart();
      setTimeout(() => closeModal(), 800);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Error adding to cart');
  }
}

// Quick Add to Cart
async function quickAddToCart(productId) {
  if (!currentUser) {
    alert('Please login first');
    openAccount();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser._id,
        productId: productId,
        quantity: 1,
      }),
    });

    if (response.ok) {
      alert('Product added to cart!');
      loadCart();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Load Cart
async function loadCart() {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_BASE}/cart/${currentUser._id}`);
    if (response.ok) {
      currentCart = await response.json();
      updateCartCount();
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
}

// Update Cart Count
function updateCartCount() {
  const count = currentCart?.items?.length || 0;
  document.getElementById('cartCount').textContent = count;
}

// Open Cart
function openCart() {
  if (!currentUser) {
    alert('Please login first');
    openAccount();
    return;
  }

  const cartDiv = document.getElementById('cartItems');

  if (!currentCart || currentCart.items.length === 0) {
    cartDiv.innerHTML = '<p style="text-align: center; padding: 30px;">Your cart is empty</p>';
  } else {
    cartDiv.innerHTML = currentCart.items.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.productId?.name || 'Product'}</div>
          <div class="cart-item-price">${item.price} SAR × ${item.quantity}</div>
        </div>
        <div class="cart-item-quantity">
          <input type="number" value="${item.quantity}" min="1" onchange="updateCartItem('${item.productId._id}', this.value)">
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.productId._id}')">Remove</button>
      </div>
    `).join('');
  }

  document.getElementById('cartTotal').textContent = currentCart?.total || 0;
  document.getElementById('cartModal').style.display = 'block';
}

// Remove from Cart
async function removeFromCart(productId) {
  try {
    const response = await fetch(`${API_BASE}/cart/remove/${currentUser._id}/${productId}`, {
      method: 'POST',
    });

    if (response.ok) {
      loadCart();
      openCart();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Checkout
function checkout() {
  if (!currentCart || currentCart.items.length === 0) {
    alert('Cart is empty');
    return;
  }

  document.getElementById('checkoutTotal').textContent = `Total: ${currentCart.total} SAR`;
  document.getElementById('checkoutModal').style.display = 'block';
  closeCartModal();
}

// Place Order
async function placeOrder(event) {
  event.preventDefault();

  const shippingAddress = document.getElementById('shippingAddress').value;
  const phone = document.getElementById('phoneNumber').value;

  if (!shippingAddress || !phone) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser._id,
        shippingAddress: shippingAddress,
      }),
    });

    if (response.ok) {
      const order = await response.json();
      alert(`Order placed successfully! Order Number: ${order.orderNumber}`);
      loadCart();
      closeCheckoutModal();
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error placing order');
  }
}

// Add to Wishlist
async function addToWishlist(productId = null) {
  if (!currentUser) {
    alert('Please login first');
    openAccount();
    return;
  }

  const id = productId || selectedProductId;

  try {
    const response = await fetch(`${API_BASE}/users/${currentUser._id}/wishlist/${id}`, {
      method: 'POST',
    });

    if (response.ok) {
      alert('Added to wishlist!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// User Authentication
function openAccount() {
  let content = document.getElementById('accountContent');

  if (currentUser) {
    content.innerHTML = `
      <div>
        <h3>Welcome, ${currentUser.name}!</h3>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Phone:</strong> ${currentUser.phone || 'Not provided'}</p>
        <p><strong>Address:</strong> ${currentUser.address || 'Not provided'}</p>
        <button class="btn btn-primary" onclick="logout()" style="width: 100%; padding: 12px; margin-top: 20px;">Logout</button>
      </div>
    `;
  } else {
    content.innerHTML = `
      <div style="margin-top: 20px;">
        <div id="loginForm">
          <h3>Login</h3>
          <form onsubmit="handleLogin(event)">
            <div class="form-group">
              <input type="email" id="loginEmail" placeholder="Email" required>
            </div>
            <div class="form-group">
              <input type="password" id="loginPassword" placeholder="Password" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px;">Login</button>
          </form>
          <div class="auth-toggle">
            <p>Don't have an account? <a onclick="showRegister()">Register</a></p>
          </div>
        </div>

        <div id="registerForm" style="display: none;">
          <h3>Register</h3>
          <form onsubmit="handleRegister(event)">
            <div class="form-group">
              <input type="text" id="regName" placeholder="Full Name" required>
            </div>
            <div class="form-group">
              <input type="email" id="regEmail" placeholder="Email" required>
            </div>
            <div class="form-group">
              <input type="password" id="regPassword" placeholder="Password" required>
            </div>
            <div class="form-group">
              <input type="tel" id="regPhone" placeholder="Phone">
            </div>
            <div class="form-group">
              <input type="text" id="regAddress" placeholder="Address">
            </div>
            <div class="form-group">
              <input type="text" id="regCity" placeholder="City">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px;">Register</button>
          </form>
          <div class="auth-toggle">
            <p>Already have an account? <a onclick="showLogin()">Login</a></p>
          </div>
        </div>
      </div>
    `;
  }

  document.getElementById('accountModal').style.display = 'block';
}

// Handle Login
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.status === 200 && data.user) {
      currentUser = data.user;
      localStorage.setItem('token', data.token);
      loadCart();
      checkUserStatus();
      alert('Logged in successfully!');
      closeAccountModal();
    } else {
      alert(data.message || 'Invalid email or password');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error logging in. Please try again.');
  }
}

// Handle Register
async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const phone = document.getElementById('regPhone').value;
  const address = document.getElementById('regAddress').value;
  const city = document.getElementById('regCity').value;

  try {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, address, city, country: 'Saudi Arabia' }),
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      localStorage.setItem('token', data.token);
      loadCart();
      checkUserStatus();
      alert('Account created successfully!');
      closeAccountModal();
    } else {
      alert('Error creating account');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Show/Hide Forms
function showRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

// Logout
function logout() {
  currentUser = null;
  localStorage.removeItem('token');
  closeAccountModal();
  alert('Logged out successfully!');
}

// Check User Status
function checkUserStatus() {
  const token = localStorage.getItem('token');
  if (token) {
    // In a real app, validate token with backend
  }
}

// Filter & Search Functions
function filterByCategory(category) {
  if (category === 'all') {
    loadProducts();
  } else {
    loadProducts({ category });
  }
}

function filterByPrice(maxPrice) {
  document.getElementById('priceDisplay').textContent = `0 - ${maxPrice} SAR`;
  // Filter logic can be implemented
}

function filterByBrand(brand) {
  if (brand) {
    // Filter logic
  }
}

function sortProducts(sortType) {
  if (sortType) {
    loadProducts({ sort: sortType });
  } else {
    loadProducts();
  }
}

function searchProducts() {
  const query = document.getElementById('searchInput').value;
  if (query) {
    loadProducts({ search: query });
  } else {
    loadProducts();
  }
}

// Change detail image in gallery
function changeDetailImage(imageUrl) {
  document.getElementById('detailImage').src = imageUrl;
}

// Professional Product Modal Functions

// Switch between product tabs
function switchProductTab(tabName) {
  // Hide all tabs
  const tabPanes = document.querySelectorAll('.tab-pane');
  tabPanes.forEach(pane => pane.classList.remove('active'));

  // Remove active class from buttons
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(btn => btn.classList.remove('active'));

  // Show selected tab
  document.getElementById(`tab-${tabName}`).classList.add('active');
  event.target.classList.add('active');
}

// Increment quantity
function incrementQuantity() {
  const input = document.getElementById('quantityInput');
  const max = parseInt(document.getElementById('quantityInput').dataset.max) || 999;
  if (parseInt(input.value) < max) {
    input.value = parseInt(input.value) + 1;
  }
}

// Decrement quantity
function decrementQuantity() {
  const input = document.getElementById('quantityInput');
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Load related products
async function loadRelatedProducts(category, currentProductId) {
  try {
    const response = await fetch(`${API_BASE}/products?category=${category}`);
    const products = await response.json();

    // Filter out current product and get max 4 items
    const related = products.filter(p => p._id !== currentProductId).slice(0, 4);

    const container = document.getElementById('relatedProductsContainer');
    if (related.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No related products found</p>';
      return;
    }

    container.innerHTML = related.map(product => {
      const imageUrl = product.images && product.images.length > 0 ? product.images[0] : (product.image || 'https://via.placeholder.com/200x150');
      return `
        <div class="related-product-card">
          <div class="related-product-image">
            <img src="${imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200x150'">
          </div>
          <div class="related-product-info">
            <h4 class="related-product-name">${product.name}</h4>
            <p class="related-product-price">${product.price} SAR</p>
            <button class="btn-quick-view" onclick="viewProduct('${product._id}')">View</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading related products:', error);
  }
}

// Modal Controls
function closeModal() {
  document.getElementById('productModal').style.display = 'none';
}

function closeCartModal() {
  document.getElementById('cartModal').style.display = 'none';
}

function closeAccountModal() {
  document.getElementById('accountModal').style.display = 'none';
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal').style.display = 'none';
}

function closeAdminModal() {
  document.getElementById('adminModal').style.display = 'none';
}

// Close modals when clicking outside
window.onclick = function(event) {
  const productModal = document.getElementById('productModal');
  const cartModal = document.getElementById('cartModal');
  const accountModal = document.getElementById('accountModal');
  const checkoutModal = document.getElementById('checkoutModal');
  const adminModal = document.getElementById('adminModal');

  if (event.target === productModal) productModal.style.display = 'none';
  if (event.target === cartModal) cartModal.style.display = 'none';
  if (event.target === accountModal) accountModal.style.display = 'none';
  if (event.target === checkoutModal) checkoutModal.style.display = 'none';
  if (event.target === adminModal) adminModal.style.display = 'none';
};

// Utilities
function scrollToProducts() {
  document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
}

function toggleLanguage() {
  alert('Language toggle feature coming soon!');
}

function subscribeNewsletter() {
  const email = document.getElementById('newsletterEmail').value;
  if (email) {
    alert('Thank you for subscribing!');
    document.getElementById('newsletterEmail').value = '';
  }
}

// ===== ADMIN PANEL FUNCTIONS =====

function openAdminPanel() {
  if (!currentUser || currentUser.role !== 'admin') {
    alert('Admin access required!');
    return;
  }
  document.getElementById('adminModal').style.display = 'block';
  showAdminTab('products');
}

function showAdminTab(tab) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  const content = document.getElementById('adminContent');
  if (tab === 'products') {
    loadAdminProducts();
  } else if (tab === 'add') {
    showAddProductForm();
  } else if (tab === 'scrape') {
    showScrapeForm();
  }
}

async function loadAdminProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();

    let html = '<h3>Product Inventory</h3>';

    if (products.length === 0) {
      html += '<div class="admin-no-products"><p>No products found</p></div>';
    } else {
      html += `
        <table class="admin-products-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price (SAR)</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;

      products.forEach(product => {
        html += `
          <tr>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td>${product.price}</td>
            <td>${product.stock}</td>
            <td>${product.rating ? product.rating.toFixed(1) : 'N/A'}</td>
            <td class="admin-actions">
              <button class="btn-edit" onclick="showEditProductForm('${product._id}')">Edit</button>
              <button class="btn-delete" onclick="deleteProduct('${product._id}')">Delete</button>
            </td>
          </tr>
        `;
      });

      html += '</tbody></table>';
    }

    document.getElementById('adminContent').innerHTML = html;
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('adminContent').innerHTML = '<p>Error loading products</p>';
  }
}

function showAddProductForm() {
  const categories = [
    'Network Switches',
    'Routers & Gateways',
    'Network Cables',
    'Wireless Access Points',
    'Network Storage',
    'Networking Tools',
    'Security & Firewalls',
    'Modems & Converters',
    'Patch Panels',
    'Access Control Systems',
    'Door Lock Systems',
    'RFID Readers',
    'Keypads & Keyboards',
    'Biometric Devices',
    'Surveillance Cameras',
    'DVR/NVR Systems',
    'Network Monitors',
    'Power Supplies',
    'UPS & Battery Backup',
    'Cables & Connectors',
    'Switches & Hubs',
    'Firewalls & UTM',
    'Load Balancers',
    'VPN Gateways',
    'Servers & Workstations',
    'Storage Devices',
    'Memory Modules',
    'Processors & CPUs',
    'Motherboards',
    'Graphics Cards',
    'Network Interface Cards',
    'Cooling Systems',
    'Power Management',
    'Racks & Enclosures',
    'Cable Management',
    'Patch Cords',
    'Fiber Optic',
    'Ethernet Cables',
    'Coaxial Cables',
    'USB Cables',
    'Audio/Video Cables',
    'Adapters & Converters',
    'Network Accessories',
    'Electronic Accessories',
    'Miscellaneous'
  ];

  let html = '<h3>Add New Product</h3><form class="admin-form" id="productForm">';

  html += `
    <div class="admin-form-row">
      <div>
        <label>Product Name *</label>
        <input type="text" id="productName" required>
      </div>
      <div>
        <label>Category *</label>
        <select id="productCategory" required>
          <option value="">Select Category</option>
          ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="admin-form-row">
      <div>
        <label>Price (SAR) *</label>
        <input type="number" id="productPrice" step="0.01" required>
      </div>
      <div>
        <label>Stock Quantity</label>
        <input type="number" id="productStock" value="0">
      </div>
    </div>

    <div class="admin-form-row">
      <div>
        <label>Brand</label>
        <input type="text" id="productBrand">
      </div>
      <div>
        <label>Rating (0-5)</label>
        <input type="number" id="productRating" min="0" max="5" step="0.1" value="0">
      </div>
    </div>

    <div class="admin-form-row full">
      <div>
        <label>Product Images (Max 5)</label>
        <div id="imageUploadContainer" class="image-upload-container">
          <div id="imageUploadSlots" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-top: 20px;">
            <div class="image-upload-slot">
              <input type="file" id="imageFile0" accept="image/jpeg,image/jpg,image/png,image/webp" onchange="previewProductImage(0)" style="display: none;">
              <label for="imageFile0" class="image-upload-btn">
                <span class="upload-icon">📷</span>
                <span>Upload Image 1</span>
              </label>
              <div id="preview0" class="image-preview-box"></div>
            </div>
            <div class="image-upload-slot">
              <input type="file" id="imageFile1" accept="image/jpeg,image/jpg,image/png,image/webp" onchange="previewProductImage(1)" style="display: none;">
              <label for="imageFile1" class="image-upload-btn">
                <span class="upload-icon">📷</span>
                <span>Upload Image 2</span>
              </label>
              <div id="preview1" class="image-preview-box"></div>
            </div>
            <div class="image-upload-slot">
              <input type="file" id="imageFile2" accept="image/jpeg,image/jpg,image/png,image/webp" onchange="previewProductImage(2)" style="display: none;">
              <label for="imageFile2" class="image-upload-btn">
                <span class="upload-icon">📷</span>
                <span>Upload Image 3</span>
              </label>
              <div id="preview2" class="image-preview-box"></div>
            </div>
            <div class="image-upload-slot">
              <input type="file" id="imageFile3" accept="image/jpeg,image/jpg,image/png,image/webp" onchange="previewProductImage(3)" style="display: none;">
              <label for="imageFile3" class="image-upload-btn">
                <span class="upload-icon">📷</span>
                <span>Upload Image 4</span>
              </label>
              <div id="preview3" class="image-preview-box"></div>
            </div>
            <div class="image-upload-slot">
              <input type="file" id="imageFile4" accept="image/jpeg,image/jpg,image/png,image/webp" onchange="previewProductImage(4)" style="display: none;">
              <label for="imageFile4" class="image-upload-btn">
                <span class="upload-icon">📷</span>
                <span>Upload Image 5</span>
              </label>
              <div id="preview4" class="image-preview-box"></div>
            </div>
          </div>
          <div id="uploadStatus" style="margin-top: 20px; font-size: 14px; text-align: center; font-weight: 500;"></div>
        </div>
      </div>
    </div>

    <div class="admin-form-row full">
      <div>
        <label>Description</label>
        <textarea id="productDescription" placeholder="Product description"></textarea>
      </div>
    </div>

    <div class="admin-form-row full">
      <div>
        <label>Specifications (optional - JSON or plain text)</label>
        <textarea id="productSpecs" placeholder='Ports: 48&#10;Management: Managed&#10;&#10;OR: {"ports": "48", "management": "Managed"}'></textarea>
      </div>
    </div>

    <div class="admin-checkbox-group">
      <label>
        <input type="checkbox" id="productFeatured">
        Featured Product
      </label>
      <label>
        <input type="checkbox" id="productBestseller">
        Bestseller
      </label>
    </div>

    <div class="admin-form-actions">
      <button type="button" class="btn-submit" onclick="createProduct(event)">Add Product</button>
      <button type="button" class="btn-cancel" onclick="showAdminTab('products')">Cancel</button>
    </div>
  </form>`;

  document.getElementById('adminContent').innerHTML = html;
}

// Preview product image in slot
function previewProductImage(slot) {
  const fileInput = document.getElementById(`imageFile${slot}`);
  const preview = document.getElementById(`preview${slot}`);
  const uploadSlot = fileInput.closest('.image-upload-slot');
  const uploadBtn = uploadSlot.querySelector('.image-upload-btn');

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview ${slot + 1}">`;
      preview.classList.add('has-image');
      uploadBtn.style.opacity = '0.3';
      uploadBtn.style.pointerEvents = 'none';
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
}

// Upload all product images
async function uploadAllProductImages() {
  const uploadedImages = [];
  const statusDiv = document.getElementById('uploadStatus');

  statusDiv.innerHTML = '<span style="color: #0052cc;">⏳ Uploading images...</span>';

  for (let i = 0; i < 5; i++) {
    const fileInput = document.getElementById(`imageFile${i}`);

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];

      if (file.size > 5 * 1024 * 1024) {
        statusDiv.innerHTML = `<span style="color: #ff4444;">✗ Image ${i + 1} too large (max 5MB)</span>`;
        return null;
      }

      const formData = new FormData();
      formData.append('images', file);

      try {
        const response = await fetch(`${API_BASE}/products/upload`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          uploadedImages.push(...data.imageUrls);
        } else {
          statusDiv.innerHTML = `<span style="color: #ff4444;">✗ Failed to upload image ${i + 1}</span>`;
          return null;
        }
      } catch (error) {
        console.error(`Error uploading image ${i + 1}:`, error);
        statusDiv.innerHTML = `<span style="color: #ff4444;">✗ Upload error on image ${i + 1}</span>`;
        return null;
      }
    }
  }

  if (uploadedImages.length > 0) {
    statusDiv.innerHTML = `<span style="color: #28a745;">✓ ${uploadedImages.length} image(s) uploaded successfully</span>`;
    window.uploadedProductImages = uploadedImages;
    return uploadedImages;
  }

  return [];
}

async function createProduct(event) {
  event.preventDefault();

  // Get form values first
  const name = document.getElementById('productName').value;
  const category = document.getElementById('productCategory').value;
  const priceValue = document.getElementById('productPrice').value;

  // Validate required fields
  if (!name || !name.trim()) {
    alert('Please enter product name');
    return;
  }
  if (!category) {
    alert('Please select a category');
    return;
  }
  if (!priceValue) {
    alert('Please enter product price');
    return;
  }

  const price = parseFloat(priceValue);
  const stock = parseInt(document.getElementById('productStock').value) || 0;
  const brand = document.getElementById('productBrand').value;
  const rating = parseFloat(document.getElementById('productRating').value) || 0;
  const description = document.getElementById('productDescription').value;
  const featured = document.getElementById('productFeatured').checked;
  const bestseller = document.getElementById('productBestseller').checked;

  // Upload images
  const uploadedImages = await uploadAllProductImages();
  if (uploadedImages === null) {
    return;
  }

  if (uploadedImages.length === 0) {
    alert('Please upload at least one product image');
    return;
  }

  let specifications = {};
  const specsText = document.getElementById('productSpecs').value.trim();
  if (specsText) {
    // Try to parse as JSON first
    try {
      specifications = JSON.parse(specsText);
    } catch (e) {
      // If not JSON, treat as plain text or key-value pairs
      // Split by newlines and create key-value pairs
      const lines = specsText.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key) {
          specifications[key] = value || '';
        }
      });
    }
  }

  const product = {
    name,
    category,
    price,
    stock,
    brand,
    rating,
    image: uploadedImages[0],
    images: uploadedImages,
    description,
    specifications,
    featured,
    bestseller
  };

  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    if (response.ok) {
      alert('Product added successfully!');
      loadAdminProducts();
      showAdminTab('products');
      loadProducts();
    } else {
      try {
        const errorData = await response.json();
        alert('Error adding product: ' + (errorData.message || 'Unknown error'));
        console.error('Server error:', errorData);
      } catch (e) {
        alert('Error adding product (HTTP ' + response.status + ')');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error adding product: ' + error.message);
  }
}

async function showEditProductForm(productId) {
  try {
    const response = await fetch(`${API_BASE}/products/${productId}`);
    const product = await response.json();

    const categories = [
      'Network Switches',
      'Routers & Gateways',
      'Network Cables',
      'Wireless Access Points',
      'Network Storage',
      'Networking Tools',
      'Security & Firewalls',
      'Modems & Converters',
      'Patch Panels',
      'Access Control Systems',
      'Door Lock Systems',
      'RFID Readers',
      'Keypads & Keyboards',
      'Biometric Devices',
      'Surveillance Cameras',
      'DVR/NVR Systems',
      'Network Monitors',
      'Power Supplies',
      'UPS & Battery Backup',
      'Cables & Connectors',
      'Switches & Hubs',
      'Firewalls & UTM',
      'Load Balancers',
      'VPN Gateways',
      'Servers & Workstations',
      'Storage Devices',
      'Memory Modules',
      'Processors & CPUs',
      'Motherboards',
      'Graphics Cards',
      'Network Interface Cards',
      'Cooling Systems',
      'Power Management',
      'Racks & Enclosures',
      'Cable Management',
      'Patch Cords',
      'Fiber Optic',
      'Ethernet Cables',
      'Coaxial Cables',
      'USB Cables',
      'Audio/Video Cables',
      'Adapters & Converters',
      'Network Accessories',
      'Electronic Accessories',
      'Miscellaneous'
    ];

    let html = '<h3>Edit Product</h3><form class="admin-form" id="editProductForm">';

    html += `
      <div class="admin-form-row">
        <div>
          <label>Product Name *</label>
          <input type="text" id="editProductName" value="${product.name}" required>
        </div>
        <div>
          <label>Category *</label>
          <select id="editProductCategory" required>
            ${categories.map(cat => `<option value="${cat}" ${cat === product.category ? 'selected' : ''}>${cat}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="admin-form-row">
        <div>
          <label>Price (SAR) *</label>
          <input type="number" id="editProductPrice" step="0.01" value="${product.price}" required>
        </div>
        <div>
          <label>Stock Quantity</label>
          <input type="number" id="editProductStock" value="${product.stock}">
        </div>
      </div>

      <div class="admin-form-row">
        <div>
          <label>Brand</label>
          <input type="text" id="editProductBrand" value="${product.brand || ''}">
        </div>
        <div>
          <label>Rating (0-5)</label>
          <input type="number" id="editProductRating" min="0" max="5" step="0.1" value="${product.rating || 0}">
        </div>
      </div>

      <div class="admin-form-row full">
        <div>
          <label>Description</label>
          <textarea id="editProductDescription">${product.description || ''}</textarea>
        </div>
      </div>

      <div class="admin-form-row full">
        <div>
          <label>Specifications (JSON format)</label>
          <textarea id="editProductSpecs">${JSON.stringify(product.specifications || {}, null, 2)}</textarea>
        </div>
      </div>

      <div class="admin-checkbox-group">
        <label>
          <input type="checkbox" id="editProductFeatured" ${product.featured ? 'checked' : ''}>
          Featured Product
        </label>
        <label>
          <input type="checkbox" id="editProductBestseller" ${product.bestseller ? 'checked' : ''}>
          Bestseller
        </label>
      </div>

      <div class="admin-form-actions">
        <button type="button" class="btn-submit" onclick="updateProduct('${productId}', event)">Update Product</button>
        <button type="button" class="btn-cancel" onclick="loadAdminProducts()">Cancel</button>
      </div>
    </form>`;

    document.getElementById('adminContent').innerHTML = html;
  } catch (error) {
    console.error('Error:', error);
    alert('Error loading product');
  }
}

async function updateProduct(productId, event) {
  event.preventDefault();

  const name = document.getElementById('editProductName').value;
  const category = document.getElementById('editProductCategory').value;
  const price = parseFloat(document.getElementById('editProductPrice').value);
  const stock = parseInt(document.getElementById('editProductStock').value) || 0;
  const brand = document.getElementById('editProductBrand').value;
  const rating = parseFloat(document.getElementById('editProductRating').value) || 0;
  const description = document.getElementById('editProductDescription').value;
  const featured = document.getElementById('editProductFeatured').checked;
  const bestseller = document.getElementById('editProductBestseller').checked;

  let specifications = {};
  const specsText = document.getElementById('editProductSpecs').value.trim();
  if (specsText) {
    // Try to parse as JSON first
    try {
      specifications = JSON.parse(specsText);
    } catch (e) {
      // If not JSON, treat as plain text or key-value pairs
      // Split by newlines and create key-value pairs
      const lines = specsText.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key) {
          specifications[key] = value || '';
        }
      });
    }
  }

  const product = {
    name,
    category,
    price,
    stock,
    brand,
    rating,
    description,
    specifications,
    featured,
    bestseller
  };

  try {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    if (response.ok) {
      alert('Product updated successfully!');
      loadAdminProducts();
      loadProducts();
    } else {
      alert('Error updating product');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error updating product');
  }
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('Product deleted successfully!');
      loadAdminProducts();
      loadProducts();
    } else {
      alert('Error deleting product');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error deleting product');
  }
}

// URL SCRAPING FUNCTIONS

function showScrapeForm() {
  let html = `
    <h3>📋 Add Product from Link or Upload</h3>
    <p style="color: #666; margin-bottom: 20px;">
      Paste a product URL from another website and we'll automatically extract the details. You can also upload your own product image or use the scraped one.
    </p>

    <div class="scrape-url-section" style="margin-bottom: 30px;">
      <label style="font-weight: bold; margin-bottom: 10px; display: block;">Product URL</label>
      <div style="display: flex; gap: 10px;">
        <input
          type="url"
          id="scrapeUrl"
          placeholder="https://example.com/product/..."
          style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 4px;"
        >
        <button
          class="btn-submit"
          onclick="fetchProductFromUrl()"
          style="padding: 12px 30px; white-space: nowrap;"
        >
          🔍 Fetch Details
        </button>
      </div>
      <div id="scrapeStatus" style="margin-top: 10px; font-size: 14px;"></div>
    </div>

    <div id="scrapeFormContainer">
      <!-- Product form will be loaded here after scraping -->
    </div>
  `;

  document.getElementById('adminContent').innerHTML = html;
}

async function fetchProductFromUrl() {
  const url = document.getElementById('scrapeUrl').value;
  const statusDiv = document.getElementById('scrapeStatus');

  if (!url) {
    statusDiv.innerHTML = '<span style="color: #ff4444;">Please enter a URL</span>';
    return;
  }

  statusDiv.innerHTML = '<span style="color: #0052cc;">⏳ Fetching product details...</span>';

  try {
    const response = await fetch(`${API_BASE}/products/scrape-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (response.ok) {
      const scrapedData = await response.json();
      statusDiv.innerHTML = '<span style="color: #28a745;">✓ Product details fetched! Review and edit below.</span>';

      showScrapedProductForm(scrapedData);
    } else {
      const error = await response.json();
      statusDiv.innerHTML = `<span style="color: #ff4444;">✗ ${error.message}</span>`;
    }
  } catch (error) {
    console.error('Error:', error);
    statusDiv.innerHTML = '<span style="color: #ff4444;">✗ Failed to fetch product details. Please check the URL and try again.</span>';
  }
}

function showScrapedProductForm(scrapedData) {
  const categories = [
    'Network Switches', 'Routers & Gateways', 'Network Cables',
    'Wireless Access Points', 'Network Storage', 'Networking Tools',
    'Security & Firewalls', 'Modems & Converters', 'Patch Panels',
    'Access Control Systems', 'Door Lock Systems', 'RFID Readers',
    'Keypads & Keyboards', 'Biometric Devices', 'Surveillance Cameras',
    'DVR/NVR Systems', 'Network Monitors', 'Power Supplies',
    'UPS & Battery Backup', 'Cables & Connectors', 'Switches & Hubs',
    'Firewalls & UTM', 'Load Balancers', 'VPN Gateways',
    'Servers & Workstations', 'Storage Devices', 'Memory Modules',
    'Processors & CPUs', 'Motherboards', 'Graphics Cards',
    'Network Interface Cards', 'Cooling Systems', 'Power Management',
    'Racks & Enclosures', 'Cable Management', 'Patch Cords',
    'Fiber Optic', 'Ethernet Cables', 'Coaxial Cables',
    'USB Cables', 'Audio/Video Cables', 'Adapters & Converters',
    'Network Accessories', 'Electronic Accessories', 'Miscellaneous'
  ];

  let html = '<h4>Review & Edit Product Details</h4>';
  html += '<form class="admin-form" id="scrapedProductForm">';

  html += `
    <div class="admin-form-row">
      <div>
        <label>Product Name *</label>
        <input type="text" id="scrapedProductName" value="${scrapedData.name || ''}" required>
      </div>
      <div>
        <label>Category * <small>(Select manually)</small></label>
        <select id="scrapedProductCategory" required>
          <option value="">Select Category</option>
          ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="admin-form-row">
      <div>
        <label>Price (SAR) *</label>
        <input type="number" id="scrapedProductPrice" value="${scrapedData.price || ''}" step="0.01" required>
      </div>
      <div>
        <label>Stock Quantity</label>
        <input type="number" id="scrapedProductStock" value="0">
      </div>
    </div>

    <div class="admin-form-row">
      <div>
        <label>Brand</label>
        <input type="text" id="scrapedProductBrand" value="">
      </div>
      <div>
        <label>Rating (0-5)</label>
        <input type="number" id="scrapedProductRating" min="0" max="5" step="0.1" value="0">
      </div>
    </div>

    <div class="admin-form-row full">
      <div>
        <label>Product Image</label>
        <div style="margin-bottom: 10px;">
          <input type="radio" name="scrapedImageOption" id="scrapedImageOptionUrl" value="url" checked>
          <label for="scrapedImageOptionUrl" style="font-weight: normal; margin-left: 5px;">Use Scraped Image</label>

          <input type="radio" name="scrapedImageOption" id="scrapedImageOptionUpload" value="upload" style="margin-left: 20px;">
          <label for="scrapedImageOptionUpload" style="font-weight: normal; margin-left: 5px;">Upload New Image</label>
        </div>

        <div id="scrapedImageUrlSection">
          <input type="url" id="scrapedProductImage" value="${scrapedData.image || ''}" placeholder="https://...">
          ${scrapedData.image ? `<img src="${scrapedData.image}" style="max-width: 200px; margin-top: 10px; border: 1px solid #ddd; border-radius: 4px;" onerror="this.style.display='none'">` : ''}
        </div>

        <div id="scrapedImageUploadSection" style="display: none;">
          <input type="file" id="scrapedProductImageUpload" accept="image/jpeg,image/jpg,image/png,image/webp" style="display: none;" multiple>

          <!-- Drag & Drop Zone -->
          <div id="scrapedImageDropZone" style="
            border: 2px dashed #0052cc;
            border-radius: 8px;
            padding: 40px 20px;
            text-align: center;
            background-color: #f8f9ff;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
          " onmouseover="this.style.backgroundColor='#e8ebff'; this.style.borderColor='#0040a0';" onmouseout="this.style.backgroundColor='#f8f9ff'; this.style.borderColor='#0052cc';">
            <div style="font-size: 48px; margin-bottom: 10px;">📷</div>
            <div style="font-size: 16px; font-weight: bold; color: #0052cc; margin-bottom: 5px;">Drag images here</div>
            <div style="font-size: 13px; color: #666; margin-bottom: 15px;">or click to select files</div>
            <div style="font-size: 12px; color: #999;">Supported: JPG, PNG, WebP (Max 5MB per image)</div>
            <label for="scrapedProductImageUpload" class="image-upload-btn" style="display: inline-block; margin-top: 10px;">
              <span class="upload-icon">📁</span>
              <span>Choose File</span>
            </label>
          </div>

          <!-- Image Preview Gallery -->
          <div id="scrapedUploadPreviewGallery" style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
            min-height: 120px;
          "></div>

          <!-- Status Message -->
          <div id="scrapedUploadStatus" style="
            margin-top: 10px;
            padding: 12px;
            border-radius: 4px;
            font-size: 13px;
            text-align: center;
            display: none;
          "></div>

          <script>
            const dropZone = document.getElementById('scrapedImageDropZone');
            const fileInput = document.getElementById('scrapedProductImageUpload');
            const previewGallery = document.getElementById('scrapedUploadPreviewGallery');
            const uploadStatus = document.getElementById('scrapedUploadStatus');

            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
              dropZone.addEventListener(eventName, preventDefaults, false);
            });

            function preventDefaults(e) {
              e.preventDefault();
              e.stopPropagation();
            }

            // Highlight drop zone when item is dragged over it
            ['dragenter', 'dragover'].forEach(eventName => {
              dropZone.addEventListener(eventName, () => {
                dropZone.style.backgroundColor = '#e8ebff';
                dropZone.style.borderColor = '#0040a0';
              });
            });

            ['dragleave', 'drop'].forEach(eventName => {
              dropZone.addEventListener(eventName, () => {
                dropZone.style.backgroundColor = '#f8f9ff';
                dropZone.style.borderColor = '#0052cc';
              });
            });

            // Handle drop
            dropZone.addEventListener('drop', (e) => {
              const dt = e.dataTransfer;
              const files = dt.files;
              fileInput.files = files;
              handleFiles(files);
            });

            // Handle file selection from input
            fileInput.addEventListener('change', (e) => {
              handleFiles(e.target.files);
            });

            // Handle file preview
            function handleFiles(files) {
              previewGallery.innerHTML = '';
              let totalSize = 0;

              Array.from(files).forEach((file, index) => {
                if (!file.type.match('image.*')) {
                  showStatus('❌ Only image files are allowed!', '#ff4444');
                  return;
                }

                if (file.size > 5 * 1024 * 1024) {
                  showStatus('❌ File size exceeds 5MB limit!', '#ff4444');
                  return;
                }

                totalSize += file.size;
                const reader = new FileReader();

                reader.onload = (e) => {
                  const previewDiv = document.createElement('div');
                  previewDiv.style.position = 'relative';
                  previewDiv.style.borderRadius = '8px';
                  previewDiv.style.overflow = 'hidden';
                  previewDiv.style.border = '1px solid #ddd';
                  previewDiv.style.aspectRatio = '1';

                  const img = document.createElement('img');
                  img.src = e.target.result;
                  img.style.width = '100%';
                  img.style.height = '100%';
                  img.style.objectFit = 'cover';

                  const removeBtn = document.createElement('button');
                  removeBtn.type = 'button';
                  removeBtn.innerHTML = '✕';
                  removeBtn.style.position = 'absolute';
                  removeBtn.style.top = '5px';
                  removeBtn.style.right = '5px';
                  removeBtn.style.background = '#ff4444';
                  removeBtn.style.color = 'white';
                  removeBtn.style.border = 'none';
                  removeBtn.style.borderRadius = '50%';
                  removeBtn.style.width = '24px';
                  removeBtn.style.height = '24px';
                  removeBtn.style.cursor = 'pointer';
                  removeBtn.style.fontSize = '16px';
                  removeBtn.style.padding = '0';
                  removeBtn.onclick = (e) => {
                    e.preventDefault();
                    previewDiv.remove();
                    showStatus('✓ Image removed', '#28a745');
                  };

                  previewDiv.appendChild(img);
                  previewDiv.appendChild(removeBtn);
                  previewGallery.appendChild(previewDiv);

                  showStatus('✓ ' + files.length + ' image(s) ready to upload', '#28a745');
                };

                reader.readAsDataURL(file);
              });
            }

            function showStatus(message, color) {
              uploadStatus.innerHTML = message;
              uploadStatus.style.backgroundColor = color.includes('28a745') ? '#d4edda' : color.includes('0052cc') ? '#d1ecf1' : '#f8d7da';
              uploadStatus.style.color = color.includes('28a745') ? '#155724' : color.includes('0052cc') ? '#0c5460' : '#721c24';
              uploadStatus.style.display = 'block';
            }

            // Make drop zone clickable
            dropZone.addEventListener('click', () => fileInput.click());
          </script>
      </div>
    </div>

    <script>
      document.querySelectorAll('input[name="scrapedImageOption"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.value === 'url') {
            document.getElementById('scrapedImageUrlSection').style.display = 'block';
            document.getElementById('scrapedImageUploadSection').style.display = 'none';
          } else {
            document.getElementById('scrapedImageUrlSection').style.display = 'none';
            document.getElementById('scrapedImageUploadSection').style.display = 'block';
          }
        });
      });
    </script>

    <div class="admin-form-row full">
      <div>
        <label>Description</label>
        <textarea id="scrapedProductDescription" rows="5">${scrapedData.description || ''}</textarea>
      </div>
    </div>

    <div class="admin-form-row full">
      <div>
        <label>Specifications (JSON format, optional)</label>
        <textarea id="scrapedProductSpecs" placeholder='{"ports": "48", "management": "Managed"}'></textarea>
      </div>
    </div>

    <div class="admin-checkbox-group">
      <label>
        <input type="checkbox" id="scrapedProductFeatured">
        Featured Product
      </label>
      <label>
        <input type="checkbox" id="scrapedProductBestseller">
        Bestseller
      </label>
    </div>

    <div class="admin-form-actions">
      <button type="button" class="btn-submit" onclick="createScrapedProduct()">Add Product</button>
      <button type="button" class="btn-cancel" onclick="showScrapeForm()">Start Over</button>
    </div>
  </form>`;

  document.getElementById('scrapeFormContainer').innerHTML = html;
}

async function createScrapedProduct() {
  // Handle image - either uploaded or scraped URL
  let image = '';
  const scrapedImageOption = document.querySelector('input[name="scrapedImageOption"]:checked');
  if (scrapedImageOption && scrapedImageOption.value === 'upload') {
    const uploadedUrl = await uploadProductImage('scrapedProductImageUpload', 'scrapedUploadStatus', 'scrapedUploadPreview');
    if (!uploadedUrl) {
      image = document.getElementById('scrapedProductImage').value; // Fall back to scraped URL
    } else {
      image = uploadedUrl;
    }
  } else {
    image = document.getElementById('scrapedProductImage').value;
  }

  const name = document.getElementById('scrapedProductName').value;
  const category = document.getElementById('scrapedProductCategory').value;
  const price = parseFloat(document.getElementById('scrapedProductPrice').value);
  const stock = parseInt(document.getElementById('scrapedProductStock').value) || 0;
  const brand = document.getElementById('scrapedProductBrand').value;
  const rating = parseFloat(document.getElementById('scrapedProductRating').value) || 0;
  const description = document.getElementById('scrapedProductDescription').value;
  const featured = document.getElementById('scrapedProductFeatured').checked;
  const bestseller = document.getElementById('scrapedProductBestseller').checked;

  if (!category) {
    alert('Please select a product category');
    return;
  }

  let specifications = {};
  const specsText = document.getElementById('scrapedProductSpecs').value.trim();
  if (specsText) {
    // Try to parse as JSON first
    try {
      specifications = JSON.parse(specsText);
    } catch (e) {
      // If not JSON, treat as plain text or key-value pairs
      // Split by newlines and create key-value pairs
      const lines = specsText.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key) {
          specifications[key] = value || '';
        }
      });
    }
  }

  const product = {
    name,
    category,
    price,
    stock,
    brand,
    rating,
    image,
    description,
    specifications,
    featured,
    bestseller
  };

  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    if (response.ok) {
      alert('Product added successfully!');
      loadAdminProducts();
      showAdminTab('products');
      loadProducts();
    } else {
      try {
        const errorData = await response.json();
        alert('Error adding product: ' + (errorData.message || 'Unknown error'));
        console.error('Server error:', errorData);
      } catch (e) {
        alert('Error adding product (HTTP ' + response.status + ')');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error adding product: ' + error.message);
  }
}

// Modify checkUserStatus to show admin button
const originalCheckUserStatus = checkUserStatus;
checkUserStatus = function() {
  originalCheckUserStatus.call(this);
  if (currentUser && currentUser.role === 'admin') {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.getElementById('adminPanelBtn')) {
      const adminBtn = document.createElement('a');
      adminBtn.id = 'adminPanelBtn';
      adminBtn.href = '#';
      adminBtn.className = 'icon-link';
      adminBtn.style.color = '#ff6b35';
      adminBtn.style.fontWeight = 'bold';
      adminBtn.textContent = '⚙️ Admin Panel';
      adminBtn.onclick = (e) => {
        e.preventDefault();
        openAdminPanel();
      };
      navLinks.insertBefore(adminBtn, navLinks.lastChild);
    }
  }
};
