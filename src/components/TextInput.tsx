import { ArrowUp } from "lucide-react";
import "./TextInput.css";
import { useEffect, useRef, useState } from "react";
import { ChatMessage, LanguageDetector, statusOptions } from "../lib/types";
import { initializeLanguageDetector } from "../lib/helperFunctions";
import { z, ZodError } from "zod";
interface Props {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setCurrentMsgId: React.Dispatch<React.SetStateAction<string>>;
}

type DetectionResult = {
  status: statusOptions;
  error?: string | undefined;
  detectedLanguage?: string | undefined;
};

const Input = z.string().min(1);

const TextInput = ({ setMessages, setCurrentMsgId }: Props) => {
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detectorRef = useRef<LanguageDetector | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };

  //initialise detector object
  const fetchDetector = async () => {
    detectorRef.current = await initializeLanguageDetector();

    if (detectorRef.current) {
      console.log("Language detector initialized successfully.");
    } else {
      setError("Failed to initialize language detector");
      throw new Error("Language detector is not available");
    }
  };

  useEffect(() => {
    fetchDetector();
  }, []);

  async function detectLanguage(text: string): Promise<DetectionResult> {
    try {
      if (text) {
        const results = await detectorRef.current?.detect(text);
        if (results) {
          return {
            status: statusOptions.success,
            detectedLanguage: results[0].detectedLanguage,
          };
        } else {
          console.error("Detection failed");
          return {
            status: statusOptions.error,
            error: "Detection failed",
          };
        }
      } else {
        return {
          status: statusOptions.error,
          error: "No messages to detect",
        };
      }
    } catch (error) {
      console.error("Error", error);
      return {
        status: statusOptions.error,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  const handleInputSubmit = async () => {
    try {
      Input.parse(textInput);
    } catch (error) {
      console.log(error);
      setError(
        error instanceof ZodError
          ? error.issues[0].message
          : `Unexpected error:${error}`
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const msgId = crypto.randomUUID();
      setCurrentMsgId(msgId);

      const languageInfo = await detectLanguage(textInput);

      const newMessage: ChatMessage = {
        id: msgId,
        text: textInput.trim(),
        status: {
          languageDetection: {
            status: languageInfo.status,
            detectedLanguage: languageInfo.detectedLanguage,
          },
          translation: [],
        },
      };

      setMessages((prev) => [...prev, newMessage]);
      setTextInput("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsLoading(false);
    }
  };
  console.log("Application errors", error);

  return (
    <>
      {error && (
        <div id="error-message" className="error-message" role="alert">
          {error}
        </div>
      )}
      <div className="input-container">
        <textarea
          autoFocus
          name="message"
          aria-label="Type a message"
          id="text-input"
          value={textInput}
          onChange={handleInputChange}
          placeholder="Hello, how are you doing?"
        />
        <button
          type="submit"
          className="submit-txt"
          aria-label="Submit text"
          disabled={isLoading}
          onClick={handleInputSubmit}
        >
          <ArrowUp size={20} aria-label="submit-icon" />
        </button>
      </div>
    </>
  );
};

export default TextInput;
