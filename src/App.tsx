import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OnboardFunnel from './components/OnboardFunnel';
import VoiceToneFunnel from './components/VoiceToneFunnel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/onboard" element={<OnboardFunnel />} />
        <Route path="/voice-tone" element={<VoiceToneFunnel />} />
        <Route path="/" element={<Navigate to="/onboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;