import { useEffect, useState } from "react";
import "./App.css";
import TextInput from "./components/TextInput";
import TextBubble from "./components/TextBubble";

interface LanguageDetectorCapabilities {
  capabilities: "no" | "readily" | "afterDownload";
}

interface LanguageDetector {
  ready?: Promise<void>;
  destroy: () => void;
  detect: (text: string) => void;
}
async function initializeLanguageDetector(): Promise<LanguageDetector | null> {
  const languageDetectorCapabilities: LanguageDetectorCapabilities =
    await self.ai.languageDetector.capabilities();

  const canDetect = languageDetectorCapabilities.capabilities;
  let detector: LanguageDetector | null = null;

  if (canDetect === "no") {
    return null;
  }

  if (canDetect === "readily") {
    detector = await self.ai.languageDetector.create();
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

const detector: LanguageDetector | null = await initializeLanguageDetector();

if (detector) {
  console.log("Language detector initialized successfully.");
} else {
  console.log("Language detector is not available.");
}

function App() {
  const [chat, setChat] = useState<string[]>([
    "Hello Miss Johnson",
    "How are you doing",
    "You know I've been falling",
  ]);

  useEffect(() => {
    async function detectLanguage() {
      const lastMessage = chat.at(-1);

      if (lastMessage) {
        const results = await detector?.detect(lastMessage);
        for (const result of results) {
          console.log(result.detectedLanguage, result.confidence);
        }
      } else {
        console.log("No messages to detect.");
      }
    }
    detectLanguage();
  }, [chat]);

  return (
    <>
      <header>
        <h1>Chat Section</h1>
      </header>
      <main>
        <div className="chat-display-cntr">
          {chat.map((text) => (
            <TextBubble>{text}</TextBubble>
          ))}
        </div>
        <TextInput setChat={setChat} />
      </main>
    </>
  );
}

export default App;
