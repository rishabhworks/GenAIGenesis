import React, { useState, useRef, useEffect } from 'react';
import { chatbotAPI } from '../services/apiService';
import './ChatBot.css';

// Simple markdown to HTML converter
const parseMarkdown = (text) => {
  if (!text) return text;
  
  // Split by lines and format
  let html = text
    .split('\n')
    .map(line => {
      // Headers
      if (line.startsWith('### ')) {
        return `<h3>${line.replace('### ', '')}</h3>`;
      }
      if (line.startsWith('## ')) {
        return `<h2>${line.replace('## ', '')}</h2>`;
      }
      if (line.startsWith('# ')) {
        return `<h1>${line.replace('# ', '')}</h1>`;
      }
      // Bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        return `<strong>${line.replace(/\*\*/g, '')}</strong>`;
      }
      // Bullet points
      if (line.startsWith('*')) {
        return `<li>${line.substring(1).trim()}</li>`;
      }
      // Numbered lists
      if (line.match(/^\d+\./)) {
        return `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
      }
      // Horizontal lines
      if (line === '---' || line === '***') {
        return '<hr />';
      }
      return line;
    })
    .join('\n');
  
  // Wrap consecutive list items in <ul>
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  
  return html;
};

export default function ChatBot({ workerId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your WiseWorks job matching assistant. Ask me about jobs that match your skills, or let me help you find opportunities!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotAPI.ask(workerId, input);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.bot_response || response.message || 'No response received',
        timestamp: new Date(),
        source: response.source,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Error: ${error.response?.data?.detail || error.message}`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>💬 Job Matching Assistant</h2>
        <p>Worker ID: {workerId}</p>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.type}`}>
            <div className={`message-content ${msg.isError ? 'error' : ''}`}>
              {msg.type === 'bot' && msg.content.includes('**') ? (
                <div 
                  className="formatted-message"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                />
              ) : (
                msg.content
              )}
            </div>
            {msg.source && (
              <div className="message-source">Source: {msg.source}</div>
            )}
            <div className="message-time">
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="message-content typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about jobs, your skills, or job market insights..."
          disabled={loading}
          className="message-input"
        />
        <button type="submit" disabled={loading} className="send-button">
          {loading ? '⏳' : '➤'}
        </button>
      </form>

      <div className="chat-suggestions">
        <p className="suggestions-label">Try asking:</p>
        <div className="suggestion-buttons">
          <button
            onClick={() => setInput('What electrician jobs match my skills?')}
            className="suggestion-btn"
          >
            Electrician jobs
          </button>
          <button
            onClick={() => setInput('Show me plumber positions in Toronto')}
            className="suggestion-btn"
          >
            Plumber positions
          </button>
          <button
            onClick={() => setInput('What jobs can I do with my HVAC certification?')}
            className="suggestion-btn"
          >
            HVAC jobs
          </button>
        </div>
      </div>
    </div>
  );
}
