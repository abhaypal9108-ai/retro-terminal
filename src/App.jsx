import { useState, useRef, useEffect } from 'react';
import { fetchRoast } from './roastService';
import { playKeyClick } from './audio';
import MatrixRain from './MatrixRain';

export default function App() {
  const [history, setHistory] = useState([
    { text: 'SYSTEM OS v2.0 - BOOT SEQUENCE COMPLETE', type: 'system' },
    { text: 'AI Roast Daemon: ONLINE. Type "roast <code>" or "help".', type: 'system' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Buffer to track user command history for Up/Down arrows
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showMatrix, setShowMatrix] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = async (e) => {
    // Play synthetic tactile click on keystroke
    playKeyClick();

    // 1. Up Arrow: Step backwards in command history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!cmdHistory.length) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex < cmdHistory.length) {
        setHistoryIndex(nextIndex);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIndex]);
      }
      return;
    }

    // 2. Down Arrow: Step forward in command history
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
      return;
    }

    // 3. Enter Key: Execute command
    if (e.key === 'Enter' && !isLoading) {
      const trimmed = inputVal.trim();
      if (!trimmed) return;

      // Add to command history buffer
      setCmdHistory(prev => [...prev, trimmed]);
      setHistoryIndex(-1);

      const nextHistory = [...history, { text: `user@sys:~$ ${trimmed}`, type: 'user' }];
      setHistory(nextHistory);
      setInputVal('');

      const [cmd, ...args] = trimmed.split(' ');
      const command = cmd.toLowerCase();
      const codeArg = args.join(' ');

      switch (command) {
        case 'help':
          setHistory([
            ...nextHistory,
            {
              text: `DIRECTIVES:
  help               - Display available commands
  about              - Identity verification
  clear              - Wipe terminal screen
  roast <code_here>  - Unleash AI daemon on your code
  matrix             - Toggle digital rain simulation`,
              type: 'system'
            }
          ]);
          break;

        case 'about':
          setHistory([
            ...nextHistory,
            {
              text: 'OPERATOR: Abhay Pal\nROLE: CSE Engineer\nSTATUS: Building cool software instead of staring at roadmaps.',
              type: 'system'
            }
          ]);
          break;
        
        case 'matrix':
           setShowMatrix(true);
           setHistory([
           ...nextHistory,
         {
           text: 'WAKING UP THE MATRIX... (Press ESC or click anywhere to exit)',
           type: 'system'
         }
       ]);
         break;

        case 'clear':
          setHistory([]);
          break;

        case 'roast':
          if (!codeArg) {
            setHistory([
              ...nextHistory,
              {
                text: 'SYNTAX ERROR: Missing code snippet.\nUsage: roast for(int i=0; i<n; i++) { ... }',
                type: 'error'
              }
            ]);
            return;
          }

          setIsLoading(true);
          try {
            const roastResponse = await fetchRoast(codeArg);
            setHistory([
              ...nextHistory,
              {
                text: `[DAEMON VERDICT]:\n${roastResponse}`,
                type: 'ai'
              }
            ]);
          } catch (err) {
            setHistory([
              ...nextHistory,
              {
                text: `DAEMON FAILURE: ${err.message}`,
                type: 'error'
              }
            ]);
          } finally {
            setIsLoading(false);
          }
          break;

        default:
          setHistory([
            ...nextHistory,
            {
              text: `Directive not recognized: "${command}". Try "help".`,
              type: 'error'
            }
          ]);
      }
    }
  };

  return (
    <div className="terminal-window" onClick={handleTerminalClick}>
      <div className="history-area">
        {history.map((item, index) => (
          <div 
            key={index} 
            style={{ 
              marginBottom: '10px',
              color: item.type === 'error' 
                ? '#ff4444' 
                : item.type === 'ai' 
                ? '#ffcc00' 
                : '#33ff33' 
            }}
          >
            {item.text}
          </div>
        ))}

        {isLoading && (
          <div style={{ color: '#ffcc00', animation: 'blink 1s infinite' }}>
            [DAEMON IS CRITIQUING YOUR LIFE CHOICES...]
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="input-row">
        <span className="prompt-symbol">user@sys:~$</span>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      {showMatrix && <MatrixRain onExit={() => setShowMatrix(false)} />}
    </div>
  );
}
  
