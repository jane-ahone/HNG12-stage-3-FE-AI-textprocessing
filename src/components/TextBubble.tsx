import "./TextBubble.css";

interface Props {
  children: React.ReactNode;
  receive?: boolean;
}

const TextBubble = ({ children, receive }: Props) => {
  return (
    <div className={`message-cntr ${receive ? "receiver-cntr" : ""}`}>
      <p className={`text ${receive ? "receiver" : ""}`}>{children}</p>
    </div>
  );
};

export default TextBubble;
