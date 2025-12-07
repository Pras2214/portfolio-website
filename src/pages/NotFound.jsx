import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
            textAlign: 'center',
            opacity: 0,
            animation: 'fadeIn 0.8s ease forwards'
        }}>
            <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(4rem, 10vw, 8rem)',
                margin: 0,
                lineHeight: 1,
                color: 'var(--text-color)'
            }}>
                404
            </h1>
            <p style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.5rem',
                color: 'var(--subtle-color)',
                margin: '1rem 0 2rem'
            }}>
                You've wandered off the map.
            </p>
            <p style={{
                maxWidth: '400px',
                fontSize: '1rem',
                lineHeight: '1.6',
                color: 'var(--subtle-color)',
                marginBottom: '3rem'
            }}>
                This coordinate is empty. It might be a future project, a past memory, or just a typo. Let's guide you back to known territory.
            </p>
            <Link to="/" style={{
                display: 'inline-block',
                padding: '0.8rem 2rem',
                border: '1px solid var(--text-color)',
                borderRadius: '50px',
                color: 'var(--text-color)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
            }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'var(--text-color)';
                    e.target.style.color = 'var(--bg-color)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--text-color)';
                }}
            >
                Return to Base
            </Link>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default NotFound;
