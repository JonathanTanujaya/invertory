import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, formatDate, calculateSubtotal } from '@/utils/helpers';

describe('Helper Functions', () => {
  describe('formatCurrency', () => {
    it('formats number to IDR currency', () => {
      expect(formatCurrency(1000000)).toBe('Rp1.000.000');
    });

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('Rp0');
    });
  });

  describe('formatNumber', () => {
    it('formats number with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1.000');
      expect(formatNumber(1234567)).toBe('1.234.567');
    });
  });

  describe('formatDate', () => {
    it('formats date to dd/MM/yyyy', () => {
      const date = new Date('2024-11-21');
      expect(formatDate(date, 'dd/MM/yyyy')).toBe('21/11/2024');
    });

    it('formats date to yyyy-MM-dd', () => {
      const date = new Date('2024-11-21');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-11-21');
    });

    it('returns - for invalid date', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
    });
  });

  describe('calculateSubtotal', () => {
    it('calculates subtotal without discount', () => {
      expect(calculateSubtotal(10, 5000)).toBe(50000);
    });

    it('calculates subtotal with discount', () => {
      expect(calculateSubtotal(10, 5000, 10)).toBe(45000);
    });

    it('handles zero quantity', () => {
      expect(calculateSubtotal(0, 5000)).toBe(0);
    });
  });
});
