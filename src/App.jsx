import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import Home from './pages/Home/Home';
import DailyHealthCheck from './pages/Home/DailyHealthCheck';
import Invite from './pages/Onboarding/Invite';
import InviteCode from './pages/Onboarding/InviteCode';
import BasicInfo from './pages/Onboarding/BasicInfo';
import HealthInfo from './pages/Onboarding/HealthInfo';
import MedicationInfo from './pages/Onboarding/MedicationInfo';
import Complete from './pages/Onboarding/Complete';
import TodayReport from './pages/TodayReport/TodayReport';
import WeeklyReport from './pages/WeeklyReport/WeeklyReport';
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/daily-health-check' element={<DailyHealthCheck />} />
            <Route path='/onboarding/invite' element={<Invite />} />
            <Route path='/onboarding/invite-code' element={<InviteCode />} />
            <Route path='/onboarding/basic-info' element={<BasicInfo />} />
            <Route path='/onboarding/health-info' element={<HealthInfo />} />
            <Route path='/onboarding/medication-info' element={<MedicationInfo />} />
            <Route path='/onboarding/complete' element={<Complete />} />
            <Route path='/today-report' element={<TodayReport />} />
            <Route path='/weekly-report' element={<WeeklyReport />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;