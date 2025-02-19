import "./TextBubble.css";

interface Props {
  children: React.ReactNode;
}

const TextBubble = ({ children }: Props) => {
  return <div className="message-cntr">{children}</div>;
};

export default TextBubble;
