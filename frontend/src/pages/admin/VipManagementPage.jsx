import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import Pagination from '../../components/admin/Pagination'
import { userService } from '../../services/userService'
import { vipPackageService } from '../../services/vipPackageService'
import { coinService } from '../../services/coinService'
import { useConfirm } from '../../contexts/ConfirmDialog'

const ITEMS_PER_PAGE = 10

export default function VipManagementPage() {
  const confirm = useConfirm()

  const [activeTab, setActiveTab] = useState('PACKAGES') // 'PACKAGES' | 'USERS'

  // VIP Packages State
  const [packages, setPackages] = useState([])
  const [isLoadingPackages, setIsLoadingPackages] = useState(true)
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    price: 39000,
    durationDays: 30,
    isActive: true,
  })
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false)

  // Users VIP State
  const [users, setUsers] = useState([])
  const [allUsersForStats, setAllUsersForStats] = useState([])
  const [search, setSearch] = useState('')
  const [vipFilter, setVipFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState(null)

  // Custom Grant VIP Modal
  const [grantVipModalUser, setGrantVipModalUser] = useState(null)
  const [selectedPackageId, setSelectedPackageId] = useState(null)

  // Coins Top-up Modal
  const [coinsModalUser, setCoinsModalUser] = useState(null)
  const [newCoinsAmount, setNewCoinsAmount] = useState(0)

  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // --- Load Packages ---
  const loadPackages = async () => {
    try {
      setIsLoadingPackages(true)
      const res = await vipPackageService.getAllAdminPackages()
      setPackages(res.data || [])
    } catch (error) {
      console.error('Lỗi khi tải gói VIP:', error)
      setToast({
        type: 'error',
        message: 'Không thể tải danh sách gói VIP.',
      })
    } finally {
      setIsLoadingPackages(false)
    }
  }

  // --- Load Users ---
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true)

      const params = {}
      if (search.trim()) params.search = search.trim()
      if (vipFilter === 'VIP') params.isVip = true
      if (vipFilter === 'REGULAR') params.isVip = false

      const [filteredRes, statsRes] = await Promise.all([
        userService.getAdminUsers(params),
        userService.getAdminUsers(search.trim() ? { search: search.trim() } : {}),
      ])

      setUsers(filteredRes.data || [])
      setAllUsersForStats(statsRes.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error)
      setToast({
        type: 'error',
        message: error?.response?.data?.message || 'Không thể tải danh sách người dùng.',
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadPackages()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, vipFilter])

  // Overview stats
  const stats = useMemo(() => {
    const total = allUsersForStats.length
    const vipCount = allUsersForStats.filter((u) => u.isVip).length
    const regularCount = total - vipCount
    return { total, vipCount, regularCount }
  }, [allUsersForStats])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, vipFilter])

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE) || 1
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return users.slice(start, start + ITEMS_PER_PAGE)
  }, [users, currentPage])

  // --- Package Form Actions ---
  const handleOpenPackageModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg)
      setPackageForm({
        name: pkg.name || '',
        description: pkg.description || '',
        price: pkg.price || 0,
        durationDays: pkg.durationDays || 30,
        isActive: pkg.isActive ?? true,
      })
    } else {
      setEditingPackage(null)
      setPackageForm({
        name: '',
        description: '',
        price: 39000,
        durationDays: 30,
        isActive: true,
      })
    }
    setIsPackageModalOpen(true)
  }

  const handleSavePackage = async (e) => {
    e.preventDefault()
    if (!packageForm.name.trim()) {
      setToast({ type: 'error', message: 'Tên gói VIP không được để trống.' })
      return
    }

    try {
      setIsSubmittingPackage(true)
      if (editingPackage) {
        await vipPackageService.updatePackage(editingPackage.id, packageForm)
        setToast({ type: 'success', message: `Đã cập nhật gói VIP "${packageForm.name}".` })
      } else {
        await vipPackageService.createPackage(packageForm)
        setToast({ type: 'success', message: `Đã tạo mới gói VIP "${packageForm.name}".` })
      }
      setIsPackageModalOpen(false)
      loadPackages()
    } catch (error) {
      console.error('Lỗi khi lưu gói VIP:', error)
      setToast({
        type: 'error',
        message: error?.response?.data?.message || 'Lưu gói VIP thất bại.',
      })
    } finally {
      setIsSubmittingPackage(false)
    }
  }

  const handleTogglePackage = async (pkg) => {
    try {
      await vipPackageService.togglePackageStatus(pkg.id)
      setToast({
        type: 'success',
        message: `Đã ${pkg.isActive ? 'tắt' : 'bật'} trạng thái gói "${pkg.name}".`,
      })
      loadPackages()
    } catch (error) {
      console.error('Lỗi khi đổi trạng thái gói:', error)
      setToast({ type: 'error', message: 'Đổi trạng thái gói thất bại.' })
    }
  }

  const handleDeletePackage = async (pkg) => {
    const confirmed = await confirm({
      title: 'Xác nhận XÓA GÓI VIP',
      message: `Bạn có chắc chắn muốn xóa gói VIP "${pkg.name}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa gói',
      cancelText: 'Hủy',
      type: 'error',
    })

    if (!confirmed) return

    try {
      await vipPackageService.deletePackage(pkg.id)
      setToast({ type: 'success', message: `Đã xóa gói VIP "${pkg.name}".` })
      loadPackages()
    } catch (error) {
      console.error('Lỗi khi xóa gói VIP:', error)
      setToast({ type: 'error', message: 'Xóa gói VIP thất bại.' })
    }
  }

  // --- Grant VIP Actions ---
  const handleOpenGrantModal = (user) => {
    setGrantVipModalUser(user)
    const activePkgs = packages.filter((p) => p.isActive)
    if (activePkgs.length > 0) {
      setSelectedPackageId(activePkgs[0].id)
    } else if (packages.length > 0) {
      setSelectedPackageId(packages[0].id)
    } else {
      setSelectedPackageId(null)
    }
  }

  const handleConfirmGrantVip = async () => {
    if (!grantVipModalUser) return
    if (!selectedPackageId) {
      setToast({ type: 'error', message: 'Vui lòng chọn 1 gói VIP để cấp cho người dùng.' })
      return
    }

    const name = grantVipModalUser.displayName || grantVipModalUser.username
    const chosenPkg = packages.find((p) => p.id === selectedPackageId)

    try {
      setUpdatingUserId(grantVipModalUser.id)
      await userService.updateVipStatus(grantVipModalUser.id, true, selectedPackageId, null)

      setToast({
        type: 'success',
        message: `Đã cấp gói VIP "${chosenPkg?.name || 'mới'}" cho "${name}".`,
      })
      setGrantVipModalUser(null)
      await loadUsers()
    } catch (error) {
      console.error('Lỗi khi cấp VIP:', error)
      setToast({
        type: 'error',
        message: error?.response?.data?.message || 'Cấp VIP thất bại. Vui lòng thử lại.',
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  // --- Coins Top-up Actions ---
  const handleOpenCoinsModal = (user) => {
    setCoinsModalUser(user)
    setNewCoinsAmount(user.coins || 0)
  }

  const handleConfirmUpdateCoins = async () => {
    if (!coinsModalUser) return
    const name = coinsModalUser.displayName || coinsModalUser.username
    try {
      setUpdatingUserId(coinsModalUser.id)
      await coinService.adminUpdateUserCoins(coinsModalUser.id, Number(newCoinsAmount))
      setToast({
        type: 'success',
        message: `Đã cập nhật số dư Xu của "${name}" thành ${newCoinsAmount} xu.`,
      })
      setCoinsModalUser(null)
      await loadUsers()
    } catch (error) {
      console.error('Lỗi khi cập nhật xu:', error)
      setToast({
        type: 'error',
        message: error?.response?.data?.message || 'Cập nhật Xu thất bại.',
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleRevokeVip = async (user) => {
    const name = user.displayName || user.username
    const confirmed = await confirm({
      title: 'Xác nhận THU HỒI VIP',
      message: `Bạn có chắc chắn muốn THU HỒI quyền VIP của tài khoản "${name}" (${user.email})?`,
      confirmText: 'Thu hồi VIP',
      cancelText: 'Hủy',
      type: 'error',
    })

    if (!confirmed) return

    try {
      setUpdatingUserId(user.id)
      await userService.updateVipStatus(user.id, false, 0)

      setToast({
        type: 'success',
        message: `Đã thu hồi quyền VIP của tài khoản "${name}".`,
      })
      await loadUsers()
    } catch (error) {
      console.error('Lỗi khi thu hồi VIP:', error)
      setToast({
        type: 'error',
        message: error?.response?.data?.message || 'Thu hồi VIP thất bại. Vui lòng thử lại.',
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa ghi nhận'
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } catch {
      return dateString
    }
  }

  return (
    <AdminLayout>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="font-sans text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header & Main Tabs */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <span className="material-symbols-outlined text-3xl">workspace_premium</span>
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-100">
                Quản lý VIP & Gói Dịch Vụ
              </h2>
              <p className="font-sans text-sm text-slate-400 mt-1">
                Cấu hình danh sách các gói VIP (giá, thời hạn), xem và cấp VIP người dùng.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switch Buttons */}
        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('PACKAGES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-all ${
              activeTab === 'PACKAGES'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">subscriptions</span>
            Danh sách Gói VIP ({packages.length})
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-all ${
              activeTab === 'USERS'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            VIP Người dùng ({stats.vipCount})
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TAB 1: QUẢN LÝ GÓI VIP */}
      {/* ========================================================================= */}
      {activeTab === 'PACKAGES' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-100">Các gói VIP hiển thị trên hệ thống</h3>
              <p className="text-xs text-slate-400 mt-0.5">Admin có thể thêm mới, sửa giá tiền, số ngày sử dụng hoặc tạm ẩn gói.</p>
            </div>
            <button
              onClick={() => handleOpenPackageModal(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Tạo gói VIP mới
            </button>
          </div>

          {isLoadingPackages ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-amber-400 block mb-3 animate-spin">
                progress_activity
              </span>
              <p className="font-sans text-base text-slate-400">Đang tải danh sách gói VIP...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-600 block mb-3">
                card_membership
              </span>
              <p className="font-serif text-lg font-semibold text-slate-200 mb-1">Chưa có gói VIP nào</p>
              <p className="font-sans text-sm text-slate-400 mb-4">Hãy bấm "Tạo gói VIP mới" để cấu hình gói dịch vụ cho độc giả.</p>
              <button
                onClick={() => handleOpenPackageModal(null)}
                className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
              >
                + Tạo gói đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-slate-800 rounded-xl border transition-all p-6 relative flex flex-col justify-between ${
                    pkg.isActive
                      ? 'border-amber-500/40 shadow-xl shadow-amber-500/5'
                      : 'border-slate-700 opacity-60'
                  }`}
                >
                  {/* Badge Active / Hidden */}
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold ${
                        pkg.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400 border border-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {pkg.isActive ? 'check_circle' : 'visibility_off'}
                      </span>
                      {pkg.isActive ? 'ĐANG KÍCH HOẠT' : 'ĐÃ ẨN'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenPackageModal(pkg)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Chỉnh sửa gói"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleTogglePackage(pkg)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title={pkg.isActive ? 'Tắt gói' : 'Bật gói'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {pkg.isActive ? 'toggle_on' : 'toggle_off'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Xóa gói"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Package Name & Price */}
                  <div>
                    <h4 className="font-serif text-xl font-bold text-slate-100 mb-1">{pkg.name}</h4>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{pkg.description || 'Không có mô tả.'}</p>

                    <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/60 mb-4">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-mono text-xs text-slate-400">Giá gói:</span>
                        <span className="font-serif text-xl font-bold text-amber-400">
                          {pkg.price?.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400">Thời hạn:</span>
                        <span className="font-mono font-semibold text-slate-200">{pkg.durationDays} ngày</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-700/50 flex justify-between">
                    <span>ID: #{pkg.id}</span>
                    <span>Tạo: {formatDate(pkg.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VIP NGƯỜI DÙNG */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && (
        <div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <span className="material-symbols-outlined text-2xl">group</span>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Tổng số người dùng</p>
                <p className="font-serif text-2xl font-bold text-slate-100 mt-1">{stats.total}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-amber-950/20 rounded-xl border border-amber-500/30 p-5 flex items-center gap-4 shadow-lg shadow-amber-500/5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
                <span className="material-symbols-outlined text-2xl">stars</span>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-amber-300/80">VIP Active</p>
                <p className="font-serif text-2xl font-bold text-amber-300 mt-1">{stats.vipCount}</p>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Tài khoản Thường</p>
                <p className="font-serif text-2xl font-bold text-slate-100 mt-1">{stats.regularCount}</p>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo Tên, Username hoặc Email..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-9 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400 mr-2 shrink-0">Lọc VIP:</span>
              <button
                onClick={() => setVipFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
                  vipFilter === 'ALL'
                    ? 'bg-blue-400 text-slate-950 font-bold shadow-md shadow-blue-400/20'
                    : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
                }`}
              >
                Tất cả ({stats.total})
              </button>
              <button
                onClick={() => setVipFilter('VIP')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                  vipFilter === 'VIP'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                VIP ({stats.vipCount})
              </button>
              <button
                onClick={() => setVipFilter('REGULAR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
                  vipFilter === 'REGULAR'
                    ? 'bg-slate-700 text-slate-100 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
                }`}
              >
                Thường ({stats.regularCount})
              </button>
            </div>
          </div>

          {/* Users Table */}
          {isLoadingUsers ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-blue-400 block mb-3 animate-spin">
                progress_activity
              </span>
              <p className="font-sans text-base text-slate-400">Đang tải danh sách người dùng...</p>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-600 block mb-3">
                person_off
              </span>
              <p className="font-serif text-lg font-semibold text-slate-200 mb-1">Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-700">
                      <th className="py-4 px-6 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">Người dùng</th>
                      <th className="py-4 px-6 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                      <th className="py-4 px-6 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">Số dư Xu</th>
                      <th className="py-4 px-6 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái VIP</th>
                      <th className="py-4 px-6 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">Thời hạn hết hạn</th>
                      <th className="py-4 px-6 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {paginatedUsers.map((user) => {
                      const avatarUrl = userService.buildAvatarUrl(user.avatar)
                      const isUpdating = updatingUserId === user.id

                      return (
                        <tr key={user.id} className="hover:bg-slate-750 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={avatarUrl}
                                alt={user.displayName || user.username}
                                className="w-10 h-10 rounded-full object-cover border border-slate-600 bg-slate-900 shrink-0"
                                onError={(e) => {
                                  e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.username) + '&background=1e293b&color=94a3b8'
                                }}
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                                  {user.displayName || user.username}
                                </p>
                                <p className="font-mono text-xs text-slate-400 truncate">@{user.username}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 font-mono text-sm text-slate-300">{user.email || 'N/A'}</td>

                          <td className="py-4 px-6 font-mono text-sm font-bold text-amber-400">
                            🪙 {user.coins?.toLocaleString('vi-VN') || 0} xu
                          </td>

                          <td className="py-4 px-6">
                            {user.isVip ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                                <span className="material-symbols-outlined text-[16px] text-amber-400">workspace_premium</span>
                                VIP ACTIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-mono text-xs text-slate-400 bg-slate-900 border border-slate-700">
                                Thường
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 font-mono text-xs text-slate-300">
                            {user.vipExpirationDate ? (
                              <span className="text-amber-300 font-semibold">{formatDate(user.vipExpirationDate)}</span>
                            ) : user.isVip ? (
                              <span className="text-emerald-400">Vĩnh viễn / Không hạn</span>
                            ) : (
                              <span className="text-slate-500">Chưa có</span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenCoinsModal(user)}
                                disabled={isUpdating}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
                                title="Đổi số dư xu người dùng"
                              >
                                🪙 Đổi Xu
                              </button>

                              {user.isVip ? (
                                <>
                                  <button
                                    onClick={() => handleOpenGrantModal(user)}
                                    disabled={isUpdating}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                                    title="Gia hạn thêm VIP"
                                  >
                                    + Gia hạn
                                  </button>
                                  <button
                                    onClick={() => handleRevokeVip(user)}
                                    disabled={isUpdating}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
                                    title="Thu hồi VIP"
                                  >
                                    Thu hồi
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleOpenGrantModal(user)}
                                  disabled={isUpdating}
                                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all shadow-md shadow-amber-500/20"
                                >
                                  Cấp VIP...
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {users.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={users.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT PACKAGE */}
      {/* ========================================================================= */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-slate-100">
                {editingPackage ? 'Chỉnh sửa Gói VIP' : 'Thêm mới Gói VIP'}
              </h3>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-1">
                  Tên gói VIP *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Gói VIP 1 Tháng"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-1">
                  Mô tả gói
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả quyền lợi gói..."
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-1">
                    Giá gói (VNĐ) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-1">
                    Thời hạn (Số ngày) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={packageForm.durationDays}
                    onChange={(e) => setPackageForm({ ...packageForm, durationDays: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={packageForm.isActive}
                  onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="isActiveToggle" className="text-sm text-slate-200 cursor-pointer">
                  Kích hoạt gói này (cho phép người dùng mua)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-mono font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPackage}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-bold rounded-xl shadow-lg shadow-amber-400/20 disabled:opacity-50"
                >
                  {isSubmittingPackage ? 'Đang lưu...' : 'Lưu Gói VIP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GRANT VIP PACKAGE */}
      {/* ========================================================================= */}
      {grantVipModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="font-serif text-xl font-bold text-slate-100 mb-2">
              Cấp / Gia hạn VIP cho người dùng
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Tài khoản: <strong className="text-slate-200">{grantVipModalUser.displayName || grantVipModalUser.username}</strong> ({grantVipModalUser.email})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-2">
                  Chọn Gói VIP để áp dụng:
                </label>

                {packages.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 mb-2">Chưa có gói VIP nào được cấu hình trong hệ thống.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setGrantVipModalUser(null)
                        setActiveTab('PACKAGES')
                        handleOpenPackageModal(null)
                      }}
                      className="text-xs text-amber-400 hover:underline font-bold"
                    >
                      + Tạo gói VIP mới ngay
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-400/10 border-amber-400 text-amber-300 shadow-md shadow-amber-400/10'
                              : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-100">{pkg.name}</span>
                              {!pkg.isActive && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  ĐÃ ẨN
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">
                              Giá: {pkg.price?.toLocaleString('vi-VN')} VNĐ
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                              +{pkg.durationDays} ngày
                            </span>
                            <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-amber-400' : 'text-slate-600'}`}>
                              {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setGrantVipModalUser(null)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 text-xs font-mono font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGrantVip}
                  disabled={!selectedPackageId}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-bold rounded-xl shadow-lg shadow-amber-400/20 disabled:opacity-50"
                >
                  Xác nhận Cấp VIP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: UPDATE USER COINS */}
      {/* ========================================================================= */}
      {coinsModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="font-serif text-xl font-bold text-slate-100 mb-2">
              🪙 Đổi số dư Xu người dùng
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Tài khoản: <strong className="text-slate-200">{coinsModalUser.displayName || coinsModalUser.username}</strong> ({coinsModalUser.email})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-2">
                  Nhập số dư Xu mới:
                </label>
                <input
                  type="number"
                  min={0}
                  value={newCoinsAmount}
                  onChange={(e) => setNewCoinsAmount(Number(e.target.value))}
                  placeholder="Nhập số xu mới..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50 font-mono text-lg font-bold text-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setCoinsModalUser(null)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 text-xs font-mono font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpdateCoins}
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-mono font-bold rounded-xl shadow-lg shadow-blue-500/20"
                >
                  Lưu số dư Xu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
