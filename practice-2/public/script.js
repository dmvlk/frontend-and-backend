document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('products-container');
    
    fetch('/products')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки');
            }
            return response.json();
        })
        .then(products => {
            if (products.length === 0) {
                container.innerHTML = '<div class="error">Товары не найдены</div>';
                return;
            }
            
            let html = '';
            products.forEach(product => {
                html += `
                    <div class="card">
                        <img class="card__image" src="images/${getImageName(product.name)}.webp" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200/f5ebe0/8b5a2b?text=Кофе'">
                        <h2 class="card__title">${product.name}</h2>
                        <p class="card__description">${product.description}</p>
                        <div class="card__price">${product.price} ₽ / 250 г</div>
                        <button class="card__button">В корзину</button>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        })
        .catch(error => {
            container.innerHTML = `<div class="error">Ошибка: ${error.message}</div>`;
        });
});

function getImageName(name) {
    const images = {
        'Бразилия Суль-де-Минас': 'brazil-sul-de-minas',
        'Коста-Рика Сан-Хосе': 'costa-rica-san-jose',
        'Индонезия Суматра Гайо': 'indonesia-sumatra-gayo',
        'Эфиопия Иргачефф': 'ethiopia-irgacheff',
        'Эфиопия Оромия': 'ethiopia-oromia',
        'Колумбия Богота': 'colombia-bogota'
    };
    
    return images[name] || 'coffee-placeholder';
}