import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import Cart from '../../components/Cart';

export default function ProductsPage({ userRole }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', price: '', description: '', stock: '' });
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  
  const canEdit = userRole === 'seller' || userRole === 'admin';
  const canDelete = userRole === 'admin';
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

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await api.deleteProduct(id);
      await loadProducts();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await api.updateProduct(editingProduct.id, formData);
    } else {
      await api.createProduct(formData);
    }
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', category: '', price: '', description: '', stock: '' });
    await loadProducts();
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      stock: product.stock
    });
    setShowModal(true);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const getCartQuantity = (productId) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const handleCheckout = () => {
    setCart([]);
    setShowCart(false);
    alert('Заказ успешно оформлен! Спасибо за покупку.');
  };

  const styles = {
    container: { maxWidth: 1200, margin: '0 auto', padding: 20 },
    header: { background: '#fff9f2', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #d9b382' },
    title: { color: '#8b5a2b', margin: 0, fontSize: 24 },
    logoutBtn: { padding: '8px 20px', background: '#d9b382', border: 'none', borderRadius: 40, cursor: 'pointer' },
    cartBtn: { padding: '8px 20px', background: '#8b5a2b', color: 'white', border: 'none', borderRadius: 40, cursor: 'pointer', marginRight: 10, position: 'relative' },
    cartCount: { background: '#c0392b', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: 12, position: 'absolute', top: -5, right: -5 },
    addBtn: { padding: '12px 24px', background: '#8b5a2b', color: 'white', border: 'none', borderRadius: 40, cursor: 'pointer', marginBottom: 20 },
    grid: { display: 'flex', flexWrap: 'wrap', gap: 25, justifyContent: 'center' },
    card: { background: '#fff9f2', borderRadius: 24, width: 320, overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
    image: { width: '100%', height: 200, objectFit: 'contain', background: '#f5ebe0', borderBottom: '3px solid #d9b382', padding: 10, boxSizing: 'border-box' },
    cardContent: { padding: 20 },
    productName: { color: '#8b5a2b', fontSize: 20, margin: '0 0 8px 0' },
    category: { color: '#d9b382', fontSize: 14, marginBottom: 10, textTransform: 'uppercase' },
    description: { color: '#4a3b2c', fontSize: 14, lineHeight: 1.4, marginBottom: 15, height: 60, overflow: 'hidden' },
    price: { fontSize: 18, fontWeight: 'bold', color: '#8b5a2b', marginBottom: 5 },
    stock: { fontSize: 12, color: '#4a3b2c', opacity: 0.7, marginBottom: 15 },
    editBtn: { padding: '8px 16px', background: '#d9b382', border: 'none', borderRadius: 30, cursor: 'pointer', marginRight: 10 },
    deleteBtn: { padding: '8px 16px', background: '#c0392b', color: 'white', border: 'none', borderRadius: 30, cursor: 'pointer' },
    cartButton: { padding: '8px 16px', background: '#8b5a2b', color: 'white', border: 'none', borderRadius: 30, cursor: 'pointer' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: '#fff9f2', borderRadius: 24, padding: 30, width: 450, maxWidth: '90%' },
    input: { width: '100%', padding: 12, marginBottom: 15, borderRadius: 12, border: '1px solid #d9b382', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: 12, marginBottom: 15, borderRadius: 12, border: '1px solid #d9b382', boxSizing: 'border-box', minHeight: 80, fontFamily: 'inherit' },
    saveBtn: { padding: '12px 24px', background: '#8b5a2b', color: 'white', border: 'none', borderRadius: 40, cursor: 'pointer', marginRight: 10 },
    cancelBtn: { padding: '12px 24px', background: '#ccc', border: 'none', borderRadius: 40, cursor: 'pointer' },
    loading: { textAlign: 'center', padding: 50, color: '#8b5a2b' }
  };

  if (loading) return <div style={styles.loading}>Loading coffee...</div>;

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Coffee Shop</h1>
        <div>
          {isUser && (
            <button style={styles.cartBtn} onClick={() => setShowCart(true)}>
              🛒 Корзина
              {cartTotalItems > 0 && <span style={styles.cartCount}>{cartTotalItems}</span>}
            </button>
          )}
          <button onClick={async () => { await api.logout(); window.location.reload(); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>
      <div style={styles.container}>
        {canEdit && <button onClick={() => { setEditingProduct(null); setFormData({ name: '', category: '', price: '', description: '', stock: '' }); setShowModal(true); }} style={styles.addBtn}>+ Add New Coffee</button>}
        <div style={styles.grid}>
          {products.map(product => (
            <div key={product.id} style={styles.card}>
              <img src={`/images/${getImageName(product.name)}.webp`} alt={product.name} style={styles.image} onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200/f5ebe0/8b5a2b?text=Coffee'; }} />
              <div style={styles.cardContent}>
                <h3 style={styles.productName}>{product.name}</h3>
                <div style={styles.category}>{product.category}</div>
                <p style={styles.description}>{product.description}</p>
                <div style={styles.price}>{product.price} ₽ / 250г</div>
                <div style={styles.stock}>In stock: {product.stock}</div>
                {canEdit && <button onClick={() => openEditModal(product)} style={styles.editBtn}>Edit</button>}
                {canDelete && <button onClick={() => handleDelete(product.id)} style={styles.deleteBtn}>Delete</button>}
                {isUser && (
                  <button onClick={() => addToCart(product)} style={styles.cartButton}>
                    {getCartQuantity(product.id) > 0 ? `В корзине: ${getCartQuantity(product.id)}` : 'В корзину'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>{editingProduct ? 'Edit Coffee' : 'Add New Coffee'}</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
              <input type="text" placeholder="Category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={styles.input} required />
              <input type="number" placeholder="Price (₽ per 250g)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={styles.input} required />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={styles.textarea} required />
              <input type="number" placeholder="Stock quantity" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} style={styles.input} />
              <button type="submit" style={styles.saveBtn}>Save</button>
              <button type="button" onClick={() => { setShowModal(false); setEditingProduct(null); }} style={styles.cancelBtn}>Cancel</button>
            </form>
          </div>
        </div>
      )}
      {showCart && <Cart items={cart} onClose={() => setShowCart(false)} onCheckout={handleCheckout} />}
    </div>
  );
}