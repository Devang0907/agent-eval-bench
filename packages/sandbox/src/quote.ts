/** POSIX-safe single-argument shell quoting */
export function shellQuote(arg: string): string {
  if (arg === "") return "''";
  if (/^[a-zA-Z0-9_./:=+-]+$/.test(arg)) return arg;
  return `'${arg.replace(/'/g, `'\\''`)}'`;
}

export function shellQuoteAll(args: string[]): string {
  return args.map(shellQuote).join(" ");
}
