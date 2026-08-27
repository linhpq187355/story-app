import { useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { importService } from '../../services/importService'

export default function AdminImportPage() {
  const [step, setStep] = useState(1) // 1: Upload, 2: Preview & Policies, 3: Result
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)

  // Preview State
  const [previewData, setPreviewData] = useState(null)
  const [activeTab, setActiveTab] = useState('summary') // 'summary', 'stories', 'chapters', 'errors'

  // Policies State
  const [storyPolicy, setStoryPolicy] = useState('KEEP') // KEEP, UPDATE
  const [chapterPolicy, setChapterPolicy] = useState('SKIP') // SKIP, UPDATE
  const [isCommitting, setIsCommitting] = useState(false)

  // Commit Result State
  const [commitResult, setCommitResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  // Handle Download Template
  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true)
      const blob = await importService.downloadTemplate()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'story_import_template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Lỗi tải file mẫu:', error)
      alert('Không thể tải file mẫu Excel. Vui lòng thử lại sau.')
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  // File Drop / Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        setErrorMessage('Chỉ chấp nhận file Excel định dạng .xlsx')
        return
      }
      setErrorMessage('')
      setSelectedFile(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        setErrorMessage('Chỉ chấp nhận file Excel định dạng .xlsx')
        return
      }
      setErrorMessage('')
      setSelectedFile(file)
    }
  }

  // Handle Validate / Preview
  const handleValidateFile = async () => {
    if (!selectedFile) {
      setErrorMessage('Vui lòng chọn 1 file Excel (.xlsx) trước khi tiếp tục.')
      return
    }

    try {
      setIsUploading(true)
      setErrorMessage('')
      const data = await importService.previewImport(selectedFile)
      setPreviewData(data)

      if (data.errors && data.errors.length > 0) {
        setActiveTab('errors')
      } else {
        setActiveTab('summary')
      }
      setStep(2)
    } catch (error) {
      console.error('Lỗi đọc preview file:', error)
      const msg = error?.response?.data?.message || 'Không thể đọc và kiểm tra file Excel. Vui lòng kiểm tra lại định dạng file.'
      setErrorMessage(msg)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle Commit Import
  const handleCommitImport = async () => {
    if (!previewData || !previewData.importId) return

    try {
      setIsCommitting(true)
      setErrorMessage('')
      const payload = {
        importId: previewData.importId,
        storyPolicy,
        chapterPolicy,
      }
      const result = await importService.commitImport(payload)
      setCommitResult(result)
      setStep(3)
    } catch (error) {
      console.error('Lỗi nhập dữ liệu:', error)
      const msg = error?.response?.data?.message || 'Có lỗi xảy ra trong quá trình nhập dữ liệu. Vui lòng thử lại.'
      setErrorMessage(msg)
    } finally {
      setIsCommitting(false)
    }
  }

  // Reset Form
  const handleReset = () => {
    setStep(1)
    setSelectedFile(null)
    setPreviewData(null)
    setCommitResult(null)
    setErrorMessage('')
    setStoryPolicy('KEEP')
    setChapterPolicy('SKIP')
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-sans text-3xl font-bold text-slate-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400 text-3xl">file_upload</span>
              Import Truyện & Chương Từ Excel
            </h1>
            <p className="font-sans text-sm text-slate-400 mt-1">
              Tính năng nhập hàng loạt Truyện và Chương từ file Excel (.xlsx) với cơ chế kiểm tra lỗi và xem trước an toàn.
            </p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
            className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-400/30 font-mono text-xs font-bold py-2.5 px-4 rounded-lg transition-all flex items-center gap-2 self-start sm:self-auto shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            {isDownloadingTemplate ? 'Đang tạo template...' : 'Tải File Mẫu (.xlsx)'}
          </button>
        </header>

        {/* Wizard Steps Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${step >= 1 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm border ${step >= 1 ? 'bg-blue-400/10 border-blue-400 text-blue-400' : 'border-slate-700 text-slate-500'}`}>
              1
            </span>
            <span className="font-mono text-xs uppercase tracking-wider hidden md:inline">1. Chọn & Kiểm tra File</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-800 mx-4" />
          <div className={`flex items-center gap-3 ${step >= 2 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm border ${step >= 2 ? 'bg-blue-400/10 border-blue-400 text-blue-400' : 'border-slate-700 text-slate-500'}`}>
              2
            </span>
            <span className="font-mono text-xs uppercase tracking-wider hidden md:inline">2. Xem Trước & Cấu Hình Policy</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-800 mx-4" />
          <div className={`flex items-center gap-3 ${step >= 3 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm border ${step >= 3 ? 'bg-blue-400/10 border-blue-400 text-blue-400' : 'border-slate-700 text-slate-500'}`}>
              3
            </span>
            <span className="font-mono text-xs uppercase tracking-wider hidden md:inline">3. Kết Quả Nhập Dữ Liệu</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-start gap-3">
            <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">error</span>
            <div className="flex-1">
              <p className="font-bold">Lỗi xử lý</p>
              <p className="font-sans text-xs mt-0.5 text-slate-300">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* STEP 1: UPLOAD FILE */}
        {step === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragOver ? 'border-blue-400 bg-blue-400/5' : selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
              onClick={() => document.getElementById('excel-file-input').click()}
            >
              <input
                type="file"
                id="excel-file-input"
                accept=".xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className={`material-symbols-outlined text-5xl ${selectedFile ? 'text-emerald-400' : 'text-slate-400'}`}>
                {selectedFile ? 'task_alt' : 'cloud_upload'}
              </span>
              <div>
                <p className="font-sans text-base font-bold text-slate-100">
                  {selectedFile ? selectedFile.name : 'Kéo thả file .xlsx vào đây hoặc bấm để chọn file'}
                </p>
                <p className="font-sans text-xs text-slate-400 mt-1">
                  {selectedFile ? `Kích thước: ${(selectedFile.size / 1024).toFixed(1)} KB` : 'Định dạng được hỗ trợ: Excel 2007+ (.xlsx), tối đa 10MB'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span className="material-symbols-outlined text-sm">help_outline</span>
                Chưa có file mẫu? Tải tại đây
              </button>

              <button
                onClick={handleValidateFile}
                disabled={!selectedFile || isUploading}
                className="bg-blue-400 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-mono text-sm font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-400/20 transition-all flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">hourglass_empty</span>
                    Đang kiểm tra & phân tích...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">find_in_page</span>
                    Xem Trước & Kiểm Tra File
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & POLICIES */}
        {step === 2 && previewData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Truyện Mới</p>
                <p className="font-sans text-2xl font-bold text-emerald-400 mt-1">{previewData.summary?.newStories || 0}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Truyện Đã Có</p>
                <p className="font-sans text-2xl font-bold text-amber-400 mt-1">{previewData.summary?.existingStories || 0}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Trùng Tên</p>
                <p className="font-sans text-2xl font-bold text-purple-400 mt-1">{previewData.summary?.possibleDuplicateStories || 0}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Chương Mới</p>
                <p className="font-sans text-2xl font-bold text-emerald-400 mt-1">{previewData.summary?.newChapters || 0}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Chương Đã Có</p>
                <p className="font-sans text-2xl font-bold text-amber-400 mt-1">{previewData.summary?.existingChapters || 0}</p>
              </div>
              <div className={`bg-slate-900 border rounded-xl p-4 text-center ${previewData.summary?.errors > 0 ? 'border-red-500/50 bg-red-500/5' : 'border-slate-800'}`}>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Tổng Lỗi Lọc</p>
                <p className={`font-sans text-2xl font-bold mt-1 ${previewData.summary?.errors > 0 ? 'text-red-400' : 'text-slate-400'}`}>{previewData.summary?.errors || 0}</p>
              </div>
            </div>

            {/* Validation Errors Notice */}
            {previewData.errors && previewData.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <span className="material-symbols-outlined">warning</span>
                  <span>Phát hiện {previewData.errors.length} lỗi xác thực dữ liệu!</span>
                </div>
                <p className="text-xs text-slate-300">
                  Vui lòng sửa các dòng bị lỗi trong file Excel và bấm "Thử file khác" để upload lại. Không thể tiến hành Commit khi vẫn còn lỗi.
                </p>
                <div className="max-h-60 overflow-y-auto border border-red-500/20 rounded-lg bg-slate-950/50">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-red-950/40 text-red-300 font-mono text-[11px]">
                      <tr>
                        <th className="p-2.5 border-b border-red-500/20">Sheet</th>
                        <th className="p-2.5 border-b border-red-500/20">Dòng</th>
                        <th className="p-2.5 border-b border-red-500/20">Cột</th>
                        <th className="p-2.5 border-b border-red-500/20">Nội dung lỗi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-500/10">
                      {previewData.errors.map((err, idx) => (
                        <tr key={idx} className="hover:bg-red-500/5">
                          <td className="p-2.5 font-mono text-red-400">{err.sheet}</td>
                          <td className="p-2.5 font-mono">Dòng {err.row}</td>
                          <td className="p-2.5 font-mono text-slate-400">{err.column}</td>
                          <td className="p-2.5 text-red-300 font-medium">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Policy Selection Section */}
            {previewData.valid && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                <h3 className="font-sans text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span className="material-symbols-outlined text-purple-400">tune</span>
                  Cấu Hình Xử Lý Trùng Lặp (Conflict Policies)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Story Policy */}
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-5 space-y-3">
                    <h4 className="font-sans text-sm font-bold text-slate-200">1. Chính sách cho Truyện đã tồn tại (Story Policy)</h4>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900/60 cursor-pointer hover:border-slate-600 transition-colors">
                        <input
                          type="radio"
                          name="storyPolicy"
                          value="KEEP"
                          checked={storyPolicy === 'KEEP'}
                          onChange={(e) => setStoryPolicy(e.target.value)}
                          className="mt-1 text-blue-400 focus:ring-0"
                        />
                        <div>
                          <span className="font-sans text-sm font-semibold text-slate-100 block">KEEP (Mặc định)</span>
                          <span className="font-sans text-xs text-slate-400 block mt-0.5">Giữ nguyên thông tin truyện cũ trong CSDL. Chỉ xử lý nhập thêm các chương tương ứng.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900/60 cursor-pointer hover:border-slate-600 transition-colors">
                        <input
                          type="radio"
                          name="storyPolicy"
                          value="UPDATE"
                          checked={storyPolicy === 'UPDATE'}
                          onChange={(e) => setStoryPolicy(e.target.value)}
                          className="mt-1 text-blue-400 focus:ring-0"
                        />
                        <div>
                          <span className="font-sans text-sm font-semibold text-slate-100 block">UPDATE</span>
                          <span className="font-sans text-xs text-slate-400 block mt-0.5">Cập nhật thông tin truyện cũ từ file Excel (tên truyện, tác giả, mô tả, ảnh bìa, trạng thái).</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Chapter Policy */}
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-5 space-y-3">
                    <h4 className="font-sans text-sm font-bold text-slate-200">2. Chính sách cho Chương đã tồn tại (Chapter Policy)</h4>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900/60 cursor-pointer hover:border-slate-600 transition-colors">
                        <input
                          type="radio"
                          name="chapterPolicy"
                          value="SKIP"
                          checked={chapterPolicy === 'SKIP'}
                          onChange={(e) => setChapterPolicy(e.target.value)}
                          className="mt-1 text-blue-400 focus:ring-0"
                        />
                        <div>
                          <span className="font-sans text-sm font-semibold text-slate-100 block">SKIP (Mặc định)</span>
                          <span className="font-sans text-xs text-slate-400 block mt-0.5">Bỏ qua không đè lên các chương đã có. Chỉ chèn thêm các số chương mới.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900/60 cursor-pointer hover:border-slate-600 transition-colors">
                        <input
                          type="radio"
                          name="chapterPolicy"
                          value="UPDATE"
                          checked={chapterPolicy === 'UPDATE'}
                          onChange={(e) => setChapterPolicy(e.target.value)}
                          className="mt-1 text-blue-400 focus:ring-0"
                        />
                        <div>
                          <span className="font-sans text-sm font-semibold text-slate-100 block">UPDATE</span>
                          <span className="font-sans text-xs text-slate-400 block mt-0.5">Ghi đè nội dung tiêu đề và văn bản chương cũ từ file Excel.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Navigation Tabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="flex border-b border-slate-800 bg-slate-950/40">
                <button
                  onClick={() => setActiveTab('stories')}
                  className={`px-6 py-3 font-mono text-xs uppercase font-bold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'stories' ? 'border-blue-400 text-blue-400 bg-blue-400/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">menu_book</span>
                  Xem trước Truyện ({previewData.stories?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`px-6 py-3 font-mono text-xs uppercase font-bold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'chapters' ? 'border-blue-400 text-blue-400 bg-blue-400/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">description</span>
                  Xem trước Chương ({previewData.chapters?.length || 0})
                </button>
              </div>

              <div className="p-5">
                {/* Stories Tab */}
                {activeTab === 'stories' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800 text-slate-400 font-mono">
                        <tr>
                          <th className="p-3">Mã Truyện (external_id)</th>
                          <th className="p-3">Tên Truyện</th>
                          <th className="p-3">Tác giả</th>
                          <th className="p-3">Trạng thái phát hiện</th>
                          <th className="p-3">Ghi chú / Cảnh báo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-sans">
                        {previewData.stories?.map((st, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono font-bold text-blue-400">{st.externalId}</td>
                            <td className="p-3 font-semibold text-slate-100">{st.title}</td>
                            <td className="p-3 text-slate-400">{st.author || 'Chưa rõ'}</td>
                            <td className="p-3">
                              {st.status === 'NEW' && (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
                                  MỚI (NEW)
                                </span>
                              )}
                              {st.status === 'EXISTING' && (
                                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
                                  ĐÃ CÓ (EXISTING)
                                </span>
                              )}
                              {st.status === 'POSSIBLE_DUPLICATE' && (
                                <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
                                  TRÙNG TÊN
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-xs text-amber-400">{st.warningMessage || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Chapters Tab */}
                {activeTab === 'chapters' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800 text-slate-400 font-mono">
                        <tr>
                          <th className="p-3">Mã Truyện</th>
                          <th className="p-3">Số Chương</th>
                          <th className="p-3">Tên Chương</th>
                          <th className="p-3">Truy cập</th>
                          <th className="p-3">Trạng thái phát hiện</th>
                          <th className="p-3">Xem trước nội dung</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-sans">
                        {previewData.chapters?.map((ch, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono font-bold text-blue-400">{ch.externalStoryId}</td>
                            <td className="p-3 font-mono">Chương {ch.chapterNumber}</td>
                            <td className="p-3 font-semibold text-slate-100">{ch.title}</td>
                            <td className="p-3">
                              <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${ch.accessLevel === 'VIP' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>
                                {ch.accessLevel}
                              </span>
                            </td>
                            <td className="p-3">
                              {ch.status === 'NEW' && (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
                                  MỚI
                                </span>
                              )}
                              {ch.status === 'EXISTING' && (
                                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
                                  ĐÃ CÓ
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-slate-400 max-w-xs truncate">{ch.contentSnippet}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm font-bold py-3 px-6 rounded-lg transition-all"
              >
                ← Thử File Khác
              </button>

              {previewData.valid && (
                <button
                  onClick={handleCommitImport}
                  disabled={isCommitting}
                  className="bg-emerald-400 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-mono text-sm font-bold py-3 px-8 rounded-lg shadow-lg shadow-emerald-400/20 transition-all flex items-center gap-2"
                >
                  {isCommitting ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">hourglass_empty</span>
                      Đang nhập dữ liệu vào CSDL...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      Xác Nhận Nhập Dữ Liệu
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: COMMIT RESULT */}
        {step === 3 && commitResult && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <span className="material-symbols-outlined text-4xl">task_alt</span>
              </div>
              <h2 className="font-sans text-2xl font-bold text-slate-100">Nhập Dữ Liệu Hoàn Tất!</h2>
              <p className="font-sans text-sm text-slate-400">
                Toàn bộ dữ liệu từ file Excel đã được thực thi giao dịch lưu trữ thành công vào CSDL.
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4">
              {/* Stories Result */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-5 space-y-3">
                <h3 className="font-sans text-base font-bold text-slate-200 flex items-center gap-2 border-b border-slate-700/60 pb-2">
                  <span className="material-symbols-outlined text-blue-400">menu_book</span>
                  Kết quả Truyện (Stories)
                </h3>
                <div className="space-y-2 font-sans text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tạo mới (Created):</span>
                    <span className="font-mono font-bold text-emerald-400">{commitResult.storiesCreated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cập nhật (Updated):</span>
                    <span className="font-mono font-bold text-blue-400">{commitResult.storiesUpdated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bỏ qua (Skipped):</span>
                    <span className="font-mono font-bold text-amber-400">{commitResult.storiesSkipped}</span>
                  </div>
                </div>
              </div>

              {/* Chapters Result */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-5 space-y-3">
                <h3 className="font-sans text-base font-bold text-slate-200 flex items-center gap-2 border-b border-slate-700/60 pb-2">
                  <span className="material-symbols-outlined text-purple-400">description</span>
                  Kết quả Chương (Chapters)
                </h3>
                <div className="space-y-2 font-sans text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tạo mới (Created):</span>
                    <span className="font-mono font-bold text-emerald-400">{commitResult.chaptersCreated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cập nhật (Updated):</span>
                    <span className="font-mono font-bold text-blue-400">{commitResult.chaptersUpdated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bỏ qua (Skipped):</span>
                    <span className="font-mono font-bold text-amber-400">{commitResult.chaptersSkipped}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-slate-800">
              <button
                onClick={handleReset}
                className="bg-blue-400 hover:bg-blue-500 text-slate-950 font-mono text-sm font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-400/20 transition-all"
              >
                Nhập Thêm File Khác
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
