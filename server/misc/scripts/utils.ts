export const parseCliArgs = (): Record<string, string> => {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  let currentKey: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--')) {
      currentKey = arg.slice(2);
      result[currentKey] = '';
    } else if (currentKey) {
      result[currentKey] = arg;
      currentKey = undefined;
    }
  }

  return result;
};
