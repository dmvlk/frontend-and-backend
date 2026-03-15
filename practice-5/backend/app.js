const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

let products = [
  { id: nanoid(6), name: 'Бразилия Суль-де-Минас', category: 'Бразилия', price: 750, description: 'Сладкий кофе с нотами арахиса, пудры какао и цедры лимона', stock: 850 },
  { id: nanoid(6), name: 'Коста-Рика Сан-Хосе', category: 'Коста-Рика', price: 825, description: 'Сладкий кофе с нотами грейпфрута, фундука и тёмного шоколада', stock: 720 },
  { id: nanoid(6), name: 'Индонезия Суматра Гайо', category: 'Индонезия', price: 900, description: 'Яркий кофе со вкусом шиповника, мандарина и листа смородины', stock: 640 },
  { id: nanoid(6), name: 'Эфиопия Иргачефф', category: 'Эфиопия', price: 730, description: 'Сладкий кофе с нотами тёмных ягод, цитрусов и молочного шоколада', stock: 1100 },
  { id: nanoid(6), name: 'Эфиопия Оромия', category: 'Эфиопия', price: 800, description: 'Лёгкий кофе с нотами персика, цедры лимона и молочного шоколада', stock: 950 },
  { id: nanoid(6), name: 'Колумбия Богота', category: 'Колумбия', price: 750, description: 'Сочный кофе с нотами тёмного винограда, красного яблока и тёмного шоколада', stock: 780 },
  { id: nanoid(6), name: 'Перу Альто Пириас', category: 'Перу', price: 850, description: 'Яркий кофе с нотами апельсина, персика, тёмного винограда и белого вина', stock: 690 },
  { id: nanoid(6), name: 'Боливия Каранави', category: 'Боливия', price: 1150, description: 'Сладкий кофе с нотами голубики, апельсина, миндаля и тёмного шоколада', stock: 520 },
  { id: nanoid(6), name: 'Бразилия Трес-Понтас', category: 'Бразилия', price: 830, description: 'Сладкий кофе с нотами красного апельсина, тёмных ягод, фундука и молочного шоколада', stock: 880 },
  { id: nanoid(6), name: 'Бразилия Серрадо', category: 'Бразилия', price: 660, description: 'Плотный кофе с нотами жареных орехов, шоколада и карамели', stock: 1150 },
  { id: nanoid(6), name: 'Перу Виктория Рамос', category: 'Перу', price: 1200, description: 'Сочный кофе с нотами апельсина, жёлтого яблока, абрикоса и молочного шоколада', stock: 430 },
  { id: nanoid(6), name: 'Перу Гейша Фелипе Кауачинчай', category: 'Перу', price: 740, description: 'Лёгкий кофе с нотами персика, ананаса, мандарина и зелёного чая с жасмином', stock: 670 }
];

function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  return product;
}

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coffee Shop API',
      version: '1.0.0',
      description: 'API для управления каталогом кофе'
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Локальный сервер'
      }
    ]
  },
  apis: ['./app.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *         - description
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID товара
 *         name:
 *           type: string
 *           description: Название кофе
 *         category:
 *           type: string
 *           description: Страна происхождения
 *         price:
 *           type: integer
 *           description: Цена за 250г
 *         description:
 *           type: string
 *           description: Описание вкуса
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *       example:
 *         id: "abc123"
 *         name: "Бразилия Суль-де-Минас"
 *         category: "Бразилия"
 *         price: 750
 *         description: "Сладкий кофе с нотами арахиса, пудры какао и цедры лимона"
 *         stock: 850
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка в данных запроса
 */
app.post('/api/products', (req, res) => {
  const { name, category, price, description, stock } = req.body;
  
  if (!name || !category || !price || !description || stock === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    price: Number(price),
    description: description.trim(),
    stock: Number(stock)
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Обновлённый товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар не найден
 */
app.patch('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
  
  if (req.body?.name === undefined && req.body?.category === undefined && 
      req.body?.price === undefined && req.body?.description === undefined && 
      req.body?.stock === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }
  
  const { name, category, price, description, stock } = req.body;
  
  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (price !== undefined) product.price = Number(price);
  if (description !== undefined) product.description = description.trim();
  if (stock !== undefined) product.stock = Number(stock);
  
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удалён (нет тела ответа)
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  
  if (!exists) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});