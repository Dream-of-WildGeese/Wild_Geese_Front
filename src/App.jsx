import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import { AppDataProvider } from './store/AppDataContext';

import Home from './pages/Home/Home';

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
import TodayReport from './pages/Home/TodayReport/TodayReport';
import WeeklyReport from './pages/Home/WeeklyReport/WeeklyReport';
import WeeklyReportDetail from './pages/Home/WeeklyReport/WeeklyReportDetail';
import HealthCheck from './pages/Home/HealthCheck/HealthCheck';
import AddHealthCheck from './pages/Home/HealthCheck/AddHealthCheck';

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
              <Route path="/home/today-report" element={<TodayReport />} />
              {/* 주간 리포트에서 요일을 누르면 그 날짜의 일지로 들어온다 */}
              <Route path="/home/today-report/:date" element={<TodayReport />} />
              <Route path="/home/weekly-report" element={<WeeklyReport />} />
              <Route path="/home/weekly-report/:weekId" element={<WeeklyReportDetail />} />
              <Route path="/home/healthcheck" element={<HealthCheck />} />
              <Route path="/home/healthcheck/add" element={<AddHealthCheck />} />

              <Route path='/morning-report' element={<MorningReport />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppDataProvider>
    </ThemeProvider>
  );
}

export default App;