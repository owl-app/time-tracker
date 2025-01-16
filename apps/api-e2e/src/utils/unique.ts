export function isForbiddenWordIncluded(text: string, forbiddenWords: string[]): boolean {
  return forbiddenWords.some((word) => {
    const regex = new RegExp(`^(?:(?!${word}).)*$`);

    return !regex.test(text.toLowerCase());
  });
}

export function generateWithoutWords<Params>(
  runable: (params?: Params) => string,
  forbiddenWords: string[],
  runnableParams: Params = null
): string {
  let text: string;

  do {
    if (runnableParams) {
      text = runable(runnableParams);
    } else {
      text = runable();
    }
  } while (isForbiddenWordIncluded(text, forbiddenWords));

  return text;
}
