import { Pipeline } from "./module";

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
export default Pipeline.createPipelineWithErrorHandler(/*replace with custom handler*/);
