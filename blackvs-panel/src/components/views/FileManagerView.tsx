import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  Edit3,
  Key,
  Search,
  ChevronRight,
  ArrowUp,
  Save,
  X,
  FileArchive,
  Eye,
  Check,
} from 'lucide-react';
import { FileItem } from '../../types';

export const FileManagerView: React.FC = () => {
  const {
    files,
    currentPath,
    setCurrentPath,
    addFile,
    updateFileContent,
    deleteFile,
    addToast,
  } = useApp();

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editorFile, setEditorFile] = useState<FileItem | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showChmodModal, setShowChmodModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [chmodValue, setChmodValue] = useState('0644');
  const [isUploading, setIsUploading] = useState(false);

  // Files in current path
  const currentFiles = files.filter((f) => {
    // If the file's path is directly inside currentPath
    const isUnderPath = f.path.startsWith(currentPath) && f.path !== currentPath;
    const relative = f.path.substring(currentPath.length).replace(/^\//, '');
    const isDirectChild = !relative.includes('/') || (f.isDir && !relative.replace(/\/$/, '').includes('/'));
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return isUnderPath && isDirectChild && matchesSearch;
  });

  // Breadcrumbs
  const pathParts = currentPath.split('/').filter(Boolean);

  const handleOpenFolder = (path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const handleGoUp = () => {
    if (currentPath === '/home/blackvs') return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf('/'));
    setCurrentPath(parent || '/home/blackvs');
    setSelectedFile(null);
  };

  const handleOpenFileEditor = (file: FileItem) => {
    if (file.isDir) {
      handleOpenFolder(file.path);
      return;
    }
    setEditorFile(file);
    setEditorContent(file.content || `/* File: ${file.name} */\n\n// Content loaded for ${file.path}\n`);
  };

  const handleSaveEditor = () => {
    if (editorFile) {
      updateFileContent(editorFile.id, editorContent);
      setEditorFile(null);
    }
  };

  const handleDownload = (file: FileItem) => {
    const blob = new Blob([file.content || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({
      title: 'Download Started',
      message: `Exported ${file.name}`,
      type: 'info',
    });
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const ext = newFileName.includes('.') ? newFileName.split('.').pop() : 'txt';
    addFile({
      name: newFileName.trim(),
      path: `${currentPath}/${newFileName.trim()}`,
      isDir: false,
      size: 0,
      sizeFormatted: '0 B',
      modified: new Date().toISOString().replace('T', ' ').substring(0, 16),
      permissions: '0644',
      extension: ext,
      content: `# ${newFileName}\nCreated at ${new Date().toISOString()}\n`,
    });
    setNewFileName('');
    setShowNewFileModal(false);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    addFile({
      name: newFolderName.trim(),
      path: `${currentPath}/${newFolderName.trim()}`,
      isDir: true,
      size: 4096,
      sizeFormatted: '4.0 KB',
      modified: new Date().toISOString().replace('T', ' ').substring(0, 16),
      permissions: '0755',
    });
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const handleSimulatedUpload = (filename: string) => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setShowUploadModal(false);
      const ext = filename.includes('.') ? filename.split('.').pop() : 'txt';
      addFile({
        name: filename,
        path: `${currentPath}/${filename}`,
        isDir: false,
        size: 14200,
        sizeFormatted: '14.2 KB',
        modified: new Date().toISOString().replace('T', ' ').substring(0, 16),
        permissions: '0644',
        extension: ext,
        content: `// Uploaded asset: ${filename}\n// Checksum: SHA256 validated\n`,
      });
    }, 1000);
  };

  const handleSaveChmod = () => {
    if (selectedFile) {
      selectedFile.permissions = chmodValue;
      setShowChmodModal(false);
      addToast({
        title: 'Permissions Updated',
        message: `chmod ${chmodValue} on ${selectedFile.name}`,
        type: 'success',
      });
    }
  };

  const getFileIcon = (file: FileItem) => {
    if (file.isDir) return <Folder className="w-4 h-4 text-neutral-300" />;
    switch (file.extension) {
      case 'php':
      case 'js':
      case 'ts':
      case 'json':
      case 'html':
      case 'css':
        return <FileCode className="w-4 h-4 text-neutral-300" />;
      case 'gz':
      case 'zip':
      case 'tar':
        return <FileArchive className="w-4 h-4 text-neutral-400" />;
      default:
        return <FileText className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            File Manager
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            UNIX virtual filesystem browser, permissions, and code editor
          </p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowNewFileModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New File</span>
          </button>
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Path Breadcrumbs & Search */}
      <div className="glass-panel rounded-2xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono text-neutral-400 py-1">
          <button
            onClick={handleGoUp}
            disabled={currentPath === '/home/blackvs'}
            className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 mr-1"
            title="Go to parent directory"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <span
            onClick={() => setCurrentPath('/home/blackvs')}
            className="hover:text-white cursor-pointer px-1 rounded hover:bg-white/5"
          >
            root
          </span>

          {pathParts.map((part, index) => {
            const subPath = '/' + pathParts.slice(0, index + 1).join('/');
            const isLast = index === pathParts.length - 1;
            return (
              <React.Fragment key={subPath}>
                <ChevronRight className="w-3 h-3 text-neutral-600 shrink-0" />
                <span
                  onClick={() => setCurrentPath(subPath)}
                  className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors ${
                    isLast
                      ? 'text-white font-semibold bg-white/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {part}
                </span>
              </React.Fragment>
            );
          })}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search current folder..."
            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-white/20 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder:text-neutral-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main File Browser Area: Left Folder Tree + Right File List + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Folder Hierarchy Shortcuts */}
        <div className="glass-panel rounded-2xl p-3 space-y-1 hidden lg:block">
          <div className="px-2 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Directories
          </div>
          {[
            { name: 'public_html (Primary Web Root)', path: '/home/blackvs/public_html' },
            { name: 'api_root (Node.js API)', path: '/home/blackvs/api_root' },
            { name: 'ssl_certs (TLS Certificates)', path: '/home/blackvs/ssl_certs' },
            { name: 'backups (Snapshots)', path: '/home/blackvs/backups' },
            { name: 'appcraft_store (E-Commerce)', path: '/home/blackvs/sites/appcraft_store' },
            { name: 'staging_preview (Staging)', path: '/home/blackvs/staging_preview' },
          ].map((dir) => {
            const isCurrent = currentPath === dir.path;
            return (
              <button
                key={dir.path}
                onClick={() => {
                  setCurrentPath(dir.path);
                  setSelectedFile(null);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left text-xs transition-colors ${
                  isCurrent
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                }`}
              >
                <Folder className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                <span className="truncate">{dir.name}</span>
              </button>
            );
          })}
        </div>

        {/* File Table */}
        <div className="lg:col-span-3 glass-panel rounded-2xl overflow-hidden border border-white/[0.08] flex flex-col justify-between">
          <div className="overflow-x-auto min-h-[360px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4 text-right">Size</th>
                  <th className="py-2.5 px-4">Permissions</th>
                  <th className="py-2.5 px-4">Last Modified</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs font-mono">
                {currentFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-neutral-500 font-sans">
                      This folder is empty. Upload files or create a new file above.
                    </td>
                  </tr>
                ) : (
                  currentFiles.map((file) => {
                    const isSelected = selectedFile?.id === file.id;
                    return (
                      <tr
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        onDoubleClick={() => handleOpenFileEditor(file)}
                        className={`cursor-pointer transition-colors group ${
                          isSelected ? 'bg-white/10' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <td className="py-2.5 px-4 font-sans font-medium text-white flex items-center gap-2.5">
                          {getFileIcon(file)}
                          <span className="truncate max-w-[240px]">{file.name}</span>
                        </td>

                        <td className="py-2.5 px-4 text-right tabular-nums text-neutral-400">
                          {file.isDir ? '—' : file.sizeFormatted}
                        </td>

                        <td className="py-2.5 px-4 text-neutral-400">{file.permissions}</td>

                        <td className="py-2.5 px-4 text-neutral-400 tabular-nums">
                          {file.modified}
                        </td>

                        <td className="py-2.5 px-4 text-right font-sans">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {!file.isDir && (
                              <>
                                <button
                                  onClick={() => handleOpenFileEditor(file)}
                                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10"
                                  title="Edit in Code Editor"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDownload(file)}
                                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10"
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedFile(file);
                                setChmodValue(file.permissions);
                                setShowChmodModal(true);
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10"
                              title="Change Permissions (chmod)"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteFile(file.id)}
                              className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Delete File"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Selected File Info Bar */}
          <div className="px-4 py-2 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between text-[11px] text-neutral-400">
            <div>
              {selectedFile ? (
                <span>
                  Selected: <span className="font-mono text-white">{selectedFile.name}</span> ({selectedFile.permissions})
                </span>
              ) : (
                <span>{currentFiles.length} item(s) in this folder</span>
              )}
            </div>
            <div className="font-mono">ext4 / 4096 sector</div>
          </div>
        </div>
      </div>

      {/* Code Editor Modal */}
      {editorFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl h-[85vh] rounded-2xl glass-dropdown border border-white/15 flex flex-col overflow-hidden animate-in zoom-in-95 shadow-2xl">
            {/* Editor Top Bar */}
            <div className="h-12 px-4 border-b border-white/10 bg-neutral-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="w-4 h-4 text-white" />
                <span className="text-xs font-semibold text-white font-mono">{editorFile.name}</span>
                <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
                  {editorFile.path}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditorFile(null)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveEditor}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            {/* Code Textarea with line numbers */}
            <div className="flex-1 flex overflow-hidden bg-[#0d0d10] font-mono text-xs text-neutral-200">
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Editor Footer */}
            <div className="h-8 px-4 border-t border-white/10 bg-neutral-950 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span>Lines: {editorContent.split('\n').length} · UTF-8 · UNIX (LF)</span>
              <span>BlackVs Code Editor</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Upload Files to {pathParts[pathParts.length - 1] || 'root'}</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div
              className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white/[0.02]"
              onClick={() => handleSimulatedUpload('app-bundle-v2.js')}
            >
              <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
              <div className="text-xs font-medium text-white mb-1">
                Drag and drop files here, or click to browse
              </div>
              <p className="text-[11px] text-neutral-500">
                Max file size: 512 MB. Supported: zip, tar.gz, php, html, css, js, json, png, jpg
              </p>
            </div>

            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Uploading stream...</span>
                  <span className="font-mono">82%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[82%] animate-pulse" />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreateFile}
            className="w-full max-w-sm rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4"
          >
            <h3 className="text-sm font-semibold text-white">Create New File</h3>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">File Name</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. style.css, server.js"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewFileModal(false)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreateFolder}
            className="w-full max-w-sm rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4"
          >
            <h3 className="text-sm font-semibold text-white">Create New Directory</h3>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Folder Name</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. assets, components"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Permissions (chmod) Modal */}
      {showChmodModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold text-white">Change Permissions (chmod)</h3>
            <p className="text-xs text-neutral-400">
              Target: <span className="font-mono text-white">{selectedFile.name}</span>
            </p>

            <div className="space-y-2">
              <label className="block text-xs text-neutral-400">Numeric Notation (Octal)</label>
              <div className="grid grid-cols-3 gap-2">
                {['0644', '0755', '0700'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setChmodValue(val)}
                    className={`py-2 rounded-xl text-xs font-mono border ${
                      chmodValue === val
                        ? 'border-white bg-white/15 text-white font-semibold'
                        : 'border-white/10 text-neutral-400 hover:bg-white/5'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowChmodModal(false)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChmod}
                className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl"
              >
                Apply chmod
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
