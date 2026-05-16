import type * as Monaco from "monaco-editor";

export const BICKSPEC_LANGUAGE_ID = "bickspec";

const keywords = [
  "IMPORT",
  "PROJECT",
  "FX",
  "READ",
  "DISPLAY",
  "WRITE",
  "IF",
  "THEN",
  "ELSE",
  "WHILE",
  "DO",
  "REPEAT",
  "TIMES",
  "END",
  "FUNCTION"
];

const constants = ["TRUE", "FALSE"];
const builtins = ["NPV", "PAYBACK"];
const currencies = ["USD", "GTQ", "EUR"];
const timeUnits = ["year", "month", "quarter", "week", "day"];

export function registerBickSpecLanguage(monaco: typeof Monaco) {
  if (monaco.languages.getLanguages().some((language) => language.id === BICKSPEC_LANGUAGE_ID)) return;

  monaco.languages.register({
    id: BICKSPEC_LANGUAGE_ID,
    extensions: [".bks"],
    aliases: ["BickSpec", "bickspec"]
  });

  monaco.languages.setLanguageConfiguration(BICKSPEC_LANGUAGE_ID, {
    comments: {
      lineComment: "#",
      blockComment: ["/*", "*/"]
    },
    brackets: [
      ["{", "}"],
      ["(", ")"]
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "/*", close: "*/" }
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "(", close: ")" },
      { open: '"', close: '"' }
    ]
  });

  monaco.languages.setMonarchTokensProvider(BICKSPEC_LANGUAGE_ID, {
    keywords,
    constants,
    builtins,
    currencies,
    timeUnits,
    tokenizer: {
      root: [
        [/[a-zA-Z_][\w]*/, {
          cases: {
            "@keywords": "keyword",
            "@constants": "constant",
            "@builtins": "predefined",
            "@currencies": "currency",
            "@timeUnits": "type",
            "@default": "identifier"
          }
        }],
        [/[0-9]+\.[0-9]+/, "number.float"],
        [/[0-9]+/, "number"],
        [/".*?"/, "string"],
        [/#.*$/, "comment"],
        [/\/\*/, "comment", "@comment"],
        [/:=|==|!=|>=|<=|&&|\|\||[=+\-*/<>!]/, "operator"],
        [/[{}()]/, "@brackets"],
        [/,/, "delimiter"]
      ],
      comment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/./, "comment"]
      ]
    }
  });
}
