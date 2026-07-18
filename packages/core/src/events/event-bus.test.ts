import { describe, it, expect, beforeEach } from "vitest";
import { EventBus } from "../events/event-bus.js";

describe("EventBus", () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it("emits and receives typed events", () => {
    const received: string[] = [];
    bus.on("prompt.sent", (e) => {
      received.push(e.type);
    });

    bus.emit({
      type: "prompt.sent",
      runId: "run-1",
      data: { prompt: "hello" },
    });

    expect(received).toEqual(["prompt.sent"]);
  });

  it("wildcard listener receives all events", () => {
    const types: string[] = [];
    bus.on("*", (e) => types.push(e.type));

    bus.emit({ type: "run.started", runId: "r1", data: {} });
    bus.emit({ type: "run.completed", runId: "r1", data: {} });

    expect(types).toEqual(["run.started", "run.completed"]);
  });

  it("stores history and supports filtering", () => {
    bus.emit({ type: "benchmark.started", runId: "r1", benchmarkId: "b1", data: {} });
    bus.emit({ type: "benchmark.completed", runId: "r1", benchmarkId: "b1", data: {} });
    bus.emit({ type: "benchmark.started", runId: "r1", benchmarkId: "b2", data: {} });

    expect(bus.getHistory()).toHaveLength(3);
    expect(bus.getHistory({ benchmarkId: "b1" })).toHaveLength(2);
    expect(bus.getHistory({ type: "benchmark.started" })).toHaveLength(2);
  });

  it("assigns id and timestamp automatically", () => {
    const e = bus.emit({ type: "error", runId: "r1", data: { msg: "x" } });
    expect(e.id).toBeTruthy();
    expect(e.timestamp).toBeGreaterThan(0);
  });

  it("unsubscribes via returned disposer", () => {
    let count = 0;
    const off = bus.on("retry", () => {
      count++;
    });
    bus.emit({ type: "retry", runId: "r1", data: {} });
    off();
    bus.emit({ type: "retry", runId: "r1", data: {} });
    expect(count).toBe(1);
  });
});
