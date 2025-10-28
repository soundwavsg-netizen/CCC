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
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    parent_name: '',
    student_name: '',
    email: '',
    parent_phone: '',
    student_phone: '',
    level: '',
    subject: '',
    location: '',
    tutor_preference: '',
    message: ''
  });
  const [enrollmentSubmitted, setEnrollmentSubmitted] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableTutors, setAvailableTutors] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);  // Add input ref for focus management

  // External backend URL
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://tutor-chat-scroll.preview.emergentagent.com';

  // Fetch available locations when level and subject are selected
  useEffect(() => {
    const fetchAvailableLocations = async () => {
      if (enrollmentData.level && enrollmentData.subject) {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/tuition/available-locations`, {
            params: {
              level: enrollmentData.level,
              subject: enrollmentData.subject
            }
          });
          setAvailableLocations(response.data.locations || []);
        } catch (error) {
          console.error('Error fetching locations:', error);
          // Fallback to all locations
          setAvailableLocations(['Bishan', 'Punggol', 'Marine Parade', 'Jurong', 'Kovan']);
        }
      } else {
        setAvailableLocations([]);
      }
    };
    
    fetchAvailableLocations();
  }, [enrollmentData.level, enrollmentData.subject, BACKEND_URL]);

  // Fetch available tutors when level, subject, and location are selected
  useEffect(() => {
    const fetchAvailableTutors = async () => {
      if (enrollmentData.level && enrollmentData.subject && enrollmentData.location) {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/admin/available-tutors`, {
            params: {
              level: enrollmentData.level,
              subject: enrollmentData.subject,
              location: enrollmentData.location
            }
          });
          setAvailableTutors(response.data.tutors || []);
        } catch (error) {
          console.error('Error fetching tutors:', error);
          setAvailableTutors([]);
        }
      } else {
        setAvailableTutors([]);
      }
    };
    
    fetchAvailableTutors();
  }, [enrollmentData.level, enrollmentData.subject, enrollmentData.location, BACKEND_URL]);

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

  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/tuition/enrollment`, enrollmentData);
      
      if (response.data.success) {
        setEnrollmentSubmitted(true);
        // Add confirmation message to chat
        const phone = enrollmentData.parent_phone || enrollmentData.student_phone;
        const confirmMsg = {
          id: Date.now().toString(),
          text: '✅ Thank you! Your enrollment request has been submitted successfully. Our admin team will contact you shortly at ' + enrollmentData.email + (phone ? ' or ' + phone : '') + '. 😊',
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, confirmMsg]);
        
        // Reset form after 2 seconds
        setTimeout(() => {
          setShowEnrollmentForm(false);
          setEnrollmentSubmitted(false);
          setEnrollmentData({
            parent_name: '',
            student_name: '',
            email: '',
            parent_phone: '',
            student_phone: '',
            level: '',
            subject: '',
            location: '',
            tutor_preference: '',
            message: ''
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to submit enrollment. Please try again or call 6222 8222.';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollmentChange = (field, value) => {
    const updates = { [field]: value };
    
    // If level changes, reset subject and location
    if (field === 'level') {
      updates.subject = '';
      updates.location = '';
    }
    // If subject changes, reset location
    else if (field === 'subject') {
      updates.location = '';
    }
    
    setEnrollmentData(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Subject options based on selected level
  const getSubjectOptions = (level) => {
    if (!level) return [];
    
    if (level.startsWith('P')) {
      // Primary: Math, Science, English, Chinese
      return ['Math', 'Science', 'English', 'Chinese'];
    } else if (level === 'S1' || level === 'S2') {
      // S1-S2: Math, Science, English, Chinese
      return ['Math', 'Science', 'English', 'Chinese'];
    } else if (level === 'S3' || level === 'S4') {
      // S3-S4: EMath, AMath, Physics, Chemistry, Biology, English, Chinese
      return ['EMath', 'AMath', 'Physics', 'Chemistry', 'Biology', 'English', 'Chinese'];
    } else if (level === 'J1' || level === 'J2') {
      // JC: Math, Physics, Chemistry, Biology, Economics
      return ['Math', 'Physics', 'Chemistry', 'Biology', 'Economics'];
    }
    return [];
  };

  // All locations
  const allLocations = ['Bishan', 'Punggol', 'Marine Parade', 'Jurong', 'Kovan'];

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

                {/* Enrollment Form Button */}
                {messages.length > 1 && !showEnrollmentForm && (
                  <div className="p-2 bg-white/80 backdrop-blur-sm border-t border-white/20">
                    <Button
                      onClick={() => setShowEnrollmentForm(true)}
                      className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90"
                    >
                      📚 Enrollment Form
                    </Button>
                  </div>
                )}

                {/* Enrollment Form Modal */}
                {showEnrollmentForm && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col"
                    >
                      {/* Fixed Header */}
                      <div className="p-6 pb-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="text-2xl font-bold text-gray-800">📚 Enrollment Request</h3>
                          <Button
                            onClick={() => setShowEnrollmentForm(false)}
                            variant="ghost"
                            size="sm"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Scrollable Content */}
                      <div className="overflow-y-auto flex-1 p-6 pb-8">
                        {enrollmentSubmitted ? (
                          <div className="text-center py-8">
                            <div className="text-6xl mb-4">✅</div>
                            <h4 className="text-xl font-bold text-green-600 mb-2">Request Submitted!</h4>
                            <p className="text-gray-600">Our admin team will contact you shortly.</p>
                          </div>
                        ) : (
                          <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name *</label>
                              <input
                                type="text"
                                required
                                value={enrollmentData.parent_name}
                                onChange={(e) => handleEnrollmentChange('parent_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                              <input
                                type="text"
                                required
                                value={enrollmentData.student_name}
                                onChange={(e) => handleEnrollmentChange('student_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                              <input
                                type="email"
                                required
                                value={enrollmentData.email}
                                onChange={(e) => handleEnrollmentChange('email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                              <input
                                type="tel"
                                value={enrollmentData.parent_phone}
                                onChange={(e) => handleEnrollmentChange('parent_phone', e.target.value)}
                                placeholder="e.g., +65 9123 4567"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Student Phone</label>
                              <input
                                type="tel"
                                value={enrollmentData.student_phone}
                                onChange={(e) => handleEnrollmentChange('student_phone', e.target.value)}
                                placeholder="e.g., +65 8123 4567"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                              />
                              <p className="text-xs text-gray-500 mt-1">* At least 1 phone number is required</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                                <select
                                  required
                                  value={enrollmentData.level}
                                  onChange={(e) => handleEnrollmentChange('level', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                                >
                                  <option value="">Select</option>
                                  <option value="P2">P2</option>
                                  <option value="P3">P3</option>
                                  <option value="P4">P4</option>
                                  <option value="P5">P5</option>
                                  <option value="P6">P6</option>
                                  <option value="S1">S1</option>
                                  <option value="S2">S2</option>
                                  <option value="S3">S3</option>
                                  <option value="S4">S4</option>
                                  <option value="J1">J1</option>
                                  <option value="J2">J2</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                <select
                                  required
                                  value={enrollmentData.subject}
                                  onChange={(e) => handleEnrollmentChange('subject', e.target.value)}
                                  disabled={!enrollmentData.level}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                  <option value="">{enrollmentData.level ? 'Select' : 'Select level first'}</option>
                                  {getSubjectOptions(enrollmentData.level).map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                              <select
                                required
                                value={enrollmentData.location}
                                onChange={(e) => handleEnrollmentChange('location', e.target.value)}
                                disabled={!enrollmentData.level || !enrollmentData.subject}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                              >
                                <option value="">
                                  {!enrollmentData.level || !enrollmentData.subject 
                                    ? 'Select level & subject first' 
                                    : availableLocations.length === 0 
                                      ? 'Loading...'
                                      : 'Select'}
                                </option>
                                {availableLocations.map(location => (
                                  <option key={location} value={location}>{location}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tutor Preference (Optional)</label>
                              <input
                                type="text"
                                value={enrollmentData.tutor_preference}
                                onChange={(e) => handleEnrollmentChange('tutor_preference', e.target.value)}
                                placeholder="e.g., Mr. Sean Yeo"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                              <textarea
                                value={enrollmentData.message}
                                onChange={(e) => handleEnrollmentChange('message', e.target.value)}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                              />
                            </div>

                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90 mb-4"
                            >
                              {isLoading ? 'Submitting...' : 'Submit Request'}
                            </Button>
                          </form>
                        )}
                      </div>
                    </motion.div>
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