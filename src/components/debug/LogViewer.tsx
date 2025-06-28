import React, { useState, useEffect } from 'react';
import { logger, LogLevel, LogEntry } from '../../services/loggingService';

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogLevel>(LogLevel.DEBUG);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
      
      if (autoRefresh) {
        const interval = setInterval(refreshLogs, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [isOpen, filterLevel, autoRefresh]);

  const refreshLogs = () => {
    const allLogs = logger.getLogs(filterLevel);
    setLogs(allLogs.reverse()); // Show newest first
  };

  const filteredLogs = logs.filter(log => 
    !searchTerm || 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.context?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportLogs = () => {
    const logsJson = logger.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dietwise-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    logger.clearLogs();
    refreshLogs();
  };

  const getLogLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG: return 'text-gray-500';
      case LogLevel.INFO: return 'text-blue-600';
      case LogLevel.WARN: return 'text-yellow-600';
      case LogLevel.ERROR: return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getLogLevelBg = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG: return 'bg-gray-100';
      case LogLevel.INFO: return 'bg-blue-50';
      case LogLevel.WARN: return 'bg-yellow-50';
      case LogLevel.ERROR: return 'bg-red-50';
      default: return 'bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Debug Log Viewer</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b space-y-3">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Level:</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(Number(e.target.value) as LogLevel)}
                className="px-3 py-1 border rounded"
              >
                <option value={LogLevel.DEBUG}>DEBUG+</option>
                <option value={LogLevel.INFO}>INFO+</option>
                <option value={LogLevel.WARN}>WARN+</option>
                <option value={LogLevel.ERROR}>ERROR</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="px-3 py-1 border rounded w-48"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span className="text-sm">Auto refresh</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={refreshLogs}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <i className="fas fa-refresh mr-1"></i>
              Refresh
            </button>
            <button
              onClick={handleExportLogs}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <i className="fas fa-download mr-1"></i>
              Export
            </button>
            <button
              onClick={handleClearLogs}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <i className="fas fa-trash mr-1"></i>
              Clear
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No logs found matching the current filters.
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${getLogLevelBg(log.level)}`}
                  style={{ borderLeftColor: getLogLevelColor(log.level).replace('text-', '') }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-mono ${getLogLevelColor(log.level)}`}>
                          {LogLevel[log.level]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        {log.context && (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {log.context}
                          </span>
                        )}
                        {log.userId && (
                          <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                            User: {log.userId.slice(-8)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium mb-1">{log.message}</div>
                      {log.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer">
                            View data
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-sm text-gray-500">
          Showing {filteredLogs.length} of {logs.length} logs
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </div>
      </div>
    </div>
  );
};