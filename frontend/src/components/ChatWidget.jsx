import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, X, Send, Minimize2, Mail, Phone, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { trackChatOpen, trackChatStarted, trackLeadCaptured, postLeadToCRM } from '../utils/analytics';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Determine agent mode based on current page
  const getAgentMode = () => {
    const path = location.pathname;
    if (path.includes('/services')) return 'services'; // Matches both /services and /services-solutions
    if (path.includes('/grants')) return 'grants';
    if (path.includes('/contact')) return 'support';
    return 'main';
  };

  // Update greeting message to be more helpful and less sales-focused
  const getGreetingMessage = (mode) => {
    const greetings = {
      main: "👋 Hi! I'm the CCC AI consultant. I can help you with project planning, pricing, technology choices, and EDG funding information. What would you like to know about?",
      services: "Hello! I'm here to explain CCC's technical services and help you choose the right solution for your business. What kind of project are you considering?",
      grants: "Hi! I can help you understand EDG funding opportunities and eligibility requirements. What questions do you have about government support for your project?",
      support: "Hi there! 👋 Welcome to CCC Digital. I can answer questions about our services, pricing, and EDG funding. How can I help you today?"
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

  const handleLeadFormChange = (e) => {
    setLeadFormData({
      ...leadFormData,
      [e.target.name]: e.target.value
    });
  };

  const generateChatSummary = () => {
    if (messages.length === 0) {
      return {
        fullTranscript: "Customer opened chat but did not engage in conversation.",
        summary: "No meaningful conversation occurred."
      };
    }

    // Generate full transcript
    let fullTranscript = "=== COMPLETE CHAT TRANSCRIPT ===\n\n";
    
    messages.forEach((msg, index) => {
      const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sender = msg.role === 'user' ? '👤 Customer' : '🤖 CCC AI';
      fullTranscript += `[${time}] ${sender}: ${msg.content}\n\n`;
    });
    
    fullTranscript += "=== END OF TRANSCRIPT ===\n";
    
    // Generate intelligent summary
    const userMessages = messages.filter(msg => msg.role === 'user');
    const aiMessages = messages.filter(msg => msg.role === 'assistant');
    
    let summary = "=== CONVERSATION SUMMARY ===\n\n";
    
    // Analyze conversation topics
    const topics = [];
    const keywords = {
      'pricing': ['cost', 'price', 'budget', 'expensive', 'cheap', '$'],
      'website': ['website', 'site', 'web'],
      'ecommerce': ['ecommerce', 'e-commerce', 'online store', 'shop', 'product'],
      'webapp': ['web app', 'application', 'pwa', 'progressive'],
      'ai': ['ai', 'artificial intelligence', 'automation', 'chatbot', 'bot'],
      'edg': ['edg', 'grant', 'funding', 'government support'],
      'timeline': ['when', 'timeline', 'deadline', 'urgent', 'asap', 'quickly']
    };
    
    const allUserText = userMessages.map(m => m.content.toLowerCase()).join(' ');
    
    Object.entries(keywords).forEach(([topic, words]) => {
      if (words.some(word => allUserText.includes(word))) {
        topics.push(topic);
      }
    });
    
    // Customer interest analysis
    summary += `**Customer Interest:** ${topics.length > 0 ? topics.join(', ') : 'general inquiry'}\n`;
    summary += `**Conversation Length:** ${userMessages.length} customer messages, ${aiMessages.length} AI responses\n`;
    summary += `**Page Context:** ${location.pathname.includes('services') ? 'Services page' : location.pathname.includes('grants') ? 'Grants page' : 'Homepage'}\n\n`;
    
    // Key points from conversation
    summary += `**Key Discussion Points:**\n`;
    userMessages.slice(0, 5).forEach((msg, i) => {
      summary += `${i + 1}. Customer: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n`;
    });
    
    summary += `\n**Recommended Follow-up:**\n`;
    if (topics.includes('pricing')) summary += '• Provide detailed pricing proposal\n';
    if (topics.includes('edg')) summary += '• Assess EDG eligibility and prepare application support\n';
    if (topics.includes('timeline')) summary += '• Address timeline requirements and project scheduling\n';
    if (topics.includes('website') || topics.includes('ecommerce') || topics.includes('webapp')) {
      summary += '• Prepare technical specification and project scope\n';
    }
    
    summary += `\n=== END OF SUMMARY ===\n\n`;
    
    return {
      fullTranscript,
      summary
    };
  };

  const submitLeadForm = async () => {
    if (!leadFormData.name || !leadFormData.email) {
      toast.error('Please provide your name and email', {
        className: 'bg-[hsl(var(--background))] border-[hsl(var(--border))]'
      });
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const agentMode = getAgentMode();

      // Generate comprehensive message with chat transcript + additional details
      const chatSummary = generateChatSummary();
      const fullMessage = leadFormData.message 
        ? `${chatSummary}\n\n=== ADDITIONAL CUSTOMER DETAILS ===\n${leadFormData.message}`
        : chatSummary;

      await axios.post(`${backendUrl}/api/chat/lead`, {
        ...leadFormData,
        message: fullMessage,
        source_page: location.pathname,
        agent_mode: agentMode
      });

      toast.success('Thank you! We\'ll contact you soon.', {
        description: 'Your details have been sent to our team.',
        className: 'bg-[hsl(var(--background))] border-[hsl(var(--border))]'
      });

      // Add confirmation message to chat
      const confirmationMessage = {
        role: 'assistant',
        content: `Perfect! I've sent your details to our team. ${leadFormData.name}, we'll reach out to you at ${leadFormData.email} shortly to discuss your project. 📧`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmationMessage]);

      // Reset form and hide it
      setLeadFormData({ name: '', email: '', phone: '', message: '' });
      setShowLeadForm(false);

    } catch (error) {
      console.error('Lead submission error:', error);
      toast.error('Failed to submit', {
        description: 'Please try again or contact us directly.',
        className: 'bg-[hsl(var(--background))] border-[hsl(var(--border))]'
      });
    }
  };

  if (!isOpen) {
    const handleChatOpen = () => {
      // Track event using analytics utility
      trackChatOpen('sticky');
      setIsOpen(true);
    };

    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Label */}
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-[#EAECF0] text-sm font-medium text-[#1F2A37] animate-pulse">
          💬 Chat with AI Consultant
        </div>
        
        {/* Chat Button */}
        <button
          onClick={handleChatOpen}
          className="h-14 w-14 rounded-full bg-[hsl(var(--secondary))] text-white shadow-[0_8px_24px_rgba(15,181,174,0.3)] hover:bg-[#0AA099] transition-all duration-200 flex items-center justify-center hover:scale-110"
          data-testid="chat-widget-button"
          aria-label="Chat with AI consultant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
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

            {/* Lead Form */}
            {showLeadForm && (
              <div className="p-4 border-t bg-gradient-to-br from-[#EAF7F5] to-white">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[hsl(var(--secondary))]" />
                  Connect with Our Team
                </h3>
                <p className="text-xs text-[#475467] mb-4">
                  Your chat conversation will be included in the summary sent to our team.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#98A2B3]" />
                    <Input
                      name="name"
                      type="text"
                      placeholder="Your name *"
                      value={leadFormData.name}
                      onChange={handleLeadFormChange}
                      className="flex-1"
                      data-testid="lead-form-name"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#98A2B3]" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Your email *"
                      value={leadFormData.email}
                      onChange={handleLeadFormChange}
                      className="flex-1"
                      data-testid="lead-form-email"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#98A2B3]" />
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="Your phone/WhatsApp *"
                      value={leadFormData.phone}
                      onChange={handleLeadFormChange}
                      className="flex-1"
                      data-testid="lead-form-phone"
                    />
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    💬 Our team will receive this chat conversation plus your contact details.
                  </p>
                  <div className="space-y-2">
                    <Input
                      name="message"
                      type="text"
                      placeholder="Additional details or questions (optional)"
                      value={leadFormData.message}
                      onChange={handleLeadFormChange}
                      className="flex-1"
                      data-testid="lead-form-message"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={submitLeadForm}
                      className="flex-1 bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white"
                      data-testid="lead-form-submit"
                    >
                      Submit
                    </Button>
                    <Button
                      onClick={() => setShowLeadForm(false)}
                      variant="outline"
                      className="border-[hsl(var(--border))]"
                      data-testid="lead-form-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
                  disabled={isLoading || showLeadForm}
                  className="flex-1"
                  data-testid="chat-input"
                />
                {!showLeadForm && (
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white px-4"
                    data-testid="chat-send-button"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {!showLeadForm && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-[#98A2B3]">
                    Powered by CCC AI • {getAgentMode() === 'main' ? 'Main Consultant' : 
                      getAgentMode() === 'services' ? 'Services Expert' : 
                      getAgentMode() === 'grants' ? 'Grants Advisor' : 'Support Agent'}
                  </p>
                  <button
                    onClick={() => setShowLeadForm(true)}
                    className="text-xs text-[hsl(var(--secondary))] hover:text-[#0AA099] font-medium"
                    data-testid="show-lead-form-button"
                  >
                    Connect with us →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatWidget;
