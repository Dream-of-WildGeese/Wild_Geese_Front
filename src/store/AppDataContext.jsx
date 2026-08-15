import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getUserId } from '../api/client';

// 사용자별로 localStorage를 분리해서 저장
const getStorageKey = (userId) => `ondam.appData.${userId ?? 'guest'}`;

const DEFAULT_DATA = {
  profile: { name: '', birth: '', gender: '', role: null },
  interests: [],
  conditions: [], 
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

const loadInitialData = (userId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
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
  const userId = getUserId();
  const storageKey = getStorageKey(userId);

  const [data, setData] = useState(() => loadInitialData(userId));

  // UserType에서 계정이 바뀌면 해당 유저 데이터 다시 불러오기
  useEffect(() => {
    setData(loadInitialData(userId));
  }, [userId]);

  // 현재 유저 키에만 저장
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, storageKey]);

  const value = useMemo(
    () => ({
      data,

      setProfile: (patch) =>
        setData((prev) => ({
          ...prev,
          profile: { ...prev.profile, ...patch },
        })),

      setInterests: (interests) =>
        setData((prev) => ({ ...prev, interests })),

      setConditions: (conditions) =>
        setData((prev) => ({ ...prev, conditions })),

      addMedication: (medication) =>
        setData((prev) => ({
          ...prev,
          medications: [...prev.medications, medication],
        })),

      updateMedication: (id, patch) =>
        setData((prev) => ({
          ...prev,
          medications: prev.medications.map((med) =>
            med.id === id ? { ...med, ...patch } : med
          ),
        })),

      removeMedication: (id) =>
        setData((prev) => ({
          ...prev,
          medications: prev.medications.filter((med) => med.id !== id),
        })),

      setAlarms: (patch) =>
        setData((prev) => ({
          ...prev,
          alarms: { ...prev.alarms, ...patch },
        })),

      setNotification: (key, value) =>
        setData((prev) => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [key]: value,
          },
        })),

      setFamily: (patch) =>
        setData((prev) => ({
          ...prev,
          family: { ...prev.family, ...patch },
        })),

      resetAppData: () => setData(DEFAULT_DATA),
    }),
    [data]
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};