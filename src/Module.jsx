import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import Topic from './Topic';

export default function Module({ module, darkMode, allCollapsed }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`mb-8 rounded-3xl transition-all ${
      darkMode ? 'bg-zinc-900/20' : 'bg-slate-100/30'
    }`}>
      {/* Module Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-4 w-full p-6 group"
      >
        <div className={`p-3 rounded-2xl transition-colors ${
          darkMode ? 'bg-zinc-800 text-blue-400' : 'bg-white text-blue-600 shadow-sm'
        }`}>
          <Folder size={24} fill="currentColor" fillOpacity={0.1} />
        </div>
        
        <div className="flex flex-col items-start">
          <h2 className={`text-xl font-black uppercase tracking-widest ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {module.name}
          </h2>
          <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
            {module.topics.length} Topics inside
          </span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
        </div>
      </button>

      {/* Expanded Topics List */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {module.topics.map(topic => (
            <Topic 
              key={topic.id} 
              topic={topic} 
              forceCollapse={allCollapsed} 
            />
          ))}
        </div>
      )}
    </div>
  );
}