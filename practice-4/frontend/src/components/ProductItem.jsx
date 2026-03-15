import React from 'react';

export default function ProductItem({ product, onEdit, onDelete }) {
  const getImageName = (name) => {
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
  };

  return (
    <div className="card">
      <img 
        className="card__image" 
        src={`/images/${getImageName(product.name)}.webp`}
        alt={product.name}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x200/f5ebe0/8b5a2b?text=Кофе';
        }}
      />
      <div className="card__content">
        <h3 className="card__title">{product.name}</h3>
        <div className="card__category">{product.category}</div>
        <p className="card__description">{product.description}</p>
        
        <div className="card__footer">
          <div className="card__details">
            <span className="card__price">{product.price}</span>
            <span className="card__stock">{product.stock}</span>
          </div>
          
          <div className="card__actions">
            <button 
              className="card__button card__button--edit" 
              onClick={() => onEdit(product)}
            >
              ✎ Редактировать
            </button>
            <button 
              className="card__button" 
              onClick={() => onDelete(product.id)}
            >
              × Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}