const getCounterId = () => {
  const value = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim();
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

type YandexMetricaAction = 'hit' | 'reachGoal';
type YandexGoalContactType = 'phone' | 'whatsapp' | 'telegram' | 'email';

export const YANDEX_GOALS = {
  mainLeadSubmitSuccess: 'main_lead_submit_success',
  contactFormSubmitSuccess: 'contact_form_submit_success',
  bagetOrderSubmitSuccess: 'baget_order_submit_success',
  wideFormatOrderSubmitSuccess: 'wide_format_order_submit_success',
  outdoorLeadSubmitSuccess: 'outdoor_lead_submit_success',
  millingOrderSubmitSuccess: 'milling_order_submit_success',
  businessCardsOrderSubmitSuccess: 'business_cards_order_submit_success',
  tshirtsOrderSubmitSuccess: 'tshirts_order_submit_success',
  mugsOrderSubmitSuccess: 'mugs_order_submit_success',
  reviewSubmitSuccess: 'review_submit_success',
  phoneClick: 'phone_click',
  whatsappClick: 'whatsapp_click',
  telegramClick: 'telegram_click',
  emailClick: 'email_click',
  plotterOrderSubmitSuccess: 'plotter_order_submit_success',
} as const;

export type YandexGoalName = (typeof YANDEX_GOALS)[keyof typeof YANDEX_GOALS] | (string & {});

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

export function reachGoal(goalName: YandexGoalName, params?: Record<string, unknown>) {
  sendYandexEvent('reachGoal', goalName, params);
}

export function trackGoal(goalName: YandexGoalName, params?: Record<string, unknown>) {
  reachGoal(goalName, params);
}

export function trackContactClick(type: YandexGoalContactType) {
  const goalMap: Record<YandexGoalContactType, YandexGoalName> = {
    phone: YANDEX_GOALS.phoneClick,
    whatsapp: YANDEX_GOALS.whatsappClick,
    telegram: YANDEX_GOALS.telegramClick,
    email: YANDEX_GOALS.emailClick,
  };

  reachGoal(goalMap[type]);
}
