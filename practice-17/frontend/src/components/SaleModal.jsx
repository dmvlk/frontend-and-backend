import React, { useState } from 'react';
import { api } from '../api';
import './Modal.css';

export default function SaleModal({ products, onClose, onSuccess }) {
    const [category, setCategory] = useState('all');
    const [discountPercent, setDiscountPercent] = useState(20);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const categories = ['all', ...new Set(products.map(p => p.category))];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!endTime) {
            alert('Укажите время окончания распродажи');
            return;
        }
        
        const saleData = {
            category: category === 'all' ? null : category,
            discountPercent: Number(discountPercent),
            startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
            endTime: new Date(endTime).toISOString()
        };

        try {
            await api.createSale(saleData);
            onSuccess();
            onClose();
        } catch (err) {
            alert('Ошибка при создании распродажи');
        }
    };

    const today = new Date().toISOString().slice(0, 16);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Объявить распродажу</h3>
                    <button className="modal-close-btn" onClick={onClose} title="Закрыть">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-group">
                            <label>Категория товаров</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="all">Все категории</option>
                                {categories.filter(c => c !== 'all').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Процент скидки</label>
                            <select
                                value={discountPercent}
                                onChange={(e) => setDiscountPercent(e.target.value)}
                            >
                                <option value="10">10%</option>
                                <option value="15">15%</option>
                                <option value="20">20%</option>
                                <option value="25">25%</option>
                                <option value="30">30%</option>
                                <option value="50">50%</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Время начала распродажи (оставьте пустым для начала сейчас)</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                min={today}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Время окончания распродажи</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                min={startTime || today}
                                required
                            />
                        </div>
                        
                        <div className="modal-actions">
                            <button type="submit" className="modal-save-btn">
                                Объявить распродажу
                            </button>
                            <button type="button" className="modal-cancel-btn" onClick={onClose}>
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}