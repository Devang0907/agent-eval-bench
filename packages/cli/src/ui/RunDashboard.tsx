import React, { useEffect, useState } from "react";
import { render, Box, Text } from "ink";
import type { EventBus, TelemetryEvent } from "@agent-eval-bench/core";

interface Props {
  bus: EventBus;
  agentName: string;
}

export function RunDashboard({ bus, agentName }: Props): React.ReactElement {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [status, setStatus] = useState("starting");
  const [current, setCurrent] = useState<string>("-");
  const [passed, setPassed] = useState(0);
  const [failed, setFailed] = useState(0);

  useEffect(() => {
    return bus.on("*", (e) => {
      setEvents((prev) => [...prev.slice(-30), e]);
      if (e.type === "benchmark.started") {
        setCurrent(e.benchmarkId ?? "-");
        setStatus("running");
      }
      if (e.type === "benchmark.completed") setPassed((n) => n + 1);
      if (e.type === "benchmark.failed") setFailed((n) => n + 1);
      if (e.type === "run.completed") setStatus("done");
    });
  }, [bus]);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        Agent Eval Bench — {agentName}
      </Text>
      <Text>
        Status: <Text color="yellow">{status}</Text> | Current: {current}
      </Text>
      <Text>
        Passed: <Text color="green">{passed}</Text> Failed:{" "}
        <Text color="red">{failed}</Text>
      </Text>
      <Box flexDirection="column" marginTop={1}>
        <Text dimColor>Recent events:</Text>
        {events.slice(-8).map((e) => (
          <Text key={e.id} dimColor>
            {e.type}
            {e.benchmarkId ? ` · ${e.benchmarkId}` : ""}
          </Text>
        ))}
      </Box>
    </Box>
  );
}

export function startDashboard(bus: EventBus, agentName: string): { unmount: () => void } {
  const instance = render(<RunDashboard bus={bus} agentName={agentName} />);
  return { unmount: () => instance.unmount() };
}
