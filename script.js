(function() {
  "use strict";

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

  const currencySelector = document.getElementById("currency");
  const prices = document.querySelectorAll(".product-price");

  if (currencySelector) {
    currencySelector.addEventListener("change", () => {
      const selectedCurrency = currencySelector.value;
      prices.forEach(priceEl => {
        const usdPrice = parseFloat(priceEl.getAttribute("data-usd"));
        const converted = usdPrice * currencyRates[selectedCurrency];
        priceEl.textContent = currencySymbols[selectedCurrency] + converted.toFixed(2);
      });
    });
  }

  var MenuItems = document.getElementById("MenuItems");
  if (MenuItems) {
    MenuItems.style.maxHeight = "0px";
  }

  // Expose to window for inline onclick
  window.menuToggle = function() {
    if (MenuItems.style.maxHeight == "0px") {
      MenuItems.style.maxHeight = "200px";
    } else {
      MenuItems.style.maxHeight = "0px";
    }
  };

  /* =========================
     TYPE 1 – TOAST
  ========================= */
  window.showToast = function(message, type) {
    type = type || "success";
    const container = document.getElementById("notification-container");
    if (!container) {
      console.warn("[Arcana] notification-container not found in DOM");
      return;
    }

    const notif = document.createElement("div");
    notif.className = "notification " + type;
    notif.setAttribute("role", "alert");
    notif.setAttribute("aria-live", "polite");

    const colors = {
      success: { bg: "#59493b", text: "#ffffff", border: "#59493b" },
      error:   { bg: "#c0392b", text: "#ffffff", border: "#c0392b" },
      warning: { bg: "#d4a017", text: "#1a1a1a", border: "#d4a017" },
      info:    { bg: "#2c3e50", text: "#ffffff", border: "#2c3e50" }
    };
    const c = colors[type] || colors.success;

    notif.style.cssText = `
      background: ${c.bg};
      color: ${c.text};
      border-left: 4px solid ${c.border};
      padding: 14px 20px;
      margin-top: 10px;
      border-radius: 6px;
      font-size: 14px;
      font-family: 'Poppins', sans-serif;
      box-shadow: 0 8px 25px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 280px;
      max-width: 420px;
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.4s ease, transform 0.4s ease;
      cursor: default;
      position: relative;
      z-index: 99999;
    `;

    notif.innerHTML = `
      <span style="flex:1; line-height:1.5;">${message}</span>
      <button style="background:none; border:none; color:${c.text}; font-size:18px; cursor:pointer; padding:0 4px; opacity:0.7; line-height:1;" aria-label="Dismiss notification">&times;</button>
    `;

    container.appendChild(notif);

    const timer = setTimeout(() => {
      if (notif.parentElement) {
        notif.style.opacity = "0";
        notif.style.transform = "translateY(-20px)";
        setTimeout(() => notif.remove(), 400);
      }
    }, 5000);

    notif.querySelector("button").addEventListener("click", () => {
      clearTimeout(timer);
      notif.remove();
    });
  };

  // Override alert globally
  window.alert = function(message) {
    window.showToast(message, "success");
  };

  /* =========================
     TYPE 2 – BLOCKING MODAL
  ========================= */
  window.showBlockingMessage = function(message, redirectTo) {
    const overlay = document.getElementById("arcana-modal-overlay");
    const text = document.getElementById("arcana-modal-text");
    if (!overlay || !text) {
      console.warn("[Arcana] Modal overlay or text element not found in DOM");
      window.alert(message);
      if (redirectTo) setTimeout(() => window.location.href = redirectTo, 1500);
      return;
    }

    text.textContent = message;
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    const closeBtn = overlay.querySelector(".close");
    if (closeBtn) {
      closeBtn.onclick = function() { closeModal(redirectTo); };
    }

    const escHandler = function(e) {
      if (e.key === "Escape") closeModal(redirectTo);
    };
    document.addEventListener("keydown", escHandler);

    overlay.onclick = function(e) {
      if (e.target === overlay) closeModal(redirectTo);
    };

    function closeModal(redirect) {
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", escHandler);
      if (redirect) window.location.href = redirect;
    }
  };

  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================
     MOBILE FOOTER ACCORDION
  ========================= */
  function initFooterAccordion() {
    const isMobile = window.innerWidth <= 600;
    const headers = document.querySelectorAll('.footer-col h4');

    headers.forEach(header => {
      const newHeader = header.cloneNode(true);
      header.parentNode.replaceChild(newHeader, header);

      if (isMobile) {
        newHeader.style.cursor = 'pointer';
        newHeader.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const col = this.parentElement;
          const isOpen = col.classList.contains('open');
          document.querySelectorAll('.footer-col.open').forEach(openCol => {
            if (openCol !== col) openCol.classList.remove('open');
          });
          col.classList.toggle('open', !isOpen);
        });
      } else {
        newHeader.style.cursor = 'default';
        newHeader.parentElement.classList.add('open');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initFooterAccordion);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initFooterAccordion, 150);
  });

  /* ===== NEWSLETTER WIRING ===== */
  (function() {
    const API_BASE = (typeof API_CONFIG !== 'undefined' && API_CONFIG && API_CONFIG.base)
      ? API_CONFIG.base
      : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:5000/api'
          : 'https://arcana-backend-z46k.onrender.com/api');

    function wireNewsletterForms() {
      document.querySelectorAll('.newsletter-form').forEach(form => {
        form.removeAttribute('onsubmit');
        if (form.dataset.wired === 'true') return;
        form.dataset.wired = 'true';

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const emailInput = form.querySelector('input[type="email"]');
          if (!emailInput) return;
          const email = emailInput.value.trim();
          if (!email) return;

          const btn = form.querySelector('button[type="submit"]');
          if (btn) { btn.disabled = true; btn.textContent = 'Joining...'; }

          try {
            const res = await fetch(API_BASE + '/newsletter/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
              window.showToast('Thanks for subscribing!', 'success');
              form.reset();
            } else {
              window.showToast(data.message || 'Subscription failed', 'error');
            }
          } catch {
            window.showToast('Network error. Please try again.', 'error');
          } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'Join'; }
          }
        });
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wireNewsletterForms);
    } else {
      wireNewsletterForms();
    }
  })();

})();

/* ============================================================
   ARCANA MOBILE MENU — Animated Toggle + Full-Screen Overlay
   Skipped entirely when on index.html (landing page)
   ============================================================ */

(function() {
  "use strict";

  // Detect landing page
  const path = window.location.pathname;
  const IS_INDEX = path === '/' ||
                   path.endsWith('/index.html') ||
                   path === '/index' ||
                   path === '';

  if (IS_INDEX) return; // <-- Don't inject menu on index.html

  // Inject mobile menu overlay if not present (auto-injected on every page)
  (function injectMobileMenu() {
    if (document.getElementById('mobileMenu')) return;

    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.id = 'mobileMenu';
    overlay.innerHTML = `
      <div class="menu-header">
        <div class="menu-brand">
          <img src="logo.png" alt="Arcana" class="menu-logo" onerror="this.style.display='none'">
          <div class="menu-tagline">Designed With Intention</div>
        </div>
        <button class="menu-close" onclick="menuToggle()" aria-label="Close menu">&times;</button>
      </div>

      <div class="menu-user" id="menuUser">
        <div class="user-avatar" id="userAvatar">?</div>
        <div class="user-info">
          <h4 id="userName">Guest</h4>
          <span>Welcome to Arcana</span>
        </div>
      </div>

      <ul class="mobile-nav" id="mobileNav">
        <li><a href="index.html" target="_self">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </a></li>
        <li><a href="product.html" target="_self">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          Shop
          <span class="nav-badge">New</span>
        </a></li>
        <li><a href="gallery.html" target="_self">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Gallery
        </a></li>
        <li><a href="account.html" target="_self">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Account
        </a></li>
        <li><a href="contact.html" target="_self">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Contact
        </a></li>
        <li><a href="cart.html" target="_self">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Cart
          <span class="nav-badge" id="menuCartBadge" style="display:none;">0</span>
        </a></li>
      </ul>

      <div class="menu-footer">
        <div class="menu-social">
          <a href="https://www.instagram.com/arcana.pz" aria-label="Instagram" target="_blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="https://www.tiktok.com/@arcana.ng" aria-label="TikTok" target="_blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
          </a>
          <a href="https://x.com/arcanashopng1" aria-label="X" target="_blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
          </a>
          <a href="https://pin.it/2TyuCuriX" aria-label="Pinterest" target="_blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="8" x2="12" y2="21"/><path d="M6 12a6 6 0 0 1 12 0c0 4-2 6-6 6"/></svg>
          </a>
        </div>
        <div class="menu-legal">
          <a href="privacy-policy.html" target="_self">Privacy</a>
          <a href="terms&conditions.html" target="_self">Terms</a>
          <a href="order_status.html" target="_self">Track Order</a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  })();

  // Override menuToggle
  window.menuToggle = function() {
    const toggle = document.getElementById('menuToggle');
    const overlay = document.getElementById('mobileMenu');
    if (!overlay) return;
    const isOpen = overlay.classList.contains('open');
    if (isOpen) {
      overlay.classList.remove('open');
      if (toggle) toggle.classList.remove('active');
      document.body.style.overflow = '';
    } else {
      overlay.classList.add('open');
      if (toggle) toggle.classList.add('active');
      document.body.style.overflow = 'hidden';
      loadMenuUser();
    }
  };

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('mobileMenu');
      if (overlay && overlay.classList.contains('open')) menuToggle();
    }
  });

  // Close on backdrop click
  document.addEventListener('click', (e) => {
    const overlay = document.getElementById('mobileMenu');
    if (e.target === overlay && overlay.classList.contains('open')) menuToggle();
  });

  /* ===== LIVE CART BADGE ===== */
  const API_BASE_CART = (typeof API_CONFIG !== 'undefined' && API_CONFIG && API_CONFIG.base)
    ? API_CONFIG.base
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://arcana-backend-z46k.onrender.com/api');

  async function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const menuBadge = document.getElementById('menuCartBadge');
    if (!badge) return;

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_CART}/cart`, {
        method: 'GET',
        credentials: 'include',
        headers
      });
      if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      const items = data.items || data.cart?.items || [];
      const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

      if (count > 0) {
        const text = count > 99 ? '99+' : count;
        badge.textContent = text;
        badge.style.display = 'flex';
        badge.classList.add('pop');
        setTimeout(() => badge.classList.remove('pop'), 300);
        if (menuBadge) {
          menuBadge.textContent = text;
          menuBadge.style.display = 'inline-flex';
        }
      } else {
        badge.style.display = 'none';
        if (menuBadge) menuBadge.style.display = 'none';
      }
    } catch (e) {
      badge.style.display = 'none';
      if (menuBadge) menuBadge.style.display = 'none';
    }
  }

  /* ===== MENU USER STATE ===== */
  async function loadMenuUser() {
    const menuUser = document.getElementById('menuUser');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    if (!menuUser) return;

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_CART}/auth/profile`, {
        credentials: 'include',
        headers
      });
      if (!res.ok) return;
      const user = await res.json();
      if (user.name || user.email) {
        const name = user.name || user.email.split('@')[0];
        const initials = name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
        userName.textContent = name;
        userAvatar.textContent = initials;
        if (user.profilePicture) {
          userAvatar.style.background = `url(${user.profilePicture}) center/cover`;
          userAvatar.textContent = '';
        }
        menuUser.classList.add('visible');
      }
    } catch (e) {
      menuUser.classList.remove('visible');
    }
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateCartBadge();
      loadMenuUser();
    });
  } else {
    updateCartBadge();
    loadMenuUser();
  }
})();