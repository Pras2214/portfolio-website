import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '150px',
                    margin: '0 auto 2rem'
                }}
            >
                {/* Giant 404 Text Background overlapping the GIF */}
                <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(8rem, 20vw, 15rem)',
                    fontWeight: 'bold',
                    lineHeight: 0.8,
                    color: 'var(--subtle-color)',
                    opacity: 0.05,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}>
                    404
                </div>

                {/* The GIF */}
                <img
                    src="/GIFs/404-error.gif"
                    alt="Error 404"
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        position: 'relative',
                        zIndex: 1,
                        mixBlendMode: 'multiply'
                    }}
                />
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="heading-serif"
                style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    margin: '0 0 1rem',
                    color: 'var(--text-color)'
                }}
            >
                Lost in the Void.
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.1rem',
                    color: 'var(--subtle-color)',
                    maxWidth: '400px',
                    lineHeight: '1.6',
                    margin: '0 0 2.5rem'
                }}
            >
                This coordinate is empty. It might be a future project, a redacted file, or a glitch in the matrix. Let's get you back on track.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Link to="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '1rem 2rem',
                    background: 'var(--text-color)',
                    color: 'var(--bg-color)',
                    textDecoration: 'none',
                    borderRadius: '30px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                    }}
                >
                    Return to Base
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
