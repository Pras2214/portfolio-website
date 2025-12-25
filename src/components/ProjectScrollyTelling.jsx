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
                        paddingLeft: '5%',
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
                                }}>Scroll for more</p>
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
                                maxWidth: '480px',
                                padding: '2rem',
                                paddingLeft: '2.5rem',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                                backdropFilter: 'blur(28px) saturate(180%)',
                                borderRadius: '20px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                position: 'relative',
                                boxShadow: `
                                    0 1px 1px rgba(0, 0, 0, 0.03),
                                    0 2px 2px rgba(0, 0, 0, 0.03),
                                    0 4px 4px rgba(0, 0, 0, 0.03),
                                    0 8px 8px rgba(0, 0, 0, 0.03),
                                    0 16px 16px rgba(0, 0, 0, 0.03),
                                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                                `,
                                overflow: 'hidden'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Floating Geometric Accent - Top Right */}
                            <div style={{
                                position: 'absolute',
                                top: '-40px',
                                right: '-40px',
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }}></div>

                            {/* Geometric Line Accent - Left */}
                            <div style={{
                                position: 'absolute',
                                left: '0',
                                top: '30%',
                                width: '2px',
                                height: '40%',
                                background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                                borderRadius: '2px'
                            }}></div>

                            {/* Large Decorative Number with Shadow */}
                            <span style={{
                                display: 'block',
                                fontSize: '4rem',
                                fontFamily: 'var(--font-serif)',
                                fontWeight: '700',
                                color: 'rgba(0, 0, 0, 0.05)',
                                lineHeight: 0.5,
                                marginLeft: '-8px',
                                marginBottom: '0px',
                                userSelect: 'none',
                                position: 'relative',
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.02)',
                                zIndex: 1
                            }}>
                                0{i + 1}
                            </span>

                            {/* Title with Subtle Shadow */}
                            <h2 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '2.25rem',
                                margin: '-0.2rem 0 1rem 0.5rem',
                                color: 'var(--text-color)',
                                lineHeight: 1.1,
                                fontStyle: 'italic',
                                fontWeight: '600',
                                position: 'relative',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                zIndex: 1
                            }}>
                                {section.title}
                            </h2>

                            {/* Decorative Multi-Line Divider */}
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '40px',
                                    height: '2px',
                                    background: 'var(--text-color)',
                                    opacity: 0.4,
                                    borderRadius: '2px'
                                }}></div>
                                <div style={{
                                    width: '8px',
                                    height: '2px',
                                    background: 'var(--text-color)',
                                    opacity: 0.25,
                                    borderRadius: '2px'
                                }}></div>
                            </div>

                            {/* Content */}
                            <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-color)', position: 'relative', zIndex: 1 }}>
                                {/* Overview Section - Special Design */}
                                {section.text ? (
                                    <>
                                        <p style={{
                                            fontSize: '1.15rem',
                                            lineHeight: 1.75,
                                            fontWeight: '300',
                                            margin: '0 0 2rem',
                                            color: 'var(--text-color)',
                                            opacity: 0.9,
                                            letterSpacing: '0.3px'
                                        }}>
                                            {section.text}
                                        </p>

                                        {/* Tech Stack */}
                                        {section.stack && section.stack.length > 0 && (
                                            <div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    marginBottom: '0.85rem',
                                                    paddingLeft: '0px'
                                                }}>
                                                    <div style={{
                                                        width: '3px',
                                                        height: '14px',
                                                        background: 'var(--text-color)',
                                                        opacity: 0.5,
                                                        borderRadius: '1px'
                                                    }}></div>
                                                    <div style={{
                                                        fontSize: '0.8rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '2.5px',
                                                        fontWeight: '700',
                                                        color: 'var(--text-color)',
                                                        opacity: 0.75
                                                    }}>
                                                        Tech Stack
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '8px',
                                                    paddingLeft: '0px'
                                                }}>
                                                    {section.stack.map((tech, tIdx) => (
                                                        <span key={tIdx} style={{
                                                            fontSize: '0.85rem',
                                                            padding: '6px 14px',
                                                            borderRadius: '20px',
                                                            background: 'rgba(0, 0, 0, 0.04)',
                                                            border: '1px solid rgba(0, 0, 0, 0.08)',
                                                            color: 'var(--text-color)',
                                                            opacity: 0.8,
                                                            fontWeight: '500',
                                                            letterSpacing: '0.3px',
                                                            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.03)'
                                                        }}>
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Problem Section */}
                                        {section.problem && (
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    marginBottom: '0.6rem',
                                                    paddingLeft: '0px'
                                                }}>
                                                    <div style={{
                                                        width: '3px',
                                                        height: '14px',
                                                        background: 'var(--text-color)',
                                                        opacity: 0.5,
                                                        borderRadius: '1px'
                                                    }}></div>
                                                    <div style={{
                                                        fontSize: '0.8rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '2.5px',
                                                        fontWeight: '700',
                                                        color: 'var(--text-color)',
                                                        opacity: 0.75
                                                    }}>
                                                        Problem
                                                    </div>
                                                </div>
                                                <p style={{
                                                    fontSize: '0.95rem',
                                                    lineHeight: 1.55,
                                                    fontWeight: '400',
                                                    margin: 0,
                                                    color: 'var(--text-color)',
                                                    opacity: 0.85,
                                                    paddingLeft: '4px'
                                                }}>
                                                    {section.problem}
                                                </p>
                                            </div>
                                        )}

                                        {/* Solution Section */}
                                        {section.solution && (
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    marginBottom: '0.6rem',
                                                    paddingLeft: '0px'
                                                }}>
                                                    <div style={{
                                                        width: '3px',
                                                        height: '14px',
                                                        background: 'var(--text-color)',
                                                        opacity: 0.5,
                                                        borderRadius: '1px'
                                                    }}></div>
                                                    <div style={{
                                                        fontSize: '0.8rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '2.5px',
                                                        fontWeight: '700',
                                                        color: 'var(--text-color)',
                                                        opacity: 0.75
                                                    }}>
                                                        Solution
                                                    </div>
                                                </div>
                                                <p style={{
                                                    fontSize: '0.95rem',
                                                    lineHeight: 1.55,
                                                    fontWeight: '400',
                                                    margin: 0,
                                                    color: 'var(--text-color)',
                                                    opacity: 0.85,
                                                    paddingLeft: '4px'
                                                }}>
                                                    {section.solution}
                                                </p>
                                            </div>
                                        )}

                                        {/* Key Points */}
                                        {section.bullets && section.bullets.length > 0 && (
                                            <div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    marginBottom: '0.7rem',
                                                    paddingLeft: '0px'
                                                }}>
                                                    <div style={{
                                                        width: '3px',
                                                        height: '14px',
                                                        background: 'var(--text-color)',
                                                        opacity: 0.5,
                                                        borderRadius: '1px'
                                                    }}></div>
                                                    <div style={{
                                                        fontSize: '0.8rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '2.5px',
                                                        fontWeight: '700',
                                                        color: 'var(--text-color)',
                                                        opacity: 0.75
                                                    }}>
                                                        Key Points
                                                    </div>
                                                </div>
                                                <ul style={{
                                                    margin: 0,
                                                    padding: 0,
                                                    paddingLeft: '4px',
                                                    listStyle: 'none'
                                                }}>
                                                    {section.bullets.map((bullet, bIdx) => (
                                                        <li key={bIdx} style={{
                                                            fontSize: '0.875rem',
                                                            lineHeight: 1.5,
                                                            marginBottom: '0.5rem',
                                                            paddingLeft: '1.2rem',
                                                            position: 'relative',
                                                            color: 'var(--text-color)',
                                                            opacity: 0.75
                                                        }}>
                                                            <span style={{
                                                                position: 'absolute',
                                                                left: '0',
                                                                top: '0.45rem',
                                                                width: '6px',
                                                                height: '6px',
                                                                border: '1.5px solid var(--text-color)',
                                                                borderRadius: '50%',
                                                                opacity: 0.4,
                                                                boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)'
                                                            }}></span>
                                                            {bullet}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Scroll>
    );
}