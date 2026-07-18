/**
 * Lightweight dependency injection container.
 * Constructor injection only — no decorators, no reflection magic.
 * Bun-friendly and fully typed via tokens.
 */

export type Token<T> = symbol & { readonly __type?: T };

export function createToken<T>(name: string): Token<T> {
  return Symbol(name) as Token<T>;
}

type Factory<T> = (container: Container) => T;

interface Binding<T> {
  factory: Factory<T>;
  singleton: boolean;
  instance?: T;
}

export class Container {
  private readonly bindings = new Map<symbol, Binding<unknown>>();
  private readonly parent: Container | null;

  constructor(parent?: Container) {
    this.parent = parent ?? null;
  }

  /** Register a factory (transient by default) */
  bind<T>(token: Token<T>, factory: Factory<T>): this {
    this.bindings.set(token, { factory, singleton: false });
    return this;
  }

  /** Register a singleton factory */
  singleton<T>(token: Token<T>, factory: Factory<T>): this {
    this.bindings.set(token, { factory, singleton: true });
    return this;
  }

  /** Register a concrete instance as a singleton */
  instance<T>(token: Token<T>, value: T): this {
    this.bindings.set(token, {
      factory: () => value,
      singleton: true,
      instance: value,
    });
    return this;
  }

  /** Resolve a dependency */
  resolve<T>(token: Token<T>): T {
    const binding = this.bindings.get(token) as Binding<T> | undefined;
    if (binding) {
      if (binding.singleton) {
        if (binding.instance === undefined) {
          binding.instance = binding.factory(this);
        }
        return binding.instance;
      }
      return binding.factory(this);
    }

    if (this.parent) {
      return this.parent.resolve(token);
    }

    throw new Error(`No binding found for token: ${token.description ?? String(token)}`);
  }

  /** Check if a token is bound */
  has(token: Token<unknown>): boolean {
    if (this.bindings.has(token)) return true;
    return this.parent?.has(token) ?? false;
  }

  /** Create a child container that inherits parent bindings */
  createChild(): Container {
    return new Container(this);
  }
}

/** Well-known DI tokens */
export const TOKENS = {
  EventBus: createToken<import("../events/event-bus.js").EventBus>("EventBus"),
  Registry: createToken<import("../registry/registry.js").Registry>("Registry"),
  Config: createToken<import("../schemas/config.js").AgentEvalBenchConfig>("Config"),
  Scorer: createToken<import("../contracts/scoring.js").Scorer>("Scorer"),
} as const;
