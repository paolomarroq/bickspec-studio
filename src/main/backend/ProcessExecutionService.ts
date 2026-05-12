import { spawn } from "node:child_process";
import type { ToolAvailability } from "@shared/contracts/backend";

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
}

