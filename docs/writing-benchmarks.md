# Writing benchmarks

Benchmarks are YAML (or JSON) files validated by `BenchmarkDefinitionSchema`.

```yaml
id: filesystem/create-hello
name: Create Hello File
description: Basic file creation
difficulty: easy
category: filesystem
prompt: |
  Create a file called hello.txt with content hello
repository:
  files: {}
expected:
  files:
    - path: hello.txt
      exists: true
      contains: hello
validators:
  - name: file-exists
    params:
      path: hello.txt
timeout: 120000
```

## Fields

| Field | Required | Notes |
|-------|----------|-------|
| id | yes | `category/slug` |
| name, description | yes | |
| category | yes | one of 14 official categories |
| prompt | yes | string or multi-turn array |
| difficulty | no | easy\|medium\|hard\|expert |
| repository.files | no | inline fixture map |
| repository.fixture | no | `empty`, `node-basic`, `node-with-tests`, `git-conflict` |
| expected | no | files/commands/git/agentBehavior |
| validators | no | named validators + params |
| requiresCapabilities | no | skip if adapter lacks capability |
| scoring | no | per-dimension weight overrides |

## Tips

- Prefer declarative `expected.files` — the runner auto-adds `file-exists` / `file-contains`.
- Keep prompts unambiguous unless testing `ambiguity`.
- Use MockAdapter scripts in tests to assert validator wiring without a real LLM.
