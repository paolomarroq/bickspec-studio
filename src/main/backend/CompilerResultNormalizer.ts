export interface NormalizedCompilerResult {
  rawCompilerOutput: string;
  buildLog: string;
  programOutput: string;
  interactiveOutput: string;
}

const programOutputTop = /^\+-+\sPROGRAM OUTPUT\s-+\+$/;
const boxBorder = /^\+-+\+$/;
const programError = /^\[PROGRAM-ERROR]\s?(.*)$/;

export class CompilerResultNormalizer {
  normalize(stdout: string, stderr: string, interactive: boolean): NormalizedCompilerResult {
    const rawCompilerOutput = `${stdout}\n${stderr}`.trim();
    const buildLines: string[] = [];
    const programLines: string[] = [];
    const interactiveLines: string[] = [];
    const lines = rawCompilerOutput ? rawCompilerOutput.split(/\r?\n/) : [];
    let insideProgramBox = false;

    for (const line of lines) {
      if (programOutputTop.test(line.trim())) {
        insideProgramBox = true;
        programLines.push(line);
        continue;
      }

      if (insideProgramBox) {
        programLines.push(line);
        if (boxBorder.test(line.trim())) insideProgramBox = false;
        continue;
      }

      const runtimeError = line.match(programError);
      if (runtimeError) {
        programLines.push(runtimeError[1]);
        continue;
      }

      if (interactive && !this.isBuildLine(line)) {
        interactiveLines.push(line);
        continue;
      }

      if (this.isBuildLine(line)) buildLines.push(line);
    }

    return {
      rawCompilerOutput,
      buildLog: buildLines.join("\n").trim(),
      programOutput: programLines.join("\n").trim(),
      interactiveOutput: interactiveLines.join("\n").trim()
    };
  }

  private isBuildLine(line: string): boolean {
    const trimmed = line.trim();
    return (
      /^==== .+ ====$/.test(trimmed) ||
      /^\[(STATUS|SYMBOLS|TREE|JAVA|ACTION|BUILD|EXECUTION|SUMMARY|JAVAC)]/.test(trimmed)
    );
  }
}
