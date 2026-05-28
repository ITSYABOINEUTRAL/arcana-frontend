// === cart.js (MODERNIZED) ===
let subtotalUSD = 0;
let totalUSD = 0;

// ===== UTILITY: Toast Notifications =====
function showNotification(message, type = 'info') {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const notif = document.createElement('div');
  notif.className = `notification ${type}`;

  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info'
  };

  notif.innerHTML = `
    <i class="fa-solid ${iconMap[type] || iconMap.info}"></i>
    <span>${message}</span>
  `;

  container.appendChild(notif);

  // Auto-remove after 3s
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transform = 'translateX(100%)';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// ===== UTILITY: Modal =====
function showBlockingMessage(message, redirectUrl) {
  const overlay = document.getElementById('arcana-modal-overlay');
  const text = document.getElementById('arcana-modal-text');

  if (text) text.textContent = message;
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.querySelector('.close').onclick = () => {
      overlay.classList.add('hidden');
      if (redirectUrl) window.location.href = redirectUrl;
    };
  }
}

// ===== MAIN =====
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');

  if (!token || !userEmail) {
    showBlockingMessage(
      "You must be logged in to access your cart.",
      "account.html"
    );
    return;
  }

  const API_BASE = "https://arcana-backend-z46k.onrender.com/api";
  const cartContainer = document.getElementById('cart-container');
  const subtotalEl = document.querySelector(".subtotal");
  const shippingEl = document.querySelector(".shipping");
  const totalEl = document.querySelector(".Total");
  const currencySelector = document.getElementById("currency");
  const cartCountText = document.getElementById("cart-count-text");
  const emptyState = document.getElementById("empty-state");
  const checkoutBtn = document.getElementById("checkout-btn");

  const currencyRates = {
    USD: 1,
    EUR: 0.8666,
    GBP: 0.7375,
    NGN: 1547.30
  };

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦"
  };

  let currentCurrency = currencySelector?.value || "USD";
  let cartData = [];
  let shippingCost = 0;

  // ===== FETCH SHIPPING COST =====
  async function fetchAddress() {
    try {
      const res = await fetch(`${API_BASE}/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const addresses = await res.json();
      const isNigeria = addresses.some(addr =>
        addr.country?.toLowerCase().includes('nigeria')
      );
      shippingCost = isNigeria ? 3.5 : 20;
    } catch {
      shippingCost = 20;
    }
  }

  // ===== CALCULATE TOTALS =====
  function calculateAndDisplayTotals() {
    const rate = currencyRates[currentCurrency];
    subtotalUSD = 0;

    cartData.forEach(item => {
      subtotalUSD += item.price * item.quantity;
    });

    const shippingConverted = shippingCost * rate;
    totalUSD = subtotalUSD + shippingCost;
    const subtotalConverted = subtotalUSD * rate;
    const totalConverted = totalUSD * rate;

    if (subtotalEl) subtotalEl.textContent = currencySymbols[currentCurrency] + subtotalConverted.toFixed(2);
    if (shippingEl) shippingEl.textContent = currencySymbols[currentCurrency] + shippingConverted.toFixed(2);
    if (totalEl) totalEl.textContent = currencySymbols[currentCurrency] + totalConverted.toFixed(2);

    // Update item count
    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountText) {
      cartCountText.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }
  }

  // ===== RENDER CART (CARD-BASED) =====
  function renderCart() {
    if (!cartContainer) return;

    // If empty, show empty state
    if (!cartData || cartData.length === 0) {
      cartContainer.innerHTML = '';
      if (emptyState) {
        emptyState.style.display = 'block';
        cartContainer.appendChild(emptyState);
      }
      calculateAndDisplayTotals();
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    // Hide empty state
    if (emptyState) emptyState.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = false;

    // Clear and rebuild
    cartContainer.innerHTML = '';
    if (emptyState) cartContainer.appendChild(emptyState);

    cartData.forEach(item => {
      const name = item.product?.name || "Unnamed";
      const price = item.price;
      const img = item.product?.image || 'default.png';
      const priceConverted = price * currencyRates[currentCurrency];
      const totalConverted = price * item.quantity * currencyRates[currentCurrency];
      const itemId = item._id;
      const productId = item.product?._id;

      const card = document.createElement("div");
      card.className = "cart-item";
      card.innerHTML = `
        <div class="cart-item-image">
          <img src="${img}" alt="${name}" loading="lazy">
        </div>
        <div class="cart-item-details">
          <a href="product-details.html?id=${productId}" class="cart-item-name">${name}</a>
          <div class="cart-item-meta">
            <span><i class="fa-solid fa-ruler"></i> ${item.size || 'One Size'}</span>
            <span><i class="fa-solid fa-tag"></i> ${currencySymbols[currentCurrency]}${priceConverted.toFixed(2)} each</span>
          </div>
          <div class="quantity-control">
            <button class="qty-minus" data-id="${productId}"><i class="fa-solid fa-minus"></i></button>
            <input class="quantity-input" type="number" min="1" value="${item.quantity}" data-id="${productId}" readonly>
            <button class="qty-plus" data-id="${productId}"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>
        <div class="cart-item-actions">
          <div class="item-total">${currencySymbols[currentCurrency]}${totalConverted.toFixed(2)}</div>
          <button class="remove-btn" data-id="${itemId}">
            <i class="fa-solid fa-trash-can"></i> Remove
          </button>
        </div>
      `;
      cartContainer.appendChild(card);
    });

    calculateAndDisplayTotals();
    bindQuantityListeners();
    bindRemoveButtons();
  }

  // ===== QUANTITY CONTROLS =====
  function bindQuantityListeners() {
    // Plus/Minus buttons
    document.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const input = document.querySelector(`.quantity-input[data-id="${id}"]`);
        const newQty = parseInt(input.value) + 1;
        await updateQuantity(id, newQty, input);
      });
    });

    document.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const input = document.querySelector(`.quantity-input[data-id="${id}"]`);
        const newQty = Math.max(1, parseInt(input.value) - 1);
        if (newQty !== parseInt(input.value)) {
          await updateQuantity(id, newQty, input);
        }
      });
    });
  }

  async function updateQuantity(id, newQty, inputEl) {
    try {
      const res = await fetch(`${API_BASE}/cart/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: id, quantity: newQty })
      });

      if (!res.ok) throw new Error('Update failed');

      cartData = cartData.map(i =>
        i.product._id === id ? { ...i, quantity: newQty } : i
      );
      renderCart();
      showNotification('Quantity updated', 'success');
    } catch (err) {
      console.error("Quantity update failed", err);
      showNotification('Failed to update quantity', 'error');
      if (inputEl) inputEl.value = cartData.find(i => i.product._id === id)?.quantity || 1;
    }
  }

  // ===== REMOVE ITEMS =====
  function bindRemoveButtons() {
    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const item = cartData.find(i => i._id === id);
        const itemName = item?.product?.name || 'Item';

        // Confirm before removing
        if (!confirm(`Remove "${itemName}" from your cart?`)) return;

        try {
          const res = await fetch(`${API_BASE}/cart/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!res.ok) throw new Error('Delete failed');

          cartData = cartData.filter(i => i._id !== id);
          renderCart();
          showNotification(`${itemName} removed from cart`, 'success');
        } catch (err) {
          console.error("Delete failed", err);
          showNotification('Failed to remove item', 'error');
        }
      });
    });
  }

  // ===== CURRENCY SWITCHER =====
  if (currencySelector) {
    currencySelector.addEventListener("change", () => {
      currentCurrency = currencySelector.value;
      renderCart();
    });
  }

  // ===== FETCH CART =====
  async function fetchCart() {
    try {
      // Show loading skeleton
      if (cartContainer && emptyState) {
        cartContainer.innerHTML = `
          <div class="cart-item skeleton-item" style="padding:24px;">
            <div class="skeleton" style="width:120px;height:120px;border-radius:8px;"></div>
            <div style="flex:1;">
              <div class="skeleton" style="width:60%;height:20px;margin-bottom:12px;"></div>
              <div class="skeleton" style="width:40%;height:14px;"></div>
            </div>
          </div>
        `;
      }

      const res = await fetch(`${API_BASE}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        cartData = [];
        renderCart();
        return;
      }

      cartData = data.items;
      renderCart();
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      showNotification('Failed to load cart', 'error');
    }
  }

  // ===== CHECKOUT =====
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
      if (cartData.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
      }

      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");

      if (!token || !userEmail) {
        showNotification("Please sign in to continue.", 'error');
        window.location.href = "account.html";
        return;
      }

      // Loading state
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...`;

      try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = await res.json();
        const hasAddress = Array.isArray(user.addresses) && user.addresses.length > 0;
        const hasPhone = user.phone && user.phone.trim() !== "";

        if (!hasAddress || !hasPhone) {
          showNotification("Please complete your profile before checkout", 'error');
          localStorage.setItem("returnAfterSettings", "cart.html");
          window.location.href = "edit-settings.html";
          return;
        }

        const address = user.addresses[0];
        const amountInKobo = Math.round(totalUSD * 1547.30 * 100);
        const reference = `ARC${Date.now()}`;

        // Create order
        const orderRes = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            products: cartData.map(i => ({
              productId: i.product._id,
              title: i.product.name,
              image: i.product.image,
              size: i.size,
              quantity: i.quantity,
              price: i.price
            })),
            shippingAddress: address,
            phoneNumber: user.phone,
            totalPrice: subtotalUSD,
            shippingFee: shippingCost,
            reference
          })
        });

        const orderData = await orderRes.json();

        // Initialize Paystack
        const payRes = await fetch(`${API_BASE}/paystack/initialize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          throw new Error('Payment initialization failed');
        }
      } catch (err) {
        console.error("Checkout error:", err);
        showNotification("An error occurred. Please try again.", 'error');
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = `<span>Proceed to Checkout</span><i class="fa-solid fa-arrow-right"></i>`;
      }
    });
  }

  // ===== INIT =====
  await fetchAddress();
  await fetchCart();
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();