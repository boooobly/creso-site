import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AnalyticsConsentPage from './page';

describe('/analytics-consent page', () => {
  it('renders russian consent explanation', () => {
    const html = renderToStaticMarkup(<AnalyticsConsentPage />);
    expect(html).toContain('Согласие на аналитику');
    expect(html).toContain('Яндекс.Метрика');
    expect(html).toContain('/privacy');
  });
});
