document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Quantity controls ---
  const qtyInput = document.querySelector("input[name='qty']");
  const qtyButtons = document.querySelectorAll(".qty-btn");

  qtyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!qtyInput) return;
      const action = btn.dataset.action;
      let value = parseInt(qtyInput.value, 10) || 1;
      const min = parseInt(qtyInput.min || "1", 10);
      const max = parseInt(qtyInput.max || "5", 10);

      if (action === "inc" && value < max) value++;
      if (action === "dec" && value > min) value--;
      qtyInput.value = value.toString();
    });
  });

  // --- Simple client-side cart ---
  const STORAGE_KEY = "thermox_cart";
  const MAX_QTY = 5;
  const ORDERING_ENABLED = false;
  let cart = [];

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      cart = raw ? JSON.parse(raw) : [];
    } catch (err) {
      cart = [];
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function getCartCount() {
    return cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  }

  function updateCartBadge() {
    const badge = document.getElementById("thermox-cart-count");
    if (!badge) return;
    badge.textContent = getCartCount().toString();
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = "tx-toast";
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("visible");
    }, 10);
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 200);
    }, 2000);
  }

  function addToCart(item) {
    if (!ORDERING_ENABLED) {
      showToast("Online ordering is coming soon. Email thermox.service@gmail.com to reserve.");
      return;
    }
    const existing = cart.find((entry) => entry.color === item.color);
    if (existing) {
      existing.qty = Math.min(MAX_QTY, existing.qty + item.qty);
    } else {
      cart.push(item);
    }
    saveCart();
    updateCartBadge();
  }

  function openCartDropdown(anchor) {
    if (!ORDERING_ENABLED) {
      showToast("Online ordering is paused. Cart will go live soon.");
      return;
    }
    // Close any existing dropdown
    const existing = document.querySelector(".tx-cart-dropdown");
    if (existing) {
      existing.remove();
      // If we clicked the same anchor, just close
      if (existing.dataset.forAnchor === anchor.id) {
        return;
      }
    }

    const dropdown = document.createElement("div");
    dropdown.className = "tx-cart-dropdown";
    dropdown.dataset.forAnchor = anchor.id;

    const title = document.createElement("h3");
    title.textContent = "Your Cart";
    dropdown.appendChild(title);

    if (!cart.length) {
      const empty = document.createElement("p");
      empty.textContent = "Your cart is empty.";
      dropdown.appendChild(empty);
    } else {
      const list = document.createElement("ul");
      list.className = "tx-cart-list";

      cart.forEach((item, index) => {
        const li = document.createElement("li");

        const lineText = document.createElement("span");
        lineText.className = "tx-cart-line-text";
        lineText.textContent = `${item.qty} × ThermoX Barrel Cooler – ${item.color}`;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "tx-cart-remove-item";
        removeBtn.setAttribute("aria-label", "Remove item from cart");
        removeBtn.textContent = "×";
        removeBtn.addEventListener("click", () => {
          cart.splice(index, 1);
          saveCart();
          updateCartBadge();
          dropdown.remove();
          openCartDropdown(anchor);
        });

        li.appendChild(lineText);
        li.appendChild(removeBtn);
        list.appendChild(li);
      });

      dropdown.appendChild(list);
    }

    const actions = document.createElement("div");
    actions.className = "tx-cart-actions";

    const checkoutBtn = document.createElement("button");
    checkoutBtn.type = "button";
    checkoutBtn.className = "tx-btn-primary";
    checkoutBtn.textContent = "Proceed to Checkout";
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "checkout.html";
    });

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "tx-btn-ghost";
    clearBtn.textContent = "Clear Cart";
    clearBtn.addEventListener("click", () => {
      cart = [];
      saveCart();
      updateCartBadge();
      dropdown.remove();
      showToast("Cart cleared");
    });

    actions.appendChild(checkoutBtn);
    actions.appendChild(clearBtn);
    dropdown.appendChild(actions);

    // Position dropdown under header container
    const headerInner = document.querySelector(".tx-header .tx-container.tx-header-inner");
    if (headerInner) {
      headerInner.style.position = headerInner.style.position || "relative";
      headerInner.appendChild(dropdown);
    } else {
      document.body.appendChild(dropdown);
    }

    // Close when clicking outside
    document.addEventListener(
      "click",
      (evt) => {
        if (!dropdown.contains(evt.target) && evt.target !== anchor) {
          dropdown.remove();
        }
      },
      { once: true }
    );
  }

  function ensureCartButton() {
    const headerInner = document.querySelector(".tx-header .tx-container.tx-header-inner");
    if (!headerInner || document.getElementById("thermox-cart-btn")) return;

    const cartBtn = document.createElement("button");
    cartBtn.id = "thermox-cart-btn";
    cartBtn.type = "button";
    cartBtn.className = "tx-btn-ghost tx-cart-btn";
    cartBtn.innerHTML = 'Cart&nbsp;<span id="thermox-cart-count">0</span>';
    cartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openCartDropdown(cartBtn);
    });

    const buyNow = headerInner.querySelector(".tx-cta");
    if (buyNow) {
      headerInner.insertBefore(cartBtn, buyNow);
    } else {
      headerInner.appendChild(cartBtn);
    }
  }

  loadCart();
  ensureCartButton();
  updateCartBadge();

  const form = document.getElementById("buy");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!ORDERING_ENABLED) {
        showToast("Ordering is paused. Email thermox.service@gmail.com to get on the deployment list.");
        return;
      }
      const data = new FormData(form);
      const color = (data.get("color") || "Thermal Orange").toString();
      let qty = parseInt((data.get("qty") || "1").toString(), 10);
      if (Number.isNaN(qty) || qty < 1) qty = 1;
      if (qty > MAX_QTY) qty = MAX_QTY;

      addToCart({ color, qty });
      showToast(`Added ${qty} × ThermoX (${color}) to cart`);

      if (qtyInput) qtyInput.value = "1";
    });
  }

  // Hero mode pills interaction
  const modePills = document.querySelectorAll(".tx-mode-pill");
  const modeDescription = document.getElementById("mode-description");

  const modeCopy = {
    range:
      "Range mode: perfect for zeroing days and casual sessions where you don’t want to babysit a hot barrel.",
    match:
      "Match mode: built for back-to-back stages, faster cooldown between strings, and more consistent data.",
    instructor:
      "Instructor mode: ideal for long blocks on the line, keeping demo and student guns at sane temps.",
  };

  if (modePills.length && modeDescription) {
    modePills.forEach((pill) => {
      pill.addEventListener("click", () => {
        modePills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        const mode = pill.dataset.mode || "range";
        modeDescription.textContent = modeCopy[mode] || modeCopy.range;
      });
    });
  }

  // Cooling curves chart: tap/click to view fullscreen
  const chartImg = document.querySelector(".tx-chart-img");
  if (chartImg) {
    chartImg.style.cursor = "zoom-in";
    chartImg.addEventListener("click", () => {
      const overlay = document.createElement("div");
      overlay.className = "tx-lightbox-overlay";

      const fullImg = document.createElement("img");
      fullImg.src = chartImg.currentSrc || chartImg.src;
      fullImg.alt = chartImg.alt || "ThermoX cooling curves chart";

      overlay.appendChild(fullImg);
      document.body.appendChild(overlay);

      const close = () => {
        overlay.removeEventListener("click", close);
        overlay.remove();
      };

      overlay.addEventListener("click", close);
    });
  }
});
