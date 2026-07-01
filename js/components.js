import { store } from './state.js';

export function createProductCard(product) {
  const isInWishlist = store.isInWishlist(product.id);
  const isInCompare = store.isInCompare(product.id);
  const outOfStock = product.stock === 0;

  let tagHTML = '';
  if (product.tag) {
    let tagClass = 'tag-default';
    if (product.tag === 'Limited Editions') tagClass = 'tag-limited';
    if (product.tag === 'Best Sellers') tagClass = 'tag-bestseller';
    if (product.tag === 'New Arrivals') tagClass = 'tag-new';
    tagHTML = `<span class="product-tag ${tagClass}">${product.tag}</span>`;
  }

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image-container">
        ${tagHTML}
        <img src="${product.images[0]}" alt="${product.name}" class="product-image" loading="lazy">
        <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" data-id="${product.id}" aria-label="Toggle Wishlist">
          <svg class="heart-icon" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
        <div class="quick-actions">
          <button class="btn-quickview" data-id="${product.id}">Quick View</button>
        </div>
      </div>
      <div class="product-details">
        <div class="product-meta">
          <span class="product-brand">${product.brand}</span>
          <span class="product-scale-badge">${product.scale}</span>
        </div>
        <h3 class="product-title" data-id="${product.id}">${product.name}</h3>
        <div class="product-rating">
          <span class="stars">★</span>
          <span class="rating-value">${product.rating.toFixed(1)}</span>
          <span class="reviews-count">(${product.reviewsCount})</span>
        </div>
        <div class="product-footer">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          ${outOfStock ? '<span class="out-of-stock-text">Sold Out</span>' : `<span class="stock-indicator">${product.stock} left</span>`}
        </div>
        <div class="card-action-row">
          <button class="btn-add-cart" data-id="${product.id}" ${outOfStock ? 'disabled' : ''}>
            ${outOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
          <button class="btn-compare ${isInCompare ? 'active' : ''}" data-id="${product.id}">
            ${isInCompare ? 'Added' : 'Compare'}
          </button>
        </div>
      </div>
    </div>
  `;
}

export function createCompareWidget(compareList, allProducts) {
  if (compareList.length === 0) return '';

  const products = compareList.map(id => allProducts.find(p => p.id === id)).filter(Boolean);

  return `
    <div class="compare-drawer">
      <div class="compare-drawer-header">
        <h4>Compare Cars (${compareList.length}/3)</h4>
        <div class="compare-actions">
          <button id="btn-open-compare" class="btn-primary-sm" ${compareList.length < 2 ? 'disabled' : ''}>Compare Now</button>
          <button id="btn-clear-compare" class="btn-text-sm">Clear All</button>
        </div>
      </div>
      <div class="compare-items-grid">
        ${products.map(p => `
          <div class="compare-item-chip">
            <img src="${p.images[0]}" alt="${p.name}">
            <div class="compare-item-chip-details">
              <h6>${p.name}</h6>
              <span>${p.scale} | $${p.price.toFixed(2)}</span>
            </div>
            <button class="remove-compare-chip" data-id="${p.id}">&times;</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function createCompareModalContent(compareList, allProducts) {
  const products = compareList.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
  if (products.length === 0) return '<p>No products selected for comparison.</p>';

  const specsKeys = [
    "Scale",
    "Brand",
    "Price",
    "Category",
    "Material",
    "Opening Parts",
    "Steering",
    "Year",
    "Color",
    "Weight",
  ];

  return `
    <div class="compare-table-container">
      <table class="compare-table">
        <thead>
          <tr>
            <th>Specifications</th>
            ${products.map(p => `
              <th>
                <div class="compare-table-header-prod">
                  <img src="${p.images[0]}" alt="${p.name}">
                  <h5>${p.name}</h5>
                  <span class="price">$${p.price.toFixed(2)}</span>
                  <button class="btn-primary-sm btn-add-cart" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${specsKeys.map(key => `
            <tr>
              <td class="spec-label">${key}</td>
              ${products.map(p => {
                let val = '';
                if (key === 'Scale') val = p.scale;
                else if (key === 'Brand') val = p.brand;
                else if (key === 'Price') val = `$${p.price.toFixed(2)}`;
                else if (key === 'Category') val = p.category;
                else val = p.specs[key] || 'N/A';
                return `<td>${val}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function createCartDrawerContent(cartItems, discountRate, couponCode) {
  if (cartItems.length === 0) {
    return `
      <div class="empty-cart-view">
        <svg class="cart-empty-icon" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
        <p>Your collector cart is empty</p>
        <button id="btn-cart-shop" class="btn-primary">Browse Catalog</button>
      </div>
    `;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  const itemsHTML = cartItems.map(item => `
    <div class="cart-drawer-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <h5>${item.name}</h5>
        <div class="cart-item-meta">
          <span>${item.brand} | ${item.scale}</span>
          <span class="price">$${item.price.toFixed(2)}</span>
        </div>
        <div class="quantity-controller">
          <button class="btn-qty-minus" data-id="${item.id}">-</button>
          <input type="number" class="qty-input" value="${item.quantity}" min="1" data-id="${item.id}" readonly>
          <button class="btn-qty-plus" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="btn-remove-cart-item" data-id="${item.id}" aria-label="Remove item">&times;</button>
    </div>
  `).join('');

  return `
    <div class="cart-drawer-items-list">
      ${itemsHTML}
    </div>
    <div class="cart-drawer-summary">
      <div class="coupon-section">
        ${couponCode ? `
          <div class="coupon-tag">
            <span>Code: <strong>${couponCode}</strong> (-${(discountRate * 100).toFixed(0)}%)</span>
            <button id="btn-remove-coupon">&times;</button>
          </div>
        ` : `
          <div class="coupon-input-group">
            <input type="text" id="coupon-code-input" placeholder="Enter coupon (COLLECTOR10)">
            <button id="btn-apply-coupon">Apply</button>
          </div>
        `}
      </div>
      <div class="summary-line">
        <span>Subtotal</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      ${discount > 0 ? `
        <div class="summary-line discount">
          <span>Discount</span>
          <span>-$${discount.toFixed(2)}</span>
        </div>
      ` : ''}
      <div class="summary-line total">
        <span>Total</span>
        <span>$${total.toFixed(2)}</span>
      </div>
      <button id="btn-go-checkout" class="btn-primary-block">Proceed to Checkout</button>
    </div>
  `;
}

export function createOrderTrackingView(order) {
  const steps = [
    { label: 'Order Placed', key: 'Order Placed' },
    { label: 'Processing', key: 'Processing' },
    { label: 'Shipped', key: 'Shipped' },
    { label: 'Delivered', key: 'Delivered' }
  ];

  let currentStepIndex = 0;
  if (order.status === 'Processing') currentStepIndex = 1;
  else if (order.status === 'Shipped') currentStepIndex = 2;
  else if (order.status === 'Out for Delivery' || order.status === 'Delivered') currentStepIndex = 3;

  return `
    <div class="tracking-container glass-card">
      <div class="tracking-header">
        <h4>Order ID: <span class="text-gold">${order.id}</span></h4>
        <span class="tracking-date">Placed on: ${order.date}</span>
      </div>
      <div class="tracking-progress-wrapper">
        <div class="tracking-line">
          <div class="tracking-line-fill" style="width: ${(currentStepIndex / 3) * 100}%"></div>
        </div>
        <div class="tracking-steps">
          ${steps.map((step, idx) => {
            let stateClass = '';
            if (idx < currentStepIndex) stateClass = 'completed';
            else if (idx === currentStepIndex) stateClass = 'active';
            return `
              <div class="tracking-step ${stateClass}">
                <div class="step-circle">${idx + 1}</div>
                <span class="step-label">${step.label}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="tracking-status-text">
        <p>Current Status: <strong>${order.status}</strong></p>
      </div>

      <div class="tracking-history-log">
        <h5>Activity History</h5>
        <ul>
          ${order.trackingHistory.map(log => `
            <li>
              <span class="log-time">${log.time}</span>
              <span class="log-status"><strong>${log.status}</strong></span>
              <span class="log-details">${log.details}</span>
            </li>
          `).reverse().join('')}
        </ul>
      </div>
    </div>
  `;
}
