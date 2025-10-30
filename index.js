/*  hosting-api/server.js  */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const hostingRouter = require('./routes/hosting');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ---------- middleware ---------- */
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : '*'
}));
app.use(express.json());

/* ---------- DB connection ---------- */
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('Mongo connection error', err));

/* ---------- routes ---------- */
app.use('/api', hostingRouter);
  // imports only if collection empty
/* ---------- boot ---------- */
app.listen(PORT, () => console.log(`Hosting API listening on http://localhost:${PORT}`));