const { Client } = require('pg');
require('dotenv').config();

async function viewDatabase() {
  console.log('🔍 Подключение к PostgreSQL...\n');
  
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
  
  console.log('Конфигурация подключения:');
  console.log(`  Хост: ${config.host}`);
  console.log(`  Порт: ${config.port}`);
  console.log(`  База: ${config.database}`);
  console.log(`  Пользователь: ${config.user}`);
  console.log(`  Пароль: ${config.password ? '***' : 'не указан'}\n`);
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Успешно подключено к PostgreSQL!\n');
    
    // 1. Проверим список таблиц
    console.log('📋 Список таблиц в базе:');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('   ❌ Нет таблиц в базе данных\n');
    } else {
      tablesResult.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.table_name}`);
      });
      console.log('');
    }
    
    // 2. Проверим таблицу users если существует
    const hasUsersTable = tablesResult.rows.some(row => row.table_name === 'users');
    
    if (hasUsersTable) {
      console.log('👤 Содержимое таблицы users:');
      console.log('─'.repeat(60));
      
      // Получаем структуру
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);
      
      console.log('Структура таблицы:');
      columnsResult.rows.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      console.log('');
      
      // Получаем данные
      const dataResult = await client.query('SELECT * FROM users ORDER BY id');
      
      if (dataResult.rows.length === 0) {
        console.log('   📭 Таблица users пуста');
      } else {
        console.log(`   📊 Найдено записей: ${dataResult.rows.length}\n`);
        
        // Красиво выводим данные
        console.log('   ID | Имя                 | Email                     | Возраст | Создан');
        console.log('   ────┼─────────────────────┼───────────────────────────┼─────────┼─────────────────────');
        
        dataResult.rows.forEach(user => {
          const id = user.id.toString().padEnd(4);
          const name = (user.name || '').substring(0, 20).padEnd(20);
          const email = (user.email || '').substring(0, 25).padEnd(25);
          const age = (user.age || '').toString().padEnd(8);
          const created = user.created_at 
            ? new Date(user.created_at).toLocaleString('ru-RU').substring(0, 19)
            : 'N/A';
          
          console.log(`   ${id}│ ${name}│ ${email}│ ${age}│ ${created}`);
        });
      }
    }
    
    // 3. Статистика
    console.log('\n📈 Статистика:');
    
    if (hasUsersTable) {
      const stats = await client.query(`
        SELECT 
          COUNT(*) as total,
          MIN(created_at) as first_date,
          MAX(created_at) as last_date,
          COUNT(DISTINCT email) as unique_emails
        FROM users
      `);
      
      const stat = stats.rows[0];
      console.log(`   • Всего пользователей: ${stat.total}`);
      console.log(`   • Уникальных email: ${stat.unique_emails}`);
      console.log(`   • Первая запись: ${stat.first_date ? new Date(stat.first_date).toLocaleString('ru-RU') : 'N/A'}`);
      console.log(`   • Последняя запись: ${stat.last_date ? new Date(stat.last_date).toLocaleString('ru-RU') : 'N/A'}`);
    }
    
    // 4. Размер базы
    const sizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size('${config.database}')) as db_size
    `);
    
    console.log(`\n💾 Размер базы данных: ${sizeResult.rows[0].db_size}`);
    
  } catch (error) {
    console.error('\n❌ Ошибка подключения:');
    console.error(`   Сообщение: ${error.message}`);
    
    if (error.message.includes('password authentication')) {
      console.error('\n💡 Возможные причины:');
      console.error('   1. Неверный пароль PostgreSQL');
      console.error('   2. Пользователь не существует');
      console.error('\n   Проверьте ваш .env файл:');
      console.error(`     DB_PASSWORD=${process.env.DB_PASSWORD}`);
    } else if (error.message.includes('connect')) {
      console.error('\n💡 Возможные причины:');
      console.error('   1. PostgreSQL не запущен');
      console.error('   2. Неправильный порт (используется порт 5433?)');
      console.error('   3. Неправильный хост');
    } else if (error.message.includes('database')) {
      console.error('\n💡 База данных не существует');
      console.error('   Создайте базу командой:');
      console.error(`   docker exec express-postgres-app createdb -U postgres ${config.database}`);
    }
  } finally {
    if (client) {
      await client.end();
      console.log('\n🔌 Соединение закрыто');
    }
  }
}

// Автоматический опрос (если нужно следить за изменениями)
async function watchDatabase(interval = 5000) {
  console.log('👁️  Режим наблюдения за базой данных (нажмите Ctrl+C для выхода)\n');
  
  while (true) {
    console.clear();
    await viewDatabase();
    
    console.log(`\n⏰ Следующее обновление через ${interval/1000} секунд...`);
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

// Запуск
const mode = process.argv[2];
if (mode === '--watch') {
  watchDatabase();
} else {
  viewDatabase();
}