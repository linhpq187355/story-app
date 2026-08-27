import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { dashboardService } from '../../services/dashboardService';
import { getErrorMessage } from '../../utils/errorHandler';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reading Stats state
  const [readingPeriod, setReadingPeriod] = useState('7d');
  const [readingStats, setReadingStats] = useState([]);
  const [readingLoading, setReadingLoading] = useState(false);

  // Revenue Stats state
  const [revenuePeriod, setRevenuePeriod] = useState('7d');
  const [revenueStats, setRevenueStats] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getDashboardData();
      setData(res);
      setReadingStats(res.readingStatistics || []);
      setRevenueStats(res.revenueStatistics || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  const handleReadingPeriodChange = async (period) => {
    setReadingPeriod(period);
    setReadingLoading(true);
    try {
      const stats = await dashboardService.getReadingStatistics(period);
      setReadingStats(stats);
    } catch (err) {
      console.error('Failed to load reading statistics:', err);
    } finally {
      setReadingLoading(false);
    }
  };

  const handleRevenuePeriodChange = async (period) => {
    setRevenuePeriod(period);
    setRevenueLoading(true);
    try {
      const stats = await dashboardService.getRevenueStatistics(period);
      setRevenueStats(stats);
    } catch (err) {
      console.error('Failed to load revenue statistics:', err);
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <span className="material-symbols-outlined animate-spin text-5xl text-blue-400 mb-4">sync</span>
          <p className="font-mono text-sm">Đang tải dữ liệu Dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-xl mx-auto my-16 bg-slate-900 border border-red-500/30 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-3">error</span>
          <h2 className="font-sans text-xl font-bold text-slate-100 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-slate-400 font-sans text-sm mb-6">{error}</p>
          <button
            onClick={fetchDashboard}
            className="bg-blue-500 hover:bg-blue-600 text-white font-mono text-xs font-bold py-2.5 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Thử lại
          </button>
        </div>
      </AdminLayout>
    );
  }

  const { summary, topStories, revenue, recentActivities, attention } = data || {};

  // KPI Cards Configuration
  const kpiCards = [
    {
      title: 'Tổng số Truyện',
      value: summary?.totalStories?.toLocaleString('vi-VN') || '0',
      icon: 'menu_book',
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    },
    {
      title: 'Tổng số Chương',
      value: summary?.totalChapters?.toLocaleString('vi-VN') || '0',
      icon: 'description',
      color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
    },
    {
      title: 'Tổng người dùng',
      value: summary?.totalUsers?.toLocaleString('vi-VN') || '0',
      icon: 'group',
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'VIP Users Hoạt động',
      value: summary?.activeVipUsers?.toLocaleString('vi-VN') || '0',
      icon: 'workspace_premium',
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    },
    {
      title: 'Tổng lượt đọc',
      value: summary?.totalViews?.toLocaleString('vi-VN') || '0',
      icon: 'visibility',
      color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    },
    {
      title: 'Tổng doanh thu',
      value: `${summary?.totalRevenue?.toLocaleString('vi-VN') || '0'} đ`,
      icon: 'payments',
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    },
    {
      title: 'User mới (7 ngày)',
      value: summary?.newUsersLast7Days?.toLocaleString('vi-VN') || '0',
      icon: 'person_add',
      color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-400',
      trend: summary?.userGrowthPercent,
    },
    {
      title: 'Truyện mới (7 ngày)',
      value: summary?.newStoriesLast7Days?.toLocaleString('vi-VN') || '0',
      icon: 'library_add',
      color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
      trend: summary?.storyGrowthPercent,
    },
  ];

  // Chart.js Configuration for Reading Statistics
  const readingChartData = {
    labels: readingStats.map((item) => item.date?.slice(5) || item.date),
    datasets: [
      {
        label: 'Lượt đọc',
        data: readingStats.map((item) => item.views),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const readingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#60a5fa',
        bodyColor: '#f8fafc',
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString('vi-VN')} lượt đọc`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#1e293b' },
        ticks: { color: '#94a3b8', font: { family: 'monospace', size: 11 } },
      },
      y: {
        grid: { color: '#334155', strokeDashArray: 3 },
        ticks: { color: '#94a3b8', font: { family: 'monospace', size: 11 } },
        beginAtZero: true,
      },
    },
  };

  // Chart.js Configuration for Revenue Statistics
  const revenueChartData = {
    labels: revenueStats.map((item) => item.date?.slice(5) || item.date),
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: revenueStats.map((item) => item.amount),
        backgroundColor: 'rgba(168, 85, 247, 0.65)',
        borderColor: '#a855f7',
        borderWidth: 1.5,
        borderRadius: 4,
        hoverBackgroundColor: '#c084fc',
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#c084fc',
        bodyColor: '#f8fafc',
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString('vi-VN')} VNĐ`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#1e293b' },
        ticks: { color: '#94a3b8', font: { family: 'monospace', size: 11 } },
      },
      y: {
        grid: { color: '#334155' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'monospace', size: 11 },
          callback: (value) => `${(value / 1000).toLocaleString('vi-VN')}k`,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-sans text-3xl font-bold text-slate-100">Dashboard Thống Kê System</h1>
            <p className="font-sans text-sm text-slate-400 mt-1">
              Tổng quan tình hình hoạt động, doanh thu và nội dung trên hệ thống StoryWorld
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-2 self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Làm mới
          </button>
        </div>

        {/* Section A: KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${card.color} border rounded-xl p-5 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-medium">
                  {card.title}
                </span>
                <span className="material-symbols-outlined text-2xl opacity-80">{card.icon}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-sans text-2xl font-extrabold text-slate-100">{card.value}</span>
                {card.trend !== undefined && (
                  <span
                    className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${
                      card.trend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {card.trend >= 0 ? `+${card.trend}%` : `${card.trend}%`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section: Reading & Revenue Charts side-by-side or stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Reading Statistics (Chart.js Line) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-sans text-lg font-bold text-slate-100">Thống Kê Lượt Đọc</h2>
                <p className="font-sans text-xs text-slate-400 mt-0.5">Xu hướng đọc truyện của độc giả (Chart.js)</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 self-start sm:self-auto">
                {[
                  { label: '7 ngày', value: '7d' },
                  { label: '30 ngày', value: '30d' },
                  { label: '3 tháng', value: '90d' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleReadingPeriodChange(item.value)}
                    className={`font-mono text-xs px-3 py-1 rounded-md transition-all ${
                      readingPeriod === item.value
                        ? 'bg-blue-500 text-white font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 relative w-full">
              {readingLoading ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                </div>
              ) : (
                <Line data={readingChartData} options={readingChartOptions} />
              )}
            </div>
          </div>

          {/* Chart 2: Revenue Statistics (Chart.js Bar) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-sans text-lg font-bold text-slate-100">Thống Kê Doanh Thu</h2>
                <p className="font-sans text-xs text-slate-400 mt-0.5">Biểu đồ biến động doanh thu gói VIP (Chart.js)</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 self-start sm:self-auto">
                {[
                  { label: '7 ngày', value: '7d' },
                  { label: '30 ngày', value: '30d' },
                  { label: '3 tháng', value: '90d' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleRevenuePeriodChange(item.value)}
                    className={`font-mono text-xs px-3 py-1 rounded-md transition-all ${
                      revenuePeriod === item.value
                        ? 'bg-purple-600 text-white font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 relative w-full">
              {revenueLoading ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                </div>
              ) : (
                <Bar data={revenueChartData} options={revenueChartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Section C & D: Top Stories & Revenue Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Stories (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-sans text-lg font-bold text-slate-100">Top 5 Truyện Lượt Đọc Cao Nhất</h2>
                <p className="font-sans text-xs text-slate-400 mt-0.5">Danh sách truyện được quan tâm nhất</p>
              </div>
              <Link
                to="/admin/stories"
                className="font-mono text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                Quản lý truyện
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            {topStories && topStories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-xs uppercase">
                      <th className="pb-3 px-2">#</th>
                      <th className="pb-3">Truyện</th>
                      <th className="pb-3 text-right">Lượt đọc</th>
                      <th className="pb-3 text-right">Yêu thích</th>
                      <th className="pb-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans text-sm">
                    {topStories.map((story, rank) => (
                      <tr key={story.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-2 font-mono font-bold">
                          {rank === 0 && <span className="text-amber-400 text-base">🥇</span>}
                          {rank === 1 && <span className="text-slate-300 text-base">🥈</span>}
                          {rank === 2 && <span className="text-amber-600 text-base">🥉</span>}
                          {rank > 2 && <span className="text-slate-500">#{rank + 1}</span>}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={story.coverImageUrl ? (story.coverImageUrl.startsWith('http') ? story.coverImageUrl : `http://localhost:8080${story.coverImageUrl}`) : '/logo.png'}
                              alt={story.title}
                              className="w-9 h-12 object-cover rounded shadow"
                            />
                            <div>
                              <Link
                                to={`/admin/stories/${story.id}`}
                                className="font-semibold text-slate-100 hover:text-blue-400 transition-colors line-clamp-1"
                              >
                                {story.title}
                              </Link>
                              <span className="text-xs text-slate-400 block">{story.authorName || 'Chưa rõ'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-cyan-400">
                          {story.viewCount?.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 text-right font-mono text-slate-300">
                          {story.favoritesCount?.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              story.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {story.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang ra'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">Chưa có dữ liệu truyện</div>
            )}
          </div>

          {/* Revenue Summary (1 col) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sans text-lg font-bold text-slate-100">Tóm Tắt Doanh Thu</h2>
                <span className="material-symbols-outlined text-purple-400">payments</span>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-800/70 border border-slate-700/60 rounded-lg p-4">
                  <span className="font-mono text-xs uppercase text-slate-400">Hôm nay</span>
                  <div className="font-sans text-xl font-extrabold text-slate-100 mt-1">
                    {revenue?.today?.toLocaleString('vi-VN') || 0} đ
                  </div>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/60 rounded-lg p-4">
                  <span className="font-mono text-xs uppercase text-slate-400">7 ngày qua</span>
                  <div className="font-sans text-xl font-extrabold text-purple-300 mt-1">
                    {revenue?.last7Days?.toLocaleString('vi-VN') || 0} đ
                  </div>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/60 rounded-lg p-4">
                  <span className="font-mono text-xs uppercase text-slate-400">30 ngày qua</span>
                  <div className="font-sans text-xl font-extrabold text-purple-400 mt-1">
                    {revenue?.last30Days?.toLocaleString('vi-VN') || 0} đ
                  </div>
                </div>

                <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                  <span className="font-mono text-xs uppercase text-purple-300 font-bold">Tổng tích lũy</span>
                  <div className="font-sans text-2xl font-black text-purple-200 mt-1">
                    {revenue?.total?.toLocaleString('vi-VN') || 0} đ
                  </div>
                </div>
              </div>
            </div>
            <Link
              to="/admin/vip"
              className="mt-6 w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold py-2.5 px-4 rounded-lg transition-colors inline-block"
            >
              Quản lý gói VIP & Giao dịch
            </Link>
          </div>
        </div>

        {/* Section E & F: Recent Activities & Need Attention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="font-sans text-lg font-bold text-slate-100 mb-4">Hoạt Động Gần Đây</h2>
            {recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((act, index) => {
                  let icon = 'notifications';
                  let iconColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';

                  if (act.type === 'USER_REGISTERED') {
                    icon = 'person_add';
                    iconColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  } else if (act.type === 'VIP_PURCHASED') {
                    icon = 'workspace_premium';
                    iconColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                  } else if (act.type === 'STORY_CREATED') {
                    icon = 'menu_book';
                    iconColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
                  } else if (act.type === 'CHAPTER_CREATED') {
                    icon = 'post_add';
                    iconColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
                  }

                  return (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                      <div className={`p-2 rounded-lg border ${iconColor} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-lg">{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-slate-200">{act.description}</p>
                        <span className="font-mono text-[11px] text-slate-400 mt-1 block">
                          {act.timestamp ? new Date(act.timestamp).toLocaleString('vi-VN') : ''}
                        </span>
                      </div>
                      {act.targetUrl && (
                        <Link
                          to={act.targetUrl}
                          className="text-slate-400 hover:text-blue-400 transition-colors p-1"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 font-mono text-sm">Chưa có hoạt động mới</div>
            )}
          </div>

          {/* Need Attention */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="font-sans text-lg font-bold text-slate-100 mb-4">Cần Xử Lý Ngay</h2>
            {attention && attention.length > 0 ? (
              <div className="space-y-4">
                {attention.map((item, index) => {
                  let alertBg = 'bg-amber-500/10 border-amber-500/30 text-amber-300';
                  let icon = 'warning';

                  if (item.severity === 'DANGER') {
                    alertBg = 'bg-rose-500/10 border-rose-500/30 text-rose-300';
                    icon = 'error';
                  } else if (item.severity === 'INFO') {
                    alertBg = 'bg-blue-500/10 border-blue-500/30 text-blue-300';
                    icon = 'info';
                  }

                  return (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-xl border ${alertBg}`}>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl shrink-0">{icon}</span>
                        <div>
                          <p className="font-sans text-sm font-semibold">{item.message}</p>
                          <span className="font-mono text-xs opacity-80">Cần Admin kiểm tra và cập nhật</span>
                        </div>
                      </div>
                      {item.targetUrl && (
                        <Link
                          to={item.targetUrl}
                          className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 transition-colors shrink-0"
                        >
                          Xử lý
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-emerald-400 font-mono text-sm flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                Hệ thống ổn định! Không có vấn đề tồn đọng cần xử lý.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
