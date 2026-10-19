/**
 * @jest-environment node
 */

import { publicPath } from './publicPath';

describe('publicPath', () => {
  const originalBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

  afterEach(() => {
    if (originalBasePath == null) {
      delete process.env.NEXT_PUBLIC_BASE_PATH;
    } else {
      process.env.NEXT_PUBLIC_BASE_PATH = originalBasePath;
    }
  });

  it('returns the path unchanged when no base path is set', () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    expect(publicPath('/imgs/logos/logo_hori.png')).toBe('/imgs/logos/logo_hori.png');
  });

  it('prefixes the GitHub Pages base path', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/Care-Bear-Daycare';
    expect(publicPath('/imgs/logos/logo_hori.png')).toBe(
      '/Care-Bear-Daycare/imgs/logos/logo_hori.png',
    );
  });

  it('leaves absolute URLs unchanged', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/Care-Bear-Daycare';
    expect(publicPath('https://example.com/logo.png')).toBe('https://example.com/logo.png');
  });
});
