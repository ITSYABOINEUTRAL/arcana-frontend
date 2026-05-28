// === account-dashboard-script.js (MODERNIZED) ===
// All original logic preserved. Enhanced with toast notifications & loading states.

const API_BASE = 'https://arcana-backend-z46k.onrender.com/api';
const token = localStorage.getItem('token');

// ===== AUTH GUARD (PRESERVED) =====
if (!token) {
  showBlockingMessage(
    "You must be logged in to access your dashboard.",
    "account.html"
  );
}

// ===== GET USER PROFILE (PRESERVED) =====
fetch(`${API_BASE}/user/profile`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    // Update all profile fields
    const nameEl = document.getElementById("user-name");
    const welcomeNameEl = document.getElementById("welcome-name");
    const sidebarNameEl = document.getElementById("sidebar-name");
    const emailEl = document.getElementById("user-email");
    const sidebarEmailEl = document.getElementById("sidebar-email");
    const phoneEl = document.getElementById("user-phone");

    if (nameEl) nameEl.textContent = data.name || '—';
    if (welcomeNameEl) welcomeNameEl.textContent = data.name?.split(' ')[0] || '...';
    if (sidebarNameEl) sidebarNameEl.textContent = data.name || 'User';
    if (emailEl) emailEl.textContent = data.email || '—';
    if (sidebarEmailEl) sidebarEmailEl.textContent = data.email || '';
    if (phoneEl) phoneEl.textContent = data.phone || 'Not provided';

    // Update address section
    const addressContainer = document.getElementById("user-address");
    const statAddresses = document.getElementById("stat-addresses");

    if (data.addresses && data.addresses.length > 0) {
      if (statAddresses) statAddresses.textContent = data.addresses.length;
      const addr = data.addresses[0];
      const formattedAddress = `${addr.street}, ${addr.city}, ${addr.state}, ${addr.zip}, ${addr.country}`;

      if (addressContainer) {
        addressContainer.innerHTML = `
          <div class="address-card">
            <div class="address-icon"><i class="fa-solid fa-house"></i></div>
            <div class="address-details">
              <p class="address-line">${addr.street}</p>
              <p class="address-line">${addr.city}, ${addr.state} ${addr.zip}</p>
              <p class="address-line">${addr.country}</p>
            </div>
          </div>
        `;
      }
    } else {
      if (statAddresses) statAddresses.textContent = '0';
    }

    // Update profile picture
    if (data.profilePicture) {
      const picEl = document.getElementById("user-profile-pic");
      if (picEl) picEl.src = data.profilePicture;
    }
  })
  .catch(() => {
    showToast("Failed to load profile. Please log in again.", 'error');
    window.location.href = "account.html";
  });

// ===== GET ORDER HISTORY (PRESERVED) =====
fetch(`${API_BASE}/user/orders`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("order-history");
    const statOrders = document.getElementById("stat-orders");

    if (statOrders) statOrders.textContent = data.length || 0;

    if (!list) return;

    if (data.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-box-open"></i>
          <p>No orders yet</p>
          <a href="product.html" class="btn-empty">Start Shopping</a>
        </div>
      `;
    } else {
      list.innerHTML = '';
      data.forEach(order => {
        const statusColors = {
          'pending': 'status-pending',
          'processing': 'status-processing',
          'shipped': 'status-shipped',
          'delivered': 'status-delivered',
          'cancelled': 'status-cancelled'
        };
        const statusClass = statusColors[order.status?.toLowerCase()] || 'status-pending';

        const card = document.createElement("div");
        card.className = "order-card";
        card.innerHTML = `
          <div class="order-header">
            <div class="order-id">
              <span class="order-number">#${order.orderNumber}</span>
              <span class="order-status ${statusClass}">${order.status}</span>
            </div>
            <span class="order-date">${order.date ? new Date(order.date).toLocaleDateString() : '—'}</span>
          </div>
          <div class="order-footer">
            <span class="order-total">${order.totalPrice ? '$' + order.totalPrice.toFixed(2) : ''}</span>
            <a href="order_status.html?orderId=${order.orderNumber}" class="order-link">
              View Details <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        `;
        list.appendChild(card);
      });
    }
  })
  .catch(err => {
    console.error("Orders fetch failed:", err);
  });

// ===== PROFILE PICTURE UPLOAD (PRESERVED) =====
const uploadForm = document.getElementById("upload-form");
if (uploadForm) {
  uploadForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const fileInput = document.getElementById("profile-pic-file");
    const file = fileInput.files[0];

    if (!file) {
      showToast("Please select an image.", 'error');
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);

    const status = document.getElementById("upload-status");
    if (status) {
      status.textContent = "Uploading...";
      status.style.color = "var(--arcana-text-light)";
    }

    try {
      const res = await fetch(`${API_BASE}/auth/upload-profile-pic`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const picEl = document.getElementById("user-profile-pic");
      if (picEl) picEl.src = data.url;

      if (status) {
        status.textContent = "Uploaded successfully!";
        status.style.color = "var(--arcana-success)";
      }
      showToast("Profile picture updated!", 'success');
    } catch (err) {
      console.error(err);
      if (status) {
        status.textContent = "Upload failed.";
        status.style.color = "var(--arcana-error)";
      }
      showToast("Upload failed. Please try again.", 'error');
    }
  });
}

// Camera button trigger
const cameraBtn = document.querySelector('.avatar-upload-btn');
if (cameraBtn) {
  cameraBtn.addEventListener('click', () => {
    const fileInput = document.getElementById('profile-pic-file');
    if (fileInput) fileInput.click();
  });
}

// Show filename preview
const fileInput = document.getElementById('profile-pic-file');
if (fileInput) {
  fileInput.addEventListener('change', function() {
    if (this.files[0]) {
      const status = document.getElementById('upload-status');
      if (status) {
        status.textContent = this.files[0].name;
        status.style.color = 'var(--arcana-text-light)';
      }
    }
  });
}

// ===== LOGOUT (PRESERVED) =====
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  showBlockingMessage("You've been logged out.", "account.html");
}

// ===== SIDEBAR NAV ACTIVE STATE =====
document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    }
  });
});

document.getElementById('year').textContent = new Date().getFullYear();