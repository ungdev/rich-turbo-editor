import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["test/rte.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["html", "lcov", "text-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
    },
  },
});
