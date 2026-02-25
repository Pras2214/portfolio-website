import React, { useState } from 'react';
import RecommendationForm from '../components/RecommendationForm';

const RecommendationsPage = () => {
    return (
        <div>
            <div style={{ marginBottom: 'var(--spacing-lg)', padding: '0 0 2rem' }}>
                <h1 className="heading-serif" style={{
                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                    lineHeight: '1.1',
                    maxWidth: '15ch',
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    Drop a Signal.
                </h1>
                <p className="animate-reveal delay-1" style={{
                    textAlign: 'center',
                    marginTop: '1.5rem',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--subtle-color)',
                    fontSize: '1.2rem',
                    fontStyle: 'normal',
                    maxWidth: '600px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    lineHeight: '1.6'
                }}>
                    I'm constantly searching for the next great experience. Choose a category, transmit your favorites, and help curate my personal vault.
                </p>
            </div>

            <RecommendationForm />
        </div>
    );
};

export default RecommendationsPage;
