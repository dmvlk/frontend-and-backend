import React from 'react';

export default function Cart({ items, onClose, onCheckout }) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: '#fff9f2',
      borderRadius: 24,
      width: 500,
      maxWidth: '90%',
      maxHeight: '80vh',
      overflow: 'auto',
      padding: 20,
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
    },
    title: {
      color: '#8b5a2b',
      marginTop: 0,
      borderBottom: '2px solid #d9b382',
      paddingBottom: 10
    },
    item: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #d9b382'
    },
    itemName: {
      flex: 2,
      color: '#4a3b2c'
    },
    itemPrice: {
      flex: 1,
      textAlign: 'right',
      color: '#8b5a2b'
    },
    itemQuantity: {
      flex: 1,
      textAlign: 'center',
      color: '#4a3b2c'
    },
    total: {
      marginTop: 15,
      paddingTop: 10,
      fontSize: 18,
      fontWeight: 'bold',
      color: '#8b5a2b',
      textAlign: 'right',
      borderTop: '2px solid #d9b382'
    },
    button: {
      padding: '10px 20px',
      background: '#8b5a2b',
      color: 'white',
      border: 'none',
      borderRadius: 40,
      cursor: 'pointer',
      marginTop: 15,
      width: '100%'
    },
    closeBtn: {
      padding: '10px 20px',
      background: '#d9b382',
      color: '#4a3b2c',
      border: 'none',
      borderRadius: 40,
      cursor: 'pointer',
      marginTop: 10,
      width: '100%'
    },
    empty: {
      textAlign: 'center',
      color: '#4a3b2c',
      padding: 30
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>Корзина</h3>
        {items.length === 0 ? (
          <div style={styles.empty}>Корзина пуста</div>
        ) : (
          <>
            {items.map(item => (
              <div key={item.id} style={styles.item}>
                <span style={styles.itemName}>{item.name}</span>
                <span style={styles.itemQuantity}>x{item.quantity}</span>
                <span style={styles.itemPrice}>{item.price * item.quantity} ₽</span>
              </div>
            ))}
            <div style={styles.total}>Итого: {total} ₽</div>
            <button style={styles.button} onClick={onCheckout}>Оформить заказ</button>
          </>
        )}
        <button style={styles.closeBtn} onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}