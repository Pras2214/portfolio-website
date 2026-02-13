import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SignalList.css';
import SignalIcon from './SignalIcon';

const SignalList = ({ items }) => {
    const [stickyExpandedIds, setStickyExpandedIds] = useState([]);
    const [hoveredId, setHoveredId] = useState(null);

    const handleItemClick = (id) => {
        setStickyExpandedIds(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    return (
        <div className="signal-list">
            {items.map((item, index) => {
                const isExpanded = stickyExpandedIds.includes(item.id) || hoveredId === item.id;

                return (
                    <div
                        key={item.id}
                        className="animate-blur-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div
                            className={`signal-item ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => handleItemClick(item.id)}
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <div className="signal-header">
                                <span className="signal-number">{String(index + 1).padStart(2, '0')}</span>
                                <div className="signal-content-wrapper">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <SignalIcon id={item.id} hoveredId={hoveredId} />
                                        <span className="signal-title">{item.title}</span>
                                    </div>
                                    <span className="signal-arrow">›</span>
                                </div>
                            </div>

                            <div className={`signal-details-wrapper ${isExpanded ? 'active' : ''}`}>
                                <div className="signal-details">
                                    <p>
                                        {item.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SignalList;
