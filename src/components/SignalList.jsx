import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SignalList.css';

const SignalList = ({ items }) => {
    const [expandedId, setExpandedId] = useState(null);

    const handleItemClick = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="signal-list">
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className={`signal-item ${expandedId === item.id ? 'expanded' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                >
                    <div className="signal-header">
                        <span className="signal-number">{String(index + 1).padStart(2, '0')}</span>
                        <div className="signal-content-wrapper">
                            <span className="signal-title">{item.title}</span>
                        </div>
                    </div>

                    {expandedId === item.id && (
                        <div className="signal-details animate-reveal">
                            <p>
                                {item.content}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SignalList;
