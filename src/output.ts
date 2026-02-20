export function output(data: unknown): void {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

export function outputError(message: string, details?: unknown): never {
  const err: Record<string, unknown> = { error: message };
  if (details !== undefined) err.details = details;
  process.stderr.write(JSON.stringify(err, null, 2) + "\n");
  process.exit(1);
}
