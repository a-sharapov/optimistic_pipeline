import { optimisticPipe } from "pipeline";

// Assets
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const transparentStep = (payload) => payload;
const increase = (payload) => payload + payload;
const multiply = (payload) => payload * payload;
const asyncIncrease = async (payload) =>
  await delay(1).then(() => increase(payload));
const asyncMultiply = async (payload) =>
  await delay(1).then(() => multiply(payload));
const payload = 1;

describe("Test optimistic pipeline logic", () => {
  test("It should work with sync functions", () => {
    const result = optimisticPipe(
      transparentStep,
      increase,
      increase,
      multiply
    )(payload);

    expect(result).toBe(16);
  });

  test("It should work with async functions", async () => {
    const result = await optimisticPipe(
      transparentStep,
      asyncIncrease,
      asyncIncrease,
      asyncMultiply
    )(payload);

    expect(result).toBe(16);
  });

  describe("Test error handling", () => {
    const originalLog = console.log;
    const originalError = console.error;
    let logs = [];
    let errors = [];

    console.log = (message) => {
      logs.push(message);
    };

    console.error = (message) => {
      errors.push(message);
    };

    test("It should return result and log an error with sync functions", () => {
      errors = [];
      const throwError = () => {
        throw new Error("Error in sync function");
      };

      const result = optimisticPipe(
        transparentStep,
        throwError,
        increase,
        throwError,
        increase,
        throwError,
        multiply
      )(payload);

      expect(result).toBe(16);
      expect(errors.length).toBe(3);
    });

    test("It should return result and log an error with async functions", async () => {
      errors = [];
      const asyncThrowError = async (payload) => {
        await delay(5).then(() => {
          throw new Error("Error in async function", { cause: payload });
        });
      };

      const result = await optimisticPipe(
        transparentStep,
        asyncIncrease,
        asyncThrowError,
        asyncIncrease,
        asyncThrowError,
        asyncMultiply,
        asyncThrowError
      )(payload);

      expect(result).toBe(16);
      expect(errors.length).toBe(3);
    });
  });
});
