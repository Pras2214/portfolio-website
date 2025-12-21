import React from 'react';
import { Scroll } from '@react-three/drei';

export default function ProjectScrollyTelling({ project, onClose, visible = true }) {
    // Data Expected: project.details
    const details = project.details || [];

    return (
        <Scroll html style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
            {/* Click Anywhere Wrapper to Close */}
            <div
                style={{
                    width: '100vw',
                    height: '100%',
                    position: 'relative',
                    cursor: 'pointer',
                    opacity: visible ? 1 : 0,
                    pointerEvents: visible ? 'auto' : 'none',
                    transition: 'opacity 0.5s ease',
                }}
                onPointerUp={(e) => {
                    // Use onPointerUp to catch clicks/touches better
                    // Check if target is not the text card (double safety)
                    if (e.target === e.currentTarget) {
                        onClose && onClose();
                    }
                }}
            >
                {details.map((section, i) => (
                    <div key={i} style={{
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '8%',
                        boxSizing: 'border-box'
                    }}>
                        {/* The Text Card (Stops Propagation so clicking text doesn't close) */}
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: '450px',
                                cursor: 'auto', // Reset cursor
                                padding: '2rem',
                                // Magazine Style: Minimalist, no heavy box, just clean typography + glass hint
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                borderLeft: '4px solid var(--text-color)',
                                transform: `translateY(${i % 2 === 0 ? '0' : '40px'})`,
                                transition: 'transform 0.5s ease',
                            }}
                        >
                            <span style={{
                                display: 'block',
                                fontSize: '4rem',
                                fontFamily: 'var(--font-serif)',
                                fontWeight: '700',
                                color: 'rgba(0,0,0,0.05)',
                                lineHeight: 0.5,
                                marginLeft: '-20px',
                                marginBottom: '-10px'
                            }}>
                                0{i + 1}
                            </span>
                            <h2 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '3rem',
                                margin: '0 0 1rem',
                                color: 'var(--text-color)',
                                lineHeight: 1.1,
                                fontStyle: 'italic'
                            }}>
                                {section.title}
                            </h2>
                            <div style={{ width: '40px', height: '2px', background: 'var(--text-color)', marginBottom: '1.5rem', opacity: 0.5 }}></div>
                            <p style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '1.1rem',
                                lineHeight: 1.7,
                                color: 'var(--text-color)',
                                opacity: 0.9,
                                fontWeight: 300
                            }}>
                                {section.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </Scroll>
    );
}