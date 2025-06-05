import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import TerminalIcon from '@mui/icons-material/Terminal';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';
import EvaluationDetails from './pages/EvaluationDetails';
import Terminal from './components/Terminal';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/history" element={<History />} />
              <Route path="/evaluation/:id" element={<EvaluationDetails />} />
            </Routes>
          </main>
          
          {/* Terminal Toggle Button */}
          <IconButton
            onClick={() => setIsTerminalOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            <TerminalIcon />
          </IconButton>

          {/* Terminal Component */}
          <Terminal
            isOpen={isTerminalOpen}
            onClose={() => setIsTerminalOpen(false)}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
