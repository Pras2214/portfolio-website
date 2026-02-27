import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import PrimaryButton from '../components/PrimaryButton';

const GIF_MAP = {
    'Clothes': '/GIFs/Recommendation GIFs/shirt-shoe.gif',
    'Songs': '/GIFs/Recommendation GIFs/music.gif',
    'Movies': '/GIFs/Recommendation GIFs/watching-movie.gif',
    'Books': '/GIFs/Recommendation GIFs/book.gif',
    'Places To Visit': '/GIFs/Recommendation GIFs/earth.gif',
    'Food To Try': '/GIFs/Recommendation GIFs/eating.gif',
    'Cafe / Restaurants': '/GIFs/Recommendation GIFs/eating.gif',
    'Other': '/GIFs/Recommendation GIFs/more.gif'
};

const RecommendationsAdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState('newest');
    const [selectedDates, setSelectedDates] = useState([]);
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'recommendations'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            const recs = [];
            querySnapshot.forEach((doc) => {
                recs.push({ id: doc.id, ...doc.data() });
            });

            setRecommendations(recs);
        } catch (error) {
            console.error("Error fetching recommendations: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchRecommendations();
        }
    }, [isAuthenticated]);

    const categories = ['All', ...new Set(recommendations.map(r => r.category))];

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Just now';
        return timestamp.toDate().toLocaleDateString();
    };

    const availableDates = [...new Set(recommendations.map(r => formatDate(r.createdAt)))].filter(Boolean);

    let filteredRecs = recommendations;

    // 1. Categorical Filter (Multi-select)
    if (selectedFilters.length > 0) {
        filteredRecs = filteredRecs.filter(r => selectedFilters.includes(r.category));
    }

    // 2. Search by Name/Title/Date/Platform String
    if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        filteredRecs = filteredRecs.filter(r =>
            r.submitterName?.toLowerCase().includes(q) ||
            r.name?.toLowerCase().includes(q) ||
            r.title?.toLowerCase().includes(q) ||
            r.songName?.toLowerCase().includes(q) ||
            r.brand?.toLowerCase().includes(q) ||
            r.dish?.toLowerCase().includes(q) ||
            r.location?.toLowerCase().includes(q) ||
            r.platform?.toLowerCase().includes(q) ||
            formatDate(r.createdAt).toLowerCase().includes(q)
        );
    }

    // 3. Filter by Selected Dates
    if (selectedDates.length > 0) {
        filteredRecs = filteredRecs.filter(r => selectedDates.includes(formatDate(r.createdAt)));
    }

    // 4. Sort by Date
    filteredRecs = [...filteredRecs].sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return sortMode === 'newest' ? timeB - timeA : timeA - timeB;
    });



    // We'll remove the top-level loading return and show it inline instead.

    // Animation variants for staggered list
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === import.meta.env.VITE_ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setPasswordError('');
        } else {
            setPasswordError('Incorrect passcode.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{
                        background: 'rgba(128,128,128,0.02)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        padding: 'clamp(1.5rem, 5vw, 3rem)',
                        borderRadius: '24px',
                        border: '1px solid rgba(128,128,128,0.1)',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
                        width: '100%',
                        maxWidth: '400px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Decorative Blob */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle at center, rgba(53, 196, 194, 0.05) 0%, transparent 50%)',
                        zIndex: 0,
                        pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            margin: '0 auto 1.5rem',
                            background: 'rgba(53, 196, 194, 0.08)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>

                        <h1 className="heading-serif" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Restricted Access</h1>
                        <p style={{ color: 'var(--subtle-color)', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: '1.5', fontFamily: 'var(--font-sans)' }}>
                            Please enter the passcode to view the vault.
                        </p>

                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    placeholder="Enter Password"
                                    value={passwordInput}
                                    onChange={(e) => {
                                        setPasswordInput(e.target.value);
                                        if (passwordError) setPasswordError('');
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.2rem',
                                        paddingLeft: '3rem',
                                        borderRadius: '12px',
                                        border: `1px solid ${passwordError ? '#ff4d4f' : 'rgba(128,128,128,0.2)'}`,
                                        background: 'var(--bg-color)',
                                        color: 'var(--text-color)',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        fontFamily: 'var(--font-sans)',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        if (!passwordError) e.target.style.borderColor = 'var(--teal-color)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(53, 196, 194, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        if (!passwordError) e.target.style.borderColor = 'rgba(128,128,128,0.2)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--subtle-color)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                                >
                                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                                </svg>
                            </div>

                            <AnimatePresence>
                                {passwordError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        style={{ overflow: 'hidden', paddingBottom: '0.5rem' }}
                                    >
                                        <div style={{ background: 'rgba(255, 74, 74, 0.1)', border: '1px solid rgba(255, 74, 74, 0.3)', color: '#ff4a4a', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
                                            {passwordError}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <PrimaryButton
                                type="submit"
                                style={{ marginTop: '0.5rem', width: '100%' }}
                            >
                                Enter Vault
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    <path d="M12 15v2"></path>
                                </svg>
                            </PrimaryButton>
                        </form>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ marginBottom: 'var(--spacing-lg)', padding: '0 0 2rem', textAlign: 'center' }}>
                <h1 className="heading-serif" style={{
                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                    lineHeight: '1.1',
                    maxWidth: '15ch',
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    The Vault.
                </h1>
                <p style={{ color: 'var(--subtle-color)', fontSize: '1.1rem', letterSpacing: '0.02em', marginTop: '1.5rem', fontFamily: 'var(--font-sans)', fontStyle: 'normal' }}>
                    Stored transmissions from the outside world. &nbsp; • &nbsp; <span style={{ color: 'var(--teal-color)' }}>{recommendations.length} {recommendations.length === 1 ? 'Signal' : 'Signals'}</span>
                </p>

                {/* High-end Editorial Filter Dashboard */}
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '3rem',
                    background: 'rgba(128,128,128,0.02)', border: '1px solid rgba(128,128,128,0.1)',
                    borderRadius: '24px', padding: '2rem', textAlign: 'left',
                    boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.02)',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingRight: '3rem' }}>

                        {/* Categories as Creative Multi-Select Tags */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--subtle-color)', fontWeight: 600, marginRight: '0.5rem' }}>Filter:</span>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'rgba(128,128,128,0.06)', borderRadius: '30px', padding: '0.3rem' }}>
                                <button
                                    onClick={() => setSelectedFilters([])}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        background: selectedFilters.length === 0 ? '#f2f9f9' : 'var(--bg-color)',
                                        color: selectedFilters.length === 0 ? 'var(--teal-color)' : 'var(--subtle-color)',
                                        border: `1px solid ${selectedFilters.length === 0 ? 'var(--teal-color)' : 'rgba(128,128,128,0.2)'}`,
                                        padding: '0.4rem 1.2rem', outline: 'none', cursor: 'pointer',
                                        fontSize: '0.85rem', borderRadius: '30px',
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        fontWeight: 500
                                    }}
                                >
                                    <img src="/GIFs/Recommendation GIFs/filter.gif" alt="All" style={{ width: '32px', height: '32px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                    All
                                </button>

                                {categories.filter(c => c !== 'All').map(cat => {
                                    const isSelected = selectedFilters.includes(cat);
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedFilters(selectedFilters.filter(c => c !== cat));
                                                } else {
                                                    setSelectedFilters([...selectedFilters, cat]);
                                                }
                                            }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                background: isSelected ? '#f2f9f9' : 'var(--bg-color)',
                                                color: isSelected ? 'var(--teal-color)' : 'var(--subtle-color)',
                                                border: `1px solid ${isSelected ? 'var(--teal-color)' : 'rgba(128,128,128,0.2)'}`,
                                                padding: '0.4rem 1.2rem', outline: 'none', cursor: 'pointer',
                                                fontSize: '0.85rem', borderRadius: '30px',
                                                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                                fontWeight: 500
                                            }}
                                        >
                                            {GIF_MAP[cat] && <img src={GIF_MAP[cat]} alt={cat} style={{ width: '32px', height: '32px', objectFit: 'contain', mixBlendMode: 'multiply' }} />}
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Top Right: Refetch Icon */}
                        <button
                            onClick={fetchRecommendations}
                            title="Refresh Vault Data"
                            style={{
                                background: 'transparent',
                                color: 'var(--subtle-color)',
                                border: '1px solid rgba(128,128,128,0.2)', cursor: 'pointer', padding: '0.6rem',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                outline: 'none', transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-color)'; e.currentTarget.style.transform = 'rotate(180deg) scale(1.1)'; e.currentTarget.style.borderColor = 'var(--teal-color)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--subtle-color)'; e.currentTarget.style.transform = 'rotate(0deg) scale(1)'; e.currentTarget.style.borderColor = 'rgba(128,128,128,0.2)'; }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                        </button>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(128,128,128,0.1)' }}></div>

                    {/* Secondary Filters: Name Search and Date Sort */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>

                        {/* Search Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexGrow: 1, maxWidth: '350px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--subtle-color)" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    type="text"
                                    placeholder="Search by name, title, brand..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        background: 'transparent', border: 'none', borderBottom: '1px solid rgba(128,128,128,0.3)',
                                        color: 'var(--text-color)', fontSize: '0.95rem', padding: '0.5rem 0', width: '100%', outline: 'none',
                                        fontFamily: 'var(--font-sans)', borderRadius: '0', transition: 'border-color 0.3s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--teal-color)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(128,128,128,0.3)'}
                                />
                            </div>
                        </div>

                        {/* Sort Dropdown as Animated Switch */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--subtle-color)', fontWeight: 600 }}>Sort Date:</span>
                            <div style={{ position: 'relative', display: 'flex', gap: '0.2rem', background: 'rgba(128,128,128,0.06)', borderRadius: '30px', padding: '0.3rem' }}>
                                {['newest', 'oldest'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setSortMode(mode)}
                                        style={{
                                            position: 'relative',
                                            background: 'transparent',
                                            color: sortMode === mode ? 'var(--teal-color)' : 'var(--subtle-color)',
                                            border: 'none', borderRadius: '30px', padding: '0.4rem 1.2rem', fontSize: '0.85rem',
                                            cursor: 'pointer', outline: 'none', transition: 'color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                            fontWeight: 500, zIndex: 2
                                        }}
                                    >
                                        {sortMode === mode && (
                                            <motion.div
                                                layoutId="sortModePill"
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                style={{
                                                    position: 'absolute', inset: 0,
                                                    background: 'rgba(53, 196, 194, 0.05)',
                                                    borderRadius: '30px', zIndex: -1
                                                }}
                                            />
                                        )}
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Timeframe Filter Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--subtle-color)', fontWeight: 600 }}>Filter Date:</span>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                                    style={{
                                        position: 'relative',
                                        background: selectedDates.length > 0 ? 'rgba(53, 196, 194, 0.05)' : 'rgba(128,128,128,0.06)',
                                        color: selectedDates.length > 0 ? 'var(--teal-color)' : 'var(--subtle-color)',
                                        border: 'none', borderRadius: '30px', padding: '0.4rem 1.2rem', fontSize: '0.85rem',
                                        cursor: 'pointer', outline: 'none', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        fontWeight: 500, zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    Select Dates {selectedDates.length > 0 && `(${selectedDates.length})`}
                                    <span style={{ fontSize: '0.6rem', transform: isDateDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
                                </button>

                                <AnimatePresence>
                                    {isDateDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, zIndex: 50,
                                                background: 'var(--bg-color)', border: '1px solid rgba(128,128,128,0.2)',
                                                borderRadius: '12px', padding: '1rem', minWidth: '200px',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxHeight: '300px', overflowY: 'auto'
                                            }}
                                        >
                                            {availableDates.length === 0 ? (
                                                <div style={{ color: 'var(--subtle-color)', fontSize: '0.85rem', textAlign: 'center' }}>No dates available</div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                    {availableDates.map(date => (
                                                        <label key={date} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                                                            <div style={{
                                                                width: '18px', height: '18px', border: `1.5px solid ${selectedDates.includes(date) ? 'var(--teal-color)' : 'rgba(128,128,128,0.5)'}`,
                                                                borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                background: selectedDates.includes(date) ? 'var(--teal-color)' : 'transparent',
                                                                transition: 'all 0.2s'
                                                            }}>
                                                                {selectedDates.includes(date) && (
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polyline points="20 6 9 17 4 12" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedDates.includes(date)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) setSelectedDates([...selectedDates, date]);
                                                                    else setSelectedDates(selectedDates.filter(d => d !== date));
                                                                }}
                                                                style={{ display: 'none' }}
                                                            />
                                                            {date}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        style={{ width: '40px', height: '40px', border: '3px solid rgba(128,128,128,0.2)', borderTopColor: 'var(--teal-color)', borderRadius: '50%' }}
                    />
                </div>
            ) : filteredRecs.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', color: 'var(--subtle-color)', padding: '5rem 0', border: '1px dashed rgba(128,128,128,0.2)', borderRadius: '20px' }}
                >
                    No signals intercepted for this category yet.
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1.5rem',
                        alignItems: 'stretch'
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {filteredRecs.map(rec => (
                            <motion.div
                                key={rec.id}
                                variants={itemVariants}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                style={{
                                    background: 'var(--bg-color)',
                                    border: '1px solid rgba(128,128,128,0.2)',
                                    borderRadius: '20px',
                                    padding: '1.8rem',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderColor: 'var(--teal-color)' }}
                            >
                                {/* Decorative gradient blob */}
                                <div style={{
                                    position: 'absolute', top: '-50px', right: '-50px',
                                    width: '100px', height: '100px',
                                    background: 'radial-gradient(circle, rgba(53, 196, 194, 0.15) 0%, rgba(0,0,0,0) 70%)',
                                    borderRadius: '50%', zIndex: 0
                                }} />

                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                        <div>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                padding: '0.3rem 0.8rem',
                                                background: '#fafafa',
                                                color: 'var(--text-color)',
                                                borderRadius: '30px',
                                                fontSize: '0.7rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                marginBottom: '0.8rem',
                                                border: '1px solid rgba(128,128,128,0.1)'
                                            }}>
                                                {GIF_MAP[rec.category] && <img src={GIF_MAP[rec.category]} alt={rec.category} style={{ width: '20px', height: '20px', objectFit: 'contain', mixBlendMode: 'multiply' }} />}
                                                {rec.category}
                                            </span>
                                            {rec.submitterName && (
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <div style={{
                                                        fontSize: '0.65rem',
                                                        color: 'var(--subtle-color)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        marginBottom: '0.2rem'
                                                    }}>Recommended By</div>
                                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                                                        <div style={{ width: '6px', height: '6px', background: 'var(--teal-color)', borderRadius: '50%' }}></div>
                                                        {rec.submitterName}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--subtle-color)', letterSpacing: '0.05em' }}>
                                            {formatDate(rec.createdAt)}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        {Object.entries(rec).map(([key, value]) => {
                                            if (['id', 'category', 'createdAt', 'submitterName', 'reason'].includes(key) || !value) return null;

                                            // Make Title/Name stand out more
                                            const isMainTitle = ['title', 'name', 'songName', 'brand', 'location', 'dish'].includes(key);

                                            return (
                                                <div key={key}>
                                                    <div style={{
                                                        fontSize: '0.7rem',
                                                        color: 'var(--subtle-color)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        marginBottom: '0.3rem'
                                                    }}>
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </div>
                                                    <div style={{
                                                        fontWeight: isMainTitle ? 600 : 400,
                                                        fontSize: isMainTitle ? '1.2rem' : '1rem',
                                                        fontFamily: isMainTitle ? 'var(--font-serif)' : 'var(--font-sans)',
                                                        color: 'var(--text-color)'
                                                    }}>
                                                        {key === 'link' ? (
                                                            <a href={value} target="_blank" rel="noreferrer" style={{ color: 'var(--teal-color)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                                                View Link
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                                                            </a>
                                                        ) : (
                                                            value
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {rec.reason && (
                                        <div style={{
                                            marginTop: 'auto',
                                            paddingTop: '1.5rem',
                                        }}>
                                            <div style={{
                                                background: 'rgba(128,128,128,0.05)',
                                                padding: '1.2rem',
                                                borderRadius: '12px',
                                                borderLeft: '2px solid var(--teal-color)'
                                            }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--subtle-color)', textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>Why</div>
                                                <div style={{
                                                    fontFamily: 'var(--font-serif)',
                                                    fontStyle: 'italic',
                                                    lineHeight: 1.6,
                                                    fontSize: '1.05rem',
                                                    color: 'var(--text-color)'
                                                }}>
                                                    "{rec.reason}"
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
};

export default RecommendationsAdminPage;
