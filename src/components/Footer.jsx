import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            padding: '4rem 0',
            marginTop: 'auto',
            borderTop: '1px solid #eaeaea'
        }}>
            <div className="flex-between" style={{ alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--subtle-color)' }}>
                        &copy; {new Date().getFullYear()} Prasann Parikh
                    </span>
                    <span className="animated-credit" style={{ fontFamily: "var(--font-serif)", fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 'bold' }}>
                        Designed & Crafted by Prasann Parikh
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {/* X (Twitter) */}
                    <a href="https://x.com/prasann_parikh?s=20" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-color)', display: 'flex' }} aria-label="X (Twitter)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
                            <g transform="scale(8.53333,8.53333)">
                                <path d="M26.37,26l-8.795,-12.822l0.015,0.012l7.93,-9.19h-2.65l-6.46,7.48l-5.13,-7.48h-6.95l8.211,11.971l-0.001,-0.001l-8.66,10.03h2.65l7.182,-8.322l5.708,8.322zM10.23,6l12.34,18h-2.1l-12.35,-18z" fill="currentColor"></path>
                            </g>
                        </svg>
                    </a>

                    {/* LinkedIn */}
                    <a href="https://www.linkedin.com/in/prasannparikh/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-color)', display: 'flex' }} aria-label="LinkedIn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 30 30">
                            <path d="M24,4H6C4.895,4,4,4.895,4,6v18c0,1.105,0.895,2,2,2h18c1.105,0,2-0.895,2-2V6C26,4.895,25.105,4,24,4z M10.954,22h-2.95 v-9.492h2.95V22z M9.449,11.151c-0.951,0-1.72-0.771-1.72-1.72c0-0.949,0.77-1.719,1.72-1.719c0.948,0,1.719,0.771,1.719,1.719 C11.168,10.38,10.397,11.151,9.449,11.151z M22.004,22h-2.948v-4.616c0-1.101-0.02-2.517-1.533-2.517 c-1.535,0-1.771,1.199-1.771,2.437V22h-2.948v-9.492h2.83v1.297h0.04c0.394-0.746,1.356-1.533,2.791-1.533 c2.987,0,3.539,1.966,3.539,4.522V22z" fill="currentColor"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
