const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Импорт конфигураций
const initDatabase = require('./config/init-db');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Создание приложения
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Тестовый маршрут
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Express + PostgreSQL API работает!',
    endpoints: {
      users: '/api/users',
      docs: 'Добавьте swagger позже'
    }
  });
});

// Маршруты API
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден'
  });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error('🔥 Ошибка:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Инициализация БД и запуск сервера
async function startServer() {
  try {
    // Инициализируем БД
    await initDatabase();
    
    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`
      🚀 Сервер запущен!
      📍 Порт: ${PORT}
      🌐 Среда: ${process.env.NODE_ENV}
      📊 БД: PostgreSQL
      🎯 API: http://localhost:${PORT}
      `);
    });
  } catch (error) {
    console.error('❌ Не удалось запустить сервер:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;