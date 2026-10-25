(() => {
  'use strict';

  const DEMO_USER = 'admin';
  const DEMO_PASSWORD = 'cascarudo2026';
  const PRODUCTS_KEY = 'cascarudo-products-v1';
  const CART_KEY = 'cascarudo-cart-v1';
  const AUTH_KEY = 'cascarudo-admin-session';
  const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  const initialProducts = [
    { id: 'p1', name: 'Caña Cascarudo Carbon 2,10 m', category: 'Pesca', price: 68900, description: 'Liviana, resistente y lista para tu próxima jornada.', emoji: '🎣', badge: 'Más elegido' },
    { id: 'p2', name: 'Reel frontal Ocean 4000', category: 'Pesca', price: 52400, description: 'Reel suave y confiable para pesca variada.', emoji: '🌀', badge: '' },
    { id: 'p3', name: 'Señuelo Minnow 11 cm', category: 'Pesca', price: 8900, description: 'Acción realista para tentar a los depredadores.', emoji: '🐟', badge: 'Nuevo' },
    { id: 'p4', name: 'Carpa Andes para 4 personas', category: 'Camping', price: 154900, description: 'Amplia, liviana y pensada para escapadas largas.', emoji: '⛺', badge: 'Favorito' },
    { id: 'p5', name: 'Linterna recargable 800 lm', category: 'Camping', price: 28700, description: 'Luz potente con batería recargable por USB.', emoji: '🔦', badge: '' },
    { id: 'p6', name: 'Bolsa de dormir Sur -5 °C', category: 'Camping', price: 74800, description: 'Abrigo cómodo para noches frescas al aire libre.', emoji: '🛌', badge: '' },
    { id: 'p7', name: 'Campera impermeable Delta', category: 'Indumentaria', price: 98400, description: 'Protección liviana contra viento y lluvia.', emoji: '🧥', badge: 'Temporada' },
    { id: 'p8', name: 'Bota trekking Travesía', category: 'Indumentaria', price: 112900, description: 'Buen agarre y comodidad para caminar todo el día.', emoji: '🥾', badge: '' },
    { id: 'p9', name: 'Mochila Outdoor 35 L', category: 'Outdoor', price: 86700, description: 'Compartimentos prácticos para salir a explorar.', emoji: '🎒', badge: 'Nuevo' },
    { id: 'p10', name: 'Termo acero 1 litro', category: 'Outdoor', price: 32400, description: 'Aislación térmica para compartir unos mates afuera.', emoji: '♨️', badge: '' },
    { id: 'p11', name: 'Navaja multiuso Explorer', category: 'Outdoor', price: 19600, description: 'Una herramienta compacta para tener siempre a mano.', emoji: '🗡️', badge: '' },
    { id: 'p12', name: 'Sombrero de pesca UV', category: 'Indumentaria', price: 15900, description: 'Visera amplia y tela ligera para el sol.', emoji: '🧢', badge: '' }
  ];

  const DEFAULT_PRODUCT_IMAGES = {
    p1: 'fotos/producto-cana.jpg',
    p2: 'fotos/reel.webp',
    p3: 'fotos/producto-senuelo.jpg',
    p4: 'fotos/category-camping.jpg',
    p5: 'fotos/producto-linterna.jpg',
    p6: 'fotos/producto-bolsa-dormir.jpg',
    p7: 'fotos/category-indumentaria.jpg',
    p8: 'fotos/producto-botas.jpg',
    p9: 'fotos/category-outdoor.jpg',
    p10: 'fotos/termo.webp',
    p11: 'fotos/navaja.webp',
    p12: 'fotos/producto-sombrero.jpg'
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const readJSON = (key, fallback) => {
    try { const parsed = JSON.parse(localStorage.getItem(key)); return parsed ?? fallback; }
    catch { return fallback; }
  };
  let products = readJSON(PRODUCTS_KEY, initialProducts);
  let cart = readJSON(CART_KEY, []);
  let activeCategory = 'Todos';
  let searchTerm = '';
  let toastTimer;

  function saveProducts() { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }
  function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  function safeText(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  function toast(message) {
    const node = $('#toast');
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('show'), 2400);
  }
  function filteredProducts() {
    let result = products.filter(product => (activeCategory === 'Todos' || product.category === activeCategory) && `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(searchTerm));
    const sort = $('#sort-select').value;
    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return result;
  }
  function renderProducts() {
    const grid = $('#product-grid');
    const result = filteredProducts();
    grid.innerHTML = result.map(product => {
      const image = product.image || DEFAULT_PRODUCT_IMAGES[product.id] || '';
      return `
      <article class="product-card">
        <div class="product-visual${image ? ' product-has-image' : ''}">
          ${product.badge ? `<span class="product-badge">${safeText(product.badge)}</span>` : ''}
          ${image ? `<img src="${safeText(image)}" alt="${safeText(product.name)}" loading="lazy" onerror="this.remove();this.parentElement.classList.remove('product-has-image')">` : ''}
          <span class="product-emoji" aria-hidden="true">${safeText(product.emoji || '🎣')}</span>
          <button class="quick-add" data-add="${safeText(product.id)}" aria-label="Agregar ${safeText(product.name)} al carrito">+</button>
        </div>
        <div class="product-meta"><span class="product-category">${safeText(product.category)}</span><h3>${safeText(product.name)}</h3><p class="product-description">${safeText(product.description || '')}</p><div class="price-line"><span class="product-price">${money.format(Number(product.price) || 0)}</span></div></div>
      </article>`;
    }).join('');
    $('#empty-state').hidden = result.length > 0;
  }
  function setCategory(category) {
    activeCategory = category;
    $$('.filter-chip').forEach(button => button.classList.toggle('active', button.dataset.category === category));
    renderProducts();
  }
  function openCart() {
    $('#cart-drawer').classList.add('open');
    $('#cart-drawer').setAttribute('aria-hidden', 'false');
    $('#overlay').hidden = false;
    document.body.classList.add('no-scroll');
    renderCart();
  }
  function closeCart() {
    $('#cart-drawer').classList.remove('open');
    $('#cart-drawer').setAttribute('aria-hidden', 'true');
    if (!$('#admin-modal').classList.contains('open')) $('#overlay').hidden = true;
    document.body.classList.remove('no-scroll');
  }
  function addToCart(id) {
    const item = cart.find(row => row.id === id);
    if (item) item.quantity += 1;
    else cart.push({ id, quantity: 1 });
    saveCart(); renderCart(); toast('Agregado al carrito');
  }
  function changeQuantity(id, amount) {
    const item = cart.find(row => row.id === id);
    if (!item) return;
    item.quantity += amount;
    if (item.quantity <= 0) cart = cart.filter(row => row.id !== id);
    saveCart(); renderCart();
  }
  function renderCart() {
    cart = cart.filter(item => products.some(product => product.id === item.id));
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#cart-count').textContent = count;
    const rows = cart.map(item => ({ ...item, product: products.find(product => product.id === item.id) }));
    const total = rows.reduce((sum, row) => sum + Number(row.product.price || 0) * row.quantity, 0);
    $('#cart-empty').hidden = rows.length > 0;
    $('#cart-summary').hidden = rows.length === 0;
    $('#cart-items').innerHTML = rows.map(({ id, quantity, product }) => `
      <div class="cart-item"><div class="cart-item-icon">${safeText(product.emoji || '🎣')}</div><div><h3>${safeText(product.name)}</h3><small>${money.format(Number(product.price) || 0)} c/u</small><div class="quantity-control"><button data-qty="-1" data-id="${safeText(id)}" aria-label="Quitar una unidad">−</button><span>${quantity}</span><button data-qty="1" data-id="${safeText(id)}" aria-label="Agregar una unidad">+</button></div></div><span class="cart-item-price">${money.format((Number(product.price) || 0) * quantity)}</span></div>`).join('');
    $('#cart-total').textContent = money.format(total);
    saveCart();
  }

  function openAdmin() {
    $('#admin-modal').classList.add('open');
    $('#admin-modal').setAttribute('aria-hidden', 'false');
    $('#overlay').hidden = false;
    document.body.classList.add('no-scroll');
    if (sessionStorage.getItem(AUTH_KEY) === 'true') showAdmin();
    else { $('#admin-login').hidden = false; $('#admin-content').hidden = true; $('#admin-user').focus(); }
  }
  function closeAdmin() {
    $('#admin-modal').classList.remove('open');
    $('#admin-modal').setAttribute('aria-hidden', 'true');
    if (!$('#cart-drawer').classList.contains('open')) $('#overlay').hidden = true;
    document.body.classList.remove('no-scroll');
  }
  function showAdmin() {
    $('#admin-login').hidden = true;
    $('#admin-content').hidden = false;
    renderAdminList();
  }
  function renderAdminList() {
    $('#admin-count').textContent = `${products.length} producto${products.length === 1 ? '' : 's'} en el catálogo`;
    const categories = ['Pesca', 'Camping', 'Indumentaria', 'Outdoor'];
    $('#admin-list').innerHTML = categories.map(category => {
      const group = products.filter(product => product.category === category);
      const rows = group.length ? group.map(product => `
        <div class="admin-row"><span class="admin-row-emoji">${safeText(product.emoji || '🎣')}</span><span><b>${safeText(product.name)}</b><small>${money.format(Number(product.price) || 0)}</small></span><span class="admin-row-actions"><button data-edit="${safeText(product.id)}">Editar</button><button class="delete-product" data-delete="${safeText(product.id)}">Eliminar</button></span></div>`).join('') : '<p class="admin-category-empty">Todavía no hay productos en esta categoría.</p>';
      return `<section class="admin-category-group"><h3 class="admin-category-heading"><span>${safeText(category)}</span><small>${group.length} producto${group.length === 1 ? '' : 's'}</small></h3><div class="admin-category-items">${rows}</div></section>`;
    }).join('');
  }
  function resetProductForm() { $('#product-form').reset(); $('#product-id').value = ''; $('#product-form').hidden = true; $('#product-form-title').textContent = 'Nuevo producto'; }
  function startEdit(id) {
    const product = products.find(row => row.id === id);
    if (!product) return;
    $('#product-form').hidden = false;
    $('#product-form-title').textContent = 'Editar producto';
    $('#product-id').value = product.id;
    $('#product-name').value = product.name;
    $('#product-category').value = product.category;
    $('#product-price').value = product.price;
    $('#product-image').value = product.image || '';
    $('#product-description').value = product.description || '';
    $('#product-name').focus();
  }
  function checkout() {
    const rows = cart.map(item => {
      const product = products.find(row => row.id === item.id);
      return product ? `${item.quantity} × ${product.name} (${money.format(product.price * item.quantity)})` : '';
    }).filter(Boolean);
    const total = cart.reduce((sum, item) => {
      const product = products.find(row => row.id === item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    const text = `Hola, quiero consultar por este pedido:\n${rows.join('\n')}\nTotal: ${money.format(total)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  $('#product-grid').addEventListener('click', event => { const button = event.target.closest('[data-add]'); if (button) addToCart(button.dataset.add); });
  $('#filter-row').addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (button) setCategory(button.dataset.category); });
  $('#category-nav').addEventListener('click', event => { const link = event.target.closest('[data-category]'); if (!link) return; event.preventDefault(); setCategory(link.dataset.category); $('#catalogo').scrollIntoView({ behavior: 'smooth' }); $('#menu-toggle').setAttribute('aria-expanded', 'false'); $('#category-nav').classList.remove('mobile-open'); });
  $$('.category-card').forEach(button => button.addEventListener('click', () => { setCategory(button.dataset.category); $('#catalogo').scrollIntoView({ behavior: 'smooth' }); }));
  $$('.footer-main [data-category]').forEach(link => link.addEventListener('click', () => setCategory(link.dataset.category)));
  $('#search-input').addEventListener('input', event => { searchTerm = event.target.value.trim().toLowerCase(); renderProducts(); });
  $('#search-form').addEventListener('submit', event => { event.preventDefault(); $('#catalogo').scrollIntoView({ behavior: 'smooth' }); });
  $('#sort-select').addEventListener('change', renderProducts);
  $('#cart-open').addEventListener('click', openCart);
  $('#cart-items').addEventListener('click', event => { const button = event.target.closest('[data-qty]'); if (button) changeQuantity(button.dataset.id, Number(button.dataset.qty)); });
  $('#overlay').addEventListener('click', () => { closeCart(); closeAdmin(); });
  $$('[data-close-drawer]').forEach(button => button.addEventListener('click', closeCart));
  $('#checkout-button').addEventListener('click', checkout);
  $('#admin-open').addEventListener('click', openAdmin);
  $('#footer-admin').addEventListener('click', openAdmin);
  $('#admin-close').addEventListener('click', closeAdmin);
  $('#login-form').addEventListener('submit', event => {
    event.preventDefault();
    if ($('#admin-user').value.trim() === DEMO_USER && $('#admin-password').value === DEMO_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true'); $('#login-error').textContent = ''; showAdmin();
    } else $('#login-error').textContent = 'El usuario o la contraseña no coinciden.';
  });
  $('#new-product').addEventListener('click', () => { resetProductForm(); $('#product-form').hidden = false; $('#product-name').focus(); });
  $('#cancel-product').addEventListener('click', resetProductForm);
  $('#product-form').addEventListener('submit', event => {
    event.preventDefault();
    const id = $('#product-id').value;
    const previous = products.find(product => product.id === id);
    const record = { id: id || `p${Date.now()}`, name: $('#product-name').value.trim(), category: $('#product-category').value, price: Number($('#product-price').value), image: $('#product-image').value.trim(), description: $('#product-description').value.trim(), emoji: previous?.emoji || '🎣', badge: previous?.badge || '' };
    if (id) products = products.map(product => product.id === id ? record : product);
    else products.unshift(record);
    saveProducts(); resetProductForm(); renderProducts(); renderAdminList(); renderCart(); toast(id ? 'Producto actualizado' : 'Producto agregado');
  });
  $('#admin-list').addEventListener('click', event => {
    const edit = event.target.closest('[data-edit]');
    const remove = event.target.closest('[data-delete]');
    if (edit) startEdit(edit.dataset.edit);
    if (remove) {
      const product = products.find(row => row.id === remove.dataset.delete);
      if (!product || !window.confirm(`¿Eliminar “${product.name}” del catálogo?`)) return;
      products = products.filter(row => row.id !== product.id); cart = cart.filter(row => row.id !== product.id); saveProducts(); saveCart(); renderProducts(); renderAdminList(); renderCart(); toast('Producto eliminado');
    }
  });
  $('#logout-button').addEventListener('click', () => { sessionStorage.removeItem(AUTH_KEY); $('#admin-login').hidden = false; $('#admin-content').hidden = true; $('#admin-password').value = ''; toast('Sesión cerrada'); });
  $('#menu-toggle').addEventListener('click', event => {
    const open = $('#category-nav').classList.toggle('mobile-open');
    event.currentTarget.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeCart(); closeAdmin(); $('#category-nav').classList.remove('mobile-open'); } });
  $('#year').textContent = new Date().getFullYear();
  renderProducts(); renderCart();
})();
