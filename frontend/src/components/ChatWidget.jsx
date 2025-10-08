import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Determine agent mode based on current page
  const getAgentMode = () => {
    const path = location.pathname;
    if (path.includes('/services')) return 'services';
    if (path.includes('/grants')) return 'grants';
    if (path.includes('/contact')) return 'support';
    return 'main';
  };

  // Get greeting message based on agent mode
  const getGreetingMessage = (mode) => {
    const greetings = {
      main: "Hi there! 👋 Welcome to CCC. I'm your AI consultant. How can I help you with digital transformation today?",
      services: "Hello! I'm here to explain CCC's technical services. What kind of project are you looking to build?",
      grants: "Hi! I can help you understand EDG and SFEC grant opportunities. Would you like to know more about funding options?",
      support: "Hi there! 👋 Welcome to Cognition & Competence Consultancy. How can we support your business today?"
    };
    return greetings[mode] || greetings.main;
  };

  // Initialize chat with greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const agentMode = getAgentMode();
      setMessages([
        {
          role: 'assistant',
          content: getGreetingMessage(agentMode),
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const agentMode = getAgentMode();

      // Prepare conversation history for API
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await axios.post(`${backendUrl}/api/chat`, {
        messages: conversationHistory,
        agent_mode: agentMode
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try contacting us directly at glor-yeo@hotmail.com or call 8500 8888.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[hsl(var(--secondary))] text-white shadow-[0_8px_24px_rgba(15,181,174,0.3)] hover:bg-[#0AA099] transition-all duration-200 flex items-center justify-center hover:scale-110"
        data-testid="chat-widget-button"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col"
      style={{ width: '384px', height: isMinimized ? 'auto' : '600px', maxHeight: '80vh' }}
      data-testid="chat-widget"
    >
      <Card className="flex flex-col h-full shadow-[0_12px_40px_rgba(16,24,40,0.15)] border-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[hsl(var(--primary))] text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">CCC AI Consultant</h3>
              <p className="text-xs opacity-90">Online • Typically replies instantly</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-white/10 p-1.5 rounded transition-colors"
              aria-label="Minimize chat"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1.5 rounded transition-colors"
              data-testid="chat-widget-close"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-[hsl(var(--secondary))] text-white'
                        : 'bg-white text-[#1F2A37] shadow-sm border border-[#EAECF0]'
                    }`}
                    data-testid={`chat-message-${msg.role}`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-xs mt-1 block ${
                      msg.role === 'user' ? 'text-white/70' : 'text-[#98A2B3]'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-[#1F2A37] rounded-lg px-4 py-2.5 shadow-sm border border-[#EAECF0]">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--secondary))] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--secondary))] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--secondary))] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                  data-testid="chat-input"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white px-4"
                  data-testid="chat-send-button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-[#98A2B3] mt-2 text-center">
                Powered by CCC AI • {getAgentMode() === 'main' ? 'Main Consultant' : 
                  getAgentMode() === 'services' ? 'Services Expert' : 
                  getAgentMode() === 'grants' ? 'Grants Advisor' : 'Support Agent'}
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatWidget;
