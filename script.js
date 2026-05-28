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
========================= */
function showToast(message, type = "success") {
  const container = document.getElementById("notification-container");
  if (!container) return;

  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;

  container.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = "0";
    notif.style.transform = "translateY(-20px)";
    setTimeout(() => notif.remove(), 400);
  }, 3500);
}

// Override alert globally → Type 1
window.alert = function (message) {
  showToast(message, "success");
};


/* =========================
   TYPE 2 – BLOCKING MODAL
========================= */
function showBlockingMessage(message, redirectTo) {
  const overlay = document.getElementById("arcana-modal-overlay");
  const text = document.getElementById("arcana-modal-text");
  if (!overlay || !text) return;

  text.textContent = message;
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  overlay.querySelector(".close").onclick = () => {
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
    if (redirectTo) window.location.href = redirectTo;
  };
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
    // Remove any existing click handlers to prevent duplicates
    const newHeader = header.cloneNode(true);
    header.parentNode.replaceChild(newHeader, header);

    if (isMobile) {
      newHeader.style.cursor = 'pointer';
      newHeader.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const col = this.parentElement;
        const isOpen = col.classList.contains('open');

        // Close all others (optional — remove this block if you want multiple open)
        document.querySelectorAll('.footer-col.open').forEach(openCol => {
          if (openCol !== col) openCol.classList.remove('open');
        });

        // Toggle current
        col.classList.toggle('open', !isOpen);
      });
    } else {
      newHeader.style.cursor = 'default';
      // Ensure all are open on desktop
      newHeader.parentElement.classList.add('open');
    }
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initFooterAccordion);

// Re-initialize on resize (with debounce)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initFooterAccordion, 150);
});