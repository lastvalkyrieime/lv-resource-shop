
// LV Resource Shop - Frontend for GitHub Pages
// IMPORTANT: replace APPSCRIPT_URL with your deployed Apps Script Web App URL
const APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbxMSR6jiXTWkP6mlgAzL1Ry-WySEgUYu3jhkIM1d_LTBQNnViR_IpWPD6PcpRK4_fH5/exec";

// state
let products = [];
let cart = JSON.parse(localStorage.getItem('lv_cart') || '[]');
const ADMIN_ID = 'admin';
const ADMIN_PASS = 'lvime2025';
let isAdmin = false;

// dom
const ids = id => document.getElementById(id);
const formatMoney = n => 'Rp ' + Number(n).toLocaleString('id-ID');

// init
document.addEventListener('DOMContentLoaded', () => {
  bindNav();
  ids('shop-view').classList.remove('hidden');
  ids('cart-view').classList.add('hidden');
  ids('admin-view').classList.add('hidden');
  fetchProducts();
  renderCart();
  ids('search').addEventListener('input', onSearch);
  ids('filter-category').addEventListener('change', onFilter);
  ids('p-add').addEventListener('click', onAddProduct);
  ids('admin-login').addEventListener('click', onAdminLogin);
  ids('admin-logout').addEventListener('click', onAdminLogout);
  ids('checkout').addEventListener('click', onCheckout);
  ids('clear-cart').addEventListener('click', onClearCart);
});

// NAV
function bindNav(){
  ids('nav-shop').addEventListener('click', ()=>{ show('shop'); });
  ids('nav-admin').addEventListener('click', ()=>{ show('admin'); });
  ids('nav-cart').addEventListener('click', ()=>{ show('cart'); });
}
function show(name){
  ids('shop-view').classList.toggle('hidden', name!=='shop');
  ids('admin-view').classList.toggle('hidden', name!=='admin');
  ids('cart-view').classList.toggle('hidden', name!=='cart');
}

// API helpers
async function apiGet(action, params=''){
  const url = APPSCRIPT_URL + '?action=' + encodeURIComponent(action) + (params? '&'+params : '');
  const res = await fetch(url);
  return res.json();
}
async function apiPost(action, body){
  // include action as query param to be compatible with Apps Script router
  const url = APPSCRIPT_URL + '?action=' + encodeURIComponent(action);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  return res.json();
}

// PRODUCTS
async function fetchProducts(){
  try{
    const res = await apiGet('getProducts');
    if(res.success){
      products = res.products;
      renderProducts(products);
      renderAdminProducts(products);
    } else {
      ids('products').innerText = 'Gagal ambil produk';
    }
  }catch(err){
    ids('products').innerText = 'Kesalahan jaringan: ' + err;
  }
}

function renderProducts(list){
  const el = ids('products');
  if(!list || !list.length){ el.innerHTML = '<div class="muted">Tidak ada produk</div>'; return }
  el.innerHTML = '';
  list.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <div class="meta">
        <div class="name">${p.nama}</div>
        <div class="desc muted">${p.kategori} • ${p.deskripsi}</div>
      </div>
      <div class="right">
        <div class="muted small">${formatMoney(p.harga)} • Stok: ${p.stok}</div>
        <div style="margin-top:8px">
          <input type="number" id="q-${p.id}" min="1" value="1" />
          <button data-id="${p.id}" class="add-btn">Tambah</button>
        </div>
      </div>
    `;
    el.appendChild(div);
  });
  document.querySelectorAll('.add-btn').forEach(b=>b.addEventListener('click', onAddToCart));
}

function onSearch(){ const q = ids('search').value.toLowerCase(); renderProducts(products.filter(p=>p.nama.toLowerCase().includes(q) || (p.deskripsi||'').toLowerCase().includes(q))); }
function onFilter(){ const v = ids('filter-category').value; renderProducts(v?products.filter(p=>p.kategori===v):products); }

// CART
function saveCart(){ localStorage.setItem('lv_cart', JSON.stringify(cart)); renderCart(); updateCartCount(); }
function updateCartCount(){ ids('cart-count').innerText = cart.reduce((s,c)=>s+c.qty,0); }

function onAddToCart(e){
  const id = e.currentTarget.dataset.id;
  const qty = Number(ids('q-'+id).value || 1);
  const p = products.find(x=>String(x.id)===String(id));
  if(!p) return alert('Produk tidak ditemukan');
  const existing = cart.find(c=>String(c.id)===String(id));
  if(existing) existing.qty += qty; else cart.push({id:p.id,nama:p.nama,harga: Number(p.harga),qty});
  saveCart();
  alert('Produk ditambahkan ke keranjang');
}

function renderCart(){
  const el = ids('cart-items');
  if(!cart.length){ el.innerHTML = '<div class="muted">Keranjang kosong</div>'; updateCartCount(); return; }
  el.innerHTML = '';
  let total = 0;
  cart.forEach((c, i)=>{
    const div = document.createElement('div');
    div.className = 'cart-item';
    const subtotal = c.harga * c.qty;
    total += subtotal;
    div.innerHTML = `<div>${c.nama} x${c.qty}</div><div>${formatMoney(subtotal)} <button data-i="${i}" class="remove-cart">x</button></div>`;
    el.appendChild(div);
  });
  const tdiv = document.createElement('div'); tdiv.style.marginTop='10px'; tdiv.innerHTML = `<strong>Total: ${formatMoney(total)}</strong>`;
  el.appendChild(tdiv);
  document.querySelectorAll('.remove-cart').forEach(b=>b.addEventListener('click', e=>{ cart.splice(Number(e.currentTarget.dataset.i),1); saveCart(); }));
  updateCartCount();
}

function onClearCart(){ if(confirm('Kosongkan keranjang?')){ cart = []; saveCart(); } }

// ADMIN (simple client-side auth)
function onAdminLogin(){
  const id = ids('admin-id').value.trim();
  const pass = ids('admin-pass').value;
  if(id===ADMIN_ID && pass===ADMIN_PASS){
    isAdmin = true;
    ids('admin-login-panel').classList.add('hidden');
    ids('admin-panel').classList.remove('hidden');
    renderAdminProducts(products);
    alert('Login admin berhasil');
  } else alert('Creds salah');
}
function onAdminLogout(){
  isAdmin=false;
  ids('admin-login-panel').classList.remove('hidden');
  ids('admin-panel').classList.add('hidden');
}

// ADMIN actions
async function onAddProduct(){
  if(!isAdmin) return alert('Login sebagai admin terlebih dahulu');
  const nama = ids('p-nama').value.trim();
  const kategori = ids('p-kategori').value;
  const harga = Number(ids('p-harga').value||0);
  const stok = Number(ids('p-stok').value||0);
  const deskripsi = ids('p-desc').value||'';
  if(!nama) return alert('Nama dibutuhkan');
  const res = await apiPost('addProduct', { nama, kategori, harga, stok, deskripsi });
  if(res && res.success){ alert('Produk ditambahkan'); ids('p-nama').value=''; ids('p-harga').value=''; ids('p-stok').value=''; ids('p-desc').value=''; fetchProducts(); }
  else alert('Gagal menambah produk');
}
async function onUpdateStock(id){
  if(!isAdmin) return alert('Login admin');
  const input = ids('s-'+id);
  const stok = Number(input.value || 0);
  const res = await apiPost('updateStock', { id, stok });
  if(res && res.success){ alert('Stok diperbarui'); fetchProducts(); } else alert('Gagal');
}
async function onDeleteProduct(id){
  if(!isAdmin) return alert('Login admin');
  if(!confirm('Hapus produk?')) return;
  const res = await apiPost('deleteProduct', { id });
  if(res && res.success){ alert('Dihapus'); fetchProducts(); } else alert('Gagal');
}

function renderAdminProducts(list){
  const el = ids('admin-products');
  if(!isAdmin) { el.innerHTML = '<div class="muted">Silakan login admin untuk mengelola produk</div>'; return; }
  if(!list || !list.length){ el.innerHTML = '<div class="muted">Belum ada produk</div>'; return; }
  el.innerHTML = '';
  list.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <div class="meta"><div class="name">${p.nama}</div><div class="desc muted">${p.kategori} • ${p.deskripsi}</div></div>
      <div class="right">
        <div class="muted small">${formatMoney(p.harga)}</div>
        <div style="margin-top:8px">
          Stok: <input type="number" id="s-${p.id}" value="${p.stok}" style="width:80px;padding:6px;border-radius:6px;background:#071127;border:1px solid #123046;color:#e6eef8" />
          <button onclick="onUpdateStock('${p.id}')">Simpan</button>
          <button onclick="onDeleteProduct('${p.id}')">Hapus</button>
        </div>
      </div>
    `;
    el.appendChild(div);
  });
}

// CHECKOUT
async function onCheckout(){
  if(!cart.length) return alert('Keranjang kosong');
  const buyer = ids('buyer-name').value.trim();
  const note = ids('buyer-desc').value || '';
  if(!buyer) return alert('Masukkan nama pembeli');
  const items = cart.map(c=>({ nama: c.nama, qty: c.qty, total: c.harga * c.qty }));
  const total = items.reduce((s,i)=>s+i.total,0);
  const payload = { nama: buyer, deskripsi: note, items, total };
  const res = await apiPost('checkout', payload);
  if(res && res.success){ alert('Checkout berhasil, order dikirim ke Discord'); cart=[]; saveCart(); ids('buyer-name').value=''; ids('buyer-desc').value=''; }
  else alert('Checkout gagal');
}

// wire add product button to function (defined earlier)
function onAddProductEvent(e){ e.preventDefault(); onAddProduct(); }
// ensure global for inline onclick calls
window.onUpdateStock = onUpdateStock;
window.onDeleteProduct = onDeleteProduct;
