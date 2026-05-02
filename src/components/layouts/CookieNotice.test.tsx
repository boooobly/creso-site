// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import CookieNotice from './CookieNotice';

describe('CookieNotice settings panel', () => {
  it('clicking Настроить exposes settings panel', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<CookieNotice />);
    });

    const button = Array.from(container.querySelectorAll('button')).find((el) => el.textContent?.includes('Настроить'));
    expect(button).toBeTruthy();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.querySelector('[data-testid="cookie-settings-panel"]')).toBeTruthy();

    await act(async () => {
      root.unmount();
    });
  });
});
