const socket = io('http://localhost:3001');
let products = [];
let editingId = null;

const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');
const enableBtn = document.getElementById('enable-push');
const disableBtn = document.getElementById('disable-push');
const VAPID_PUBLIC_KEY = 'BPlv95NfVupqg6SLmbUhZ10wI_Sl9vLIjESmwAEZIGgqVF8eCZA39aJjX9zEzKXqeFjDnn9vF_3Ohbmjbg58z8A';

function loadHome() {
    contentDiv.innerHTML = `
        <div class="toolbar"><h2>Наш кофе</h2><button id="addBtn" class="btn">+ Добавить кофе</button></div>
        <div id="products-container" class="products-grid"><div class="loading">Загрузка...</div></div>
    `;
    loadProducts();
    document.getElementById('addBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModal')?.addEventListener('click', () => document.getElementById('modal').classList.remove('show'));
    document.getElementById('productForm')?.addEventListener('submit', saveProduct);
    window.onclick = (e) => { if (e.target === document.getElementById('modal')) document.getElementById('modal').classList.remove('show'); };
}

function loadAbout() {
    contentDiv.innerHTML = `
        <div class="about-content">
            <h2>О приложении</h2>
            <p>Версия 2.0.0</p>
            <p>Кофейная лавка - магазин кофе с офлайн-доступом и уведомлениями.</p>
            <ul><li>12 сортов кофе</li><li>Добавление/редактирование/удаление</li><li>Офлайн-режим</li><li>Push-уведомления</li></ul>
            <p>Год создания: 2026</p>
        </div>
    `;
}

function loadProducts() {
    const saved = localStorage.getItem('coffee_products');
    if (saved) {
        products = JSON.parse(saved);
    } else {
        products = [
            { id: '1', name: 'Бразилия Суль-де-Минас', category: 'Бразилия', price: 750, description: 'Сладкий кофе с нотами арахиса, пудры какао и цедры лимона', stock: 850 },
            { id: '2', name: 'Коста-Рика Сан-Хосе', category: 'Коста-Рика', price: 825, description: 'Сладкий кофе с нотами грейпфрута, фундука и тёмного шоколада', stock: 720 },
            { id: '3', name: 'Индонезия Суматра Гайо', category: 'Индонезия', price: 900, description: 'Яркий кофе со вкусом шиповника, мандарина и листа смородины', stock: 640 },
            { id: '4', name: 'Эфиопия Иргачефф', category: 'Эфиопия', price: 730, description: 'Сладкий кофе с нотами тёмных ягод, цитрусов и молочного шоколада', stock: 1100 },
            { id: '5', name: 'Эфиопия Оромия', category: 'Эфиопия', price: 800, description: 'Лёгкий кофе с нотами персика, цедры лимона и молочного шоколада', stock: 950 },
            { id: '6', name: 'Колумбия Богота', category: 'Колумбия', price: 750, description: 'Сочный кофе с нотами тёмного винограда, красного яблока и тёмного шоколада', stock: 780 },
            { id: '7', name: 'Перу Альто Пириас', category: 'Перу', price: 850, description: 'Яркий кофе с нотами апельсина, персика, тёмного винограда и белого вина', stock: 690 },
            { id: '8', name: 'Боливия Каранави', category: 'Боливия', price: 1150, description: 'Сладкий кофе с нотами голубики, апельсина, миндаля и тёмного шоколада', stock: 520 },
            { id: '9', name: 'Бразилия Трес-Понтас', category: 'Бразилия', price: 830, description: 'Сладкий кофе с нотами красного апельсина, тёмных ягод, фундука и молочного шоколада', stock: 880 },
            { id: '10', name: 'Бразилия Серрадо', category: 'Бразилия', price: 660, description: 'Плотный кофе с нотами жареных орехов, шоколада и карамели', stock: 1150 },
            { id: '11', name: 'Перу Виктория Рамос', category: 'Перу', price: 1200, description: 'Сочный кофе с нотами апельсина, жёлтого яблока, абрикоса и молочного шоколада', stock: 430 },
            { id: '12', name: 'Перу Гейша Фелипе Кауачинчай', category: 'Перу', price: 740, description: 'Лёгкий кофе с нотами персика, ананаса, мандарина и зелёного чая с жасмином', stock: 670 }
        ];
        saveProducts();
    }
    renderProducts();
}

function saveProducts() { localStorage.setItem('coffee_products', JSON.stringify(products)); }
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    if (products.length === 0) { container.innerHTML = '<div class="loading">Товаров пока нет</div>'; return; }
    container.innerHTML = products.map(p => `
        <div class="card">
            <img class="card__image" src="images/${getImageName(p.name)}.webp" 
                 onerror="this.src='https://via.placeholder.com/300x180/f5ebe0/8b5a2b?text=Кофе'">
            <div class="card__content">
                <h3 class="card__title">${p.name}</h3>
                <div class="card__category">${p.category}</div>
                <p class="card__description">${p.description}</p>
                <div class="card__price">${p.price} руб / 250г</div>
                <div class="card__stock">В наличии: ${p.stock}</div>
                <button class="card__btn" onclick="window.editProduct('${p.id}')">Редактировать</button>
                <button class="card__btn card__btn--delete" onclick="window.deleteProduct('${p.id}')">Удалить</button>
            </div>
        </div>
    `).join('');
}

function getImageName(name) {
    const images = {
        'Бразилия Суль-де-Минас': 'brazil-sul-de-minas',
        'Коста-Рика Сан-Хосе': 'costa-rica-san-jose',
        'Индонезия Суматра Гайо': 'indonesia-sumatra-gayo',
        'Эфиопия Иргачефф': 'ethiopia-irgacheff',
        'Эфиопия Оромия': 'ethiopia-oromia',
        'Колумбия Богота': 'colombia-bogota',
        'Перу Альто Пириас': 'peru-alto-pirias',
        'Боливия Каранави': 'bolivia-karanavi',
        'Бразилия Трес-Понтас': 'brazil-tres-pontas',
        'Бразилия Серрадо': 'brazil-cerrado',
        'Перу Виктория Рамос': 'peru-victoria-ramos',
        'Перу Гейша Фелипе Кауачинчай': 'peru-geisha-felipe-cauachinchay'
    };
    return images[name] || 'coffee-placeholder';
}

window.editProduct = (id) => {
    const p = products.find(p => p.id === id);
    if (!p) return;
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Редактировать кофе';
    document.getElementById('productName').value = p.name;
    document.getElementById('productCategory').value = p.category;
    document.getElementById('productPrice').value = p.price;
    document.getElementById('productDescription').value = p.description;
    document.getElementById('productStock').value = p.stock;
    document.getElementById('modal').classList.add('show');
};

window.deleteProduct = (id) => {
    if (confirm('Удалить товар?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderProducts();
    }
};

function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Добавить кофе';
    document.getElementById('productForm').reset();
    document.getElementById('modal').classList.add('show');
}

function saveProduct(e) {
    e.preventDefault();
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const price = parseInt(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value.trim();
    const stock = parseInt(document.getElementById('productStock').value);
    if (!name || !category || !price || !description || !stock) { alert('Заполните все поля'); return; }
    if (editingId) {
        const index = products.findIndex(p => p.id === editingId);
        if (index !== -1) products[index] = { ...products[index], name, category, price, description, stock };
    } else {
        const newProduct = { id: Date.now().toString(), name, category, price, description, stock };
        products.push(newProduct);
        socket.emit('newProduct', newProduct);
    }
    saveProducts();
    renderProducts();
    document.getElementById('modal').classList.remove('show');
    document.getElementById('productForm').reset();
}

socket.on('productAdded', (product) => {
    const notif = document.createElement('div');
    notif.textContent = 'Новый сорт кофе успешно добавлен';
    notif.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#8b5a2b; color:white; padding:12px 20px; border-radius:40px; z-index:1000;';
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
});

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
}

async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
        await fetch('http://localhost:3001/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) });
        console.log('Push subscribed');
        enableBtn.style.display = 'none';
        disableBtn.style.display = 'inline-block';
    } catch (err) { console.error(err); }
}

async function unsubscribeFromPush() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
        await fetch('http://localhost:3001/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
        console.log('Push unsubscribed');
        disableBtn.style.display = 'none';
        enableBtn.style.display = 'inline-block';
    }
}

homeBtn.onclick = () => { homeBtn.classList.add('active'); aboutBtn.classList.remove('active'); loadHome(); };
aboutBtn.onclick = () => { aboutBtn.classList.add('active'); homeBtn.classList.remove('active'); loadAbout(); };
enableBtn.onclick = async () => { await Notification.requestPermission(); await subscribeToPush(); };
disableBtn.onclick = async () => { await unsubscribeFromPush(); };

loadHome();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('SW registered');
        reg.pushManager.getSubscription().then(sub => {
            if (sub) { enableBtn.style.display = 'none'; disableBtn.style.display = 'inline-block'; }
        });
    }).catch(err => console.error(err));
}