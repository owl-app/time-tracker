export function isForbiddenWordIncluded(text: string, forbiddenWords: string[]): boolean {
  return forbiddenWords.some((word) => {
    const regex = new RegExp(`^(?:(?!${word}).)*$`);

    return !regex.test(text.toLowerCase());
  });
}

export function generateWithoutWords(runable: () => string, forbiddenWords: string[]): string {
  let text: string;

  do {
    text = runable();
  } while (isForbiddenWordIncluded(text, forbiddenWords));

  return text;
}
