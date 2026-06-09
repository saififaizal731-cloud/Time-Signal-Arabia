/**
 * PROFESSIONAL E-COMMERCE ENHANCEMENTS
 * Complete search, filtering, and UI improvements
 */

// Enhanced Search with Real-time Results
function searchProducts() {
  const query = document.getElementById('searchInput').value.trim();

  if (query.length === 0) {
    loadProducts();
    return;
  }

  if (query.length < 2) {
    showToast('Type at least 2 characters to search', 'warning');
    return;
  }

  loadProducts({ search: query }).then(() => {
    const resultCount = document.querySelectorAll('.product-card').length;
    showToast(`Found ${resultCount} products matching "${query}"`, 'success');
  });
}

// Real-time Search on Input
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        searchProducts();
      }
    });
  }
});

// Enhanced Filter by Price
function filterByPrice(maxPrice) {
  const priceDisplay = document.getElementById('priceDisplay');
  if (priceDisplay) {
    priceDisplay.textContent = `0 - ${maxPrice} SAR`;
  }

  loadProducts({ maxPrice: maxPrice }).then(() => {
    showToast(`Showing products up to ${maxPrice} SAR`, 'info');
  });
}

// Enhanced Filter by Brand
function filterByBrand(brand) {
  const brandValue = brand || document.getElementById('brandFilter')?.value;

  if (!brandValue) {
    loadProducts();
    showToast('Filters cleared', 'info');
    return;
  }

  loadProducts({ brand: brandValue }).then(() => {
    showToast(`Showing ${brandValue} products`, 'success');
  });
}

// Professional Sort with Real-time Update
function sortProducts(sortType) {
  if (!sortType) {
    loadProducts();
    return;
  }

  const sortLabels = {
    'featured': 'Featured Products',
    'bestseller': 'Best Sellers',
    'newest': 'New Arrivals',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    'rating': 'Top Rated',
    'popular': 'Most Popular'
  };

  loadProducts({ sort: sortType }).then(() => {
    const label = sortLabels[sortType] || 'All Products';
    showToast(`Sorted by: ${label}`, 'info');
  });
}

// Combined Filter Function
async function applyFilters() {
  const category = document.querySelector('.category-btn.active')?.textContent?.trim();
  const maxPrice = document.getElementById('priceRange')?.value || 10000;
  const brand = document.getElementById('brandFilter')?.value;
  const sortType = document.getElementById('sortSelect')?.value;
  const searchQuery = document.getElementById('searchInput')?.value;

  try {
    const params = {};
    if (category && category !== 'All Products') params.category = category;
    if (maxPrice && maxPrice !== '10000') params.maxPrice = maxPrice;
    if (brand) params.brand = brand;
    if (sortType) params.sort = sortType;
    if (searchQuery) params.search = searchQuery;

    await loadProducts(params);
    showToast('Filters applied successfully', 'success');
  } catch (error) {
    console.error('Error applying filters:', error);
    showToast('Error applying filters', 'error');
  }
}

// Quick Add to Cart with Feedback
async function quickAddToCartEnhanced(productId) {
  try {
    const productResponse = await fetch(`${API_BASE}/products/${productId}`);
    if (!productResponse.ok) throw new Error('Product not found');

    const product = await productResponse.json();

    if (!currentUser) {
      let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingItem = guestCart.find(item => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += 1;
        showToast(`Updated ${product.name} (qty: ${existingItem.quantity})`, 'info');
      } else {
        guestCart.push({
          productId: productId,
          quantity: 1,
          name: product.name,
          price: product.price,
          image: product.image
        });
        showToast(`✓ Added ${product.name} to cart!`, 'success');
      }

      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      updateGuestCartCount();
    } else {
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
        showToast(`✓ Added ${product.name} to cart!`, 'success');
        loadCart();
      } else {
        showToast('Error adding to cart', 'error');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Error adding to cart', 'error');
  }
}

// Professional Wishlist with Feedback
async function addToWishlistEnhanced(productId = null) {
  if (!currentUser) {
    showToast('Please login to add to wishlist', 'warning');
    openAccount();
    return;
  }

  try {
    const id = productId || selectedProductId;
    if (!id) {
      showToast('Product not found', 'error');
      return;
    }

    const response = await fetch(`${API_BASE}/users/${currentUser._id}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id })
    });

    if (response.ok) {
      showToast('❤️ Added to wishlist!', 'success');
    } else {
      showToast('Already in wishlist', 'info');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Error adding to wishlist', 'error');
  }
}

// Professional Clear Filters
function clearAllFilters() {
  // Reset all filter inputs
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const priceRange = document.getElementById('priceRange');
  if (priceRange) priceRange.value = 10000;

  const brandFilter = document.getElementById('brandFilter');
  if (brandFilter) brandFilter.value = '';

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = '';

  // Reset category buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById('cat-all')?.classList.add('active');

  // Reload all products
  loadProducts();
  showToast('All filters cleared', 'info');
  document.querySelector('.products-section')?.scrollIntoView({ behavior: 'smooth' });
}

// Professional Product View Counter
function viewProductEnhanced(productId) {
  viewProduct(productId);

  // Track view in localStorage
  let viewedProducts = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
  if (!viewedProducts.includes(productId)) {
    viewedProducts.unshift(productId);
    if (viewedProducts.length > 10) viewedProducts.pop();
    localStorage.setItem('viewedProducts', JSON.stringify(viewedProducts));
  }
}

// Export for use
window.searchProducts = searchProducts;
window.filterByPrice = filterByPrice;
window.filterByBrand = filterByBrand;
window.sortProducts = sortProducts;
window.applyFilters = applyFilters;
window.quickAddToCartEnhanced = quickAddToCartEnhanced;
window.addToWishlistEnhanced = addToWishlistEnhanced;
window.clearAllFilters = clearAllFilters;
window.viewProductEnhanced = viewProductEnhanced;
