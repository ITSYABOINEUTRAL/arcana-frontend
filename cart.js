// ===== cart.js (FIXED) =====
// Restored direct Paystack checkout from oldcart.js
// Fixed quantity buttons (now sends {productId, quantity} like before)
// Fixed empty cart state (moved outside container in HTML below)
// Added auth guard so logged-out users see blocking modal redirect

const API_BASE = 'https://arcana-backend-z46k.onrender.com/api';
const currencyRates = { USD: 1, EUR: 0.8666, GBP: 0.7375, NGN: 1547.30 };
const currencySymbols = { USD: "$", EUR: "€", GBP: "£", NGN: "₦" };
let currentCurrency = 'USD';
let cartData = [];
let shippingCost = 0;
let subtotalUSD = 0;
let totalUSD = 0;

function showNotification(message, type = 'info') {
  const container = document.getElementById('notification-container');
  if (!container) return;
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  const iconMap = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
  notif.innerHTML = `<i class="fa-solid ${iconMap[type] || iconMap.info}"></i><span>${message}</span>`;
  container.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transform = 'translateX(100%)';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

function showBlockingMessage(message, redirectUrl) {
  const overlay = document.getElementById('arcana-modal-overlay');
  const text = document.getElementById('arcana-modal-text');
  if (text) text.textContent = message;
  if (overlay) {
    overlay.classList.remove('hidden');
    const closeBtn = overlay.querySelector('.close');
    closeBtn.onclick = () => {
      overlay.classList.add('hidden');
      if (redirectUrl) window.location.href = redirectUrl;
    };
  }
}

function formatPrice(amount) {
  const rate = currencyRates[currentCurrency];
  const converted = (amount * rate).toFixed(2);
  return `${currencySymbols[currentCurrency]}${converted}`;
}

async function fetchAddress() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}/user/addresses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const addresses = await res.json();
    const isNigeria = addresses.some(addr =>
      addr.country?.toLowerCase().includes('nigeria')
    );
    shippingCost = isNigeria ? 3.5 : 20;
  } catch (err) {
    console.error('Failed to fetch address:', err);
    shippingCost = 20;
  }
}

function updateSummary() {
  const subtotalEl = document.querySelector('.subtotal');
  const shippingEl = document.querySelector('.shipping');
  const totalEl = document.querySelector('.Total');
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotalUSD);
  if (shippingEl) shippingEl.textContent = formatPrice(shippingCost);
  if (totalEl) totalEl.textContent = formatPrice(subtotalUSD + shippingCost);
}

function renderCart() {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');
  const container = document.getElementById('cart-container');
  const emptyState = document.getElementById('empty-state');
  const summary = document.getElementById('cart-summary');
  const countText = document.getElementById('cart-count-text');

  // ===== AUTH GUARD — blocking modal =====
  if (!token || !userEmail) {
    showBlockingMessage("You must be logged in to access your cart.", "account.html");
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (container) container.style.display = 'block';

  fetch(`${API_BASE}/cart`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const items = data.items || [];
      cartData = items;

      if (countText) {
        countText.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
      }

      // ===== EMPTY CART (logged in) =====
      if (items.length === 0) {
        if (container) {
          container.innerHTML = '';
          container.style.display = 'none';
        }
        if (emptyState) emptyState.style.display = 'flex';
        if (summary) summary.style.display = 'none';
        subtotalUSD = 0;
        updateSummary();
        return;
      }

      // ===== HAS ITEMS =====
      if (emptyState) emptyState.style.display = 'none';
      if (summary) summary.style.display = 'block';

      subtotalUSD = 0;
      container.innerHTML = items.map(item => {
        const product = item.product || {};
        const name = product.name || 'Unknown Product';
        const image = product.image || 'logo.png';
        const price = item.price || product.price || 0;
        const qty = item.quantity || 1;
        const size = item.size || 'One Size';
        const itemTotal = price * qty;
        subtotalUSD += itemTotal;
        const productId = product._id || item.product;

        return `
          <div class="cart-item" data-id="${item._id}">
            <div class="cart-item-image">
              <img src="${image}" alt="${name}" loading="lazy" onerror="this.src='logo.png'">
            </div>
            <div class="cart-item-details">
              <a href="product-detail.html?id=${productId}" class="cart-item-name">${name}</a>
              <div class="cart-item-meta">
                <span><i class="fa-solid fa-ruler"></i> ${size}</span>
              </div>
              <div class="cart-item-price">${formatPrice(price)}</div>
              <div class="quantity-control">
                <button onclick="updateQuantity('${productId}', ${qty - 1})" ${qty <= 1 ? 'disabled' : ''}>-</button>
                <span>${qty}</span>
                <button onclick="updateQuantity('${productId}', ${qty + 1})">+</button>
              </div>
            </div>
            <div class="cart-item-actions">
              <span class="item-total">${formatPrice(itemTotal)}</span>
              <button class="remove-btn" onclick="removeItem('${item._id}')" title="Remove item">
                <i class="fa-solid fa-trash-can"></i> Remove
              </button>
            </div>
          </div>
        `;
      }).join('');

      updateSummary();
    })
    .catch(err => {
      console.error('Cart load error:', err);
      showNotification('Failed to load cart. Please try again.', 'error');
    });
}

// ===== FIXED: uses productId in URL + body (matches your old working code) =====
function updateQuantity(productId, newQty) {
  if (newQty < 1) return;
  const token = localStorage.getItem('token');
  fetch(`${API_BASE}/cart/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ productId, quantity: newQty })
  })
    .then(res => res.json())
    .then(() => renderCart())
    .catch(err => {
      console.error('Update error:', err);
      showNotification('Failed to update quantity', 'error');
    });
}

function removeItem(itemId) {
  const token = localStorage.getItem('token');
  fetch(`${API_BASE}/cart/${itemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(() => {
      showNotification('Item removed from cart', 'success');
      renderCart();
    })
    .catch(err => {
      console.error('Remove error:', err);
      showNotification('Failed to remove item', 'error');
    });
}

// Currency switcher
document.getElementById('currency')?.addEventListener('change', (e) => {
  currentCurrency = e.target.value;
  renderCart();
});

// ===== RESTORED: Direct Paystack checkout (no checkout.html redirect) =====
document.getElementById('checkout-btn')?.addEventListener('click', async () => {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');

  if (!token || !userEmail) {
    showBlockingMessage('Please sign in to proceed to checkout.', 'account.html');
    return;
  }

  if (cartData.length === 0) {
    showNotification('Your cart is empty. Add items before checking out.', 'error');
    return;
  }

  try {
    // 1. Verify user has address + phone
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = await res.json();

    const hasAddress = Array.isArray(user.addresses) && user.addresses.length > 0;
    const hasPhone = user.phone && user.phone.trim() !== '';

    if (!hasAddress || !hasPhone) {
      showNotification('Please add your shipping address and phone number first', 'warning');
      localStorage.setItem('returnAfterSettings', 'cart.html');
      return window.location.href = 'edit-settings.html';
    }

    const address = user.addresses[0];
    const reference = `ARC${Date.now()}`;
    totalUSD = subtotalUSD + shippingCost;

    // 2. Create order
    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        products: cartData.map(i => ({
          productId: i.product?._id || i.product,
          title: i.product?.name || 'Unknown',
          image: i.product?.image || 'logo.png',
          size: i.size || 'One Size',
          quantity: i.quantity || 1,
          price: i.price || 0
        })),
        shippingAddress: address,
        phoneNumber: user.phone,
        totalPrice: subtotalUSD,
        shippingFee: shippingCost,
        reference
      })
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      throw new Error(orderData.message || 'Failed to create order');
    }

    // 3. Initialize Paystack
    const amountInKobo = Math.round(totalUSD * 1547.30 * 100);
    const payRes = await fetch(`${API_BASE}/paystack/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        amount: amountInKobo,
        reference
      })
    });

    const data = await payRes.json();
    if (data.data && data.data.authorization_url) {
      window.location.href = data.data.authorization_url;
    } else {
      showNotification('Failed to initialize payment. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    showNotification(err.message || 'An error occurred during checkout', 'error');
  }
});

// Wire newsletter form on cart page
document.querySelector('.footer-newsletter form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  try {
    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      showNotification('Thanks for subscribing!', 'success');
      e.target.reset();
    } else {
      showNotification(data.message || 'Subscription failed', 'error');
    }
  } catch {
    showNotification('Network error. Please try again.', 'error');
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await fetchAddress();
  renderCart();
});