// 서버 설정에 없는 항목을 이 기기에만 저장한다.
// NotificationSettingResponse에는 편지 관련 필드가 없어서, '우편 보기'는 여기서 다룬다.
// 서버가 필드를 만들어주면 이 파일을 지우고 그쪽으로 옮기면 된다.

const MAILBOX_KEY = 'ondam:show-mailbox';

// 기본값은 켬. 저장한 적이 없으면 우체통이 보여야 한다.
export const getShowMailbox = () => localStorage.getItem(MAILBOX_KEY) !== 'off';

export const setShowMailbox = (on) => {
  localStorage.setItem(MAILBOX_KEY, on ? 'on' : 'off');
};

// 검진 알림 시점('3일 전' 등). HealthCheckupRequest에 해당 필드가 없어서
// 서버에 못 보내고 이 기기에만 남긴다. checkupId별로 저장한다.
const CHECKUP_ALERT_KEY = 'ondam:checkup-alerts';

const readCheckupAlerts = () => {
  try {
    return JSON.parse(localStorage.getItem(CHECKUP_ALERT_KEY) ?? '{}');
  } catch {
    return {};
  }
};

export const getCheckupAlert = (checkupId) => readCheckupAlerts()[String(checkupId)] ?? null;

export const setCheckupAlert = (checkupId, option) => {
  const saved = readCheckupAlerts();
  saved[String(checkupId)] = option;
  localStorage.setItem(CHECKUP_ALERT_KEY, JSON.stringify(saved));
};
