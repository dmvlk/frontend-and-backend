const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

let products = [
    { id: 1, name: 'Бразилия Суль-де-Минас', price: 750, description: 'Сладкий кофе с нотами арахиса, пудры какао и цедры лимона' },
    { id: 2, name: 'Коста-Рика Сан-Хосе', price: 825, description: 'Сладкий кофе с нотами грейпфрута, фундука и тёмного шоколада' },
    { id: 3, name: 'Индонезия Суматра Гайо', price: 900, description: 'Яркий кофе со вкусом шиповника, мандарина и листа смородины' },
    { id: 4, name: 'Эфиопия Иргачефф', price: 730, description: 'Сладкий кофе с нотами тёмных ягод, цитрусов и молочного шоколада' },
    { id: 5, name: 'Эфиопия Оромия', price: 800, description: 'Лёгкий кофе с нотами персика, цедры лимона и молочного шоколада' },
    { id: 6, name: 'Колумбия Богота', price: 750, description: 'Сочный кофе с нотами тёмного винограда, красного яблока и тёмного шоколада' }
];

app.get('/products', (req, res) => {
    res.json(products);
});

app.get('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(product);
});

app.post('/products', (req, res) => {
    const { name, price, description } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ error: 'Укажите название и цену' });
    }
    
    const newProduct = {
        id: products.length + 1,
        name: name,
        price: price,
        description: description || ''
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const { name, price, description } = req.body;
    
    if (name) product.name = name;
    if (price) product.price = price;
    if (description) product.description = description;
    
    res.json(product);
});

app.delete('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    products.splice(index, 1);
    res.status(200).json({ message: 'Товар удалён' });
});

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});