import { describe, it, expect, beforeEach } from "vitest";
import { Container, createToken } from "../di/container.js";

interface Service {
  name: string;
}

describe("Container", () => {
  const SERVICE = createToken<Service>("Service");
  const DEP = createToken<{ value: number }>("Dep");

  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  it("binds and resolves transient factories", () => {
    let calls = 0;
    container.bind(SERVICE, () => {
      calls++;
      return { name: `s-${calls}` };
    });

    const a = container.resolve(SERVICE);
    const b = container.resolve(SERVICE);
    expect(a.name).not.toBe(b.name);
    expect(calls).toBe(2);
  });

  it("resolves singletons once", () => {
    let calls = 0;
    container.singleton(SERVICE, () => {
      calls++;
      return { name: "singleton" };
    });

    expect(container.resolve(SERVICE)).toBe(container.resolve(SERVICE));
    expect(calls).toBe(1);
  });

  it("registers concrete instances", () => {
    const svc = { name: "direct" };
    container.instance(SERVICE, svc);
    expect(container.resolve(SERVICE)).toBe(svc);
  });

  it("supports child containers with parent fallback", () => {
    container.instance(DEP, { value: 42 });
    const child = container.createChild();
    child.bind(SERVICE, (c) => ({ name: `v=${c.resolve(DEP).value}` }));

    expect(child.resolve(SERVICE).name).toBe("v=42");
  });

  it("throws on missing binding", () => {
    expect(() => container.resolve(SERVICE)).toThrow(/No binding found/);
  });

  it("has() checks local and parent", () => {
    expect(container.has(SERVICE)).toBe(false);
    container.instance(SERVICE, { name: "x" });
    expect(container.has(SERVICE)).toBe(true);
    expect(container.createChild().has(SERVICE)).toBe(true);
  });
});
