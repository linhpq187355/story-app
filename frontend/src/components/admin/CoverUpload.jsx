import { useState } from 'react'

export default function CoverUpload({ coverImageUrl, onCoverChange }) {
  const [isDragging, setIsDragging] = useState(false)

  // Hàm xử lý chung khi nhận được file (từ kéo thả hoặc click chọn)
  const processFile = (file) => {
    if (!file) return
    
    // Tùy chọn: Kiểm tra dung lượng file (VD: max 2MB)
    // if (file.size > 2 * 1024 * 1024) {
    //   alert("File quá lớn! Vui lòng chọn ảnh dưới 2MB.")
    //   return
    // }

    // Tạo 1 đường link ảo (Local URL) ngay trên trình duyệt để preview ảnh ngay lập tức
    const previewUrl = URL.createObjectURL(file)
    
    // Truyền thẳng file gốc và link preview lên cho Form cha
    if (onCoverChange) {
      onCoverChange(file, previewUrl)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    // Lấy file đầu tiên người dùng kéo thả vào
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    // Lấy file người dùng chọn từ hộp thoại
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const handleRemoveImage = () => {
    // Truyền null và chuỗi rỗng để xóa ảnh khỏi form cha
    if (onCoverChange) {
      onCoverChange(null, '')
    }
  }

  return (
    <section aria-label="Tải ảnh bìa" className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 className="font-mono text-sm font-semibold text-slate-100 mb-4">Ảnh Bìa</h3>
      
      {/* KIỂM TRA: Nếu đã có ảnh thì hiển thị ảnh, nếu chưa thì hiển thị khung upload */}
      {coverImageUrl ? (
        <div className="relative group rounded-xl overflow-hidden h-72 border border-slate-700">
          <img 
            src={coverImageUrl} 
            alt="Preview Cover" 
            className="w-full h-full object-cover" 
          />
          
          {/* Lớp phủ đen và nút Xóa hiện ra khi di chuột vào ảnh (hover) */}
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              type="button"
              onClick={handleRemoveImage}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-mono text-xs transition-colors shadow-lg"
            >
              <span className="material-symbols-outlined align-middle mr-1 text-[16px]">delete</span>
              Xóa ảnh
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors group relative overflow-hidden h-72 ${
            isDragging ? 'border-blue-400 bg-blue-400/10' : 'border-slate-600 hover:bg-slate-700'
          }`}
        >
          <div className="z-10 flex flex-col items-center gap-3 pointer-events-none">
            <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-blue-400 transition-colors">
              cloud_upload
            </span>
            <div>
              <p className="font-mono text-sm text-blue-400">Kéo thả hoặc click để chọn ảnh</p>
              <p className="font-sans text-xs text-slate-400 mt-1">JPEG, PNG, WEBP (Max 2MB)</p>
              <p className="font-sans text-xs text-slate-400 mt-1">Tỷ lệ khuyên dùng 2:3</p>
            </div>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} // Bắt sự kiện khi click chọn file
          />
        </label>
      )}
    </section>
  )
}