import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ActionModal({ isOpen, onClose, onSubmit, title, darkMode, type, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: "",
    difficulty: "Medium",
    url: "",
    video: ""
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData.name || "",
        difficulty: initialData.difficulty || "Medium",
        url: initialData.url || "",
        video: initialData.video || ""
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Helper function to ensure URLs are absolute
  const ensureAbsoluteUrl = (url) => {
    if (!url || url.trim() === "" || url === "#") return url;
    // Check if the URL already starts with http:// or https://
    const hasProtocol = /^https?:\/\//i.test(url);
    return hasProtocol ? url : `https://${url}`;
  };

  const handleAction = () => {
    if (formData.name.trim()) {
      // Format the URLs before submitting
      const formattedData = {
        ...formData,
        url: ensureAbsoluteUrl(formData.url),
        video: ensureAbsoluteUrl(formData.video)
      };

      onSubmit(formattedData);
      onClose();
    }
  };

  const isQuestionType = type === 'addQ' || type === 'editQ';
  const isNoteType = type === 'note';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl border transition-all ${
        darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-inherit">
          <h3 className="text-sm font-black uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase opacity-50 ml-1">
              {isNoteType ? "Notes Content" : "Title"}
            </label>
            
            {isNoteType ? (
              <textarea
                autoFocus
                rows={4}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your notes here..."
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none font-medium resize-none overflow-y-auto ${
                  darkMode 
                    ? 'bg-zinc-950 border-zinc-800 focus:border-white text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-black text-black'
                }`}
              />
            ) : (
              <input
                autoFocus
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-4 py-2 rounded-xl border-2 outline-none font-bold ${
                  darkMode ? 'bg-zinc-950 border-zinc-800 focus:border-white' : 'bg-slate-50 border-slate-200 focus:border-black'
                }`}
              />
            )}
          </div>

          {isQuestionType && (
            <>
              <div>
                <label className="text-[10px] font-bold uppercase opacity-50 ml-1">Difficulty</label>
                <select 
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className={`w-full px-4 py-2 rounded-xl border-2 outline-none font-bold ${
                    darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-50 ml-1">Problem URL</label>
                  <input
                    type="text"
                    value={formData.url}
                    placeholder="e.g. google.com"
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className={`w-full px-4 py-2 rounded-xl border-2 outline-none text-xs font-bold ${
                      darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-50 ml-1">YouTube URL</label>
                  <input
                    type="text"
                    value={formData.video}
                    placeholder="e.g. youtube.com/..."
                    onChange={(e) => setFormData({...formData, video: e.target.value})}
                    className={`w-full px-4 py-2 rounded-xl border-2 outline-none text-xs font-bold ${
                      darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 p-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 font-bold text-xs uppercase opacity-50">Cancel</button>
          <button onClick={handleAction} className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
            darkMode ? 'bg-white text-black' : 'bg-black text-white'
          }`}>Confirm</button>
        </div>
      </div>
    </div>
  );
}