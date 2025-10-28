import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  MessageCircle, 
  ArrowLeft, 
  Send, 
  GraduationCap,
  Brain,
  Smartphone,
  Target,
  X,
  ExternalLink
} from 'lucide-react';

const TuitionCentreDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);  // Add input ref for focus management

  // External backend URL
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://tutor-chat-scroll.preview.emergentagent.com';

  // Initialize demo
  useEffect(() => {
    if (isOpen && !sessionId) {
      setSessionId(Date.now().toString());
      setMessages([{
        id: 'welcome',
        text: 'Hi! I am your Tuition Centre AI Assistant Demo. I can help you with course information, pricing, schedules, and enrollment inquiries. Try asking about P6 Math classes or 2026 holidays!',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const cleanText = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\\r\\n/g, '\\n').replace(/\\r/g, '\\n').trim();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      text: cleanText(inputMessage),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Keep focus on input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/tuition/chat`, {
        message: cleanText(inputMessage),
        session_id: sessionId,
        user_type: 'demo_visitor'
      });

      const botMsg = {
        id: response.data.message_id || Date.now().toString(),
        text: cleanText(response.data.response || 'Sorry, I encountered an issue.'),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = {
        id: 'error-' + Date.now(),
        text: 'Demo connection issue. This chatbot connects to our live demo backend. Please try again.',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      // Refocus input after loading completes
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    "What courses do you offer?",
    "P6 Math pricing at Marine Parade?",
    "2026 holiday schedule?",
    "S3 AMath classes?"
  ];

  const demoFeatures = [
    {
      icon: GraduationCap,
      title: 'Complete Course Info',
      description: 'Accurate pricing, schedules, tutors for all levels (P2-P6, S1-S4, J1-J2)',
      color: 'from-[#667eea] to-[#764ba2]'
    },
    {
      icon: Brain,
      title: 'Smart Conversations',
      description: 'Context-aware responses, no information dumping, helpful clarification',
      color: 'from-[#f093fb] to-[#f5576c]'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Professional formatting with emojis, line breaks, mobile-friendly',
      color: 'from-[#4facfe] to-[#00f2fe]'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#f093fb]">
      {/* Header with CCC Branding */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_smartbiz-portal/artifacts/p67oqb1l_Screenshot%202025-10-11%20at%204.38.29%20PM.png" 
                alt="CCC Logo" 
                className="h-6 sm:h-8 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  Tuition Centre AI Demo
                </h1>
                <p className="text-xs sm:text-sm text-white/80 font-medium">
                  CCC Digital - Education Industry Chatbot
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button asChild variant="outline" className="flex-1 sm:flex-initial border-white/30 text-white hover:bg-white hover:text-[#f5576c] text-xs sm:text-sm">
                <a href="/demos">
                  <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Back
                </a>
              </Button>
              <Button asChild className="flex-1 sm:flex-initial bg-white text-[#f5576c] hover:bg-white/90 font-medium text-xs sm:text-sm">
                <a href="/contact">
                  Get Your Chatbot
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Demo Introduction */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="ai-badge mb-4 sm:mb-6 text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3">
            <Target className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Live Demo
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 tracking-tight px-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Tuition Centre <span className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] bg-clip-text text-transparent">AI Assistant</span>
          </h2>
          <div className="glass-card p-6 sm:p-8 max-w-4xl mx-auto border border-white/20">
            <p className="text-base sm:text-xl text-white/90 leading-relaxed">
              Experience how an AI chatbot transforms tuition centre operations. 
              This demo shows real functionality with 2026 Singapore tuition center data.
            </p>
          </div>
        </motion.div>

        {/* Demo Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
          {demoFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="ai-card p-6 sm:p-8 text-center h-full bg-white/20 backdrop-blur-md border border-white/30">
                <div 
                  className={`h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mx-auto mb-3 sm:mb-4 ai-breathe`}
                >
                  <feature.icon size={24} className="sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Interactive Demo */}
        <motion.div
          className="glass-card p-4 sm:p-8 border border-white/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 px-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Live Demo - Tuition Centre AI Assistant
            </h3>
            <p className="text-white/80 text-sm sm:text-lg px-4">
              Try asking about courses, pricing, schedules, or holidays. 
              Experience intelligent AI that adapts to your questions.
            </p>
          </div>

          {!isOpen ? (
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setIsOpen(true)}
                  className="bg-white text-[#f5576c] hover:bg-white/90 font-bold text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 rounded-2xl shadow-2xl"
                >
                  <MessageCircle className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  🚀 Launch Demo Chat
                </Button>
              </motion.div>
              
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'Try asking:', example: 'P6 Math classes at Marine Parade' },
                  { label: 'Test context:', example: 'J2 math" then "Bishan' },
                  { label: 'Check calendar:', example: '2026 holiday schedule' },
                  { label: 'Test responses:', example: 'Classes at Punggol' }
                ].map((item, index) => (
                  <Card key={index} className="ai-card p-3 sm:p-4 bg-white/20 backdrop-blur-md border border-white/30">
                    <div className="text-center">
                      <div className="font-bold text-white text-xs sm:text-sm mb-2">{item.label}</div>
                      <div className="text-white/70 text-xs break-words">{item.example}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {/* Chat Interface */}
              <div className="ai-card bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden border border-white/30">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Tuition Centre AI</div>
                      <div className="text-xs text-white/80">Live Demo - Powered by CCC Digital</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-3 rounded-2xl shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        <div className="whitespace-pre-line leading-relaxed text-sm sm:text-base break-words overflow-wrap-anywhere">{msg.text}</div>
                        <div className={`text-xs mt-2 ${
                          msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {msg.time}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-[#667eea] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#764ba2] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {messages.length <= 1 && !isLoading && (
                  <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-white/20">
                    <div className="text-sm text-gray-600 mb-3 font-medium">Try these questions:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          onClick={() => setInputMessage(reply)}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2 px-3 border-gray-200 hover:border-[#667eea] hover:text-[#667eea] transition-all"
                        >
                          <span className="text-xs">{reply}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-white/20">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about courses, pricing, schedules..."
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/20 transition-all"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-3 hover:from-[#5a67d8] hover:to-[#6b46c1] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Demo Information */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="ai-card p-8 bg-white/20 backdrop-blur-md border border-white/30 h-full">
              <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                🎯 What This Demo Shows
              </h3>
              <ul className="space-y-3 text-white/90">
                <li>• <strong>Real Tuition Center Data</strong> - Actual 2026 pricing and schedules</li>
                <li>• <strong>Context Memory</strong> - AI remembers conversation flow</li>
                <li>• <strong>Smart Responses</strong> - No information dumping</li>
                <li>• <strong>Mobile Optimized</strong> - Works perfectly on all devices</li>
                <li>• <strong>Professional UI</strong> - Custom branded for education</li>
              </ul>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="ai-card p-8 bg-white/20 backdrop-blur-md border border-white/30 h-full">
              <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                💼 Perfect For Tuition Centres
              </h3>
              <ul className="space-y-3 text-white/90">
                <li>• <strong>Reduce Admin Calls</strong> - 60-70% fewer routine inquiries</li>
                <li>• <strong>24/7 Availability</strong> - Parents get answers anytime</li>
                <li>• <strong>Accurate Information</strong> - Always up-to-date pricing/schedules</li>
                <li>• <strong>Lead Generation</strong> - Capture parent interest immediately</li>
                <li>• <strong>Student Portal</strong> - Secure access to personal information</li>
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="glass-card p-10 border border-white/30">
            <h3 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Ready for Your Tuition Centre?
            </h3>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              CCC Digital specializes in AI chatbot solutions for Singapore's education industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  asChild
                  className="bg-white text-[#f5576c] hover:bg-white/90 font-bold text-lg px-10 py-4"
                >
                  <a href="/contact">
                    <MessageCircle className="mr-3 h-5 w-5" />
                    💬 Discuss Your Project
                  </a>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  asChild
                  className="btn-ai-primary text-white font-bold text-lg px-10 py-4"
                >
                  <a href="/ai-employees">
                    <ExternalLink className="mr-3 h-5 w-5" />
                    🏥 See More AI Employees
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TuitionCentreDemo;