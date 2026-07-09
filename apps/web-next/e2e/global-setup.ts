import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";

export const E2E_PORT = 3100;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

const READY_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 300;
const SERVER_ERROR_STATUS_THRESHOLD = 500;

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.status < SERVER_ERROR_STATUS_THRESHOLD) {
        return;
      }
    } catch {
      // Server not ready yet, keep polling.
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Timed out waiting for ${url} to become ready`);
}

export default async function globalSetup(): Promise<() => Promise<void>> {
  const mongod = await MongoMemoryServer.create();

  const nextBin = path.join(process.cwd(), "node_modules", ".bin", "next");
  const child: ChildProcess = spawn(nextBin, ["dev", "-p", String(E2E_PORT)], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      MONGODB_URI: mongod.getUri(),
      MONGODB_DB_NAME: "job-tracker-e2e",
      PORT: String(E2E_PORT),
    },
    stdio: "ignore",
    detached: true,
  });

  const teardown = async () => {
    if (child.pid) {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        // Process already exited.
      }
    }
    await mongod.stop();
  };

  try {
    await waitForServer(E2E_BASE_URL, READY_TIMEOUT_MS);
  } catch (error) {
    await teardown();
    throw error;
  }

  return teardown;
}
