import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <header style={{
            padding: '1.25rem 2rem',
            marginBottom: '4rem',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: 'var(--bg-color)',
            transition: 'background-color 0.3s ease',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }} className="flex-between">
            <div style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
                <Link to="/" style={{ color: 'var(--text-color)', fontFamily: 'var(--font-family)', fontWeight: 600 }} className='text-uppercase'>Prasann Parikh</Link>
            </div>
            <nav style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4rem' }}>
                <Link to="/experience" style={{ fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 500, textDecoration: 'none' }}>Experience</Link>

                <Link to="/projects" style={{ fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 500, textDecoration: 'none' }}>Projects</Link>

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
                            minWidth: '80px', // Prevent shift of container if any
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
                                paddingTop: '1rem', // Gap filler to prevent mouse leave
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
        </header>
    );
};

export default Header;
