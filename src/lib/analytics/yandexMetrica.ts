const getCounterId = () => {
  const value = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim();
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

type YandexMetricaAction = 'hit' | 'reachGoal';
type YandexGoalContactType = 'phone' | 'whatsapp' | 'telegram' | 'email';

export const YANDEX_GOALS = {
  phoneClick: 'phone_click',
  whatsappClick: 'whatsapp_click',
  telegramClick: 'telegram_click',
  emailClick: 'email_click',
  leadFormSubmit: 'lead_form_submit',
  wideFormatFormSubmit: 'wide_format_form_submit',
  bagetOrderSubmit: 'baget_order_submit',
  mugsOrderSubmit: 'mugs_order_submit',
  calculatorStart: 'calculator_start',
  calculatorSubmit: 'calculator_submit',
  ctaClick: 'cta_click',
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

export function trackLeadFormSubmit(params?: Record<string, unknown>) {
  reachGoal(YANDEX_GOALS.leadFormSubmit, params);
}

export function trackWideFormatFormSubmit(params?: Record<string, unknown>) {
  reachGoal(YANDEX_GOALS.wideFormatFormSubmit, params);
}

export function trackBagetOrderSubmit(params?: Record<string, unknown>) {
  reachGoal(YANDEX_GOALS.bagetOrderSubmit, params);
}

export function trackMugsOrderSubmit(params?: Record<string, unknown>) {
  reachGoal(YANDEX_GOALS.mugsOrderSubmit, params);
}

export function trackCalculatorStart(params?: Record<string, unknown>) {
  reachGoal(YANDEX_GOALS.calculatorStart, params);
}

export function trackCalculatorSubmit(params?: Record<string, unknown>) {
  reachGoal(YANDEX_GOALS.calculatorSubmit, params);
}

export function trackCtaClick(params?: Record<string, unknown>) {
  reachGoal(YANDEX_GOALS.ctaClick, params);
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
