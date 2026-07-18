FROM node:22-bookworm-slim

RUN apt-get update -qq \
  && apt-get install -y -qq git curl ca-certificates python3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

CMD ["sleep", "infinity"]
