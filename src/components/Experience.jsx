import React from 'react';
import './Experience.css';

const experiences = [
    {
        id: 1,
        role: "Incubation Executive",
        company: "PDEU Innovation & Incubation Centre (PDEU-IIC)",
        location: "Gandhinagar, India",
        date: "Nov 2025 – Present",
        description: [
            "Coordinating lifecycle of 20+ startups, tracking KPIs like revenue, funding, and prototypes.",
            "Managing 6+ government funding schemes (NIDHI PRAYAS, SSIP, etc.) including compliance and audits.",
            "Orchestrating 10+ flagship events and serving as point of contact for 50+ stakeholders."
        ]
    },
    {
        id: 2,
        role: "Software Engineer Intern",
        company: "Tezi Communications LLP",
        location: "Ahmedabad, India",
        date: "May 2024 – Sep 2025",
        description: [
            "Delivered 125+ features and resolved 200+ bugs, significantly improving platform stability.",
            "Co-developed Kayaan ERP web platform used by a 20+ member team.",
            "Enhanced SmartAgent system for 20+ textile agencies, handling 1650 Cr+ GMV."
        ]
    },
    {
        id: 3,
        role: "Graphic Design Intern",
        company: "PDEU Innovation & Incubation Centre (IIC)",
        location: "Gandhinagar, India",
        date: "Feb 2023 – Feb 2024",
        description: [
            "Designed and delivered 50+ visual assets including posters and outreach materials.",
            "Standardized startup portfolio documentation for 25+ startups.",
            "Collaborated with founders on high-quality communication materials."
        ]
    },
    {
        id: 4,
        role: "Volunteer / Teaching Mentor",
        company: "Visamo Kids Foundation",
        location: "Ahmedabad, India",
        date: "Jul 2021",
        description: [
            "Mentored 5–10 middle-school students in mathematics and science using interactive methods.",
            "Designed communication materials for fundraising and annual reports."
        ]
    }
];

const Experience = () => {
    return (
        <div className="experience-section animate-reveal delay-3">
            <div className="experience-header">
                <h1 className="experience-title">The Journey.</h1>
                <p className="experience-subtitle">My professional timeline.</p>
            </div>

            <div className="timeline">
                {experiences.map((exp) => (
                    <div key={exp.id} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                            <div className="timeline-header-group">
                                <h3 className="timeline-role">{exp.role}</h3>
                                <div className="timeline-meta">
                                    <span className="timeline-company">{exp.company}</span>
                                    <span className="timeline-dot">•</span>
                                    <span className="timeline-date">{exp.date}</span>
                                </div>
                            </div>
                            <ul className="timeline-description">
                                {exp.description.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Experience;
