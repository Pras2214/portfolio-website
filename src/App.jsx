import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ExperiencePage from './pages/ExperiencePage';
import ProjectsPage from './pages/ProjectsPage';
import PortfolioPage from './pages/PortfolioPage';

import NotFound from './pages/NotFound';

function App() {
  // Check if we are on the portfolio subdomain
  const isPortfolioSubdomain = window.location.hostname.startsWith('portfolio.');

  return (
    <Router>
      <ThemeProvider>
        <Layout>
          <Routes>
            {/* If on portfolio subdomain, / renders PortfolioPage, otherwise Home */}
            <Route path="/" element={isPortfolioSubdomain ? <PortfolioPage /> : <Home />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </Router>
  );
}

export default App;
