import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
Сервер запущен
Порт: ${PORT}
NODE_ENV: ${process.env.NODE_ENV}
`);
});
