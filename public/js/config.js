// Konfigurasi Pakasir
const VYPAY_CONFIG = {
    project: 'pinaa', // Slug proyek
    api_key: 'h6hx6VCQ8NEkXJ4n2coc9pfjLKRw5how', // API Key Pakasir

    // Daftar metode pembayaran yang tersedia
    payment_methods: [
        { id: 'qris', name: 'QRIS', icon: 'qrcode', type: 'qris' },
        { id: 'bni_va', name: 'BNI Virtual Account', icon: 'building-columns', type: 'va' },
        { id: 'bri_va', name: 'BRI Virtual Account', icon: 'building-columns', type: 'va' },
        { id: 'cimb_niaga_va', name: 'CIMB Niaga VA', icon: 'building-columns', type: 'va' },
        { id: 'permata_va', name: 'Permata VA', icon: 'building-columns', type: 'va' },
        { id: 'maybank_va', name: 'Maybank VA', icon: 'building-columns', type: 'va' },
        { id: 'atm_bersama_va', name: 'ATM Bersama VA', icon: 'building-columns', type: 'va' },
        { id: 'artha_graha_va', name: 'Artha Graha VA', icon: 'building-columns', type: 'va' },
        { id: 'bnc_va', name: 'BNC VA', icon: 'building-columns', type: 'va' },
        { id: 'sampoerna_va', name: 'Sampoerna VA', icon: 'building-columns', type: 'va' },
        { id: 'paypal', name: 'PayPal', icon: 'paypal', type: 'paypal', brand: 'paypal' }
    ],
    
    // Fee per metode (contoh, fee sebenarnya dari API)
    fees: {
        qris: 1000,
        va: 1500,
        paypal: 3000
    },
    
    // Kurs PayPal (Rp 15.000 per USD)
    paypal_exchange_rate: 15000,
    paypal_fee_percentage: 4.4,
    paypal_fee_fixed: 0.30 // USD
};

// Jangan ubah kode di bawah ini
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VYPAY_CONFIG;
}