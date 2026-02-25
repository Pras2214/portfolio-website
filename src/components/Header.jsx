import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false); // Desktop dropdown
    const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobile menu
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location]);

    // Prevent scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileOpen]);

    return (
        <header className="site-header flex-between">
            <div className="header-logo">
                <Link to="/" className='text-uppercase'>
                    <span style={{ fontFamily: 'var(--font-serif)' }}>Prasann Parikh</span>
                </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="desktop-nav">
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                    About
                </Link>
                <Link to="/experience" className={`nav-link ${location.pathname === '/experience' ? 'active' : ''}`}>
                    Experience
                </Link>
                <Link to="/projects" className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}>
                    Side Projects
                </Link>
                <Link to="/portfolio" className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`}>
                    Portfolio
                </Link>
                <Link to="/recommend" className={`nav-link ${location.pathname === '/recommend' ? 'active' : ''}`}>
                    Recommend
                </Link>

                <div
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                    style={{ position: 'relative', display: 'inline-block' }}
                >
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            fontFamily: 'inherit',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            color: 'var(--text-color)',
                            outline: 'none',
                            minWidth: '80px',
                            textAlign: 'right',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.3rem'
                        }}
                    >
                        Connect <span>{isOpen ? '−' : '+'}</span>
                    </button>

                    {isOpen && (
                        <div
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                paddingTop: '1rem',
                                zIndex: 100
                            }}>
                            <div style={{
                                background: 'var(--bg-color)',
                                border: '1px solid #eaeaea',
                                padding: '1rem',
                                borderRadius: '8px',
                                minWidth: '220px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <li>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--subtle-color)', marginBottom: '0.2rem' }}>EMAIL</span>
                                        <a href="mailto:parikhprasann@gmail.com" style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>parikhprasann@gmail.com</a>
                                    </li>
                                    <li>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--subtle-color)', marginBottom: '0.2rem' }}>PHONE</span>
                                        <a href="tel:+917990688967" style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>+91 7990688967</a>
                                    </li>
                                    <li style={{ borderTop: '1px solid #eaeaea', paddingTop: '0.75rem' }}>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--subtle-color)', marginBottom: '0.2rem' }}>RESUME</span>
                                        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>View Resume</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Nav Toggle */}
            <button
                className="mobile-nav-toggle"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle menu"
            >
                {isMobileOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                )}
            </button>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileOpen ? 'open' : ''}`}>
                <Link to="/" className="mobile-menu-link">About</Link>
                <Link to="/recommend" className="mobile-menu-link">Recommend</Link>
                <Link to="/experience" className="mobile-menu-link">Experience</Link>
                <Link to="/projects" className="mobile-menu-link">Side Projects</Link>
                <Link to="/portfolio" className="mobile-menu-link">Portfolio</Link>

                <div className="mobile-connect-section">
                    <div className="mobile-connect-title">Connect</div>
                    <div className="mobile-connect-items">
                        <div className="mobile-connect-item">
                            <span>Email</span>
                            <a href="mailto:parikhprasann@gmail.com">parikhprasann@gmail.com</a>
                        </div>
                        <div className="mobile-connect-item">
                            <span>Phone</span>
                            <a href="tel:+917990688967">+91 7990688967</a>
                        </div>
                        <div className="mobile-connect-item">
                            <span>Resume</span>
                            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">View Resume</a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
