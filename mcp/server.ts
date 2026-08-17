#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createVibeMathServer } from "./create-server";
import { loadLocalStore } from "./tools";

const server = createVibeMathServer(await loadLocalStore());
await server.connect(new StdioServerTransport());
