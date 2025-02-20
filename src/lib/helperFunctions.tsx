import {
  LanguageDetector,
  LanguageDetectorCapabilities,
  LanguageTranslator,
} from "./types";

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
        m.addEventListener("downloadprogress", (e: ProgressEvent) => {
          console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
        });
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
