const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST, 
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD, 
    database: process.env.MYSQL_DATABASE  
  });

  // Перевірка з'єднання
connection.connect((err) => {
    if (err) {
      console.error('Помилка підключення до MySQL:', err.stack);
      return;
    }
    console.log('Підключено до бази даних MySQL з id:', connection.threadId);
  });
  
  module.exports = connection;