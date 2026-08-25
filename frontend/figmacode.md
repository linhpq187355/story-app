import { useState, useEffect } from 'react'

type Screen = 'home' | 'login' | 'register' | 'story' | 'read'

interface Book {
id: number
title: string
author: string
genre: string[]
status: string
cover: string
rating: number
views: string
chapters: number
desc: string
}

const BOOKS: Book[] = [
{
id: 1,
title: 'Thiên Mệnh Đế Vương',
author: 'Thần Mệnh Đế Vương',
genre: ['Cổ Đại', 'Tu Tiên'],
status: 'Đang ra',
cover: 'https://images.unsplash.com/photo-1769221909844-9795db07a67a?w=300&h=420&fit=crop&auto=format',
rating: 4.8,
views: '12.5M',
chapters: 1842,
desc: 'Xuyên việt đến cuối thời Đông Hán, Đoạn Vũ vừa mở mắt đã phát hiện mình được đệ nhất mỹ nữ Tam Quốc nhặt về. Nhìn ngôi nhà tồi tàn cùng cô nương xinh đẹp bên cạnh, Đoạn Vũ quyết định dùng trí tuệ hiện đại chinh phục thiên hạ.',
},
{
id: 2,
title: 'Vũ Cực Thiên Tôn',
author: 'Thiên Long',
genre: ['Tu Tiên', 'Huyền Huyễn'],
status: 'Đang ra',
cover: 'https://images.unsplash.com/photo-1758762911416-a55e44d33e5c?w=300&h=420&fit=crop&auto=format',
rating: 4.7,
views: '9.2M',
chapters: 2310,
desc: 'Lâm Phong, thiên tài nhất của Vũ Linh Tông, vì bị kẻ thù hãm hại mà mất đi linh căn. Tưởng rằng cuộc đời đã kết thúc, ngờ đâu lại nhận được di vật của Thượng Cổ Đại Đế, mở ra con đường vô địch thiên hạ.',
},
{
id: 3,
title: 'Sau Mưa Trời Lại Sáng',
author: 'Phương Thốc',
genre: ['Hiện Đại', 'Ngôn Tình'],
status: 'Hoàn thành',
cover: 'https://images.unsplash.com/photo-1773216344341-e5ca0a1f0df9?w=300&h=420&fit=crop&auto=format',
rating: 4.6,
views: '7.8M',
chapters: 456,
desc: 'Cô gái bình thường Lê Ngọc Anh tình cờ gặp gỡ vị tổng giám đốc lạnh lùng Trần Minh Khải trong một đêm mưa. Từ một hiểu lầm nhỏ, hai người dần dần bước vào cuộc hôn nhân hợp đồng, và rồi tình yêu thật sự nảy sinh.',
},
{
id: 4,
title: 'Thời Gian Tới Xá Lợi',
author: 'Mộng Thiên',
genre: ['Xuyên Không', 'Tu Tiên'],
status: 'Đang ra',
cover: 'https://images.unsplash.com/photo-1771762408045-1c4212729bf5?w=300&h=420&fit=crop&auto=format',
rating: 4.5,
views: '5.3M',
chapters: 891,
desc: 'Thám tử hiện đại Nguyễn Hà xuyên không về thế giới huyền huyễn, mang theo trí óc sắc bén và kiến thức hiện đại để giải quyết những bí ẩn ngàn năm chưa được làm sáng tỏ.',
},
{
id: 5,
title: 'Trấp Gia Diêm',
author: 'Hải Yến',
genre: ['Cung Đấu', 'Cổ Đại'],
status: 'Hoàn thành',
cover: 'https://images.unsplash.com/photo-1758798460230-2f92954c2096?w=300&h=420&fit=crop&auto=format',
rating: 4.9,
views: '18.1M',
chapters: 623,
desc: 'Nàng công nữ của nước nhỏ bị ép gả vào cung, tưởng rằng sẽ sống cuộc đời tầm thường, ngờ đâu lại cuốn vào vòng xoáy tranh đoạt hậu vị. Dùng trí tuệ và can đảm, nàng từng bước trở thành người đứng trên đỉnh cao.',
},
{
id: 6,
title: 'Tuyệt Thốp Cầu',
author: 'Lam Ngọc',
genre: ['Thể Thao', 'Thanh Xuân'],
status: 'Đang ra',
cover: 'https://images.unsplash.com/photo-1759108767617-3ba2e5a9b321?w=300&h=420&fit=crop&auto=format',
rating: 4.4,
views: '3.9M',
chapters: 234,
desc: 'Cậu bé nghèo Minh Tuấn mang ước mơ trở thành ngôi sao bóng rổ. Vượt qua mọi định kiến và khó khăn, cậu dần khẳng định bản thân trên sân bóng, chinh phục trái tim của cô gái mình yêu.',
},
{
id: 7,
title: 'Đạo Tâm Huyết Hải',
author: 'Kiếm Khách',
genre: ['Kiếm Hiệp', 'Võ Hiệp'],
status: 'Đang ra',
cover: 'https://images.unsplash.com/photo-1769221909844-9795db07a67a?w=300&h=420&fit=crop&auto=format&crop=top',
rating: 4.6,
views: '6.7M',
chapters: 1105,
desc: 'Kiếm sĩ vô danh Trương Vô Kỵ tình cờ học được bí kíp thất truyền của Minh Giáo. Con đường tu luyện gian nan, nhưng chàng nhất định sẽ trở thành đệ nhất kiếm khách thiên hạ.',
},
{
id: 8,
title: 'Nữ Vương Trọng Sinh',
author: 'Phượng Vũ',
genre: ['Trọng Sinh', 'Cổ Đại', 'Nữ Cường'],
status: 'Hoàn thành',
cover: 'https://images.unsplash.com/photo-1758762911416-a55e44d33e5c?w=300&h=420&fit=crop&auto=format&crop=bottom',
rating: 4.8,
views: '15.3M',
chapters: 789,
desc: 'Nữ đế một đời anh hùng, sau khi bị bội phản chết thảm, lại trọng sinh về năm mười sáu tuổi. Lần này, nàng sẽ không để mình yếu đuối nữa, sẽ tự mình vạch ra con đường sáng.',
},
]

const CHAPTER_TITLES = [
'Đỉnh Phong Chi Chiến', 'Phá Thiên Địa Kiếm Trận', 'Vạn Quân Chi Trung Đoạt Súy Kỳ',
'Thiên Long Bát Bộ Trận', 'Cửu Thiên Huyền Nữ Giáng', 'Hồng Hoang Chi Lực Giác Tỉnh',
'Thần Cơ Diệu Toán Dẫn Lôi', 'Đại Đạo Tam Thiên Chọn Một', 'Chư Thiên Vạn Giới Khiếp Sợ',
'Long Tượng Ban Nhược Chi Sức', 'Nhất Kiếm Trảm Tiên', 'Thánh Vương Lâm Thế',
'Thiên Địa Huyền Hoàng Khí', 'Phong Vân Hội Tụ', 'Vô Cực Chi Lộ', 'Kiếm Xuất Thiên Ngoại',
'Thần Hồn Đột Phá', 'Cổ Thần Tái Lâm', 'Vạn Pháp Quy Tông', 'Đế Vương Chi Lộ',
'Thiên Môn Khai Phá', 'Hỗn Độn Sơ Khai', 'Nhật Nguyệt Vô Quang', 'Tiên Đạo Cơ Duyên',
'Vũ Trụ Chi Tâm', 'Huyết Hải Thần Kinh', 'Phá Hư Không', 'Thượng Cổ Bí Ẩn',
'Trấn Thiên Địa', 'Xuất Thế Chi Chiến',
]

function makeChapters(total: number) {
const base = new Date(2026, 7, 13)
return Array.from({ length: total }, (_, i) => {
const num = total - i
const d = new Date(base)
d.setDate(base.getDate() - i)
const dd = String(d.getDate()).padStart(2, '0')
const mm = String(d.getMonth() + 1).padStart(2, '0')
const yyyy = d.getFullYear()
return {
num,
title: CHAPTER_TITLES[i % CHAPTER_TITLES.length],
date: `${dd}/${mm}/${yyyy}`,
}
})
}

const CHAPTERS = makeChapters(1842)

const CHAPTER_CONTENT = `Đỉnh phong của Thiên Vũ Sơn, gió lạnh như dao cắt thịt, mây trắng cuộn cuộn dưới chân. Đoạn Vũ đứng thẳng người, mắt nhìn về phía trời xa, trong lòng dậy lên một cảm giác mà từ trước đến nay chàng chưa từng trải qua.

"Đây chính là... đỉnh cao của thiên hạ sao?" Chàng khẽ thở dài, giọng nói theo gió bay đi xa.

Mười năm. Một hành trình mười năm gian khổ, từ kẻ bình thường nhất trong số những người bình thường, từng bước từng bước leo lên đến đây. Bao nhiêu lần gần chết, bao nhiêu lần tưởng chừng không thể vượt qua, nhưng cuối cùng chàng vẫn đứng được ở đây.

Phía sau chàng, Lưu Yến Nhi cũng bước lên, khuôn mặt xinh đẹp ửng hồng vì gió lạnh, đôi mắt sáng long lanh nhìn về phía chân trời. "Thật đẹp." Nàng thì thầm.

Đoạn Vũ quay đầu lại, nhìn nàng một lúc, rồi bật cười. "Ừ, thật đẹp."

Đột nhiên, một luồng khí tức hùng mạnh ập đến từ xa. Đoạn Vũ thu hẹp đồng tử, thân hình hơi chùng xuống theo bản năng chiến đấu đã hình thành qua bao năm tháng.

"Đoạn Vũ! Ngươi có dám ra mặt đối địch với ta không?!"

Giọng nói đó vang vọng khắp Thiên Vũ Sơn, mang theo uy lực của một Thần Vương đỉnh cấp. Lưu Yến Nhi sắc mặt biến đổi, vô thức nắm lấy tay áo Đoạn Vũ.

Chàng nhẹ nhàng đặt tay lên bàn tay nàng, mỉm cười bình thản. "Đừng lo. Ta đã đợi cuộc chiến này từ lâu lắm rồi."

Chàng bước ra phía trước, thân thể bắt đầu phát ra ánh sáng vàng rực rỡ, Thiên Đế Quyết trong người chạy đến mức tột đỉnh. Xung quanh, bầu trời trong xanh bỗng dưng tối sầm lại, sấm sét bắt đầu kéo đến từ bốn phương tám hướng.

"Bắc Cung Thiên! Hôm nay ta sẽ kết thúc mọi ân oán giữa chúng ta!"

Tiếng hét của Đoạn Vũ vang lên, cả thiên địa rung chuyển...`

const GENRES = ['Tất Cả', 'Tu Tiên', 'Kiếm Hiệp', 'Cổ Đại', 'Hiện Đại', 'Ngôn Tình', 'Huyền Huyễn', 'Xuyên Không', 'Trọng Sinh', 'Đô Thị', 'Khoa Huyễn', 'Nữ Cường']

// ─── Navbar ─────────────────────────────────────────────────────────────────
function Navbar({
screen,
setScreen,
loggedIn,
setLoggedIn,
search,
setSearch,
}: {
screen: Screen
setScreen: (s: Screen) => void
loggedIn: boolean
setLoggedIn: (v: boolean) => void
search: string
setSearch: (v: string) => void
}) {
return (
<header
style={{
background: '#060d1a',
borderBottom: '1px solid #1e3254',
position: 'sticky',
top: 0,
zIndex: 100,
}}
>
<div
style={{
maxWidth: 1400,
margin: '0 auto',
padding: '0 1.5rem',
height: 60,
display: 'flex',
alignItems: 'center',
gap: '1rem',
}}
>
{/* Logo */}
<button
onClick={() => setScreen('home')}
style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
>
<span style={{ fontSize: '1.4rem' }}>📖</span>
<span className="logo-text" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
Mê Đọc Truyện
</span>
</button>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 520, display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              className="input-field"
              placeholder="Tìm truyện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingRight: '2.5rem', borderRadius: '0.6rem' }}
            />
          </div>
          <button
            className="search-btn"
            style={{
              width: 42,
              height: 42,
              borderRadius: '0.6rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}
          >
            🔍
          </button>
          <button
            style={{
              width: 42,
              height: 42,
              borderRadius: '0.6rem',
              border: '1px solid #1e3254',
              background: '#0d1b33',
              cursor: 'pointer',
              color: '#a8bcd4',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ⚙️
          </button>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <button className="nav-link" onClick={() => setScreen('home')}>Trang chủ</button>
          <button className="nav-link">Thể loại</button>
          <button className="nav-link">BXH</button>
        </nav>

        {/* Auth */}
        {loggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              T
            </div>
            <button
              onClick={() => setLoggedIn(false)}
              className="nav-link"
              style={{ fontSize: '0.82rem' }}
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setScreen('register')}
              style={{
                background: 'none',
                border: '1px solid #1e3254',
                color: '#a8bcd4',
                padding: '0.4rem 0.9rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: 'Be Vietnam Pro, sans-serif',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6'
                e.currentTarget.style.color = '#60a5fa'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e3254'
                e.currentTarget.style.color = '#a8bcd4'
              }}
            >
              Đăng ký
            </button>
            <button
              onClick={() => setScreen('login')}
              style={{
                background: 'none',
                border: '1px solid #3b82f6',
                color: '#60a5fa',
                padding: '0.4rem 0.9rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: 'Be Vietnam Pro, sans-serif',
                fontWeight: 500,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>
    </header>
)
}

// ─── Book Cover ──────────────────────────────────────────────────────────────
function BookCover({
book,
width = 100,
height = 140,
badge,
onClick,
}: {
book: Book
width?: number
height?: number
badge?: string
onClick?: () => void
}) {
return (
<div
onClick={onClick}
style={{
width,
height,
borderRadius: '0.5rem',
overflow: 'hidden',
position: 'relative',
cursor: onClick ? 'pointer' : 'default',
flexShrink: 0,
boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
}}
>
<img
src={book.cover}
alt={book.title}
style={{ width: '100%', height: '100%', objectFit: 'cover' }}
/>
<div
style={{
position: 'absolute',
inset: 0,
background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
}}
/>
{badge && (
<div
style={{
position: 'absolute',
top: 6,
left: 6,
background: badge === '#1' ? '#e8950a' : badge === 'Đề cử' ? '#7c3aed' : '#1e3254',
color: 'white',
fontSize: '0.65rem',
fontWeight: 700,
padding: '2px 6px',
borderRadius: '4px',
}}
>
{badge}
</div>
)}
<div
style={{
position: 'absolute',
bottom: 4,
left: 4,
right: 4,
fontSize: '0.65rem',
color: '#dce8f5',
fontWeight: 600,
textShadow: '0 1px 4px rgba(0,0,0,0.9)',
lineHeight: 1.3,
}}
>
{book.title}
</div>
</div>
)
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
return (
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
<h2 className="gold-label" style={{ fontSize: '0.85rem' }}>{title}</h2>
{onSeeAll && (
<button
onClick={onSeeAll}
style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Be Vietnam Pro, sans-serif' }}
>
Tất cả &rsaquo;
</button>
)}
</div>
)
}

// ─── Featured Carousel ───────────────────────────────────────────────────────
function FeaturedCarousel({ books, setScreen, setCurrentBook }: { books: Book[]; setScreen: (s: Screen) => void; setCurrentBook: (b: Book) => void }) {
const [idx, setIdx] = useState(0)
const featured = books.slice(0, 5)
const book = featured[idx]

useEffect(() => {
const t = setInterval(() => setIdx((i) => (i + 1) % featured.length), 4000)
return () => clearInterval(t)
}, [featured.length])

return (
<div className="panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
<h3 style={{ color: '#dce8f5', fontWeight: 700, fontSize: '1rem', fontFamily: 'Cinzel, serif' }}>
Biên tập viên đề cử
</h3>

      {/* Cover fan */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '-12px', position: 'relative', height: 220 }}>
        {[-2, -1, 0, 1, 2].map((offset) => {
          const i = (idx + offset + featured.length) % featured.length
          const isCenter = offset === 0
          const scale = isCenter ? 1 : Math.abs(offset) === 1 ? 0.82 : 0.68
          const zIndex = isCenter ? 10 : Math.abs(offset) === 1 ? 5 : 1
          const translateX = offset * 80
          const translateY = isCenter ? 0 : Math.abs(offset) === 1 ? 20 : 35
          const opacity = Math.abs(offset) > 1 ? 0.6 : 1
          return (
            <div
              key={i}
              onClick={() => setIdx(i)}
              style={{
                position: 'absolute',
                transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                zIndex,
                opacity,
                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                cursor: 'pointer',
              }}
            >
              <BookCover
                book={featured[i]}
                width={isCenter ? 130 : 100}
                height={isCenter ? 185 : 142}
                badge={isCenter ? '#1' : i === 1 ? 'Đề cử' : undefined}
              />
            </div>
          )
        })}
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 20 : 6,
              height: 6,
              borderRadius: 3,
              border: 'none',
              background: i === idx ? '#3b82f6' : '#1e3254',
              cursor: 'pointer',
              transition: 'width 0.3s, background 0.3s',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Info */}
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <h3 style={{ color: '#dce8f5', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
          {book.title}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {book.genre.map((g) => (
            <span key={g} className="tag">{g}</span>
          ))}
          <span className="tag">{book.status}</span>
          <span style={{ color: '#7a96b8', fontSize: '0.78rem' }}>✏️ {book.author}</span>
        </div>
        <p style={{ color: '#7a96b8', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '1rem' }}>
          {book.desc.slice(0, 120)}...
        </p>
        <button
          className="btn-primary"
          onClick={() => { setCurrentBook(book); setScreen('story') }}
          style={{
            padding: '0.6rem 2rem',
            borderRadius: '0.6rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            fontFamily: 'Be Vietnam Pro, sans-serif',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          📖 Đọc truyện
        </button>
      </div>
    </div>
)
}

// ─── Home Page ───────────────────────────────────────────────────────────────
function HomePage({
books,
setScreen,
setCurrentBook,
loggedIn,
}: {
books: Book[]
setScreen: (s: Screen) => void
setCurrentBook: (b: Book) => void
loggedIn: boolean
}) {
const [activeGenre, setActiveGenre] = useState('Tất Cả')

const filtered = activeGenre === 'Tất Cả'
    ? books
    : books.filter((b) => b.genre.includes(activeGenre))

return (
<div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem' }}>
{/* Genre nav */}
<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
{GENRES.map((g) => (
<button
key={g}
className={`tag-genre${activeGenre === g ? ' active' : ''}`}
onClick={() => setActiveGenre(g)}
>
{g}
</button>
))}
</div>

      {/* 3-column main */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: '1rem', marginBottom: '2rem' }}>
        {/* Left: Recently read */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <SectionHeader title="Truyện Vừa Đọc" />
          {loggedIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {books.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  onClick={() => { setCurrentBook(b); setScreen('story') }}
                  style={{ display: 'flex', gap: '0.6rem', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.5rem', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#111f3a' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none' }}
                >
                  <BookCover book={b} width={50} height={70} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#dce8f5', fontSize: '0.78rem', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</p>
                    <p style={{ color: '#4a6080', fontSize: '0.7rem' }}>Chương {b.chapters - Math.floor(Math.random() * 10)}</p>
                    <p style={{ color: '#3b82f6', fontSize: '0.68rem', marginTop: '0.2rem' }}>{b.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: '#4a6080', fontSize: '0.82rem', marginBottom: '0.75rem' }}>Chưa có lịch sử đọc</p>
              <button
                onClick={() => setScreen('login')}
                style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Be Vietnam Pro, sans-serif' }}
              >
                Khám phá truyện →
              </button>
            </div>
          )}

          <div style={{ borderTop: '1px solid #1e3254', marginTop: '1.25rem', paddingTop: '1.25rem' }}>
            <SectionHeader title="Thể Loại Nổi Bật" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['Tu Tiên', 'Kiếm Hiệp', 'Ngôn Tình', 'Trọng Sinh', 'Đô Thị', 'Huyền Huyễn'].map((g) => (
                <button
                  key={g}
                  className="tag-genre"
                  onClick={() => setActiveGenre(g)}
                  style={{ fontSize: '0.68rem' }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Featured carousel */}
        <FeaturedCarousel books={books} setScreen={setScreen} setCurrentBook={setCurrentBook} />

        {/* Right: Following */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <SectionHeader title="Đang Theo Dõi" />
          {loggedIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {books.slice(4, 7).map((b) => (
                <div
                  key={b.id}
                  onClick={() => { setCurrentBook(b); setScreen('story') }}
                  style={{ display: 'flex', gap: '0.6rem', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.5rem', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#111f3a' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none' }}
                >
                  <BookCover book={b} width={50} height={70} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#dce8f5', fontSize: '0.78rem', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</p>
                    <p style={{ color: '#4a6080', fontSize: '0.7rem' }}>Chương {b.chapters}</p>
                    <p style={{ color: '#e8950a', fontSize: '0.68rem', marginTop: '0.2rem' }}>🔔 Chap mới</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: '#4a6080', fontSize: '0.82rem', marginBottom: '0.75rem' }}>Chưa theo dõi truyện nào</p>
              <button
                onClick={() => setScreen('login')}
                style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Be Vietnam Pro, sans-serif' }}
              >
                Khám phá truyện →
              </button>
            </div>
          )}

          <div style={{ borderTop: '1px solid #1e3254', marginTop: '1.25rem', paddingTop: '1.25rem' }}>
            <SectionHeader title="BXH Hôm Nay" />
            {books.slice(0, 5).map((b, i) => (
              <div
                key={b.id}
                onClick={() => { setCurrentBook(b); setScreen('story') }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', transition: 'background 0.12s', marginBottom: '0.25rem' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#111f3a' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none' }}
              >
                <span style={{ width: 20, textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: i < 3 ? '#e8950a' : '#4a6080' }}>
                  {i + 1}
                </span>
                <p style={{ color: '#c8daf0', fontSize: '0.78rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book grid section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="gold-label">
            {activeGenre === 'Tất Cả' ? 'Truyện Đề Cử' : `Thể Loại: ${activeGenre}`}
          </h2>
          <span style={{ color: '#4a6080', fontSize: '0.78rem' }}>{filtered.length} truyện</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {filtered.map((book) => (
            <div
              key={book.id}
              className="book-card"
              onClick={() => { setCurrentBook(book); setScreen('story') }}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={book.cover}
                  alt={book.title}
                  style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: '0.75rem 0.75rem 0 0', display: 'block' }}
                />
                <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', color: '#f5b942', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  ★ {book.rating}
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, rgba(8,15,30,0.95), transparent)' }} />
              </div>
              <div style={{ padding: '0.7rem' }}>
                <h3 style={{ color: '#dce8f5', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {book.title}
                </h3>
                <p style={{ color: '#4a6080', fontSize: '0.72rem', marginBottom: '0.4rem' }}>✏️ {book.author}</p>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                  {book.genre.slice(0, 2).map((g) => (
                    <span key={g} className="tag" style={{ fontSize: '0.62rem' }}>{g}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#4a6080', fontSize: '0.68rem' }}>👁 {book.views}</span>
                  <span style={{ color: book.status === 'Hoàn thành' ? '#22c55e' : '#e8950a', fontSize: '0.68rem' }}>{book.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New updates */}
      <div>
        <SectionHeader title="Mới Cập Nhật" />
        <div className="panel" style={{ padding: '0.75rem 1rem' }}>
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => { setCurrentBook(book); setScreen('story') }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.5rem', borderBottom: '1px solid #1e3254', cursor: 'pointer', borderRadius: '0.5rem', transition: 'background 0.12s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#111f3a' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none' }}
            >
              <BookCover book={book} width={44} height={62} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: '#dce8f5', fontSize: '0.88rem', fontWeight: 600 }}>{book.title}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                  {book.genre.slice(0, 1).map((g) => (
                    <span key={g} className="tag" style={{ fontSize: '0.65rem' }}>{g}</span>
                  ))}
                  <span style={{ color: '#4a6080', fontSize: '0.72rem' }}>✏️ {book.author}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: '#60a5fa', fontSize: '0.78rem' }}>Chương {book.chapters}</p>
                <p style={{ color: '#4a6080', fontSize: '0.68rem', marginTop: '0.2rem' }}>13/08/2026</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
)
}

// ─── Auth Pages ──────────────────────────────────────────────────────────────
function AuthCard({ children, title }: { children: React.ReactNode; title: string }) {
return (
<div
style={{
minHeight: 'calc(100vh - 60px)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
padding: '2rem',
background: 'radial-gradient(ellipse at center top, #0d1b33 0%, #080f1e 60%)',
}}
>
<div
className="panel"
style={{ width: '100%', maxWidth: 420, padding: '2.5rem', borderRadius: '1.25rem' }}
>
<div style={{ textAlign: 'center', marginBottom: '2rem' }}>
<span style={{ fontSize: '2rem' }}>📖</span>
<h1 className="logo-text" style={{ fontSize: '1.3rem', display: 'block', marginTop: '0.5rem' }}>
Mê Đọc Truyện
</h1>
<h2 style={{ color: '#dce8f5', fontSize: '1.1rem', fontWeight: 600, marginTop: '1rem' }}>{title}</h2>
</div>
{children}
</div>
</div>
)
}

function LoginPage({ setScreen, setLoggedIn }: { setScreen: (s: Screen) => void; setLoggedIn: (v: boolean) => void }) {
const [email, setEmail] = useState('')
const [pass, setPass] = useState('')
const [error, setError] = useState('')

const handleLogin = () => {
if (!email || !pass) { setError('Vui lòng nhập đầy đủ thông tin.'); return }
setLoggedIn(true)
setScreen('home')
}

return (
<AuthCard title="Đăng nhập">
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
<div>
<label style={{ color: '#7a96b8', fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>Email</label>
<input className="input-field" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
</div>
<div>
<label style={{ color: '#7a96b8', fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>Mật khẩu</label>
<input className="input-field" type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} />
</div>
<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
<button style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
Quên mật khẩu?
</button>
</div>
{error && <p style={{ color: '#f87171', fontSize: '0.82rem', textAlign: 'center' }}>{error}</p>}
<button
className="btn-primary"
onClick={handleLogin}
style={{ width: '100%', padding: '0.75rem', borderRadius: '0.6rem', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'Be Vietnam Pro, sans-serif' }}
>
Đăng nhập
</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: 1, background: '#1e3254' }} />
          <span style={{ color: '#4a6080', fontSize: '0.78rem' }}>hoặc</span>
          <div style={{ flex: 1, height: 1, background: '#1e3254' }} />
        </div>

        <button
          style={{
            width: '100%',
            padding: '0.7rem',
            borderRadius: '0.6rem',
            border: '1px solid #1e3254',
            background: '#111f3a',
            color: '#dce8f5',
            fontSize: '0.88rem',
            cursor: 'pointer',
            fontFamily: 'Be Vietnam Pro, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <span>G</span> Đăng nhập với Google
        </button>

        <p style={{ textAlign: 'center', color: '#4a6080', fontSize: '0.82rem' }}>
          Chưa có tài khoản?{' '}
          <button
            onClick={() => setScreen('register')}
            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '0.82rem' }}
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </AuthCard>
)
}

function RegisterPage({ setScreen, setLoggedIn }: { setScreen: (s: Screen) => void; setLoggedIn: (v: boolean) => void }) {
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [pass, setPass] = useState('')
const [confirm, setConfirm] = useState('')
const [error, setError] = useState('')

const handleRegister = () => {
if (!name || !email || !pass || !confirm) { setError('Vui lòng nhập đầy đủ thông tin.'); return }
if (pass !== confirm) { setError('Mật khẩu xác nhận không khớp.'); return }
if (pass.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return }
setLoggedIn(true)
setScreen('home')
}

return (
<AuthCard title="Tạo tài khoản mới">
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
<div>
<label style={{ color: '#7a96b8', fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>Tên hiển thị</label>
<input className="input-field" placeholder="Tên của bạn" value={name} onChange={(e) => setName(e.target.value)} />
</div>
<div>
<label style={{ color: '#7a96b8', fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>Email</label>
<input className="input-field" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
</div>
<div>
<label style={{ color: '#7a96b8', fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>Mật khẩu</label>
<input className="input-field" type="password" placeholder="Ít nhất 6 ký tự" value={pass} onChange={(e) => setPass(e.target.value)} />
</div>
<div>
<label style={{ color: '#7a96b8', fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>Xác nhận mật khẩu</label>
<input className="input-field" type="password" placeholder="Nhập lại mật khẩu" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
</div>
{error && <p style={{ color: '#f87171', fontSize: '0.82rem', textAlign: 'center' }}>{error}</p>}
<button
className="btn-primary"
onClick={handleRegister}
style={{ width: '100%', padding: '0.75rem', borderRadius: '0.6rem', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'Be Vietnam Pro, sans-serif' }}
>
Đăng ký
</button>
<p style={{ textAlign: 'center', color: '#4a6080', fontSize: '0.78rem' }}>
Bằng cách đăng ký, bạn đồng ý với{' '}
<span style={{ color: '#60a5fa' }}>Điều khoản dịch vụ</span> của chúng tôi
</p>
<p style={{ textAlign: 'center', color: '#4a6080', fontSize: '0.82rem' }}>
Đã có tài khoản?{' '}
<button
onClick={() => setScreen('login')}
style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '0.82rem' }}
>
Đăng nhập
</button>
</p>
</div>
</AuthCard>
)
}

// ─── Pagination helpers ──────────────────────────────────────────────────────
function buildPageNumbers(current: number, total: number): (number | '...')[] {
if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
const pages: (number | '...')[] = []
const addRange = (a: number, b: number) => { for (let i = a; i <= b; i++) pages.push(i) }
pages.push(1)
if (current > 4) pages.push('...')
addRange(Math.max(2, current - 2), Math.min(total - 1, current + 2))
if (current < total - 3) pages.push('...')
pages.push(total)
return [...new Set(pages)]
}

function PageBtn({ label, active, disabled, onClick }: { label: string; active?: boolean; disabled?: boolean; onClick?: () => void }) {
return (
<button
onClick={onClick}
disabled={disabled}
style={{
minWidth: 34,
height: 34,
padding: '0 6px',
borderRadius: '0.45rem',
border: active ? '1px solid #3b82f6' : '1px solid #1e3254',
background: active ? '#3b82f6' : disabled ? 'transparent' : '#111f3a',
color: active ? '#fff' : disabled ? '#2a3f5a' : '#a8bcd4',
cursor: disabled ? 'default' : 'pointer',
fontSize: '0.82rem',
fontFamily: 'Be Vietnam Pro, sans-serif',
fontWeight: active ? 600 : 400,
transition: 'background 0.15s, border-color 0.15s',
lineHeight: 1,
}}
onMouseEnter={(e) => { if (!active && !disabled) (e.currentTarget as HTMLElement).style.background = '#1e3254' }}
onMouseLeave={(e) => { if (!active && !disabled) (e.currentTarget as HTMLElement).style.background = '#111f3a' }}
>
{label}
</button>
)
}

// ─── Story Detail Page ───────────────────────────────────────────────────────
function StoryPage({
book,
books,
setScreen,
setCurrentBook,
setCurrentChapter,
loggedIn,
}: {
book: Book
books: Book[]
setScreen: (s: Screen) => void
setCurrentBook: (b: Book) => void
setCurrentChapter: (n: number) => void
loggedIn: boolean
}) {
const [tab, setTab] = useState<'info' | 'chapters' | 'comments'>('info')
const [chapPage, setChapPage] = useState(1)
const [chapSort, setChapSort] = useState<'desc' | 'asc'>('desc')
const [jumpInput, setJumpInput] = useState('')
const PER_PAGE = 20
const allChaps = chapSort === 'desc' ? CHAPTERS : [...CHAPTERS].reverse()
const totalPages = Math.ceil(allChaps.length / PER_PAGE)
const pageChaps = allChaps.slice((chapPage - 1) * PER_PAGE, chapPage * PER_PAGE)

const handleRead = (chap: number) => {
setCurrentChapter(chap)
setScreen('read')
}

return (
<div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem' }}>
{/* Breadcrumb */}
<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#4a6080' }}>
<button onClick={() => setScreen('home')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '0.8rem' }}>
Trang chủ
</button>
<span>/</span>
<span style={{ color: '#dce8f5' }}>{book.title}</span>
</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        {/* Main */}
        <div>
          {/* Hero */}
          <div
            className="panel"
            style={{
              padding: '1.5rem',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #0d1b33 0%, #111f3a 100%)',
            }}
          >
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ flexShrink: 0, boxShadow: '0 8px 40px rgba(0,0,0,0.7)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                <img src={book.cover} alt={book.title} style={{ width: 160, height: 224, objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ color: '#dce8f5', fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Cinzel, serif', marginBottom: '0.5rem' }}>
                  {book.title}
                </h1>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {book.genre.map((g) => (
                    <span key={g} className="tag-genre" style={{ fontSize: '0.72rem' }}>{g}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                  <p style={{ color: '#7a96b8', fontSize: '0.85rem' }}>✏️ Tác giả: <span style={{ color: '#dce8f5' }}>{book.author}</span></p>
                  <p style={{ color: '#7a96b8', fontSize: '0.85rem' }}>📚 Số chương: <span style={{ color: '#dce8f5' }}>{book.chapters.toLocaleString()}</span></p>
                  <p style={{ color: '#7a96b8', fontSize: '0.85rem' }}>👁 Lượt xem: <span style={{ color: '#dce8f5' }}>{book.views}</span></p>
                  <p style={{ color: '#7a96b8', fontSize: '0.85rem' }}>
                    Trạng thái:{' '}
                    <span style={{ color: book.status === 'Hoàn thành' ? '#22c55e' : '#e8950a', fontWeight: 600 }}>
                      {book.status}
                    </span>
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: '#f5b942', fontSize: '1rem' }}>{'★'.repeat(Math.floor(book.rating))}</span>
                    <span style={{ color: '#f5b942', fontSize: '0.85rem', fontWeight: 600 }}>{book.rating}</span>
                    <span style={{ color: '#4a6080', fontSize: '0.78rem' }}>(1.2k đánh giá)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn-primary"
                    onClick={() => handleRead(CHAPTERS[0].num)}
                    style={{ padding: '0.65rem 1.5rem', borderRadius: '0.6rem', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Be Vietnam Pro, sans-serif', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    📖 Đọc từ đầu
                  </button>
                  <button
                    onClick={() => handleRead(CHAPTERS[0].num)}
                    style={{ padding: '0.65rem 1.5rem', borderRadius: '0.6rem', fontSize: '0.9rem', fontWeight: 500, fontFamily: 'Be Vietnam Pro, sans-serif', border: '1px solid #1e3254', background: '#111f3a', color: '#dce8f5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    ⚡ Đọc chương mới nhất
                  </button>
                  <button
                    style={{ padding: '0.65rem', borderRadius: '0.6rem', border: '1px solid #1e3254', background: '#111f3a', color: loggedIn ? '#f87171' : '#4a6080', cursor: 'pointer', fontSize: '1rem' }}
                  >
                    {loggedIn ? '♥' : '♡'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', borderBottom: '1px solid #1e3254', paddingBottom: '0' }}>
            {(['info', 'chapters', 'comments'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${tab === t ? '#3b82f6' : 'transparent'}`,
                  color: tab === t ? '#60a5fa' : '#7a96b8',
                  padding: '0.6rem 1.2rem',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: tab === t ? 600 : 400,
                  fontFamily: 'Be Vietnam Pro, sans-serif',
                  transition: 'color 0.15s',
                  marginBottom: -1,
                }}
              >
                {t === 'info' ? 'Giới thiệu' : t === 'chapters' ? `Danh sách chương (${book.chapters})` : 'Bình luận'}
              </button>
            ))}
          </div>

          {tab === 'info' && (
            <div className="panel" style={{ padding: '1.25rem' }}>
              <p style={{ color: '#c8daf0', fontSize: '0.9rem', lineHeight: 1.8 }}>{book.desc}</p>
            </div>
          )}

          {tab === 'chapters' && (
            <div className="panel" style={{ padding: '1rem' }}>
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ color: '#7a96b8', fontSize: '0.82rem' }}>
                  {book.chapters.toLocaleString()} chương · trang {chapPage}/{totalPages}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {/* Jump to page */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ color: '#4a6080', fontSize: '0.78rem' }}>Đến trang</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={jumpInput}
                      onChange={(e) => setJumpInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const p = Math.min(totalPages, Math.max(1, parseInt(jumpInput) || 1))
                          setChapPage(p)
                          setJumpInput('')
                        }
                      }}
                      placeholder={String(chapPage)}
                      style={{
                        width: 52,
                        padding: '0.25rem 0.4rem',
                        background: '#0d1b33',
                        border: '1px solid #1e3254',
                        borderRadius: '0.4rem',
                        color: '#dce8f5',
                        fontSize: '0.78rem',
                        fontFamily: 'Be Vietnam Pro, sans-serif',
                        outline: 'none',
                        textAlign: 'center',
                      }}
                    />
                  </div>
                  {/* Sort toggle */}
                  <button
                    onClick={() => { setChapSort(s => s === 'desc' ? 'asc' : 'desc'); setChapPage(1) }}
                    style={{ background: 'none', border: '1px solid #1e3254', color: '#a8bcd4', fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', fontFamily: 'Be Vietnam Pro, sans-serif', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    {chapSort === 'desc' ? '↓ Mới nhất' : '↑ Cũ nhất'}
                  </button>
                </div>
              </div>

              {/* Chapter list */}
              <div>
                {pageChaps.map((ch) => (
                  <div key={ch.num} className="chapter-row" onClick={() => handleRead(ch.num)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                      <span style={{ color: '#4a6080', fontSize: '0.72rem', width: 36, flexShrink: 0, textAlign: 'right' }}>
                        {ch.num}
                      </span>
                      <span style={{ color: '#60a5fa', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ch.title}
                      </span>
                    </div>
                    <span style={{ color: '#4a6080', fontSize: '0.75rem', flexShrink: 0, marginLeft: '0.5rem' }}>{ch.date}</span>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                {/* First + Prev */}
                <PageBtn label="«" disabled={chapPage === 1} onClick={() => setChapPage(1)} />
                <PageBtn label="‹" disabled={chapPage === 1} onClick={() => setChapPage(p => p - 1)} />

                {/* Page numbers */}
                {buildPageNumbers(chapPage, totalPages).map((item, i) =>
                  item === '...' ? (
                    <span key={`ellipsis-${i}`} style={{ color: '#4a6080', fontSize: '0.82rem', padding: '0 4px' }}>…</span>
                  ) : (
                    <PageBtn
                      key={item}
                      label={String(item)}
                      active={item === chapPage}
                      onClick={() => setChapPage(item as number)}
                    />
                  )
                )}

                {/* Next + Last */}
                <PageBtn label="›" disabled={chapPage === totalPages} onClick={() => setChapPage(p => p + 1)} />
                <PageBtn label="»" disabled={chapPage === totalPages} onClick={() => setChapPage(totalPages)} />
              </div>
            </div>
          )}

          {tab === 'comments' && (
            <div className="panel" style={{ padding: '1.25rem' }}>
              {loggedIn ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  <textarea
                    className="input-field"
                    placeholder="Viết bình luận của bạn..."
                    style={{ height: 80, resize: 'vertical' }}
                  />
                  <button className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600 }}>
                    Gửi bình luận
                  </button>
                </div>
              ) : (
                <p style={{ color: '#4a6080', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <button onClick={() => setScreen('login')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Đăng nhập</button> để bình luận
                </p>
              )}
              {[
                { user: 'Nguyen_Van_A', text: 'Truyện hay lắm, đọc không thể dừng được! Tác giả viết rất chi tiết và hấp dẫn.', time: '2 giờ trước', likes: 42 },
                { user: 'MinhTuan2024', text: 'Nhân vật chính rất mạnh nhưng không bị overpowered một cách vô lý. Thích nhất là phần tu luyện.', time: '5 giờ trước', likes: 28 },
                { user: 'DocSach_Forever', text: 'Plot twist ở chương 1800 khiến mình không ngủ được cả đêm 😭', time: '1 ngày trước', likes: 67 },
              ].map((c, i) => (
                <div key={i} style={{ borderBottom: '1px solid #1e3254', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, hsl(${i * 80},70%,50%), hsl(${i * 80 + 60},70%,40%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                        {c.user[0]}
                      </div>
                      <span style={{ color: '#dce8f5', fontSize: '0.85rem', fontWeight: 600 }}>{c.user}</span>
                    </div>
                    <span style={{ color: '#4a6080', fontSize: '0.75rem' }}>{c.time}</span>
                  </div>
                  <p style={{ color: '#c8daf0', fontSize: '0.85rem', lineHeight: 1.6, marginLeft: '2.5rem', marginBottom: '0.4rem' }}>{c.text}</p>
                  <div style={{ marginLeft: '2.5rem', display: 'flex', gap: '1rem' }}>
                    <button style={{ background: 'none', border: 'none', color: '#4a6080', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Be Vietnam Pro, sans-serif' }}>👍 {c.likes}</button>
                    <button style={{ background: 'none', border: 'none', color: '#4a6080', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Trả lời</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel" style={{ padding: '1.25rem' }}>
            <SectionHeader title="Truyện Tương Tự" />
            {books.filter((b) => b.id !== book.id).slice(0, 4).map((b) => (
              <div
                key={b.id}
                onClick={() => setCurrentBook(b)}
                style={{ display: 'flex', gap: '0.6rem', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', transition: 'background 0.12s', marginBottom: '0.25rem' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#111f3a' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none' }}
              >
                <BookCover book={b} width={48} height={68} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#dce8f5', fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</p>
                  <p style={{ color: '#4a6080', fontSize: '0.7rem', marginTop: '0.2rem' }}>{b.chapters} chương</p>
                  <p style={{ color: '#f5b942', fontSize: '0.7rem' }}>★ {b.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
)
}

// ─── Read Page ───────────────────────────────────────────────────────────────
function ReadPage({
book,
chapter,
setScreen,
setCurrentChapter,
}: {
book: Book
chapter: number
setScreen: (s: Screen) => void
setCurrentChapter: (n: number) => void
}) {
const [fontSize, setFontSize] = useState(16)
const [bgMode, setBgMode] = useState<'dark' | 'sepia' | 'light'>('dark')

const bgStyles = {
dark: { background: '#080f1e', color: '#c8daf0' },
sepia: { background: '#2a1f0e', color: '#d4b896' },
light: { background: '#f0f0e8', color: '#2a2a2a' },
}

const idx = CHAPTERS.findIndex((c) => c.num === chapter)
const prev = idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null
const next = idx > 0 ? CHAPTERS[idx - 1] : null
const currentChap = CHAPTERS[idx] || CHAPTERS[0]

return (
<div style={{ ...bgStyles[bgMode], minHeight: 'calc(100vh - 60px)' }}>
{/* Reader toolbar */}
<div
style={{
background: bgMode === 'light' ? '#e8e8e0' : '#0d1b33',
borderBottom: `1px solid ${bgMode === 'light' ? '#ccc' : '#1e3254'}`,
padding: '0.6rem 1.5rem',
display: 'flex',
alignItems: 'center',
gap: '1rem',
position: 'sticky',
top: 60,
zIndex: 50,
}}
>
<button
onClick={() => setScreen('story')}
style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Be Vietnam Pro, sans-serif', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
>
← {book.title}
</button>
<div style={{ flex: 1, textAlign: 'center' }}>
<span style={{ color: bgMode === 'light' ? '#555' : '#7a96b8', fontSize: '0.85rem' }}>
Chương {currentChap.num}: {currentChap.title}
</span>
</div>
<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
<button
onClick={() => setFontSize((s) => Math.max(12, s - 2))}
style={{ background: 'none', border: '1px solid #1e3254', color: '#a8bcd4', width: 30, height: 30, borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}
>A-</button>
<span style={{ color: '#7a96b8', fontSize: '0.8rem', width: 28, textAlign: 'center' }}>{fontSize}</span>
<button
onClick={() => setFontSize((s) => Math.min(24, s + 2))}
style={{ background: 'none', border: '1px solid #1e3254', color: '#a8bcd4', width: 30, height: 30, borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}
>A+</button>
<div style={{ display: 'flex', gap: '0.3rem', marginLeft: '0.5rem' }}>
{(['dark', 'sepia', 'light'] as const).map((m) => (
<button
key={m}
onClick={() => setBgMode(m)}
style={{
width: 22,
height: 22,
borderRadius: '50%',
border: bgMode === m ? '2px solid #3b82f6' : '2px solid #1e3254',
background: m === 'dark' ? '#080f1e' : m === 'sepia' ? '#2a1f0e' : '#f0f0e8',
cursor: 'pointer',
}}
/>
))}
</div>
</div>
</div>

      {/* Chapter content */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 2rem' }}>
        <h1
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: bgMode === 'light' ? '#333' : '#dce8f5',
            textAlign: 'center',
            marginBottom: '0.5rem',
          }}
        >
          Chương {currentChap.num}
        </h1>
        <h2
          style={{
            fontFamily: 'Be Vietnam Pro, sans-serif',
            fontSize: '1rem',
            fontWeight: 500,
            color: bgMode === 'light' ? '#666' : '#7a96b8',
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          {currentChap.title}
        </h2>

        <div className="read-content" style={{ fontSize, color: bgStyles[bgMode].color }}>
          {CHAPTER_CONTENT.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: `1px solid ${bgMode === 'light' ? '#ccc' : '#1e3254'}`,
          }}
        >
          <button
            onClick={() => prev && setCurrentChapter(prev.num)}
            disabled={!prev}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '0.6rem',
              border: '1px solid #1e3254',
              background: prev ? '#0d1b33' : 'transparent',
              color: prev ? '#60a5fa' : '#4a6080',
              cursor: prev ? 'pointer' : 'default',
              fontSize: '0.88rem',
              fontFamily: 'Be Vietnam Pro, sans-serif',
            }}
          >
            ← Chương trước
          </button>
          <button
            onClick={() => setScreen('story')}
            style={{ background: 'none', border: 'none', color: '#7a96b8', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Be Vietnam Pro, sans-serif' }}
          >
            ☰ Danh sách chương
          </button>
          <button
            onClick={() => next && setCurrentChapter(next.num)}
            disabled={!next}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '0.6rem',
              border: '1px solid #1e3254',
              background: next ? '#0d1b33' : 'transparent',
              color: next ? '#60a5fa' : '#4a6080',
              cursor: next ? 'pointer' : 'default',
              fontSize: '0.88rem',
              fontFamily: 'Be Vietnam Pro, sans-serif',
            }}
          >
            Chương sau →
          </button>
        </div>
      </div>
    </div>
)
}

// ─── Root App ────────────────────────────────────────────────────────────────
export default function App() {
const [screen, setScreen] = useState<Screen>('home')
const [loggedIn, setLoggedIn] = useState(false)
const [currentBook, setCurrentBook] = useState<Book>(BOOKS[0])
const [currentChapter, setCurrentChapter] = useState(CHAPTERS[0].num)
const [search, setSearch] = useState('')

const filteredBooks = search
    ? BOOKS.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()))
    : BOOKS

return (
<div style={{ minHeight: '100vh', background: '#080f1e' }}>
<Navbar
screen={screen}
setScreen={setScreen}
loggedIn={loggedIn}
setLoggedIn={setLoggedIn}
search={search}
setSearch={setSearch}
/>
{screen === 'home' && (
<HomePage books={filteredBooks} setScreen={setScreen} setCurrentBook={setCurrentBook} loggedIn={loggedIn} />
)}
{screen === 'login' && (
<LoginPage setScreen={setScreen} setLoggedIn={setLoggedIn} />
)}
{screen === 'register' && (
<RegisterPage setScreen={setScreen} setLoggedIn={setLoggedIn} />
)}
{screen === 'story' && (
<StoryPage
book={currentBook}
books={BOOKS}
setScreen={setScreen}
setCurrentBook={setCurrentBook}
setCurrentChapter={setCurrentChapter}
loggedIn={loggedIn}
/>
)}
{screen === 'read' && (
<ReadPage book={currentBook} chapter={currentChapter} setScreen={setScreen} setCurrentChapter={setCurrentChapter} />
)}
</div>
)
}
