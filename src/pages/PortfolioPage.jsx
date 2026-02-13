import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ScrollControls, useScroll } from '@react-three/drei';
import ProjectStack from '../components/ProjectStack';
import ProjectScrollyTelling from '../components/ProjectScrollyTelling';
import { ProjectNavigationLogic, ProjectNavigationUI } from '../components/ProjectNavigation';

import LoadingScreen from '../components/LoadingScreen';

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

const HtmlScrollSync = ({ htmlRef, shouldSyncRef }) => {
    const scroll = useScroll(); // This works because it will be INSIDE the Stack ScrollControls

    useFrame(() => {
        // Guard against race condition where this runs after component is effectively unmounted or state changed
        if (htmlRef.current && scroll && (!shouldSyncRef || shouldSyncRef.current)) {
            // Scroll offset goes from 0 to 1
            // We want to move the text UP as we scroll down.
            // Adjust the multiplier to control speed.
            const offset = scroll.offset * window.innerHeight * 2; // Move up by 2 viewport heights over full scroll
            htmlRef.current.style.transform = `translateY(-${offset}px)`;
        }
    });
    return null;
}

// Scroll Restorer Component (Restores saved scroll position when returning to stack)
const ScrollRestorer = ({ savedScrollRef }) => {
    const scroll = useScroll();

    // Restore scroll position on mount
    useEffect(() => {
        if (savedScrollRef.current > 0 && scroll) {
            // Try multiple methods with increasing delays to ensure restoration works
            const restore = () => {
                // Method 1: Set scroll.current directly
                if (scroll.scroll?.current !== undefined) {
                    scroll.scroll.current = savedScrollRef.current;
                }

                // Method 2: Set via el.scrollTop as fallback
                if (scroll.el) {
                    const targetScrollTop = savedScrollRef.current * (scroll.el.scrollHeight - scroll.el.clientHeight);
                    scroll.el.scrollTop = targetScrollTop;
                }
            };

            // Try restoration with multiple animation frames for reliability
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    restore();
                    // Try again after a small delay to ensure it sticks
                    setTimeout(restore, 50);
                });
            });
        }
    }, []);

    return null;
};

const PROJECT_DATA = [
    {
        title: "Nidhi TBI",
        type: "Impact Report",
        layout: "a4_vertical",
        heroNote: "Visualizing Startup Growth through Data Storytelling.",
        desc: "Annual impact report detailing fund utilization and startup success stories for PDEU IIC.",
        stack: ["Photoshop", "Canva"],
        coverImage: "/Nidhi TBI photos/Cover-image-and-diamond-shape-images.jpeg",
        details: [
            {
                title: "Overview",
                text: "PDEU IIC is a Nidhi TBI certified incubator. This report presents fund utilization and startup achievements to the certifying government body.",
                stack: ["Photoshop", "Canva"],
                image: "/Nidhi TBI photos/Cover-image-and-diamond-shape-images.jpeg"
            },
            {
                title: "Geometric Info Arch",
                problem: "Presenting diverse industries (Biotech to Robotics) without visual clutter.",
                solution: "Modular tessellation to give every sector equal 'visual share'.",
                bullets: [
                    "Diamond frames act as individual data containers.",
                    "Centralized hardware imagery anchors the technical output."
                ],
                image: "/Nidhi TBI photos/Cover-image-and-diamond-shape-images.jpeg"
            },
            {
                title: "High-Density Metrics",
                problem: "Stakeholders overwhelmed by massive financial and operational datasets.",
                solution: "Non-linear dashboard using information chunking to group metrics.",
                bullets: [
                    "Bold integers allow for rapid data auditing.",
                    "Blue-Green gradients link psychologically to growth and technology."
                ],
                image: "/Nidhi TBI photos/Fostering-innovation-square-blocks.jpeg"
            },
            {
                title: "Case Study Hierarchy",
                problem: "Technical descriptions bury success signals like funding and patents.",
                solution: "Standardized component library for fixed-location key indicators.",
                bullets: [
                    "Reduces interaction cost for cross-startup comparisons.",
                    "Icon-based encoding provides a visual shortcut to content meaning."
                ],
                image: "/Nidhi TBI photos/Fund-raising.jpeg"
            },
            {
                title: "Medical AI Viz",
                problem: "Displaying sensitive medical data requires technical accuracy and readability.",
                solution: "Contextual framing placing detection boxes directly on X-ray scans.",
                bullets: [
                    "Visual bounding boxes explain AI logic transparently.",
                    "Strategic logo placement creates brand-solution association."
                ],
                image: "/Nidhi TBI photos/Manentia-advisory.jpeg"
            }
        ]
    },
    {
        title: "Startup Weekend",
        type: "Event Report",
        layout: "a4_vertical",
        heroNote: "Capturing 54 Hours of High-Octane Entrepreneurship.",
        desc: "Visual identity and logistics material for a 54-hour startup ideathon and pitching event.",
        stack: ["Photoshop", "Canva"],
        coverImage: "/Startup weekend photos/Cover-Image.jpeg",
        details: [
            {
                title: "Overview",
                text: "A report on an intensive weekend ideathon where aspiring entrepreneurs pitch ideas, form teams, and work with mentors to validate business models.",
                stack: ["Photoshop", "Canva"],
                image: "/Startup weekend photos/Cover-Image.jpeg"
            },
            {
                title: "Quantitative Salience",
                problem: "High-volume event data is difficult to parse in text-heavy formats.",
                solution: "Large-scale numerical callouts to create a glanceable success dashboard.",
                bullets: [
                    "Scales font sizes based on quantitative importance.",
                    "Uses white space as a structural element to ensure readability."
                ],
                image: "/Startup weekend photos/Key-Statistics.jpeg"
            },
            {
                title: "Strategic Narrative",
                problem: "Stakeholders need to understand the 'Why' behind the intensive event.",
                solution: "Asymmetric grids pairing global branding with mission-focused copy.",
                bullets: [
                    "Aligns with global Techstars visual language to establish credibility.",
                    "Places primary mission statements at the top of the hierarchy."
                ],
                image: "/Startup weekend photos/Introductory-page.jpeg"
            },
            {
                title: "Mentorship Grid",
                problem: "Differentiating between mentors and participants in busy reports.",
                solution: "Selective colorization to identify mentors as high-priority entities.",
                bullets: [
                    "Full-color profiles against desaturated backgrounds create role distinction.",
                    "Uniform 3x4 grid provides equal visual weight to experts."
                ],
                image: "/Startup weekend photos/Mentors.jpeg"
            },
            {
                title: "Process Wayfinding",
                problem: "Readers lose track of the startup's 54-hour evolutionary journey.",
                solution: "Z-pattern layout to chronologically guide the eye through pitching phases.",
                bullets: [
                    "Overlapping frames create motion, reflecting the high-speed environment.",
                    "Large headers differentiate Practice vs. Final Jury results."
                ],
                image: "/Startup weekend photos/Mock-Pitching.jpeg"
            },
            {
                title: "Institutional Trust",
                problem: "University reports require a balance of student energy and formal authority.",
                solution: "Metric-first footer providing hard institutional data and infrastructure proof.",
                bullets: [
                    "Color-coded school cards map the multidisciplinary ecosystem.",
                    "Large campus imagery provides geographic and institutional anchoring."
                ],
                image: "/Startup weekend photos/University-Stats.jpeg"
            }
        ]
    },
    {
        title: "AirX",
        type: "Product Guide",
        layout: "a4_horizontal",
        heroNote: "Simplifying Biotech Maintenance for Home Users.",
        desc: "Warranty card and user guide for the airX CO2-filtering purifier.",
        stack: ["Photoshop", "Canva"],
        coverImage: "/AirX Warranty Card Photos/Cover-image.png",
        details: [
            {
                title: "Overview",
                text: "A comprehensive manual facilitating correct product usage, FAQ resolution, and warranty registration for airX users.",
                stack: ["Photoshop", "Canva"],
                image: "/AirX Warranty Card Photos/Cover-image.png"
            },
            {
                title: "Visual Onboarding",
                problem: "Biotech setup is intimidating, leading to incorrect hardware usage.",
                solution: "Pictorial wayfinding breaking setup into five low-text steps.",
                bullets: [
                    "Combines simple icons with one-line minimalist syntax.",
                    "Red 'Critical' box prevents damage by highlighting RO water needs."
                ],
                image: "/AirX Warranty Card Photos/Getting-Started.png"
            },
            {
                title: "Info Scannability",
                problem: "Users face 'Cognitive Overload' from dense legal warranty terms.",
                solution: "Visual categorization using traffic-light iconography.",
                bullets: [
                    "Red/Green signaling allows for rapid policy 'skim-reading'.",
                    "3-tier chunking reduces total perceived mental workload."
                ],
                image: "/AirX Warranty Card Photos/What's-Covered.png"
            },
            {
                title: "Maintenance Roadmap",
                problem: "Users forget care tasks, leading to preventable system failure.",
                solution: "Linear progress roadmap serving as a physical action prompt.",
                bullets: [
                    "Color-coded milestones (20/90 days) signal required care.",
                    "Two-word directives ensure high maintenance compliance."
                ],
                image: "/AirX Warranty Card Photos/Maintenance-Schedule.png"
            },
            {
                title: "Strategic FAQ",
                problem: "Support teams are often overwhelmed by routine product queries.",
                solution: "Organized repository of 15 FAQs addressing core technical concerns.",
                bullets: [
                    "Bolded Q-A pairings facilitate rapid specific concern retrieval.",
                    "Mentions validation markers to build product credibility."
                ],
                image: "/AirX Warranty Card Photos/FAQ.png"
            },
            {
                title: "Accountability",
                problem: "Warranty claims are often rejected due to a lack of maintenance records.",
                solution: "Integrated physical validation section for user tracking.",
                bullets: [
                    "Signature line acts as a commitment device for care adherence.",
                    "Fields for Serial No. and date ensure system traceability."
                ],
                image: "/AirX Warranty Card Photos/Signature-&-Personal-Details.png"
            }
        ]
    },
    {
        title: "Fork it",
        type: "AI Social Media",
        layout: "mobile",
        heroNote: "Collaborative Narrative Branching via Generative AI.",
        desc: "A collaborative video platform allowing users to 'branch' storylines using Generative AI.",
        stack: ["React", "Shadcn", "Framer-motion"],
        coverImage: "/Fork it Photos/Cover-image.jpeg",
        details: [
            {
                title: "Overview",
                text: "A next-gen social platform where creators 'fork' video narratives at key moments, using AI prompts to direct unique storylines.",
                stack: ["React", "Shadcn", "Framer-motion"],
                image: "/Fork it Photos/Cover-image.jpeg"
            },
            {
                title: "Collaborative Lineage",
                problem: "Passive consumption lacks a path for creative participation.",
                solution: "Non-linear timeline visualizing the narrative 'ancestry' of a video.",
                bullets: [
                    "Simplifies complex AI-branching into a scannable vertical list.",
                    "Anchors current versions to creators to maintain community ownership."
                ],
                image: "/Fork it Photos/Story-timeline.jpeg"
            },
            {
                title: "Reducing Prompt Anxiety",
                problem: "Creative 'blank page syndrome' prevents user generation of AI content.",
                solution: "Contextual prompt overlay appearing at specific fork points.",
                bullets: [
                    "Pre-fills context to bridge the gap toward creation.",
                    "Semi-transparent backdrop maintains focus on the source content."
                ],
                image: "/Fork it Photos/What-happens-next.jpeg"
            },
            {
                title: "Director Controls",
                problem: "AI 'Black Boxes' offer zero control over cinematic output.",
                solution: "The Director’s Deck: mobile-first parametric cinematography suite.",
                bullets: [
                    "Familiar icons (Pan, Zoom) for filmmaking logic.",
                    "Tactile hierarchy places primary actions in the thumb-zone."
                ],
                image: "/Fork it Photos/Director's-Deck.jpeg"
            },
            {
                title: "Latency Management",
                problem: "High-latency AI processes cause frustration without visible system feedback.",
                solution: "Dynamic status indicators providing real-time system state visibility.",
                bullets: [
                    "Pulse labels confirm active generation to manage expectations.",
                    "Input guarding prevents conflicting commands during processing."
                ],
                image: "/Fork it Photos/Director's-Deck.jpeg"
            },
            {
                title: "Quality Assurance",
                problem: "Jarring AI results break story immersion and user confidence.",
                solution: "Post-generation preview screen providing technical validation.",
                bullets: [
                    "Consistency scores quantify style-matching to reassure users.",
                    "Iterative loops allow for instant trial-and-error via 'Regenerate'."
                ],
                image: "/Fork it Photos/Your-fork-is-ready.jpeg"
            }
        ]
    },
    {
        title: "Kayaan Prints Mobile",
        type: "B2B Marketplace",
        layout: "mobile",
        heroNote: "Conversational Commerce for Bulk Procurement.",
        desc: "An AI-powered B2B commerce app for browsing catalogs and chatting with support agents.",
        stack: ["Figma", "React Native", "Framer-motion", "PDF Make"],
        coverImage: "/Kayaan Mobile photos/Cover-image-and-conversation-list.jpg",
        details: [
            {
                title: "Overview",
                text: "Combines a marketplace with an AI-first chat interface, allowing buyers to query invoices and place orders via text.",
                stack: ["Figma", "React Native", "Framer-motion", "PDF Make"],
                image: "/Kayaan Mobile photos/Cover-image-and-conversation-list.jpg"
            },
            {
                title: "NL Discovery",
                problem: "Navigating high-density wholesale catalogs on small screens is high-friction.",
                solution: "Contextual AI retrieval via text and audio commands.",
                bullets: [
                    "Intent recognition generates actionable, high-fidelity product cards.",
                    "Replaces complex filter menus with direct conversational results."
                ],
                image: "/Kayaan Mobile photos/Chat-interface-\"show-me-sarees\".jpeg"
            },
            {
                title: "Voice-to-Task",
                problem: "Hands-on warehouse workers find manual typing inefficient.",
                solution: "Voice-driven workflows for requesting data and reports.",
                bullets: [
                    "Hands-free triggers for backend tasks like dispatch reports.",
                    "Clear error-handling dialogues manage AI data retrieval gaps."
                ],
                image: "/Kayaan Mobile photos/Chat-screen-with-audio-message.jpeg"
            },
            {
                title: "High-Density Triage",
                problem: "Price-sensitive B2B products cause decision fatigue on small screens.",
                solution: "Optimized product grid prioritizing pricing and stock status visually.",
                bullets: [
                    "Prominent discount badges facilitate rapid financial triage.",
                    "Action buttons placed in natural thumb-reach for high-speed use."
                ],
                image: "/Kayaan Mobile photos/Product-Grid.jpg"
            },
            {
                title: "Auto Deployment",
                problem: "Moving from chat to formal documentation is high-friction.",
                solution: "Zero-navigation logic delivering invoices directly in-thread.",
                bullets: [
                    "Delivers critical business files without leaving the conversation.",
                    "Ensures real-time access to logistics and tax data."
                ],
                image: "/Kayaan Mobile photos/AI-response-and-dispatch-report.jpg"
            }
        ]
    },
    {
        title: "Kayaan Dashboard",
        type: "B2B Admin Dashboard",
        layout: "desktop",
        heroNote: "Centralizing Enterprise Resource Planning.",
        desc: "A centralized admin panel for managing products, analytics, and buyer broadcasts.",
        stack: ["Figma", "React", "Material UI", "Framer-motion", "PDF Make"],
        coverImage: "/Kayaan photos/Cover-image-and-main-dashboard.jpg",
        details: [
            {
                title: "Overview",
                text: "Empowers executives to upload inventory, analyze business metrics, and send targeted promotional broadcasts to buyers.",
                stack: ["Figma", "React", "Material UI", "Framer-motion", "PDF Make"],
                image: "/Kayaan photos/Cover-image-and-main-dashboard.jpg"
            },
            {
                title: "Data Synthesis",
                problem: "Critical business health metrics are hidden by 'Data Fragmentation'.",
                solution: "High-density dashboard aggregating disparate data into a visual hierarchy.",
                bullets: [
                    "Color-coded status cards allow for pre-attentive processing.",
                    "Interactive charts reveal seasonal revenue patterns at a glance."
                ],
                image: "/Kayaan photos/Cover-image-and-main-dashboard.jpg"
            },
            {
                title: "Standardized Inventory",
                problem: "Navigating massive catalogs causes choice overload and slow triage.",
                solution: "Standardized component library ensuring fixed-location key data points.",
                bullets: [
                    "Uniform pill-tags facilitate rapid inventory filtering.",
                    "High-contrast status badges provide immediate visibility."
                ],
                image: "/Kayaan photos/Product-grid.jpg"
            },
            {
                title: "Logic Config",
                problem: "Configuring B2B upcharge rules is traditionally error-prone.",
                solution: "Rules configuration interface using human-readable modular blocks.",
                bullets: [
                    "Logic chunking prevents cognitive overload during financial setup.",
                    "Live previews reduce the risk of pricing misconfiguration."
                ],
                image: "/Kayaan photos/Deals.jpg"
            },
            {
                title: "Direct Marketing",
                problem: "B2B updates often feel 'cold,' leading to low engagement.",
                solution: "Contextual broadcast hub pairing live previews with outgoing messages.",
                bullets: [
                    "Familiar chat layout reduces learning curve for operations staff.",
                    "Real-time previews ensure accuracy before deployment."
                ],
                image: "/Kayaan photos/Broadcast-screen.jpg"
            },
            {
                title: "User Triage",
                problem: "Manually managing broadcast lists is tedious and leads to exclusions.",
                solution: "Tri-column drag-and-drop system for physical spatial grouping.",
                bullets: [
                    "Tapping icons to move members reduces interaction cost.",
                    "Explicit 'Dont send' column acts as a visual safety net."
                ],
                image: "/Kayaan photos/Create-Broadcast.jpg"
            }
        ]
    },
    {
        title: "Smart Agent",
        type: "Bookkeeping Software",
        layout: "desktop",
        heroNote: "Unified Financial Oversight for Textile Agents.",
        desc: "A comprehensive bookkeeping tool for textile agents to manage orders and commissions.",
        stack: ["React", "Material UI", "Shadcn", "LottieFiles", "PDF Make", "React-hot-keys-hook"],
        coverImage: "/Smartagent Photos/Cover-image.png",
        details: [
            {
                title: "Overview",
                text: "A dedicated system for B2B agents to track orders, invoices, payments, and commission analytics in one unified view.",
                stack: ["React", "Material UI", "Shadcn", "LottieFiles", "PDF Make", "React-hot-keys-hook"],
                image: "/Smartagent Photos/Cover-image.png"
            },
            {
                title: "Data Viz Summary",
                problem: "Agents struggle with fragmented financial indicators.",
                solution: "Centralized analytical dashboard translating raw data into hierarchy.",
                bullets: [
                    "Donut charts allow for instant debt-aging comparisons.",
                    "Cognitive offloading reduces manual cross-referencing needs."
                ],
                image: "/Smartagent Photos/Dashboard-graphs.png"
            },
            {
                title: "Prioritized Flow",
                problem: "Managing dozens of clients leads to context-switching fatigue.",
                solution: "Card-based UI acting as a prioritized 'To-Do List'.",
                bullets: [
                    "High-contrast red alerts direct attention to due amounts.",
                    "Direct WhatsApp/Call buttons allow for instant action."
                ],
                image: "/Smartagent Photos/Company-Cards.png"
            },
            {
                title: "Complex Transactions",
                problem: "B2B order placement involves many moving parts and high error risk.",
                solution: "Modular task blocks guiding users through logistical steps.",
                bullets: [
                    "Progressive disclosure prevents form fatigue.",
                    "Strategic button anchoring identifies primary interaction paths."
                ],
                image: "/Smartagent Photos/Add-order.png"
            },
            {
                title: "Financial Validation",
                problem: "Typing errors in TDS/commissions lead to audit discrepancies.",
                solution: "Master-detail layout with a persistent real-time sidebar.",
                bullets: [
                    "Sidebar acts as a calculated 'Safety Net' for all inputs.",
                    "Automated balancing prevents post-submission discrepancies."
                ],
                image: "/Smartagent Photos/Add-payment.png"
            },
            {
                title: "Database Scannability",
                problem: "Traditional ledger layouts are often illegible, leading to slow data retrieval.",
                solution: "High-density searchable repository using established IA principles.",
                bullets: [
                    "Pill-based navigation maps directly to the user's mental model.",
                    "Integrated export functions recognize the need for offline records."
                ],
                image: "/Smartagent Photos/Invoice-list.png"
            }
        ]
    },
    {
        title: "Tezi",
        type: "B2B Platform",
        layout: "desktop",
        heroNote: "Frictionless B2B Onboarding and Negotiation.",
        desc: "A digital ecosystem connecting B2B buyers and sellers with AI-assisted negotiation.",
        stack: ["Figma", "React", "Material UI", "Shadcn", "Framer-motion", "React PDF"],
        coverImage: "/Tezi Photos/Cover-image-and-Login-screen.png",
        details: [
            {
                title: "Overview",
                text: "Facilitates direct B2B trade by allowing sellers to create storefronts and buyers to negotiate orders via AI support.",
                stack: ["Figma", "React", "Material UI", "Shadcn", "Framer-motion", "React PDF"],
                image: "/Tezi Photos/Cover-image-and-Login-screen.png"
            },
            {
                title: "Entry Friction",
                problem: "Complex B2B tools suffer high drop-off from 'form fatigue'.",
                solution: "Passwordless authentication to minimize initial cognitive load.",
                bullets: [
                    "Single primary action directs the user's focus.",
                    "OTP-based entry ensures security without password memory."
                ],
                image: "/Tezi Photos/Cover-image-and-Login-screen.png"
            },
            {
                title: "Grid Architecture",
                problem: "Managing massive inventories causes information overload.",
                solution: "High-density data grid for rapid SKU scanning and management.",
                bullets: [
                    "Alternating row highlights minimize horizontal reading drift.",
                    "Persistent success toasts confirm system state without disruption."
                ],
                image: "/Tezi Photos/Product-list.png"
            },
            {
                title: "Data Transparency",
                problem: "Buyers hesitate without instant bulk-vs-retail margin visibility.",
                solution: "Digital showroom view automating profit-margin analysis.",
                bullets: [
                    "Side-by-side Bulk/MRP display automates mental math.",
                    "Integrated QR code allows for phygital inventory verification."
                ],
                image: "/Tezi Photos/Product-Detail-view.png"
            },
            {
                title: "Entity Management",
                problem: "Business onboarding requires high accuracy for credit and legal compliance.",
                solution: "Modal-based progressive forms to compartmentalize legal data.",
                bullets: [
                    "Dedicated fields ensure critical identifiers are captured early.",
                    "Visible credit limit fields provide relationship boundaries."
                ],
                image: "/Tezi Photos/Create-Customer.png"
            },
            {
                title: "Modular Scaling",
                problem: "Rigid software forces users into mismatched workflows.",
                solution: "Modular plugin ecosystem for custom feature selection.",
                bullets: [
                    "Uses clear iconography to communicate tool value.",
                    "Toggle-based activation allows for instant system scaling."
                ],
                image: "/Tezi Photos/Plugin-screen.png"
            }
        ]
    }
]

const PortfolioPage = () => {
    const [activeId, setActiveId] = useState(null);
    const activeProject = activeId !== null ? PROJECT_DATA[activeId] : null;

    // Guard ref to stop HtmlScrollSync from overwriting styles when we switch to project mode
    // This prevents the race condition where a frame fires just before unmount, setting opacity back to 1
    const shouldSyncRef = useRef(activeId === null);
    shouldSyncRef.current = activeId === null;

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

    // Store stack scroll position to restore when closing project
    const savedStackScrollRef = useRef(0);

    // Save scroll position when opening a project, reset when closing
    useEffect(() => {
        if (activeId !== null) {
            // Save current scroll position when opening a project
            savedStackScrollRef.current = scrollRef.current;
        }
    }, [activeId]);

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
            <LoadingScreen isLoading={!is3DReady} />

            {/* HTML Title Overlay (Rendered OUTSIDE Canvas for instant load) */}
            <div
                ref={titleRef}
                style={{
                    position: 'absolute',
                    top: '9.5rem',
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
                    fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                    fontStyle: 'italic',
                    marginBottom: '1rem',
                    textTransform: 'none',
                    letterSpacing: 'normal',
                    color: 'var(--text-color)'
                }}>The Work.</h1>
                <p style={{
                    color: 'var(--subtle-color)',
                    fontSize: '1.1rem',
                    marginTop: '0.5rem',
                    fontFamily: 'var(--font-sans)',
                    marginBottom: 0
                }}>
                    A curation of software architecture and visual systems.<br />
                    <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Scroll to explore. Click to view.</span>
                </p>
            </div>

            {/* 3D Scene Wrapper - Loading handled by overlay now */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 1,
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
                            is3DReady={is3DReady}
                        />
                    </Suspense>

                    <Suspense fallback={null}>
                        <Environment preset="studio" />
                    </Suspense>

                    {/* 2. PERSISTENT: Stack Mode Scroll Manager (Always mounted, hidden when project active) */}
                    <group visible={activeId === null}>
                        <ScrollControls
                            key="stack-scroll"
                            pages={3}
                            damping={0.2}
                        >
                            {/* Only sync scroll ref from stack when stack is active */}
                            {activeId === null && <ScrollBridge scrollRef={scrollRef} />}
                            <HtmlScrollSync htmlRef={titleRef} shouldSyncRef={shouldSyncRef} />

                            {/* Navigation Logic */}
                            <ProjectNavigationLogic
                                data={PROJECT_DATA}
                                setActiveIndex={setNavIndex}
                                setJumpTo={(fn) => jumpToProjectRef.current = fn}
                            />
                        </ScrollControls>
                    </group>

                    {/* 3. CONDITIONAL: Project Mode Scroll Manager */}
                    {activeId !== null && (
                        <ScrollControls
                            key={`project-scroll-${activeProject?.title}`} // Ensure fresh mount per project
                            pages={activeProject?.details.length > 1 ? activeProject.details.length : 1}
                            damping={0.1}
                            snap={activeProject?.details.length > 1 ? 1 / (activeProject.details.length - 1) : null}
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
                        position: 'fixed',
                        top: '100px',
                        left: '30px',
                        background: 'transparent',
                        color: 'var(--text-color)',
                        border: 'none',
                        padding: '0',
                        fontSize: '1.3rem',
                        fontStyle: 'italic',
                        fontFamily: 'var(--font-serif)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'transform 0.2s ease, opacity 0.2s ease',
                        zIndex: 2000,
                        opacity: 0.8
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateX(-5px)';
                        e.target.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateX(0)';
                        e.target.style.opacity = '0.8';
                    }}
                >
                    <span>←</span> Back
                </button>
            )}



            {/* Global Footer Credit - Fixed for Portfolio */}
            <div style={{
                position: 'fixed',
                bottom: '2.5rem',
                right: '2.5rem',
                zIndex: 10,
            }}>
                <span className="animated-credit" style={{ fontFamily: "var(--font-serif)", fontSize: '1rem', fontStyle: 'italic', fontWeight: 'bold' }}>
                    Designed & Crafted by Prasann Parikh
                </span>
            </div>

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