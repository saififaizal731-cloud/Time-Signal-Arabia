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

  grid.innerHTML = products.map(product => `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(product.name)}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=' + encodeURIComponent('${product.name}')">
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
  `).join('');
}

// View Product Details
async function viewProduct(productId) {
  try {
    selectedProductId = productId;
    const response = await fetch(`${API_BASE}/products/${productId}`);
    const product = await response.json();

    const detailImageEl = document.getElementById('detailImage');
    detailImageEl.src = product.image || `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`;
    detailImageEl.onerror = function() {
      this.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`;
    };
    document.getElementById('detailName').textContent = product.name;
    document.getElementById('detailPrice').textContent = `${product.price} SAR`;
    document.getElementById('detailBrand').textContent = `Brand: ${product.brand || 'N/A'}`;
    document.getElementById('detailCategory').textContent = `Category: ${product.category}`;
    document.getElementById('detailRating').textContent = `★ ${product.rating ? product.rating.toFixed(1) : 'N/A'} Rating`;

    let specsHtml = '<strong>Specifications:</strong><ul>';
    if (product.specifications) {
      Object.entries(product.specifications).forEach(([key, value]) => {
        specsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
      });
    }
    specsHtml += '</ul>';
    document.getElementById('detailSpecs').innerHTML = specsHtml;

    const stockDiv = document.getElementById('detailStock');
    if (product.stock > 0) {
      stockDiv.className = 'stock-status in-stock';
      stockDiv.textContent = `✓ In Stock (${product.stock} available)`;
    } else {
      stockDiv.className = 'stock-status out-of-stock';
      stockDiv.textContent = '✗ Out of Stock';
    }

    document.getElementById('detailDescription').innerHTML = `<strong>Description:</strong><p>${product.description || 'No description available'}</p>`;
    document.getElementById('quantityInput').value = 1;

    document.getElementById('productModal').style.display = 'block';
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Error loading product details');
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
      alert('Product added to cart!');
      loadCart();
      closeModal();
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

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      localStorage.setItem('token', data.token);
      loadCart();
      checkUserStatus();
      alert('Logged in successfully!');
      closeAccountModal();
    } else {
      alert('Invalid email or password');
    }
  } catch (error) {
    console.error('Error:', error);
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
    'Accessories'
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
        <label>Product Image</label>
        <div style="margin-bottom: 10px;">
          <input type="radio" name="imageOption" id="imageOptionUrl" value="url" checked>
          <label for="imageOptionUrl" style="font-weight: normal; margin-left: 5px;">Image URL</label>

          <input type="radio" name="imageOption" id="imageOptionUpload" value="upload" style="margin-left: 20px;">
          <label for="imageOptionUpload" style="font-weight: normal; margin-left: 5px;">Upload Image</label>
        </div>

        <div id="imageUrlSection">
          <input type="url" id="productImageUrl" placeholder="https://example.com/image.jpg">
        </div>

        <div id="imageUploadSection" style="display: none;">
          <input type="file" id="productImageUpload" accept="image/jpeg,image/jpg,image/png,image/webp">
          <div id="uploadPreview" style="margin-top: 10px;"></div>
          <div id="uploadStatus" style="margin-top: 5px; font-size: 12px;"></div>
        </div>
      </div>
    </div>

    <script>
      document.querySelectorAll('input[name="imageOption"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.value === 'url') {
            document.getElementById('imageUrlSection').style.display = 'block';
            document.getElementById('imageUploadSection').style.display = 'none';
          } else {
            document.getElementById('imageUrlSection').style.display = 'none';
            document.getElementById('imageUploadSection').style.display = 'block';
          }
        });
      });
    </script>

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

// Image upload handler
async function uploadProductImage(fileInputId, statusDivId, previewDivId) {
  const fileInput = document.getElementById(fileInputId);
  const statusDiv = document.getElementById(statusDivId);
  const previewDiv = document.getElementById(previewDivId);

  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    return null;
  }

  const file = fileInput.files[0];

  if (file.size > 5 * 1024 * 1024) {
    statusDiv.innerHTML = '<span style="color: #ff4444;">File too large (max 5MB)</span>';
    return null;
  }

  const formData = new FormData();
  formData.append('image', file);

  statusDiv.innerHTML = '<span style="color: #0052cc;">⏳ Uploading...</span>';

  try {
    const response = await fetch(`${API_BASE}/products/upload`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      statusDiv.innerHTML = '<span style="color: #28a745;">✓ Uploaded successfully</span>';

      if (previewDiv) {
        previewDiv.innerHTML = `<img src="${data.imageUrl}" style="max-width: 150px; border: 1px solid #ddd; border-radius: 4px;">`;
      }

      return data.imageUrl;
    } else {
      statusDiv.innerHTML = '<span style="color: #ff4444;">✗ Upload failed</span>';
      return null;
    }
  } catch (error) {
    console.error('Upload error:', error);
    statusDiv.innerHTML = '<span style="color: #ff4444;">✗ Upload error</span>';
    return null;
  }
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

  // Handle image
  let imageUrl = '';
  const imageOption = document.querySelector('input[name="imageOption"]:checked');
  if (imageOption && imageOption.value === 'upload') {
    const uploadedUrl = await uploadProductImage('productImageUpload', 'uploadStatus', 'uploadPreview');
    if (!uploadedUrl) {
      alert('Please upload an image or select URL option');
      return;
    }
    imageUrl = uploadedUrl;
  } else {
    const urlInput = document.getElementById('productImageUrl');
    imageUrl = urlInput ? urlInput.value : '';
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
    image: imageUrl,
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
      'Accessories'
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
    <h3>📋 Paste Product URL</h3>
    <p style="color: #666; margin-bottom: 20px;">
      Paste a product URL from another website and we'll automatically extract the details for you.
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
    'Security & Firewalls', 'Modems & Converters', 'Patch Panels', 'Accessories'
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
          <input type="file" id="scrapedProductImageUpload" accept="image/jpeg,image/jpg,image/png,image/webp">
          <div id="scrapedUploadPreview" style="margin-top: 10px;"></div>
          <div id="scrapedUploadStatus" style="margin-top: 5px; font-size: 12px;"></div>
        </div>
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
