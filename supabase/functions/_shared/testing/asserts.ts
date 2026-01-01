export class AssertionError extends Error {
  constructor(message?: string) {
    super(message ?? "Assertion failed");
    this.name = "AssertionError";
  }
}

export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(message);
  }
}

export function assertEquals<T>(actual: T, expected: T, message?: string): void {
  if (Object.is(actual, expected)) {
    return;
  }

  const details = `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
  throw new AssertionError(message ? `${message}: ${details}` : details);
}

export function assertExists<T>(
  value: T,
  message?: string,
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new AssertionError(message ?? "Expected value to be defined");
  }
}

export function assertThrows(
  fn: () => void,
  ErrorClass?: new (message?: string) => Error,
  messageIncludes?: string,
): void {
  try {
    fn();
  } catch (error) {
    if (ErrorClass && !(error instanceof ErrorClass)) {
      throw new AssertionError(
        `Expected error of type ${ErrorClass.name}, got ${
          error instanceof Error ? error.name : typeof error
        }`,
      );
    }
    if (messageIncludes && error instanceof Error && !error.message.includes(messageIncludes)) {
      throw new AssertionError(
        `Expected error message to include "${messageIncludes}", got "${error.message}"`,
      );
    }
    return;
  }

  throw new AssertionError("Expected function to throw");
}
