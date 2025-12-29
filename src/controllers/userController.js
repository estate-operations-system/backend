const User = require('../models/userModel');

// Получить всех пользователей
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
};

// Получить пользователя по ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
};

// Создать пользователя
exports.createUser = async (req, res) => {
  try {
    // Простая валидация
    const { name, email, age } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Имя и email обязательны'
      });
    }
    
    // Проверяем, существует ли email
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Пользователь с таким email уже существует'
      });
    }
    
    const newUser = await User.create({ name, email, age });
    
    res.status(201).json({
      success: true,
      message: 'Пользователь создан',
      data: newUser
    });
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    
    if (error.code === '23505') { // PostgreSQL код ошибки уникальности
      return res.status(409).json({
        success: false,
        error: 'Пользователь с таким email уже существует'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
};

// Обновить пользователя
exports.updateUser = async (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Имя и email обязательны'
      });
    }
    
    const updatedUser = await User.update(req.params.id, { name, email, age });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }
    
    res.json({
      success: true,
      message: 'Пользователь обновлен',
      data: updatedUser
    });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
};

// Удалить пользователя
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.delete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }
    
    res.json({
      success: true,
      message: 'Пользователь удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
};

// Поиск с пагинацией
exports.getUsersPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const users = await User.findWithPagination(limit, offset);
    const total = await User.count();
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      data: users
    });
  } catch (error) {
    console.error('Ошибка при пагинации:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
};