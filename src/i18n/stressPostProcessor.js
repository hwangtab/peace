const STRESS_FLAG = process.env.NEXT_PUBLIC_I18N_STRESS;

const isStressEnabled = () => STRESS_FLAG === '1' || STRESS_FLAG === 'true';

const getPadCount = (length) => {
  const ratio = Number(process.env.NEXT_PUBLIC_I18N_STRESS_RATIO ?? 0.6);
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 0.6;
  const tokenLength = 16; // length of " LONGTEXTLONGTEXT"
  const rawCount = Math.ceil((length * safeRatio) / tokenLength);
  return Math.min(8, Math.max(2, rawCount));
};

module.exports = {
  name: 'stress',
  type: 'postProcessor',
  process(value) {
    if (!isStressEnabled()) return value;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return value;
    const padToken = ' LONGTEXTLONGTEXT';
    const pad = padToken.repeat(getPadCount(trimmed.length));
    return `${value}${pad}`;
  },
};
