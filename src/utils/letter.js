import { toDateString } from './medication';

const PREVIEW_LENGTH = 30;

// 편지 목록(35)은 '오늘', '어제', '8.10'처럼 짧게 보여준다.
export const formatLetterDate = (isoString, now = new Date()) => {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (toDateString(date) === toDateString(now)) return '오늘';
  if (toDateString(date) === toDateString(yesterday)) return '어제';
  return `${date.getMonth() + 1}.${date.getDate()}`;
};

// 편지를 펼친 화면(35b)은 '2026년 08월 16일'처럼 전체 날짜를 쓴다.
export const formatLetterFullDate = (isoString) => {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}년 ${month}월 ${day}일`;
};

// 서버의 LetterResponse를 편지함 화면이 쓰는 형태로 바꾼다.
// 읽음 여부는 readAt이 채워졌는지로 판단한다.
export const toLetterView = (letter) => {
  const content = letter.content ?? '';
  return {
    id: letter.letterId,
    sender: letter.fromUser?.name ?? '가족',
    date: formatLetterDate(letter.createdAt),
    fullDate: formatLetterFullDate(letter.createdAt),
    preview: content.length > PREVIEW_LENGTH ? `${content.slice(0, PREVIEW_LENGTH)}...` : content,
    body: content,
    read: Boolean(letter.readAt),
    audioUrl: letter.audioUrl,
  };
};
