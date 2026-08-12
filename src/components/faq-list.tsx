export type FaqItem = Readonly<{
  question: string;
  answer: string;
}>;

type FaqListProps = Readonly<{
  items: readonly FaqItem[];
}>;

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
