const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const webpush = require('web-push');
const socketIo = require('socket.io');

const app = express();
const PORT = 3000;
const HTTPS_PORT = 3443;

const ACCESS_SECRET = 'coffee_shop_access_secret_2025';
const REFRESH_SECRET = 'coffee_shop_refresh_secret_2025';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';
const VAPID_PUBLIC_KEY = 'BPlv95NfVupqg6SLmbUhZ10wI_Sl9vLIjESmwAEZIGgqVF8eCZA39aJjX9zEzKXqeFjDnn9vF_3Ohbmjbg58z8A';
const VAPID_PRIVATE_KEY = 'hZasvuyoECCoyET6oR_A_zbbHC6BWEV5uIc42HX0ZlY';

webpush.setVapidDetails('mailto:coffee@shop.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const usersFile = path.join(__dirname, 'data', 'users.json');
const productsFile = path.join(__dirname, 'data', 'products.json');

let users = [];
let products = [];
let refreshTokens = new Set();
let subscriptions = [];

function loadUsers() {
    try {
        const data = fs.readFileSync(usersFile, 'utf8');
        users = JSON.parse(data);
        console.log(`Loaded ${users.length} users`);
    } catch (err) {
        console.log('No users file, creating empty array');
        users = [];
    }
}

function saveUsers() {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log('Users saved');
}

function loadProducts() {
    try {
        const data = fs.readFileSync(productsFile, 'utf8');
        products = JSON.parse(data);
        console.log(`Loaded ${products.length} products`);
    } catch (err) {
        console.log('No products file, creating default products');
        products = [];
        initializeDefaultProducts();
    }
}

function saveProducts() {
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
    console.log('Products saved');
}

function initializeDefaultProducts() {
    const defaultProducts = [
        { id: 'brazil1', name: 'Бразилия Суль-де-Минас', category: 'Бразилия', price: 750, description: 'Сладкий кофе с нотами арахиса, пудры какао и цедры лимона', stock: 850 },
        { id: 'costar1', name: 'Коста-Рика Сан-Хосе', category: 'Коста-Рика', price: 825, description: 'Сладкий кофе с нотами грейпфрута, фундука и тёмного шоколада', stock: 720 },
        { id: 'indon1', name: 'Индонезия Суматра Гайо', category: 'Индонезия', price: 900, description: 'Яркий кофе со вкусом шиповника, мандарина и листа смородины', stock: 640 },
        { id: 'ethio1', name: 'Эфиопия Иргачефф', category: 'Эфиопия', price: 730, description: 'Сладкий кофе с нотами тёмных ягод, цитрусов и молочного шоколада', stock: 1100 },
        { id: 'ethio2', name: 'Эфиопия Оромия', category: 'Эфиопия', price: 800, description: 'Лёгкий кофе с нотами персика, цедры лимона и молочного шоколада', stock: 950 },
        { id: 'colom1', name: 'Колумбия Богота', category: 'Колумбия', price: 750, description: 'Сочный кофе с нотами тёмного винограда, красного яблока и тёмного шоколада', stock: 780 },
        { id: 'peru1', name: 'Перу Альто Пириас', category: 'Перу', price: 850, description: 'Яркий кофе с нотами апельсина, персика, тёмного винограда и белого вина', stock: 690 },
        { id: 'boliv1', name: 'Боливия Каранави', category: 'Боливия', price: 1150, description: 'Сладкий кофе с нотами голубики, апельсина, миндаля и тёмного шоколада', stock: 520 },
        { id: 'brazil2', name: 'Бразилия Трес-Понтас', category: 'Бразилия', price: 830, description: 'Сладкий кофе с нотами красного апельсина, тёмных ягод, фундука и молочного шоколада', stock: 880 },
        { id: 'brazil3', name: 'Бразилия Серрадо', category: 'Бразилия', price: 660, description: 'Плотный кофе с нотами жареных орехов, шоколада и карамели', stock: 1150 },
        { id: 'peru2', name: 'Перу Виктория Рамос', category: 'Перу', price: 1200, description: 'Сочный кофе с нотами апельсина, жёлтого яблока, абрикоса и молочного шоколада', stock: 430 },
        { id: 'peru3', name: 'Перу Гейша Фелипе Кауачинчай', category: 'Перу', price: 740, description: 'Лёгкий кофе с нотами персика, ананаса, мандарина и зелёного чая с жасмином', stock: 670 }
    ];
    products = defaultProducts;
    saveProducts();
    
    if (users.length === 0) {
        initializeDefaultUsers();
    }
}

async function initializeDefaultUsers() {
    const defaultUsers = [
        {
            id: 'admin1',
            email: 'admin@email.com',
            first_name: 'Admin',
            last_name: 'Coffee',
            role: 'admin',
            hashedPassword: await bcrypt.hash('qwerty123', 10),
            isActive: true
        },
        {
            id: 'seller1',
            email: 'seller@email.com',
            first_name: 'Seller',
            last_name: 'Coffee',
            role: 'seller',
            hashedPassword: await bcrypt.hash('qwerty123', 10),
            isActive: true
        },
        {
            id: 'user1',
            email: 'user@email.com',
            first_name: 'User',
            last_name: 'Coffee',
            role: 'user',
            hashedPassword: await bcrypt.hash('qwerty123', 10),
            isActive: true
        }
    ];
    users = defaultUsers;
    saveUsers();
}

function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

function findUserById(id) {
    return users.find(u => u.id === id);
}

function findProductById(id) {
    return products.find(p => p.id === id);
}

function generateAccessToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
}

function authMiddleware(req, res, next) {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ error: 'No access token' });
    }
    try {
        req.user = jwt.verify(token, ACCESS_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function roleMiddleware(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: insufficient rights' });
        }
        next();
    };
}

loadUsers();
loadProducts();

app.use(cors({
    origin: 'https://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${res.statusCode} ${req.path}`);
    });
    next();
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, first_name, last_name, password } = req.body;
        
        if (!email || !first_name || !last_name || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const existingUser = findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: nanoid(8),
            email,
            first_name,
            last_name,
            role: 'user',
            hashedPassword,
            isActive: true
        };
        
        users.push(newUser);
        saveUsers();
        
        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role: newUser.role
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        if (!user.isActive) {
            return res.status(401).json({ error: 'Account is blocked' });
        }
        
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.add(refreshToken);
        
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        res.json({
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
        return res.status(400).json({ error: 'refreshToken is required' });
    }
    
    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = findUserById(payload.sub);
        
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'User not found or blocked' });
        }
        
        refreshTokens.delete(refreshToken);
        
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);
        
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });
        
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        res.json({ success: true });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        refreshTokens.delete(refreshToken);
    }
    
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = findUserById(req.user.sub);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    });
});

app.get('/api/users', authMiddleware, roleMiddleware('admin'), (req, res) => {
    const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        role: u.role,
        isActive: u.isActive
    }));
    res.json(safeUsers);
});

app.get('/api/users/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
    const user = findUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    });
});

app.put('/api/users/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const user = findUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const { first_name, last_name, role, isActive, password } = req.body;
    
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (role && ['user', 'seller', 'admin'].includes(role)) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) {
        user.hashedPassword = await bcrypt.hash(password, 10);
    }
    
    saveUsers();
    
    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    });
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
    const user = findUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    user.isActive = false;
    saveUsers();
    
    res.json({ message: 'User blocked successfully' });
});

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = findProductById(req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
});

app.post('/api/products', authMiddleware, roleMiddleware('seller', 'admin'), (req, res) => {
    const { name, category, price, description, stock } = req.body;
    
    if (!name || !category || !price || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newProduct = {
        id: nanoid(8),
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        description: description.trim(),
        stock: stock !== undefined ? Number(stock) : 100
    };
    
    products.push(newProduct);
    saveProducts();
    
    const payload = JSON.stringify({
        title: 'Новинка в кофейне!',
        body: `Попробуйте наш новый кофе: ${newProduct.name}`,
        icon: '/icons/icon-128.png',
        badge: '/icons/icon-72.png',
        data: { productId: newProduct.id }
    });
    
    subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload)
            .catch(err => console.error('Push notification error:', err));
    });
    
    console.log(`Push notification sent to ${subscriptions.length} subscribers`);
    
    res.status(201).json(newProduct);
});

app.put('/api/products/:id', authMiddleware, roleMiddleware('seller', 'admin'), (req, res) => {
    const product = findProductById(req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const { name, category, price, description, stock } = req.body;
    
    if (!name || !category || !price || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    product.name = name.trim();
    product.category = category.trim();
    product.price = Number(price);
    product.description = description.trim();
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    
    saveProducts();
    res.json(product);
});

app.delete('/api/products/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
    const product = findProductById(req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    products = products.filter(p => p.id !== req.params.id);
    saveProducts();
    
    res.status(204).send();
});

app.post('/api/subscribe', authMiddleware, (req, res) => {
    const subscription = req.body;
    
    const existingSub = subscriptions.find(sub => sub.endpoint === subscription.endpoint);
    if (existingSub) {
        existingSub.userId = req.user.sub;
        existingSub.keys = subscription.keys;
        console.log(`Updated subscription for user ${req.user.sub}`);
    } else {
        subscriptions.push({
            userId: req.user.sub,
            endpoint: subscription.endpoint,
            keys: subscription.keys
        });
        console.log(`New subscription from user ${req.user.sub}`);
    }
    
    res.status(201).json({ message: 'Subscribed successfully' });
});

app.post('/api/unsubscribe', authMiddleware, (req, res) => {
    const { endpoint } = req.body;
    const initialLength = subscriptions.length;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    
    if (subscriptions.length < initialLength) {
        console.log(`User ${req.user.sub} unsubscribed`);
        res.status(200).json({ message: 'Unsubscribed successfully' });
    } else {
        res.status(404).json({ error: 'Subscription not found' });
    }
});

app.post('/api/checkout', authMiddleware, roleMiddleware('user'), (req, res) => {
    const user = findUserById(req.user.sub);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const userSubscriptions = subscriptions.filter(sub => sub.userId === user.id);
    
    if (userSubscriptions.length > 0) {
        const payload = JSON.stringify({
            title: 'Заказ оформлен!',
            body: `Спасибо за покупку, ${user.first_name}! Ваш заказ принят в обработку.`,
            icon: '/icons/icon-128.png',
            badge: '/icons/icon-72.png',
            data: { type: 'order' }
        });
        
        userSubscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload)
                .catch(err => console.error('Checkout notification error:', err));
        });
        
        console.log(`Order confirmation sent to user ${user.email}`);
    }
    
    res.json({
        message: 'Order placed successfully',
        orderId: nanoid(12)
    });
});

app.post('/api/sales', authMiddleware, roleMiddleware('seller'), (req, res) => {
    const { category, discountPercent, startTime, endTime } = req.body;
    
    if (!discountPercent || !endTime) {
        return res.status(400).json({ error: 'Discount percent and end time are required' });
    }
    
    const startDate = new Date(startTime || Date.now());
    const endDate = new Date(endTime);
    const categoryText = category || 'всех категорий';
    
    products.forEach(product => {
        if (!category || product.category === category) {
            product.discountPercent = discountPercent;
            product.discountStartTime = startDate.toISOString();
            product.discountEndTime = endDate.toISOString();
        }
    });
    
    saveProducts();
    
    const delay = startDate.getTime() - Date.now();
    const formattedEndDate = endDate.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    if (delay > 0) {
        setTimeout(() => {
            const payload = JSON.stringify({
                title: 'Распродажа началась!',
                body: `Скидка ${discountPercent}% на товары ${categoryText}. Действует до ${formattedEndDate}.`,
                icon: '/icons/icon-128.png',
                badge: '/icons/icon-96.png',
                data: { type: 'sale', category, discountPercent }
            });
            
            subscriptions.forEach(sub => {
                webpush.sendNotification(sub, payload)
                    .catch(err => console.error('Sale notification error:', err));
            });
        }, delay);
        
        setTimeout(() => {
            products.forEach(product => {
                if (!category || product.category === category) {
                    delete product.discountPercent;
                    delete product.discountStartTime;
                    delete product.discountEndTime;
                }
            });
            saveProducts();
        }, endDate.getTime() - Date.now());
    } else {
        const payload = JSON.stringify({
            title: 'Распродажа!',
            body: `Скидка ${discountPercent}% на товары ${categoryText}. Действует до ${formattedEndDate}.`,
            icon: '/icons/icon-128.png',
            badge: '/icons/icon-96.png',
            data: { type: 'sale', category, discountPercent }
        });
        
        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload)
                .catch(err => console.error('Sale notification error:', err));
        });
        
        setTimeout(() => {
            products.forEach(product => {
                if (!category || product.category === category) {
                    delete product.discountPercent;
                    delete product.discountStartTime;
                    delete product.discountEndTime;
                }
            });
            saveProducts();
        }, endDate.getTime() - Date.now());
    }
    
    res.json({
        message: `Распродажа ${discountPercent}% на ${categoryText} объявлена`,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
    });
});

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.cert.pem'))
};

const server = https.createServer(httpsOptions, app);

const io = socketIo(server, {
    cors: {
        origin: "https://localhost:3001",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(HTTPS_PORT, () => {
    console.log(`\nCoffee Shop Server is running!`);
    console.log(`HTTPS: https://localhost:${HTTPS_PORT}`);
    console.log(`WebSocket: wss://localhost:${HTTPS_PORT}`);
    console.log(`Users loaded: ${users.length}`);
    console.log(`Products loaded: ${products.length}`);
    console.log(`Push subscribers: ${subscriptions.length}\n`);
});