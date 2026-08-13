import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import Home from './pages/Home/Home';
import DailyHealthCheck from './pages/Home/DailyHealthCheck';
import TodayReport from './pages/TodayReport/TodayReport';
import WeeklyReport from './pages/WeeklyReport/WeeklyReport';
import Layout from './components/Layout';
import Intro from './pages/Onboarding/Intro';
import UserType from './pages/Onboarding/UserType';
import StepGuide from './pages/Onboarding/StepGuide';
import InviteCode from './pages/Onboarding/InviteCode';
import StepComplete from './pages/Onboarding/StepComplete';
import HealthSet from './pages/Onboarding/HealthSet';
import MedicationManage from './pages/Onboarding/MedicationManage';
import AddMedication from './pages/Onboarding/AddMedication';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/onboarding" element={<Intro/>} />
            <Route path="/onboarding/UserType" element={<UserType />} />
            <Route path="/onboarding/step-guide" element={<StepGuide />} />
            <Route path="/onboarding/invite" element={<InviteCode />} />
            <Route path="/onboarding/complete"element={<StepComplete />}/>
            <Route path="/onboarding/health-set"element={<HealthSet />}/>
            <Route path="/onboarding/medication/manage" element={<MedicationManage />} />
            <Route path="/onboarding/medication/add" element={<AddMedication />} />
            <Route path="/" element={<Home />} />
            <Route path='/daily-health-check' element={<DailyHealthCheck />} />
            <Route path='/today-report' element={<TodayReport />} />
            <Route path='/weekly-report' element={<WeeklyReport />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;