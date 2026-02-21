import { describe, it, expect } from 'vitest';
import { MENU_OPTIONS, MENU_CATEGORIES } from '../../../src/shared/constants/menu.js';

const VALID_CATEGORIES = new Set(MENU_CATEGORIES.map((c) => c.id));

describe('MENU_OPTIONS', () => {
  it('should have all required fields for each option', () => {
    for (const opt of MENU_OPTIONS) {
      expect(opt.id).toBeDefined();
      expect(typeof opt.id).toBe('string');
      expect(opt.title).toBeDefined();
      expect(typeof opt.title).toBe('string');
      expect(opt.description).toBeDefined();
      expect(typeof opt.description).toBe('string');
      expect(opt.command).toBeDefined();
      expect(typeof opt.command).toBe('string');
      expect(opt.category).toBeDefined();
      expect(typeof opt.category).toBe('string');
    }
  });

  it('should have no duplicate ids', () => {
    const ids = MENU_OPTIONS.map((o) => o.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('should have valid category references', () => {
    for (const opt of MENU_OPTIONS) {
      expect(VALID_CATEGORIES.has(opt.category)).toBe(true);
    }
  });

  it('should have at least one option per category', () => {
    const optionsByCategory = MENU_OPTIONS.reduce<Record<string, number>>(
      (acc, opt) => {
        acc[opt.category] = (acc[opt.category] ?? 0) + 1;
        return acc;
      },
      {}
    );

    for (const cat of MENU_CATEGORIES) {
      const count = optionsByCategory[cat.id] ?? 0;
      expect(count).toBeGreaterThan(0);
    }
  });
});
