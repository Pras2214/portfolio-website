import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div>
            <Header />
            <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <main style={{ flexGrow: 1, paddingBottom: 'var(--spacing-lg)' }}>
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
