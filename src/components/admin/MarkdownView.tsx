import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

// Tailwind typography (prose) is not installed, so styles are applied per node.
const components: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="mt-8 mb-4 font-display text-3xl font-bold" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mt-10 mb-3 border-b border-deep-ocean/10 pb-2 font-display text-2xl font-bold"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mt-6 mb-2 font-display text-xl font-bold" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="mt-4 mb-2 font-semibold" {...props}>
      {children}
    </h4>
  ),
  p: (props) => <p className="my-3 leading-relaxed text-deep-ocean/90" {...props} />,
  ul: (props) => <ul className="my-3 list-disc space-y-1 pl-6" {...props} />,
  ol: (props) => <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  a: ({ children, ...props }) => (
    <a
      className="text-jeju-ocean underline hover:text-deep-ocean"
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: (props) => (
    <blockquote
      className="my-4 border-l-4 border-jeju-ocean/40 bg-ocean-sand/30 px-4 py-2 italic text-deep-ocean/80"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-deep-ocean/10" />,
  code: (props) => (
    <code className="rounded bg-ocean-sand/50 px-1.5 py-0.5 text-sm" {...props} />
  ),
  pre: (props) => (
    <pre className="my-4 overflow-x-auto rounded border border-deep-ocean/10 bg-[#f5f7f2] p-4 text-sm" {...props} />
  ),
  table: (props) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-ocean-sand/40" {...props} />,
  th: (props) => (
    <th className="border border-deep-ocean/15 px-3 py-2 text-left font-semibold" {...props} />
  ),
  td: (props) => <td className="border border-deep-ocean/15 px-3 py-2 align-top" {...props} />,
};

export default function MarkdownView({ content }: { content: string }) {
  return (
    <div className="text-deep-ocean">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
