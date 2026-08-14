import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import { AppDataProvider } from './store/AppDataContext';

import Home from './pages/Home/Home';
import DailyHealthCheck from './pages/Home/TodayOndam/Night/DailyHealthCheck';

import TodayReport from './pages/TodayReport/TodayReport';
import WeeklyReport from './pages/WeeklyReport/WeeklyReport';
import MorningReport from './pages/MorningReport/MorningReport';

import Layout from './components/Layout';

import Intro from './pages/Onboarding/Intro';
import UserType from './pages/Onboarding/UserType';
import StepGuide from './pages/Onboarding/StepGuide';
import InviteCode from './pages/Onboarding/InviteCode';
import StepComplete from './pages/Onboarding/StepComplete';
import HealthSet from './pages/Onboarding/HealthSet';
import MedicationManage from './pages/Onboarding/MedicationManage';
import AddMedication from './pages/Onboarding/AddMedication';
import AlarmTime from './pages/Onboarding/AlarmTime';

import MedicineList from './pages/Home/medicine/MedicineList';
import MedicineEdit from './pages/Home/medicine/MedicineEdit';
import SettingsMain from './pages/Home/Setting/SettingsMain';
import ProfileEdit from './pages/Home/Setting/ProfileEdit';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppDataProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Intro/>} />
              <Route path="/onboarding/UserType" element={<UserType />} />
              <Route path="/onboarding/step-guide" element={<StepGuide />} />
              <Route path="/onboarding/invite" element={<InviteCode />} />
              <Route
                path="/onboarding/complete/:step"
                element={<StepComplete />}
              />
              <Route path="/onboarding/health-set"element={<HealthSet />}/>
              <Route path="/onboarding/medication/manage" element={<MedicationManage />} />
              <Route path="/onboarding/medication/add" element={<AddMedication />} />
              <Route path="/onboarding/alarm" element={<AlarmTime />} />
              <Route path="/home" element={<Home />} />
              <Route path="/home/medicine" element={<MedicineList />} />
              <Route path="/home/medicine/:id" element={<MedicineEdit />} />
              <Route path="/home/settings" element={<SettingsMain />} />
              <Route path="/home/settings/profile" element={<ProfileEdit />} />
              <Route path='/daily-health-check' element={<DailyHealthCheck />} />
              <Route path='/today-report' element={<TodayReport />} />
              <Route path='/weekly-report' element={<WeeklyReport />} />
              <Route path='/morning-report' element={<MorningReport />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppDataProvider>
    </ThemeProvider>
  );
}

export default App;