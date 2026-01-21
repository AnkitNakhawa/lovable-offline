'use client';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  // State
  const [projects, setProjects] = useState<string[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Preview State
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'logs'>('preview');
  const [logs, setLogs] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [previewUrl, setPreviewUrl] = useState('http://localhost:3000');
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Projects
  useEffect(() => {
    fetch('/api/projects').then(res => res.json()).then(data => setProjects(data.projects || []));
  }, [loading]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load files when project changes
  useEffect(() => {
    if (activeProject) {
      fetchFiles();
      // Default to a useful file
      setActiveFile(null);
    }
  }, [activeProject]);

  // Load file content when file changes
  useEffect(() => {
    if (activeProject && activeFile) {
      fetch('/api/files', {
        method: 'POST',
        body: JSON.stringify({ project: activeProject, filePath: activeFile })
      }).then(res => res.json()).then(data => {
        if (data.content) setFileContent(data.content);
      });
    }
  }, [activeProject, activeFile]);

  // Poll logs
  useEffect(() => {
    if (activeTab === 'logs' || running) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch('/api/status');
          const data = await res.json();
          if (data.logs) setLogs(data.logs);
        } catch (e) { }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTab, running]);

  const deleteProject = async (p: string) => {
    try {
      await fetch('/api/projects/delete', { method: 'POST', body: JSON.stringify({ project: p }) });
      setProjects(prev => prev.filter(x => x !== p));
      if (activeProject === p) setActiveProject(null);
      setProjectToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFiles = async () => {
    if (!activeProject) return;
    const res = await fetch('/api/files', {
      method: 'POST',
      body: JSON.stringify({ project: activeProject })
    });
    const data = await res.json();
    if (data.files) setFiles(data.files);
  };

  const runProject = async () => {
    if (!activeProject) return;
    setRunning(true);
    setStatusMsg('Initializing...');
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        body: JSON.stringify({ project: activeProject })
      });
      const data = await res.json();
      setStatusMsg(data.message);

      // Auto-reload iframe after estimated delay
      setTimeout(() => {
        const i = document.getElementById('preview-frame') as HTMLIFrameElement;
        if (i) i.src = previewUrl;
        setStatusMsg('');
        setRunning(false);
      }, data.estimatedTimeMs);
    } catch (e) {
      setStatusMsg('Error starting');
      setRunning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      let res;
      if (activeProject) {
        res = await fetch('/api/edit', {
          method: 'POST',
          body: JSON.stringify({ prompt: userMsg, projectName: activeProject })
        });
      } else {
        res = await fetch('/api/create', {
          method: 'POST',
          body: JSON.stringify({ prompt: userMsg })
        });
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.project) {
        if (!activeProject) {
          setActiveProject(data.project);
          setMessages(prev => [...prev, { role: 'assistant', content: `Created "${data.project}"! I've opened the code for you.` }]);
          setActiveTab('code');
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: `Updated "${data.project}".` }]);
          // Refresh files
          fetchFiles();
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">

      {/* LEFT SIDEBAR: CHAT */}
      <div className="w-[400px] flex flex-col border-r border-gray-800 bg-gray-900">
        {/* Header / Project Switcher */}
        <div className="h-14 border-b border-gray-800 flex items-center px-4 justify-between bg-gray-900">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="font-semibold text-gray-200 flex items-center gap-2 hover:text-white transition"
            >
              {activeProject ? activeProject : 'Select Project'}
              <span className="text-[10px] text-gray-400">▼</span>
            </button>
            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                <button
                  onClick={() => { setActiveProject(null); setMessages([]); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-600 text-blue-400 hover:text-white border-b border-gray-700"
                >
                  + New Project
                </button>
                <div className="max-h-60 overflow-y-auto">
                  {projects.map(p => (
                    <div key={p} className="flex items-center hover:bg-gray-700 w-full group/item px-0">
                      {projectToDelete === p ? (
                        <div className="flex items-center w-full px-4 py-2 bg-red-900/30 gap-2">
                          <span className="text-xs text-red-300 flex-1">Delete?</span>
                          <button onClick={(e) => { e.stopPropagation(); deleteProject(p); }} className="text-xs text-red-400 font-bold hover:text-white uppercase">Yes</button>
                          <button onClick={(e) => { e.stopPropagation(); setProjectToDelete(null); }} className="text-xs text-gray-400 hover:text-white uppercase">No</button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => { setActiveProject(p); setMessages([]); setIsDropdownOpen(false); }}
                            className="flex-1 text-left px-4 py-2 text-gray-300 truncate"
                          >
                            {p}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setProjectToDelete(p); }}
                            className="px-3 py-2 text-gray-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            title="Delete Project"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">Lovable Offline</div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
          {messages.length === 0 && (
            <div className="mt-10 text-center text-gray-600">
              <p>Start chatting to build your app.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-700 text-gray-400 text-sm animate-pulse">
                Generating...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={activeProject ? "How can I update this app?" : "Describe your app..."}
              className="w-full bg-gray-800 text-white p-3 pr-12 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-sm"
              rows={3}
              disabled={loading}
            />
            <button
              type="submit"
              className="absolute bottom-3 right-3 p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE: PREVIEW / CODE */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {/* Toolbar */}
        <div className="h-14 border-b border-gray-800 flex items-center px-4 justify-between bg-gray-950">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'preview' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'code' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Code
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'logs' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Logs
            </button>

          </div>

          {activeTab === 'preview' && (
            <div className="flex items-center gap-2">
              <button
                onClick={runProject}
                disabled={running || !activeProject}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors font-medium"
              >
                {running ? '⏳' : '▶'} Run
              </button>
              {statusMsg && <span className="text-xs text-yellow-400 animate-pulse hidden md:block">{statusMsg}</span>}

              <input
                value={previewUrl}
                onChange={e => setPreviewUrl(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-2 py-1.5 rounded w-64 focus:border-blue-500 outline-none"
              />
              <button onClick={() => { const i = document.getElementById('preview-frame') as HTMLIFrameElement; if (i) i.src = previewUrl; }} className="text-gray-400 hover:text-white">
                🔄
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'preview' ? (
            <div className="w-full h-full bg-white">
              <iframe
                id="preview-frame"
                src={previewUrl}
                className="w-full h-full border-none"
                title="Preview"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 text-gray-400 text-xs p-2 text-center border-t border-gray-800 pointer-events-none">
                To activate preview: <span className="font-mono text-gray-200 select-all pointer-events-auto">cd workspaces/{activeProject || 'project'} && npm install && npm run dev</span>
              </div>
              {!activeProject && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-500">
                  Select a project to view preview
                </div>
              )}
            </div>
          ) : activeTab === 'logs' ? (
            <div className="flex-1 bg-[#1e1e1e] p-4 overflow-auto font-mono text-xs text-gray-300 h-full">
              <div className="mb-2 text-gray-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 bg-[#1e1e1e/90]">Server Logs</div>
              {logs.length === 0 && <div className="text-gray-600 italic">No logs yet. Click Run to start...</div>}
              {logs.map((log, i) => <div key={i} className="whitespace-pre-wrap border-l-2 border-transparent hover:border-blue-500 pl-1">{log}</div>)}
            </div>
          ) : (
            <div className="flex h-full">
              {/* File Tree */}
              <div className="w-64 border-r border-gray-800 overflow-y-auto bg-gray-950 p-2">
                {files.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFile(f)}
                    className={`block w-full text-left px-3 py-1.5 text-xs rounded truncate mb-0.5 ${activeFile === f ? 'bg-blue-900/30 text-blue-300' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-300'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {/* Code Editor */}
              <div className="flex-1 overflow-auto bg-[#1e1e1e]">
                {activeFile ? (
                  <pre className="p-4 text-xs font-mono text-gray-300 leading-relaxed">
                    <code>{fileContent}</code>
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 text-sm">Select a file to view source</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}
