import {
  LanguageDetectorCapabilities,
  LanguageDetector,
  LanguageTranslator,
} from "./types";

// First, let's define the interfaces for the AI API
interface AILanguageDetector {
  capabilities(): Promise<LanguageDetectorCapabilities>;
  create(options?: {
    monitor?: (target: EventTarget) => void;
  }): Promise<LanguageDetector>;
}

interface AITranslator {
  capabilities(): Promise<TranslatorCapabilities>;
  create(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<LanguageTranslator>;
}

interface AIInterface {
  languageDetector: AILanguageDetector;
  translator: AITranslator;
}

// Extend the Window interface to include our AI property
declare global {
  interface Window {
    ai: AIInterface;
  }
}

// Your existing types (assumed from usage)
interface TranslatorCapabilities {
  languagePairAvailable(
    source: string,
    target: string
  ): "no" | "readily" | "after-download";
}

// Your existing functions with proper typing
export const languageTagToHumanReadable = (
  languageTag: string,
  targetLanguage: string
) => {
  const displayNames = new Intl.DisplayNames([targetLanguage], {
    type: "language",
  });
  return displayNames.of(languageTag);
};

export async function initializeLanguageDetector(): Promise<LanguageDetector | null> {
  const languageDetectorCapabilities: LanguageDetectorCapabilities =
    await self.ai.languageDetector.capabilities();
  const canDetect = languageDetectorCapabilities.available;
  let detector: LanguageDetector | null = null;

  if (canDetect === "no") {
    return null;
  }

  if (canDetect === "readily") {
    detector = await self.ai.languageDetector.create();
    return detector;
  } else {
    detector = await self.ai.languageDetector.create({
      monitor: (m: EventTarget) => {
        // Fixed: Use type assertion to handle the event properly
        m.addEventListener("downloadprogress", ((e: Event) => {
          const progressEvent = e as ProgressEvent<EventTarget>;
          console.log(
            `Downloaded ${progressEvent.loaded} of ${progressEvent.total} bytes.`
          );
        }) as EventListener);
      },
    });

    if (detector?.ready) {
      await detector.ready;
    }
  }
  return detector;
}

export async function initializeLanguageTranslator(
  sourceLanguage: string,
  targetLanguage: string
): Promise<LanguageTranslator | null> {
  const translatorCapabilities = await self.ai.translator.capabilities();
  const canTranslate = translatorCapabilities.languagePairAvailable(
    sourceLanguage,
    targetLanguage
  );
  let translator: LanguageTranslator | null;

  if (canTranslate === "no") {
    console.error("Translation not possible in this browser");
    return null;
  }

  if (canTranslate === "readily") {
    translator = await self.ai.translator.create({
      sourceLanguage,
      targetLanguage,
    });
  } else {
    console.log("Translator download in progress");
    translator = await self.ai.translator.create({
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
    });
    await translator?.ready;
  }
  return translator;
}
