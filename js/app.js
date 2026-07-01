import { store } from './state.js';
import { 
  createProductCard, 
  createCompareWidget, 
  createCompareModalContent, 
  createCartDrawerContent, 
  createOrderTrackingView 
} from './components.js';

// DOM Elements cache
const els = {
  logoLink: document.getElementById('logo-link'),
  navHome: document.getElementById('nav-home'),
  navCatalog: document.getElementById('nav-catalog'),
  navAbout: document.getElementById('nav-about'),
  navContact: document.getElementById('nav-contact'),
  
  themeToggle: document.getElementById('theme-toggle'),
  adminPanelBtn: document.getElementById('admin-panel-btn'),
  userProfileBtn: document.getElementById('user-profile-btn'),
  wishlistTriggerBtn: document.getElementById('wishlist-trigger-btn'),
  cartTriggerBtn: document.getElementById('cart-trigger-btn'),
  
  wishlistBadge: document.getElementById('wishlist-badge'),
  cartBadge: document.getElementById('cart-badge'),
  cartTotalPrice: document.getElementById('cart-total-price'),
  
  liveSearchInput: document.getElementById('live-search-input'),
  searchSuggestions: document.getElementById('search-suggestions'),
  btnSearchTrigger: document.getElementById('btn-search-trigger'),
  
  // Routes
  routes: {
    home: document.getElementById('route-home'),
    catalog: document.getElementById('route-catalog'),
    details: document.getElementById('route-details'),
    wishlist: document.getElementById('route-wishlist'),
    checkout: document.getElementById('route-checkout'),
    account: document.getElementById('route-account'),
    extra: document.getElementById('route-extra'),
    admin: document.getElementById('route-admin'),
  },
  
  // Homepage Containers
  flashProducts: document.getElementById('flash-products-container'),
  tabbedProducts: document.getElementById('tabbed-products-container'),
  
  // Catalog Containers
  filterCategories: document.getElementById('filter-categories-container'),
  filterBrands: document.getElementById('filter-brands-container'),
  priceRangeSlider: document.getElementById('price-range-slider'),
  priceSliderValue: document.getElementById('price-slider-value'),
  sortSelect: document.getElementById('sort-select'),
  catalogProductsGrid: document.getElementById('catalog-products-grid'),
  catalogResultsCount: document.getElementById('catalog-results-count'),
  btnResetFilters: document.getElementById('btn-reset-filters'),
  
  // Drawer / Modals
  cartDrawerOverlay: document.getElementById('cart-drawer-overlay'),
  cartDrawerBody: document.getElementById('cart-drawer-body-container'),
  btnCloseCartDrawer: document.getElementById('btn-close-cart-drawer'),
  
  quickviewModal: document.getElementById('quickview-modal'),
  quickviewContent: document.getElementById('quickview-content-area'),
  btnCloseQuickview: document.getElementById('btn-close-quickview'),
  
  compareModal: document.getElementById('compare-modal'),
  compareModalContent: document.getElementById('compare-modal-content-area'),
  btnCloseCompareModal: document.getElementById('btn-close-compare-modal'),
  
  compareDrawerTarget: document.getElementById('compare-drawer-container-target'),
  
  // Checkout
  checkoutForm: document.getElementById('checkout-form'),
  checkoutSummary: document.getElementById('checkout-summary-container'),
  paymentMethods: document.getElementsByName('payment-method'),
  creditCardFields: document.getElementById('credit-card-fields'),
  
  // Account
  accountTabLinks: document.querySelectorAll('.account-tab-link'),
  accountPanes: document.querySelectorAll('.account-sub-pane'),
  accountRecentOrders: document.getElementById('account-recent-orders-list'),
  accountOrdersHistory: document.getElementById('account-orders-history-container'),
  trackingSearchId: document.getElementById('tracking-search-id-input'),
  btnSubmitTracking: document.getElementById('btn-submit-tracking'),
  trackingResultArea: document.getElementById('tracking-result-area'),
  
  // Extra pages
  extraTabLinks: document.querySelectorAll('.extra-tab-link'),
  extraBlocks: document.querySelectorAll('.extra-pane-block'),
  contactForm: document.getElementById('contact-form'),
  
  // Admin
  adminStatRevenue: document.getElementById('admin-stat-revenue'),
  adminStatOrders: document.getElementById('admin-stat-orders'),
  adminStatProducts: document.getElementById('admin-stat-products'),
  btnAdminOpenAddForm: document.getElementById('btn-open-add-form'), // wait, ID is btn-admin-open-add-form
  adminOpenAddBtn: document.getElementById('btn-admin-open-add-form'),
  adminAddProductForm: document.getElementById('admin-add-product-form'),
  adminProductsTable: document.getElementById('admin-products-table-body'),
  adminOrdersTable: document.getElementById('admin-orders-table-body'),
  btnAdminCancelAdd: document.getElementById('btn-admin-cancel-add'),
  btnAdminResetData: document.getElementById('btn-admin-reset-data'),
};

// Global variables
let activeReviewsIndex = 0;
let flashCountdownSeconds = 3 * 3600 + 47 * 60 + 19; // 3h 47m 19s
let catalogFilters = {
  categories: [],
  brands: [],
  scales: [],
  maxPrice: 400,
  sortBy: 'popularity',
  searchQuery: ''
};

// Initialize Application
function init() {
  setupTheme();
  setupNavigation();
  setupEventListeners();
  renderHome();
  renderCatalogFiltersSetup();
  renderCatalog();
  updateHeaderBadges();
  startFlashCountdown();
  
  // Subscribe UI rendering to state shifts
  store.subscribe((state) => {
    updateHeaderBadges();
    renderCompareDrawer(state);
    renderCartDrawer(state);
    renderCatalog();
    renderAdminDashboard(state);
  });
}

// ----------------------------------------------------
// THEME SETUP
// ----------------------------------------------------
function setupTheme() {
  const isDark = store.state.darkMode;
  const sunIcon = els.themeToggle.querySelector('.sun-icon');
  const moonIcon = els.themeToggle.querySelector('.moon-icon');
  
  if (isDark) {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
}

// ----------------------------------------------------
// ROUTING & NAVIGATION
// ----------------------------------------------------
function setupNavigation() {
  // Navigation Bar Click handlers
  els.logoLink.addEventListener('click', (e) => { e.preventDefault(); store.setRoute('home'); });
  els.navHome.addEventListener('click', () => store.setRoute('home'));
  els.navCatalog.addEventListener('click', () => {
    resetFilters();
    store.setRoute('catalog');
  });
  
  els.navAbout.addEventListener('click', () => store.setRoute('extra', 'about'));
  els.navContact.addEventListener('click', () => store.setRoute('extra', 'contact'));
  
  els.adminPanelBtn.addEventListener('click', () => store.setRoute('admin'));
  els.userProfileBtn.addEventListener('click', () => store.setRoute('account'));
  els.wishlistTriggerBtn.addEventListener('click', () => store.setRoute('wishlist'));
  
  // Footers Nav
  document.getElementById('foot-nav-home').addEventListener('click', () => store.setRoute('home'));
  document.getElementById('foot-nav-catalog').addEventListener('click', () => store.setRoute('catalog'));
  document.getElementById('foot-nav-admin').addEventListener('click', () => store.setRoute('admin'));
  document.getElementById('foot-nav-about').addEventListener('click', () => store.setRoute('extra', 'about'));
  document.getElementById('foot-nav-faq').addEventListener('click', () => store.setRoute('extra', 'faq'));
  document.getElementById('foot-nav-returns').addEventListener('click', () => store.setRoute('extra', 'returns'));
  document.getElementById('foot-nav-privacy').addEventListener('click', () => store.setRoute('extra', 'privacy'));
  document.getElementById('foot-nav-terms').addEventListener('click', () => store.setRoute('extra', 'terms'));

  // Subscribe navigation rendering
  store.subscribe((state) => {
    // Sync navbar item highlight
    const route = state.activeRoute;
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    if (route === 'home') els.navHome.classList.add('active');
    else if (route === 'catalog') els.navCatalog.classList.add('active');
    
    // Hide/show views
    for (const [key, viewEl] of Object.entries(els.routes)) {
      if (key === route) {
        viewEl.classList.add('active');
      } else {
        viewEl.classList.remove('active');
      }
    }
    
    // Render specific page contents on navigation
    if (route === 'details') renderProductDetailsPage(state.selectedProductId);
    else if (route === 'wishlist') renderWishlistPage(state);
    else if (route === 'checkout') renderCheckoutPage(state);
    else if (route === 'account') renderAccountDashboard(state);
    else if (route === 'extra') renderExtraPage(state.activeExtraPage);
    else if (route === 'admin') renderAdminDashboard(state);
  });
  
  // Initial page sync
  store.setRoute(store.state.activeRoute, store.state.activeRoute === 'details' ? store.state.selectedProductId : store.state.activeExtraPage);
}

// ----------------------------------------------------
// UI RENDERING - HOME PAGE
// ----------------------------------------------------
function renderHome() {
  const products = store.state.products;
  
  // Render Flash Sales (e.g. 4 random products with discount tags)
  const flashList = products.slice(2, 6);
  els.flashProducts.innerHTML = flashList.map(p => {
    // display original and discounted price
    const discountPrice = p.price * 0.85; // 15% discount
    const cardHTML = createProductCard(p);
    // Inject custom price styling for sales
    const parser = new DOMParser();
    const doc = parser.parseFromString(cardHTML, 'text/html');
    const priceEl = doc.querySelector('.product-price');
    if (priceEl) {
      priceEl.innerHTML = `<span class="sale-price">$${discountPrice.toFixed(2)}</span> <span class="original-price" style="text-decoration: line-through; font-size: 0.85rem; color: var(--text-muted); margin-left: 0.5rem;">$${p.price.toFixed(2)}</span>`;
    }
    return doc.body.innerHTML;
  }).join('');

  // Render tabbed Showcase products (Initial: Best Sellers)
  renderHomeTabs('Best Sellers');
  
  // Category cards hover click
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;
      resetFilters();
      catalogFilters.categories = [category];
      store.setRoute('catalog');
    });
  });

  // Brands menu items filter catalog
  document.querySelectorAll('.brand-item').forEach(item => {
    item.addEventListener('click', () => {
      const brand = item.dataset.brand;
      resetFilters();
      catalogFilters.brands = [brand];
      store.setRoute('catalog');
    });
  });
}

function renderHomeTabs(tag) {
  const products = store.state.products;
  const filtered = products.filter(p => p.tag === tag).slice(0, 8);
  els.tabbedProducts.innerHTML = filtered.map(p => createProductCard(p)).join('');
}

// ----------------------------------------------------
// UI RENDERING - CATALOG PAGE
// ----------------------------------------------------
function renderCatalogFiltersSetup() {
  const products = store.state.products;
  
  // Extract all categories & brands
  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];
  
  // Load Category Filters checkboxes
  els.filterCategories.innerHTML = categories.map(cat => `
    <label class="checkbox-label">
      <input type="checkbox" class="category-filter-chk" value="${cat}"> ${cat}
    </label>
  `).join('');
  
  // Load Brand Filters checkboxes
  els.filterBrands.innerHTML = brands.map(brand => `
    <label class="checkbox-label">
      <input type="checkbox" class="brand-filter-chk" value="${brand}"> ${brand}
    </label>
  `).join('');
}

function renderCatalog() {
  if (store.state.activeRoute !== 'catalog') return;
  
  let filtered = [...store.state.products];
  
  // Category Filter
  if (catalogFilters.categories.length > 0) {
    filtered = filtered.filter(p => catalogFilters.categories.includes(p.category));
  }
  
  // Brand Filter
  if (catalogFilters.brands.length > 0) {
    filtered = filtered.filter(p => catalogFilters.brands.includes(p.brand));
  }
  
  // Scale Filter
  if (catalogFilters.scales.length > 0) {
    filtered = filtered.filter(p => catalogFilters.scales.includes(p.scale));
  }
  
  // Search Filter
  if (catalogFilters.searchQuery.trim() !== '') {
    const q = catalogFilters.searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) || 
      p.scale.includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
  
  // Price Filter
  filtered = filtered.filter(p => p.price <= catalogFilters.maxPrice);
  
  // Sorting
  if (catalogFilters.sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (catalogFilters.sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (catalogFilters.sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } // popularity (default database index order)
  
  // Render results
  if (filtered.length === 0) {
    els.catalogProductsGrid.innerHTML = `
      <div class="empty-results-msg" style="grid-column: 1/-1; padding: 4rem 1rem; text-align: center; color: var(--text-muted);">
        <p>No model cars found matching active criteria.</p>
        <button id="btn-clear-filters-empty" class="btn-primary" style="margin-top: 1rem;">Clear All Filters</button>
      </div>
    `;
    const btn = document.getElementById('btn-clear-filters-empty');
    if (btn) btn.addEventListener('click', resetFilters);
  } else {
    els.catalogProductsGrid.innerHTML = filtered.map(p => createProductCard(p)).join('');
  }
  
  els.catalogResultsCount.textContent = `Showing ${filtered.length} of ${store.state.products.length} models`;
  
  // Sync checkbox state in HTML UI
  document.querySelectorAll('.category-filter-chk').forEach(chk => {
    chk.checked = catalogFilters.categories.includes(chk.value);
  });
  document.querySelectorAll('.brand-filter-chk').forEach(chk => {
    chk.checked = catalogFilters.brands.includes(chk.value);
  });
  document.querySelectorAll('.scale-filter-chk').forEach(chk => {
    chk.checked = catalogFilters.scales.includes(chk.value);
  });
  els.priceRangeSlider.value = catalogFilters.maxPrice;
  els.priceSliderValue.textContent = `Max: $${catalogFilters.maxPrice}`;
}

function resetFilters() {
  catalogFilters = {
    categories: [],
    brands: [],
    scales: [],
    maxPrice: 400,
    sortBy: 'popularity',
    searchQuery: ''
  };
  els.liveSearchInput.value = '';
  renderCatalog();
}

// ----------------------------------------------------
// UI RENDERING - PRODUCT DETAILS PAGE
// ----------------------------------------------------
function renderProductDetailsPage(productId) {
  const product = store.state.products.find(p => p.id === productId);
  if (!product) {
    els.routes.details.innerHTML = `<p>Error: Product not found.</p>`;
    return;
  }

  const isInWishlist = store.isInWishlist(product.id);
  const outOfStock = product.stock === 0;

  // Initial gallery image is images[0]
  els.routes.details.querySelector('#details-container').innerHTML = `
    <div class="details-grid">
      <!-- Gallery Column -->
      <div class="details-gallery">
        <div class="gallery-main-frame">
          <img id="details-main-img" src="${product.images[0]}" alt="${product.name}">
        </div>
        <div class="gallery-thumbnails-row">
          ${product.images.map((img, idx) => `
            <div class="thumb-frame ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
              <img src="${img}" alt="${product.name} angle ${idx+1}">
            </div>
          `).join('')}
        </div>
        
        <!-- 360 view simulator -->
        <div class="sim-360-group">
          <h5>
            <span>360° Rotate View Simulator</span>
            <span class="text-gold">↔ Drag to Spin</span>
          </h5>
          <input type="range" class="sim-360-range" min="0" max="3" value="0" step="1">
        </div>
      </div>
      
      <!-- Info Column -->
      <div class="details-info-col">
        <div class="details-title-block">
          <span class="details-brand-badge">${product.brand}</span>
          <h2>${product.name}</h2>
          <div class="product-rating">
            <span class="stars">★ ★ ★ ★ ★</span>
            <span class="rating-value">${product.rating.toFixed(1)}</span>
            <span class="reviews-count">(${product.reviewsCount} verified collector reviews)</span>
          </div>
        </div>
        
        <div class="details-price-row">
          <span class="details-price">$${product.price.toFixed(2)}</span>
          ${outOfStock ? '<span class="details-stock-alert out">Acquisition Out of Stock</span>' : `<span class="details-stock-alert">${product.stock} items remaining in vault</span>`}
        </div>
        
        <p class="details-desc">${product.description}</p>
        
        <!-- Specifications -->
        <div class="details-specs">
          <h4>Specifications</h4>
          <table class="specs-table">
            <tbody>
              ${Object.entries(product.specs).map(([key, val]) => `
                <tr>
                  <td class="label">${key}</td>
                  <td class="value">${val}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Main Actions -->
        <div class="details-actions-group">
          <button id="btn-details-add-cart" class="btn-primary" ${outOfStock ? 'disabled' : ''}>
            ${outOfStock ? 'Sold Out' : 'Add to Collection'}
          </button>
          <button id="btn-details-buy" class="btn-buy-now" ${outOfStock ? 'disabled' : ''}>Buy Now</button>
        </div>
        
        <div class="details-subactions">
          <button id="btn-details-wishlist" class="subaction-btn ${isInWishlist ? 'active' : ''}">
            <svg class="heart-icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>${isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}</span>
          </button>
          <button id="btn-details-compare" class="subaction-btn">
            ⚖ <span>Add to Compare</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Gallery click handlers
  const mainImg = document.getElementById('details-main-img');
  const thumbs = document.querySelectorAll('.thumb-frame');
  const spinSlider = document.querySelector('.sim-360-range');
  
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const idx = parseInt(thumb.dataset.idx);
      mainImg.src = product.images[idx];
      spinSlider.value = idx;
    });
  });

  // 360 Spin slider logic
  spinSlider.addEventListener('input', (e) => {
    const idx = parseInt(e.target.value);
    mainImg.src = product.images[idx];
    thumbs.forEach(t => t.classList.remove('active'));
    document.querySelector(`.thumb-frame[data-idx="${idx}"]`).classList.add('active');
  });

  // Action Button Listeners
  document.getElementById('btn-details-add-cart').addEventListener('click', () => {
    store.addToCart(product.id, 1);
    openCartDrawer();
  });
  
  document.getElementById('btn-details-buy').addEventListener('click', () => {
    store.addToCart(product.id, 1);
    store.setRoute('checkout');
  });
  
  document.getElementById('btn-details-wishlist').addEventListener('click', () => {
    store.toggleWishlist(product.id);
    // Re-render button state
    const btn = document.getElementById('btn-details-wishlist');
    const isNowIn = store.isInWishlist(product.id);
    btn.classList.toggle('active', isNowIn);
    btn.querySelector('span').textContent = isNowIn ? 'Wishlisted' : 'Add to Wishlist';
  });

  document.getElementById('btn-details-compare').addEventListener('click', () => {
    store.toggleCompare(product.id);
  });

  // Render AI Recommendations
  const recommendedList = store.getAIRecommendations();
  document.getElementById('details-recommendations-container').innerHTML = recommendedList.map(p => createProductCard(p)).join('');
}

// ----------------------------------------------------
// UI RENDERING - WISHLIST PAGE
// ----------------------------------------------------
function renderWishlistPage(state) {
  const wishlistGrid = document.getElementById('wishlist-grid');
  
  if (state.wishlist.length === 0) {
    wishlistGrid.innerHTML = `
      <div style="grid-column: 1/-1; padding: 4rem 1rem; text-align: center; color: var(--text-muted);">
        <p>No model cars saved in your showcase. Go shop our collection!</p>
        <button id="btn-wishlist-shop" class="btn-primary" style="margin-top: 1rem;">Shop Collection</button>
      </div>
    `;
    document.getElementById('btn-wishlist-shop').addEventListener('click', () => store.setRoute('catalog'));
    document.getElementById('btn-add-all-wishlist-cart').style.display = 'none';
    return;
  }
  
  document.getElementById('btn-add-all-wishlist-cart').style.display = 'block';
  const wishProducts = state.wishlist.map(id => state.products.find(p => p.id === id)).filter(Boolean);
  wishlistGrid.innerHTML = wishProducts.map(p => createProductCard(p)).join('');
}

// ----------------------------------------------------
// UI RENDERING - CHECKOUT PAGE
// ----------------------------------------------------
function renderCheckoutPage(state) {
  const summaryContainer = document.getElementById('checkout-summary-container');
  
  if (state.cart.length === 0) {
    summaryContainer.innerHTML = `<p>Cart is empty. Add replica items to buy.</p>`;
    // redirect or lock
    return;
  }
  
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * state.couponDiscount;
  const tax = (subtotal - discount) * 0.08;
  const shipping = subtotal > 150 ? 0 : 15.00;
  const total = subtotal - discount + tax + shipping;
  
  summaryContainer.innerHTML = `
    <h4>Order Summary</h4>
    <div class="summary-items-list">
      ${state.cart.map(item => `
        <div class="checkout-summary-item">
          <span>${item.name} (x${item.quantity})</span>
          <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('')}
    </div>
    
    <div class="summary-totals">
      <div class="summary-line">
        <span>Subtotal</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      ${discount > 0 ? `
        <div class="summary-line discount">
          <span>Discount (${(state.couponDiscount * 100).toFixed(0)}%)</span>
          <span>-$${discount.toFixed(2)}</span>
        </div>
      ` : ''}
      <div class="summary-line">
        <span>Shipping</span>
        <span>${shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
      </div>
      <div class="summary-line">
        <span>Taxes (8%)</span>
        <span>$${tax.toFixed(2)}</span>
      </div>
      <div class="summary-line total">
        <span>Total Due</span>
        <span>$${total.toFixed(2)}</span>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// UI RENDERING - ACCOUNT PAGES & ORDER TRACKING
// ----------------------------------------------------
function renderAccountDashboard(state) {
  // Render active pane
  const activeTabEl = document.querySelector('.account-tab-link.active');
  const tabName = activeTabEl ? activeTabEl.dataset.sub : 'profile';
  
  // Render list of recent orders on Profile overview
  const recentOrdersList = document.getElementById('account-recent-orders-list');
  const ordersHistoryContainer = document.getElementById('account-orders-history-container');
  
  if (state.orders.length === 0) {
    const emptyHTML = `<p class="placeholder-text">You have not placed any acquisition orders yet.</p>`;
    recentOrdersList.innerHTML = emptyHTML;
    ordersHistoryContainer.innerHTML = emptyHTML;
    return;
  }
  
  // Profile recent overview (first 2 orders)
  recentOrdersList.innerHTML = state.orders.slice(0, 2).map(o => `
    <div class="glass-card" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h6>Order ID: <strong class="text-gold">${o.id}</strong></h6>
        <span style="font-size: 0.8rem; color: var(--text-muted);">${o.date} | ${o.items.length} items</span>
      </div>
      <div>
        <span class="stock-indicator" style="margin-right: 1rem;">${o.status}</span>
        <strong>$${o.total.toFixed(2)}</strong>
      </div>
    </div>
  `).join('');

  // Full orders history tab
  ordersHistoryContainer.innerHTML = state.orders.map(o => `
    <div class="glass-card" style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.8rem; margin-bottom: 0.8rem;">
        <div>
          <h5>Order ID: <strong class="text-gold">${o.id}</strong></h5>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Placed on: ${o.date}</span>
        </div>
        <div>
          <span class="stock-indicator" style="background: rgba(224,175,45,0.1); border-color: var(--accent-gold); color: var(--accent-gold);">${o.status}</span>
          <button class="btn-secondary-sm btn-track-order-history" data-id="${o.id}" style="margin-left: 0.5rem;">Track</button>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.8rem;">
        ${o.items.map(i => `
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
            <span>${i.name} (x${i.quantity}) - ${i.scale}</span>
            <span>$${(i.price * i.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      <div style="border-top: 1px dashed var(--border-color); padding-top: 0.6rem; display: flex; justify-content: space-between; font-weight: 700;">
        <span>Grand Total</span>
        <span>$${o.total.toFixed(2)}</span>
      </div>
    </div>
  `).join('');

  // Register track button listeners inside history cards
  document.querySelectorAll('.btn-track-order-history').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.id;
      // Change account tab to tracking
      document.querySelectorAll('.account-tab-link').forEach(l => l.classList.remove('active'));
      const trackingTabLink = document.querySelector('.account-tab-link[data-sub="tracking"]');
      if (trackingTabLink) trackingTabLink.classList.add('active');
      
      document.querySelectorAll('.account-sub-pane').forEach(p => p.classList.remove('active'));
      document.getElementById('account-sub-tracking').classList.add('active');
      
      // Perform tracking search
      els.trackingSearchId.value = orderId;
      runOrderTrackingLookup(orderId);
    });
  });
}

function runOrderTrackingLookup(orderId) {
  const order = store.state.orders.find(o => o.id === orderId.trim());
  if (!order) {
    els.trackingResultArea.innerHTML = `
      <div class="glass-card" style="border-color: var(--accent-red); background: rgba(239, 68, 68, 0.05); text-align: center;">
        <p style="color: var(--accent-red); font-weight: 600;">No order found with ID: ${orderId}</p>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.4rem;">Please double-check your Order ID and try again.</p>
      </div>
    `;
    return;
  }
  els.trackingResultArea.innerHTML = createOrderTrackingView(order);
}

// ----------------------------------------------------
// UI RENDERING - EXTRA INFORMATIONAL PAGES
// ----------------------------------------------------
function renderExtraPage(pageName) {
  els.extraTabLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageName);
  });
  
  els.extraBlocks.forEach(block => {
    block.classList.toggle('active', block.id === `extra-block-${pageName}`);
  });
}

// ----------------------------------------------------
// UI RENDERING - ADMIN DASHBOARD
// ----------------------------------------------------
function renderAdminDashboard(state) {
  if (state.activeRoute !== 'admin') return;
  
  // Calculate stats
  const totalRevenue = state.orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = state.orders.length;
  const productsCount = state.products.length;
  
  els.adminStatRevenue.textContent = `$${totalRevenue.toFixed(2)}`;
  els.adminStatOrders.textContent = totalOrdersCount.toString();
  els.adminStatProducts.textContent = productsCount.toString();
  
  // Load Active Products Table
  els.adminProductsTable.innerHTML = state.products.map(p => `
    <tr data-id="${p.id}">
      <td>
        <div class="admin-prod-cell">
          <img src="${p.images[0]}" alt="${p.name}">
          <div>
            <span>${p.name}</span><br>
            <small style="color: var(--text-muted);">${p.brand}</small>
          </div>
        </div>
      </td>
      <td>${p.scale}</td>
      <td>$${p.price.toFixed(2)}</td>
      <td>
        <input type="number" class="admin-qty-input" data-id="${p.id}" value="${p.stock}" min="0">
      </td>
      <td>
        <button class="admin-action-btn-danger btn-admin-delete-prod" data-id="${p.id}">Delete</button>
      </td>
    </tr>
  `).join('');
  
  // Load Orders list
  els.adminOrdersTable.innerHTML = state.orders.length === 0 ? `
    <tr>
      <td colspan="5" style="text-align: center; color: var(--text-muted);">No orders received.</td>
    </tr>
  ` : state.orders.map(o => `
    <tr>
      <td><strong class="text-gold">${o.id}</strong></td>
      <td>${o.date}</td>
      <td>$${o.total.toFixed(2)}</td>
      <td>
        <select class="admin-order-status-select custom-select" data-id="${o.id}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">
          <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
          <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
          <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
    </tr>
  `).join('');
  
  // Register inline admin actions listeners
  // Inline Stock change
  document.querySelectorAll('.admin-qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = input.dataset.id;
      const val = parseInt(e.target.value) || 0;
      store.adminUpdateStock(id, val);
    });
  });
  
  // Product Delete
  document.querySelectorAll('.btn-admin-delete-prod').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (confirm("Are you sure you want to delete this scale model from the catalog?")) {
        store.adminDeleteProduct(id);
      }
    });
  });

  // Order Status update
  document.querySelectorAll('.admin-order-status-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const id = select.dataset.id;
      const newStatus = e.target.value;
      store.adminUpdateOrderStatus(id, newStatus);
    });
  });
}

// ----------------------------------------------------
// COMPARISON DRAWER & MODAL VIEW
// ----------------------------------------------------
function renderCompareDrawer(state) {
  els.compareDrawerTarget.innerHTML = createCompareWidget(state.compareList, state.products);
  
  // Hook drawer action buttons
  const btnOpen = document.getElementById('btn-open-compare');
  const btnClear = document.getElementById('btn-clear-compare');
  
  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      els.compareModalContent.innerHTML = createCompareModalContent(store.state.compareList, store.state.products);
      els.compareModal.classList.remove('hidden');
      
      // Wire add-to-cart buttons inside comparison modal table
      els.compareModalContent.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
          store.addToCart(btn.dataset.id, 1);
          openCartDrawer();
        });
      });
    });
  }
  
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      store.clearCompare();
    });
  }
  
  // Wire remove chip icons
  document.querySelectorAll('.remove-compare-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      store.toggleCompare(btn.dataset.id);
    });
  });
}

// ----------------------------------------------------
// CART DRAWER ACTIONS
// ----------------------------------------------------
function renderCartDrawer(state) {
  els.cartDrawerBody.innerHTML = createCartDrawerContent(state.cart, state.couponDiscount, state.couponCode);
  
  // Quantity handlers
  document.querySelectorAll('.btn-qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = state.cart.find(c => c.id === btn.dataset.id);
      if (item) store.updateCartQuantity(item.id, item.quantity - 1);
    });
  });
  
  document.querySelectorAll('.btn-qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = state.cart.find(c => c.id === btn.dataset.id);
      if (item) store.updateCartQuantity(item.id, item.quantity + 1);
    });
  });
  
  document.querySelectorAll('.btn-remove-cart-item').forEach(btn => {
    btn.addEventListener('click', () => {
      store.removeFromCart(btn.dataset.id);
    });
  });
  
  // Empty cart browse catalog hook
  const btnEmptyShop = document.getElementById('btn-cart-shop');
  if (btnEmptyShop) {
    btnEmptyShop.addEventListener('click', () => {
      closeCartDrawer();
      store.setRoute('catalog');
    });
  }
  
  // Coupon handlers
  const btnApplyCoupon = document.getElementById('btn-apply-coupon');
  const btnRemoveCoupon = document.getElementById('btn-remove-coupon');
  
  if (btnApplyCoupon) {
    btnApplyCoupon.addEventListener('click', () => {
      const codeInput = document.getElementById('coupon-code-input');
      const res = store.applyCoupon(codeInput.value);
      alert(res.message);
    });
  }
  
  if (btnRemoveCoupon) {
    btnRemoveCoupon.addEventListener('click', () => {
      store.removeCoupon();
    });
  }
  
  // Checkout routing button hook
  const btnCheckout = document.getElementById('btn-go-checkout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      closeCartDrawer();
      store.setRoute('checkout');
    });
  }
}

function openCartDrawer() {
  els.cartDrawerOverlay.classList.remove('hidden');
}

function closeCartDrawer() {
  els.cartDrawerOverlay.classList.add('hidden');
}

function updateHeaderBadges() {
  const state = store.state;
  els.wishlistBadge.textContent = state.wishlist.length.toString();
  
  const cartTotalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  els.cartBadge.textContent = cartTotalQty.toString();
  
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * state.couponDiscount;
  const total = subtotal - discount;
  els.cartTotalPrice.textContent = `$${total.toFixed(2)}`;
}

// ----------------------------------------------------
// EVENT LISTENERS REGISTER
// ----------------------------------------------------
function setupEventListeners() {
  // Theme Switching
  els.themeToggle.addEventListener('click', () => {
    const isNowLight = document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme', !isNowLight);
    store.setDarkMode(!isNowLight);
    
    // Toggle icon view
    const sunIcon = els.themeToggle.querySelector('.sun-icon');
    const moonIcon = els.themeToggle.querySelector('.moon-icon');
    if (isNowLight) {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  });

  // Global Cart click event
  els.cartTriggerBtn.addEventListener('click', openCartDrawer);
  els.btnCloseCartDrawer.addEventListener('click', closeCartDrawer);
  els.cartDrawerOverlay.addEventListener('click', (e) => {
    if (e.target === els.cartDrawerOverlay) closeCartDrawer();
  });
  
  // Close Modals
  els.btnCloseQuickview.addEventListener('click', () => els.quickviewModal.classList.add('hidden'));
  els.btnCloseCompareModal.addEventListener('click', () => els.compareModal.classList.add('hidden'));
  
  // Close suggestion box on outside click
  document.addEventListener('click', (e) => {
    if (!els.liveSearchInput.contains(e.target) && !els.searchSuggestions.contains(e.target)) {
      els.searchSuggestions.classList.add('hidden');
    }
  });

  // Live Auto-Suggestion Search logic
  els.liveSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) {
      els.searchSuggestions.classList.add('hidden');
      return;
    }
    
    const matches = store.state.products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.brand.toLowerCase().includes(query) || 
      p.scale.includes(query) || 
      p.category.toLowerCase().includes(query)
    ).slice(0, 5);
    
    if (matches.length === 0) {
      els.searchSuggestions.innerHTML = `<div style="padding: 0.8rem 1rem; font-size: 0.85rem; color: var(--text-muted);">No replicas match search</div>`;
    } else {
      els.searchSuggestions.innerHTML = matches.map(p => `
        <div class="search-suggestion-item" data-id="${p.id}">
          <img src="${p.images[0]}" alt="${p.name}">
          <div class="info">
            <h5>${p.name}</h5>
            <span>${p.brand} | Scale ${p.scale} | $${p.price.toFixed(2)}</span>
          </div>
        </div>
      `).join('');
      
      // Wire selection inside suggestions
      els.searchSuggestions.querySelectorAll('.search-suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.id;
          els.searchSuggestions.classList.add('hidden');
          els.liveSearchInput.value = '';
          store.setRoute('details', id);
        });
      });
    }
    els.searchSuggestions.classList.remove('hidden');
  });

  // Press Enter key to perform search in Catalog
  els.liveSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = els.liveSearchInput.value.trim();
      els.searchSuggestions.classList.add('hidden');
      resetFilters();
      catalogFilters.searchQuery = query;
      store.setRoute('catalog');
    }
  });
  els.btnSearchTrigger.addEventListener('click', () => {
    const query = els.liveSearchInput.value.trim();
    resetFilters();
    catalogFilters.searchQuery = query;
    store.setRoute('catalog');
  });

  // Category dropdown click route
  document.querySelectorAll('.cat-menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      resetFilters();
      catalogFilters.categories = [category];
      store.setRoute('catalog');
    });
  });

  // Wire product card click delegates dynamically (to detail page, quickview modal, wishlist, compare)
  document.addEventListener('click', (e) => {
    const productCard = e.target.closest('.product-card');
    if (!productCard) return;
    
    const id = productCard.dataset.id;
    
    // Quick View
    if (e.target.classList.contains('btn-quickview')) {
      e.stopPropagation();
      openQuickviewModal(id);
    }
    // Wishlist toggle
    else if (e.target.closest('.wishlist-btn')) {
      e.stopPropagation();
      store.toggleWishlist(id);
    }
    // Compare toggle
    else if (e.target.classList.contains('btn-compare')) {
      e.stopPropagation();
      store.toggleCompare(id);
    }
    // Add to cart
    else if (e.target.classList.contains('btn-add-cart')) {
      e.stopPropagation();
      store.addToCart(id, 1);
      openCartDrawer();
    }
    // Click title or card itself goes to product page details
    else if (e.target.classList.contains('product-title') || e.target.classList.contains('product-image') || e.target.closest('.product-details')) {
      store.setRoute('details', id);
    }
  });

  // Home slider banner button explore
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-hero-view')) {
      store.setRoute('details', e.target.dataset.id);
    } else if (e.target.classList.contains('btn-hero-shop')) {
      store.setRoute('catalog');
    }
  });

  // Home Featured Catalog tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderHomeTabs(btn.dataset.tag);
    });
  });

  // Reviews slider buttons
  document.getElementById('btn-prev-review').addEventListener('click', () => rotateReviews(-1));
  document.getElementById('btn-next-review').addEventListener('click', () => rotateReviews(1));

  // Catalog Filters listeners
  document.getElementById('filter-categories-container').addEventListener('change', () => {
    const activeCats = [];
    document.querySelectorAll('.category-filter-chk:checked').forEach(c => activeCats.push(c.value));
    catalogFilters.categories = activeCats;
    renderCatalog();
  });

  document.getElementById('filter-brands-container').addEventListener('change', () => {
    const activeBrands = [];
    document.querySelectorAll('.brand-filter-chk:checked').forEach(c => activeBrands.push(c.value));
    catalogFilters.brands = activeBrands;
    renderCatalog();
  });

  document.getElementById('filter-scales-container').addEventListener('change', () => {
    const activeScales = [];
    document.querySelectorAll('.scale-filter-chk:checked').forEach(c => activeScales.push(c.value));
    catalogFilters.scales = activeScales;
    renderCatalog();
  });

  els.priceRangeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    catalogFilters.maxPrice = val;
    els.priceSliderValue.textContent = `Max: $${val}`;
    renderCatalog();
  });

  els.sortSelect.addEventListener('change', (e) => {
    catalogFilters.sortBy = e.target.value;
    renderCatalog();
  });

  els.btnResetFilters.addEventListener('click', resetFilters);

  // Add all from wishlist to cart
  const btnAddAllWish = document.getElementById('btn-add-all-wishlist-cart');
  if (btnAddAllWish) {
    btnAddAllWish.addEventListener('click', () => {
      store.state.wishlist.forEach(id => store.addToCart(id, 1));
      store.state.wishlist = [];
      store.save();
      openCartDrawer();
    });
  }

  // Checkout payment radio toggles
  els.paymentMethods.forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.payment-method-selector .radio-label').forEach(lbl => lbl.classList.remove('active'));
      e.target.closest('.radio-label').classList.add('active');
      if (e.target.value === 'cc') {
        els.creditCardFields.classList.remove('hidden');
      } else {
        els.creditCardFields.classList.add('hidden');
      }
    });
  });

  // Checkout order placement
  els.checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fname = document.getElementById('checkout-fname').value;
    const lname = document.getElementById('checkout-lname').value;
    const email = document.getElementById('checkout-email').value;
    const address = document.getElementById('checkout-address').value;
    const city = document.getElementById('checkout-city').value;
    const zip = document.getElementById('checkout-zip').value;
    
    const customer = { fname, lname, email, address, city, zip };
    const orderId = store.placeOrder(customer);
    
    alert(`Acquisition order placed successfully! Order ID: ${orderId}`);
    
    // Clear checkout fields
    els.checkoutForm.reset();
    
    // Redirect to User account -> Orders page
    document.querySelectorAll('.account-tab-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.account-tab-link[data-sub="orders"]').classList.add('active');
    
    document.querySelectorAll('.account-sub-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById('account-sub-orders').classList.add('active');
    
    store.setRoute('account');
  });

  // Account tab clicks
  els.accountTabLinks.forEach(link => {
    link.addEventListener('click', () => {
      els.accountTabLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const targetSub = link.dataset.sub;
      els.accountPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `account-sub-${targetSub}`);
      });
      
      // If tracking tab was opened, clean result
      if (targetSub === 'tracking') {
        els.trackingSearchId.value = '';
        els.trackingResultArea.innerHTML = `<p class="placeholder-text">Enter an Order ID from your dashboard to trace the collector delivery route.</p>`;
      }
    });
  });

  // Account order tracking search
  els.btnSubmitTracking.addEventListener('click', () => {
    runOrderTrackingLookup(els.trackingSearchId.value);
  });
  
  els.trackingSearchId.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') runOrderTrackingLookup(els.trackingSearchId.value);
  });

  // Extra pages tabs
  els.extraTabLinks.forEach(link => {
    link.addEventListener('click', () => {
      store.setRoute('extra', link.dataset.page);
    });
  });

  // Extra contact form submit ticket
  els.contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Concierge message logged! Our collectors will email your profile shortly.");
    els.contactForm.reset();
  });

  // Admin Dashboard actions
  els.adminOpenAddBtn.addEventListener('click', () => {
    els.adminAddProductForm.classList.toggle('hidden');
  });
  
  els.btnAdminCancelAdd.addEventListener('click', () => {
    els.adminAddProductForm.classList.add('hidden');
    els.adminAddProductForm.reset();
  });

  els.adminAddProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('admin-p-name').value;
    const brand = document.getElementById('admin-p-brand').value;
    const scale = document.getElementById('admin-p-scale').value;
    const price = document.getElementById('admin-p-price').value;
    const stock = document.getElementById('admin-p-stock').value;
    const category = document.getElementById('admin-p-cat').value;
    const description = document.getElementById('admin-p-desc').value;
    const color = document.getElementById('admin-p-color').value;
    const openingParts = document.getElementById('admin-p-opening').value;
    const imageUrl1 = document.getElementById('admin-p-img1').value;
    
    store.adminAddProduct({
      name, brand, scale, price, stock, category, description, color, openingParts, imageUrl1
    });
    
    alert("Scale model registered to vault catalog!");
    els.adminAddProductForm.reset();
    els.adminAddProductForm.classList.add('hidden');
  });

  els.btnAdminResetData.addEventListener('click', () => {
    if (confirm("Resetting site database will restore the 20 default replica items, empty the cart/wishlist, and wipe order histories. Proceed?")) {
      store.resetToDefault();
      alert("Database reset complete!");
      store.setRoute('home');
    }
  });
}

// ----------------------------------------------------
// AUXILIARY HELPER FUNCTIONS
// ----------------------------------------------------
function startFlashCountdown() {
  const countdownEl = document.getElementById('flash-countdown');
  if (!countdownEl) return;
  
  setInterval(() => {
    if (flashCountdownSeconds > 0) {
      flashCountdownSeconds--;
      const hrs = Math.floor(flashCountdownSeconds / 3600);
      const mins = Math.floor((flashCountdownSeconds % 3600) / 60);
      const secs = flashCountdownSeconds % 60;
      
      const pad = (num) => num.toString().padStart(2, '0');
      countdownEl.innerHTML = `<span class="time-block">${pad(hrs)}</span>h <span class="time-block">${pad(mins)}</span>m <span class="time-block">${pad(secs)}</span>s`;
    }
  }, 1000);
}

function rotateReviews(direction) {
  const slides = document.querySelectorAll('.review-slide');
  slides[activeReviewsIndex].classList.remove('active');
  
  activeReviewsIndex = (activeReviewsIndex + direction + slides.length) % slides.length;
  slides[activeReviewsIndex].classList.add('active');
}

function openQuickviewModal(productId) {
  const product = store.state.products.find(p => p.id === productId);
  if (!product) return;
  
  const outOfStock = product.stock === 0;
  
  els.quickviewContent.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div>
        <img src="${product.images[0]}" alt="${product.name}" style="width: 100%; border-radius: 8px; object-fit: cover; aspect-ratio: 1.5;">
      </div>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <span class="details-brand-badge">${product.brand}</span>
          <h3 style="font-size: 1.5rem; margin-top: 0.3rem;">${product.name}</h3>
          <span style="font-size: 0.8rem; background: var(--border-color); padding: 0.1rem 0.4rem; border-radius: 4px;">Scale ${product.scale}</span>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">${product.description.slice(0, 180)}...</p>
        <div style="font-size: 1.3rem; font-weight: 700;">$${product.price.toFixed(2)}</div>
        <button id="btn-quick-add" class="btn-primary" ${outOfStock ? 'disabled' : ''}>
          ${outOfStock ? 'Sold Out' : 'Add to Collection'}
        </button>
        <button id="btn-quick-full-details" class="btn-secondary">View Full Details</button>
      </div>
    </div>
  `;
  
  els.quickviewModal.classList.remove('hidden');
  
  document.getElementById('btn-quick-add').addEventListener('click', () => {
    store.addToCart(product.id, 1);
    els.quickviewModal.classList.add('hidden');
    openCartDrawer();
  });
  
  document.getElementById('btn-quick-full-details').addEventListener('click', () => {
    els.quickviewModal.classList.add('hidden');
    store.setRoute('details', product.id);
  });
}

// Kickstart script on load
window.addEventListener('DOMContentLoaded', init);
