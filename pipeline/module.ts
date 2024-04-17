import { Utils } from "shared/utils";

export namespace Pipeline {
  /**
   * λ → () : Creates a higher order function that wraps the provided function with try-catch functionality.
   *
   * @param {Function} fn - The function to be executed within the try-catch block.
   * @param {Function} handleLog - Optional function to handle logging errors.
   * @return {Function} A function that executes the provided function within a try-catch block.
   */
  const wrapTryCatch =
    (fn: (arg: any) => any, handleCatch?: (error: unknown) => void) =>
    (arg: any) => {
      let result: any;
      try {
        result = fn(arg);
      } catch (error) {
        handleCatch?.(error);
      }

      return result || arg;
    };

  /**
   * λ → () : Creates a higher order function that logs an error message and returns the previous value.
   *
   * @param {unknown} previous - The previous value.
   * @return {Function} - A function that logs an error message and returns the previous value.
   */
  const createHandleCatch =
    (handleLog: (error: string) => void) =>
    <T extends unknown>(index: number, previous: T) =>
    async (error: Error | unknown): Promise<T> => {
      const meta: Record<string, unknown> = {
        identifier: index + 1,
        previous: (error instanceof Error && error.cause) || previous,
        message: String(
          error instanceof Error
            ? [error.message, error.cause].filter(Boolean).join(", ")
            : error
        ),
      };

      handleLog(
        `Error occurred during the execution of the pipeline step #${meta.identifier}.\n[Details]: ${meta.message}.`
      );

      return meta.previous as T;
    };

  const DEFAULT_LOG_HANDLER = createHandleCatch(Utils.log("error"));

  /**
   * λ → () : Creates a pipeline function that applies a series of functions (including async) to a payload.
   *
   * @param {Array<(argument: any) => any>} fns - The functions to apply to the payload.
   * @param {T} payload - The initial payload.
   * @return {unknown} The result of applying the functions to the payload.
   *
   * @example
   * const pipelineResult = pipe(
   *   (payload: number) => payload + 1,
   *   (payload: number) => payload * 2
   * )(1);
   */
  export const createPipelineWithErrorHandler =
    (handleCatch = DEFAULT_LOG_HANDLER) =>
    <T>(...fns: Array<(argument: any) => any>) =>
    (payload: T): T | unknown =>
      fns.reduce(
        (arg: T, fn: (arg: any) => any, index: number) =>
          arg instanceof Promise
            ? arg.then(fn).catch(handleCatch(index, arg))
            : wrapTryCatch(fn, handleCatch(index, arg))(arg),
        payload
      );
}
