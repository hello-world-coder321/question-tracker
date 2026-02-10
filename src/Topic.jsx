import React, { useState, useEffect } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Edit3, ChevronDown, ChevronRight } from "lucide-react";
import { useStore } from "./store";
import SubTopic from "./SubTopic";
import ActionModal from "./ActionModal";

export default function Topic({ topic, forceCollapse }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ 
    id: topic.id, data: { type: 'topic' } 
  });
  const { deleteTopic, editTopic, addSubTopic, darkMode } = useStore();
  const style = { transform: CSS.Transform.toString(transform), transition };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCircleHovered, setIsCircleHovered] = useState(false);

  useEffect(() => {
    setIsCollapsed(forceCollapse);
  }, [forceCollapse]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, 
    initialData: { name: "" }
  });

  const totalQuestions = topic.subTopics.reduce((acc, sub) => acc + (sub.questions?.length || 0), 0);
  const solvedQuestions = topic.subTopics.reduce((acc, sub) => 
    acc + (sub.questions?.filter(q => q.isSolved).length || 0), 0);
  
  const percentage = totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleModalSubmit = (formData) => {
    if (modalState.type === 'edit') {
      editTopic(topic.id, formData.name);
    } else if (modalState.type === 'add') {
      addSubTopic(topic.id, formData.name);
    }
    setModalState({ ...modalState, isOpen: false });
  };

  return (
    <div ref={setNodeRef} style={style} className={`border rounded-2xl mb-6 shadow-sm overflow-hidden ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'}`}>
      
      <ActionModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSubmit={handleModalSubmit}
        type={modalState.type}
        title={modalState.type === 'edit' ? "Edit Topic Name" : "New Sub-Topic"}
        placeholder={modalState.type === 'edit' ? "Enter topic name" : "Enter sub-topic name"}
        initialData={modalState.initialData}
        darkMode={darkMode}
      />

      <div className={`flex items-center justify-between p-5 ${!isCollapsed ? 'border-b' : ''} ${darkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
        {/* Added min-w-0 to allow this container to shrink and trigger truncation */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-indigo-500 transition-colors shrink-0">
            <GripVertical size={20} />
          </div>
          
          {/* min-w-0 here is critical for the truncate child to work */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95 min-w-0 flex-1"
            >
              {isCollapsed ? (
                <ChevronRight size={22} className="text-blue-500 shrink-0" />
              ) : (
                <ChevronDown size={22} className="text-blue-500 shrink-0" />
              )}
              {/* Added 'truncate' and 'text-left' classes to handle the overflow */}
              <h2 className={`text-xl font-bold truncate text-left ${darkMode ? 'text-white' : 'text-slate-800'}`} title={topic.name}>
                {topic.name}
              </h2>
            </button>
            
            <div 
              className="relative flex items-center justify-center w-10 h-10 cursor-help shrink-0"
              onMouseEnter={() => setIsCircleHovered(true)}
              onMouseLeave={() => setIsCircleHovered(false)}
            >
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20" cy="20" r={radius}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  className={`${darkMode ? 'text-zinc-800' : 'text-slate-100'}`}
                />
                <circle
                  cx="20" cy="20" r={radius}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                  strokeLinecap="round"
                  className="text-emerald-500"
                />
              </svg>
              <span className={`absolute text-[9px] font-black transition-opacity duration-200 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {isCircleHovered ? `${solvedQuestions}/${totalQuestions}` : `${percentage}%`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4 shrink-0">
          <button 
            onClick={() => setModalState({ isOpen: true, type: 'edit', initialData: { name: topic.name } })}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
          >
            <Edit3 size={18} className="text-slate-400" />
          </button>
          <button 
            onClick={() => deleteTopic(topic.id)}
            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
          >
            <Trash2 size={18} className="text-slate-400 hover:text-rose-500" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5">
          <SortableContext items={topic.subTopics.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {topic.subTopics.map(sub => (
                <SubTopic key={sub.id} sub={sub} topicId={topic.id} />
              ))}
            </div>
          </SortableContext>
          
          <button 
            onClick={() => setModalState({ isOpen: true, type: 'add', initialData: { name: "" } })} 
            className="mt-4 w-full py-3 border-2 border-dashed rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all font-bold"
          >
            + New Sub-topic
          </button>
        </div>
      )}
    </div>
  );
}