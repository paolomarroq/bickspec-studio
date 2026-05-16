import { BrowserWindow, dialog } from "electron";
import { basename, extname, join } from "node:path";
import { writeFile } from "node:fs/promises";
import * as XLSX from "xlsx";
import type { BickSpecReportData, ReportExportFormat } from "@shared/contracts/reports";
import { cleanInteractiveEntries, extractPlainProgramOutput } from "@shared/reports/runtimeOutput";

export class ReportExportService {
  async export(report: BickSpecReportData, format: ReportExportFormat): Promise<string | null> {
    const defaultPath = `${this.baseName(report.sourceName)}_BickSpec_Report.${format === "excel" ? "xlsx" : format}`;
    const result = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0], {
      title: `Export ${format.toUpperCase()} Report`,
      defaultPath
    });
    if (result.canceled || !result.filePath) return null;
    if (format === "csv") await writeFile(result.filePath, this.toCsv(report), "utf8");
    if (format === "excel") XLSX.writeFile(this.toWorkbook(report), result.filePath);
    if (format === "pdf") await writeFile(result.filePath, await this.toPdf(report));
    return result.filePath;
  }

  async exportAllToDirectory(report: BickSpecReportData, directoryPath: string): Promise<string[]> {
    const base = `${this.baseName(report.sourceName)}_BickSpec_Report`;
    const csvPath = join(directoryPath, `${base}.csv`);
    const excelPath = join(directoryPath, `${base}.xlsx`);
    const pdfPath = join(directoryPath, `${base}.pdf`);
    await writeFile(csvPath, this.toCsv(report), "utf8");
    XLSX.writeFile(this.toWorkbook(report), excelPath);
    await writeFile(pdfPath, await this.toPdf(report));
    return [pdfPath, excelPath, csvPath];
  }

  private baseName(fileName: string): string {
    return basename(fileName, extname(fileName));
  }

  private toCsv(report: BickSpecReportData): string {
    const rows: string[][] = [
      ["Section", "Key", "Role", "Value"],
      ["Summary", "Title", "", report.title],
      ["Summary", "Source", "", report.sourcePath],
      ["Summary", "Generated At", "", report.generatedAt],
      ["Summary", "Status", "", this.statusLabel(report.status)],
      ["Summary", "Interactive", "", String(report.interactive)],
      ["Summary", "Diagnostics", "", String(report.diagnostics.length)],
      ["Summary", "Artifacts", "", String(report.artifacts.length)],
      ...(report.interactive
        ? cleanInteractiveEntries(report.interactiveEntries).map((entry, index) => ["Interactive Transcript", String(index + 1), entry.speaker === "program" ? "Program" : "Input", entry.text])
        : extractPlainProgramOutput(report.programOutput).map((line, index) => ["Program Output", `Line ${index + 1}`, "", line])),
      ...report.diagnostics.map((diagnostic) => ["Diagnostics", diagnostic.code, diagnostic.category, diagnostic.message]),
      ...report.artifacts.map((artifact) => ["Artifacts", artifact.type, "", `${artifact.absolutePath} (${artifact.exists ? "exists" : "missing"})`]),
      ...report.buildLog.split(/\r?\n/).filter(Boolean).map((line, index) => ["Build Log", String(index + 1), "", line])
    ];
    return rows.map((row) => row.map(this.escapeCsv).join(",")).join("\n");
  }

  private toWorkbook(report: BickSpecReportData): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Key", "Value"],
      ["Title", report.title],
      ["Source File", report.sourceName],
      ["Source Path", report.sourcePath],
      ["Generated At", report.generatedAt],
      ["Status", this.statusLabel(report.status)],
      ["Interactive", report.interactive ? "Yes" : "No"],
      ["Diagnostics Count", report.diagnostics.length],
      ["Artifacts Count", report.artifacts.length]
    ]), "Summary");
    if (report.interactive) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
        ["Step", "Role", "Content"],
        ...cleanInteractiveEntries(report.interactiveEntries).map((entry, index) => [index + 1, entry.speaker === "program" ? "Program" : "Input", entry.text])
      ]), "Interactive Transcript");
    } else {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
        ["Line", "Output"],
        ...extractPlainProgramOutput(report.programOutput).map((line, index) => [index + 1, line])
      ]), "Program Output");
    }
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report.diagnostics.map((diagnostic) => ({
      code: diagnostic.code,
      type: diagnostic.category,
      message: diagnostic.message,
      line: diagnostic.line ?? "",
      column: diagnostic.column ?? "",
      suggestion: diagnostic.suggestion ?? ""
    }))), "Diagnostics");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report.artifacts.map((artifact) => ({
      type: artifact.type,
      path: artifact.absolutePath,
      status: artifact.exists ? "exists" : "missing"
    }))), "Artifacts");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Line", "Build Log"],
      ...report.buildLog.split(/\r?\n/).map((line, index) => [index + 1, line])
    ]), "Build Log");
    return workbook;
  }

  private async toPdf(report: BickSpecReportData): Promise<Buffer> {
    const window = new BrowserWindow({ show: false, webPreferences: { sandbox: false } });
    const html = this.toHtml(report);
    await window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    const pdf = await window.webContents.printToPDF({
      printBackground: true,
      pageSize: "A4",
      margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 }
    });
    window.destroy();
    return pdf;
  }

  private toHtml(report: BickSpecReportData): string {
    const diagnostics = report.diagnostics.length
      ? report.diagnostics.map((diagnostic) => `<li><strong>${this.escapeHtml(diagnostic.code)}</strong> ${this.escapeHtml(diagnostic.category)} — ${this.escapeHtml(diagnostic.message)}</li>`).join("")
      : "<li>No errors detected.</li>";
    const artifacts = report.artifacts.length
      ? report.artifacts.map((artifact) => `<li>${this.escapeHtml(artifact.type)} — ${this.escapeHtml(artifact.absolutePath)} (${artifact.exists ? "exists" : "missing"})</li>`).join("")
      : "<li>No artifacts discovered.</li>";
    return `<!doctype html><html><head><meta charset="utf-8"><style>
      body{font-family:Arial,sans-serif;color:#151c21;padding:24px} h1{color:#0b1d33} h2{margin-top:24px}
      pre{white-space:pre-wrap;background:#f3f6f8;padding:12px;border:1px solid #d5dde2}
      .meta{color:#44474d}
    </style></head><body>
      <h1>${this.escapeHtml(report.title)}</h1>
      <p class="meta">Source: ${this.escapeHtml(report.sourcePath)}<br>Generated: ${this.escapeHtml(report.generatedAt)}<br>Status: ${this.statusLabel(report.status)}</p>
      <h2>Summary</h2><p>Diagnostics: ${report.diagnostics.length} · Artifacts: ${report.artifacts.length} · Interactive: ${report.interactive ? "Yes" : "No"}</p>
      <h2>${report.interactive ? "Interactive Transcript" : "Program Output"}</h2><pre>${this.escapeHtml(report.interactive ? this.plainInteractiveText(report) : extractPlainProgramOutput(report.programOutput).join("\n") || "No program output.")}</pre>
      <h2>Diagnostics</h2><ul>${diagnostics}</ul>
      <h2>Artifacts</h2><ul>${artifacts}</ul>
      <h2>Build Log</h2><pre>${this.escapeHtml(report.buildLog || "No build log.")}</pre>
    </body></html>`;
  }

  private escapeCsv(value: string): string {
    return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] ?? character));
  }

  private plainInteractiveText(report: BickSpecReportData): string {
    return cleanInteractiveEntries(report.interactiveEntries)
      .map((entry) => `${entry.speaker === "program" ? "Program" : "Input"}: ${entry.text}`)
      .join("\n");
  }

  private statusLabel(status: BickSpecReportData["status"]): string {
    switch (status) {
      case "success": return "Successful build";
      case "interactive": return "Interactive session";
      case "interactive-completed": return "Interactive completed";
      case "runtime-failed": return "Runtime failed";
      case "failed": return "Failed build";
    }
  }
}
