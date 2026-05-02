let products = [];

const container = document.getElementById('products-container');
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
let editingId = null;

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

function saveProducts() {
    localStorage.setItem('coffee_products', JSON.stringify(products));
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

function renderProducts() {
    if (products.length === 0) {
        container.innerHTML = '<div class="loading">Товаров пока нет</div>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="card" data-id="${product.id}">
            <img class="card__image" src="images/${getImageName(product.name)}.webp" 
                 alt="${product.name}" 
                 onerror="this.src='https://via.placeholder.com/300x200/f5ebe0/8b5a2b?text=Кофе'">
            <div class="card__content">
                <h3 class="card__title">${product.name}</h3>
                <div class="card__category">${product.category}</div>
                <p class="card__description">${product.description}</p>
                <div class="card__price">${product.price} ₽ / 250г</div>
                <div class="card__stock">В наличии: ${product.stock}</div>
                <div class="card__actions">
                    <button class="card__btn" onclick="openEditModal('${product.id}')">✎ Редактировать</button>
                    <button class="card__btn card__btn--delete" onclick="deleteProduct('${product.id}')">× Удалить</button>
                </div>
            </div>
        </div>
    `).join('');
}

function openEditModal(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        editingId = id;
        modalTitle.textContent = 'Редактировать кофе';
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productStock').value = product.stock;
        modal.classList.add('show');
    }
}

function openAddModal() {
    editingId = null;
    modalTitle.textContent = 'Добавить кофе';
    productForm.reset();
    modal.classList.add('show');
}

function deleteProduct(id) {
    if (confirm('Удалить товар?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderProducts();
    }
}

function saveProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const price = parseInt(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value.trim();
    const stock = parseInt(document.getElementById('productStock').value);
    
    if (!name || !category || !price || !description || !stock) {
        alert('Заполните все поля');
        return;
    }
    
    if (editingId) {
        const index = products.findIndex(p => p.id === editingId);
        if (index !== -1) {
            products[index] = { ...products[index], name, category, price, description, stock };
        }
    } else {
        const newId = Date.now().toString();
        products.push({ id: newId, name, category, price, description, stock });
    }
    
    saveProducts();
    renderProducts();
    modal.classList.remove('show');
    productForm.reset();
}

if (addBtn) addBtn.onclick = openAddModal;
if (closeModal) closeModal.onclick = () => modal.classList.remove('show');
if (productForm) productForm.addEventListener('submit', saveProduct);

window.onclick = function(event) {
    if (event.target === modal) {
        modal.classList.remove('show');
    }
};

window.deleteProduct = deleteProduct;
window.openEditModal = openEditModal;

loadProducts();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker зарегистрирован:', reg.scope))
            .catch(err => console.error('Ошибка регистрации SW:', err));
    });
}