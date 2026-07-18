# Timeline

- `+0ms` **run.started** — run.started
- `+3ms` **benchmark.started** — benchmark.started
- `+521ms` **sandbox.created** — sandbox.created
- `+523ms` **prompt.sent** — Prompt: Create a file called hello.txt with content hello

- `+525ms` **response.received** — Response (1ms)
- `+525ms` **token.usage** — token.usage
- `+527ms` **validator.result** — validator.result
- `+529ms` **validator.result** — validator.result
- `+530ms` **validator.result** — validator.result
- `+532ms` **score.computed** — score.computed
- `+533ms` **benchmark.failed** — ✗ filesystem/create-hello: 
- `+541ms` **sandbox.destroyed** — sandbox.destroyed
- `+542ms` **benchmark.started** — benchmark.started
- `+1.1s` **sandbox.created** — sandbox.created
- `+1.1s` **prompt.sent** — Prompt: Create .env.example with KEY=value

- `+1.1s` **file.edit** — file.edit
- `+1.1s` **response.received** — Response (4ms)
- `+1.1s` **token.usage** — token.usage
- `+1.1s` **tool.call** — Tool: write_file
- `+1.1s` **validator.result** — validator.result
- `+1.1s` **validator.result** — validator.result
- `+1.1s` **validator.result** — validator.result
- `+1.1s` **score.computed** — score.computed
- `+1.1s` **benchmark.failed** — ✗ filesystem/hidden-file: 
- `+1.1s` **sandbox.destroyed** — sandbox.destroyed
- `+1.1s` **benchmark.started** — benchmark.started
- `+1.6s` **sandbox.created** — sandbox.created
- `+1.7s` **prompt.sent** — Prompt: Create a/b/c/d.txt with "deep".

- `+1.7s` **file.edit** — file.edit
- `+1.7s` **response.received** — Response (2ms)
- `+1.7s` **token.usage** — token.usage
- `+1.7s` **tool.call** — Tool: write_file
- `+1.7s` **validator.result** — validator.result
- `+1.7s` **validator.result** — validator.result
- `+1.7s` **score.computed** — score.computed
- `+1.7s` **benchmark.completed** — ✓ filesystem/nested-path
- `+1.7s` **sandbox.destroyed** — sandbox.destroyed
- `+1.7s` **benchmark.started** — benchmark.started
- `+2.2s` **sandbox.created** — sandbox.created
- `+2.2s` **prompt.sent** — Prompt: Set v = 1 only in correct.js. Leave decoy.js unchanged.

- `+2.2s` **response.received** — Response (0ms)
- `+2.2s` **token.usage** — token.usage
- `+2.2s` **validator.result** — validator.result
- `+2.2s` **validator.result** — validator.result
- `+2.2s` **validator.result** — validator.result
- `+2.2s` **validator.result** — validator.result
- `+2.2s` **validator.result** — validator.result
- `+2.2s` **score.computed** — score.computed
- `+2.2s` **benchmark.failed** — ✗ filesystem/wrong-file-avoid: 
- `+2.2s` **sandbox.destroyed** — sandbox.destroyed
- `+2.2s` **run.completed** — run.completed
