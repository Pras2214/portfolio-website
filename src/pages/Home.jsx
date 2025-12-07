import React from 'react';
import SignalList from '../components/SignalList';

const signals = [
    {
        id: 1,
        title: "I am the \"Swiss Army Knife\" teammate.",
        content: "\"That’s not my job\" is a phrase I don't understand. Do we need a Captain to strategize? I’ll do it. Do we need a grunt to do the heavy lifting? I’ll do that too. I don't care about the title on the jersey. I only care about what the team needs right now to cross the finish line."
    },
    {
        id: 2,
        title: "\"Boring\" technology makes the most money.",
        content: "In a world obsessed with the newest JavaScript framework, I bet on \"boring.\" Give me a solid SQL database and a server-side language that has survived a decade. I’ll take that over a fragile new stack that breaks every update. My goal isn't to use the coolest tech. It's to build software that actually works."
    },
    {
        id: 3,
        title: "My playlist has an identity crisis.",
        content: "If you hit shuffle on my Spotify, you might get whiplash. One minute it’s the aggression of Seedhe Maut, the next it’s R.D. Burman, followed immediately by Queen and Jagjit Singh. I don't listen to genres. I listen to frequencies. The song has to match the exact voltage of my current state of mind."
    },
    {
        id: 4,
        title: "Friction is actually a feature.",
        content: "Modern UX design is obsessed with making everything \"seamless.\" I disagree. Sometimes you want the user to slow down. Whether it's deleting a database or confirming a payment, adding a moment of friction forces a conscious decision. Good design isn't just about speed. It's about preventing regret."
    },
    {
        id: 5,
        title: "Badminton is chess at 200 mph.",
        content: "People think sports are about muscles. I think they are about geometry and psychology. Whether I'm on the badminton court or the cricket pitch, I’m playing the opponent’s mind first and the ball second. Physicality is the baseline, but strategy is where the game is actually won."
    },
    {
        id: 6,
        title: "AI is my intern, not my replacement.",
        content: "Everyone is panicked that AI will replace developers. I’m not. I treat AI like a hyper-efficient intern who sometimes hallucinates. I let it handle the boilerplate so I can focus on the architectural decisions that actually matter. If you stop coding to just \"prompt,\" you lose the ability to judge if the machine is lying to you."
    },
    {
        id: 7,
        title: "Why I speak in rhythms, not notes.",
        content: "I spent 13 years behind percussion instruments like Bongos, Djembes, Octapads, and Drums. While everyone else was worried about the melody, I was obsessed with the backbone. It taught me that you don't need to be at the front of the stage to control the pace of the entire performance."
    },
    {
        id: 8,
        title: "The best way forward is usually backward.",
        content: "When I see a problem, I don't start coding immediately. I backtrack. I reverse-engineer the issue to its root. I believe in circumspection and looking at the problem from every angle before making a move. Measure twice, cut once."
    },
    {
        id: 9,
        title: "I design for the \"empty state,\" not the \"perfect state.\"",
        content: "Most portfolios show dashboards filled with perfect data. But users rarely see that. They see empty inboxes, loading screens, and \"no results found.\" I judge a UI/UX designer by how they handle the empty states. Those are the moments when the system has nothing to show but still needs to be helpful."
    },
    {
        id: 10,
        title: "Anger is an expensive emotion I can't afford.",
        content: "I am malleable in my opinions but rigid in my calm. I believe there is almost zero ROI in acting out of a \"gush\" of anger. Reacting is easy, but responding with control requires strength. I prefer to keep the control."
    },
    {
        id: 11,
        title: "I don't rush the \"Aha!\" moment.",
        content: "I approach the unknown with calm mind, not anxiety. I have the patience to sit with a difficult question for as long as it takes. I don't force clarity. I let it arrive through observation and persistence. For me, the joy isn't just in knowing the answer. It's in the slow, deliberate process of untangling the knot."
    },
    {
        id: 12,
        title: "Socrates is great, but I prefer lived experience.",
        content: "I love philosophy, but not the kind you find in textbooks. I want to discuss the philosophy of now. I want insights drawn from self-growth, history, and the friction of daily life. I’d rather have a 2-hour deep dive into the ethics of Sci-Fi or the history of fonts than discuss the weather."
    },
    {
        id: 13,
        title: "Why I study athletes, not CEOs.",
        content: "You can keep the business tycoons. I look at people like Virat Kohli or Roger Federer. It’s not just about the cover drive or the serve. It’s about the mental resilience to stand in the middle of a stadium or court under pressure and execute. That belief system is the ultimate skill."
    },
    {
        id: 14,
        title: "I’m allergic to small talk.",
        content: "In a room full of people, I’m the one looking for a quiet corner to have a real conversation or just sit by myself. I am extroverted around my people, but I conserve my energy elsewhere. I’m interested in your ideas, your theories, and your \"what-ifs,\" not your schedule."
    },
    {
        id: 15,
        title: "My biography is currently unwritten (and private).",
        content: "I love dissecting ideas, but I keep the vault closed on my personal life. It’s not about secrecy. It’s about boundaries. I believe we can connect deeply over shared interests and intellectual curiosity without needing to dissect our private lives. Let's focus on the ideas more than the person."
    }
];

const Home = () => {
    return (
        <div>
            <div style={{ marginBottom: 'var(--spacing-lg)', padding: '4rem 0' }}>
                <h1 className="heading-serif animate-reveal delay-1" style={{
                    fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                    lineHeight: '1.1',
                    fontStyle: 'italic',
                    maxWidth: '20ch',
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    "Creativity is a wild mind and a disciplined eye."
                </h1>
                <p className="animate-reveal delay-1" style={{
                    textAlign: 'center',
                    marginTop: '1rem',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--subtle-color)',
                    fontSize: '1rem',
                    fontStyle: 'normal'
                }}>— Dorothy Parker</p>
            </div>

            <div className="animate-reveal delay-2" style={{ borderTop: '1px solid #eaeaea', paddingTop: 'var(--spacing-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-md)' }}>
                    <h2 className="text-uppercase" style={{ fontSize: '0.8rem', color: 'var(--subtle-color)', letterSpacing: '0.1em' }}>Get to know me</h2>
                </div>
                <SignalList items={signals} />
            </div>
        </div>
    );
};

export default Home;
