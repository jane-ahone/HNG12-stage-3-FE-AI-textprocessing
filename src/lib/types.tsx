export enum statusOptions {
  idle = "idle",
  loading = "loading",
  success = "success",
  error = "error",
}

export interface LanguageDetectorCapabilities {
  available: "no" | "readily" | "afterDownload";
}
type LanguageDetectionResult = {
  confidence: number;
  detectedLanguage: string;
};

type TranslationResult = {
  status: statusOptions;
  error?: string;
  text?: string;
  language: {
    detected: string;
    target: string;
  };
};

export interface LanguageDetector {
  ready?: Promise<void>;
  destroy: () => void;
  detect: (text: string) => LanguageDetectionResult[];
}
export interface LanguageTranslator {
  ready?: Promise<void>;
  destroy: () => void;
  translate: (text: string) => string;
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
    translation: TranslationResult[];
  };
}

export interface LoadingStates {
  languageDetection: statusOptions;
  languageTranslation: statusOptions;
}
