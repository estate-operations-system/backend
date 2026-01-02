const axios = require('axios');

const api = axios.create({
  baseURL: process.env.BACKEND_URL
});

exports.findOrCreateUser = async (telegramUser) => {
  const res = await api.post('/api/users', {
    name: telegramUser.first_name,
    email: `${telegramUser.id}@telegram.local`,
    age: null
  });
  return res.data.data;
};

exports.createTicket = async (data) => {
  const res = await api.post('/api/tickets', data);
  return res.data.data;
};
