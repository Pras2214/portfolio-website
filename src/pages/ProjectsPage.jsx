import { useState, useRef } from 'react';
import '../components/Projects.css';

const ProjectCard = ({ project, index }) => {
    const cardRef = useRef(null);
    const [cardStyle, setCardStyle] = useState({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        boxShadow: '0 0 0 rgba(0,0,0,0)'
    });
    const [imageStyle, setImageStyle] = useState({
        transform: 'translate(0px, 0px) scale(1)',
        filter: 'grayscale(100%) opacity(0.9)'
    });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        const centerX = width / 2;
        const centerY = height / 2;

        // Card Tilt Logic (Subtle)
        // RotateX is negative when mouse is at top (tilts away/up), positive at bottom.
        // RotateY is positive when mouse is right (tilts away/left).
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        // Image "Pop Out" & Follow Logic (Stronger)
        // Image follows the mouse: roughly 20px range
        const moveX = ((x - centerX) / centerX) * 15;
        const moveY = ((y - centerY) / centerY) * 15;

        // Dynamic Shadow Logic
        // Shadow moves OPPOsite to the light/object movement to simulate depth
        // If image moves Right (+20px), shadow should shift Left (-offset)
        const shadowX = -moveX * 0.5;
        const shadowY = -moveY * 0.5;

        // Card Shadow (Subtle shift)
        const cardShadowX = -moveX;
        const cardShadowY = -moveY;

        setCardStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
            // Shadow offset opposite to mouse usually looks best for "light at center" or "light from top-left", 
            // but here we simulate the object casting shadow on the ground based on its shift.
            // If object shifts Right, shadow usually shifts Right? No, if light is static, shadow stays?
            // "Floating object": If object moves Right, and light is above, shadow might stay, but parallax makes it look like it moves Left relative to object?
            // Let's try shifting shadow opposite to movement to emphasize "lift".
            boxShadow: `${cardShadowX}px ${cardShadowY + 30}px 60px -12px rgba(0, 0, 0, 0.25)`,
            zIndex: 10
        });

        setImageStyle({
            transform: `translate(${moveX}px, ${moveY}px) scale(1.15)`,
            // Drop shadow offset opposite to movement creates "floating" feel
            filter: `grayscale(0%) opacity(1) drop-shadow(${shadowX}px ${shadowY + 15}px 30px rgba(0,0,0,0.35))`
        });
    };

    const handleMouseLeave = () => {
        setCardStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
            boxShadow: 'none',
            zIndex: 1
        });
        setImageStyle({
            transform: 'translate(0px, 0px) scale(1)',
            filter: 'grayscale(100%) opacity(0.9)'
        });
    };

    return (
        <div className="animate-blur-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <a
                ref={cardRef}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card"
                style={{
                    transform: cardStyle.transform,
                    boxShadow: cardStyle.boxShadow,
                    zIndex: cardStyle.zIndex,
                    transition: 'transform 0.1s ease-out, box-shadow 0.3s ease'
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="project-image-container">
                    <img
                        src={project.image}
                        alt={project.title}
                        className="project-image"
                        style={{
                            transform: imageStyle.transform,
                            filter: imageStyle.filter,
                            transition: 'transform 0.1s ease-out, filter 0.3s ease',
                            borderRadius: '12px'
                        }}
                    />
                </div>
                <div className="project-content">
                    <div className="project-card-header">
                        <h3 className="project-name">{project.title}</h3>
                        <div className="project-arrow">→</div>
                    </div>
                    <span className="project-date">{project.date}</span>
                    <p className="project-description">{project.description}</p>
                    <div className="project-tech-stack">
                        {project.tech.split(' • ').map((tech, idx) => (
                            <span key={idx} className="tech-tag">{tech}</span>
                        ))}
                    </div>
                </div>
            </a>
        </div>
    );
};

const ProjectsPage = () => {
    const projects = [
        {
            id: 1,
            title: "Video Chatting App",
            date: "Apr 2024",
            tech: "React.js • Node.js • AgoraRTC",
            description: "Real-time video calling application for seamless remote communication with authentication.",
            link: "https://video-chatting-4kl2xi1qk-prasanns-projects-4f899e31.vercel.app/",
            image: "/Projects Photos/Video-chatting-app.png"
        },
        {
            id: 2,
            title: "Tangy Tales",
            date: "Mar 2024",
            tech: "EJS • Node.js • MongoDB",
            description: "Restaurant order management platform with WhatsApp notification integration for 500+ customers.",
            link: "https://tangy-tales-stall.onrender.com/",
            image: "/Projects Photos/Tangy-tales.png"
        },
        {
            id: 3,
            title: "Task Manager",
            date: "Mar 2024",
            tech: "React.js • LocalStorage",
            description: "Efficient task management app with persistent local storage for offline continuity.",
            link: "https://basictaskmanager.netlify.app",
            image: "/Projects Photos/Task-tracker.png"
        },
        {
            id: 4,
            title: "URL Shortener",
            date: "Mar 2024",
            tech: "Node.js • Express • MongoDB",
            description: "Reliable link management service with persistent storage and automatic redirects.",
            link: "https://url-shortener-lac-alpha.vercel.app/",
            image: "/Projects Photos/URL-shortener.png"
        },
        {
            id: 5,
            title: "Typing Game",
            date: "Mar 2024",
            tech: "HTML • CSS • JavaScript",
            description: "Browser-based typing practice tool with speed tracking and accuracy analytics.",
            link: "https://t-test.netlify.app/",
            image: "/Projects Photos/Typing-game.png"
        },
        {
            id: 6,
            title: "Story Sphere",
            date: "Oct 2023",
            tech: "PHP • MySQL • HTML/CSS",
            description: "Blogging platform for sharing content through a simple and intuitive interface.",
            link: "https://blogging-website.infinityfree.me/",
            image: "/Projects Photos/Blogging-website.png"
        }
    ];

    return (
        <div className="projects-container">
            <div className="projects-header animate-reveal">
                <h1 className="projects-title">The Archive.</h1>
                <p className="projects-subtitle">Experiments, products, and engineering.</p>
            </div>

            <div className="projects-grid">
                {projects.map((item, index) => (
                    <ProjectCard key={item.id} project={item} index={index} />
                ))}
            </div>
        </div>
    );
};

export default ProjectsPage;
