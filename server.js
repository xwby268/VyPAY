const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check for Vercel
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API endpoint untuk membuat transaksi
app.post('/api/create-transaction', async (req, res) => {
    try {
        const { method, amount, order_id } = req.body;

        // Baca konfigurasi dari file config.js (akan di-set di frontend)
        // Untuk keamanan, sebaiknya config dibaca dari environment variable
        // Tapi sesuai permintaan, kita akan passing dari frontend

        const response = await axios.post(`https://app.pakasir.com/api/transactioncreate/${method}`, {
            project: req.body.project,
            order_id: order_id,
            amount: parseInt(amount),
            api_key: req.body.api_key
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error creating transaction:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || error.message
        });
    }
});

// API endpoint untuk cek status transaksi
app.get('/api/transaction-status', async (req, res) => {
    try {
        const { project, amount, order_id, api_key } = req.query;

        const response = await axios.get('https://app.pakasir.com/api/transactiondetail', {
            params: {
                project,
                amount,
                order_id,
                api_key
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error checking transaction:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || error.message
        });
    }
});

// API endpoint untuk simulasi pembayaran (sandbox mode)
app.post('/api/simulate-payment', async (req, res) => {
    try {
        const { project, order_id, amount, api_key } = req.body;

        const response = await axios.post('https://app.pakasir.com/api/paymentsimulation', {
            project,
            order_id,
            amount: parseInt(amount),
            api_key
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error simulating payment:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || error.message
        });
    }
});

// Serve index.html untuk semua route (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`VyPay server running at http://0.0.0.0:${PORT}`);
    console.log(`Mode: iOS Modern Theme with Dark/Light support`);
});