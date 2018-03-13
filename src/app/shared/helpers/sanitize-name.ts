export const sanitizeName = (name: string): string =>
  name.trim().replace(/[ ]{2,}/, ' ');
