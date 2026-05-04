import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import Cart from '../../components/Cart';
import AddProductModal from '../../components/AddProductModal';
import EditProductModal from '../../components/EditProductModal';
import SaleModal from '../../components/SaleModal';
import './ProductsPage.css';

function roundToTen(num) {
    return Math.round(num / 10) * 10;
}

function formatPrice(price) {
    return price.toLocaleString('ru-RU');
}

export default function ProductsPage({ userRole, userData }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);

    const canEdit = userRole === 'seller' || userRole === 'admin';
    const canDelete = userRole === 'admin';
    const canSale = userRole === 'seller';
    const isUser = userRole === 'user';

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

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading products:', err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить этот товар?')) {
            try {
                await api.deleteProduct(id);
                await loadProducts();
            } catch (err) {
                alert('Ошибка при удалении товара');
            }
        }
    };

    const addToCart = (product) => {
        const price = product.discountPercent 
            ? roundToTen(product.price * (1 - product.discountPercent / 100))
            : product.price;
        
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1, salePrice: price }];
        });
    };

    const getCartQuantity = (productId) => {
        const item = cart.find(i => i.id === productId);
        return item ? item.quantity : 0;
    };

    const handleCheckout = async () => {
        try {
            await api.checkout();
            setCart([]);
            setShowCart(false);
            alert('Заказ успешно оформлен! Спасибо за покупку.');
        } catch (err) {
            alert('Ошибка при оформлении заказа');
        }
    };

    const getDiscountedPrice = (product) => {
        if (!product.discountPercent) return null;
        return roundToTen(product.price * (1 - product.discountPercent / 100));
    };

    const isOnSale = (product) => {
        if (!product.discountPercent) return false;
        if (product.discountEndTime) {
            return new Date(product.discountEndTime) > new Date();
        }
        return true;
    };

    if (loading) {
        return (
            <div className="loading">
                <p>Загрузка кофе...</p>
            </div>
        );
    }

    const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="products-page">
            <div className="products-toolbar">
                <div className="toolbar-left">
                    {canEdit && (
                        <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
                            Добавить кофе
                        </button>
                    )}
                    {canSale && (
                        <button className="sale-btn" onClick={() => setShowSaleModal(true)}>
                            Объявить распродажу
                        </button>
                    )}
                </div>
                {isUser && (
                    <button className="cart-btn" onClick={() => setShowCart(true)}>
                        Корзина
                        {cartTotalItems > 0 && (
                            <span className="cart-badge">{cartTotalItems}</span>
                        )}
                    </button>
                )}
            </div>

            <div className="products-grid">
                {products.map(product => {
                    const discountedPrice = getDiscountedPrice(product);
                    const onSale = isOnSale(product);
                    
                    return (
                        <div key={product.id} className={`product-card ${onSale ? 'product-card-sale' : ''}`}>
                            {onSale && <div className="sale-badge">-{product.discountPercent}%</div>}
                            <img
                                src={`/images/${getImageName(product.name)}.webp`}
                                alt={product.name}
                                className="product-image"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x200/f5ebe0/8b5a2b?text=Кофе';
                                }}
                            />
                            <div className="product-content">
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-category">{product.category}</div>
                                <p className="product-description">{product.description}</p>
                                
                                {onSale && discountedPrice ? (
                                    <div className="product-price-container">
                                        <div className="product-price-old">
                                            {formatPrice(product.price)} руб
                                        </div>
                                        <div className="product-price-sale">
                                            {formatPrice(discountedPrice)} руб / 250г
                                        </div>
                                        <div className="sale-label">
                                            цена со скидкой
                                            {product.discountEndTime && (
                                                <span className="sale-end-date">
                                                    до {new Date(product.discountEndTime).toLocaleDateString('ru-RU', { 
                                                        day: 'numeric', 
                                                        month: 'long',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="product-price">
                                        {formatPrice(product.price)} руб / 250г
                                    </div>
                                )}
                                
                                <div className="product-stock">В наличии: {product.stock}</div>
                                
                                <div className="product-actions">
                                    {canEdit && (
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => setEditingProduct(product)}
                                        >
                                            Изменить
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            Удалить
                                        </button>
                                    )}
                                    {isUser && (
                                        <button
                                            className="action-btn cart-add-btn"
                                            onClick={() => addToCart(product)}
                                        >
                                            {getCartQuantity(product.id) > 0
                                                ? `В корзине: ${getCartQuantity(product.id)}`
                                                : 'В корзину'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {products.length === 0 && (
                    <div className="no-products">
                        <p>Товаров пока нет</p>
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddProductModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={loadProducts}
                />
            )}

            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSuccess={loadProducts}
                />
            )}

            {showSaleModal && (
                <SaleModal
                    products={products}
                    onClose={() => setShowSaleModal(false)}
                    onSuccess={loadProducts}
                />
            )}

            {showCart && (
                <Cart
                    items={cart}
                    onClose={() => setShowCart(false)}
                    onCheckout={handleCheckout}
                />
            )}
        </div>
    );
}