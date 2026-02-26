import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Meeting from './pages/Meeting';
import JoinMeeting from './pages/JoinMeeting';

function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <Router>
      <div className="min-h-screen bg-base-200">
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
          <Route path="/meeting/:meetingId" element={token ? <Meeting /> : <Navigate to="/login" />} />
          <Route path="/join/:meetingCode" element={token ? <JoinMeeting /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;