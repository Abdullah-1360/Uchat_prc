// api/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const hostingRouter = require('../routes/hosting');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// reuse connection in lambda warm-starts
let conn;
if (!mongoose.connection.readyState) {
  conn = mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

app.use('/api', hostingRouter);

// export the handler Vercel expects
module.exports = app;