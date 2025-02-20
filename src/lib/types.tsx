export enum statusOptions {
  "idle",
  "loading",
  "success",
  "error",
}

export interface LanguageDetectorCapabilities {
  available: "no" | "readily" | "afterDownload";
}

export interface LanguageDetector {
  ready?: Promise<void>;
  destroy: () => void;
  detect: (text: string) => void;
}
export interface LanguageTranslator {
  ready?: Promise<void>;
  destroy: () => void;
  translate: (text: string) => void;
}
export interface ChatMessage {
  id: string;
  text: string;
  status: {
    languageDetection: {
      status: statusOptions;
      error?: string;
      detectedLanguage?: string;
    };
    translation: {
      status: statusOptions;
      error?: string;
      translations?: string;
    };
  };
}
