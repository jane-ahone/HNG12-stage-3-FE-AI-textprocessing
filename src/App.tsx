import { useState } from "react";
import "./App.css";
import TextInput from "./components/TextInput";
import TextBubble from "./components/TextBubble";
import { ChatMessage } from "./lib/types";
import { languageTagToHumanReadable } from "./lib/helperFunctions";
import TextTranslate from "./components/TextTranslate";

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMsgId, setCurrentMsgId] = useState<string>("");

  return (
    <div role="application" aria-label="Chat-Application">
      <header>
        <h1>Chat Section</h1>
      </header>
      <main>
        <div
          className="chat-display-cntr"
          aria-label="Chat messages"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <article key={message.id} aria-label={`Message ${index + 1}`}>
              <TextBubble aria-label={`User message: ${message.text}`}>
                {message.text}
              </TextBubble>{" "}
              <TextBubble receive={true} aria-label="Language detection result">
                <span className="detection-output">Language detected </span>
                <p
                  className="detected-language"
                  aria-label="Detected language"
                  aria-live="polite"
                >
                  {message.status.languageDetection.detectedLanguage
                    ? languageTagToHumanReadable(
                        message.status.languageDetection.detectedLanguage,
                        "en"
                      )
                    : message.status.languageDetection.error ||
                      "Detection failed"}
                </p>
              </TextBubble>
              <TextTranslate
                message={message}
                msgId={currentMsgId}
                messages={messages}
                setMessages={setMessages}
                index={index}
                aria-label={`Translation controls for message ${index + 1}`}
              />
            </article>
          ))}
        </div>
        <TextInput
          setMessages={setMessages}
          setCurrentMsgId={setCurrentMsgId}
          aria-label="Message input"
        />
      </main>
    </div>
  );
}

export default App;
