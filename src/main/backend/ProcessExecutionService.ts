import { spawn } from "node:child_process";
import type { CompilerExecutionResult, ToolAvailability } from "@shared/contracts/backend";

export class ProcessExecutionService {
  async checkTool(command: string, args: string[]): Promise<ToolAvailability> {
    return new Promise((resolve) => {
      const child = spawn(command, args, { windowsHide: true });
      let output = "";
      let errorOutput = "";

      child.stdout.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });

      child.stderr.on("data", (chunk: Buffer) => {
        errorOutput += chunk.toString();
      });

      child.on("error", (error) => {
        resolve({ command, available: false, error: error.message });
      });

      child.on("close", (code) => {
        const combinedOutput = `${output}\n${errorOutput}`.trim();
        resolve({
          command,
          available: code === 0,
          version: combinedOutput.split(/\r?\n/).find(Boolean),
          error: code === 0 ? undefined : combinedOutput || `Exited with code ${code}`
        });
      });
    });
  }

  async run(
    command: string,
    args: string[],
    options: {
      cwd: string;
      timeoutMs?: number;
      toResult: (output: {
        stdout: string;
        stderr: string;
        exitCode: number | null;
        durationMs: number;
        interactive: boolean;
        error?: string;
      }) => CompilerExecutionResult;
    }
  ): Promise<CompilerExecutionResult> {
    const startedAt = Date.now();

    return new Promise((resolve) => {
      const child = spawn(command, args, {
        cwd: options.cwd,
        windowsHide: true
      });
      let stdout = "";
      let stderr = "";
      let settled = false;
      let interactive = false;

      const finish = (exitCode: number | null, error?: string) => {
        if (settled) return;
        settled = true;
        resolve(
          options.toResult({
            stdout,
            stderr,
            exitCode,
            durationMs: Date.now() - startedAt,
            interactive,
            error
          })
        );
      };

      const timeout = options.timeoutMs
        ? setTimeout(() => {
            interactive = true;
            child.kill();
            finish(null, `Compiler process exceeded ${options.timeoutMs}ms and was stopped. It may require an interactive terminal.`);
          }, options.timeoutMs)
        : null;

      child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on("error", (error) => {
        if (timeout) clearTimeout(timeout);
        finish(null, error.message);
      });

      child.on("close", (code) => {
        if (timeout) clearTimeout(timeout);
        finish(code);
      });
    });
  }
}
