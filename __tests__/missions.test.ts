import {
  affirmationMatches,
  generateMathProblem,
  generateMathSet,
  normalizePhrase,
} from '@/features/missions/logic';

describe('math mission', () => {
  it('generated problems have a correct answer', () => {
    for (let i = 0; i < 200; i++) {
      const p = generateMathProblem('hard');
      const [a, op, b] = p.prompt.split(' ');
      const na = Number(a);
      const nb = Number(b);
      const expected = op === '+' ? na + nb : op === '-' ? na - nb : na * nb;
      expect(p.answer).toBe(expected);
      expect(p.answer).toBeGreaterThanOrEqual(0); // subtraction never negative
    }
  });

  it('produces an increasing-length set per difficulty', () => {
    expect(generateMathSet('easy')).toHaveLength(2);
    expect(generateMathSet('medium')).toHaveLength(3);
    expect(generateMathSet('hard')).toHaveLength(3);
  });
});

describe('affirmation mission', () => {
  it('normalises punctuation, case and ё/е', () => {
    expect(normalizePhrase('Всё БУДЕТ хорошо!')).toBe('все будет хорошо');
  });

  it('accepts a fuzzy transcript above threshold', () => {
    expect(affirmationMatches('сегодня будет отличный день', 'Сегодня будет отличный день')).toBe(
      true,
    );
    // 3 of 4 target words present → 0.75 ≥ 0.7
    expect(affirmationMatches('сегодня отличный день', 'сегодня будет отличный день')).toBe(true);
  });

  it('rejects a transcript below threshold', () => {
    expect(affirmationMatches('привет', 'сегодня будет отличный день')).toBe(false);
  });
});
