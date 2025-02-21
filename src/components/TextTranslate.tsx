import { useState, useRef, ChangeEvent, useEffect } from "react";
import { ChatMessage, LanguageTranslator, statusOptions } from "../lib/types";
import {
  initializeLanguageTranslator,
  languageTagToHumanReadable,
} from "../lib/helperFunctions";
import TextBubble from "./TextBubble";
import "./TextTranslate.css";

// List of available language translations

const translationLanguages = [
  { humanReadable: "Pick a language", languageCode: "" },
  { humanReadable: "English", languageCode: "en" },
  { humanReadable: "Portuguese", languageCode: "pt" },
  { humanReadable: "Spanish", languageCode: "es" },
  { humanReadable: "Russian", languageCode: "ru" },
  { humanReadable: "Turkish", languageCode: "tr" },
  { humanReadable: "French", languageCode: "fr" },
];

interface Props {
  msgId: string;
  messages: ChatMessage[];
  message: ChatMessage;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  index: number;
}

const TextTranslate = ({
  msgId,
  messages,
  message,
  setMessages,
  index,
}: Props) => {
  const [targetTransLanguage, setTargetTransLanguage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const translatorRef = useRef<LanguageTranslator | null>(null);

  const handleOptionChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setTargetTransLanguage: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setTargetTransLanguage(e.target.value);
  };

  const fetchTranslator = async (detectedLanguage: string) => {
    let translator: LanguageTranslator | null;
    try {
      translator = await initializeLanguageTranslator(
        detectedLanguage,
        targetTransLanguage
      );
    } catch (error) {
      console.error(error);
      throw new Error("Failed to initialise translator");
    }
    return translator;
  };

  useEffect(() => {
    const translateText = async () => {
      try {
        // Find message that needs to be translated
        const message = messages.find((message) => message.id === msgId);

        if (!message || !targetTransLanguage) {
          console.error("Message not found or no target language found.");
          return;
        }

        if (!message.status?.languageDetection?.detectedLanguage) {
          console.error("No detected language.");
          return;
        }

        console.log(
          `Initializing translator for language: ${message.status.languageDetection.detectedLanguage}`
        );
        setIsLoading(true);
        console.log(translatorRef.current);

        // Attempt to initialize the translator

        translatorRef.current = await fetchTranslator(
          message.status.languageDetection.detectedLanguage
        );

        if (translatorRef.current == null) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? {
                    ...m,
                    status: {
                      ...m.status,
                      translation: [
                        ...m.status.translation,
                        {
                          status: statusOptions.error,
                          error: "Translation not possible on device",
                          text: "",
                          language: {
                            detected:
                              m.status.languageDetection.detectedLanguage ||
                              "unknown",
                            target: targetTransLanguage,
                          },
                        },
                      ],
                    },
                  }
                : m
            )
          );
          return null;
        }

        if (!translatorRef.current) {
          console.error("Failed to initialize language translator.");
          return;
        }

        console.log("Language translator initialized successfully.");

        // Attempt translation
        try {
          const translatedText: string = await translatorRef.current.translate(
            message.text
          );
          console.log("Translation successful:");

          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? {
                    ...m,
                    status: {
                      ...m.status,
                      translation: [
                        ...m.status.translation,
                        {
                          status: statusOptions.success,
                          text: translatedText,
                          language: {
                            detected:
                              m.status.languageDetection.detectedLanguage ||
                              "unknown",
                            target: targetTransLanguage,
                          },
                        },
                      ],
                    },
                  }
                : m
            )
          );
        } catch (translationError) {
          console.error("Translation failed:", translationError);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? {
                    ...m,
                    translation: [
                      ...m.status.translation,
                      {
                        status: statusOptions.error,
                        error: translationError,
                        language: {
                          detected: m.status.languageDetection.detectedLanguage,
                          target: targetTransLanguage,
                        },
                      },
                    ],
                  }
                : m
            )
          );
        }
      } catch (error) {
        console.error(
          "An unexpected error occurred in fetching Translator:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetTransLanguage]);

  return message.status?.languageDetection?.detectedLanguage ? (
    <div>
      <div className="translate-options-cntr" aria-busy={isLoading}>
        <label className="language-select-label" htmlFor="language-select">
          Translate text to
        </label>
        <select
          name=""
          disabled={message.id != msgId}
          id="language-select"
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            handleOptionChange(event, setTargetTransLanguage)
          }
        >
          {translationLanguages.map((language) => (
            <option
              key={language.humanReadable}
              value={language.languageCode}
              disabled={
                language.languageCode ==
                message.status.languageDetection.detectedLanguage
              }
            >
              {language.humanReadable}
            </option>
          ))}
        </select>
        {isLoading ? <p className="loading-text">Translating...</p> : null}
      </div>

      <div
        className="translate-output-cntr"
        aria-label="Translation results"
        aria-live="polite"
      >
        {messages[index].status.translation.map((translation, idx) => (
          <TextBubble key={idx} receive={true}>
            {translation.status === "error" ? (
              <span
                className="error-text"
                aria-live="polite"
                aria-label="translation-error-message"
              >
                ⚠️ {translation.error}
              </span>
            ) : (
              <>
                {languageTagToHumanReadable(translation.language.target, "en")}:{" "}
                {translation.text ? translation.text : ""}
              </>
            )}
          </TextBubble>
        ))}
      </div>
    </div>
  ) : (
    <p
      className="error-text"
      aria-live="polite"
      aria-label="language-detection-fail"
    >
      Language detection failure. Translation not possible
    </p>
  );
};

export default TextTranslate;
