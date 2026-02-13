import React from 'react';

const SignalIcon = ({ id, hoveredId }) => {
    // Map signal IDs to GIF filenames
    const getGifFilename = (id) => {
        switch (id) {
            case 1: return 'swiss-army-knife.gif';
            case 2: return 'bored.gif';
            case 3: return 'playlist.gif';
            case 4: return 'friction.gif';
            case 5: return 'badminton.gif';
            case 6: return 'artificial-intelligence.gif';
            case 7: return 'drum-set.gif';
            case 8: return 'backward.gif';
            case 9: return 'loading.gif';
            case 10: return 'motivation.gif'; // Anger -> Motivation
            case 11: return 'meditation.gif'; // Aha! -> Meditation
            case 12: return 'user.gif';       // Socrates -> User
            case 13: return 'relay-race.gif';
            case 14: return 'conversation.gif';
            case 15: return 'manual.gif';     // Biography -> Manual
            default: return null;
        }
    };

    const filename = getGifFilename(id);

    if (!filename) return null;

    return (
        <div style={{
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: hoveredId === id ? '#f2f0ee' : 'var(--bg-color)', // Ensure blend mode works against this background
            marginBottom: '0.5rem',
            overflow: 'visible'
        }}>
            <img
                src={`/GIFs/${filename}`}
                alt={`Signal ${id} icon`}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    mixBlendMode: 'multiply',
                    opacity: 1
                }}
            />
        </div>
    );
};

export default SignalIcon;
