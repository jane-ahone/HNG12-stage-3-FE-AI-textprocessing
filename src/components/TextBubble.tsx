import "./TextBubble.css";

interface Props {
  children: React.ReactNode;
  receive?: boolean;
}

const TextBubble = ({ children, receive }: Props) => {
  return (
    <div className={`message-cntr ${receive ? "receiver-cntr" : "sender"}`}>
      <p className={`text ${receive ? "receiver" : "sender-text"}`}>
        {children}
      </p>
    </div>
  );
};

export default TextBubble;
