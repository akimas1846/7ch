import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ThreadList from './pages/ThreadList';
import ThreadDetail from './pages/ThreadDetail';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/threads" />} />
        <Route path="/threads" element={<ThreadList />} />
        <Route path="/threads/:id" element={<ThreadDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
