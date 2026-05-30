// ===== cart.js (MODIFIED) =====
// Fixed product links to point to product-detail.html?id=PRODUCT_ID
// Added newsletter form wiring

const API_BASE = 'https://arcana-backend-z46k.onrender.com/api';
const currencyRates = { USD: 1, EUR: 0.8666, GBP: 0.7375, NGN: 1547.30 };
const currencySymbols = { USD: "$", EUR: "€", GBP: "£", NGN: "₦" };
let currentCurrency = 'USD';

function showNotification(message, type = 'info') {
  const container = document.getElementById('notification-container');
  if (!container) return;
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  const iconMap = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  notif.innerHTML = `<i class="fa-solid ${iconMap[type] || iconMap.info}"></i><span>${message}</span>`;
  container.appendChild(notif);
  setTimeout(() => { notif.style.opacity = '0'; notif.style.transform = 'translateX(100%)'; setTimeout(() => notif.remove(), 300); }, 3000);
}

function showBlockingMessage(message, redirectUrl) {
  const overlay = document.getElementById('arcana-modal-overlay');
  const text = document.getElementById('arcana-modal-text');
  if (text) text.textContent = message;
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.querySelector('.close').onclick = () => { overlay.classList.add('hidden'); if (redirectUrl) window.location.href = redirectUrl; };
  }
}

function formatPrice(amount) {
  const rate = currencyRates[currentCurrency];
  const converted = (amount * rate).toFixed(2);
  return `${currencySymbols[currentCurrency]}${converted}`;
}

function renderCart() {
  const token = localStorage.getItem('token');
  const container = document.getElementById('cart-container');
  const emptyState = document.getElementById('empty-state');
  const summary = document.getElementById('cart-summary');
  const countText = document.getElementById('cart-count-text');

  if (!token) {
    if (container) container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (summary) summary.style.display = 'none';
    if (countText) countText.textContent = '0 items';
    return;
  }

  fetch(`${API_BASE}/cart`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const items = data.items || [];
      if (countText) countText.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

      if (items.length === 0) {
        if (container) container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        if (summary) summary.style.display = 'none';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';
      if (summary) summary.style.display = 'block';

      let subtotal = 0;
      container.innerHTML = items.map(item => {
        const product = item.product || {};
        const name = product.name || 'Unknown Product';
        const image = product.image || 'logo.png';
        const price = item.price || product.price || 0;
        const qty = item.quantity || 1;
        const size = item.size || 'One Size';
        const itemTotal = price * qty;
        subtotal += itemTotal;
        const productId = product._id || item.product;

        return `
          <div class="cart-item" data-id="${item._id}">
            <div class="cart-item-image">
              <img src="${image}" alt="${name}" loading="lazy" onerror="this.src='logo.png'">
            </div>
            <div class="cart-item-details">
              <a href="product-detail.html?id=${productId}" class="cart-item-name">${name}</a>
              <span class="cart-item-variant">Size: ${size}</span>
              <div class="cart-item-price">${formatPrice(price)}</div>
              <div class="quantity-control">
                <button onclick="updateQuantity('${item._id}', ${qty - 1})" ${qty <= 1 ? 'disabled' : ''}>-</button>
                <span>${qty}</span>
                <button onclick="updateQuantity('${item._id}', ${qty + 1})">+</button>
              </div>
            </div>
            <div class="cart-item-actions">
              <span class="item-total">${formatPrice(itemTotal)}</span>
              <button class="remove-btn" onclick="removeItem('${item._id}')" title="Remove item">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      updateSummary(subtotal);
    })
    .catch(err => {
      console.error('Cart load error:', err);
      showNotification('Failed to load cart', 'error');
    });
}

function updateSummary(subtotal) {
  const subtotalEl = document.querySelector('.subtotal');
  const totalEl = document.querySelector('.Total');
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(subtotal);
}

function updateQuantity(itemId, newQty) {
  if (newQty < 1) return;
  const token = localStorage.getItem('token');
  fetch(`${API_BASE}/cart/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ quantity: newQty })
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

// Checkout button
document.getElementById('checkout-btn')?.addEventListener('click', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    showBlockingMessage('Please sign in to proceed to checkout.', 'account.html');
    return;
  }
  window.location.href = 'checkout.html';
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

document.addEventListener('DOMContentLoaded', renderCart);