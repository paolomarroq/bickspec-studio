# BickSpec VS Code extension facts

## 1. Plugin overview

The extension is named **BickSpec Finance DSL**. It provides Visual Studio Code support for `.bks` files written in BickSpec, a finance and economic engineering DSL.

The extension is a thin frontend over the main `bickspec-lang` Java/ANTLR project. It invokes the existing `bickspec-compiler-1.0.0.jar` and presents the compiler workflow inside VS Code; it does not reimplement the compiler.

## 2. Features

- Registers the `bickspec` language id and associates it with `.bks` files.
- Provides TextMate syntax highlighting through `syntaxes/bickspec.tmLanguage.json`.
- Contributes the optional **BickSpec Academic** color theme.
- Provides snippets for project blocks, `IF`, `WHILE`, functions, `FX`, `DISPLAY`, and `READ`.
- Supports line comments with `#` and block comments with `/* ... */`.
- Configures bracket matching for `{}`, `()`, and `[]`.
- Configures auto-closing pairs for `{}`, `()`, `[]`, `"..."`, and `/* ... */`.
- Configures surrounding pairs for `{}`, `()`, `[]`, and `"..."`.
- Creates a dedicated **BickSpec Compiler** output channel.
- Shows status bar actions when a `.bks` file is active:
  - `$(play) BickSpec`
  - `$(output) BickSpec Output`
- Parses compiler diagnostics into VS Code Problems markers when source locations are available.
- Opens generated Java, symbol table CSV, and parse tree SVG artifacts.
- Includes a Webview-based setup wizard.

## 3. Commands

Commands contributed in `package.json`:

- **BickSpec: Run Current File** - `bickspec.runCurrentFile`
- **BickSpec: Run Folder** - `bickspec.runFolder`
- **BickSpec: Show Compiler Output** - `bickspec.showCompilerOutput`
- **BickSpec: Open Generated Java** - `bickspec.openGeneratedJava`
- **BickSpec: Open Symbol Table CSV** - `bickspec.openSymbolTable`
- **BickSpec: Open Parse Tree SVG** - `bickspec.openParseTreeSvg`
- **BickSpec: Open Setup Wizard** - `bickspec.openSetupWizard`
- **BickSpec: Validate Environment** - `bickspec.validateEnvironment`
- **BickSpec: Select Compiler JAR** - `bickspec.selectCompilerJar`
- **BickSpec: Select bickspec-lang Repository** - `bickspec.selectCompilerRepo`
- **BickSpec: Run Setup Test** - `bickspec.runSetupTest`
- **BickSpec: Reset Setup** - `bickspec.resetSetup`

The extension also contributes:

- an editor title action for **BickSpec: Run Current File** on `.bks` files;
- Explorer context actions for **BickSpec: Run Current File** and **BickSpec: Run Folder**.

## 4. Compiler configuration

Main settings declared in `package.json`:

- `bickspec.compiler.jarPath`
- `bickspec.javaPath`
- `bickspec.compiler.repoPath`
- `bickspec.compiler.githubUrl`
- `bickspec.outputDirectory`
- `bickspec.setup.completed`
- `bickspec.setup.autoOpenOnFirstLaunch`

The compiler JAR setting is `bickspec.compiler.jarPath`. If it is empty, the extension auto-detects `app/target/bickspec-compiler-1.0.0.jar`.

Relative JAR paths are resolved from the workspace/repository root. The extension also checks nearby repository-root fallbacks and can discover the newest matching `bickspec-compiler-*.jar` in likely `app/target` directories.

Java is required to run the compiler. The extension uses `bickspec.javaPath` when configured; otherwise it uses `java` from `PATH`.

If the JAR is missing, the README instructs users to build it from the main repository root with:

```bash
mvn -f app/pom.xml package
```

## 5. Setup Wizard

The setup wizard opens with **BickSpec: Open Setup Wizard** and is implemented as a Webview backed by `setup/SetupWizardPanel.js`, `setup/setupServices.js`, and `media/wizard/`.

Implemented checks and actions include:

- Java validation using `java -version`
- compiler JAR selection and validation
- repository root selection
- GitHub clone flow using the configured repo URL
- optional repository update through explicit `git pull`
- Maven-based compiler build when a valid repository is selected
- workspace writability validation
- creation of a real setup test file under `.bickspec/setup/Setup_Test.bks`
- execution of the real compiler against that test file

The wizard validates Java, the compiler JAR, repository structure, Git, Maven, and workspace write access. Its setup test uses valid BickSpec syntax and checks compiler output for `PARSE OK` and `SEMANTIC OK`.

Repository selection is root-aware:

- a valid repository root contains `app/pom.xml`, `app/src`, and `docs/BickSpec.g4`;
- selecting a subfolder inside the repo produces a warning instead of accepting it;
- the clone flow asks for a parent folder and clones to `<parent>/bickspec-lang`;
- if a valid repo already exists, the wizard can use it or update it explicitly.

Finish behavior:

- `Finish` requires a successful setup test;
- successful finish persists setup completion and closes the Webview panel;
- `Reset Setup` clears saved setup state;
- `Skip for Now` closes the wizard without marking setup complete.

On first activation, if setup is not complete and `bickspec.setup.autoOpenOnFirstLaunch` is enabled, the extension shows a non-intrusive prompt asking whether to open the setup wizard.

## 6. Diagnostics

The extension-side parser accepts diagnostic families matching:

- `LEX`
- `SYN`
- `SEM`
- `GEN`
- `BUILD`
- `EXEC`
- `FS`
- `LINK`

It parses lines in the form:

```text
[ERROR] SEM01 - Variable 'X' used before declaration at line 2:11
```

When a line contains a file location, the extension creates a VS Code diagnostic with:

- severity `Error`
- source `BickSpec`
- code such as `SEM01`
- a range derived from the compiler line/column

During folder runs, the extension tracks compiler file headers like `==== path/to/file.bks ====` so diagnostics can be attached to the correct file when possible.

The extension parser accepts the listed families; whether the compiler itself emits each family depends on the compiler implementation.

## 7. Interactive programs

If the current `.bks` file contains `READ`, the extension runs it in the integrated terminal instead of forcing stdin through the output channel.

For folder runs, if any direct `.bks` file in the folder contains `READ`, the folder run is also sent to the integrated terminal.

The output channel still records launch details such as the JAR path, target path, working directory, and interactive reason. The terminal preserves prompts and user input.

## 8. Generated artifacts

Artifact-opening commands use the compiler's standard output folders:

- `output/java`
- `output/symbols`
- `output/trees`

Commands:

- **BickSpec: Open Generated Java**
- **BickSpec: Open Symbol Table CSV**
- **BickSpec: Open Parse Tree SVG**

The extension derives artifact filenames from the source file stem:

- `<Base>_Generated.java`
- `<Base>_symbols.csv`
- `<Base>_ParseTree.svg`

## 9. Installation and testing

The extension uses plain JavaScript; no build step is required.

Development/test workflow documented in the README:

1. Open `vscode-extension/` in VS Code.
2. Run:

   ```bash
   npm run check
   ```

3. Build the compiler JAR from the main repository if it is missing.
4. Press `F5` to launch the Extension Development Host.
5. Open a `.bks` file.
6. Run **BickSpec: Run Current File**.
7. Inspect the **BickSpec Compiler** output channel and diagnostics.
8. Test a file containing `READ` to verify integrated-terminal behavior.

The README also recommends confirming the language mode is **BickSpec** and optionally selecting the **BickSpec Academic** theme.

## 10. Scope

The extension is intentionally lightweight. It is not a full language server.

Its current scope is:

- editing support for `.bks` files;
- syntax highlighting and snippets;
- compiler execution through the existing Java compiler;
- diagnostics parsed from compiler output;
- generated artifact access;
- setup assistance through the wizard.

It does not provide full language-server features such as deep IntelliSense, refactoring, or live semantic analysis.
