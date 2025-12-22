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
    if (!data) return null;

    // Reverse data for rendering so Index N (Top of Stack) is at Top of Screen
    const reversedData = [...data].map((item, i) => ({ ...item, originalIndex: i })).reverse();

    return (
        <div style={{
            position: 'fixed',
            right: '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '12px', // Slightly larger gap for vertical timeline look
            zIndex: 100,
            pointerEvents: 'none'
        }}>
            {reversedData.map((project) => (
                <NavPill
                    key={project.originalIndex}
                    title={project.title}
                    type={project.type}
                    isActive={project.originalIndex === activeIndex}
                    onClick={() => onSelect && onSelect(project.originalIndex)}
                    isProjectOpen={isProjectOpen}
                />
            ))}
        </div>
    );
}

const NavPill = ({ title, type, isActive, onClick, isProjectOpen }) => {
    const [hover, setHover] = useState(false);
    const activeOrHover = isActive || hover;

    // Color Logic:
    // Active + Open Project -> Black (Focus)
    // Active + Stack Browsing -> Dark Grey (Indicator)
    // Inactive -> Light Grey Transparent
    const activeColor = isProjectOpen ? '#000000' : '#666666';

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '44px',
                paddingLeft: '20px',
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
                right: '45px',
                opacity: activeOrHover ? 1 : 0,
                transform: activeOrHover ? 'translateX(0)' : 'translateX(10px)',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                textAlign: 'right',
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
                width: isActive ? '32px' : (hover ? '32px' : '10px'),
                height: isActive ? '10px' : (hover ? '10px' : '10px'),
                background: isActive ? activeColor : 'rgba(0,0,0,0.3)',
                borderRadius: '20px',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                flexShrink: 0,
                boxShadow: isActive ? `0 0 0 4px ${isProjectOpen ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}` : 'none'
            }} />
        </div>
    );
};
