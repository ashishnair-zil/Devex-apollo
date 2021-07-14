
'use strict';

import express from 'express';

import cors from 'cors';

import mongoose from 'mongoose';

import { Routes } from './src/routes.js';
const api = new Routes(express);

// Constants
const PORT = process.env.INTERNAL_PORT || 3000;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(cors());

mongoose.connect(process.env.DOCUMENTDB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

app.get('/ping', (req, res) => {
    res.send('Server says Hello!!!');
});

app.use('/api', api.init());

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);