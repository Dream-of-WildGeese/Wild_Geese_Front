import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import Home from './pages/Home';
import DailyReport from './pages/DailyReport';
import MorningReport from './pages/MorningReport';
import NightCheck from './pages/NightCheck';
import Onboarding from './pages/Onboarding';
import WeeklyReport from './pages/WeeklyReport';
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/daily-report' element={<DailyReport />} />
            <Route path='/morning-report' element={<MorningReport />} />
            <Route path='/night-check' element={<NightCheck />} />
            <Route path='/onboarding' element={<Onboarding />} />
            <Route path='/weekly-report' element={<WeeklyReport />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;