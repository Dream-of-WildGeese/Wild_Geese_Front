import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getUserId } from '../api/client';

// 사용자별로 localStorage를 분리해서 저장
const getStorageKey = (userId) => `ondam.appData.${userId ?? 'guest'}`;

// healthInsight 캐싱 로직에 있던 버그(나/가족 탭 전환 경쟁 상태로 서로 다른 사람의
// 문구가 섞여 저장됨) 때문에, 배포 전에 이미 브라우저에 잘못된 값이 저장된 사용자가
// 있을 수 있다. 그 사용자들은 devtools로 직접 지울 수 없으니, 캐시 구조가 바뀔 때마다
// 이 값을 올려서 예전 버전 캐시는 자동으로 버리고 새로 채우게 한다.
const HEALTH_INSIGHT_CACHE_VERSION = 1;

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
  // 건강검진 화면의 AI 인사이트 캐시. 서버가 조회할 때마다 문구를 새로 생성해서
  // 저녁 건강체크를 완료했을 때만 갱신되게 프론트에서 붙잡아둔다. 나/가족 인사이트가
  // 섞이지 않도록 대상별로 따로 저장한다.
  healthInsight: {
    version: HEALTH_INSIGHT_CACHE_VERSION,
    me: { questions: [], forDate: '' },
    family: { questions: [], forDate: '' },
  },
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
      // 버전이 다르면(이번 수정 이전에 저장된 캐시 포함) 예전 값은 섞지 않고 그냥 버린다.
      healthInsight:
        parsed.healthInsight?.version === HEALTH_INSIGHT_CACHE_VERSION
          ? {
              version: HEALTH_INSIGHT_CACHE_VERSION,
              me: { ...DEFAULT_DATA.healthInsight.me, ...parsed.healthInsight?.me },
              family: { ...DEFAULT_DATA.healthInsight.family, ...parsed.healthInsight?.family },
            }
          : DEFAULT_DATA.healthInsight,
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

      setHealthInsight: (person, patch) =>
        setData((prev) => ({
          ...prev,
          healthInsight: {
            ...prev.healthInsight,
            [person]: { ...prev.healthInsight[person], ...patch },
          },
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