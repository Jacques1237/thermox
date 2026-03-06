(function () {
  const ORDERING_ENABLED = true;
  const STORAGE_KEY = 'thermox_cart';
  const PRICE_PER_UNIT = 800; // R800
  const DEFAULT_PAYMENT_LINK = 'https://ikwebstore.co.za/triforma';
  // Paste your dedicated iKhokha links per color/qty here. Empty values fall back to DEFAULT_PAYMENT_LINK.
  const PAYMENT_LINKS_BY_VARIANT = {
    orange: {
      1: '',
      2: '',
      3: '',
      4: '',
      5: '',
    },
    red: {
      1: '',
      2: '',
      3: '',
      4: '',
      5: '',
    },
  };

  function buildPaymentUrl(baseLink, params) {
    const url = new URL(baseLink);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
    return url.toString();
  }

  function getReturnUrls() {
    const successUrl = `${window.location.origin}/success.html`;
    const cancelUrl = `${window.location.origin}/checkout.html`;
    return { successUrl, cancelUrl };
  }

  function getColorKey(color) {
    const normalized = (color || '').toString().toLowerCase();
    if (normalized.includes('orange')) return 'orange';
    if (normalized.includes('red')) return 'red';
    return 'other';
  }

  function getVariantPaymentLink(colorKey, qty) {
    const byQty = PAYMENT_LINKS_BY_VARIANT[colorKey];
    if (!byQty) return '';
    const candidate = byQty[qty];
    return typeof candidate === 'string' ? candidate.trim() : '';
  }

  function getSingleColorCartInfo(cart) {
    let detectedColorKey = '';
    let totalQty = 0;

    for (const item of cart) {
      const qty = Math.max(0, parseInt(item.qty, 10) || 0);
      if (qty === 0) continue;

      totalQty += qty;
      const colorKey = getColorKey(item.color);

      if (colorKey === 'other') return null;
      if (!detectedColorKey) detectedColorKey = colorKey;
      if (detectedColorKey !== colorKey) return null;
    }

    if (!detectedColorKey || totalQty < 1) return null;
    return { colorKey: detectedColorKey, qty: totalQty };
  }

  function getColorBreakdown(cart) {
    return cart.reduce(
      (acc, item) => {
        const color = (item.color || '').toString().toLowerCase();
        const qty = Math.max(0, parseInt(item.qty, 10) || 0);

        if (color.includes('orange')) acc.orange += qty;
        else if (color.includes('red')) acc.red += qty;
        else acc.other += qty;

        return acc;
      },
      { orange: 0, red: 0, other: 0 }
    );
  }

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
          alert('Online ordering is currently unavailable. Please try again later.');
          return;
        }

        const cart = loadCart();

        if (!Array.isArray(cart) || cart.length === 0) {
          alert('Your cart is empty. Add ThermoX units before completing your purchase.');
          return;
        }

        if (!isConsentChecked()) {
          alert('Please confirm your order details before continuing to payment.');
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

        const breakdown = getColorBreakdown(cart);

        const singleColorOrder = getSingleColorCartInfo(cart);
        let selectedBaseLink = DEFAULT_PAYMENT_LINK;

        if (singleColorOrder && singleColorOrder.qty <= 5) {
          const variantLink = getVariantPaymentLink(singleColorOrder.colorKey, singleColorOrder.qty);
          if (variantLink) {
            selectedBaseLink = variantLink;
          }
        }

        const { successUrl, cancelUrl } = getReturnUrls();

        const paymentUrl = buildPaymentUrl(selectedBaseLink, {
          item: 'ThermoX Barrel Cooler',
          qty: cart.reduce((sum, item) => sum + (parseInt(item.qty, 10) || 0), 0),
          orange_qty: breakdown.orange,
          red_qty: breakdown.red,
          other_qty: breakdown.other,
          notes: `Order total ZAR ${total}`,
          success_url: successUrl,
          cancel_url: cancelUrl,
          return_url: successUrl,
        });

        window.location.href = paymentUrl;
      });
    }
  });
})();
