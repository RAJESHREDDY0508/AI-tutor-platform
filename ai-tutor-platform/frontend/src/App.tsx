import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { QueryProvider } from '@context/QueryProvider';

/**
 * Root application component.
 *
 * Route structure:
 *  /              → LandingPage   (public)
 *  /login         → LoginPage     (public)
 *  /dashboard     → Dashboard     (protected – Sprint 2+)
 *  /session/:id   → SessionPage   (protected – Sprint 6+)
 *  *              → NotFoundPage
 */
const App: React.FC = () => {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<PlaceholderPage title="AI Tutor Platform" />} />
          <Route path="/login" element={<PlaceholderPage title="Login" />} />

          {/* ── Catch-all ── */}
          <Route path="*" element={<PlaceholderPage title="404 – Not Found" />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
};

/** Temporary placeholder – replaced in Sprint 2+ with real pages. */
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
    <h1>{title}</h1>
    <p>Sprint 1 scaffold – UI implementation begins in Sprint 2.</p>
  </div>
);

export default App;
