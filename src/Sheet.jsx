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
        questions: sub.questions.filter(q => q.name.toLowerCase().includes(query))
      })).filter(sub => sub.name.toLowerCase().includes(query) || sub.questions.length > 0);
      return { ...topic, subTopics: filteredSubs };
    }).filter(topic => topic.name.toLowerCase().includes(query) || topic.subTopics.length > 0);
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
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'} py-12 px-4 relative`}>
      
      <ActionModal 
        isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)}
        onSubmit={(formData) => addTopic(formData.name)}
        title="Create New Topic" placeholder="e.g., Dynamic Programming"
        initialData={{ name: "" }} darkMode={darkMode} type="addTopic"
      />

      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3 shrink-0">
              <Layout className="text-blue-600" size={32} />
              <h1 className="text-3xl font-black tracking-tight uppercase">SDE Tracker</h1>
            </div>

            <div className="flex flex-1 items-center gap-3 w-full justify-end">
              <div className="relative flex-1 max-w-sm group">
                <Search className="absolute left-3 top-2.5 w-4 h-4 opacity-40 group-focus-within:text-blue-500 transition-all" />
                <input 
                  type="text" placeholder="Search A2Z questions..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border-2 outline-none text-xs font-bold transition-all ${
                    darkMode ? 'bg-zinc-900 border-zinc-800 focus:border-blue-500 text-white' : 'bg-white border-slate-200 focus:border-blue-600 text-slate-900'
                  }`}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-rose-500 transition-colors">
                    <XCircle size={18} />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setAllCollapsed(!allCollapsed)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${darkMode ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-white text-slate-500 hover:text-blue-600 shadow-sm'}`}>
                  {allCollapsed ? <ChevronsDown size={14}/> : <ChevronsUp size={14}/>}
                  {allCollapsed ? 'Expand All' : 'Collapse All'}
                </button>
                <button onClick={toggleDarkMode} className="p-3 rounded-xl bg-zinc-800 text-yellow-400 shadow-lg transition-transform active:scale-95">
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={() => setIsTopicModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform">
                  <PlusCircle size={20}/>
                </button>
              </div>
            </div>
          </div>

          {/* New Course Description Section */}
          <div className={`mb-10 p-6 rounded-2xl border-l-4 border-blue-600 leading-relaxed transition-all duration-500 shadow-sm ${
            darkMode ? 'bg-zinc-900/50 text-zinc-400 border-blue-500/50' : 'bg-blue-50/50 text-slate-600'
          }`}>
            <p className="text-sm font-medium italic">
              "This course is made for people who want to learn DSA from A to Z for free in a well-organized and structured manner. 
              The lecture quality is better than what you get in paid courses, the only thing we don’t provide is doubt support, 
              but trust me our YouTube video comments resolve that as well, we have a wonderful community of 250K+ people 
              who engage in all of the videos."
            </p>
          </div>
          
          <div className="w-full h-4 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-visible shadow-inner relative flex gap-0.5">
            {[easy, medium, hard].map((stat, idx) => {
              const colors = ['emerald', 'amber', 'rose'];
              return (
                <div key={idx} className={`h-full relative overflow-visible group cursor-help ${idx === 0 ? 'first:rounded-l-full' : ''} ${idx === 2 ? 'last:rounded-r-full' : ''}`} style={{ width: `${stat.segmentWidth}%` }}>
                  <div className={`absolute inset-0 bg-${colors[idx]}-500/10`} />
                  <div className={`h-full bg-${colors[idx]}-500 transition-all duration-700 ease-out ${idx === 0 ? 'first:rounded-l-full' : ''} ${idx === 2 ? 'last:rounded-r-full' : ''}`} style={{ width: `${stat.fillProgress}%` }} />
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-${colors[idx]}-600 text-white text-[10px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl`}>
                    {stat.remaining} {['EASY', 'MEDIUM', 'HARD'][idx]} LEFT
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-${colors[idx]}-600`} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-3 px-1 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex gap-4">
              <span className="text-emerald-500">Easy: {easy.solved}/{easy.total}</span>
              <span className="text-amber-500">Medium: {medium.solved}/{medium.total}</span>
              <span className="text-rose-500">Hard: {hard.solved}/{hard.total}</span>
            </div>
            <span className="text-blue-600 font-black">{globalPercent}% Complete</span>
          </div>
        </header>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => e.over && moveItem(e.active, e.over)}>
          <SortableContext items={filteredTopics.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-6">
              {filteredTopics.map(topic => (
                <Topic 
                  key={topic.id} topic={topic} 
                  forceCollapse={searchQuery.length > 0 ? false : allCollapsed} 
                />
              ))}
              {filteredTopics.length === 0 && searchQuery.length > 0 && (
                <div className="text-center py-20 opacity-40 font-bold uppercase tracking-widest text-sm">No questions found for "{searchQuery}"</div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button
          onClick={undo}
          className={`p-4 rounded-2xl shadow-2xl transition-all duration-300 border-2 active:scale-90 flex items-center gap-2 group ${history.length === 0 ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'} ${darkMode ? 'bg-zinc-900 border-zinc-800 text-amber-500 hover:border-amber-500' : 'bg-white border-slate-200 text-amber-600 hover:bg-amber-600 hover:text-white'}`}
          title="Undo Last Move (Ctrl+Z)"
        >
          <RotateCcw size={24} strokeWidth={3} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Undo Last Move</span>
        </button>

        <button
          onClick={scrollToTop}
          className={`p-4 rounded-2xl shadow-2xl transition-all duration-300 border-2 active:scale-90 ${showTopBtn ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'} ${darkMode ? 'bg-zinc-900 border-zinc-800 text-blue-500 hover:text-white hover:border-blue-500' : 'bg-white border-slate-200 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
          title="Back to Top"
        >
          <ArrowUp size={24} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}