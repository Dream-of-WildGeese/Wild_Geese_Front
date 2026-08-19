// 온보딩(건강 프로필)과 설정(프로필 수정)이 같은 목록·같은 규칙으로 지병을 다루도록
// 한곳에 모아둔다. 한쪽에서만 항목을 고치면 두 화면이 서로 다른 목록을 보여준다.

export const DISEASE_LIST = [
  '고혈압',
  '당뇨',
  '고지혈증',
  '심장질환',
  '관절·허리 통증',
  '골다공증',
  '기타',
  '없음',
];

// 서버가 준 목록을 화면 상태 두 개로 나눈다.
// selected: 목록에서 고른 항목('기타' 표시 포함) / others: 직접 적어 넣은 병명
export function splitDiseases(saved) {
  // 과거 저장 버그로 같은 병명이 중복으로 들어 있을 수 있어 한 번 걸러낸다.
  const unique = [...new Set(saved ?? [])];
  const selected = unique.filter((item) => DISEASE_LIST.includes(item));
  const others = unique.filter((item) => !DISEASE_LIST.includes(item));

  // 직접 적은 병명이 있으면 '기타'를 고른 상태로 본다. 서버에는 '기타'라는
  // 표시 자체를 저장하지 않아서, 없으면 입력칸이 닫힌 채로 열린다.
  if (others.length > 0 && !selected.includes('기타')) selected.push('기타');

  return { selected, others };
}

// 화면 상태를 서버에 보낼 형태로 되돌린다.
// '기타'는 입력칸을 여는 표시일 뿐이라 서버로는 보내지 않는다.
export function mergeDiseases(selected, others) {
  const standard = (selected ?? []).filter(
    (item) => DISEASE_LIST.includes(item) && item !== '기타',
  );
  return [...new Set([...standard, ...(others ?? [])])];
}

// 칩 하나를 눌렀을 때의 다음 상태.
// '없음'은 다른 항목과 함께 있을 수 없고, '기타'를 끄면 직접 적은 병명도 함께 지운다.
export function toggleDisease({ selected, others }, disease) {
  if (disease === '없음') {
    return selected.includes('없음')
      ? { selected: [], others: [] }
      : { selected: ['없음'], others: [] };
  }

  const withoutNone = selected.filter((item) => item !== '없음');

  if (disease === '기타' && withoutNone.includes('기타')) {
    return { selected: withoutNone.filter((item) => item !== '기타'), others: [] };
  }

  return {
    selected: withoutNone.includes(disease)
      ? withoutNone.filter((item) => item !== disease)
      : [...withoutNone, disease],
    others,
  };
}
