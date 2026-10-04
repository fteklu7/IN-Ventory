// Price & Availability button: opens the pop-up and gets the price from the server
(() => {
  const modalEl = document.getElementById('productModal');
  if (!modalEl) return;

  const modal = new bootstrap.Modal(modalEl);
  const titleEl = document.getElementById('productModalTitle');
  const localNameEl = document.getElementById('productModalLocalName');
  const bodyEl = document.getElementById('productModalBody');
  const cache = new Map();

  // Uses textContent so text from the database can't add HTML to the page
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const showDetails = (d, description) => {
    bodyEl.replaceChildren(
      el('p', 'mb-2', description),
      el('p', 'modal-price mb-0', `Price: ${d.priceFormatted} · ${d.label}`),
    );
    if (d.ageRestricted) {
      bodyEl.append(el('p', 'small text-body-secondary mt-2 mb-0', 'Valid ID required - 21+ only.'));
    }
  };

  const showError = () => {
    bodyEl.replaceChildren(
      el('div', 'alert alert-danger py-2 px-3 mb-0 small', 'Sorry, we could not load this item right now. Please try again.'),
    );
  };

  const openFor = async (card) => {
    const { productId: id, name, localName, description } = card.dataset;

    titleEl.textContent = name;
    localNameEl.textContent = localName;
    bodyEl.replaceChildren(el('div', 'small text-body-secondary', 'Checking the kitchen...'));
    modal.show();

    if (cache.has(id)) {
      showDetails(cache.get(id), description);
      return;
    }

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      cache.set(id, data);
      if (titleEl.textContent === name) showDetails(data, description);
    } catch (err) {
      console.error(err);
      showError();
    }
  };

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.js-details-btn');
    if (btn) openFor(btn.closest('[data-product-id]'));
  });
})();
