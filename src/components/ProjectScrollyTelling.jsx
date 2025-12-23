import React, { useRef, useState, useEffect } from 'react';
import { Scroll, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export default function ProjectScrollyTelling({ project, onClose, visible = true }) {
    // Data Expected: project.details
    const details = project.details || [];
    const scroll = useScroll();
    const indicatorRef = useRef();
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        // Delay showing the hint so it appears after the card settles
        const timer = setTimeout(() => setShowHint(true), 500); // Faster entrance
        return () => clearTimeout(timer);
    }, []);

    useFrame((state, delta) => {
        if (indicatorRef.current && scroll) {
            // Fade out quickly as we scroll down
            // But respect the entrance animation too
            const scrollOpacity = Math.max(0, 1 - scroll.offset * 15);
            // Combine entrance opacity (0 or 0.7) with scroll opacity
            const baseOpacity = showHint ? 0.7 : 0;
            indicatorRef.current.style.opacity = Math.min(baseOpacity, scrollOpacity);
        }

        // Custom Snapping Logic
        if (scroll) {
            checkScroll(scroll, delta);
        }
    });

    // Custom Scroll Snapping Helper
    const isScrolling = useRef(false);
    const scrollTimeout = useRef(null);
    const lastScroll = useRef(0);

    const checkScroll = (scroll, delta) => {
        const currentScroll = scroll.offset;

        // Detect if scrolling happening
        if (Math.abs(currentScroll - lastScroll.current) > 0.0001) {
            isScrolling.current = true;
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

            // Set a timeout to detect when scrolling stops
            scrollTimeout.current = setTimeout(() => {
                isScrolling.current = false;
                snapToNearest(scroll);
            }, 50); // Reduced to 50ms for snappy response
        }
        lastScroll.current = currentScroll;
    };

    const snapToNearest = (scroll) => {
        const totalPages = details.length;
        if (totalPages <= 1) return;

        const scrollPerPage = 1 / (totalPages - 1);
        const currentScroll = scroll.offset;

        const nearestPage = Math.round(currentScroll / scrollPerPage);
        const targetScroll = nearestPage * scrollPerPage;

        // Smoothly scroll to the target
        // We use the DOM element's scrollTo which Drei exposes via scroll.el
        if (scroll.el) {
            const targetScrollTop = targetScroll * (scroll.el.scrollHeight - scroll.el.clientHeight);
            scroll.el.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        }
    };

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
                {/* Keyframes for bounce animation */}
                <style>{`
                    @keyframes jumpHint {
                        0%, 100% { transform: translate(-50%, 0); }
                        40% { transform: translate(-50%, -12px); }
                    }
                `}</style>
                {details.map((section, i) => (
                    <div key={i} style={{
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '8%',
                        boxSizing: 'border-box',
                        position: 'relative' // For absolute anchoring
                    }}>
                        {/* Scroll Reminder on First Slide Only */}
                        {i === 0 && (
                            <div
                                ref={indicatorRef}
                                style={{
                                    position: 'absolute',
                                    bottom: '0%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    textAlign: 'center',
                                    color: 'var(--text-color)',
                                    opacity: 0, // Controlled by ref for scroll, start at 0
                                    zIndex: 10,
                                    pointerEvents: 'none',
                                    // Entrance Animation
                                    filter: showHint ? 'blur(0px)' : 'blur(10px)',
                                    transition: 'opacity 0.8s ease, filter 0.8s ease',
                                    // Loop Animation
                                    animation: showHint ? 'jumpHint 1.5s ease-in-out infinite' : 'none'
                                }}
                            >
                                <p style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '1rem',
                                    marginBottom: '0.5rem'
                                }}>Scroll to explore</p>
                                <div style={{
                                    width: '1px',
                                    height: '40px',
                                    background: 'var(--text-color)',
                                    margin: '0 auto',
                                    opacity: 0.5
                                }}></div>
                            </div>
                        )}

                        {/* The Text Card (Stops Propagation so clicking text doesn't close) */}
                        <div
                            style={{
                                maxWidth: '450px',
                                padding: '2rem',
                                paddingLeft: '3rem', // Space for accent
                                // Magazine Style: Minimalist, just clean typography + glass hint
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                position: 'relative', // For absolute accent
                                transform: `translateY(${i % 2 === 0 ? '0' : '40px'})`,
                                transition: 'transform 0.5s ease',
                            }}
                        >
                            {/* Creative Accent Bar */}
                            <div style={{
                                position: 'absolute',
                                left: '0',
                                top: '2.5rem',
                                width: '4px',
                                height: '40px',
                                background: 'var(--text-color)',
                                borderRadius: '0 4px 4px 0',
                                opacity: 0.8
                            }}></div>
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
                            {/* Flexible Content Rendering */}
                            {section.uxChallenge ? (
                                <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-color)' }}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '0.25rem' }}>The UX Challenge</h3>
                                        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 300, margin: 0 }}>{section.uxChallenge}</p>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '0.25rem' }}>The HCI Solution</h3>
                                        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 300, margin: 0 }}>{section.hciSolution}</p>
                                    </div>

                                    {section.features && (
                                        <ul style={{ paddingLeft: '1.2rem', fontSize: '1rem', lineHeight: 1.6, opacity: 0.9 }}>
                                            {section.features.map((feature, fIdx) => (
                                                <li key={fIdx} style={{ marginBottom: '0.5rem' }}>
                                                    <strong>{feature.title}:</strong> {feature.desc}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <div style={{
                                    fontFamily: 'var(--font-sans)',
                                    color: 'var(--text-color)',
                                }}>
                                    <p style={{
                                        fontSize: '1.1rem',
                                        lineHeight: 1.7,
                                        opacity: 0.9,
                                        fontWeight: 300,
                                        marginBottom: '1.5rem'
                                    }}>
                                        {section.text}
                                    </p>

                                    {section.stack && (
                                        <div>
                                            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '0.5rem' }}>Core Stack</h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {section.stack.map((tech, tIdx) => (
                                                    <span key={tIdx} style={{
                                                        fontSize: '0.85rem',
                                                        padding: '4px 10px',
                                                        borderRadius: '15px',
                                                        background: 'rgba(0,0,0,0.05)',
                                                        color: 'var(--text-color)',
                                                        opacity: 0.8
                                                    }}>
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Scroll>
    );
}