import { ArrowUp } from "lucide-react";
import "./TextInput.css";
import { useState } from "react";

interface Props {
  setChat: React.Dispatch<React.SetStateAction<string[]>>;
}

const TextInput = ({ setChat }: Props) => {
  const [textInput, setTextInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };
  const handleInputSubmit = () => {
    setChat((prev) => [...prev, textInput]);
    setTextInput("");
  };

  return (
    <div className="input-container">
      <input
        type="text"
        name=""
        id="text-input"
        value={textInput}
        onChange={handleInputChange}
        placeholder="Type a message"
      ></input>
      <button type="submit" className="submit-txt" onClick={handleInputSubmit}>
        <ArrowUp />
      </button>
    </div>
  );
};

export default TextInput;
