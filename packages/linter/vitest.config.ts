import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 60000,
    hookTimeout: 60000,
    // Los E2E lanzan muchas CLI sincronas. En Node 24 el pool de procesos
    // puede agotar el RPC interno de Vitest aunque todas las pruebas pasen.
    pool: "threads",
    maxWorkers: 1,
    fileParallelism: false,
  },
});
