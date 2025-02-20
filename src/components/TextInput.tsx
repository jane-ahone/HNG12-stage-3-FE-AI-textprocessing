import { ArrowUp } from "lucide-react";
import "./TextInput.css";
import { useRef, useState } from "react";
import { ChatMessage, LanguageDetector, statusOptions } from "../lib/types";
import { initializeLanguageDetector } from "../lib/helperFunctions";

interface Props {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setCurrentMsgId: React.Dispatch<React.SetStateAction<string>>;
}

type DetectionResult = {
  status: statusOptions;
  error?: string | undefined;
  detectedLanguage?: string | undefined;
};

const TextInput = ({ setMessages, setCurrentMsgId }: Props) => {
  const [textInput, setTextInput] = useState("");
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
      throw new Error("Language detector is not available");
    }
  };

  async function detectLanguage(text: string): Promise<DetectionResult> {
    try {
      await fetchDetector();

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
    const msgId = crypto.randomUUID();
    setCurrentMsgId(msgId);

    //First detect the language
    const languageInfo = await detectLanguage(textInput);

    //Create the message with detection results

    const newMessage: ChatMessage = {
      id: msgId,
      text: textInput,
      status: {
        languageDetection: {
          status: languageInfo?.status,
          error: languageInfo?.error,
          detectedLanguage: languageInfo?.detectedLanguage,
        },
        translation: [],
      },
    };

    //save new message
    setMessages((prev) => [...prev, newMessage]);
    setTextInput("");
  };

  return (
    <div className="input-container">
      <textarea
        name=""
        id="text-input"
        value={textInput}
        onChange={handleInputChange}
        placeholder="Type a message"
      ></textarea>
      <button type="submit" className="submit-txt" onClick={handleInputSubmit}>
        <ArrowUp />
      </button>
    </div>
  );
};

export default TextInput;
