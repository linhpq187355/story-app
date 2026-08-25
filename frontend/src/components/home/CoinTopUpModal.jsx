import React, { useState } from 'react';
import { paymentService } from '../../services/paymentService';

export default function CoinTopUpModal({ isOpen, onClose }) {
  const [coins, setCoins] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const priceVnd = (coins || 0) * 1000;

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!coins || coins < 2) {
      setError('Số xu nạp tối thiểu là 2 xu (tương đương 2.000 VNĐ).');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const response = await paymentService.createCoinPayment(Number(coins));
      window.location.href = response.data.checkoutUrl;
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Không thể tạo đơn nạp xu.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111f3a] border border-[#1e3254] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-slate-200 font-sans">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            🪙 Nạp Xu Tài Khoản
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg font-mono font-bold"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Tỷ lệ quy đổi cố định: <strong className="text-amber-400 font-mono">1.000 VNĐ = 1 Xu</strong>. Bạn có thể nhập số xu muốn nạp tùy ý.
        </p>

        <form onSubmit={handleTopUp} className="space-y-5">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-2">
              Nhập số xu cần nạp:
            </label>
            <div className="relative">
              <input
                type="number"
                min={2}
                value={coins}
                onChange={(e) => setCoins(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#0a1424] border border-[#1e3254] rounded-xl px-4 py-3 text-amber-400 font-mono text-xl font-bold focus:border-amber-400 focus:outline-none pr-14"
                placeholder="50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-amber-400">
                xu
              </span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-2">
            {[20, 50, 100, 200].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCoins(preset)}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                  coins === preset
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                    : 'bg-[#0a1424] border-[#1e3254] text-slate-400 hover:text-slate-200'
                }`}
              >
                +{preset} xu
              </button>
            ))}
          </div>

          {/* Calculated price */}
          <div className="bg-[#0a1424] border border-[#1e3254] rounded-xl p-4 flex justify-between items-center">
            <span className="text-xs text-slate-400">Thành tiền thanh toán:</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {priceVnd.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>

          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#152033] hover:bg-[#1c2b45] text-slate-300 text-xs font-mono font-semibold rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || coins < 2}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-mono font-bold rounded-xl shadow-lg shadow-amber-400/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              💳 {isSubmitting ? 'Đang tạo đơn...' : 'Thanh toán PayOS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
