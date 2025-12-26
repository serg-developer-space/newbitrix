
import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-200">
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1 sticky top-0 z-10">
        <select 
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="text-xs font-semibold bg-white border border-slate-200 rounded px-2 py-1 outline-none text-slate-600 mr-1"
        >
          <option value="P">Обычный текст</option>
          <option value="H1">Заголовок 1</option>
          <option value="H2">Заголовок 2</option>
          <option value="H3">Заголовок 3</option>
        </select>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <ToolbarButton onClick={() => execCommand('bold')} icon={<span className="font-bold">B</span>} title="Жирный" />
        <ToolbarButton onClick={() => execCommand('italic')} icon={<span className="italic font-serif">I</span>} title="Курсив" />
        <ToolbarButton onClick={() => execCommand('underline')} icon={<span className="underline">U</span>} title="Подчеркнутый" />
        
        <div className="w-px h-6 bg-slate-200 mx-1" />

        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon="•" title="Маркированный список" />
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon="1." title="Нумерованный список" />
        
        <div className="w-px h-6 bg-slate-200 mx-1" />

        <ToolbarButton onClick={() => execCommand('justifyLeft')} icon="Слева" title="Выровнять по левому краю" small />
        <ToolbarButton onClick={() => execCommand('justifyCenter')} icon="Центр" title="Выровнять по центру" small />
        
        <div className="w-px h-6 bg-slate-200 mx-1 ml-auto" />
        
        <ToolbarButton onClick={() => execCommand('removeFormat')} icon="Очистить" title="Очистить форматирование" small />
      </div>

      <div className="bg-slate-100 p-4 min-h-[300px] flex justify-center">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full max-w-[800px] bg-white p-12 shadow-sm min-h-[400px] focus:outline-none prose prose-slate max-w-none text-slate-800"
          style={{
            fontFamily: "'Inter', sans-serif",
            lineHeight: '1.6',
            minHeight: '29.7cm'
          }}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

const ToolbarButton = ({ onClick, icon, title, small }: any) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`
      w-8 h-8 flex items-center justify-center rounded hover:bg-slate-200 transition-all text-slate-600 active:scale-90
      ${small ? 'text-[8px] font-bold uppercase' : 'text-sm'}
    `}
  >
    {icon}
  </button>
);

export default RichTextEditor;
