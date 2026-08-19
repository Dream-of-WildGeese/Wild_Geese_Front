// 목록 API(편지·알림)를 다룰 때 쓰는 도우미.
//
// 서버는 이 목록들을 '오래된 순'으로만 내려주고, sort 파라미터도 받지 않는다.
// 그래서 첫 페이지만 받으면 손에 들어오는 건 가장 오래된 것들이고, 새로 온 편지나
// 알림은 뒤 페이지에 남아서 화면에 영영 나타나지 않는다.
// (실제로 편지 39건 중 앞 20건만, 알림 134건 중 앞 30건만 받고 있었다)
//
// 전체 개수를 보고 모자라면 다시 받아서 최신까지 가져온다.

// 한 번에 들고 올 최대 개수. 기록이 계속 쌓여도 요청이 무거워지지 않게 막아둔다.
const MAX_ITEMS = 200;

export async function fetchLatestPage(loadPage, initialSize = 30) {
  const first = await loadPage({ page: 0, size: initialSize });

  const total = first?.totalElements ?? first?.content?.length ?? 0;
  const loaded = first?.content?.length ?? 0;

  // 첫 요청으로 이미 다 받았으면 그대로 쓴다.
  if (loaded >= total) return first;

  // 상한 안이면 한 번에 전부 받는다.
  if (total <= MAX_ITEMS) {
    return loadPage({ page: 0, size: total });
  }

  // 상한을 넘으면 뒤쪽(최신) 두 페이지를 받아 붙인다.
  // 마지막 페이지 하나만 받으면, 전체 개수가 페이지 경계를 살짝 넘긴 경우
  // (예: 401건을 200씩 나누면 마지막 페이지에 1건) 목록이 텅 비어 보인다.
  const lastPage = Math.ceil(total / MAX_ITEMS) - 1;
  const pages = lastPage > 0 ? [lastPage - 1, lastPage] : [lastPage];

  const results = await Promise.all(
    pages.map((page) => loadPage({ page, size: MAX_ITEMS })),
  );

  const content = results.flatMap((result) => result?.content ?? []);
  return { ...results[results.length - 1], content };
}
