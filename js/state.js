import { initialProducts } from './products.js';

class StateManager {
  constructor() {
    this.storageKey = 'diecast_haven_state_v1';
    this.loadState();
  }

  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state = {
          products: parsed.products || [...initialProducts],
          cart: parsed.cart || [],
          wishlist: parsed.wishlist || [],
          compareList: parsed.compareList || [],
          orders: parsed.orders || [],
          recentlyViewed: parsed.recentlyViewed || [],
          darkMode: parsed.darkMode !== undefined ? parsed.darkMode : true,
          activeRoute: parsed.activeRoute || 'home', // home, catalog, details, wishlist, cart, account, extra, admin
          selectedProductId: parsed.selectedProductId || null,
          activeExtraPage: parsed.activeExtraPage || 'about', // about, contact, faq, returns, privacy, terms
          couponCode: parsed.couponCode || null,
          couponDiscount: parsed.couponDiscount || 0,
        };
      } catch (e) {
        console.error("Error loading state", e);
        this.resetToDefault();
      }
    } else {
      this.resetToDefault();
    }
  }

  resetToDefault() {
    this.state = {
      products: [...initialProducts],
      cart: [],
      wishlist: [],
      compareList: [],
      orders: [],
      recentlyViewed: [],
      darkMode: true,
      activeRoute: 'home',
      selectedProductId: null,
      activeExtraPage: 'about',
      couponCode: null,
      couponDiscount: 0,
    };
    this.save();
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.notifyListeners();
  }

  // Event dispatch system
  listeners = [];
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.state));
  }

  // Dark Mode
  setDarkMode(val) {
    this.state.darkMode = val;
    this.save();
  }

  // Navigation
  setRoute(route, extraInfo = null) {
    this.state.activeRoute = route;
    if (route === 'details' && extraInfo) {
      this.state.selectedProductId = extraInfo;
      this.addRecentlyViewed(extraInfo);
    } else if (route === 'extra' && extraInfo) {
      this.state.activeExtraPage = extraInfo;
    }
    this.save();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Cart Management
  addToCart(productId, quantity = 1) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;

    const existing = this.state.cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity = Math.min(product.stock, existing.quantity + quantity);
    } else {
      this.state.cart.push({
        id: productId,
        name: product.name,
        brand: product.brand,
        scale: product.scale,
        price: product.price,
        image: product.images[0],
        quantity: Math.min(product.stock, quantity)
      });
    }
    this.save();
  }

  updateCartQuantity(productId, quantity) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;

    const item = this.state.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, Math.min(product.stock, quantity));
      this.save();
    }
  }

  removeFromCart(productId) {
    this.state.cart = this.state.cart.filter(item => item.id !== productId);
    this.save();
  }

  clearCart() {
    this.state.cart = [];
    this.state.couponCode = null;
    this.state.couponDiscount = 0;
    this.save();
  }

  // Wishlist
  toggleWishlist(productId) {
    const index = this.state.wishlist.indexOf(productId);
    if (index > -1) {
      this.state.wishlist.splice(index, 1);
    } else {
      this.state.wishlist.push(productId);
    }
    this.save();
  }

  isInWishlist(productId) {
    return this.state.wishlist.includes(productId);
  }

  // Comparison
  toggleCompare(productId) {
    const index = this.state.compareList.indexOf(productId);
    if (index > -1) {
      this.state.compareList.splice(index, 1);
    } else {
      if (this.state.compareList.length >= 3) {
        alert("You can compare a maximum of 3 cars side-by-side.");
        return;
      }
      this.state.compareList.push(productId);
    }
    this.save();
  }

  clearCompare() {
    this.state.compareList = [];
    this.save();
  }

  isInCompare(productId) {
    return this.state.compareList.includes(productId);
  }

  // Coupons
  applyCoupon(code) {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'COLLECTOR10') {
      this.state.couponCode = 'COLLECTOR10';
      this.state.couponDiscount = 0.10; // 10%
      this.save();
      return { success: true, message: 'Coupon applied successfully! 10% discount.' };
    } else if (cleanCode === 'FIRSTDIECAST') {
      this.state.couponCode = 'FIRSTDIECAST';
      this.state.couponDiscount = 0.15; // 15%
      this.save();
      return { success: true, message: 'Coupon applied successfully! 15% Welcome Discount.' };
    } else if (cleanCode === 'GOLDEN50') {
      this.state.couponCode = 'GOLDEN50';
      this.state.couponDiscount = 0.50; // 50%
      this.save();
      return { success: true, message: 'VIP Collector coupon applied! 50% discount.' };
    }
    return { success: false, message: 'Invalid coupon code.' };
  }

  removeCoupon() {
    this.state.couponCode = null;
    this.state.couponDiscount = 0;
    this.save();
  }

  // Orders
  placeOrder(customerDetails) {
    const subtotal = this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * this.state.couponDiscount;
    const tax = (subtotal - discount) * 0.08; // 8% tax
    const shipping = subtotal > 150 ? 0 : 15.00; // Free shipping over $150
    const total = subtotal - discount + tax + shipping;

    const orderId = 'DH-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString(),
      items: [...this.state.cart],
      subtotal,
      discount,
      tax,
      shipping,
      total,
      customerDetails,
      status: 'Processing', // Processing, Shipped, Out for Delivery, Delivered
      trackingHistory: [
        { status: 'Order Placed', time: new Date().toLocaleString(), details: 'Your order has been recorded in our system.' },
        { status: 'Processing', time: new Date().toLocaleString(), details: 'Our warehouse collectors are carefully inspecting and packing your scale models.' }
      ]
    };

    // Update stocks
    this.state.cart.forEach(cartItem => {
      const p = this.state.products.find(prod => prod.id === cartItem.id);
      if (p) {
        p.stock = Math.max(0, p.stock - cartItem.quantity);
      }
    });

    this.state.orders.unshift(newOrder);
    this.clearCart();
    this.save();
    return orderId;
  }

  // Recently Viewed
  addRecentlyViewed(productId) {
    this.state.recentlyViewed = this.state.recentlyViewed.filter(id => id !== productId);
    this.state.recentlyViewed.unshift(productId);
    if (this.state.recentlyViewed.length > 5) {
      this.state.recentlyViewed.pop();
    }
    // we don't save separately, let calling function handle saving or save inside
  }

  // AI Product Recommendation
  getAIRecommendations() {
    // Basic heuristics representing an AI: Recommend cars of matching scales, matching brands or categories.
    let activeId = this.state.selectedProductId;
    if (!activeId && this.state.recentlyViewed.length > 0) {
      activeId = this.state.recentlyViewed[0];
    }
    if (!activeId) {
      // Return 4 highly-rated/limited edition cars
      return this.state.products.slice(0, 4);
    }

    const currentCar = this.state.products.find(p => p.id === activeId);
    if (!currentCar) return this.state.products.slice(0, 4);

    return this.state.products
      .filter(p => p.id !== currentCar.id)
      .map(p => {
        let score = 0;
        if (p.scale === currentCar.scale) score += 3;
        if (p.category === currentCar.category) score += 2;
        if (p.brand === currentCar.brand) score += 2;
        if (p.tag === 'Limited Editions') score += 1;
        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.product);
  }

  // Admin Dashboard Actions
  adminAddProduct(productData) {
    const id = 'p' + (this.state.products.length + 1) + '_' + Date.now();
    const newProduct = {
      id,
      name: productData.name,
      brand: productData.brand,
      scale: productData.scale,
      price: parseFloat(productData.price) || 0,
      category: productData.category,
      tag: productData.tag || 'New Arrivals',
      rating: 5.0,
      reviewsCount: 0,
      stock: parseInt(productData.stock) || 5,
      description: productData.description || 'No description available.',
      specs: {
        "Material": productData.material || "Diecast Metal",
        "Opening Parts": productData.openingParts || "None",
        "Steering": productData.steering || "Fixed",
        "Year": productData.year || new Date().getFullYear().toString(),
        "Color": productData.color || "Standard Paint",
        "Weight": productData.weight || "0.5 kg",
        "Manufacturer Part No": productData.partNo || "DH-" + Math.floor(Math.random() * 10000)
      },
      images: [
        productData.imageUrl1 || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&auto=format&fit=crop&q=80",
        productData.imageUrl2 || "https://images.unsplash.com/photo-1611245801312-513364907659?w=600&auto=format&fit=crop&q=80",
        productData.imageUrl3 || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80",
        productData.imageUrl4 || "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80"
      ]
    };
    this.state.products.unshift(newProduct);
    this.save();
  }

  adminDeleteProduct(productId) {
    this.state.products = this.state.products.filter(p => p.id !== productId);
    this.state.cart = this.state.cart.filter(item => item.id !== productId);
    this.state.compareList = this.state.compareList.filter(id => id !== productId);
    this.save();
  }

  adminUpdateStock(productId, newStock) {
    const product = this.state.products.find(p => p.id === productId);
    if (product) {
      product.stock = Math.max(0, parseInt(newStock) || 0);
      this.save();
    }
  }

  adminUpdateOrderStatus(orderId, newStatus) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      order.trackingHistory.push({
        status: newStatus,
        time: new Date().toLocaleString(),
        details: `Order marked as: ${newStatus} by our administration.`
      });
      this.save();
    }
  }
}

export const store = new StateManager();
