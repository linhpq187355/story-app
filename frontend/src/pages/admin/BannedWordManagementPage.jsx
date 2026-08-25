import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { bannedWordService } from '../../services/bannedWordService';
import { getErrorMessage } from '../../utils/errorHandler';
import { format } from 'date-fns';

export default function BannedWordManagementPage() {
  const [bannedWords, setBannedWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBannedWords = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await bannedWordService.getAllBannedWords();
      setBannedWords(response.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách từ cấm.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBannedWords();
  }, []);

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await bannedWordService.addBannedWord(newWord.trim());
      setSuccess(`Đã thêm từ cấm "${newWord.trim()}" thành công.`);
      setNewWord('');
      await fetchBannedWords();
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể thêm từ cấm.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWord = async (id, word) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa từ cấm "${word}"?`)) return;

    setError('');
    setSuccess('');
    try {
      await bannedWordService.deleteBannedWord(id);
      setSuccess(`Đã xóa từ cấm "${word}".`);
      await fetchBannedWords();
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể xóa từ cấm.'));
    }
  };

  const filteredWords = bannedWords.filter(item =>
    item.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">block</span>
              Quản lý Từ cấm & Lọc bình luận
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Các bình luận chứa các từ bị cấm dưới đây sẽ tự động bị thay thế bằng dấu <code className="bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded text-xs">****</code> khi lưu.
            </p>
          </div>
        </header>

        {/* Alert Messages */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-200">✕</button>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-slate-400 hover:text-slate-200">✕</button>
          </div>
        )}

        {/* Add Form & Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Add */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
            <h2 className="text-slate-200 font-semibold text-base mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400 text-lg">add_circle</span>
              Thêm từ bị cấm mới
            </h2>
            <form onSubmit={handleAddWord} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Từ / Cụm từ cấm
                </label>
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Ví dụ: dm, vl, spam..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !newWord.trim()}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">block</span>
                {isSubmitting ? 'Đang thêm...' : 'Thêm vào danh sách cấm'}
              </button>
            </form>
          </div>

          {/* Stats & Search Box */}
          <div className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-slate-400 text-xs font-mono uppercase">Tổng số từ bị cấm</span>
                <div className="text-3xl font-bold text-slate-100 mt-1 flex items-center gap-2">
                  {bannedWords.length}
                  <span className="text-xs font-normal text-slate-400">từ</span>
                </div>
              </div>
              <div className="relative flex-1 max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm từ cấm..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <p className="text-slate-400 text-xs italic">
              * Hệ thống tự động lọc không phân biệt chữ hoa, chữ thường khi người dùng gửi bình luận.
            </p>
          </div>
        </div>

        {/* Words Grid / List */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
          <h2 className="text-slate-200 font-semibold text-base mb-4 flex items-center justify-between">
            <span>Danh sách từ cấm hiện tại</span>
            {filteredWords.length !== bannedWords.length && (
              <span className="text-xs text-slate-400 font-normal">Hiển thị {filteredWords.length} / {bannedWords.length}</span>
            )}
          </h2>

          {isLoading ? (
            <div className="text-center py-8 text-blue-400 font-mono text-sm">Đang tải danh sách từ cấm...</div>
          ) : filteredWords.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              {searchTerm ? 'Không tìm thấy từ cấm nào phù hợp.' : 'Chưa có từ cấm nào trong hệ thống.'}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {filteredWords.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-red-500/50 px-3.5 py-1.5 rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined text-red-400 text-base">tag</span>
                  <span className="font-mono text-slate-200 text-sm font-semibold">{item.word}</span>
                  <span className="text-[11px] text-slate-500">
                    {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy') : ''}
                  </span>
                  <button
                    onClick={() => handleDeleteWord(item.id, item.word)}
                    title="Xóa từ cấm này"
                    className="text-slate-500 hover:text-red-400 ml-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
