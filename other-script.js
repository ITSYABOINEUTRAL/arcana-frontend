var MenuItems = document.getElementById("MenuItems");
if (MenuItems) {
  MenuItems.style.maxHeight = "0px";
}

function menuToggle() {
  if (!MenuItems) return;
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
  if (!container) {
    console.warn("[Arcana] notification-container not found");
    return;
  }

  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.setAttribute("role", "alert");

  const colors = {
    success: { bg: "#59493b", text: "#ffffff", border: "#59493b" },
    error:   { bg: "#c0392b", text: "#ffffff", border: "#c0392b" },
    warning: { bg: "#d4a017", text: "#1a1a1a", border: "#d4a017" },
    info:    { bg: "#2c3e50", text: "#ffffff", border: "#2c3e50" }
  };
  const c = colors[type] || colors.success;

  notif.style.cssText = `
    background: ${c.bg}; color: ${c.text}; border-left: 4px solid ${c.border};
    padding: 14px 20px; margin-top: 10px; border-radius: 6px; font-size: 14px;
    font-family: 'Poppins', sans-serif; box-shadow: 0 8px 25px rgba(0,0,0,0.35);
    display: flex; align-items: center; gap: 12px; min-width: 280px; max-width: 420px;
    opacity: 1; transform: translateY(0); transition: opacity 0.4s, transform 0.4s;
    cursor: default; position: relative; z-index: 99999;
  `;

  notif.innerHTML = `
    <span style="flex:1; line-height:1.5;">${message}</span>
    <button onclick="this.parentElement.remove()" style="
      background:none; border:none; color:${c.text}; font-size:18px;
      cursor:pointer; padding:0 4px; opacity:0.7; line-height:1;
    " aria-label="Dismiss">&times;</button>
  `;

  container.appendChild(notif);
  const timer = setTimeout(() => {
    if (notif.parentElement) {
      notif.style.opacity = "0";
      notif.style.transform = "translateY(-20px)";
      setTimeout(() => notif.remove(), 400);
    }
  }, 5000);
  notif.querySelector("button").addEventListener("click", () => clearTimeout(timer));
}

window.alert = function (message) {
  showToast(message, "success");
};

/* =========================
   TYPE 2 – BLOCKING MODAL
========================= */
function showBlockingMessage(message, redirectTo) {
  const overlay = document.getElementById("arcana-modal-overlay");
  const text = document.getElementById("arcana-modal-text");
  if (!overlay || !text) {
    console.warn("[Arcana] Modal elements not found");
    window.alert(message);
    if (redirectTo) setTimeout(() => window.location.href = redirectTo, 1500);
    return;
  }

  text.textContent = message;
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  const closeBtn = overlay.querySelector(".close");
  if (closeBtn) closeBtn.onclick = () => closeModal(redirectTo);

  const escHandler = (e) => { if (e.key === "Escape") closeModal(redirectTo); };
  document.addEventListener("keydown", escHandler);
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(redirectTo); };

  function closeModal(redirect) {
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", escHandler);
    if (redirect) window.location.href = redirect;
  }
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();