import { useState, useRef, ChangeEvent, useEffect } from "react";
import { ChatMessage, LanguageTranslator } from "../lib/types";
import { initializeLanguageTranslator } from "../lib/helperFunctions";

// List of available language translations
const translationLanguages = {
  humanReadable: [
    "English",
    "Portuguese ",
    "Spanish ",
    "Russian ",
    "Turkish ",
    "French ",
  ],
  languageCode: ["en", "pt", "es", "ru", "tr", "fr"],
};

interface Props {
  msgId: string;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  index: number;
}

const TextTranslate = ({ msgId, messages, setMessages, index }: Props) => {
  const [textTranslated, setTextTranslated] = useState<string[]>([]);
  const [targetTransLanguage, setTargetTransLanguage] = useState<string>("");
  const translatorRef = useRef<LanguageTranslator | null>(null);

  const handleOptionChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setTargetTransLanguage: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setTargetTransLanguage(e.target.value);
  };

  useEffect(() => {
    const fetchTranslator = async () => {
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
        translatorRef.current = await initializeLanguageTranslator(
          message.status.languageDetection.detectedLanguage,
          targetTransLanguage
        );

        if (!translatorRef.current) {
          console.error("Failed to initialize language translator.");
          return;
        }

        console.log("Language translator initialized successfully.");

        // Attempt translation
        try {
          const translatedText = await translatorRef.current.translate(
            message.text
          );
          console.log("Translation successful:", translatedText);

          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? {
                    ...m,
                    translation: {
                      status: "success",
                      translations: translatedText,
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
                    translation: {
                      status: "success",
                      error: translationError,
                    },
                  }
                : m
            )
          );
        }
      } catch (error) {
        console.error(
          "An unexpected error occurred in fetchTranslator:",
          error
        );
      }
    };

    fetchTranslator();
  }, [targetTransLanguage]);

  return (
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
          >
            {language}
          </option>
        ))}
      </select>
      <p>
        Text translated to {targetTransLanguage}:
        {messages[index].status.translation.translations
          ? messages[index].status.translation.translations
          : ""}
      </p>
    </div>
  );
};

export default TextTranslate;
