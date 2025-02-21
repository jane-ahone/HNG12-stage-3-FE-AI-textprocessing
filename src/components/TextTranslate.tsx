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
  { humanReadable: "Portugues", languageCode: "pt" },
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
  // const [textTranslated, setTextTranslated] = useState<string[]>([]);
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
        const message = messages.find((message) => message.id === msgId);

        if (!message) {
          console.error("Message not found.");
          return;
        }

        if (!message.status?.languageDetection?.detectedLanguage) {
          console.error("No detected language.");
          return;
        }

        console.log(
          `Initializing translator for language: ${message.status.languageDetection.detectedLanguage}`
        );
        setIsLoading(true); // Start loadintt

        // Attempt to initialize the translator

        translatorRef.current = await fetchTranslator(
          message.status.languageDetection.detectedLanguage
        );

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
          console.log("Translation successful:", translatedText);

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

  console.log(messages);

  return message.status?.languageDetection?.detectedLanguage ? (
    <div>
      <label htmlFor="language-select">Translate Text to</label>
      <select
        name=""
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
      <div className="translate-output-cntr">
        {messages[index].status.translation.map((translation, index) => (
          <TextBubble key={index} receive={true}>
            {languageTagToHumanReadable(
              message.status.translation[index].language.target,
              "en"
            )}
            : {"  "}
            {translation.text ? translation.text : ""}
          </TextBubble>
        ))}
      </div>
    </div>
  ) : (
    <p>Detection failure. Translation not possible</p>
  );
};

export default TextTranslate;
