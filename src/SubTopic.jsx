import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  GripVertical, Trash2, Edit3, ExternalLink, 
  Youtube, StickyNote, CheckCircle2, Circle,
  ChevronDown, ChevronRight 
} from "lucide-react";
import { useStore } from "./store";
import ActionModal from "./ActionModal";

// Helper for text highlighting
const HighlightedText = ({ text, highlight }) => {
  if (!highlight || !highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-blue-500/30 text-blue-400 rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

// Exporting QuestionItem so it can be used for flat search results if needed
export function QuestionItem({ q, subId, topicId, onEdit, onNote, searchQuery = "" }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ 
    id: q.id, data: { type: 'question', parentId: subId } 
  });
  
  const { deleteQuestion, toggleSolved, darkMode } = useStore();
  const style = { transform: CSS.Transform.toString(transform), transition };

  const getDiffColor = (d) => 
    d === "Easy" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : 
    d === "Medium" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : 
    "text-rose-500 bg-rose-500/10 border-rose-500/20";

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center justify-between p-3 rounded-xl border group transition-all duration-300 ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'} ${q.isSolved ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-200/50' : ''}`}>
      <div className="flex items-center w-[35%] shrink-0 gap-x-5">
        <div {...attributes} {...listeners} className="cursor-grab text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <GripVertical size={14} />
        </div>
        <button onClick={() => toggleSolved(topicId, subId, q.id)} className="shrink-0 transition-transform active:scale-90">
          {q.isSolved ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className={`${darkMode ? 'text-zinc-700' : 'text-slate-300'}`} />}
        </button>
        <span className={`text-[10px] font-bold py-0.5 rounded border uppercase text-center w-14 shrink-0 ${getDiffColor(q.difficulty)}`}>{q.difficulty}</span>
        
        <div className="w-8 flex justify-center shrink-0">
          {q.video && (
            <a href={q.video} target="_blank" rel="noreferrer" className="text-rose-500 hover:text-rose-600 transition-colors">
              <Youtube size={18} fill="currentColor" fillOpacity={0.1} />
            </a>
          )}
        </div>

        <button 
          onClick={() => onNote(q.id, q.notes)} 
          className={`shrink-0 transition-colors relative ${q.notes ? 'text-blue-500' : 'text-slate-400 hover:text-blue-400'}`}
        >
          <StickyNote size={18} fill={q.notes ? "currentColor" : "none"} fillOpacity={0.1} />
          {q.notes && (
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white dark:border-zinc-950" />
          )}
        </button>
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        {q.url && q.url !== "#" ? (
          <>
            <a 
              href={q.url} 
              target="_blank" 
              rel="noreferrer" 
              className={`text-sm font-bold truncate transition-colors ${q.isSolved ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}
            >
              <HighlightedText text={q.name} highlight={searchQuery} />
            </a>
            {/* Clickable External Link Icon */}
            <a href={q.url} target="_blank" rel="noreferrer" className="shrink-0 transition-opacity opacity-40 hover:opacity-100">
              <ExternalLink size={12} className="text-blue-400" />
            </a>
          </>
        ) : (
          <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
            <HighlightedText text={q.name} highlight={searchQuery} />
            <span className="text-[10px] ml-2 px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-800 rounded font-black text-slate-500">N/A</span>
          </span>
        )}
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0 border-l pl-4 border-slate-100 dark:border-zinc-800">
        <button onClick={() => onEdit(q.id, q)}><Edit3 size={14} className="text-slate-400 hover:text-blue-500" /></button>
        <button onClick={() => deleteQuestion(topicId, subId, q.id)}><Trash2 size={14} className="text-slate-400 hover:text-red-500" /></button>
      </div>
    </div>
  );
}

export default function SubTopic({ sub, topicId, searchQuery = "" }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ 
    id: sub.id, data: { type: 'subtopic', parentId: topicId } 
  });
  const { deleteSubTopic, editSubTopic, addQuestion, editQuestion, updateNote, darkMode } = useStore();
  const style = { transform: CSS.Transform.toString(transform), transition };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: null, id: null, initialData: { name: "" } });
  const [isBadgeHovered, setIsBadgeHovered] = useState(false);

  const totalSub = sub.questions?.length || 0;
  const solvedSub = sub.questions?.filter(q => q.isSolved).length || 0;
  const subPercentage = totalSub > 0 ? Math.round((solvedSub / totalSub) * 100) : 0;

  const handleModalSubmit = (formData) => {
    if (modalState.type === 'editSub') editSubTopic(topicId, sub.id, formData.name);
    else if (modalState.type === 'addQ') addQuestion(topicId, sub.id, formData);
    else if (modalState.type === 'editQ') editQuestion(topicId, sub.id, modalState.id, formData);
    else if (modalState.type === 'note') updateNote(topicId, sub.id, modalState.id, formData.name);
    setModalState({ ...modalState, isOpen: false });
  };

  return (
    <div ref={setNodeRef} style={style} className={`rounded-xl border transition-all duration-300 ${darkMode ? 'bg-zinc-800/40 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
      <ActionModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSubmit={handleModalSubmit} 
        type={modalState.type} 
        darkMode={darkMode}
        title={
          modalState.type === 'addQ' ? "New Question" : 
          modalState.type === 'note' ? "Edit Notes" : "Edit Details"
        } 
        initialData={modalState.initialData}
      />

      <div className={`flex justify-between items-center p-4 ${isCollapsed ? '' : 'border-b border-inherit'}`}>
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab text-slate-400"><GripVertical size={16} /></div>
          
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            {isCollapsed ? <ChevronRight size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-blue-600" />}
            <h3 className="font-bold text-xs uppercase tracking-widest opacity-60">
              <HighlightedText text={sub.name} highlight={searchQuery} />
            </h3>
          </button>

          <span 
            onMouseEnter={() => setIsBadgeHovered(true)}
            onMouseLeave={() => setIsBadgeHovered(false)}
            className={`text-[10px] font-black px-2 py-0.5 rounded-full cursor-help transition-all duration-300 min-w-[35px] text-center ${
              darkMode ? 'bg-zinc-800 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm'
            }`}
          >
            {isBadgeHovered ? `${solvedSub}/${totalSub}` : `${subPercentage}%`}
          </span>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setModalState({ isOpen: true, type: 'editSub', initialData: { name: sub.name } })}><Edit3 size={16} className="text-slate-400 hover:text-blue-500" /></button>
          <button onClick={() => deleteSubTopic(topicId, sub.id)}><Trash2 size={16} className="text-slate-400 hover:text-red-500" /></button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 space-y-2">
          <SortableContext items={sub.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
            {sub.questions.map(q => (
              <QuestionItem 
                key={q.id} q={q} subId={sub.id} topicId={topicId}
                searchQuery={searchQuery}
                onEdit={(id, fullQ) => setModalState({ isOpen: true, type: 'editQ', id, initialData: fullQ })}
                onNote={(id, note) => setModalState({ isOpen: true, type: 'note', id, initialData: { name: note || "" } })}
              />
            ))}
          </SortableContext>
          <button 
            onClick={() => setModalState({ isOpen: true, type: 'addQ', initialData: { name: "", difficulty: "Medium", url: "", video: "" } })} 
            className="mt-4 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline transition"
          >
            + Add Question
          </button>
        </div>
      )}
    </div>
  );
}