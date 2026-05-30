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

function menuToggle() {
  if (MenuItems.style.maxHeight == "0px") {
    MenuItems.style.maxHeight = "200px";
  } else {
    MenuItems.style.maxHeight = "0px";
  }
}

/* =========================
   TYPE 1 – TOAST
   FIXED: explicit colors, close button, longer duration,
   safe null checks, no CSS animation dependency
========================= */
function showToast(message, type = "success") {
  const container = document.getElementById("notification-container");
  if (!container) {
    console.warn("[Arcana] notification-container not found in DOM");
    return;
  }

  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.setAttribute("role", "alert");
  notif.setAttribute("aria-live", "polite");

  // Explicit inline styles so no CSS file can accidentally hide it
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
    <button onclick="this.parentElement.remove()" style="
      background:none; border:none; color:${c.text}; font-size:18px;
      cursor:pointer; padding:0 4px; opacity:0.7; line-height:1;
    " aria-label="Dismiss notification">&times;</button>
  `;

  container.appendChild(notif);

  // Auto-remove after 5 seconds (user can also click X)
  const timer = setTimeout(() => {
    if (notif.parentElement) {
      notif.style.opacity = "0";
      notif.style.transform = "translateY(-20px)";
      setTimeout(() => notif.remove(), 400);
    }
  }, 5000);

  // Clear timer if manually dismissed
  notif.querySelector("button").addEventListener("click", () => clearTimeout(timer));
}

// Override alert globally → Type 1
window.alert = function (message) {
  showToast(message, "success");
};

/* =========================
   TYPE 2 – BLOCKING MODAL
   FIXED: safe null checks, Escape key, click outside,
   explicit dark text on white background
========================= */
function showBlockingMessage(message, redirectTo) {
  const overlay = document.getElementById("arcana-modal-overlay");
  const text = document.getElementById("arcana-modal-text");
  if (!overlay || !text) {
    console.warn("[Arcana] Modal overlay or text element not found in DOM");
    // Fallback: use alert if modal is missing
    window.alert(message);
    if (redirectTo) setTimeout(() => window.location.href = redirectTo, 1500);
    return;
  }

  text.textContent = message;
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  const closeBtn = overlay.querySelector(".close");
  if (closeBtn) {
    closeBtn.onclick = () => closeModal(redirectTo);
  }

  // Escape key to close
  const escHandler = (e) => {
    if (e.key === "Escape") closeModal(redirectTo);
  };
  document.addEventListener("keydown", escHandler);

  // Click outside to close
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal(redirectTo);
  };

  function closeModal(redirect) {
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", escHandler);
    if (redirect) window.location.href = redirect;
  }
}

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