import Threads from './pages/ThreadList';
import ThreadDetail from './pages/ThreadDetail';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/threads" />} />
        <Route path="/threads" element={<Threads />} />
        <Route path="/threads/:id" element={<ThreadDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
