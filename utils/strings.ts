import cronstrue from 'cronstrue';
import pluralizeFn from 'pluralize';

const polar = (value: string | number | undefined): 'Yes' | 'No' => {
  return !!value ? 'Yes' : 'No';
};

const removeInitialUnderscore = (str: string) => {
  if (str.startsWith('_')) {
    return str.replace('_', '');
  }

  return str;
};

// 1000 => 1k
const abbreviateUnit = (value: number): number | string => {
  if (value === Infinity) {
    return '∞';
  }

  const formatInteger = (num: number, divideBy: number): number =>
    parseInt((num / divideBy).toFixed(1).replace(/\.0$/, ''));

  if (value >= 1000000000) {
    return formatInteger(value, 1000000000) + 'G';
  }
  if (value >= 1000000) {
    return formatInteger(value, 1000000) + 'M';
  }
  if (value >= 1000) {
    return formatInteger(value, 1000) + 'K';
  }

  return value;
};

const humanCron = (
  cron?: string,
  fallback: string = 'No schedule assigned'
): string => {
  if (cron === 'event') {
    return 'LIVE Service';
  }

  if (cron && cron !== 'off') {
    try {
      return cronstrue.toString(cron);
    } catch (error) {
      return cron;
    }
  }

  return fallback;
};

// https://stackoverflow.com/questions/26188882/split-pascal-case-in-javascript-certain-case/26188910
// 'CreditMemos' => 'Credit Memos'
const splitPascal = (value?: string): string | null =>
  value
    ? value
        .replace(/([A-Z]+)([A-Z][a-z])/g, ' $1 $2')
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/([a-zA-Z])(\d)/g, '$1 $2')
        .replace(/^./, (string) => string.toUpperCase())
        .trim()
    : null;

const pluralise = (
  value: string,
  count: number,
  inclusive: boolean = true
): string => pluralizeFn(value, count, inclusive);

const pretty = (value: Object): string => JSON.stringify(value, null, 2);

export {
  abbreviateUnit,
  humanCron,
  splitPascal,
  polar,
  removeInitialUnderscore,
  pluralise,
  pretty,
};
