import { describe, it, expect } from 'vitest';
import { APP_ROUTES, RouteId } from '../../src/config/routes';

describe('Route Manifest Integrity', () => {
  it('all routes have required metadata', () => {
    Object.values(APP_ROUTES).forEach(route => {
      expect(route.id).toBeDefined();
      expect(route.path).toBeDefined();
      expect(route.path.startsWith('/')).toBe(true);
      expect(typeof route.isProtected).toBe('boolean');
    });
  });

  it('no duplicate paths', () => {
    const paths = Object.values(APP_ROUTES).map(r => r.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });
});
