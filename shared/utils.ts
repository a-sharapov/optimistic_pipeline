export namespace Utils {
  const DEFAULT_HASH_DICTIONARY =
    "_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  export const getRandomHash = (
    length = 10,
    dictionary = DEFAULT_HASH_DICTIONARY
  ) =>
    Array.from({ length }, () =>
      dictionary.charAt(Math.floor(Math.random() * dictionary.length))
    ).join("");

  export const log =
    (type: keyof Console = "log") =>
    (data: unknown): void => {
      const currentDate = new Date().toLocaleString("ru-RU");

      console.log(`\x1b[30m%s\x1b[0m`, `[ → ${currentDate}, λ: ]`);
      (console[type] as (msg: unknown) => void)?.(data);
      console.log(`\x1b[30m%s\x1b[0m`, "[ /λ ]");
    };
}
