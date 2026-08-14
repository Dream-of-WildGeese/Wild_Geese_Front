import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// 아직 백엔드 연동 전이라, 온보딩에서 입력한 값을 로컬(localStorage)에 저장해두고
// 홈의 약/설정 화면이 그 값을 그대로 읽어서 보여준다.
// 추후 API가 붙으면 이 컨텍스트의 각 setter 내부만 실제 요청(completeOnboarding,
// updateHealthProfile, updateNotificationSetting 등)으로 교체하면 된다.
const STORAGE_KEY = 'ondam.appData';

const DEFAULT_DATA = {
  profile: { name: '', birth: '', gender: '', role: null },
  interests: [],
  medications: [],
  alarms: { morning: '08:30', evening: '20:00' },
  notifications: {
    morningQuestion: true,
    eveningCheck: true,
    medication: true,
    familyReaction: true,
  },
  family: { connectedName: '', connectedRelation: '' },
};

const loadInitialData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_DATA,
      ...parsed,
      profile: { ...DEFAULT_DATA.profile, ...parsed.profile },
      alarms: { ...DEFAULT_DATA.alarms, ...parsed.alarms },
      notifications: { ...DEFAULT_DATA.notifications, ...parsed.notifications },
      family: { ...DEFAULT_DATA.family, ...parsed.family },
    };
  } catch {
    return DEFAULT_DATA;
  }
};

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [data, setData] = useState(loadInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const value = useMemo(
    () => ({
      data,
      setProfile: (patch) =>
        setData((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } })),
      setInterests: (interests) => setData((prev) => ({ ...prev, interests })),
      addMedication: (medication) =>
        setData((prev) => ({ ...prev, medications: [...prev.medications, medication] })),
      updateMedication: (id, patch) =>
        setData((prev) => ({
          ...prev,
          medications: prev.medications.map((med) => (med.id === id ? { ...med, ...patch } : med)),
        })),
      removeMedication: (id) =>
        setData((prev) => ({
          ...prev,
          medications: prev.medications.filter((med) => med.id !== id),
        })),
      setAlarms: (patch) => setData((prev) => ({ ...prev, alarms: { ...prev.alarms, ...patch } })),
      setNotification: (key, value) =>
        setData((prev) => ({
          ...prev,
          notifications: { ...prev.notifications, [key]: value },
        })),
      setFamily: (patch) => setData((prev) => ({ ...prev, family: { ...prev.family, ...patch } })),
      resetAppData: () => setData(DEFAULT_DATA),
    }),
    [data],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};
