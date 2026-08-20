// 처음 들어온 사람에게 온담을 한 바퀴 보여주는 가이드.
//
// 화면마다 data-tour="..." 표시를 붙여두고, 여기서는 그 이름만 가리킨다.
// 가이드는 앱을 조종하지 않고 지켜보기만 한다. 표시가 화면에 나타나면 그 단계를
// 그리고, 사라지면 기다린다. 그래서 중간에 딴 데를 눌러도 깨지지 않는다.
//
//  anchor  이 단계가 '있을 자리'인지 판단하는 표시. 없으면 기다린다.
//  target  구멍을 뚫어 밝힐 표시. null이면 화면 전체를 어둡게 한다.
//  advance 다음으로 넘어가는 방법
//          any  — 아무 데나 누르면
//          next — 다음 단계의 표시가 화면에 나타나면 (화면이 열리는 경우)
//          gone — 지금 단계의 표시가 사라지면 (화면이 닫히는 경우)

export const TOUR_STEPS = [
  {
    id: 'intro',
    anchor: 'cta',
    target: null,
    advance: 'any',
    place: 'center',
    title: '온담에 오신 걸 환영해요',
    body: '떨어져 지내도 매일 안부를 나누는 곳이에요.\n어떻게 쓰는지 한 바퀴 보여드릴게요.',
    action: '둘러보기',
  },
  {
    id: 'cta',
    anchor: 'cta',
    target: 'cta',
    advance: 'next',
    title: '하루를 여기서 시작해요',
    body: '아침 질문, 약 체크, 저녁 기록을 이 자리에서 엽니다.',
  },
  {
    // 아침 질문 팝업까지 직접 열게 하지 않는다. 팝업 전체와 닫기 버튼만
    // 짚어주고, 닫으면(=다른 화면으로 넘어가면) 바로 다음 단계로 간다.
    // targets의 첫 번째가 실제로 눌리는(클릭이 통과하는) 자리라서, 안의
    // 항목(아침질문/약/저녁)을 눌러 다른 팝업이 뜨며 깨지지 않도록 닫기
    // 버튼을 맨 앞에 둔다. 박스 전체 링은 여전히 같이 밝혀서 보여만 준다.
    id: 'picker',
    anchor: 'picker-box',
    targets: ['picker-close', 'picker-box'],
    advance: 'gone',
    title: '아침엔 질문, 낮엔 약, 저녁엔 기록',
    body: '하루 세 번이면 충분해요. 닫으면 다음으로 넘어가요.',
  },
  {
    id: 'journal-nav',
    anchor: 'nav-journal',
    target: 'nav-journal',
    advance: 'next',
    title: '오늘 남긴 기록은 한곳에 모여요',
    body: '아침 답변부터 약, 저녁 기록까지 하루가 쌓입니다.',
  },
  {
    id: 'ai',
    anchor: 'ai-comment',
    // 온담 한마디와 뒤로가기를 함께 밝힌다. 어디를 눌러야 이어지는지 글로만
    // 적어두면 찾지 못한다.
    targets: ['ai-comment', 'page-back'],
    advance: 'gone',
    // 뒤로가기 버튼은 화면 왼쪽 위에 있어서 어두운 판에 덮인다.
    // '뒤로가기로 돌아가라'고 해놓고 그 버튼을 막으면 여기서 갇힌다.
    passthrough: true,
    title: '온담이 하루를 읽고 한마디 남겨드려요',
    body: '오늘의 기록을 보고 하루를 되돌아보세요.',
  },
  {
    // 투어에서 안 연 기능들이 여기서 한꺼번에 이름을 얻는다.
    id: 'map',
    anchor: 'cta',
    target: null,
    advance: 'any',
    place: 'bottom',
    dim: 0.42,
    map: true,
    title: '온담에는 이런 것들이 있어요',
    body: '이 가이드는 설정 > 도움말에서 언제든 다시 볼 수 있어요.',
    action: '시작하기',
  },
];

// 마지막 '지도' 단계에서 붙는 이름표.
//
// 하단 툴바도 제 이름을 달고 있지만 '우리의 추억'처럼 뜻이 바로 잡히지 않는 말이라,
// 무엇을 보는 곳인지 한마디씩 얹는다.
export const MAP_LABELS = [
  { target: 'top-health', text: '복용약/건강검진', side: 'below' },
  { target: 'top-bell', text: '알림', side: 'below' },
  { target: 'top-settings', text: '설정', side: 'below' },
  { target: 'mailbox', text: '가족에게 편지', side: 'above' },
  { target: 'nav-questions', text: '지난 질문과 답', side: 'above' },
  { target: 'nav-journal', text: '오늘 기록', side: 'above' },
  { target: 'nav-weekly', text: '한 주 요약', side: 'above' },
];
