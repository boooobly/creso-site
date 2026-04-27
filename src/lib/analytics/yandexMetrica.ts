const getCounterId = () => {
  const value = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim();
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

type YandexMetricaAction = 'hit' | 'reachGoal';
type YandexGoalContactType = 'phone' | 'whatsapp' | 'telegram' | 'email';

type YandexMetricaWindow = Window & {
  ym?: (counterId: number, action: YandexMetricaAction, target: string, params?: Record<string, unknown>) => void;
};

function sendYandexEvent(action: YandexMetricaAction, target: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const counterId = getCounterId();
  if (!counterId) return;

  const ym = (window as YandexMetricaWindow).ym;
  if (typeof ym !== 'function') return;

  ym(counterId, action, target, params);
}

export function trackHit(url: string) {
  sendYandexEvent('hit', url);
}

export function reachGoal(goalName: string, params?: Record<string, unknown>) {
  sendYandexEvent('reachGoal', goalName, params);
}

export function trackContactClick(type: YandexGoalContactType) {
  const goalMap: Record<YandexGoalContactType, string> = {
    phone: 'phone_click',
    whatsapp: 'whatsapp_click',
    telegram: 'telegram_click',
    email: 'email_click',
  };

  reachGoal(goalMap[type]);
}
