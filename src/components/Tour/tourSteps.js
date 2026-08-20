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
    title: '하루는 여기서 시작해요',
    body: '아침 질문, 약 체크, 저녁 기록을 이 자리에서 엽니다.',
    hint: '눌러보세요',
  },
  {
    id: 'picker',
    anchor: 'picker-morning',
    target: 'picker-morning',
    advance: 'next',
    title: '아침엔 질문, 낮엔 약, 저녁엔 기록',
    body: '하루 세 번이면 충분해요. 아침 질문부터 열어볼까요?',
    hint: '눌러보세요',
  },
  {
    // 여기가 온담의 심장이다. 같은 질문을 두 사람이 함께 받는다는 걸
    // 말로 설명하지 않고 화면으로 보여준다.
    id: 'morning',
    anchor: 'morning-popup',
    target: 'morning-popup',
    advance: 'gone',
    // 질문 화면에는 닫는 버튼이 없어서 바깥을 눌러야 닫힌다.
    // 어두운 판이 그걸 막으면 여기서 갇히므로, 이 단계만 클릭을 통과시킨다.
    passthrough: true,
    title: '같은 질문을 가족이 함께 받아요',
    body: '내가 답을 남기면 가족의 답도 열립니다.\n서로의 하루를 묻지 않아도 알게 돼요.',
    hint: '닫으면 이어서 보여드릴게요',
  },
  {
    id: 'journal-nav',
    anchor: 'nav-journal',
    target: 'nav-journal',
    advance: 'next',
    title: '오늘 남긴 기록은 한곳에 모여요',
    body: '아침 답변부터 약, 저녁 기록까지 하루가 쌓입니다.',
    hint: '눌러보세요',
  },
  {
    id: 'ai',
    anchor: 'ai-comment',
    target: 'ai-comment',
    advance: 'gone',
    title: '온담이 하루를 읽고 한마디 남겨요',
    body: '쌓인 기록을 보고 오늘이 어땠는지 짚어드려요.',
    hint: '뒤로가기로 홈에 돌아가면 마무리할게요',
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
    body: '위에는 내 건강과 알림, 아래에는 지난 질문과 주간 리포트가 있어요.',
    action: '시작하기',
  },
];

// 마지막 '지도' 단계에서 붙는 이름표.
// 하단 툴바는 이미 제 이름을 달고 있어서 여기 넣지 않는다. 이름이 두 번 겹친다.
export const MAP_LABELS = [
  { target: 'top-health', text: '내 건강', side: 'below' },
  { target: 'top-bell', text: '알림', side: 'below' },
  { target: 'top-settings', text: '설정', side: 'below' },
  { target: 'mailbox', text: '가족에게 편지', side: 'above' },
];
