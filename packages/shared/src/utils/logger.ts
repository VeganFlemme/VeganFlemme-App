export function createLogger(name: string) {
  return {
    log: (message: string, ...args: any[]) => console.log(`[${name}]`, message, ...args),
    error: (message: string, ...args: any[]) => console.error(`[${name}]`, message, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`[${name}]`, message, ...args),
  };
}