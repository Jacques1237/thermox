(function () {
  const ORDERING_ENABLED = false;
  const STORAGE_KEY = 'thermox_cart';
  const PRICE_PER_UNIT = 800; // R800

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function renderCart() {
    const container = document.getElementById('checkout-cart');
    if (!container) return;

    const cart = loadCart();

    if (!cart.length) {
      container.innerHTML = '<p>Your cart is empty. <a href="index.html#top">Go back to add a ThermoX.</a></p>';
      return;
    }

    let subtotal = 0;

    const list = document.createElement('div');
    list.className = 'tx-checkout-list';

    cart.forEach((item) => {
      const qty = item.qty || 0;
      const lineTotal = qty * PRICE_PER_UNIT;
      subtotal += lineTotal;

      const row = document.createElement('div');
      row.className = 'tx-checkout-row';

      const title = document.createElement('div');
      title.className = 'tx-checkout-title';
      title.textContent = `ThermoX Barrel Cooler`;

      const meta = document.createElement('div');
      meta.className = 'tx-checkout-meta';
      meta.textContent = `Color: ${item.color} · Qty: ${qty}`;

      const price = document.createElement('div');
      price.className = 'tx-checkout-price';
      price.textContent = `R${lineTotal}`;

      row.appendChild(title);
      row.appendChild(meta);
      row.appendChild(price);
      list.appendChild(row);
    });

    const totals = document.createElement('div');
    totals.className = 'tx-checkout-totals';
    totals.innerHTML = `<br><div class="tx-checkout-subtotal"><span>Total: </span><span>R${subtotal}</span></div>`;

    container.innerHTML = '';
    container.appendChild(list);
    container.appendChild(totals);
  }

  function setYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function collectCustomerDetails() {
    return {
      name: (document.getElementById('checkout-name') || {}).value || '',
      email: (document.getElementById('checkout-email') || {}).value || '',
      phone: (document.getElementById('checkout-phone') || {}).value || '',
      address: (document.getElementById('checkout-address') || {}).value || '',
      city: (document.getElementById('checkout-city') || {}).value || '',
      region: (document.getElementById('checkout-region') || {}).value || '',
    };
  }

  function isConsentChecked() {
    var box = document.getElementById('checkout-consent');
    return !!(box && box.checked);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setYear();
    renderCart();

    const payButton = document.getElementById('checkout-pay-btn');
    if (payButton) {
      payButton.addEventListener('click', () => {
        if (!ORDERING_ENABLED) {
          alert('Online ordering is not live yet. This checkout is a demo only. Email thermox.service@gmail.com to request a ThermoX unit.');
          return;
        }

        const cart = loadCart();

        if (!Array.isArray(cart) || cart.length === 0) {
          alert('Your cart is empty. Add ThermoX units before completing your purchase.');
          return;
        }

        if (!isConsentChecked()) {
          alert('Please confirm the demo terms before completing this test order.');
          return;
        }

        const total = cart.reduce(
          (sum, item) => sum + (item.qty || 0) * PRICE_PER_UNIT,
          0
        );

        const customer = collectCustomerDetails();

        const summary = {
          items: cart,
          total,
          timestamp: Date.now(),
          customer,
        };

        try {
          localStorage.setItem('thermoxLastOrder', JSON.stringify(summary));
        } catch (e) {}

        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}

        window.location.href = 'success.html';
      });
    }
  });
})();
