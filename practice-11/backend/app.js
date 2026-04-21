const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

const ACCESS_SECRET = 'coffee_shop_access_secret_2025';
const REFRESH_SECRET = 'coffee_shop_refresh_secret_2025';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

const usersFile = path.join(__dirname, 'data', 'users.json');
const productsFile = path.join(__dirname, 'data', 'products.json');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

let users = [];
let products = [];
let refreshTokens = new Set();

function loadUsers() {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    users = JSON.parse(data);
  } catch (err) {
    console.log('No users file, starting empty');
    users = [];
  }
}

function saveUsers() {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function loadProducts() {
  try {
    const data = fs.readFileSync(productsFile, 'utf8');
    products = JSON.parse(data);
  } catch (err) {
    console.log('No products file, starting empty');
    products = [];
  }
}

function saveProducts() {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

async function hashDefaultPasswords() {
  for (let user of users) {
    if (!user.hashedPassword || user.hashedPassword === '') {
      user.hashedPassword = await bcrypt.hash('qwerty123', 10);
    }
  }
  saveUsers();
}

loadUsers();
loadProducts();
hashDefaultPasswords();

function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

function findUserById(id) {
  return users.find(u => u.id === id);
}

function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  return product;
}

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role },
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
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient rights' });
    }
    next();
  };
}

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
  });
  next();
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coffee Shop API',
      version: '1.0.0',
      description: ''
    },
    servers: [{ url: `http://localhost:${port}` }]
  },
  apis: ['./app.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.post('/api/auth/register', async (req, res) => {
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
    id: nanoid(6),
    email,
    first_name,
    last_name,
    role: 'user',
    hashedPassword,
    isActive: true
  };
  users.push(newUser);
  saveUsers();
  res.status(201).json({ id: newUser.id, email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name, role: newUser.role });
});

app.post('/api/auth/login', async (req, res) => {
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
  res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role } });
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
    res.cookie('accessToken', newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
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
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role });
});

app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const safeUsers = users.map(u => ({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, isActive: u.isActive }));
  res.json(safeUsers);
});

app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, isActive: user.isActive });
});

app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
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
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, isActive: user.isActive });
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  user.isActive = false;
  saveUsers();
  res.json({ message: 'User blocked' });
});

app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const { name, category, price, description, stock } = req.body;
  if (!name || !category || !price || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    price: Number(price),
    description: description.trim(),
    stock: stock !== undefined ? Number(stock) : 100
  };
  products.push(newProduct);
  saveProducts();
  res.status(201).json(newProduct);
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
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

app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products = products.filter(p => p.id !== id);
  saveProducts();
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});