import React, { useEffect, useState } from 'react';
import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// ------------------------------------------------------------------
// LOGIC: Handles Scroll Sync & Jump (Inside Canvas)
// ------------------------------------------------------------------
export function ProjectNavigationLogic({ data, setActiveIndex, setJumpTo }) {
    const scroll = useScroll();
    const GAP = 1.2;

    // Dynamic Scroll Constants (MUST MATCH ProjectStack)
    const topCardY = (data.length - 1) * GAP;
    const startY = -topCardY - 1.5;
    const endY = 0;
    const scrollRange = endY - startY;

    // Register Jump Function
    useEffect(() => {
        if (setJumpTo) {
            setJumpTo(() => (index) => {
                const targetGroupY = -index * GAP;
                let targetOffset = (targetGroupY - startY) / scrollRange;
                targetOffset = Math.max(0, Math.min(1, targetOffset));

                if (scroll && scroll.el) {
                    const scrollTarget = targetOffset * (scroll.el.scrollHeight - scroll.el.clientHeight);
                    scroll.el.scrollTo({ top: scrollTarget, behavior: 'smooth' });
                }
            });
        }
    }, [setJumpTo, scroll, scrollRange, startY, GAP]);

    // Sync Active Index
    useFrame(() => {
        if (!scroll || !scroll.el) return;
        const currentGroupY = startY + (scroll.offset * scrollRange);
        let idealIndex = -currentGroupY / GAP;
        idealIndex = Math.round(idealIndex);
        if (idealIndex < 0) idealIndex = 0;
        if (idealIndex >= data.length) idealIndex = data.length - 1;
        setActiveIndex(idealIndex);
    });

    return null;
}

// ------------------------------------------------------------------
// UI: The Visual Component (Outside Canvas)
// ------------------------------------------------------------------
export function ProjectNavigationUI({ data, activeIndex, onSelect, isProjectOpen = false }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!data) return null;

    // Reverse data for rendering so Index N (Top of Stack) is at Top of Screen
    // On mobile, we might want it left-to-right, but keeping the same order is fine.
    const reversedData = [...data].map((item, i) => ({ ...item, originalIndex: i })).reverse();

    return (
        <div style={{
            position: 'fixed',
            right: isMobile ? 'auto' : '40px',
            left: isMobile ? '50%' : 'auto',
            top: isMobile ? 'auto' : '50%',
            bottom: isMobile ? '30px' : 'auto',
            transform: isMobile ? 'translateX(-50%)' : 'translateY(-50%)',
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            alignItems: isMobile ? 'center' : 'flex-end',
            justifyContent: 'center',
            gap: isMobile ? '16px' : '12px', // Slightly larger gap on horizontal
            background: isMobile ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
            padding: isMobile ? '12px 24px' : '0',
            borderRadius: isMobile ? '30px' : '0',
            backdropFilter: isMobile ? 'blur(10px)' : 'none',
            WebkitBackdropFilter: isMobile ? 'blur(10px)' : 'none',
            border: isMobile ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
            boxShadow: isMobile ? '0 4px 16px rgba(0,0,0,0.05)' : 'none',
            zIndex: 100,
            opacity: (isMobile && isProjectOpen) ? 0 : 1,
            pointerEvents: (isMobile && isProjectOpen) ? 'none' : (isMobile ? 'auto' : 'none'),
            transition: 'opacity 0.3s ease'
        }}>
            {reversedData.map((project) => (
                <NavPill
                    key={project.originalIndex}
                    title={project.title}
                    type={project.type}
                    isActive={project.originalIndex === activeIndex}
                    onClick={() => onSelect && onSelect(project.originalIndex)}
                    isProjectOpen={isProjectOpen}
                    isMobile={isMobile}
                />
            ))}
        </div>
    );
}

const NavPill = ({ title, type, isActive, onClick, isProjectOpen, isMobile }) => {
    const [hover, setHover] = useState(false);
    const activeOrHover = isActive || hover;

    // Color Logic:
    // Active + Open Project -> Teal (Focus)
    // Active + Stack Browsing -> Dark Grey (Indicator)
    // Inactive -> Light Grey Transparent
    const activeColor = isProjectOpen ? 'var(--teal-color)' : '#666666';

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '24px' : 'auto',
                height: isMobile ? '24px' : '44px',
                paddingLeft: isMobile ? '0' : '20px',
                cursor: 'pointer',
                pointerEvents: 'auto',
                position: 'relative',
                transition: 'opacity 0.3s',
                zIndex: hover ? 1000 : 1 // Bring hovered item to front
            }}
        >
            {/* Project Title & Type Tooltip */}
            <div style={{
                position: 'absolute',
                right: isMobile ? 'auto' : '45px',
                bottom: isMobile ? '35px' : 'auto',
                left: isMobile ? '50%' : 'auto',
                opacity: activeOrHover ? 1 : 0,
                transform: activeOrHover ? (isMobile ? 'translateX(-50%) translateY(0)' : 'translateX(0)') : (isMobile ? 'translateX(-50%) translateY(10px)' : 'translateX(10px)'),
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                textAlign: isMobile ? 'center' : 'right',
                pointerEvents: 'none',
                // Restored Box (Smaller & Seamless)
                padding: '6px 12px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.4)', // More transparent
                backdropFilter: 'blur(2px)', // Stronger blur
                WebkitBackdropFilter: 'blur(2px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                whiteSpace: 'nowrap'
            }}>
                <div style={{
                    color: '#000',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    letterSpacing: '-0.01em',
                }}>
                    {title}
                </div>
                <div style={{
                    color: 'rgba(0,0,0,0.5)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    marginTop: '-2px',
                }}>
                    {type}
                </div>
            </div>

            {/* The Pill / Dot Indicator */}
            <div style={{
                width: isActive ? (isMobile ? '12px' : '32px') : (hover ? (isMobile ? '12px' : '32px') : (isMobile ? '8px' : '10px')),
                height: isActive ? (isMobile ? '12px' : '10px') : (hover ? (isMobile ? '12px' : '10px') : (isMobile ? '8px' : '10px')),
                background: isActive ? activeColor : 'rgba(0,0,0,0.3)',
                borderRadius: '20px',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                flexShrink: 0,
                boxShadow: isActive ? `0 0 0 ${isMobile ? '3px' : '4px'} ${isProjectOpen ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}` : 'none'
            }} />
        </div>
    );
};
