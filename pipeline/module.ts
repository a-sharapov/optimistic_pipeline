import { Utils } from "shared/utils";

export namespace Pipeline {
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
