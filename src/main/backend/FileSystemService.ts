import { access, copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";

export class FileSystemService {
  async exists(path: string): Promise<boolean> {
    try {
      await access(path, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async isDirectory(path: string): Promise<boolean> {
    try {
      return (await stat(path)).isDirectory();
    } catch {
      return false;
    }
  }

  async isFile(path: string): Promise<boolean> {
    try {
      return (await stat(path)).isFile();
    } catch {
      return false;
    }
  }

  async listFiles(path: string): Promise<string[]> {
    try {
      const entries = await readdir(path, { withFileTypes: true });
      return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
    } catch {
      return [];
    }
  }

  async listDirectory(path: string): Promise<Array<{ name: string; path: string; isDirectory: boolean; isFile: boolean }>> {
    try {
      const entries = await readdir(path, { withFileTypes: true });
      return entries.map((entry) => ({
        name: entry.name,
        path: join(path, entry.name),
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile()
      }));
    } catch {
      return [];
    }
  }

  async readJson<T>(path: string): Promise<T | null> {
    if (!(await this.exists(path))) return null;
    return JSON.parse(await readFile(path, "utf8")) as T;
  }

  async readText(path: string): Promise<string> {
    return readFile(path, "utf8");
  }

  async getFileMetadata(path: string): Promise<{ sizeBytes: number; lastModifiedAt: string } | null> {
    try {
      const metadata = await stat(path);
      return {
        sizeBytes: metadata.size,
        lastModifiedAt: metadata.mtime.toISOString()
      };
    } catch {
      return null;
    }
  }

  async writeJson(path: string, value: unknown): Promise<void> {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  }

  async writeText(path: string, value: string): Promise<void> {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, value, "utf8");
  }

  async copyFile(source: string, destination: string): Promise<void> {
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
}
