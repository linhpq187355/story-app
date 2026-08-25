import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import { userService } from '../services/userService';
import { paymentService } from '../services/paymentService';
import { publicStoryService } from '../services/publicStoryService';
import { vipPackageService } from '../services/vipPackageService';
import CoinTopUpModal from '../components/home/CoinTopUpModal';

// --- ICONS ---
const Icons = {
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  CreditCard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Heart: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>,
  Eye: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .847 0 1.67.127 2.454.364m-6.082 2.882A4.5 4.5 0 009.75 12a4.5 4.5 0 004.5 4.5m0-6.832l4.5 4.5M3 3l18 18" /></svg>,
  CheckCircle: () => <svg className="w-4 h-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Sparkles: () => <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
};

// --- SIDEBAR ---
const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'profile', title: 'Hồ sơ tài khoản', desc: 'Tên, ảnh, email', icon: <Icons.User /> },
    { id: 'password', title: 'Mật khẩu', desc: 'Đổi mật khẩu định kỳ', icon: <Icons.Lock /> },
    { id: 'plan', title: 'Gói & thanh toán', desc: 'Gói đang dùng, lịch sử mua', icon: <Icons.CreditCard /> },
  ];
  return (
    <div className="w-1/3 flex flex-col gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-start text-left gap-4 p-4 rounded-lg transition-colors duration-200 ${
            activeTab === tab.id ? 'bg-[#23344f]' : 'hover:bg-[#1a263c]'
          }`}
        >
          <div className={`mt-1 ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-400'}`}>{tab.icon}</div>
          <div>
            <div className={`font-semibold ${activeTab === tab.id ? 'text-slate-100' : 'text-slate-200'}`}>{tab.title}</div>
            <div className="text-sm text-slate-400 mt-0.5">{tab.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
};



// --- PROFILE SETTINGS ---
const ProfileSettings = () => {
  const [user, setUser] = useState(userService.getCurrentUser());
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(userService.buildAvatarUrl(user?.avatar));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const response = await userService.updateAvatar(file);
      userService.updateCurrentUser(response.data);
      setAvatarUrl(userService.buildAvatarUrl(response.data.avatar));
      setSuccess('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lên ảnh đại diện.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const response = await userService.updateProfile(displayName);
      userService.updateCurrentUser(response.data);
      setSuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-2/3 border border-slate-700/50 bg-[#151f32] rounded-xl flex flex-col">
      <div className="p-6 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Hồ sơ tài khoản</h2>
        <p className="text-slate-400 text-sm">Cập nhật tên hiển thị và ảnh đại diện của bạn.</p>
      </div>

      <div className="p-6 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="relative w-24 h-24 rounded-full bg-slate-700 overflow-hidden mb-3 border-2 border-slate-600">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/png, image/jpeg" hidden />
            <button onClick={() => fileInputRef.current.click()} className="text-sm text-blue-400 hover:text-blue-300">Đổi ảnh</button>
            <span className="text-xs text-slate-500 mt-1">JPG, PNG. Tối đa 2MB.</span>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Tên hiển thị</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0b1320] border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
              <div className="relative">
                <input type="email" value={user?.email || ''} disabled className="w-full bg-[#0b1320] border border-slate-700 rounded-lg pl-4 pr-4 py-2 text-slate-400 cursor-not-allowed" />
              </div>
            </div>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        {success && <p className="text-green-400 text-sm mt-4">{success}</p>}
      </div>

      <div className="p-4 border-t border-slate-700/50 flex justify-end items-center bg-[#111928] rounded-b-xl">
        <button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
};

// --- PASSWORD SETTINGS ---
const PasswordSettings = () => {
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const toggleShow = (field) => {
    setShow(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Mật khẩu mới và mật khẩu xác nhận không khớp.');
      return;
    }
    if (passwords.newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    setIsSaving(true);
    try {
      await userService.changePassword(passwords.oldPassword, passwords.newPassword, passwords.confirmPassword);
      setSuccess('Đổi mật khẩu thành công!');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-2/3 border border-slate-700/50 bg-[#151f32] rounded-xl flex flex-col">
      <div className="p-6 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Đổi mật khẩu</h2>
        <p className="text-slate-400 text-sm">Để bảo mật, hãy chọn một mật khẩu mạnh mà bạn chưa từng dùng ở đâu khác.</p>
      </div>

      <div className="p-6 flex-1 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Mật khẩu hiện tại</label>
          <div className="relative">
            <input type={show.old ? 'text' : 'password'} name="oldPassword" value={passwords.oldPassword} onChange={handleChange} required className="w-full bg-[#0b1320] border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
            <button type="button" onClick={() => toggleShow('old')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {show.old ? <Icons.EyeOff /> : <Icons.Eye />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Mật khẩu mới</label>
          <div className="relative">
            <input type={show.new ? 'text' : 'password'} name="newPassword" value={passwords.newPassword} onChange={handleChange} required className="w-full bg-[#0b1320] border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
            <button type="button" onClick={() => toggleShow('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {show.new ? <Icons.EyeOff /> : <Icons.Eye />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Xác nhận mật khẩu mới</label>
          <div className="relative">
            <input type={show.confirm ? 'text' : 'password'} name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} required className="w-full bg-[#0b1320] border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
            <button type="button" onClick={() => toggleShow('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {show.confirm ? <Icons.EyeOff /> : <Icons.Eye />}
            </button>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
      </div>

      <div className="p-4 border-t border-slate-700/50 flex justify-end items-center bg-[#111928] rounded-b-xl">
        <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </form>
  );
};

// --- PLAN SETTINGS ---
const PlanSettings = ({ paymentStatus }) => {
  const [user, setUser] = useState(userService.getCurrentUser());
  const [history, setHistory] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingPkgId, setLoadingPkgId] = useState(null);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleStorageChange = () => setUser(userService.getCurrentUser());
    window.addEventListener('storage', handleStorageChange);

    const loadData = async () => {
      try {
        const [meRes, histRes, pkgRes] = await Promise.all([
          userService.getMe(),
          paymentService.getPaymentHistory(),
          vipPackageService.getActivePackages(),
        ]);
        if (meRes?.data) {
          setUser(meRes.data);
          userService.updateCurrentUser(meRes.data);
        }
        setHistory(histRes.data || []);
        setPackages(pkgRes.data || []);
      } catch (err) {
        console.error("Failed to fetch plan settings data:", err);
      }
    };

    loadData();

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleUpgrade = async (packageId) => {
    setLoadingPkgId(packageId);
    setError('');
    try {
      const response = await paymentService.createVipPayment(packageId);
      window.location.href = response.data.checkoutUrl;
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Không thể tạo yêu cầu thanh toán.');
      setLoadingPkgId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="w-2/3 space-y-6">
      {paymentStatus === 'success' && (
        <div className="bg-green-900/50 border border-green-700 rounded-xl p-4 text-center">
          <p className="font-semibold text-green-300">🎉 Giao dịch thành công! Tài khoản của bạn đã được gia hạn / nâng cấp VIP.</p>
        </div>
      )}
      {paymentStatus === 'cancel' && (
        <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 text-center">
          <p className="font-semibold text-red-300">Giao dịch đã bị hủy. Bạn có thể thử lại bất cứ lúc nào.</p>
        </div>
      )}

      {/* Current Plan Info */}
      <div className="border border-slate-700/50 bg-[#151f32] rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Gói hiện tại</h2>
        <p className="text-slate-400 text-sm mb-6 border-b border-slate-700/50 pb-4">Thông tin gói dịch vụ bạn đang sử dụng.</p>

        {user?.isVip ? (
          <div className="bg-gradient-to-r from-amber-900/40 to-purple-900/40 border border-amber-500/40 rounded-xl p-5 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-amber-300">TÀI KHOẢN VIP ACTIVE</h3>
                <span className="text-xl">✨</span>
              </div>
              <p className="text-sm text-slate-300">
                {user?.vipExpirationDate ? (
                  <>Hạn dùng đến: <strong className="text-amber-400">{formatDate(user.vipExpirationDate)}</strong></>
                ) : (
                  'Quyền VIP Vĩnh Viễn'
                )}
              </p>
            </div>
            <span className="text-3xl">👑</span>
          </div>
        ) : (
          <div className="bg-[#0b1320] border border-slate-700 rounded-xl p-5 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-200 mb-1">Tài khoản Thường</h3>
              <p className="text-sm text-slate-400">Đăng ký các gói VIP bên dưới để mở khóa toàn bộ truyện VIP.</p>
            </div>
            <span className="text-2xl text-slate-500">📖</span>
          </div>
        )}
      </div>

      {/* Coin Balance Info & Topup */}
      <div className="border border-amber-500/30 bg-[#151f32] rounded-xl p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">Số dư Xu tài khoản</h2>
          <p className="text-amber-400 font-mono text-2xl font-bold mt-1">
            🪙 {user?.coins?.toLocaleString('vi-VN') || 0} xu
          </p>
          <p className="text-slate-400 text-xs mt-1">Quy đổi: 1.000 VNĐ = 1 Xu. Dùng xu để đọc lẻ chương VIP hoặc mua trọn bộ truyện.</p>
        </div>
        <button
          onClick={() => setIsCoinModalOpen(true)}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl font-mono font-bold text-sm transition-all shadow-[0_0_16px_rgba(245,158,11,0.3)] flex items-center gap-2"
        >
          🪙 Nạp Xu Ngay
        </button>
      </div>

      <CoinTopUpModal isOpen={isCoinModalOpen} onClose={() => setIsCoinModalOpen(false)} />

      {/* VIP Packages Section */}
      <div className="border border-slate-700/50 bg-[#151f32] rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Chọn gói nâng cấp VIP</h2>
        <p className="text-slate-400 text-sm mb-6 border-b border-slate-700/50 pb-4">Đọc không giới hạn toàn bộ truyện VIP với thời hạn linh hoạt.</p>

        {packages.length === 0 ? (
          <p className="text-slate-400 text-sm">Hiện chưa có gói VIP nào khả dụng.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-[#0b1320] border border-slate-700 hover:border-amber-500/50 rounded-xl p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-amber-300 transition-colors">
                      {pkg.name}
                    </h3>
                    <span className="bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                      {pkg.durationDays} ngày
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-4 line-clamp-2">{pkg.description || 'Truy cập tất cả truyện VIP.'}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block font-mono">Giá gói:</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      {pkg.price?.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <button
                    onClick={() => handleUpgrade(pkg.id)}
                    disabled={loadingPkgId === pkg.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                  >
                    <Icons.Sparkles />
                    {loadingPkgId === pkg.id ? 'Đang xử lý...' : 'Nâng cấp'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>

      {/* Payment History */}
      <div className="border border-slate-700/50 bg-[#151f32] rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Lịch sử mua gói</h2>
        <p className="text-slate-400 text-sm mb-6 border-b border-slate-700/50 pb-4">Các giao dịch nâng cấp VIP của bạn.</p>
        {history.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-[#0b1320]">
              <tr>
                <th scope="col" className="px-6 py-3">Mã Đơn</th>
                <th scope="col" className="px-6 py-3">Gói VIP</th>
                <th scope="col" className="px-6 py-3">Số tiền</th>
                <th scope="col" className="px-6 py-3">Ngày thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.orderCode} className="border-b border-slate-700">
                  <td className="px-6 py-4 font-mono text-slate-300">{item.orderCode}</td>
                  <td className="px-6 py-4 font-semibold text-amber-400">
                    {item.packageName || (item.durationDays ? `Gói VIP (${item.durationDays} ngày)` : 'Gói VIP')}
                  </td>
                  <td className="px-6 py-4">{item.amount.toLocaleString('vi-VN')} VNĐ</td>
                  <td className="px-6 py-4">{formatDate(item.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-slate-400 text-sm">Chưa có giao dịch nào.</div>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function AccountSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('payment_status'));

  useEffect(() => {
    // Clear URL params after reading them
    if (searchParams.get('tab')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tab');
      newParams.delete('payment_status');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />;
      case 'password': return <PasswordSettings />;
      case 'plan': return <PlanSettings paymentStatus={paymentStatus} />;
      default: return <ProfileSettings />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 w-full box-border text-slate-300 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cài đặt tài khoản</h1>
        <p className="text-slate-400">Quản lý thông tin cá nhân, bảo mật và các gói dịch vụ của bạn.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        {renderContent()}
      </div>
    </div>
  );
}