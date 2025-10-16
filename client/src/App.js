import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import HowToUsePage from './pages/HowToUsePage';
import PricePage from './pages/PricePage';
import TeamIntroducePage from './pages/TeamIntroducePage';
import DetectionPage from './pages/DetectionPage';
import ResultPage from './pages/ResultPage';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/detect" element={<DetectionPage />} />
            <Route path="/how-to-use" element={<HowToUsePage />} />
            <Route path="/price" element={<PricePage />} />
            <Route path="/team-introduce" element={<TeamIntroducePage />} />
            <Route path="/result/:resultId" element={<ResultPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;