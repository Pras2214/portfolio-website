import '../components/Projects.css';

const ProjectsPage = () => {
    const projects = [
        {
            id: 1,
            title: "Video Chatting App",
            date: "Apr 2024",
            tech: "React.js • Node.js • AgoraRTC",
            description: "Real-time video calling application for seamless remote communication with authentication.",
            link: "https://video-chatting-4kl2xi1qk-prasanns-projects-4f899e31.vercel.app/",
            image: "/Kayaan Mobile photos/Cover-image-and-conversation-list.jpg"
        },
        {
            id: 2,
            title: "Tangy Tales",
            date: "Mar 2024",
            tech: "EJS • Node.js • MongoDB",
            description: "Restaurant order management platform with WhatsApp notification integration for 500+ customers.",
            link: "https://tangy-tales-stall.onrender.com/",
            image: "/Tezi Photos/Product-list.png"
        },
        {
            id: 3,
            title: "Task Manager",
            date: "Mar 2024",
            tech: "React.js • LocalStorage",
            description: "Efficient task management app with persistent local storage for offline continuity.",
            link: "https://basictaskmanager.netlify.app",
            image: "/Smartagent Photos/Dashboard-graphs.png"
        },
        {
            id: 4,
            title: "URL Shortener",
            date: "Mar 2024",
            tech: "Node.js • Express • MongoDB",
            description: "Reliable link management service with persistent storage and automatic redirects.",
            link: "https://url-shortener-lac-alpha.vercel.app/",
            image: "/Fork it Photos/Story-timeline.jpeg"
        },
        {
            id: 5,
            title: "Typing Game",
            date: "Mar 2024",
            tech: "HTML • CSS • JavaScript",
            description: "Browser-based typing practice tool with speed tracking and accuracy analytics.",
            link: "https://t-test.netlify.app/",
            image: "/Startup weekend photos/Key-Statistics.jpeg"
        },
        {
            id: 6,
            title: "Story Sphere",
            date: "Oct 2023",
            tech: "PHP • MySQL • HTML/CSS",
            description: "Blogging platform for sharing content through a simple and intuitive interface.",
            link: "https://blogging-website.infinityfree.me/",
            image: "/Nidhi TBI photos/Cover-image-and-diamond-shape-images.jpeg"
        }
    ];

    return (
        <div className="projects-container animate-reveal">
            <div className="projects-header">
                <h1 className="projects-title">The Archive.</h1>
                <p className="projects-subtitle">Experiments, products, and engineering.</p>
            </div>

            <div className="projects-grid">
                {projects.map((item) => (
                    <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className="project-card">
                        <div className="project-image-container">
                            <img src={item.image} alt={item.title} className="project-image" />
                        </div>
                        <div className="project-content">
                            <div className="project-card-header">
                                <h3 className="project-name">{item.title}</h3>
                                <div className="project-arrow">→</div>
                            </div>
                            <span className="project-date">{item.date}</span>
                            <p className="project-description">{item.description}</p>
                            <div className="project-tech-stack">
                                {item.tech.split(' • ').map((tech, index) => (
                                    <span key={index} className="tech-tag">{tech}</span>
                                ))}
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ProjectsPage;
