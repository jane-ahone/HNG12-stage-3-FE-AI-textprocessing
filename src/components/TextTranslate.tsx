import { useState, useRef, ChangeEvent, useEffect } from "react";
import { ChatMessage, LanguageTranslator, statusOptions } from "../lib/types";
import { initializeLanguageTranslator } from "../lib/helperFunctions";
import TextBubble from "./TextBubble";

// List of available language translations
const translationLanguages = {
  humanReadable: [
    "Pick a language",
    "English",
    "Portuguese ",
    "Spanish ",
    "Russian ",
    "Turkish ",
    "French ",
  ],
  languageCode: ["", "en", "pt", "es", "ru", "tr", "fr"],
};

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
    const TranslateText = async () => {
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
                        status: "error",
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
      }
    };

    TranslateText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetTransLanguage]);

  console.log(messages);

  return message.status?.languageDetection?.detectedLanguage ? (
    <div>
      Translate to
      <select
        name=""
        id=""
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          handleOptionChange(event, setTargetTransLanguage)
        }
      >
        {translationLanguages.humanReadable.map((language, i) => (
          <option
            key={translationLanguages.languageCode[i]}
            value={translationLanguages.languageCode[i]}
            disabled={
              translationLanguages.languageCode[i] ==
              message.status.languageDetection.detectedLanguage
            }
          >
            {language}
          </option>
        ))}
      </select>
      {messages[index].status.translation.map((translation, index) => (
        <TextBubble>
          Text translated to {""}{" "}
          {message.status.translation[index].language.target}: {"  "}
          {translation.text ? translation.text : ""}
        </TextBubble>
      ))}
    </div>
  ) : (
    <p>Detection failure. Translation not possible</p>
  );
};

export default TextTranslate;
