import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ isLoading }) => {
    const phrases = [
        "Curating Experiences...",
        "Rendering Dimensions...",
        "Assembling Pixels...",
        "Constructing Narratives...",
    ];

    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

    useEffect(() => {
        if (!isLoading) return;
        const interval = setInterval(() => {
            setCurrentPhraseIndex(prev => (prev + 1) % phrases.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [isLoading]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    key="loading-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }} // Faster exit to prevent overlap clash
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        // Opaque background to hide the stack until ready
                        background: '#f7f5f3',
                        zIndex: 5, // Below Title (10) but above Stack (0)
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-color)',
                        pointerEvents: 'none',
                        fontFamily: 'var(--font-serif)'
                    }}
                >
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Smooth Text Transition */}
                        <div style={{ height: '2rem', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={currentPhraseIndex}
                                    initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    style={{
                                        fontSize: '1.2rem',
                                        fontStyle: 'italic',
                                        letterSpacing: '0.05em',
                                        fontWeight: 400,
                                        margin: 0,
                                        color: 'var(--text-color)',
                                        textAlign: 'center'
                                    }}
                                >
                                    {phrases[currentPhraseIndex]}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        {/* Creative Indicator: Morphing Geometric Shape */}
                        <motion.div
                            animate={{
                                rotate: 180,
                                borderRadius: ["10%", "50%", "10%"],
                                scale: [1, 0.8, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                width: '20px',
                                height: '20px',
                                border: '2px solid var(--text-color)',
                                marginTop: '1.5rem',
                                opacity: 0.6
                            }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
