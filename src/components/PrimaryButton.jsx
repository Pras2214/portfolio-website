import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PrimaryButton = ({
    children,
    onClick,
    type = "button",
    disabled = false,
    to = null,
    className = "",
    style = {}
}) => {
    const baseStyle = {
        padding: '1.2rem 2.5rem',
        background: disabled ? 'rgba(128,128,128,0.1)' : 'linear-gradient(135deg, var(--teal-color), #2d9d9b)',
        color: disabled ? 'var(--subtle-color)' : '#ffffff',
        border: 'none',
        outline: 'none',
        borderRadius: '16px',
        fontWeight: 600,
        fontSize: '1.1rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        boxShadow: disabled ? 'none' : '0 10px 20px rgba(53, 196, 194, 0.3)',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        ...style
    };

    const hoverProps = disabled ? {} : {
        whileHover: { scale: 1.02, y: -2, boxShadow: '0 15px 30px rgba(53, 196, 194, 0.4)' },
        whileTap: { scale: 0.98 }
    };

    return to ? (
        <motion.div {...hoverProps} style={{ display: 'inline-block' }}>
            <Link
                to={to}
                className={className}
                style={baseStyle}
                onClick={onClick}
            >
                {children}
            </Link>
        </motion.div>
    ) : (
        <motion.button
            {...hoverProps}
            type={type}
            disabled={disabled}
            className={className}
            style={baseStyle}
            onClick={onClick}
        >
            {children}
        </motion.button>
    );
};

export default PrimaryButton;
