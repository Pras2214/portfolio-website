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
        title: "Finance Dashboard",
        type: "UI Interface",
        layout: "desktop", // Standard 4:3
        desc: "A clean, modern dashboard for tracking personal expenses and investments.",
        stack: ["Figma", "React", "D3.js"],
        details: [
            { title: "The Problem", text: "Users struggled to visualize their spending habits across multiple accounts, leading to poor financial decisions.", imageColor: "#81ecec" },
            { title: "The Solution", text: "We unified all data streams into a single, intuitive dashboard with real-time categorization and budget tracking.", imageColor: "#00cec9" },
            { title: "Key Features", text: "Interactive charts, drag-and-drop budgeting, and AI-powered savings recommendations.", imageColor: "#74b9ff" }
        ]
    },
    {
        title: "Travel App Mobile",
        type: "UX Research",
        layout: "mobile", // Tall 9:16
        desc: "User journey mapping and high-fidelity prototyping for a travel booking app.",
        stack: ["UserTesting", "Figma", "Protopie"],
        details: [
            { title: "User Research", text: "Conducted interviews with 20 frequent travelers to identify pain points in current booking flows.", imageColor: "#fd79a8" },
            { title: "Wireframing", text: "Developed low-fidelity wireframes to test navigation structures and information hierarchy.", imageColor: "#e84393" },
            { title: "Prototyping", text: "Created a high-fidelity interactive prototype demonstrating the seamless booking experience.", imageColor: "#fab1a0" }
        ]
    },
    {
        title: "Brand Identity",
        type: "Graphic Design",
        layout: "square", // 1:1
        desc: "Complete visual identity including logo, typography, and guidelines.",
        stack: ["Illustrator", "Photoshop"],
        details: [
            { title: "Concept", text: "Explored themes of modernization and reliability to reflect the client's core values.", imageColor: "#a29bfe" },
            { title: "Typography", text: "Selected a custom serif typeface to convey elegance and authority.", imageColor: "#6c5ce7" },
            { title: "Application", text: "Applied the identity across business cards, digital assets, and merchandise.", imageColor: "#dfe6e9" }
        ]
    },
    {
        title: "E-Commerce Platform",
        type: "UI System",
        layout: "desktop",
        desc: "Scalable component library and page layouts for a fashion retailer.",
        stack: ["Storybook", "React", "Sass"],
        details: [
            { title: "Design System", text: "Built a atomic design system to ensure consistency across the platform.", imageColor: "#fab1a0" },
            { title: "Components", text: "Developed reusable components like buttons, inputs, and product cards.", imageColor: "#ff7675" },
            { title: "Integration", text: "Integrated components into the main application, improving development speed by 40%.", imageColor: "#fdcb6e" }
        ]
    },
    {
        title: "Healthcare Portal",
        type: "UX Design",
        layout: "a4_horizontal",
        desc: "Accessibility-focused patient portal for managing records and appointments.",
        stack: ["WCAG", "Sketch", "InVision"],
        details: [
            { title: "Accessibility", text: "Ensured WCAG 2.1 AA compliance for users with visual impairments.", imageColor: "#55efc4" },
            { title: "User Flow", text: "Streamlined the appointment booking process to reduce steps by 50%.", imageColor: "#00b894" },
            { title: "Testing", text: "Validated designs through usability testing with elderly patients.", imageColor: "#81ecec" }
        ]
    },
    {
        title: "Event Posters",
        type: "Graphic Design",
        layout: "a4_vertical",
        desc: "Series of typographic posters for a tech conference.",
        stack: ["Indesign", "After Effects"],
        details: [
            { title: "Visual Language", text: "Developed a bold, typographic visual language inspired by brutalism.", imageColor: "#ffeaa7" },
            { title: "Animation", text: "Created motion posters for social media to drive engagement.", imageColor: "#fdcb6e" },
            { title: "Print", text: "Managed print production for high-quality large format displays.", imageColor: "#e17055" }
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