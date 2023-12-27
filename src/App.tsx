import React from 'react';
import logo from './logo.svg';
import './App.css';
import { CompetitionFinder } from './pages/CompetitionFinder';
import { createTheme, ThemeProvider } from '@mui/material';
import { blue } from '@mui/material/colors';

const theme = createTheme({
  typography: {
    fontFamily: "'Montserrat', 'Arial', 'Helvetica', sans-serif",
    body1: {
      whiteSpace: "pre-wrap",
    },
  },
  palette: {
    primary: blue,
  },
  shape: {
    borderRadius: 2,
  },
  spacing: 4,
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CompetitionFinder />
    </ThemeProvider>
  );
}

export default App;
