import type { ZodIssue } from 'zod';

export function normalizeNumericInput(rawValue: string) {
  return rawValue.trim().replace(',', '.');
}

export function parseNumericInput(rawValue: string) {
  return Number(normalizeNumericInput(rawValue));
}

export function getFriendlyNumericValidationMessage(rawValue: string, issue?: ZodIssue) {
  if (!rawValue.trim()) {
    return 'Заполните поле числом.';
  }

  if (!Number.isFinite(parseNumericInput(rawValue))) {
    return 'Введите число без букв и лишних символов. Дробную часть можно указать через точку или запятую.';
  }

  if (!issue) {
    return 'Проверьте числовое значение.';
  }

  if (issue.code === 'too_small') {
    const minimum = typeof issue.minimum === 'number' ? issue.minimum.toLocaleString('ru-RU') : null;
    return minimum ? `Значение должно быть не меньше ${minimum}.` : 'Значение слишком маленькое.';
  }

  if (issue.code === 'too_big') {
    const maximum = typeof issue.maximum === 'number' ? issue.maximum.toLocaleString('ru-RU') : null;
    return maximum ? `Значение должно быть не больше ${maximum}.` : 'Значение слишком большое.';
  }

  if (issue.code === 'invalid_type') {
    return 'Введите число без букв и лишних символов. Дробную часть можно указать через точку или запятую.';
  }

  return issue.message || 'Проверьте числовое значение.';
}
