import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import JsonLd from './JsonLd';

describe('JSON-LD serialization', () => {
  it('keeps CMS text inside a single script without changing the data', () => {
    const data = { name: '</script><script>alert(1)</script>' };
    const html = renderToStaticMarkup(<JsonLd data={data} />);
    expect(html.match(/<script/g)).toHaveLength(1);
    const payload = html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>'));
    expect(JSON.parse(payload)).toEqual(data);
  });
});
