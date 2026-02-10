import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';

export const useStore = create((set) => ({
  topics: [],
  history: [], // Stack to store previous states for the Undo feature
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setTopics: (topics) => set({ topics }),

  // Helper to save current state to history before a change
  saveHistory: (state) => {
    // We limit history to the last 20 moves to keep memory usage low
    const newHistory = [...state.history, JSON.parse(JSON.stringify(state.topics))].slice(-20);
    return { history: newHistory };
  },

  // Undo Function: Reverts to the last saved state
  undo: () => set((state) => {
    if (state.history.length === 0) return state;
    const previousTopics = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);
    return { topics: previousTopics, history: newHistory };
  }),

  // Logic to move items across different topics or sub-topics
  moveItem: (active, over) => set((state) => {
    // 1. Save snapshot for Undo
    const historyState = [...state.history, JSON.parse(JSON.stringify(state.topics))].slice(-20);
    
    const topics = JSON.parse(JSON.stringify(state.topics));
    const activeData = active.data.current;
    const overData = over.data.current;

    let updatedTopics = topics;

    if (activeData.type === 'topic') {
      const oldIndex = topics.findIndex(t => t.id === active.id);
      const newIndex = topics.findIndex(t => t.id === over.id);
      updatedTopics = arrayMove(topics, oldIndex, newIndex);
    } else if (activeData.type === 'subtopic') {
      const sourceTopic = topics.find(t => t.id === activeData.parentId);
      const destTopicId = overData.type === 'topic' ? over.id : overData.parentId;
      const destTopic = topics.find(t => t.id === destTopicId);
      
      const activeIndex = sourceTopic.subTopics.findIndex(s => s.id === active.id);
      const [movedSub] = sourceTopic.subTopics.splice(activeIndex, 1);
      
      const overIndex = destTopic.subTopics.findIndex(s => s.id === over.id);
      if (overIndex >= 0) destTopic.subTopics.splice(overIndex, 0, movedSub);
      else destTopic.subTopics.push(movedSub);
      updatedTopics = topics;
    } else if (activeData.type === 'question') {
      const findSubAndTopic = (subId) => {
        for (let t of topics) {
          const s = t.subTopics.find(sub => sub.id === subId);
          if (s) return { sub: s, topicId: t.id };
        }
      };

      const source = findSubAndTopic(activeData.parentId);
      const destSubId = overData.type === 'subtopic' ? over.id : overData.parentId;
      const dest = findSubAndTopic(destSubId);

      const activeIndex = source.sub.questions.findIndex(q => q.id === active.id);
      const [movedQ] = source.sub.questions.splice(activeIndex, 1);

      const overIndex = dest.sub.questions.findIndex(q => q.id === over.id);
      if (overIndex >= 0) dest.sub.questions.splice(overIndex, 0, movedQ);
      else dest.sub.questions.push(movedQ);
      updatedTopics = topics;
    }

    return { topics: updatedTopics, history: historyState };
  }),

  // CRUD for Topics
  addTopic: (name) => set((state) => ({ 
    topics: [...state.topics, { id: `t-${Date.now()}`, name, subTopics: [] }] 
  })),
  editTopic: (id, name) => set((state) => ({
    topics: state.topics.map(t => t.id === id ? { ...t, name } : t)
  })),
  deleteTopic: (id) => set((state) => ({
    topics: state.topics.filter(t => t.id !== id)
  })),

  // CRUD for Sub-topics
  addSubTopic: (topicId, name) => set((state) => ({
    topics: state.topics.map(t => t.id === topicId ? { 
      ...t, 
      subTopics: [...t.subTopics, { id: `st-${Date.now()}`, name, questions: [] }] 
    } : t)
  })),
  editSubTopic: (topicId, subId, name) => set((state) => ({
    topics: state.topics.map(t => t.id === topicId ? {
      ...t, subTopics: t.subTopics.map(s => s.id === subId ? { ...s, name } : s)
    } : t)
  })),
  deleteSubTopic: (topicId, subId) => set((state) => ({
    topics: state.topics.map(t => t.id === topicId ? {
      ...t, subTopics: t.subTopics.filter(s => s.id !== subId)
    } : t)
  })),

  addQuestion: (topicId, subId, data) => set((state) => ({
    topics: state.topics.map(t => t.id === topicId ? {
      ...t,
      subTopics: t.subTopics.map(s => s.id === subId ? {
        ...s,
        questions: [...s.questions, { 
          id: `q-${Date.now()}`, 
          name: data.name, 
          difficulty: data.difficulty || "Medium", 
          url: data.url || "#", 
          video: data.video || "", 
          notes: "", 
          isSolved: false 
        }]
      } : s)
    } : t)
  })),

  editQuestion: (topicId, subId, qId, data) => set((state) => ({
    topics: state.topics.map(t => t.id === topicId ? {
      ...t,
      subTopics: t.subTopics.map(s => s.id === subId ? {
        ...s,
        questions: s.questions.map(q => q.id === qId ? { 
          ...q, 
          name: data.name,
          difficulty: data.difficulty,
          url: data.url,
          video: data.video
        } : q)
      } : s)
    } : t)
  })),

  deleteQuestion: (topicId, subId, qId) => set((state) => ({
    topics: state.topics.map(t => t.id === topicId ? {
      ...t,
      subTopics: t.subTopics.map(s => s.id === subId ? {
        ...s,
        questions: s.questions.filter(q => q.id !== qId)
      } : s)
    } : t)
  })),

  updateNote: (topicId, subId, qId, note) => set((state) => ({
    topics: state.topics.map(t => t.id === topicId ? {
      ...t,
      subTopics: t.subTopics.map(s => s.id === subId ? {
        ...s,
        questions: s.questions.map(q => q.id === qId ? { ...q, notes: note } : q)
      } : s)
    } : t)
  })),
  toggleSolved: (topicId, subId, qId) => set((state) => ({
    topics: state.topics.map(t => t.id === topicId ? {
      ...t,
      subTopics: t.subTopics.map(s => s.id === subId ? {
        ...s,
        questions: s.questions.map(q => q.id === qId ? { ...q, isSolved: !q.isSolved } : q)
      } : s)
    } : t)
  })),
}));