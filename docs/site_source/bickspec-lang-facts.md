# BickSpec language and compiler facts

## 1. Language overview

BickSpec is a finance-oriented domain-specific language (DSL) for economic engineering models. The repository describes it as a readable language for financial calculations, cash-flow logic, currency-aware values, simple time units, and decision rules. Its intended users are finance/economic-engineering users who need reviewable scripts, students and reviewers studying compiler construction, and developers interested in an ANTLR-to-Java compiler example. BickSpec source files use the `.bks` extension.

## 2. Syntax reference

### Program structure

A program has zero or more `IMPORT`, `FX`, and `FUNCTION` declarations, followed by exactly one `PROJECT` block:

```bickspec
IMPORT finance
FX GTQ := 7.80
FUNCTION margen(ingresos, costos) = (ingresos - costos) / ingresos
PROJECT "Example" {
  DISPLAY "Hello"
}
```

Grammar shape:

```text
program : (importStmt | fxStmt | functionDecl)* projectBlock EOF ;
```

### Declarations and statements

- `IMPORT ID`
- `FX currency := numberLiteral`
- `PROJECT "name" { ... }`
- Single assignment: `ID := expr`
- Batch assignment: `id1, id2 := expr1, expr2` with optional shared currency or time unit suffix
- Output: `DISPLAY expr` or `WRITE expr`, optionally `in USD|GTQ|EUR`
- Input: `READ ID`
- Conditional: `IF condition THEN ... ELSE ... END`
- Loop: `WHILE condition DO ... END`
- Counted repetition: `REPEAT INT TIMES ... END`
- Function declaration: `FUNCTION name(params...) = expr`
- Expression statement: any expression used as a statement

### Expressions

Expressions support arithmetic, comparison/equality, logical operators, parentheses, number literals, string literals, identifiers, function calls, money literals, time literals, and conversion/display suffixes with lowercase `to` and `in`.

Examples:

```bickspec
CAPEX := CAPEX_GTQ to USD
DISPLAY NPV_VAL in GTQ
MESES := MESES + 1 month
```

### Comments

- Line comments: `# comment`
- Block comments: `/* comment */`

## 3. Lexer/token reference

- `ID`: `[a-zA-Z_][a-zA-Z0-9_]*`
- `INT`: one or more digits
- `FLOAT`: digits, dot, digits
- `NUMBER`: `FLOAT | INT`
- `STRING_LITERAL`: double-quoted text with escapes
- Assignment/function operators: `:=`, `=`
- Arithmetic: `+`, `-`, `*`, `/`
- Comparison/equality: `>=`, `<=`, `==`, `!=`, `>`, `<`
- Logical: `&&`, `||`, `!`
- Punctuation: `{`, `}`, `(`, `)`, `,`
- Keywords: `IMPORT`, `PROJECT`, `FX`, `READ`, `DISPLAY`, `WRITE`, `IF`, `THEN`, `ELSE`, `WHILE`, `DO`, `REPEAT`, `TIMES`, `END`, `FUNCTION`, lowercase `to`, lowercase `in`
- Currencies: `USD`, `GTQ`, `EUR`
- Time units: `year`, `month`, `quarter`, `week`, `day`
- Skipped tokens: `#` line comments, `/* ... */` block comments, whitespace

## 4. Semantic model

The generated Java runtime documents these money rules:

- money is stored internally in USD;
- GTQ and EUR are converted to USD using `FX` declarations;
- `DISPLAY expr in GTQ` and `DISPLAY expr in EUR` affect presentation only, not stored values.

User-defined functions are declared with `FUNCTION` and compiled into Java helper methods. The compiler also recognizes two built-in function names: `NPV` and `PAYBACK`. Generated Java includes concrete helper implementations for both built-ins.

The semantic visitor builds a symbol table containing `SymbolInfo` records with name, type, scope, declaration line, initialization flag, and notes. Current semantic checks implemented in code include:

- variable used before declaration or initialization (`SEM01`);
- duplicate import/module, exchange-rate, function, parameter, or duplicate target in the same batch assignment (`SEM02`);
- assigning text to a numeric variable, text in numeric conditions, text function returns, or text function arguments (`SEM03`);
- function call to an undeclared non-built-in function (`SEM04`).

`IMPORT` is syntactically supported and recorded as a module symbol. In the current Java translator it is not a full linker: the translator tries to resolve a nearby `.bks` module path and emits comments about the import; linked functions are not automatically copied into the generated class.

## 5. Compiler pipeline

```text
.bks file
-> BickSpecLexer
-> BickSpecParser
-> Parse Tree
-> semantic validation + SymbolTable
-> Java generation
-> javac build
-> execution
```

The jar entry point is `com.bickspec.app.TranspileRunner`.

## 6. Main Java components

- `TranspileRunner`: final jar entry point; resolves input files, runs parse/semantic stages, exports artifacts, generates Java, invokes `javac`, executes generated classes, and writes the directory summary report.
- `ParseRunner`: parser-focused command-line runner; validates files, prints semantic trace output, exports symbols, and generates parse-tree artifacts without Java build/execution.
- `BickSpecParseSupport`: shared input resolution and parse infrastructure; creates lexer/parser instances, collects lexical and syntax diagnostics, and returns `ParseResult` objects.
- `BickSpecSemanticVisitor`: walks the parse tree, creates symbols, records semantic trace lines, recognizes `NPV`/`PAYBACK`, and emits semantic diagnostics.
- `BickSpecJavaTranslatorVisitor`: translates validated BickSpec trees into Java source and emits runtime helpers for money conversion, input, `NPV`, and `PAYBACK`.
- `SymbolTable` / `SymbolInfo`: in-memory symbol storage and symbol records.
- `SymbolTableCsvExporter`: writes CSV symbol tables to `output/symbols`.
- `CompilerDiagnostic`: formats diagnostics such as `[ERROR] SEM01 - ... at line x:y`.
- `SemanticResult`: immutable carrier for semantic success, symbol table, trace, and diagnostics.
- `ParseTreeGraphGenerator`: writes Graphviz DOT parse trees and optionally renders SVG through external `dot`.

## 7. Generated artifacts

```text
output/
  java/       generated Java source
  classes/    compiled .class files
  symbols/    symbol table CSV files
  trees/      parse-tree .dot files and optional .svg files
  reports/    directory-mode summary report
```

Observed filenames include:

- `output/java/<Program>_Generated.java`
- `output/classes/<Program>_Generated.class`
- `output/symbols/<Program>_symbols.csv`
- `output/trees/<Program>_ParseTree.dot`
- `output/trees/<Program>_ParseTree.svg`
- `output/reports/generation_summary.csv`

## 8. Diagnostics

Actual diagnostic code families used by the compiler are `LEX`, `SYN`, `SEM`, and `GEN`.

Exact repository examples:

```text
[ERROR] LEX01 - Token recognition error at: '@' at line 2:10
[ERROR] SYN01 - Mismatched input 'DISPLAY' expecting {'to', 'in', '+', '-', '*', '/', '>=', '<=', '==', '!=', '>', '<', '&&', '||'} at line 3:4
[ERROR] SEM01 - Variable 'X' used before declaration at line 2:11
```

Additional implemented diagnostics include:

```text
[ERROR] GEN01 - Failed to read input file: ...
[ERROR] GEN02 - Failed to write symbol table CSV: ...
[ERROR] GEN03 - Failed to write generated Java file: ...
[ERROR] GEN04 - Failed to write generation summary report: ...
[WARNING] GEN05 - Failed to remove stale generated Java file: ...
[ERROR] GEN06 - Generated Java compilation failed
```

`[BUILD] ...` and `[EXECUTION] ...` are status output lines emitted by `TranspileRunner`, not diagnostic code families. The inspected compiler sources do not define separate `BUILD`, `EXEC`, `FS`, or `LINK` diagnostic families.

## 9. CLI usage

Requirements:

- Java JDK 17 or newer
- Maven 3.x to build from source
- `javac` available in `PATH` for the final transpile/build/execute flow
- Graphviz `dot` is optional; when unavailable, DOT files are still created and SVG generation is skipped with a warning message

Build:

```bash
mvn -f app/pom.xml package
```

Run one file:

```bash
java -jar app/target/bickspec-compiler-1.0.0.jar testing/P1_HolaMundo.bks
```

Run a folder:

```bash
java -jar app/target/bickspec-compiler-1.0.0.jar testing
```

Parser-only runner:

```bash
java -cp app/target/bickspec-compiler-1.0.0.jar com.bickspec.app.ParseRunner testing/P1_HolaMundo.bks
```

## 10. Examples

### Hello World

```bickspec
PROJECT "P1 - Hola Mundo" {
  DISPLAY "Hola Mundo"
}
```

### Arithmetic

```bickspec
PROJECT "P2 - Operacion aritmetica" {
  A := 10
  B := 3
  RESULTADO := (A + B) * 2 / 5
  DISPLAY "Resultado:"
  DISPLAY RESULTADO
}
```

### Input + IF

```bickspec
IMPORT finance
FX GTQ := 7.80
PROJECT "P3 - Input + IF" {
  DISPLAY "Ingrese tasa (0.xx):"
  READ R
  DISPLAY "Ingrese CAPEX en GTQ:"
  READ CAPEX_GTQ
  CAPEX := CAPEX_GTQ to USD
  IF R < 0.20 THEN
    DISPLAY "Tasa aceptable"
  ELSE
    DISPLAY "Tasa alta"
  END
  DISPLAY "CAPEX en USD:"
  DISPLAY CAPEX
}
```

### Function

```bickspec
FUNCTION margen(ingresos, costos) = (ingresos - costos) / ingresos
PROJECT "P4 - Funcion" {
  INGRESOS := 15000 USD
  COSTOS := 9000 USD
  M := margen(INGRESOS, COSTOS)
  DISPLAY "Margen:"
  DISPLAY M
}
```

### WHILE

```bickspec
PROJECT "P5 - While (Runway)" {
  DISPLAY "CASH inicial USD:"
  READ CASH
  DISPLAY "BURN mensual USD:"
  READ BURN
  MESES := 0 month
  WHILE CASH > 0 USD DO
    CASH := CASH - BURN
    MESES := MESES + 1 month
  END
  DISPLAY "Runway (meses):"
  DISPLAY MESES to month
}
```

### NPV

```bickspec
IMPORT finance
IMPORT math
FX GTQ := 7.80
PROJECT "P6 - Imports + NPV" {
  R := 0.12
  CAPEX := 500000 GTQ
  CF1 := 80000 GTQ
  CF2 := 90000 GTQ
  CF3 := 100000 GTQ
  NPV_VAL := NPV(R, CAPEX, CF1, CF2, CF3)
  DISPLAY "NPV USD:"
  DISPLAY NPV_VAL
  DISPLAY "NPV GTQ:"
  DISPLAY NPV_VAL in GTQ
}
```

### PAYBACK

`PAYBACK` is implemented as a built-in helper in generated Java and accepted by semantic validation. The repository does not currently include a checked-in `.bks` test fixture using it; this example follows the implemented grammar and built-in signature:

```bickspec
PROJECT "Payback" {
  CAPEX := 1000 USD
  CF1 := 300 USD
  CF2 := 400 USD
  CF3 := 500 USD
  PB := PAYBACK(CAPEX, CF1, CF2, CF3)
  DISPLAY PB
}
```

### REPEAT

`REPEAT ... TIMES ... END` is present in the grammar and translated to a Java `for` loop. The repository does not currently include a checked-in `.bks` fixture for it.
