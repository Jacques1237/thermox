(function () {
  function setYear() {
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // Deterministic Order ID based on timestamp
  function generateOrderId(ts) {
    var d = ts ? new Date(ts) : new Date();
    var year = d.getFullYear();
    var base = ts || d.getTime();
    // Simple 4-digit pseudo-hash from timestamp
    var code = Math.abs(Math.floor(base % 10000)).toString().padStart(4, '0');
    return 'THX-' + year + '-' + code;
  }

  // Build a simple military-dossier style HTML invoice for print/PDF
  function buildInvoiceHtml(data, orderId) {
    var created = data.timestamp ? new Date(data.timestamp) : new Date();
    var items = Array.isArray(data.items) ? data.items : [];
    var customer = data.customer || {};

    var rowsHtml = '';
    if (!items.length) {
      rowsHtml = '<tr><td colspan="4" class="empty">(no line items recorded – demo order)</td></tr>';
    } else {
      rowsHtml = items
        .map(function (item, idx) {
          var qty = item.qty || 0;
          var color = item.color || 'N/A';
          var lineTotal = qty * 800;
          return (
            '<tr>' +
            '<td>' + (idx + 1) + '</td>' +
            '<td>ThermoX Barrel Cooler</td>' +
            '<td>' + qty + ' / ' + color + '</td>' +
            '<td>R' + lineTotal + '</td>' +
            '</tr>'
          );
        })
        .join('');
    }

    var customerBlock = '';
    if (customer && (customer.name || customer.address || customer.city)) {
      customerBlock =
        '<div class="customer-block">' +
        '<div class="customer-label">SHIP TO / CONTACT</div>' +
        '<div class="customer-lines">' +
        (customer.name ? '<div>' + customer.name + '</div>' : '') +
        (customer.address ? '<div>' + customer.address + '</div>' : '') +
        (customer.city || customer.region
          ? '<div>' + [customer.city, customer.region].filter(Boolean).join(', ') + '</div>'
          : '') +
        (customer.phone ? '<div>Phone: ' + customer.phone + '</div>' : '') +
        (customer.email ? '<div>Email: ' + customer.email + '</div>' : '') +
        '</div></div>';
    }

    return (
      '<!DOCTYPE html>' +
      '<html lang="en"><head><meta charset="UTF-8" />' +
      '<title>' + orderId + ' // ThermoX Dossier</title>' +
      '<style>' +
      'body{margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#020617;color:#e5e7eb;}' +
      '.shell{min-height:100vh;padding:2.5rem 2rem;background:radial-gradient(circle at 0% 0%,rgba(30,64,175,.18),transparent 55%),radial-gradient(circle at 100% 0%,rgba(153,27,27,.55),transparent 60%),radial-gradient(circle at 0% 100%,rgba(88,28,28,.6),transparent 55%),linear-gradient(135deg,#020617,#000);}' +
      '.frame{max-width:900px;margin:0 auto;border:1px solid rgba(55,65,81,.9);border-radius:12px;background:rgba(15,23,42,.96);box-shadow:0 24px 80px rgba(0,0,0,.9);padding:1.75rem 2rem;}' +
      '.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.75rem;border-bottom:1px solid rgba(55,65,81,.9);padding-bottom:1rem;}' +
      '.logo{font-weight:800;letter-spacing:.18em;text-transform:uppercase;font-size:.9rem;}' +
      '.logo span{color:#f97316;}' +
      '.tag{font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;color:#9ca3af;}' +
      '.badge{display:inline-flex;align-items:center;justify-content:center;padding:.15rem .75rem;border-radius:999px;border:1px solid rgba(34,197,94,.85);background:rgba(22,163,74,.16);color:#bbf7d0;font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;margin-bottom:.4rem;}' +
      '.meta{font-size:.78rem;color:#9ca3af;line-height:1.5;}' +
      'h1{font-size:1.1rem;text-transform:uppercase;letter-spacing:.2em;margin:0 0 .3rem;}' +
      '.order-id{font-size:.78rem;color:#9ca3af;letter-spacing:.16em;text-transform:uppercase;margin-bottom:.2rem;}' +
      'table{width:100%;border-collapse:collapse;margin-top:.75rem;font-size:.85rem;}' +
      'th,td{border-bottom:1px solid rgba(55,65,81,.9);padding:.4rem .4rem;text-align:left;}' +
      'th{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:#9ca3af;background:rgba(15,23,42,.95);}' +
      'td.empty{text-align:center;color:#6b7280;font-style:italic;}' +
      '.customer-block{margin-top:.9rem;padding:.6rem .7rem;border-radius:8px;border:1px dashed rgba(55,65,81,.9);background:rgba(15,23,42,.9);display:flex;gap:.75rem;}' +
      '.customer-label{font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:#9ca3af;min-width:120px;}' +
      '.customer-lines{font-size:.8rem;color:#e5e7eb;}' +
      '.totals{margin-top:1.1rem;display:flex;justify-content:flex-end;font-size:.9rem;}' +
      '.totals span.label{color:#9ca3af;margin-right:.6rem;letter-spacing:.12em;text-transform:uppercase;font-size:.78rem;}' +
      '.totals span.value{font-weight:600;}' +
      '.footer-note{margin-top:1.4rem;font-size:.75rem;color:#6b7280;border-top:1px dashed rgba(55,65,81,.8);padding-top:.7rem;}' +
      '@media print{body{background:#000;} .shell{padding:0;background:#020617;} .frame{box-shadow:none;border-color:#4b5563;}}' +
      '</style></head><body><div class="shell"><div class="frame">' +
      '<div class="header">' +
      '<div>' +
      '<div class="logo">Thermo<span>X</span></div>' +
      '<div class="tag">BARREL COOLING UNIT // AFTER-ACTION DOSSIER</div>' +
      '</div>' +
      '<div class="meta" style="text-align:right;max-width:260px;">' +
      '<div class="badge">CLEARED</div>' +
      '<div class="order-id">' + orderId + '</div>' +
      '<div>Date: ' + created.toLocaleString() + '</div>' +
      '</div>' +
      '</div>' +
      '<h1>THERMOX RANGE DEPLOYMENT</h1>' +
      '<div class="meta">Below is your ThermoX order snapshot. Print or save this page as PDF for your records.</div>' +
      customerBlock +
      '<table><thead><tr><th>Line</th><th>Item</th><th>Qty / Color</th><th>Total</th></tr></thead><tbody>' +
      rowsHtml +
      '</tbody></table>' +
      '<div class="totals"><span class="label">Order Total</span><span class="value">R' + (data.total || 0) + '</span></div>' +
      '<div class="footer-note">This dossier is generated from a demo environment. Connect your live payment gateway and invoicing system to issue tax-compliant invoices and receipts.</div>' +
      '</div></div></body></html>'
    );
  }

  function renderSummary() {
    var container = document.getElementById('order-summary');
    var orderIdEl = document.getElementById('order-id-display');
    if (!container) return;

    var raw = null;
    try {
      raw = localStorage.getItem('thermoxLastOrder');
    } catch (e) {}

    if (!raw) {
      container.innerHTML = '<p>Order data not found. This is a demo confirmation screen—wire it to your payment gateway to see live details.</p>';
      if (orderIdEl) {
        orderIdEl.textContent = 'Order ID: ' + generateOrderId();
      }
      return;
    }

    var data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      container.innerHTML = '<p>Order data is unavailable. This is a demo confirmation screen.</p>';
      if (orderIdEl) {
        orderIdEl.textContent = 'Order ID: ' + generateOrderId();
      }
      return;
    }

    var items = Array.isArray(data.items) ? data.items : [];
    var created = data.timestamp ? new Date(data.timestamp) : null;
    var orderId = generateOrderId(data.timestamp);

    if (orderIdEl) {
      orderIdEl.textContent = 'Order ID: ' + orderId;
    }

    var customer = data.customer || {};
    var customerSummary = '';
    if (customer && (customer.name || customer.city || customer.region)) {
      customerSummary =
        '<div class="tx-checkout-note">Demo order for: ' +
        (customer.name ? customer.name : 'Unnamed shooter') +
        (customer.city || customer.region
          ? ' · ' + [customer.city, customer.region].filter(Boolean).join(', ')
          : '') +
        '</div>';
    }

    // Attach invoice download (opens print-friendly dossier you can save as PDF)
    var downloadBtn = document.getElementById('download-invoice-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        var html = buildInvoiceHtml(data, orderId);
        var w = window.open('', '_blank');
        if (!w) return;
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        try {
          w.print();
        } catch (e) {}
      });
    }

    var wrapper = document.createElement('div');
    wrapper.className = 'tx-checkout-list';

    if (items.length === 0) {
      var emptyRow = document.createElement('div');
      emptyRow.className = 'tx-checkout-row';
      emptyRow.textContent = 'No line items recorded. This is a simulated order.';
      wrapper.appendChild(emptyRow);
    } else {
      items.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'tx-checkout-row';

        var title = document.createElement('div');
        title.className = 'tx-checkout-title';
        title.textContent = 'ThermoX Barrel Cooler';

        var meta = document.createElement('div');
        meta.className = 'tx-checkout-meta';
        meta.textContent = 'Color: ' + (item.color || 'N/A') + ' · Qty: ' + (item.qty || 0);

        var price = document.createElement('div');
        price.className = 'tx-checkout-price';
        price.textContent = 'Line total: R' + (item.qty || 0) * 800;

        row.appendChild(title);
        row.appendChild(meta);
        row.appendChild(price);
        wrapper.appendChild(row);
      });
    }

    var totals = document.createElement('div');
    totals.className = 'tx-checkout-totals';
    totals.innerHTML = '<div class="tx-checkout-subtotal"><span>Order Total:</span><span>R' + (data.total || 0) + '</span></div>' +
      (created ? '<p class="tx-checkout-meta">Timestamp: ' + created.toLocaleString() + '</p>' : '');

    container.innerHTML = '';
    if (customerSummary) {
      container.insertAdjacentHTML('beforeend', customerSummary);
    }
    container.appendChild(wrapper);
    container.appendChild(totals);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setYear();
    renderSummary();
  });
})();
