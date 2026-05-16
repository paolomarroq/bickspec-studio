import type {
  ArtifactCollection,
  CompilerDiagnostic,
  CompilerExecutionResult,
  CompilerSessionResult,
  CompilerStage,
  CompilerStageStatus,
  ExecutionOutputBlock
} from "@shared/contracts/backend";
import type { NormalizedCompilerResult } from "./CompilerResultNormalizer";

export class CompilerSessionMapper {
  toSession(
    execution: CompilerExecutionResult,
    diagnostics: CompilerDiagnostic[],
    artifacts: ArtifactCollection,
    normalized: NormalizedCompilerResult,
    status: { startedAt?: string; completedAt?: string }
  ): CompilerSessionResult {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      summary: {
        success: execution.success,
        interactive: execution.interactive,
        outputFullyCaptured: !execution.interactive,
        targetPath: execution.targetPath,
        targetKind: execution.targetKind,
        repositoryPath: execution.repositoryPath,
        compilerArtifactPath: execution.compilerArtifactPath,
        exitCode: execution.exitCode,
        durationMs: execution.durationMs,
        startedAt: status.startedAt,
        completedAt: status.completedAt
      },
      stages: this.toStages(execution, diagnostics),
      diagnostics,
      artifacts,
      output: this.toOutputBlocks(execution),
      normalized,
      execution
    };
  }

  private toStages(execution: CompilerExecutionResult, diagnostics: CompilerDiagnostic[]): CompilerStageStatus[] {
    const stages: CompilerStage[] = ["parse", "semantic", "java", "build", "execution"];
    return stages.map((stage) => {
      const failed = diagnostics.some((diagnostic) => diagnostic.stage === stage && diagnostic.blocking);
      const completed = this.stageHasOutput(stage, execution);
      return {
        stage,
        state: failed ? "failed" : completed || execution.success ? "completed" : "skipped",
        message: failed ? "Blocking diagnostics found." : undefined
      };
    });
  }

  private stageHasOutput(stage: CompilerStage, execution: CompilerExecutionResult): boolean {
    const tagsByStage: Record<CompilerStage, string[]> = {
      parse: ["SYMBOLS", "TREE"],
      semantic: ["SYMBOLS"],
      java: ["JAVA"],
      build: ["BUILD"],
      execution: ["EXECUTION", "SUCCESS"]
    };
    return execution.parsedOutput.lines.some((line) => tagsByStage[stage].includes(line.tag));
  }

  private toOutputBlocks(execution: CompilerExecutionResult): ExecutionOutputBlock[] {
    return [
      this.outputBlock("stdout", execution.stdout),
      this.outputBlock("stderr", execution.stderr),
      this.outputBlock("combined", `${execution.stdout}\n${execution.stderr}`.trim())
    ].filter((block) => block.text.length > 0);
  }

  private outputBlock(stream: ExecutionOutputBlock["stream"], text: string): ExecutionOutputBlock {
    return {
      stream,
      text,
      lineCount: text ? text.split(/\r?\n/).length : 0
    };
  }
}
