import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ServiceCard from './ServiceCard';

describe('ServiceCard', () => {
  it('renders a native image with the provided src', () => {
    const html = renderToStaticMarkup(
      <ServiceCard
        title="Багетные работы"
        desc="Описание"
        href="/services/baget"
        imageSrc="https://example.com/service.jpg"
      />,
    );

    expect(html).toContain('<img');
    expect(html).toContain('src="https://example.com/service.jpg"');
    expect(html).not.toContain('_next/image');
  });
});
