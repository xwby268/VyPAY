// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentTransaction = null;
    let currentMethod = 'qris';
    let darkMode = false;

    // DOM Elements
    const elements = {
        amountInput: document.getElementById('amountInput'),
        methodItems: document.querySelectorAll('.method-item'),
        payBtn: document.getElementById('payNowBtn'),
        errorBanner: document.getElementById('errorBanner'),
        qrisCanvas: document.getElementById('qrisCanvas'),
        paymentNumberDisplay: document.getElementById('paymentNumberDisplay'),
        totalAmountDisplay: document.getElementById('totalAmountDisplay'),
        feeDisplay: document.getElementById('feeDisplay'),
        expiryDisplay: document.getElementById('expiryDisplay'),
        paymentDetailArea: document.getElementById('paymentDetailArea'),
        qrContainer: document.getElementById('qrContainer'),
        vaContainer: document.getElementById('vaContainer'),
        copyBtn: document.getElementById('copyBtn'),
        themeToggle: document.getElementById('themeToggle'),
        methodTitle: document.getElementById('methodTitle'),
        detailHeaderIcon: document.getElementById('detailHeaderIcon'),
        detailHeaderTitle: document.getElementById('detailHeaderTitle')
    };

    // ===== THEME MANAGEMENT =====
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        elements.themeToggle.innerHTML = theme === 'dark' 
            ? '<i class="fas fa-sun"></i> Light' 
            : '<i class="fas fa-moon"></i> Dark';
        darkMode = theme === 'dark';
        localStorage.setItem('vypay-theme', theme);
    }

    // Load saved theme or system preference
    const savedTheme = localStorage.getItem('vypay-theme') || 'dark';
    setTheme(savedTheme);

    elements.themeToggle.addEventListener('click', () => {
        setTheme(darkMode ? 'light' : 'dark');
    });

    // ===== UTILITY FUNCTIONS =====
    function formatRupiah(angka) {
        return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function showError(msg) {
        elements.errorBanner.style.display = 'flex';
        elements.errorBanner.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
        setTimeout(() => {
            elements.errorBanner.style.display = 'none';
        }, 5000);
    }

    function generateOrderId() {
        return 'VY-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showSuccess('Copied to clipboard!');
        } catch (err) {
            showError('Failed to copy');
        }
    }

    function showSuccess(msg) {
        const originalBg = elements.errorBanner.style.backgroundColor;
        elements.errorBanner.style.backgroundColor = '#34c759';
        elements.errorBanner.style.display = 'flex';
        elements.errorBanner.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
        setTimeout(() => {
            elements.errorBanner.style.display = 'none';
            elements.errorBanner.style.backgroundColor = originalBg;
        }, 2000);
    }

    // ===== RENDER PAYMENT DETAIL =====
    function renderTransactionDetail(tx) {
        if (!tx || !tx.payment) return;

        const payment = tx.payment;

        // Update total dan fee
        elements.totalAmountDisplay.textContent = formatRupiah(payment.total_payment || payment.amount);
        elements.feeDisplay.textContent = formatRupiah(payment.fee || 0);

        // Format expiry
        if (payment.expired_at) {
            const expDate = new Date(payment.expired_at);
            elements.expiryDisplay.innerHTML = `<i class="fas fa-clock"></i> ${expDate.toLocaleString('id-ID', { 
                dateStyle: 'medium', 
                timeStyle: 'short' 
            })}`;
        }

        // Tampilkan berdasarkan metode
        if (payment.payment_method === 'qris') {
            // QRIS View
            document.getElementById('qrView').style.display = 'block';
            document.getElementById('vaView').style.display = 'none';
            elements.detailHeaderIcon.className = 'fas fa-qrcode';
            elements.detailHeaderTitle.textContent = 'QRIS Payment';

            if (payment.payment_number) {
                elements.paymentNumberDisplay.textContent = payment.payment_number;
                // Generate QR Code
                QRCode.toCanvas(elements.qrisCanvas, payment.payment_number, { 
                    width: 180, 
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                }, (err) => {
                    if (err) showError('Failed to generate QR code');
                });
            }
        } else {
            // VA or PayPal View
            document.getElementById('qrView').style.display = 'none';
            document.getElementById('vaView').style.display = 'block';

            if (payment.payment_method === 'paypal') {
                elements.detailHeaderIcon.className = 'fab fa-paypal';
                elements.detailHeaderTitle.textContent = 'PayPal Payment';
                document.getElementById('vaNumberDisplay').textContent = 'PayPal Express Checkout';
                document.getElementById('vaInstructions').innerHTML = `
                    <i class="fas fa-info-circle"></i> 
                    Anda akan diarahkan ke halaman PayPal setelah konfirmasi.
                `;
            } else {
                elements.detailHeaderIcon.className = 'fas fa-university';
                elements.detailHeaderTitle.textContent = 'Virtual Account';
                document.getElementById('vaNumberDisplay').textContent = payment.payment_number || '-';
                document.getElementById('vaInstructions').innerHTML = `
                    <i class="fas fa-info-circle"></i> 
                    Transfer ke nomor Virtual Account di atas
                `;
            }
        }
        
        elements.paymentDetailArea.style.display = 'block';
        currentTransaction = tx;
    }

    // ===== CREATE TRANSACTION =====
    async function createTransaction() {
        if (!currentMethod) {
            showError('Silakan pilih metode pembayaran');
            return;
        }

        const amount = parseInt(elements.amountInput.value);
        if (isNaN(amount) || amount < 1000) {
            showError('Minimum payment is Rp 1.000');
            return;
        }

        const orderId = generateOrderId();

        // Show loading
        elements.payBtn.classList.add('loading');
        elements.payBtn.innerHTML = '<span class="loading-spinner"></span> Processing...';

        try {
            const response = await fetch('/api/create-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: currentMethod,
                    amount: amount,
                    order_id: orderId,
                    project: VYPAY_CONFIG.project,
                    api_key: VYPAY_CONFIG.api_key
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create transaction');
            }

            renderTransactionDetail(data);

        } catch (error) {
            console.error('Transaction error:', error);
            showModal('error', 'Pembayaran Gagal', error.message || 'Gagal membuat transaksi. Silakan coba lagi.');
        } finally {
            elements.payBtn.classList.remove('loading');
            elements.payBtn.innerHTML = '<i class="fas fa-lock"></i> Bayar Sekarang';
        }
    }

    // Modal Utility
    function showModal(type, title, desc) {
        let modal = document.getElementById('vypayModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'vypayModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        const iconClass = type === 'success' ? 'fa-check-circle success' : 'fa-times-circle error';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-icon"><i class="fas ${iconClass}"></i></div>
                <div class="modal-title">${title}</div>
                <div class="modal-desc">${desc}</div>
                <button class="modal-btn" onclick="this.closest('.modal-overlay').style.display='none'">Tutup</button>
            </div>
        `;
        modal.style.display = 'flex';
    }

    // ===== CHECK TRANSACTION STATUS =====
    async function checkTransactionStatus(orderId, amount) {
        try {
            const response = await fetch(`/api/transaction-status?project=${VYPAY_CONFIG.project}&amount=${amount}&order_id=${orderId}&api_key=${VYPAY_CONFIG.api_key}`);
            const data = await response.json();

            if (data.transaction && data.transaction.status === 'completed') {
                showModal('success', 'Pembayaran Berhasil', 'Terima kasih, pembayaran Anda telah kami terima.');
                // Update UI untuk completed
                document.querySelector('.status-badge').textContent = 'PAID';
                document.querySelector('.status-badge').style.backgroundColor = '#34c759';
                currentTransaction = null; // Stop polling
            }
        } catch (error) {
            console.error('Status check error:', error);
        }
    }

    // ===== EVENT LISTENERS =====

    // Method selection delegation
    document.getElementById('methodList').addEventListener('click', (e) => {
        const item = e.target.closest('.method-item');
        if (!item) return;

        // Remove active from all items
        document.querySelectorAll('.method-item').forEach(m => m.classList.remove('active'));
        
        // Add active to clicked item
        item.classList.add('active');
        currentMethod = item.dataset.method;

        // Reset detail area
        elements.paymentDetailArea.style.display = 'none';
        currentTransaction = null;
    });

    // Cancel Button
    document.getElementById('cancelPaymentBtn')?.addEventListener('click', () => {
        elements.paymentDetailArea.style.display = 'none';
        currentTransaction = null;
        showModal('error', 'Pembayaran Dibatalkan', 'Anda telah membatalkan proses pembayaran.');
    });

    // Pay button
    elements.payBtn.addEventListener('click', createTransaction);

    // Copy button
    if (elements.copyBtn) {
        elements.copyBtn.addEventListener('click', () => {
            const textToCopy = document.getElementById('vaNumberDisplay')?.textContent || 
                              elements.paymentNumberDisplay?.textContent;
            if (textToCopy && textToCopy !== '-') {
                copyToClipboard(textToCopy);
            }
        });
    }

    // Amount input formatting
    elements.amountInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value) {
            e.target.value = value;
        }
    });

    // Quick amount suggestions (optional)
    const suggestions = [20000, 50000, 100000, 250000];
    // Bisa ditambahkan tombol quick amount jika diinginkan

    // Initialize dengan QRIS selected jika elemen ada
    setTimeout(() => {
        const defaultMethod = document.querySelector('[data-method="qris"]');
        if (defaultMethod) {
            defaultMethod.classList.add('active');
        }
    }, 100);

    // Polling untuk cek status setiap 10 detik (jika ada transaksi)
    setInterval(() => {
        if (currentTransaction?.payment?.order_id) {
            checkTransactionStatus(
                currentTransaction.payment.order_id,
                currentTransaction.payment.amount
            );
        }
    }, 10000);
});