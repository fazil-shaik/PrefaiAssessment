import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './Terminal.css';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'log' | 'error';
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:8000');
      setSocket(newSocket);

      newSocket.on('serverLog', (log: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const type: 'log' | 'error' = log.startsWith('ERROR:') ? 'error' : 'log';
        const message = log.startsWith('ERROR:') ? log.substring(6) : log;
        
        setLogs(prevLogs => {
          const newLogs = [...prevLogs, { timestamp, message, type }];
          // Keep only the last 1000 logs to prevent memory issues
          return newLogs.slice(-1000);
        });
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isOpen) return null;

  return (
    <div className="terminal-overlay">
      <div className="terminal-container">
        <div className="terminal-header">
          <span>Server Logs</span>
          <div className="terminal-controls">
            <button className="clear-button" onClick={clearLogs}>Clear</button>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="terminal-content" ref={terminalRef}>
          {logs.map((log, index) => (
            <div key={index} className={`log-line ${log.type}`}>
              <span className="log-timestamp">[{log.timestamp}]</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="no-logs">No logs available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal; 