import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import PrimaryButton from './PrimaryButton';

const categories = [
    'Clothes', 'Songs', 'Cafe / Restaurants', 'Books', 'Places To Visit', 'Food To Try', 'Movies', 'Other'
];

const EMOJI_MAP = {
    'Clothes': ['👕', '👗', '👖', '👟', '🧢', '🕶️', '🧥', '🧦', '🧣'],
    'Songs': ['🎵', '🎶', '🎧', '🎸', '🎹', '🎤', '🎺', '🥁', '📻'],
    'Movies': ['🎬', '🍿', '🎥', '🎟️', '📽️', '📺', '🎭', '🎞️', '⭐'],
    'Books': ['📚', '📖', '📗', '🔖', '🖋️', '📕', '📔', '📝', '👓'],
    'Places To Visit': ['🌍', '✈️', '🗺️', '⛰️', '🗼', '🏖️', '🗽', '🚂', '⛺'],
    'Food To Try': ['🍔', '🍕', '🍜', '🍣', '🍰', '🌮', '🍝', '🍦', '🍩'],
    'Cafe / Restaurants': ['☕', '🍷', '🍽️', '🥐', '🥂', '🍹', '🍵', '🥂', '🍳'],
    'Other': ['💡', '✨', '💭', '🔥', '🎯', '💎', '🚀', '🌟', '💥']
};

const GIF_MAP = {
    'Clothes': '/GIFs/Recommendation GIFs/shirt-shoe.gif',
    'Songs': '/GIFs/Recommendation GIFs/music.gif',
    'Movies': '/GIFs/Recommendation GIFs/watching-movie.gif',
    'Books': '/GIFs/Recommendation GIFs/book.gif',
    'Places To Visit': '/GIFs/Recommendation GIFs/earth.gif',
    'Food To Try': '/GIFs/Recommendation GIFs/eating.gif',
    'Cafe / Restaurants': '/GIFs/Recommendation GIFs/restaurant.gif',
    'Other': '/GIFs/Recommendation GIFs/more.gif'
};

const FlyingEmojis = ({ category }) => {
    const emojis = EMOJI_MAP[category] || ['✨', '🎉', '🔥', '👏', '💥'];

    // Create an array of 35 slightly larger particles to be noticeable 
    const particles = Array.from({ length: 35 }).map((_, i) => {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        // Spread nicely across screen
        const initialX = (Math.random() - 0.5) * window.innerWidth * 0.9;
        const finalX = initialX + (Math.random() * 400 - 200);
        // Don't fly off screen too fast, let them hang in the middle/upper area
        const finalY = - (Math.random() * 600 + 300);

        const rotation = Math.random() * 720 - 360;
        const delay = Math.random() * 0.4; // Less staggering
        const duration = 1.0 + Math.random() * 1.5; // Fly faster, don't stagnate

        // Larger emojis
        const scale = 1.0 + Math.random() * 1.5;

        return (
            <motion.div
                key={i}
                initial={{ opacity: 1, x: `calc(50vw + ${initialX}px)`, y: '100vh', scale: 0, rotate: 0 }}
                animate={{
                    opacity: [0, 1, 1, 0.8, 0],
                    x: `calc(50vw + ${finalX}px)`,
                    y: `calc(100vh + ${finalY}px)`,
                    scale: [0, scale, scale, scale * 0.8, 0],
                    rotate: rotation
                }}
                transition={{ duration, delay, ease: "easeOut" }}
                style={{ position: 'fixed', top: 0, left: 0, fontSize: '2.5rem', pointerEvents: 'none', zIndex: 9999, textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
            >
                {emoji}
            </motion.div>
        );
    });

    return <>{particles}</>;
};

const RecommendationForm = () => {
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [flyingCategory, setFlyingCategory] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors }, watch, getValues } = useForm();

    // When category changes, reset the form but keep the submitterName
    const handleCategoryChange = (category) => {
        const currentName = getValues('submitterName');
        setSelectedCategory(category);
        reset();
        if (currentName) {
            setTimeout(() => setValue('submitterName', currentName), 0);
        }
        setSubmitStatus(null);
    };

    const onSubmit = async (data) => {
        setIsSubmittingForm(true);
        setSubmitStatus(null);

        try {
            await addDoc(collection(db, 'recommendations'), {
                ...data,
                category: selectedCategory,
                createdAt: serverTimestamp()
            });
            setSubmitStatus('success');

            // Trigger customized confetti
            setFlyingCategory(selectedCategory);
            setTimeout(() => {
                setFlyingCategory(null);
                setSubmitStatus(null);
            }, 3000); // Shorter clear time

            const currentName = getValues('submitterName');
            reset(); // Clear form but keep name
            if (currentName) {
                setTimeout(() => setValue('submitterName', currentName), 0);
            }
        } catch (error) {
            console.error("Error adding document: ", error);
            // Specifically check for permission errors for the user
            if (error.code === 'permission-denied') {
                setSubmitStatus('permission-error');
            } else {
                setSubmitStatus('error');
            }
        } finally {
            setIsSubmittingForm(false);
        }
    };

    const errorBlock = (field) => {
        return errors[field] ? (
            <motion.span
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                style={{ color: '#ff4a4a', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}
            >
                {errors[field]?.message || 'This field is required'}
            </motion.span>
        ) : null;
    };

    const inputClasses = "premium-input";

    const renderDynamicFields = () => {
        switch (selectedCategory) {
            case 'Clothes':
                return (
                    <motion.div key="clothes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="form-grid">
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Brand/Store *</label>
                            <input className={inputClasses} {...register('brand', { required: true })} placeholder="e.g. Uniqlo, Carhartt" />
                            <span className="input-highlight"></span>
                            {errorBlock('brand')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Item Type *</label>
                            <select className={inputClasses} {...register('itemType', { required: true })}>
                                <option value="" disabled selected>Select a type</option>
                                <option value="Shirts/Tops">Shirts/Tops</option>
                                <option value="Pants/Bottoms">Pants/Bottoms</option>
                                <option value="Outerwear">Outerwear</option>
                                <option value="Shoes">Shoes</option>
                                <option value="Accessories">Accessories</option>
                            </select>
                            {errorBlock('itemType')}
                        </div>
                        <div className="form-group col-span-2">
                            <label>Link (Optional)</label>
                            <input type="url" className={inputClasses} {...register('link')} placeholder="https://..." />
                        </div>
                        <div className="form-group col-span-2">
                            <label>Why do you recommend it? *</label>
                            <input className={inputClasses} {...register('reason', { required: true })} placeholder="Great fit, extremely durable..."></input>
                            <span className="input-highlight"></span>
                            {errorBlock('reason')}
                        </div>
                    </motion.div>
                );
            case 'Songs':
                return (
                    <motion.div key="songs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="form-grid">
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Song Name *</label>
                            <input className={inputClasses} {...register('songName', { required: true })} placeholder="e.g. Bohemian Rhapsody" />
                            <span className="input-highlight"></span>
                            {errorBlock('songName')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Artist *</label>
                            <input className={inputClasses} {...register('artist', { required: true })} placeholder="e.g. Queen" />
                            <span className="input-highlight"></span>
                            {errorBlock('artist')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Genre/Vibe</label>
                            <input className={inputClasses} {...register('genre')} placeholder="e.g. Classic Rock, Late night drive" />
                            <span className="input-highlight"></span>
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Link (Optional)</label>
                            <input type="url" className={inputClasses} {...register('link')} placeholder="Spotify/Apple Music link" />
                            <span className="input-highlight"></span>
                        </div>
                        <div className="form-group col-span-2">
                            <label>Why should I listen to it? *</label>
                            <input className={inputClasses} {...register('reason', { required: true })} placeholder="The guitar solo at 3:00 is incredible..."></input>
                            <span className="input-highlight"></span>
                            {errorBlock('reason')}
                        </div>
                    </motion.div>
                );
            case 'Movies':
                return (
                    <motion.div key="movies" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="form-grid">
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Movie Title *</label>
                            <input className={inputClasses} {...register('title', { required: true })} placeholder="e.g. Interstellar" />
                            <span className="input-highlight"></span>
                            {errorBlock('title')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Director (Optional)</label>
                            <input className={inputClasses} {...register('director')} placeholder="e.g. Christopher Nolan" />
                            <span className="input-highlight"></span>
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Genre *</label>
                            <input className={inputClasses} {...register('genre', { required: true })} placeholder="e.g. Sci-Fi, Thriller" />
                            <span className="input-highlight"></span>
                            {errorBlock('genre')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Where to watch</label>
                            <select className={inputClasses} {...register('platform')}>
                                <option value="">Select Platform</option>
                                <option value="Netflix">Netflix</option>
                                <option value="Amazon Prime">Amazon Prime</option>
                                <option value="Hulu">Hulu</option>
                                <option value="Disney+">Disney+</option>
                                <option value="Theaters">Theaters</option>
                                <option value="Other">Other</option>
                            </select>
                            <span className="input-highlight"></span>
                        </div>
                        <div className="form-group col-span-2">
                            <label>Why is it good? *</label>
                            <input className={inputClasses} {...register('reason', { required: true })} placeholder="The visual effects and score are mind-blowing..."></input>
                            <span className="input-highlight"></span>
                            {errorBlock('reason')}
                        </div>
                    </motion.div>
                );
            case 'Books':
                return (
                    <motion.div key="books" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="form-grid">
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Book Title *</label>
                            <input className={inputClasses} {...register('title', { required: true })} placeholder="e.g. Atomic Habits" />
                            <span className="input-highlight"></span>
                            {errorBlock('title')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Author *</label>
                            <input className={inputClasses} {...register('author', { required: true })} placeholder="e.g. James Clear" />
                            <span className="input-highlight"></span>
                            {errorBlock('author')}
                        </div>
                        <div className="form-group col-span-2">
                            <label>Genre</label>
                            <input className={inputClasses} {...register('genre')} placeholder="e.g. Self-help, Sci-Fi" />
                            <span className="input-highlight"></span>
                        </div>
                        <div className="form-group col-span-2">
                            <label>Key Takeaway or Vibe *</label>
                            <input className={inputClasses} {...register('reason', { required: true })} placeholder="Small changes compound over time..."></input>
                            <span className="input-highlight"></span>
                            {errorBlock('reason')}
                        </div>
                    </motion.div>
                );
            case 'Places To Visit':
                return (
                    <motion.div key="places" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="form-grid">
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Location Name *</label>
                            <input className={inputClasses} {...register('location', { required: true })} placeholder="e.g. Banff National Park" />
                            <span className="input-highlight"></span>
                            {errorBlock('location')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>City/Country *</label>
                            <input className={inputClasses} {...register('cityCountry', { required: true })} placeholder="e.g. Alberta, Canada" />
                            <span className="input-highlight"></span>
                            {errorBlock('cityCountry')}
                        </div>
                        <div className="form-group col-span-2">
                            <label>Best Time to Visit</label>
                            <input className={inputClasses} {...register('bestTime')} placeholder="e.g. Summer for hiking, Winter for skiing" />
                            <span className="input-highlight"></span>
                        </div>
                        <div className="form-group col-span-2">
                            <label>Must-see attraction/thing to do *</label>
                            <input className={inputClasses} {...register('reason', { required: true })} placeholder="Lake Louise is a must-see..."></input>
                            <span className="input-highlight"></span>
                            {errorBlock('reason')}
                        </div>
                    </motion.div>
                );
            case 'Food To Try':
                return (
                    <motion.div key="food" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="form-grid">
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Dish Name *</label>
                            <input className={inputClasses} {...register('dish', { required: true })} placeholder="e.g. Pad Thai" />
                            <span className="input-highlight"></span>
                            {errorBlock('dish')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Cuisine/Type *</label>
                            <input className={inputClasses} {...register('cuisine', { required: true })} placeholder="e.g. Thai" />
                            <span className="input-highlight"></span>
                            {errorBlock('cuisine')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Flavor Profile</label>
                            <select className={inputClasses} {...register('flavor')}>
                                <option value="">Select Flavor</option>
                                <option value="Sweet">Sweet</option>
                                <option value="Savory">Savory</option>
                                <option value="Spicy">Spicy</option>
                                <option value="Sour">Sour</option>
                                <option value="Umami">Umami</option>
                            </select>
                            <span className="input-highlight"></span>
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Where to get it (Optional)</label>
                            <input className={inputClasses} {...register('where')} placeholder="Specific restaurant or region" />
                            <span className="input-highlight"></span>
                        </div>
                        <div className="form-group col-span-2">
                            <label>Why should I try it? *</label>
                            <input className={inputClasses} {...register('reason', { required: true })} placeholder="The perfect balance of sweet and sour..."></input>
                            <span className="input-highlight"></span>
                            {errorBlock('reason')}
                        </div>
                    </motion.div>
                );
            case 'Cafe / Restaurants':
                return (
                    <motion.div key="cafe" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="form-grid">
                        <div className="form-group col-span-2 sm:col-span-1 creative-input-group">
                            <label>Restaurant/Cafe Name *</label>
                            <input className={inputClasses} {...register('name', { required: true })} placeholder="e.g. Blue Bottle Coffee" />
                            <span className="input-highlight"></span>
                            {errorBlock('name')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1 creative-input-group">
                            <label>Location/City *</label>
                            <input className={inputClasses} {...register('location', { required: true })} placeholder="e.g. San Francisco" />
                            <span className="input-highlight"></span>
                            {errorBlock('location')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1 creative-input-group">
                            <label>Cuisine/Vibe *</label>
                            <input className={inputClasses} {...register('vibe', { required: true })} placeholder="e.g. Minimalist coffee shop, Italian fine dining" />
                            <span className="input-highlight"></span>
                            {errorBlock('vibe')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Price Range</label>
                            <select className={inputClasses} {...register('price')}>
                                <option value="">Select Price</option>
                                <option value="$">$ (Cheap)</option>
                                <option value="$$">$$ (Moderate)</option>
                                <option value="$$$">$$$ (Expensive)</option>
                                <option value="$$$$">$$$$ (Very Expensive)</option>
                            </select>
                        </div>
                        <div className="form-group col-span-2 creative-input-group">
                            <label>Must-Try Item (Optional)</label>
                            <input className={inputClasses} {...register('mustTry')} placeholder="e.g. New Orleans Iced Coffee" />
                            <span className="input-highlight"></span>
                        </div>
                        <div className="form-group col-span-2">
                            <label>Why do you recommend it? *</label>
                            <input className={inputClasses} {...register('reason', { required: true })} placeholder="Amazing ambiance and the best coffee..."></input>
                            <span className="input-highlight"></span>
                            {errorBlock('reason')}
                        </div>
                    </motion.div>
                );
            case 'Other':
                return (
                    <motion.div key="other" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="form-grid">
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Item Name/Title *</label>
                            <input className={inputClasses} {...register('title', { required: true })} placeholder="What is the name of the item?" />
                            <span className="input-highlight"></span>
                            {errorBlock('title')}
                        </div>
                        <div className="form-group col-span-2 sm:col-span-1">
                            <label>Category/Type *</label>
                            <input className={inputClasses} {...register('type', { required: true })} placeholder="e.g. Podcast, App, Gadget" />
                            <span className="input-highlight"></span>
                            {errorBlock('type')}
                        </div>
                        <div className="form-group col-span-2">
                            <label>Link (Optional)</label>
                            <input type="url" className={inputClasses} {...register('link')} placeholder="https://..." />
                            <span className="input-highlight"></span>
                        </div>
                        <div className="form-group col-span-2">
                            <label>Why do you recommend it? *</label>
                            <input className={inputClasses} {...register('reason', { required: true })} placeholder="It completely changed my daily routine..."></input>
                            <span className="input-highlight"></span>
                            {errorBlock('reason')}
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="recommendation-container"
            style={{
                maxWidth: '1000px',
                margin: '0 auto',
                background: 'transparent',
                position: 'relative'
            }}
        >
            {/* Thematic Confetti Spawner */}
            <AnimatePresence>
                {flyingCategory && <FlyingEmojis category={flyingCategory} />}
            </AnimatePresence>

            <div style={{ position: 'relative', zIndex: 1 }}>

                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500, color: 'var(--subtle-color)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Select Category
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryChange(cat)}
                                className={`category-button ${selectedCategory === cat ? 'selected' : ''}`}
                            >
                                {selectedCategory === cat && (
                                    <motion.div
                                        layoutId="categoryIndicator"
                                        style={{
                                            position: 'absolute',
                                            top: -1, // Account for parent border
                                            left: -1,
                                            right: -1,
                                            bottom: -1,
                                            borderRadius: '30px',
                                            border: '1px solid var(--teal-color)',
                                            background: '#f2f9f9',
                                            zIndex: 0
                                        }}
                                        transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
                                    />
                                )}
                                <span style={{ position: 'relative', zIndex: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: selectedCategory === cat ? '#f2f9f9' : 'var(--bg-color)' }}>
                                    {GIF_MAP[cat] && <img src={GIF_MAP[cat]} alt={cat} style={{ width: '32px', height: '32px', objectFit: 'contain', mixBlendMode: 'multiply' }} />}
                                    {cat}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <div className="form-group creative-input-group">
                        <label>Your Name (Optional)</label>
                        <input
                            className={inputClasses}
                            {...register('submitterName')}
                            placeholder="e.g. Prasann Parikh"
                        />
                        <span className="input-highlight"></span>
                    </div>

                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(128,128,128,0.2), transparent)', margin: '1rem 0' }}></div>

                    <AnimatePresence mode="wait">
                        {renderDynamicFields()}
                    </AnimatePresence>

                    <PrimaryButton
                        type="submit"
                        disabled={isSubmittingForm}
                        style={{ marginTop: '1.5rem', width: '100%' }}
                    >
                        {isSubmittingForm ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                style={{ width: '20px', height: '20px', border: '2px solid var(--subtle-color)', borderTopColor: 'transparent', borderRadius: '50%' }}
                            />
                        ) : 'Broadcast Signal'}
                    </PrimaryButton>

                    <AnimatePresence>
                        {submitStatus && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                {submitStatus === 'success' && (
                                    <div style={{ background: 'rgba(53, 196, 194, 0.1)', border: '1px solid rgba(53, 196, 194, 0.3)', color: 'var(--teal-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.2rem' }}>
                                        Signal received. The vault has been updated.
                                    </div>
                                )}
                                {submitStatus === 'permission-error' && (
                                    <div style={{ background: 'rgba(255, 74, 74, 0.1)', border: '1px solid rgba(255, 74, 74, 0.3)', color: '#ff4a4a', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
                                        Access denied. The vault doors are currently sealed.
                                    </div>
                                )}
                                {submitStatus === 'error' && (
                                    <div style={{ background: 'rgba(255, 74, 74, 0.1)', border: '1px solid rgba(255, 74, 74, 0.3)', color: '#ff4a4a', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
                                        Transmission failed. The signal was lost in the void.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>

            <style jsx>{`
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }
                .col-span-2 {
                    grid-column: span 2;
                }
                @media (min-width: 640px) {
                    .sm\\:col-span-1 {
                        grid-column: span 1;
                    }
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                    position: relative;
                }
                .form-group label {
                    font-weight: 500;
                    color: var(--subtle-color);
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 0.2rem;
                }
                
                .category-button {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.6rem 1.2rem;
                    border-radius: 30px;
                    border: 1px solid rgba(128,128,128,0.2);
                    background: transparent;
                    color: var(--subtle-color);
                    cursor: pointer;
                    outline: none;
                    transition: color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s, background 0.3s, box-shadow 0.3s;
                    font-size: 0.9rem;
                    font-weight: 400;
                    -webkit-tap-highlight-color: transparent;
                }
                
                .category-button:focus {
                    outline: none;
                }

                .category-button:focus-visible {
                    outline: 2px solid var(--teal-color);
                    outline-offset: 2px;
                }
                
                .category-button:hover:not(.selected) {
                    color: var(--text-color);
                    border-color: rgba(128,128,128,0.5);
                    background: #fafafa;
                }
                
                .category-button.selected {
                    border-color: transparent;
                    color: var(--teal-color);
                    font-weight: 600;
                    background: transparent;
                }                
                .creative-input-group {
                    position: relative;
                }
                
                .premium-input {
                    padding: 0.5rem 0;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid rgba(128, 128, 128, 0.3);
                    border-radius: 0;
                    color: var(--text-color);
                    font-family: var(--font-serif);
                    font-size: 1.4rem;
                    outline: none;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    width: 100%;
                }
                
                .form-group > .premium-input {
                    margin-top: auto;
                }
                
                .input-highlight {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 2px;
                    width: 0;
                    background: var(--teal-color);
                    transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                
                .premium-input:focus {
                    background: transparent;
                }
                
                .premium-input:focus ~ .input-highlight {
                    width: 100%;
                }
                
                .premium-input::placeholder {
                    color: rgba(128, 128, 128, 0.3);
                    font-family: var(--font-sans);
                    font-size: 1.1rem;
                }
                select.premium-input {
                    font-family: var(--font-sans);
                    font-size: 1.1rem;
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22rgba(128,128,128,0.5)%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
                    background-repeat: no-repeat;
                    background-position: right 0.5rem center;
                    background-size: 0.65rem auto;
                    padding-right: 2.5rem;
                }
                select.premium-input option {
                    background: var(--bg-color);
                    color: var(--text-color);
                }
                textarea.premium-input {
                    resize: vertical;
                    min-height: 80px;
                    padding-top: 1rem;
                }
                
                /* Removed duplicate custom button hover since PrimaryButton handles it now */
            `}</style>
        </motion.div>
    );
};

export default RecommendationForm;
