import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import FilterSidebar from './FilterSidebar';
import BookList from './BookList';
import Pagination from './Pagination';
import { publicStoryService } from '../../services/publicStoryService';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=300&h=420&fit=crop&auto=format';

function mapStoryToBook(story) {
  return {
    id: story.id,
    title: story.title || 'Đang cập nhật',
    author: story.authorName || 'Đang cập nhật',
    authorId: story.authorId,
    genre: story.genreName ? [story.genreName] : ['Khác'],
    genreId: story.genreId,
    status: publicStoryService.mapStatus(story.status),
    cover: publicStoryService.buildCoverUrl(story.coverImageUrl) || DEFAULT_COVER,
    rating: story.rating || 4.5,
    views: (story.viewCount || 0).toLocaleString('vi-VN'),
    viewCount: story.viewCount || 0,
    chapters: story.chapterCount || 0,
    latestActivityAt: story.latestActivityAt,
    desc: story.description || 'Nội dung đang được cập nhật.',
  };
}

export default function SearchPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const outletCtx = useOutletContext() || {};
    const search = outletCtx.search || '';
    const setSearch = outletCtx.setSearch || (() => {});
    const [books, setBooks] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const queryParams = new URLSearchParams(location.search);
    const [status, setStatus] = useState(queryParams.get('status') || 'Toàn bộ');
    const [genre, setGenre] = useState(queryParams.get('genre') || 'Tất cả');
    const [author, setAuthor] = useState(queryParams.get('author') || '');
    const [sort, setSort] = useState(queryParams.get('sort') || 'createdAt,desc');
    const [page, setPage] = useState(Number(queryParams.get('page')) || 1);

    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        const handleStorageChange = () => {
            setLoggedIn(!!localStorage.getItem('token'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const fetchStories = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const params = {
                page: page - 1,
                size: 8,
                keyword: search,
                genreId: genre !== 'Tất cả' ? genre : null,
                status: status !== 'Toàn bộ' ? status : null,
                authorId: author,
                sort: sort,
            };
            const response = await publicStoryService.getStories(params);
            const { content, totalPages, totalElements } = response.data;
            setBooks(content.map(mapStoryToBook));
            setTotalPages(totalPages);
            setTotalElements(totalElements);
        } catch (error) {
            setErrorMessage('Không thể tải danh sách truyện. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, genre, status, author, sort]);

    useEffect(() => {
        const newParams = new URLSearchParams();
        if (search) newParams.set('q', search);
        if (page > 1) newParams.set('page', page);
        if (genre !== 'Tất cả') newParams.set('genre', genre);
        if (status !== 'Toàn bộ') newParams.set('status', status);
        if (author) newParams.set('author', author);
        if (sort !== 'createdAt,desc') newParams.set('sort', sort);
        navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });

        fetchStories();
    }, [fetchStories, navigate, location.pathname, page, search, genre, status, author, sort]);

    const resetFilters = () => {
        setSearch('');
        setStatus('Toàn bộ');
        setGenre('Tất cả');
        setAuthor('');
        setSort('createdAt,desc');
        setPage(1);
    };

    const setCurrentBook = (book) => {
        navigate(`/stories/${book.id}`);
    };

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start', width: '100%', boxSizing: 'border-box' }}>
                <FilterSidebar
                    status={status}
                    setStatus={setStatus}
                    genre={genre}
                    setGenre={setGenre}
                    author={author}
                    setAuthor={setAuthor}
                    sort={sort}
                    setSort={setSort}
                    resetFilters={resetFilters}
                    setPage={setPage}
                />
                <div>
                    {errorMessage && <p style={{ color: 'red', background: '#2a1212', border: '1px solid #f87171', padding: '0.75rem', borderRadius: '0.5rem' }}>{errorMessage}</p>}
                    {isLoading ? <p style={{ color: '#a8bcd4', background: '#111f3a', border: '1px solid #1e3254', padding: '0.75rem', borderRadius: '0.5rem' }}>Đang tải danh sách truyện...</p> : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                <h2 style={{ color: '#dce8f5', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: '#e8950a' }}>📚</span> Danh sách truyện
                                </h2>
                                <span style={{ background: 'rgba(232,149,10,0.15)', border: '1px solid rgba(232,149,10,0.4)', color: '#e8950a', fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>
                                    📋 {totalElements.toLocaleString()}
                                </span>
                            </div>
                            <BookList
                                books={books}
                                setCurrentBook={setCurrentBook}
                                resetFilters={resetFilters}
                            />
                            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                        </>
                    )}
                </div>
        </div>
    );
}