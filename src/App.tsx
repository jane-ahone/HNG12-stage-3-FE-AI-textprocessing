import { useEffect, useRef, useState } from "react";
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

const translationLanguages = [
  "Translate to",
  "English(en)",
  "Portuguese (pt)",
  "Spanish (es)",
  "Russian (ru)",
  "Turkish (tr)",
  "French (fr)",
];

function App() {
  const [chat, setChat] = useState<string[]>(["Hello Miss Johnson"]);
  const [languageDetected, setLanguageDetected] = useState<string[]>([]);
  const detectorRef = useRef<LanguageDetector | null>(null);

  useEffect(() => {
    const fetchDetector = async () => {
      detectorRef.current = await initializeLanguageDetector();

      if (detectorRef.current) {
        console.log("Language detector initialized successfully.");
      } else {
        console.error("Language detector is not available.");
      }
    };

    fetchDetector();
  }, []);

  useEffect(() => {
    async function detectLanguage() {
      const lastMessage = chat.at(-1);

      if (lastMessage) {
        const results = await detectorRef.current?.detect(lastMessage);
        console.log(results);
        if (results) {
          setLanguageDetected((prev) => [...prev, results[0].detectLanguage]);
        } else {
          console.log("results fail");
          throw new Error("An error occured");
        }
      } else {
        console.log("No messages to detect.");
      }
    }
    detectLanguage();
  }, [chat]);
  console.log("detected language", languageDetected);
  return (
    <>
      <header>
        <h1>Chat Section</h1>
      </header>
      <main>
        <div className="chat-display-cntr">
          {Array.from({ length: chat.length }, (_, i) => (
            <>
              <TextBubble>{chat[i]}</TextBubble>
              <button>Summarise</button>
              <select name="" id="">
                {translationLanguages.map((lang) => (
                  <option>{lang}</option>
                ))}
              </select>
              <p>{languageDetected ? languageDetected[i] : ""}</p>
            </>
          ))}
        </div>
        <TextInput setChat={setChat} />
      </main>
    </>
  );
}

export default App;
