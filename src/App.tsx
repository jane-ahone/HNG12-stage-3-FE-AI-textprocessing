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

  console.log(messages);
  return (
    <>
      <header>
        <h1>Chat Section</h1>
      </header>
      <main>
        <div className="chat-display-cntr">
          {messages.map((message, index) => (
            <>
              <TextBubble>{message.text}</TextBubble>{" "}
              <p>
                Language detected:
                {message.status.languageDetection.detectedLanguage
                  ? languageTagToHumanReadable(
                      message.status.languageDetection.detectedLanguage,
                      "en"
                    )
                  : message.status.languageDetection.error}
              </p>
              {message.text.length > 150 ? <button>Summarise</button> : null}
              <TextTranslate
                msgId={currentMsgId}
                messages={messages}
                setMessages={setMessages}
                index={index}
              />
            </>
          ))}
        </div>
        <TextInput
          messages={messages}
          setMessages={setMessages}
          setCurrentMsgId={setCurrentMsgId}
        />
      </main>
    </>
  );
}

export default App;
