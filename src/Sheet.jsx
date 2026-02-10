import React, { useEffect, useState, useMemo } from 'react'; 
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore } from './store';
import Topic from './Topic';
import ActionModal from './ActionModal'; 
import { 
  Moon, Sun, Layout, PlusCircle, ChevronsDown, 
  ChevronsUp, Search, XCircle, ArrowUp, RotateCcw 
} from 'lucide-react';

export default function Sheet() {
  const { 
    topics, setTopics, addTopic, moveItem, 
    darkMode, toggleDarkMode, undo, history 
  } = useStore();
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [showTopBtn, setShowTopBtn] = useState(false); 

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (history.length > 0) {
          e.preventDefault();
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, history.length]);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    fetch('https://node.codolio.com/api/question-tracker/v1/sheet/public/get-sheet-by-slug/strivers-a2z-dsa-sheet')
      .then(res => res.json())
      .then(res => {
        const { questions } = res.data;
        const groupedData = questions.reduce((acc, q) => {
          const tName = q.topic || "General";
          const sName = q.subTopic || "Core Problems";
          if (!acc[tName]) acc[tName] = {};
          if (!acc[tName][sName]) acc[tName][sName] = [];
          acc[tName][sName].push({ 
            id: q._id, name: q.title, 
            difficulty: q.questionId?.difficulty || "Medium", 
            url: q.questionId?.problemUrl || "#", 
            video: q.resource || null, isSolved: q.isSolved || false, notes: ""
          });
          return acc;
        }, {});

        const formatted = Object.entries(groupedData).map(([topicName, subGroup], tIdx) => ({
          id: `t-${tIdx}`,
          name: topicName,
          subTopics: Object.entries(subGroup).map(([subName, qs], sIdx) => ({
            id: `st-${tIdx}-${sIdx}`,
            name: subName,
            questions: qs
          }))
        }));
        setTopics(formatted);
      });
  }, [setTopics]);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const query = searchQuery.toLowerCase();

    return topics.map(topic => {
      const filteredSubs = topic.subTopics.map(sub => ({
        ...sub,
        questions: (sub.questions || []).filter(q => 
          (q.name || "").toLowerCase().includes(query)
        )
      })).filter(sub => 
        (sub.name || "").toLowerCase().includes(query) || (sub.questions && sub.questions.length > 0)
      );

      return { ...topic, subTopics: filteredSubs };
    }).filter(topic => 
      (topic.name || "").toLowerCase().includes(query) || (topic.subTopics && topic.subTopics.length > 0)
    );
  }, [topics, searchQuery]);

  const allQuestions = topics.flatMap(t => t.subTopics.flatMap(s => s.questions));
  const totalGlobal = allQuestions.length;

  const getDifficultyStats = (level) => {
    const subset = allQuestions.filter(q => q.difficulty === level);
    const total = subset.length;
    const solved = subset.filter(q => q.isSolved).length;
    return { 
      total, solved, remaining: total - solved,
      segmentWidth: totalGlobal > 0 ? (total / totalGlobal) * 100 : 0,
      fillProgress: total > 0 ? (solved / total) * 100 : 0
    };
  };

  const easy = getDifficultyStats("Easy");
  const medium = getDifficultyStats("Medium");
  const hard = getDifficultyStats("Hard");
  const globalPercent = totalGlobal > 0 ? Math.round((allQuestions.filter(q => q.isSolved).length / totalGlobal) * 100) : 0;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'} py-6 md:py-12 px-3 md:px-4 relative`}>
      
      <ActionModal 
        isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)}
        onSubmit={(formData) => addTopic(formData.name)}
        title="Create New Topic" placeholder="e.g., Dynamic Programming"
        initialData={{ name: "" }} darkMode={darkMode} type="addTopic"
      />

      <div className="max-w-4xl mx-auto">
        <header className="mb-8 md:mb-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <Layout className="text-blue-600" size={28} md:size={32} />
              <h1 className="text-xl md:text-3xl font-black tracking-tight uppercase">SDE Tracker</h1>
            </div>

            <div className="flex flex-col md:flex-row flex-1 items-center gap-3 w-full">
              <div className="relative w-full md:flex-1 md:max-w-sm group">
                <Search className="absolute left-3 top-2.5 w-4 h-4 opacity-40 group-focus-within:text-blue-500 transition-all" />
                <input 
                  type="text" placeholder="Search A2Z questions..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 md:py-2.5 rounded-xl border-2 outline-none text-xs font-bold transition-all ${
                    darkMode ? 'bg-zinc-900 border-zinc-800 focus:border-blue-500 text-white' : 'bg-white border-slate-200 focus:border-blue-600 text-slate-900'
                  }`}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-rose-500 transition-colors">
                    <XCircle size={18} />
                  </button>
                )}
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => setAllCollapsed(!allCollapsed)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${darkMode ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-white text-slate-500 hover:text-blue-600 shadow-sm'}`}>
                  {allCollapsed ? <ChevronsDown size={14}/> : <ChevronsUp size={14}/>}
                  <span className="md:inline">{allCollapsed ? 'Expand' : 'Collapse'}</span>
                </button>
                <button onClick={toggleDarkMode} className={`p-2.5 md:p-3 rounded-xl shadow-lg transition-transform active:scale-95 ${darkMode ? 'bg-zinc-800 text-yellow-400' : 'bg-white text-blue-600'}`}>
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button onClick={() => setIsTopicModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <PlusCircle size={20}/>
                </button>
              </div>
            </div>
          </div>

          <div className={`mb-8 md:mb-10 p-4 md:p-6 rounded-2xl border-l-4 leading-relaxed transition-all duration-500 shadow-sm ${
            darkMode 
              ? 'bg-zinc-900/40 text-zinc-400 border-zinc-700' 
              : 'bg-white text-slate-500 border-blue-200 shadow-slate-200/50'
          }`}>
            <p className="text-xs md:text-sm font-medium italic">
              "This course is made for people who want to learn DSA from A to Z for free in a well-organized and structured manner..."
            </p>
          </div>
          
          <div className="w-full h-2.5 md:h-3 bg-slate-200/50 dark:bg-zinc-900 rounded-full overflow-hidden relative flex gap-0.5">
            {[
              { stats: easy, color: 'bg-emerald-500', track: 'bg-emerald-500/10', label: 'EASY' },
              { stats: medium, color: 'bg-amber-500', track: 'bg-amber-500/10', label: 'MEDIUM' },
              { stats: hard, color: 'bg-rose-500', track: 'bg-rose-500/10', label: 'HARD' }
            ].map((config, idx) => (
              <div key={idx} className="h-full relative group cursor-help" style={{ width: `${config.stats.segmentWidth}%` }}>
                <div className={`absolute inset-0 ${config.track}`} />
                <div className={`h-full ${config.color} transition-all duration-1000 ease-out`} style={{ width: `${config.stats.fillProgress}%` }} />
                
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50`}>
                  {config.stats.remaining} {config.label} LEFT
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-1 text-[10px] font-bold uppercase tracking-widest gap-2 sm:gap-0">
            <div className="flex gap-4 md:gap-6">
              <span className={`${darkMode ? 'text-emerald-500/80' : 'text-emerald-600'}`}>E: {easy.solved}/{easy.total}</span>
              <span className={`${darkMode ? 'text-amber-500/80' : 'text-amber-600'}`}>M: {medium.solved}/{medium.total}</span>
              <span className={`${darkMode ? 'text-rose-500/80' : 'text-rose-600'}`}>H: {hard.solved}/{hard.total}</span>
            </div>
            <span className="text-blue-600 font-black px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">{globalPercent}% COMPLETED</span>
          </div>
        </header>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => e.over && moveItem(e.active, e.over)}>
          <SortableContext items={filteredTopics.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4 md:space-y-6">
              {filteredTopics.map(topic => (
                <Topic 
                  key={topic.id} topic={topic} 
                  forceCollapse={searchQuery.length > 0 ? false : allCollapsed} 
                />
              ))}
              {filteredTopics.length === 0 && searchQuery.length > 0 && (
                <div className="text-center py-20 opacity-40 font-bold uppercase tracking-widest text-sm italic">No matching questions found</div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 flex flex-col gap-3 md:gap-4 z-50">
        <button
          onClick={undo}
          className={`p-3 md:p-4 rounded-2xl shadow-2xl transition-all duration-300 border-2 active:scale-90 flex items-center gap-2 group ${history.length === 0 ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'} ${darkMode ? 'bg-zinc-900 border-zinc-800 text-amber-500 hover:border-amber-500' : 'bg-white border-slate-200 text-amber-600 hover:bg-amber-600 hover:text-white'}`}
          title="Undo Last Move (Ctrl+Z)"
        >
          <RotateCcw size={20} md:size={24} strokeWidth={3} />
          <span className="hidden md:block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Undo</span>
        </button>

        <button
          onClick={scrollToTop}
          className={`p-3 md:p-4 rounded-2xl shadow-2xl transition-all duration-300 border-2 active:scale-90 ${showTopBtn ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'} ${darkMode ? 'bg-zinc-900 border-zinc-800 text-blue-500 hover:text-white hover:border-blue-500' : 'bg-white border-slate-200 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
          title="Back to Top"
        >
          <ArrowUp size={20} md:size={24} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}