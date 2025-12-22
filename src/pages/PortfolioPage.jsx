import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ScrollControls, useScroll } from '@react-three/drei';
import ProjectStack from '../components/ProjectStack';
import ProjectScrollyTelling from '../components/ProjectScrollyTelling';
import { ProjectNavigationLogic, ProjectNavigationUI } from '../components/ProjectNavigation';

// Scroll Management Component
const ScrollSync = ({ activeId }) => {
    const scroll = useScroll();
    const lastScroll = useRef(0);
    // We use a ref to track if we just deactivated to avoid overwriting lastScroll with 0 during the transition
    const wasActive = useRef(false);

    useEffect(() => {
        if (activeId !== null) {
            // Entering Project Mode: Save stack position
            lastScroll.current = scroll.offset;
            wasActive.current = true;

            // Reset scroll to top for the article
            // Use a slight timeout to ensure DOM update has happened if pages changed
            requestAnimationFrame(() => {
                scroll.el.scrollTop = 0;
            });
        } else if (wasActive.current) {
            // Exiting Project Mode: Restore stack position
            wasActive.current = false;

            // Restore scroll position based on saved offset
            // We need to wait for the DOM to update to the new (shorter) height
            requestAnimationFrame(() => {
                const scrollHeight = scroll.el.scrollHeight;
                const height = scroll.el.clientHeight;
                if (scrollHeight > height) {
                    const targetTop = lastScroll.current * (scrollHeight - height);
                    scroll.el.scrollTop = targetTop;
                }
            });
        }
    }, [activeId, scroll]);

    return null;
};

const PROJECT_DATA = [
    {
        title: "Smartagent",
        type: "Desktop App",
        layout: "desktop",
        desc: "A smart desktop application for agents.",
        stack: ["React", "Electron", "Node.js"],
        coverImage: "/Smartagent photos/WhatsApp Image 2025-12-16 at 10.30.53.jpeg",
        details: [
            { title: "Smartagent AI", text: "Advanced AI integration for smarter agents.", imageColor: "#81ecec", image: "/Smartagent photos/WhatsApp Image 2025-12-16 at 10.30.53.jpeg" },
            { title: "Workflow", text: "Streamlined workflow automation.", imageColor: "#00cec9", image: "/Smartagent photos/WhatsApp Image 2025-12-16 at 10.31.05.jpeg" },
            { title: "Analytics", text: "Real-time analytics and reporting.", imageColor: "#74b9ff", image: "/Smartagent photos/WhatsApp Image 2025-12-16 at 10.31.57.jpeg" }
        ]
    },
    {
        title: "Tezi",
        type: "Desktop App",
        layout: "desktop",
        desc: "A powerful desktop application for productivity.",
        stack: ["Rust", "Tauri", "React"],
        coverImage: "/Tezi photos/WhatsApp Image 2025-12-16 at 10.44.04.jpeg",
        details: [
            { title: "Speed", text: "Lightning fast performance.", imageColor: "#fd79a8", image: "/Tezi photos/WhatsApp Image 2025-12-16 at 10.44.04.jpeg" },
            { title: "Security", text: "Enterprise grade security.", imageColor: "#e84393", image: "/Tezi photos/WhatsApp Image 2025-12-16 at 10.46.06.jpeg" },
            { title: "Integration", text: "Seamless integration with existing tools.", imageColor: "#fab1a0", image: "/Tezi photos/WhatsApp Image 2025-12-16 at 10.46.21.jpeg" }
        ]
    },
    {
        title: "Fork it",
        type: "Mobile App",
        layout: "mobile",
        desc: "A collaborative social food discovery platform.",
        stack: ["React Native", "Firebase", "Google Maps API"],
        coverImage: "/Fork it Photos/WhatsApp Image 2025-12-20 at 19.41.31.jpeg",
        details: [
            { title: "Discovery", text: "Find the best spots near you.", imageColor: "#fab1a0", image: "/Fork it Photos/WhatsApp Image 2025-12-20 at 19.41.31.jpeg" },
            { title: "Social", text: "Share and collaborate on food lists.", imageColor: "#ff7675", image: "/Fork it Photos/WhatsApp Image 2025-12-20 at 21.34.45.jpeg" },
            { title: "Maps", text: "Interactive map view for foodies.", imageColor: "#fd79a8", image: "/Fork it Photos/WhatsApp Image 2025-12-20 at 21.39.28.jpeg" }
        ]
    }
];

const PortfolioPage = () => {
    const [activeId, setActiveId] = useState(null);
    const activeProject = activeId !== null ? PROJECT_DATA[activeId] : null;
    const lastActiveProject = useRef(null);
    if (activeProject) {
        lastActiveProject.current = activeProject;
    }

    // Navigation State
    const [navIndex, setNavIndex] = useState(0);
    const jumpToProjectRef = useRef(null);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            background: 'var(--bg-color)', // Global Theme BG
            color: 'var(--text-color)', // Global Text
        }}>
            {/* 3D Scene */}
            <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
                <Suspense fallback={null}>
                    <color attach="background" args={['#f7f5f3']} />
                    {/* Note: Canvas doesn't support var(). We know paper theme is #f7f5f3.
                        Ideally we pass this from a prop or context, but hardcoding for now to match.
                    */}
                    <ambientLight intensity={0.7} />
                    <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={1} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} />

                    {/* Background Clik Handler */}
                    <mesh
                        position={[0, 0, -10]}
                        onClick={() => setActiveId(null)}
                        visible={true}
                    >
                        <planeGeometry args={[100, 100]} />
                        <meshBasicMaterial transparent opacity={0} />
                    </mesh>

                    {/* UNIFIED SCROLL CONTROLS */}
                    {/*
                        If activeId is null, we need pages for the stack (e.g., 3).
                        If activeId is set, we need pages for the story (details.length).
                        Changing 'pages' prop might force a reset, but usually keepMounted?
                        The 'key' prop forces remount. We REMOVE 'key' to allow transition.
                    */}
                    <ScrollControls
                        pages={activeId === null ? 3 : (activeProject?.details.length || 3)}
                        damping={0.2}
                    >
                        <ProjectStack activeId={activeId} setActiveId={setActiveId} data={PROJECT_DATA} />
                        <ScrollSync activeId={activeId} />
                        {/* Navigation Logic (Inside Canvas) */}
                        {activeId === null && (
                            <ProjectNavigationLogic
                                data={PROJECT_DATA}
                                setActiveIndex={setNavIndex}
                                setJumpTo={(fn) => jumpToProjectRef.current = fn}
                            />
                        )}

                        {/* Render HTML Details Overlay */}
                        {/* We keep it mounted (but hidden) if we have a lastActiveProject to allow fade out 
                            or to preventing 'ghosting' issues with unmounting Scroll components abruptly. */}
                        {(activeProject || lastActiveProject.current) && (
                            <ProjectScrollyTelling
                                project={activeProject || lastActiveProject.current}
                                onClose={() => setActiveId(null)}
                                visible={!!activeProject}
                            />
                        )}
                    </ScrollControls>

                    <Environment preset="studio" />
                </Suspense>
            </Canvas>

            {/* Navigation UI (Always Visible) */}
            <ProjectNavigationUI
                data={PROJECT_DATA}
                activeIndex={activeId !== null ? activeId : navIndex}
                onSelect={(i) => setActiveId(i)}
                isProjectOpen={activeId !== null}
            />

            {/* Title Overlay (Visible when no project active) */}
            <div style={{
                position: 'absolute',
                top: '120px',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                width: 'auto', // Changed to auto to fit content
                pointerEvents: 'none',
                maxWidth: '800px',
                zIndex: 10,
                opacity: activeId === null ? 1 : 0,
                transition: 'opacity 0.5s ease',

                // Unified Magazine Style (Matching ProjectScrollyTelling)
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                padding: '2rem',
                borderRadius: '20px',
            }}>
                <h1 className="experience-title" style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                    fontStyle: 'italic',
                    marginBottom: '0.5rem',
                    textTransform: 'none',
                    letterSpacing: 'normal',
                    color: 'var(--text-color)',
                    margin: 0
                }}>Work</h1>
                <p style={{
                    color: 'var(--subtle-color)',
                    fontSize: '1.1rem',
                    marginTop: '0.5rem',
                    fontFamily: 'var(--font-sans)',
                    marginBottom: 0
                }}>
                    Selected UI/UX and Graphic Design projects.<br />
                    <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Scroll to explore.</span>
                </p>
            </div>

            {/* Back Button (Fixed) - Moved down to clear Navbar */}
            {activeProject && (
                <button
                    onClick={() => setActiveId(null)}
                    style={{
                        position: 'fixed', // Fixed to stay visible on scroll
                        top: '140px',
                        left: '40px',
                        background: 'var(--text-color)',
                        color: 'var(--bg-color)',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        fontFamily: 'var(--font-sans)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s ease',
                        zIndex: 2000 // Higher than everything
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    <span>←</span> Back
                </button>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default PortfolioPage;