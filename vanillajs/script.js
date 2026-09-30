// Cart data
let cart = JSON.parse(localStorage.getItem('wicyraCart')) || [];
const WA_NUMBER = '62895386859978';

// DOM Elements
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartBody = document.getElementById('cartBody');
const cartFooter = document.getElementById('cartFooter');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const btnCheckout = document.getElementById('btnCheckout');

// Format currency
function formatRupiah(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

// Update cart count badge
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Calculate total
function calculateTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// Render cart items
function renderCart() {
    if (cart.length === 0) {
        // Tampilkan teks dan ikon saat keranjang kosong
        if (cartBody) {
            cartBody.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛒</div>
                    <p>Keranjang masih kosong</p>
                </div>
            `;
        }
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }

    if (cartFooter) cartFooter.style.display = 'block';

    if (cartBody) {
        cartBody.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">${formatRupiah(item.price)}</p>
                    <div class="cart-item-qty">
                        <button class="qty-btn" data-action="decrease" aria-label="Kurangi jumlah">−</button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="qty-btn" data-action="increase" aria-label="Tambah jumlah">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-action="remove" aria-label="Hapus ${item.name}">✕</button>
            </div>
        `).join('');
    }

    if (cartTotal) cartTotal.textContent = formatRupiah(calculateTotal());
}

// Add to cart
function addToCart(id, name, price, img) {
    const existing = cart.find(item => item.id == id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id, name, price, img, qty: 1 });
    }
    saveCart();
    openCart();
}

// Update quantity
function updateQty(id, action) {
    const item = cart.find(i => i.id == id);
    if (!item) return;

    if (action === 'increase') {
        item.qty += 1;
    } else if (action === 'decrease') {
        item.qty -= 1;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id != id);
        }
    }
    saveCart();
}

// Remove item
function removeItem(id) {
    cart = cart.filter(i => i.id != id);
    saveCart();
}

// Save to localStorage & update UI
function saveCart() {
    localStorage.setItem('wicyraCart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Open/Close cart
function openCart() {
    if (cartSidebar) cartSidebar.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// Generate WhatsApp message
function generateWAMessage() {
    if (cart.length === 0) return '';
    
    let message = 'Halo Wicyra Cookies, saya ingin memesan:\n\n';
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} x${item.qty} = ${formatRupiah(item.price * item.qty)}\n`;
    });
    message += `\nTotal: ${formatRupiah(calculateTotal())}\n\n`;
    message += 'Mohon konfirmasi pesanan saya. Terima kasih!';
    
    return encodeURIComponent(message);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();

    // Add to cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { id, name, price, img } = e.currentTarget.dataset;
            addToCart(id, name, parseInt(price), img);
        });
    });

    // Cart button
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Cart item actions (event delegation)
    if (cartBody) {
        cartBody.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const cartItem = btn.closest('.cart-item');
            if (!cartItem) return;

            const id = cartItem.dataset.id;
            const action = btn.dataset.action;

            if (action === 'increase' || action === 'decrease') {
                updateQty(id, action);
            } else if (action === 'remove') {
                removeItem(id);
            }
        });
    }

    // Checkout button
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            if (cart.length === 0) return;
            const message = generateWAMessage();
            window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartSidebar && cartSidebar.classList.contains('open')) {
            closeCart();
        }
    });
});