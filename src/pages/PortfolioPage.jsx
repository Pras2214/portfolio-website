import { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ScrollControls, useScroll } from '@react-three/drei';
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
            // Opacity fade out
            htmlRef.current.style.opacity = 1 - scroll.offset * 3;
            if (htmlRef.current.style.opacity < 0) htmlRef.current.style.opacity = 0;
        }
    });
    return null;
}

const PROJECT_DATA = [
    {
        title: "Nidhi TBI",
        type: "Impact Report",
        layout: "a4_vertical",
        desc: "Annual impact report detailing fund utilization and startup success stories for PDEU IIC.",
        stack: ["Photoshop", "Canva"],
        coverImage: "/Nidhi TBI photos/Cover-image-and-diamond-shape-images.jpeg",
        details: [
            {
                title: "Overview",
                text: "PDEU IIC is a Nidhi TBI certified incubator. This report presents fund utilization and startup achievements to the certifying government body.",
                stack: ["Photoshop", "Canva"],
                imageColor: "#74b9ff",
                image: "/Nidhi TBI photos/Cover-image-and-diamond-shape-images.jpeg"
            },
            {
                title: "Geometric Info Arch",
                uxChallenge: "Presenting a diverse range of industries (Biotech, Robotics, Energy) in a single view without creating visual clutter.",
                hciSolution: "I utilized a Geometric Tessellation layout to compartmentalize different startup sectors, ensuring each has an equal \"Visual Share.\"",
                features: [
                    { title: "Modular Composition", desc: "Diamond frames act as individual containers, preventing the \"clumping\" of unrelated visual data." },
                    { title: "Dynamic Focal Point", desc: "The central \"exI0sn\" hardware image anchors the page, providing a concrete example of the incubator's output." }
                ],
                imageColor: "#74b9ff",
                image: "/Nidhi TBI photos/Cover-image-and-diamond-shape-images.jpeg"
            },
            {
                title: "High-Density Metrics",
                uxChallenge: "Stakeholders need to process massive financial and operational data points quickly during high-level reviews.",
                hciSolution: "I designed a Non-Linear Dashboard that uses \"Information Chunking\" to group metrics into three logical tiers: Innovation, Entrepreneurship, and Impact.",
                features: [
                    { title: "Quantitative Salience", desc: "Large, bolded integers serve as primary entry points for the eye, allowing for rapid data auditing." },
                    { title: "Semantic Color Coding", desc: "Using blue and green gradients creates a subtle psychological link to \"Growth\" and \"Technology\" throughout the data set." }
                ],
                imageColor: "#0984e3",
                image: "/Nidhi TBI photos/Fostering-innovation-square-blocks.jpeg"
            },
            {
                title: "Case Study Hierarchy",
                uxChallenge: "Technical startup descriptions are often text-heavy and fail to highlight the most critical \"Success Signals\" like funding and patents.",
                hciSolution: "I implemented a Standardized Component Library for case studies, ensuring that \"Key Indicators\" (Fund Raised, IPR, Employment) are always in the same spatial location.",
                features: [
                    { title: "Reduced Interaction Cost", desc: "By standardizing the layout, the reader learns where to look for specific data, speeding up the comparison between different startups." },
                    { title: "Icon-Based Encoding", desc: "Uses symbolic icons for patents and funding to provide a \"Visual Shortcut\" to the content's meaning." }
                ],
                imageColor: "#6c5ce7",
                image: "/Nidhi TBI photos/Fund-raising.jpeg"
            },
            {
                title: "Medical & AI Viz",
                uxChallenge: "Displaying sensitive medical AI data requires a balance between technical accuracy and high-level readability.",
                hciSolution: "I utilized Contextual Framing, placing the AI \"Detection Box\" directly on the X-ray to demonstrate the software's functional utility in real-time.",
                features: [
                    { title: "System Transparency", desc: "Highlighting the \"Detection Bounding Box\" on the lung scan provides a visual explanation of how the AI algorithm works." },
                    { title: "Integrated Branding", desc: "Placing the startup logo (\"manentia.ai\") in close proximity to the output creates a strong mental association between the brand and the solution." }
                ],
                imageColor: "#a29bfe",
                image: "/Nidhi TBI photos/Manentia-advisory.jpeg"
            }
        ]
    },
    {
        title: "Startup Weekend",
        type: "Event Report",
        layout: "a4_vertical",
        desc: "Visual identity and logistics material for a 54-hour startup ideathon and pitching event.",
        stack: ["Photoshop", "Canva"],
        coverImage: "/Startup weekend photos/Cover-Image.jpeg",
        details: [
            {
                title: "Overview",
                text: "This is a report on an intensive weekend ideathon where aspiring entrepreneurs pitch ideas, form teams, and work with mentors to validate business models.",
                stack: ["Photoshop", "Canva"],
                imageColor: "#ffeaa7",
                image: "/Startup weekend photos/Cover-Image.jpeg"
            },
            {
                title: "Quantitative Salience",
                uxChallenge: "High-volume event data is difficult to process in text-heavy formats.",
                hciSolution: "I implemented Large-Scale Numerical Callouts to create a dashboard of primary successes.",
                features: [
                    { title: "Salience Principle", desc: "Scales font sizes based on data importance." },
                    { title: "Balanced Density", desc: "Uses white space as a structural element." }
                ],
                imageColor: "#ffeaa7",
                image: "/Startup weekend photos/Key-Statistics.jpeg"
            },
            {
                title: "Strategic Narrative",
                uxChallenge: "Stakeholders need to understand the \"Why\" behind the event.",
                hciSolution: "I used Asymmetric Grids to pair Techstars branding with mission-focused copy.",
                features: [
                    { title: "Brand Consistency", desc: "Aligns with Techstars' global visual language." },
                    { title: "Hierarchical Flow", desc: "Places mission statement at the top." }
                ],
                imageColor: "#fdcb6e",
                image: "/Startup weekend photos/Introductory-page.jpeg"
            },
            {
                title: "Mentorship Grid",
                uxChallenge: "Differentiating mentors and participants can be confusing.",
                hciSolution: "I utilized Selective Colorization, making mentor profiles full-color.",
                features: [
                    { title: "Visual Cueing", desc: "Color immediately identifies mentors." },
                    { title: "Equalized Spacing", desc: "3x4 grid gives equal visual weight." }
                ],
                imageColor: "#fab1a0",
                image: "/Startup weekend photos/Mentors.jpeg"
            },
            {
                title: "Process Wayfinding",
                uxChallenge: "Readers lose track of the evolutionary process of a startup.",
                hciSolution: "I used a Z-Pattern Layout to chronologically guide the eye.",
                features: [
                    { title: "Layered Narrative", desc: "Overlapping photo frames create motion." },
                    { title: "Contextual Hierarchy", desc: "Headers differentiate Practice vs. Final." }
                ],
                imageColor: "#ff7675",
                image: "/Startup weekend photos/Mock-Pitching.jpeg"
            },
            {
                title: "Institutional Trust",
                uxChallenge: "Event reports for universities require student energy and formal authority.",
                hciSolution: "I designed a Metric-First Footer that provides hard institutional data.",
                features: [
                    { title: "Categorical Iconography", desc: "Color-coded cards for different schools." },
                    { title: "Visual Anchoring", desc: "Large-scale campus image provides geographic place." }
                ],
                imageColor: "#e17055",
                image: "/Startup weekend photos/University-Stats.jpeg"
            }
        ]
    },
    {
        title: "AirX",
        type: "Product Guide",
        layout: "a4_horizontal", // Adjusted to match likely landscape guide
        desc: "Warranty card and user guide for the airX CO2-filtering purifier.",
        stack: ["Photoshop", "Canva"],
        coverImage: "/AirX Warranty Card Photos/Cover-image.png",
        details: [
            {
                title: "Overview",
                text: "A comprehensive manual facilitating correct product usage, FAQ resolution, and warranty registration for airX users.",
                stack: ["Photoshop", "Canva"],
                imageColor: "#ffffff",
                image: "/AirX Warranty Card Photos/Cover-image.png"
            },
            {
                title: "Visual Task Onboarding",
                uxChallenge: "Complex biotech products can be intimidating to set up, leading to incorrect usage.",
                hciSolution: "I used Pictorial Wayfinding to break the setup into five distinct, low-text steps.",
                features: [
                    { title: "Minimalist Syntax", desc: "Combines simple icons with one-line instructions." },
                    { title: "Hazard Highlighting", desc: "Uses a red \"Critical\" box for RO Water requirement." }
                ],
                imageColor: "#ffffff",
                image: "/AirX Warranty Card Photos/Getting-Started.png"
            },
            {
                title: "Info Scannability",
                uxChallenge: "Users often experience \"Cognitive Overload\" when faced with dense warranty terms.",
                hciSolution: "I implemented Visual Categorization through a color-coded icon system.",
                features: [
                    { title: "Signal Detection", desc: "Red and Green iconography allows for rapid \"skim-reading\"." },
                    { title: "Chunking", desc: "Dividing text into three distinct categories reduces workload." }
                ],
                imageColor: "#eeeeee",
                image: "/AirX Warranty Card Photos/What's-Covered.png"
            },
            {
                title: "Maintenance Roadmap",
                uxChallenge: "Users forget essential maintenance tasks, leading to system failure.",
                hciSolution: "I designed a Linear Progress Roadmap serving as a physical \"Action Prompt\".",
                features: [
                    { title: "Color-Coded Milestones", desc: "Blocks provide clear visual cues for maintenance." },
                    { title: "Actionable Directives", desc: "Simplifies complex biotech care into short commands." }
                ],
                imageColor: "#ffffff",
                image: "/AirX Warranty Card Photos/Maintenance-Schedule.png"
            },
            {
                title: "Strategic FAQ",
                uxChallenge: "Support teams are often overwhelmed by routine queries.",
                hciSolution: "I designed an Organized Repository of 15 FAQs addressing technical concerns.",
                features: [
                    { title: "Q-A Pairings", desc: "Bolded questions allow users to find specific concerns." },
                    { title: "Credibility Markers", desc: "Mentions NABL lab testing and university validation." }
                ],
                imageColor: "#eeeeee",
                image: "/AirX Warranty Card Photos/FAQ.png"
            },
            {
                title: "Accountability",
                uxChallenge: "Warranty claims are often rejected due to lack of records.",
                hciSolution: "I integrated a Physical Validation Section to encourage user accountability.",
                features: [
                    { title: "Commitment Device", desc: "Signature line acts as a contract." },
                    { title: "System Traceability", desc: "Fields for Serial No. and Purchase Date ensure verification." }
                ],
                imageColor: "#ffffff",
                image: "/AirX Warranty Card Photos/Signature-&-Personal-Details.png"
            }
        ]
    },
    {
        title: "Fork it",
        type: "AI Social Media",
        layout: "mobile",
        desc: "A collaborative video platform allowing users to 'branch' storylines using Generative AI.",
        stack: ["React", "Shadcn", "Framer-motion"],
        coverImage: "/Fork it Photos/Cover-image.jpeg",
        details: [
            {
                title: "Overview",
                text: "A next-gen social platform where creators 'fork' video narratives at key moments, using AI prompts to direct unique storylines.",
                stack: ["React", "Shadcn", "Framer-motion"],
                imageColor: "#fab1a0",
                image: "/Fork it Photos/Cover-image.jpeg"
            },
            {
                title: "Collaborative Lineage",
                uxChallenge: "Users feel like passive consumers, with no easy way to participate in creative evolution.",
                hciSolution: "I designed a Non-Linear Timeline that visualizes the \"ancestry\" of a video.",
                features: [
                    { title: "Structural Transparency", desc: "Maps complex AI-branching logic into a simple list." },
                    { title: "Contextual Anchoring", desc: "Clearly identifies the current version's creator." }
                ],
                imageColor: "#fab1a0",
                image: "/Fork it Photos/Story-timeline.jpeg"
            },
            {
                title: "Reducing Prompt Anxiety",
                uxChallenge: "Creative \"blank page syndrome\" often prevents users from generating their own content.",
                hciSolution: "I implemented a Contextual Prompt Overlay that appears at the fork point.",
                features: [
                    { title: "Cognitive Bridging", desc: "Pre-fills the prompt area with context." },
                    { title: "Immersive Interaction", desc: "Semi-transparent backdrop keeps eye on content." }
                ],
                imageColor: "#ff7675",
                image: "/Fork it Photos/What-happens-next.jpeg"
            },
            {
                title: "Director Controls",
                uxChallenge: "Most AI tools are \"black boxes,\" offering users zero control over cinematic output.",
                hciSolution: "I created the Director’s Deck, a suite of controls simplifying cinematic parameters.",
                features: [
                    { title: "Mental Model Match", desc: "Uses familiar icons (Pan, Zoom) for filmmaking logic." },
                    { title: "Tactile Hierarchy", desc: "Places primary actions within natural thumb-reach." }
                ],
                imageColor: "#fdcb6e",
                image: "/Fork it Photos/Director's-Deck.jpeg"
            },
            {
                title: "Latency Management",
                uxChallenge: "High-latency AI processes can lead to user frustration if system status isn't visible.",
                hciSolution: "I integrated a Dynamic Status Indicator providing immediate feedback.",
                features: [
                    { title: "State Visibility", desc: "Uses a pulsing \"Generating\" label to confirm activity." },
                    { title: "Input Guarding", desc: "Disables secondary controls during processing." }
                ],
                imageColor: "#fab1a0",
                image: "/Fork it Photos/Director's-Deck.jpeg"
            },
            {
                title: "Quality Assurance",
                uxChallenge: "Jarring AI-generated results can break the immersion of a collaborative story.",
                hciSolution: "I designed a Post-Generation Preview screen providing technical validation.",
                features: [
                    { title: "Trust Calibration", desc: "Quantifies \"Style Consistency\" to reassure the user." },
                    { title: "Iterative Loop", desc: "Includes a \"Regenerate\" option for trial-and-error." }
                ],
                imageColor: "#fab1a0",
                image: "/Fork it Photos/Your-fork-is-ready.jpeg"
            }
        ]
    },
    {
        title: "Kayaan Prints Mobile",
        type: "B2B Marketplace",
        layout: "mobile",
        desc: "An AI-powered B2B commerce app for browsing catalogs and chatting with support agents.",
        stack: ["Figma", "React Native", "Framer-motion", "PDF Make"],
        coverImage: "/Kayaan Mobile photos/Cover-image-and-conversation-list.jpg",
        details: [
            {
                title: "Conversational Command",
                text: "Combines a marketplace with an AI-first chat interface, allowing buyers to query invoices, track dispatches, and place orders via text.",
                stack: ["Figma", "React Native", "Framer-motion", "PDF Make"],
                imageColor: "#6c5ce7",
                image: "/Kayaan Mobile photos/Cover-image-and-conversation-list.jpg"
            },
            {
                title: "Natural Language Discovery",
                uxChallenge: "Searching high-density wholesale catalogs on small screens creates high interaction costs.",
                hciSolution: "I implemented Contextual AI Retrieval, allowing users to discover products via simple text or audio commands.",
                features: [
                    { title: "Intent Recognition", desc: "Translates broad text queries into high-fidelity, actionable product cards." },
                    { title: "Friction Reduction", desc: "Replaces complex filter menus with direct, conversational search results." }
                ],
                imageColor: "#fdcb6e",
                image: "/Kayaan Mobile photos/Chat-interface-\"show-me-sarees\".jpeg"
            },
            {
                title: "Voice-to-Task",
                uxChallenge: "Hands-on warehouse environments make manual typing difficult and inefficient for users.",
                hciSolution: "I integrated Voice-Driven Workflows, allowing users to request data and reports through asynchronous audio.",
                features: [
                    { title: "Operational Efficiency", desc: "Enables hands-free triggers for backend tasks like generating dispatch reports." },
                    { title: "Trust Management", desc: "Designed clear error-handling dialogues for when AI cannot retrieve specific data." }
                ],
                imageColor: "#0984e3",
                image: "/Kayaan Mobile photos/Chat-screen-with-audio-message.jpeg"
            },
            {
                title: "High-Density Triage",
                uxChallenge: "Comparing price-sensitive B2B products on mobile leads to decision fatigue and information overload.",
                hciSolution: "I designed an Optimized Product Grid that prioritizes dynamic pricing and stock status through visual salience.",
                features: [
                    { title: "Magnitude Encoding", desc: "Prominent discount badges facilitate rapid financial triage during buying sessions." },
                    { title: "Ergonomic Layout", desc: "Places \"Add to Cart\" actions within the natural thumb zone for high-speed use." }
                ],
                imageColor: "#e17055",
                image: "/Kayaan Mobile photos/Product-Grid.jpg"
            },
            {
                title: "Automated Deployment",
                uxChallenge: "Moving from a mobile conversation to formal business documentation is typically a high-friction process.",
                hciSolution: "I implemented Zero-Navigation Logic, delivering formal invoices and reports directly within the chat thread.",
                features: [
                    { title: "Context Retention", desc: "Users receive critical business files without ever leaving the primary conversation." },
                    { title: "Live Validation", desc: "Real-time generation ensures wholesalers access the most current logistics and tax data." }
                ],
                imageColor: "#00cec9",
                image: "/Kayaan Mobile photos/AI-response-and-dispatch-report.jpg"
            }
        ]
    },
    {
        title: "Kayaan Prints Dashboard",
        type: "B2B Admin Dashboard",
        layout: "desktop",
        desc: "A centralized admin panel for managing products, analytics, and buyer broadcasts.",
        stack: ["Figma", "React", "Material UI", "Framer-motion", "PDF Make"],
        coverImage: "/Kayaan photos/Cover-image-and-main-dashboard.jpg",
        details: [
            {
                title: "Executive Data Synthesis",
                text: "Empowers executives to upload inventory, analyze business metrics, and send targeted promotional broadcasts to buyers.",
                stack: ["Figma", "React", "Material UI", "Framer-motion", "PDF Make"],
                imageColor: "#74b9ff",
                image: "/Kayaan photos/Cover-image-and-main-dashboard.jpg"
            },
            {
                title: "Standardized Inventory",
                uxChallenge: "Navigating thousands of SKUs in a massive catalog leads to \"Choice Overload\" and slow triage.",
                hciSolution: "I implemented a Standardized Component Library to ensure critical data points stay in fixed spatial locations.",
                features: [
                    { title: "Heuristic Consistency", desc: "Uniform pill-tags facilitate rapid filtering and mental categorization." },
                    { title: "System State Visibility", desc: "High-contrast badges reassure users of live inventory status before exporting." }
                ],
                imageColor: "#a29bfe",
                image: "/Kayaan photos/Product-grid.jpg"
            },
            {
                title: "Complex Logic Config",
                uxChallenge: "Configuring complex B2B pricing and upcharge rules is traditionally error-prone and intimidating.",
                hciSolution: "I designed a Rules Configuration Interface that translates complex business logic into human-readable modular blocks.",
                features: [
                    { title: "Logic Chunking", desc: "Separates deal info from tag rules to prevent cognitive overload during setup." },
                    { title: "Live Logic Preview", desc: "Displaying specific percentages and quantity rules reduces the risk of misconfiguration." }
                ],
                imageColor: "#fd79a8",
                image: "/Kayaan photos/Deals.jpg"
            },
            {
                title: "Direct Marketing",
                uxChallenge: "B2B promotional updates often feel \"cold,\" resulting in low engagement and poor conversion.",
                hciSolution: "I implemented a Contextual Broadcast Hub that pairs live product previews with outgoing messages.",
                features: [
                    { title: "Mental Model Mapping", desc: "Adopts a familiar chat layout to reduce the learning curve for operations staff." },
                    { title: "WYSIWYG Editing", desc: "Real-time previews ensure users see the exact client-side appearance before sending." }
                ],
                imageColor: "#00b894",
                image: "/Kayaan photos/Broadcast-screen.jpg"
            },
            {
                title: "Multi-User Triage",
                uxChallenge: "Manually managing recipient lists for internal broadcasts is tedious and leads to accidental exclusions.",
                hciSolution: "I utilized a Tri-Column Drag-and-Drop Triage system for physical spatial grouping of recipients.",
                features: [
                    { title: "Interaction Cost Reduction", desc: "Tapping icons to move team members is significantly faster than dropdown menus." },
                    { title: "Error Prevention", desc: "The explicit \"Dont send\" column acts as a visual safety net for sensitive information." }
                ],
                imageColor: "#fab1a0",
                image: "/Kayaan photos/Create-Broadcast.jpg"
            }
        ]
    },
    {
        title: "Smart Agent",
        type: "Bookkeeping Software",
        layout: "desktop",
        desc: "A comprehensive bookkeeping tool for textile agents to manage orders and commissions.",
        stack: ["React", "Material UI", "Shadcn", "LottieFiles", "PDF Make", "React-hot-keys-hook"],
        coverImage: "/Smartagent Photos/Cover-image.png",
        details: [
            {
                title: "Overview",
                text: "A dedicated book keeping system for B2B agents to track orders, invoices, payments, and commission analytics in one unified view.",
                stack: ["React", "Material UI", "Shadcn", "LottieFiles", "PDF Make", "React-hot-keys-hook"],
                imageColor: "#81ecec",
                image: "/Smartagent Photos/Cover-image.png"
            },
            {
                title: "Data Viz & Summary",
                uxChallenge: "B2B agents struggle with \"Data Fragmentation,\" where vital financial indicators are buried.",
                hciSolution: "I designed a Centralized Analytical Dashboard that translates raw cash-flow data into a prioritized visual hierarchy.",
                features: [
                    { title: "Visual Encoding", desc: "Uses donut charts for debt aging to allow for instant comparisons." },
                    { title: "Cognitive Offloading", desc: "Tracks multiple variables simultaneously, reducing manual cross-referencing." }
                ],
                imageColor: "#81ecec",
                image: "/Smartagent Photos/Dashboard-graphs.png"
            },
            {
                title: "Prioritized Workflow",
                uxChallenge: "Managing dozens of clients leads to \"Context Switching\" fatigue and missed payment deadlines.",
                hciSolution: "I implemented a Card-Based UI that acts as a prioritized \"To-Do List,\" highlighting critical account metrics.",
                features: [
                    { title: "Salience Principle", desc: "High-contrast red text for \"Due Amount\" helps prioritize recovery." },
                    { title: "Interaction Cost", desc: "Direct \"Call Now\" and \"WhatsApp\" buttons allow users to act instantly." }
                ],
                imageColor: "#00cec9",
                image: "/Smartagent Photos/Company-Cards.png"
            },
            {
                title: "Complex Transactions",
                uxChallenge: "Placing a B2B order involves many moving parts (taxes, agents), increasing error risk.",
                hciSolution: "I structured the order flow into Modular Task Blocks that guide the user through the transaction.",
                features: [
                    { title: "Progressive Disclosure", desc: "Sections for Supplier/Customer prevent feeling overwhelmed." },
                    { title: "Visual Anchoring", desc: "Strategic use of blue buttons identifies the primary interactive path." }
                ],
                imageColor: "#74b9ff",
                image: "/Smartagent Photos/Add-order.png"
            },
            {
                title: "Financial Validation",
                uxChallenge: "Entering payments is high-stakes; typos in TDS or commissions lead to discrepancies.",
                hciSolution: "I utilized a Master-Detail Layout with a persistent sidebar that updates in real-time.",
                features: [
                    { title: "Live Calculation", desc: "Sidebar acts as a \"Calculated Safety Net,\" showing cumulative impact." },
                    { title: "Mental Math Auto", desc: "Automatically calculates \"Pyt Adj. Amt\" to ensure balancing." }
                ],
                imageColor: "#74b9ff",
                image: "/Smartagent Photos/Add-payment.png"
            },
            {
                title: "Database Scannability",
                uxChallenge: "Traditional ledger layouts are often illegible, leading to slow data retrieval.",
                hciSolution: "I applied Information Architecture principles to create a high-density, searchable repository.",
                features: [
                    { title: "Categorical Tabbing", desc: "Pill-based navigation maps to the user's mental model." },
                    { title: "Workflow Extensibility", desc: "Integrated Export buttons recognize offline documentation needs." }
                ],
                imageColor: "#74b9ff",
                image: "/Smartagent Photos/Invoice-list.png"
            }
        ]
    },
    {
        title: "Tezi",
        type: "B2B Platform",
        layout: "desktop",
        desc: "A digital ecosystem connecting B2B buyers and sellers with AI-assisted negotiation.",
        stack: ["Figma", "React", "Material UI", "Shadcn", "Framer-motion", "React PDF"],
        coverImage: "/Tezi Photos/Cover-image-and-Login-screen.png",
        details: [
            {
                title: "Overview",
                text: "Facilitates direct B2B trade by allowing sellers to create personal storefronts and buyers to negotiate orders via AI support.",
                stack: ["Figma", "React", "Material UI", "Shadcn", "Framer-motion", "React PDF"],
                imageColor: "#fd79a8",
                image: "/Tezi Photos/Cover-image-and-Login-screen.png"
            },
            {
                title: "Reducing Entry Friction",
                uxChallenge: "High drop-off rates often occur in B2B tools due to \"form fatigue\" and complex authentication barriers.",
                hciSolution: "I implemented Passwordless Authentication to streamline the user journey and reduce initial cognitive load.",
                features: [
                    { title: "Minimalist Scoping", desc: "Limits the UI to a single primary action, directing the user's focus." },
                    { title: "Seamless Security", desc: "Uses phone number verification to ensure high security without passwords." }
                ],
                imageColor: "#fd79a8",
                image: "/Tezi Photos/Cover-image-and-Login-screen.png"
            },
            {
                title: "Info Architecture & Search",
                uxChallenge: "Managing massive inventories in a B2B context often leads to \"Information Overload.\"",
                hciSolution: "I designed a High-Density Data Grid that allows for rapid scanning and bulk management of SKUs.",
                features: [
                    { title: "Scanning Optimization", desc: "Alternating row highlights and clear column headers minimize \"horizontal drift\"." },
                    { title: "Success Feedback", desc: "A persistent green \"Success\" toast confirms system states without interruption." }
                ],
                imageColor: "#fd79a8",
                image: "/Tezi Photos/Product-list.png"
            },
            {
                title: "Data Transparency",
                uxChallenge: "Buyers are hesitant to order when they cannot instantly see the margin between bulk costs and retail prices.",
                hciSolution: "I centralized multi-tier pricing into a \"Digital Showroom\" view that automates profit-margin analysis.",
                features: [
                    { title: "Margin Optimization", desc: "Displays Bulk, MRP, and Cost Price side-by-side to automate \"mental math\"." },
                    { title: "Phygital Integration", desc: "Integrated QR code allows for seamless inventory verification." }
                ],
                imageColor: "#e84393", // Pinkish
                image: "/Tezi Photos/Product-Detail-view.png"
            },
            {
                title: "Entity Management",
                uxChallenge: "Onboarding business entities requires high-accuracy data entry for legal and credit compliance.",
                hciSolution: "I utilized a Modal-Based Progressive Form to compartmentalize complex legal data into digestible inputs.",
                features: [
                    { title: "Input Scoping", desc: "Dedicated fields for GSTIN and PAN ensure critical identifiers are captured." },
                    { title: "Risk Mitigation", desc: "Visible \"Credit Limit\" fields provide immediate context boundaries." }
                ],
                imageColor: "#fab1a0",
                image: "/Tezi Photos/Create-Customer.png"
            },
            {
                title: "Modular Extensibility",
                uxChallenge: "Rigid enterprise software often forces users into workflows that do not fit their specific niche.",
                hciSolution: "I designed a Modular Plugin Ecosystem allowing users to customize their feature set through simple toggles.",
                features: [
                    { title: "Feature Discovery", desc: "Uses clear iconography to communicate value before activation." },
                    { title: "Frictionless Config", desc: "Toggle-based activation allows for instant system scaling." }
                ],
                imageColor: "#fab1a0",
                image: "/Tezi Photos/Plugin-screen.png"
            }
        ]
    },
];

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

            {/* 3D Scene Wrapper for Smooth Fade-In */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: is3DReady ? 1 : 0,
                filter: is3DReady ? 'blur(0px)' : 'blur(10px)',
                transform: is3DReady ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 2.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
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

                    {/* 2. CONDITIONAL: Stack Mode Scroll Manager */}
                    {activeId === null && (
                        <ScrollControls
                            key="stack-scroll" // Unique key for fresh mount
                            pages={3}
                            damping={0.2}
                        >
                            <ScrollBridge scrollRef={scrollRef} />
                            <HtmlScrollSync htmlRef={titleRef} shouldSyncRef={shouldSyncRef} />

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