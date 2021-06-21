export const Str = {
  endWith(haystack: string, needle: string) {
    if (haystack.endsWith(needle)) return haystack;
    return `${haystack}${needle}`;
  },
  cutEnd(haystack: string, needle: string) {
    if (haystack.endsWith(needle)) return haystack.substr(0, haystack.length - needle.length);
    return haystack;
  },
}
