import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import type { InteractiveSessionState, InteractiveTranscriptEntry } from "@shared/contracts/backend";

export interface InteractiveStartResult {
  stdout: string;
  stderr: string;
  started: boolean;
  child: ChildProcessWithoutNullStreams;
}

export class InteractiveSessionManager {
  private child: ChildProcessWithoutNullStreams | null = null;
  private stdout = "";
  private stderr = "";
  private entries: InteractiveTranscriptEntry[] = [];
  private lastExitCode: number | null = null;
  private targetPath?: string;
  private startedAt?: string;

  getState(): InteractiveSessionState {
    return {
      active: Boolean(this.child),
      transcript: this.toInteractiveTranscript(`${this.stdout}\n${this.stderr}`),
      entries: this.entries,
      status: this.child ? "waiting" : this.lastExitCode === null ? (this.entries.length > 0 ? "completed" : "idle") : this.lastExitCode === 0 ? "completed" : "failed",
      targetPath: this.targetPath,
      startedAt: this.startedAt
    };
  }

  async start(command: string, args: string[], cwd: string, targetPath: string): Promise<InteractiveStartResult> {
    this.stop();
    this.stdout = "";
    this.stderr = "";
    this.entries = [];
    this.lastExitCode = null;
    this.targetPath = targetPath;
    this.startedAt = new Date().toISOString();

    const child = spawn(command, args, { cwd, windowsHide: true });
    this.child = child;

    child.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      this.stdout += text;
      this.appendProgramOutput(text);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      this.stderr += text;
      this.appendProgramOutput(text);
    });
    child.on("close", (code) => {
      this.lastExitCode = code;
      this.child = null;
    });

    await this.waitUntilInteractiveOrExit(child);
    return {
      stdout: this.stdout,
      stderr: this.stderr,
      started: Boolean(this.child && /\[EXECUTION]\s+interactive mode/i.test(this.stdout)),
      child
    };
  }

  sendInput(input: string): boolean {
    if (!this.child) return false;
    this.entries.push({
      id: `${Date.now()}-input-${this.entries.length}`,
      speaker: "input",
      text: input
    });
    this.child.stdin.write(`${input}\n`);
    return true;
  }

  stop(): void {
    if (this.child) {
      this.child.kill();
      this.child = null;
    }
  }

  reset(): void {
    this.stop();
    this.stdout = "";
    this.stderr = "";
    this.entries = [];
    this.lastExitCode = null;
    this.targetPath = undefined;
    this.startedAt = undefined;
  }

  private waitUntilInteractiveOrExit(child: ChildProcessWithoutNullStreams): Promise<void> {
    return new Promise((resolve) => {
      const poll = setInterval(() => {
        if (/\[EXECUTION]\s+interactive mode/i.test(this.stdout) || child.exitCode !== null) {
          clearInterval(poll);
          resolve();
        }
      }, 25);
    });
  }

  private toInteractiveTranscript(raw: string): string {
    return raw
      .split(/\r?\n/)
      .filter((line) => !this.isBuildLine(line))
      .join("\n")
      .trim();
  }

  private isBuildLine(line: string): boolean {
    const trimmed = line.trim();
    return (
      /^==== .+ ====$/.test(trimmed) ||
      /^\[(STATUS|SYMBOLS|TREE|JAVA|ACTION|BUILD|EXECUTION|SUMMARY|JAVAC)]/.test(trimmed)
    );
  }

  private appendProgramOutput(text: string): void {
    const visible = this.toInteractiveTranscript(text);
    if (!visible) return;
    this.entries.push({
      id: `${Date.now()}-program-${this.entries.length}`,
      speaker: "program",
      text: visible
    });
  }
}
