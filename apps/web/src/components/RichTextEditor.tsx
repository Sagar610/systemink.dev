import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your post here...',
  className,
}: RichTextEditorProps) {
  const [ReactQuill, setReactQuill] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import ReactQuill only on client side
    import('react-quill').then((module) => {
      setReactQuill(() => module.default);
    });
    // Import CSS
    import('react-quill/dist/quill.snow.css');
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ align: [] }],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    [],
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'blockquote',
    'code-block',
    'link',
    'image',
    'align',
  ];

  if (!isClient || !ReactQuill) {
    return (
      <div className={cn('rich-text-editor', className, 'min-h-[400px] border rounded-md p-4')}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full min-h-[400px] border-0 outline-none resize-none bg-transparent"
        />
      </div>
    );
  }

  return (
    <div className={cn('rich-text-editor', className)}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-[calc(100%-42px)]"
      />
      <style>{`
        .rich-text-editor .ql-container {
          font-size: 16px;
          font-family: inherit;
          min-height: 400px;
        }
        .rich-text-editor .ql-editor {
          min-height: 400px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-bottom: none;
          border-radius: calc(var(--radius) - 2px) calc(var(--radius) - 2px) 0 0;
          background: hsl(var(--background));
        }
        .rich-text-editor .ql-container {
          border-bottom: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-top: none;
          border-radius: 0 0 calc(var(--radius) - 2px) calc(var(--radius) - 2px);
        }
        .rich-text-editor .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .rich-text-editor .ql-fill {
          fill: hsl(var(--foreground));
        }
        .rich-text-editor .ql-picker-label {
          color: hsl(var(--foreground));
        }
        .rich-text-editor .ql-picker-options {
          background: hsl(var(--background));
          border-color: hsl(var(--border));
        }
        .rich-text-editor .ql-picker-item:hover {
          background: hsl(var(--accent));
        }
        .rich-text-editor .ql-picker-item.ql-selected {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
      `}</style>
    </div>
  );
}
