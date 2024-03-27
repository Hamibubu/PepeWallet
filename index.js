const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const path = require('path');
const signerRoutes = require('./src/routes/signUserRoutes');
const buyerRoutes = require('./src/routes/buyUserRoutes');
const usersRoutes = require('./src/routes/usersRoutes');
const transactionsRoutes = require('./src/routes/transactionRoutes');

const app = express();

const corsOptions = {
    origin: '*', 
    optionsSuccessStatus: 200
  };
  
app.use(cors(corsOptions));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', signerRoutes);
app.use('/api', buyerRoutes);
app.use('/api', usersRoutes);
app.use('/api', transactionsRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`La app esta funcionando en el puerto ${port}...`);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/index/index.html'));
  });

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/errors/404.html'));
  });
