import React, { Suspense, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ScrollControls, useScroll, Scroll } from '@react-three/drei';
import ProjectStack from '../components/ProjectStack';
import ProjectScrollyTelling from '../components/ProjectScrollyTelling';
import { ProjectNavigationLogic, ProjectNavigationUI } from '../components/ProjectNavigation';

// Scroll Bridge Component (Pumps scroll offset to a shared ref)
const ScrollBridge = ({ scrollRef }) => {
    const scroll = useScroll();
    useFrame(() => {
        if (scrollRef) {
            scrollRef.current = scroll.offset;
        }
    });
    return null;
};

const HtmlScrollSync = ({ htmlRef }) => {
    const scroll = useScroll(); // This works because it will be INSIDE the Stack ScrollControls

    useFrame(() => {
        if (htmlRef.current && scroll) {
            // Scroll offset goes from 0 to 1
            // We want to move the text UP as we scroll down.
            // Adjust the multiplier to control speed.
            const offset = scroll.offset * window.innerHeight * 2; // Move up by 2 viewport heights over full scroll
            htmlRef.current.style.transform = `translateY(-${offset}px)`;
            // Opacity fade out
            htmlRef.current.style.opacity = 1 - scroll.offset * 3;
            if (htmlRef.current.style.opacity < 0) htmlRef.current.style.opacity = 0;
        }
    });
    return null;
}

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
            { title: "Lists", text: "Create and share curated lists.", imageColor: "#fdcb6e", image: "/Fork it Photos/WhatsApp Image 2025-12-20 at 21.35.13.jpeg" }
        ]
    },
    {
        title: "Nidhi TBI",
        type: "Design",
        layout: "a4_vertical",
        desc: "Visual identity and event assets for Nidhi TBI.",
        stack: ["Illustrator", "Photoshop", "InDesign"],
        coverImage: "/Nidhi TBI photos/IMG_1145.jpeg",
        details: [
            { title: "Event Branding", text: "Comprehensive branding for TBI events.", imageColor: "#74b9ff", image: "/Nidhi TBI photos/IMG_1145.jpeg" },
            { title: "Poster Design", text: "Engaging posters for outreach.", imageColor: "#0984e3", image: "/Nidhi TBI photos/IMG_2399.jpeg" },
            { title: "Social Media", text: "Digital assets for social campaigns.", imageColor: "#6c5ce7", image: "/Nidhi TBI photos/IMG_4215.jpeg" },
            { title: "Merchandise", text: "Custom merchandise design.", imageColor: "#a29bfe", image: "/Nidhi TBI photos/IMG_9367.jpeg" }
        ]
    },
    {
        title: "IIC Brochure",
        type: "Print Design",
        layout: "a4_vertical",
        desc: "Official brochure design for IIC.",
        stack: ["InDesign", "Photoshop"],
        coverImage: "/IIC Brochure photos/IMG_0034.jpeg",
        details: [
            { title: "Cover Design", text: "Impactful brochure cover.", imageColor: "#55efc4", image: "/IIC Brochure photos/IMG_0034.jpeg" },
            { title: "Layout", text: "Clean and readable typographic layout.", imageColor: "#00b894", image: "/IIC Brochure photos/IMG_4727.jpeg" },
            { title: "Infographics", text: "Data visualization for statistics.", imageColor: "#81ecec", image: "/IIC Brochure photos/IMG_5780.jpeg" },
            { title: "Print Ready", text: "High-resolution print assets.", imageColor: "#00cec9", image: "/IIC Brochure photos/IMG_7984.jpeg" }
        ]
    },
    {
        title: "Startup Weekend",
        type: "Event Branding",
        layout: "a4_vertical",
        desc: "Branding and collateral for Startup Weekend.",
        stack: ["Illustrator", "Photoshop"],
        coverImage: "/Startup weekend photos/IMG_0705.jpeg",
        details: [
            { title: "Identity", text: "Dynamic visual identity for the weekend.", imageColor: "#ffeaa7", image: "/Startup weekend photos/IMG_0705.jpeg" },
            { title: "Banners", text: "Large format environmental graphics.", imageColor: "#fdcb6e", image: "/Startup weekend photos/IMG_2498.jpeg" },
            { title: "Apparel", text: "T-shirt and energetic designs.", imageColor: "#fab1a0", image: "/Startup weekend photos/IMG_4020.jpeg" },
            { title: "Digital", text: "Social media and screen assets.", imageColor: "#ff7675", image: "/Startup weekend photos/IMG_4113.jpeg" },
            { title: "Signage", text: "Wayfinding and event signage.", imageColor: "#e17055", image: "/Startup weekend photos/IMG_4467.jpeg" },
            { title: "Collateral", text: "Badges, stickers, and more.", imageColor: "#d63031", image: "/Startup weekend photos/IMG_7705.jpeg" }
        ]
    },
    {
        title: "National Startup Day '24",
        type: "Event Design",
        layout: "a4_horizontal",
        desc: "Design suite for National Startup Day 2024.",
        stack: ["Photoshop", "Illustrator"],
        coverImage: "/National startup day'24 photos/IMG_0536.jpeg",
        details: [
            { title: "Key Visual", text: "Main event visual theme.", imageColor: "#a29bfe", image: "/National startup day'24 photos/IMG_0536.jpeg" },
            { title: "Stage Design", text: "Backdrop and stage graphics.", imageColor: "#6c5ce7", image: "/National startup day'24 photos/IMG_8115.jpeg" }
        ]
    },
    {
        title: "National Startup Day",
        type: "Event Design",
        layout: "a4_vertical",
        desc: "Brand assets for National Startup Day.",
        stack: ["Illustrator", "InDesign"],
        coverImage: "/National Startup Day photos/IMG_3590.jpeg",
        details: [
            { title: "Poster", text: "Event announcement poster.", imageColor: "#81ecec", image: "/National Startup Day photos/IMG_3590.jpeg" },
            { title: "Brochure", text: "Informational brochure spread.", imageColor: "#00cec9", image: "/National Startup Day photos/IMG_7580.jpeg" },
            { title: "Socials", text: "Instagram and LinkedIn assets.", imageColor: "#0984e3", image: "/National Startup Day photos/IMG_8460.jpeg" }
        ]
    },
    {
        title: "AirX",
        type: "Warranty Card",
        layout: "a4_horizontal",
        desc: "Warranty card design for AirX.",
        stack: ["Photoshop", "Illustrator"],
        coverImage: "/AirX warranty card photos/3 copy.png",
        details: [
            { title: "Front", text: "Clean and modern front layout.", imageColor: "#ffffff", image: "/AirX warranty card photos/3 copy.png" },
            { title: "Back", text: "Detailed warranty information.", imageColor: "#eeeeee", image: "/AirX warranty card photos/4 copy.png" }
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

    // HTML Title Ref for Sync
    const titleRef = useRef(null);

    // 3D Scene Ready State for Fade-In
    const [is3DReady, setIs3DReady] = useState(false);

    // Shared Scroll Ref (Offset 0-1)
    const scrollRef = useRef(0);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            background: '#f7f5f3', // Match Canvas Background to prevent flash
            color: 'var(--text-color)',
        }}>
            {/* HTML Title Overlay (Rendered OUTSIDE Canvas for instant load) */}
            <div
                ref={titleRef}
                style={{
                    position: 'absolute',
                    top: '8rem',
                    left: '0',
                    width: '100%',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    zIndex: 10,
                    opacity: activeId === null ? 1 : 0, // Hide when project is active
                    transition: 'opacity 0.5s ease'
                }}
            >
                <h1 className="experience-title" style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                    fontStyle: 'italic',
                    marginBottom: '1rem',
                    textTransform: 'none',
                    letterSpacing: 'normal',
                    color: 'var(--text-color)'
                }}>Work</h1>
                <p style={{
                    color: 'var(--subtle-color)',
                    fontSize: '1.1rem',
                    marginTop: '0.5rem',
                    fontFamily: 'var(--font-sans)',
                    marginBottom: 0
                }}>
                    Selected UI/UX and Graphic Design projects.<br />
                    <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Scroll to explore. Click to view.</span>
                </p>
            </div>

            {/* 3D Scene Wrapper for Smooth Fade-In */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: is3DReady ? 1 : 0,
                transition: 'opacity 1s ease-out'
            }}>
                <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
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

                    {/* 1. PERSISTENT: 3D Stack (Stays mounted, preserves animations) */}
                    <Suspense fallback={null}>
                        <ProjectStack
                            activeId={activeId}
                            setActiveId={setActiveId}
                            data={PROJECT_DATA}
                            onLoad={() => setIs3DReady(true)}
                            scrollRef={scrollRef} // Reads from the shared ref
                        />
                    </Suspense>

                    <Suspense fallback={null}>
                        <Environment preset="studio" />
                    </Suspense>

                    {/* 2. CONDITIONAL: Stack Mode Scroll Manager */}
                    {activeId === null && (
                        <ScrollControls
                            key="stack-scroll" // Unique key for fresh mount
                            pages={3}
                            damping={0.2}
                        >
                            <ScrollBridge scrollRef={scrollRef} />
                            <HtmlScrollSync htmlRef={titleRef} />

                            {/* Navigation Logic */}
                            <ProjectNavigationLogic
                                data={PROJECT_DATA}
                                setActiveIndex={setNavIndex}
                                setJumpTo={(fn) => jumpToProjectRef.current = fn}
                            />
                        </ScrollControls>
                    )}

                    {/* 3. CONDITIONAL: Project Mode Scroll Manager */}
                    {activeId !== null && (
                        <ScrollControls
                            key="project-scroll" // Unique key for fresh mount
                            pages={activeProject?.details.length || 3}
                            damping={0.2}
                        >
                            <ScrollBridge scrollRef={scrollRef} /> {/* Pump active scroll to ref for cards */}

                            {/* Render HTML Details Overlay */}
                            <ProjectScrollyTelling
                                project={activeProject || lastActiveProject.current} // Use last active to prevent crash if unmount race, though key protects valid render
                                onClose={() => setActiveId(null)}
                                visible={!!activeProject}
                            />
                        </ScrollControls>
                    )}

                    {/* Render ghost scrollytelling to allow fade out is tricky here.
                        If we unmount ScrollControls, the children unmount instantly.
                        ProjectScrollyTelling handles its own HTML. If it is unmounted, HTML vanishes.
                        To have "fade out", we might need a workaround, but for now, "Distinct Separation" is priority.
                        Immediate disappear is acceptable if it fixes the major bugs.
                    */}

                </Canvas>
            </div>

            {/* Navigation UI (Always Visible) */}
            <ProjectNavigationUI
                data={PROJECT_DATA}
                activeIndex={activeId !== null ? activeId : navIndex}
                onSelect={(i) => setActiveId(i)}
                isProjectOpen={activeId !== null}
            />




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