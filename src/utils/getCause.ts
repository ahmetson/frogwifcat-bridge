function hasCause(error: {
  cause?: unknown;
}): error is { cause: { shortMessage: string } } {
  if (!error.cause) return false;
  if (!(typeof error.cause === 'object')) return false;
  if (!('shortMessage' in error.cause)) return false;

  return typeof error.cause.shortMessage === 'string';
}

export function getCause(error: Error | null) {
  if (!error) {
    return undefined;
  }

  return hasCause(error) ? error.cause.shortMessage : error.message;
}
