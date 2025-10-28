import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import PageHeader from '../components/PageHeader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MathAnalysis = () => {
  const [activeTab, setActiveTab] = useState('upload'); // upload, analytics, revision
  const [uploadMethod, setUploadMethod] = useState('pdf'); // pdf, csv or manual
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [revisionPlan, setRevisionPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Tutor authentication
  const [tutorInfo, setTutorInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://math-mastery-12.preview.emergentagent.com';

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    student_name: '',
    location: '',
    level: '',
    subject: '',
    exam_type: '',
    topics: [{ topic_name: '', marks: '', total_marks: '' }]
  });

  // CSV upload state
  const [csvFile, setCsvFile] = useState(null);

  // PDF upload state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfStudentInfo, setPdfStudentInfo] = useState({
    student_name: '',
    location: '',
    level: '',
    subject: '',
    exam_type: ''
  });
  const [analyzedResults, setAnalyzedResults] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    location: '',
    level: '',
    subject: '',
    exam_type: ''
  });

  // Assessment generation state
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentData, setAssessmentData] = useState({
    student_id: '',
    result_id: '',
    selected_topics: [],
    selected_subtopics: [],
    duration_minutes: 45,
    generation_mode: 'auto'
  });
  const [availableSubtopics, setAvailableSubtopics] = useState([]);
  const [studentAssessments, setStudentAssessments] = useState([]);
  const [improvementData, setImprovementData] = useState(null);
  const [weakThreshold, setWeakThreshold] = useState(70); // Default 70%
  
  // Revision Plans filtering and view state
  const [revisionFilters, setRevisionFilters] = useState({
    level: '',
    location: ''
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [studentResults, setStudentResults] = useState([]); // Store all results with scores
  const [editingResult, setEditingResult] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch students on mount
  useEffect(() => {
    // Check if tutor is logged in
    const token = localStorage.getItem('tutor_token');
    const storedTutorInfo = localStorage.getItem('tutor_info');
    
    if (token && storedTutorInfo) {
      const parsedInfo = JSON.parse(storedTutorInfo);
      setTutorInfo(parsedInfo);
      setIsLoggedIn(true);
      fetchStudents();
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/tutor/login';
    }
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('tutor_token');
      const response = await axios.get(`${BACKEND_URL}/api/math-analysis/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setStudents(response.data.students);
        // Also fetch all results with scores for the revision tab
        fetchAllStudentResults();
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      if (error.response?.status === 401) {
        // Token expired, redirect to login
        handleLogout();
      }
    }
  };

  const fetchAllStudentResults = async () => {
    try {
      const token = localStorage.getItem('tutor_token');
      const response = await axios.get(`${BACKEND_URL}/api/math-analysis/all-results`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setStudentResults(response.data.results);
      }
    } catch (error) {
      console.error('Error fetching all results:', error);
      if (error.response?.status === 401) {
        // Token expired, redirect to login
        handleLogout();
      }
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/math-analysis/manual-entry`, manualForm);
      if (response.data.success) {
        setMessage('✅ Results submitted successfully!');
        setManualForm({
          student_name: '',
          location: '',
          level: '',
          subject: '',
          exam_type: '',
          topics: [{ topic_name: '', marks: '', total_marks: '' }]
        });
        fetchStudents();
      }
    } catch (error) {
      setMessage('❌ Error submitting results: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setMessage('❌ Please select a file to upload');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await axios.post(`${BACKEND_URL}/api/math-analysis/upload-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setMessage(`✅ ${response.data.message}`);
        setCsvFile(null);
        fetchStudents();
      }
    } catch (error) {
      setMessage('❌ Error uploading file: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePDFAnalyze = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      setMessage('❌ Please select a PDF file to upload');
      return;
    }

    // Validate student info
    if (!pdfStudentInfo.student_name || !pdfStudentInfo.location || !pdfStudentInfo.level || 
        !pdfStudentInfo.subject || !pdfStudentInfo.exam_type) {
      setMessage('❌ Please fill in all student information');
      return;
    }

    setLoading(true);
    setMessage('🤖 AI is analyzing the test paper... This may take 30-60 seconds.');

    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('student_name', pdfStudentInfo.student_name);
      formData.append('location', pdfStudentInfo.location);
      formData.append('level', pdfStudentInfo.level);
      formData.append('subject', pdfStudentInfo.subject);
      formData.append('exam_type', pdfStudentInfo.exam_type);

      const response = await axios.post(`${BACKEND_URL}/api/math-analysis/analyze-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setAnalyzedResults(response.data);
        setShowPreview(true);
        setMessage('✅ AI analysis complete! Please review and edit if needed.');
      }
    } catch (error) {
      setMessage('❌ Error analyzing PDF: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalyzedResults = async () => {
    if (!analyzedResults) return;

    setLoading(true);
    setMessage('');

    try {
      const dataToSave = {
        student_name: analyzedResults.student_info.name,
        location: analyzedResults.student_info.location,
        level: analyzedResults.student_info.level,
        subject: analyzedResults.student_info.subject,
        exam_type: analyzedResults.student_info.exam_type,
        topics: analyzedResults.extracted_topics.map(t => ({
          topic_name: t.topic_name,
          marks: t.marks,
          total_marks: t.total_marks
        }))
      };

      const response = await axios.post(`${BACKEND_URL}/api/math-analysis/save-analyzed-results`, dataToSave);

      if (response.data.success) {
        setMessage(`✅ Results saved successfully for ${analyzedResults.student_info.name}!`);
        setShowPreview(false);
        setAnalyzedResults(null);
        setPdfFile(null);
        setPdfStudentInfo({
          student_name: '',
          location: '',
          level: '',
          subject: '',
          exam_type: ''
        });
        fetchStudents();
      }
    } catch (error) {
      setMessage('❌ Error saving results: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const updateAnalyzedTopic = (index, field, value) => {
    const newTopics = [...analyzedResults.extracted_topics];
    newTopics[index][field] = parseFloat(value) || 0;
    // Recalculate percentage
    if (field === 'marks' || field === 'total_marks') {
      newTopics[index].percentage = newTopics[index].total_marks > 0 
        ? Math.round((newTopics[index].marks / newTopics[index].total_marks * 100) * 100) / 100
        : 0;
    }
    setAnalyzedResults({ ...analyzedResults, extracted_topics: newTopics });
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('tutor_token');
      const response = await axios.post(`${BACKEND_URL}/api/math-analysis/analytics`, filters, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      if (error.response?.status === 401) {
        // Token expired, redirect to login
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisionPlan = async (studentId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/math-analysis/revision-plan/${studentId}`);
      if (response.data.success) {
        // Get full result data to show ALL topics (not just weak ones)
        const studentResultsResponse = await axios.get(`${BACKEND_URL}/api/math-analysis/student/${studentId}/results`);
        
        if (studentResultsResponse.data.success && studentResultsResponse.data.results.length > 0) {
          const latestResult = studentResultsResponse.data.results[0];
          
          // Create all topics array with performance data
          const allTopics = latestResult.topics.map(t => ({
            topic: t.topic_name,
            current_score: t.percentage,
            marks: t.marks,
            total_marks: t.total_marks
          }));
          
          setRevisionPlan({
            ...response.data,
            all_topics: allTopics,
            result_id: latestResult.result_id
          });
        } else {
          setRevisionPlan(response.data);
        }
        
        // Also fetch student's assessments
        fetchStudentAssessments(studentId);
      }
    } catch (error) {
      setMessage('❌ Error fetching revision plan: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAssessments = async (studentId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/math-analysis/student/${studentId}/assessments`);
      if (response.data.success) {
        setStudentAssessments(response.data.assessments);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const openAssessmentGenerator = (studentId, resultId, weakTopics) => {
    const topics = weakTopics.map(w => w.topic);
    setAssessmentData({
      student_id: studentId,
      result_id: resultId,
      selected_topics: topics,
      selected_subtopics: [],
      duration_minutes: 45,
      generation_mode: 'auto'
    });
    fetchAvailableSubtopics(topics);
    setShowAssessmentModal(true);
  };

  const openAssessmentGeneratorFromResult = (studentId, revisionPlanData, weakTopicsData) => {
    // Use all_topics from revision plan which has full performance data
    const allTopics = revisionPlanData.all_topics || [];
    const weakTopics = allTopics.filter(t => t.current_score <= weakThreshold).map(t => t.topic);
    
    // Set weak topics as pre-selected, but store all topics for selection
    setAssessmentData({
      student_id: studentId,
      result_id: revisionPlanData.result_id || 'latest',
      selected_topics: weakTopics, // Pre-select weak topics based on threshold
      all_available_topics: allTopics, // Store all topics for tutor to choose
      selected_subtopics: [],
      duration_minutes: 45,
      generation_mode: 'auto'
    });
    
    if (weakTopics.length > 0) {
      fetchAvailableSubtopics(weakTopics);
    } else if (allTopics.length > 0) {
      // If no weak topics, fetch subtopics for all topics
      fetchAvailableSubtopics(allTopics.map(t => t.topic));
    }
    setShowAssessmentModal(true);
  };

  const fetchAvailableSubtopics = async (topics) => {
    if (!revisionPlan || topics.length === 0) return;
    
    try {
      const topicsStr = topics.join(',');
      const response = await axios.get(
        `${BACKEND_URL}/api/math-analysis/available-subtopics?level=${revisionPlan.level}&subject=${revisionPlan.subject}&topics=${topicsStr}`
      );
      if (response.data.success) {
        setAvailableSubtopics(response.data.subtopics);
      }
    } catch (error) {
      console.error('Error fetching subtopics:', error);
    }
  };

  const handleGenerateAssessment = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/math-analysis/generate-assessment`, assessmentData);
      
      if (response.data.success) {
        setMessage(`✅ Assessment generated! ${response.data.question_count} questions, ${response.data.total_marks} marks`);
        setShowAssessmentModal(false);
        // Refresh assessments list
        fetchStudentAssessments(assessmentData.student_id);
      }
    } catch (error) {
      setMessage('❌ Error generating assessment: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (studentId, assessmentId, version) => {
    const url = `${BACKEND_URL}/api/math-analysis/assessment/${studentId}/${assessmentId}/pdf?version=${version}`;
    window.open(url, '_blank');
  };

  const fetchImprovementData = async (studentId, resultId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/math-analysis/improvement-tracking/${studentId}/${resultId}`);
      if (response.data.success) {
        setImprovementData(response.data);
      }
    } catch (error) {
      console.error('Error fetching improvement data:', error);
    }
  };

  const addTopicField = () => {
    setManualForm({
      ...manualForm,
      topics: [...manualForm.topics, { topic_name: '', marks: '', total_marks: '' }]
    });
  };

  const removeTopicField = (index) => {
    const newTopics = manualForm.topics.filter((_, i) => i !== index);
    setManualForm({ ...manualForm, topics: newTopics });
  };

  const updateTopic = (index, field, value) => {
    const newTopics = [...manualForm.topics];
    newTopics[index][field] = value;
    setManualForm({ ...manualForm, topics: newTopics });
  };

  // Chart data preparation
  const prepareChartData = () => {
    if (!analyticsData || !analyticsData.topic_averages) return null;

    const topics = Object.keys(analyticsData.topic_averages);
    const averages = Object.values(analyticsData.topic_averages).map(t => t.average);

    return {
      labels: topics,
      datasets: [
        {
          label: 'Average Score (%)',
          data: averages,
          backgroundColor: 'rgba(102, 126, 234, 0.5)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2
        }
      ]
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('tutor_token');
    localStorage.removeItem('tutor_info');
    window.location.href = '/tutor/login';
  };

  const handleDeleteResult = async (resultId, studentName, examType) => {
    if (!window.confirm(`Are you sure you want to delete the result for ${studentName} - ${examType}?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/math-analysis/result/${resultId}`);
      if (response.data.success) {
        setMessage(`✅ Result deleted successfully`);
        fetchAllStudentResults();
        fetchStudents();
        // Clear selected student if it was deleted
        if (selectedStudent && revisionPlan && revisionPlan.result_id === resultId) {
          setSelectedStudent(null);
          setRevisionPlan(null);
        }
      }
    } catch (error) {
      setMessage('❌ Error deleting result: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEditResult = (result) => {
    setEditingResult({
      ...result,
      topics: result.topics.map(t => ({ ...t })) // Deep copy topics
    });
    setShowEditModal(true);
  };

  const handleSaveEditedResult = async () => {
    if (!editingResult) return;

    setLoading(true);
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/math-analysis/result/${editingResult.result_id}`,
        {
          topics: editingResult.topics,
          overall_score: Math.round(
            editingResult.topics.reduce((sum, t) => sum + (t.marks / t.total_marks * 100), 0) / editingResult.topics.length
          )
        }
      );

      if (response.data.success) {
        setMessage('✅ Result updated successfully');
        setShowEditModal(false);
        setEditingResult(null);
        fetchAllStudentResults();
        fetchStudents();
      }
    } catch (error) {
      setMessage('❌ Error updating result: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const updateEditingTopic = (index, field, value) => {
    const newTopics = [...editingResult.topics];
    newTopics[index][field] = parseFloat(value) || 0;
    // Recalculate percentage
    if (field === 'marks' || field === 'total_marks') {
      newTopics[index].percentage = newTopics[index].total_marks > 0 
        ? Math.round((newTopics[index].marks / newTopics[index].total_marks * 100) * 100) / 100
        : 0;
    }
    setEditingResult({ ...editingResult, topics: newTopics });
  };
  
  // Filter student results based on revision filters
  const getFilteredResults = () => {
    return studentResults.filter(result => {
      if (revisionFilters.level && result.level !== revisionFilters.level) return false;
      if (revisionFilters.location && result.location !== revisionFilters.location) return false;
      return true;
    });
  };
  
  // Show loading while checking authentication
  if (!isLoggedIn || !tutorInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PageHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with Tutor Info */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <h1 className="text-4xl font-bold text-gray-800">
              📊 Math Results Analysis System
            </h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome, <strong>{tutorInfo.tutor_name}</strong></p>
              <button 
                onClick={handleLogout}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Logout
              </button>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload, analyze, and track student performance across assessments. 
            Get AI-powered insights and revision plans for weak topics.
          </p>
          <div className="mt-3 flex justify-center gap-4 text-sm text-gray-500">
            <span>📍 {tutorInfo.locations.join(', ')}</span>
            <span>📚 {tutorInfo.levels.join(', ')}</span>
            <span>🎓 {tutorInfo.subjects.join(', ')}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 space-x-4">
          <Button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-lg ${activeTab === 'upload' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            📤 Upload Results
          </Button>
          <Button
            onClick={() => { setActiveTab('analytics'); fetchAnalytics(); }}
            className={`px-6 py-3 rounded-lg ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            📈 Analytics
          </Button>
          <Button
            onClick={() => setActiveTab('revision')}
            className={`px-6 py-3 rounded-lg ${activeTab === 'revision' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            📚 Revision Plans
          </Button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`max-w-4xl mx-auto mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-center mb-6 space-x-4">
              <Button
                onClick={() => setUploadMethod('pdf')}
                className={`px-6 py-2 rounded-lg ${uploadMethod === 'pdf' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                🤖 AI PDF Analysis
              </Button>
              <Button
                onClick={() => setUploadMethod('csv')}
                className={`px-6 py-2 rounded-lg ${uploadMethod === 'csv' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                📄 CSV/Excel Upload
              </Button>
              <Button
                onClick={() => setUploadMethod('manual')}
                className={`px-6 py-2 rounded-lg ${uploadMethod === 'manual' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                ✍️ Manual Entry
              </Button>
            </div>

            {uploadMethod === 'pdf' ? (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">🤖 AI-Powered PDF Analysis</h3>
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700 mb-2"><strong>How it works:</strong></p>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>Upload scanned test paper PDF</li>
                    <li>AI reads questions and extracts marks (including handwritten)</li>
                    <li>Automatically categorizes into topics</li>
                    <li>You can review and edit before saving</li>
                  </ul>
                </div>

                {!showPreview ? (
                  <form onSubmit={handlePDFAnalyze} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                        <input
                          type="text"
                          required
                          value={pdfStudentInfo.student_name}
                          onChange={(e) => setPdfStudentInfo({ ...pdfStudentInfo, student_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                        <select
                          required
                          value={pdfStudentInfo.location}
                          onChange={(e) => setPdfStudentInfo({ ...pdfStudentInfo, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Location</option>
                          {tutorInfo.locations.map(loc => (
                            <option key={loc} value={`RMSS - ${loc}`}>RMSS - {loc}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                        <select
                          required
                          value={pdfStudentInfo.level}
                          onChange={(e) => setPdfStudentInfo({ ...pdfStudentInfo, level: e.target.value, subject: '' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Level</option>
                          {tutorInfo.levels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                        <select
                          required
                          value={pdfStudentInfo.subject}
                          onChange={(e) => setPdfStudentInfo({ ...pdfStudentInfo, subject: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled={!pdfStudentInfo.level}
                        >
                          <option value="">Select Subject</option>
                          {pdfStudentInfo.level && (() => {
                            // S1, S2, J1, J2 only have Math
                            if (['S1', 'S2', 'J1', 'J2'].includes(pdfStudentInfo.level)) {
                              return tutorInfo.subjects.includes('Math') ? 
                                <option value="Math">Math</option> : null;
                            }
                            // S3, S4 can have A Math or E Math
                            else if (['S3', 'S4'].includes(pdfStudentInfo.level)) {
                              return tutorInfo.subjects.map(subj => 
                                ['A Math', 'E Math'].includes(subj) ? 
                                  <option key={subj} value={subj}>{subj}</option> : null
                              );
                            }
                            return null;
                          })()}
                        </select>
                        {!pdfStudentInfo.level && (
                          <p className="text-xs text-gray-500 mt-1">Please select a level first</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type *</label>
                        <select
                          required
                          value={pdfStudentInfo.exam_type}
                          onChange={(e) => setPdfStudentInfo({ ...pdfStudentInfo, exam_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Exam Type</option>
                          <option value="WA1">WA1</option>
                          <option value="WA2">WA2</option>
                          <option value="WA3">WA3</option>
                          <option value="EOY">EOY</option>
                          <option value="Prelim">Prelim</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Test Paper (PDF)</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setPdfFile(e.target.files[0])}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {pdfFile && (
                        <p className="text-xs text-green-600 mt-2">✓ {pdfFile.name}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:opacity-90"
                    >
                      {loading ? '🤖 AI Analyzing... Please wait...' : '🤖 Analyze with AI'}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">✅ AI Analysis Complete!</h4>
                      <p className="text-sm text-gray-600">
                        Overall Score: <strong>{analyzedResults?.overall_score}%</strong> 
                        ({analyzedResults?.total_marks}/{analyzedResults?.total_possible} marks)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Confidence: {analyzedResults?.confidence}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Extracted Topics (Review & Edit)</h4>
                      {analyzedResults?.extracted_topics.map((topic, index) => (
                        <div key={index} className="grid grid-cols-4 gap-3 mb-3 items-center">
                          <input
                            type="text"
                            value={topic.topic_name}
                            onChange={(e) => {
                              const newTopics = [...analyzedResults.extracted_topics];
                              newTopics[index].topic_name = e.target.value;
                              setAnalyzedResults({ ...analyzedResults, extracted_topics: newTopics });
                            }}
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="number"
                            step="0.5"
                            value={topic.marks}
                            onChange={(e) => updateAnalyzedTopic(index, 'marks', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="number"
                            step="0.5"
                            value={topic.total_marks}
                            onChange={(e) => updateAnalyzedTopic(index, 'total_marks', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setShowPreview(false);
                          setAnalyzedResults(null);
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveAnalyzedResults}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        {loading ? 'Saving...' : '✓ Confirm & Save'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : uploadMethod === 'csv' ? (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Upload CSV/Excel File</h3>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2"><strong>Required Columns:</strong></p>
                  <p className="text-xs text-gray-600">Name | Location | Level | Subject | Exam Type | Topic | Marks | Total Marks</p>
                </div>
                <form onSubmit={handleCSVUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setCsvFile(e.target.files[0])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                  >
                    {loading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </form>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Manual Entry</h3>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                      <input
                        type="text"
                        required
                        value={manualForm.student_name}
                        onChange={(e) => setManualForm({ ...manualForm, student_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                      <select
                        required
                        value={manualForm.location}
                        onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Location</option>
                        {tutorInfo.locations.map(loc => (
                          <option key={loc} value={`RMSS - ${loc}`}>RMSS - {loc}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                      <select
                        required
                        value={manualForm.level}
                        onChange={(e) => setManualForm({ ...manualForm, level: e.target.value, subject: '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Level</option>
                        {tutorInfo.levels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <select
                        required
                        value={manualForm.subject}
                        onChange={(e) => setManualForm({ ...manualForm, subject: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        disabled={!manualForm.level}
                      >
                        <option value="">Select Subject</option>
                        {manualForm.level && (() => {
                          // S1, S2, J1, J2 only have Math
                          if (['S1', 'S2', 'J1', 'J2'].includes(manualForm.level)) {
                            return tutorInfo.subjects.includes('Math') ? 
                              <option value="Math">Math</option> : null;
                          }
                          // S3, S4 can have A Math or E Math
                          else if (['S3', 'S4'].includes(manualForm.level)) {
                            return tutorInfo.subjects.map(subj => 
                              ['A Math', 'E Math'].includes(subj) ? 
                                <option key={subj} value={subj}>{subj}</option> : null
                            );
                          }
                          return null;
                        })()}
                      </select>
                      {!manualForm.level && (
                        <p className="text-xs text-gray-500 mt-1">Please select a level first</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type *</label>
                      <select
                        required
                        value={manualForm.exam_type}
                        onChange={(e) => setManualForm({ ...manualForm, exam_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Exam Type</option>
                        <option value="WA1">WA1</option>
                        <option value="WA2">WA2</option>
                        <option value="WA3">WA3</option>
                        <option value="EOY">EOY</option>
                        <option value="Prelim">Prelim</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-lg font-semibold text-gray-800">Topic Scores</h4>
                      <Button
                        type="button"
                        onClick={addTopicField}
                        className="bg-green-500 text-white px-4 py-1 rounded-lg text-sm"
                      >
                        + Add Topic
                      </Button>
                    </div>
                    {manualForm.topics.map((topic, index) => (
                      <div key={index} className="grid grid-cols-4 gap-3 mb-3">
                        <input
                          type="text"
                          required
                          placeholder="Topic Name"
                          value={topic.topic_name}
                          onChange={(e) => updateTopic(index, 'topic_name', e.target.value)}
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="number"
                          required
                          placeholder="Marks"
                          value={topic.marks}
                          onChange={(e) => updateTopic(index, 'marks', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            required
                            placeholder="Total"
                            value={topic.total_marks}
                            onChange={(e) => updateTopic(index, 'total_marks', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          {manualForm.topics.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTopicField(index)}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mt-6"
                  >
                    {loading ? 'Submitting...' : 'Submit Results'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Filters</h3>
              <div className="grid grid-cols-4 gap-4">
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Locations</option>
                  {tutorInfo.locations.map(loc => (
                    <option key={loc} value={`RMSS - ${loc}`}>RMSS - {loc}</option>
                  ))}
                </select>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Levels</option>
                  {tutorInfo.levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Subjects</option>
                  {tutorInfo.subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <Button
                  onClick={fetchAnalytics}
                  className="bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading analytics...</p>
              </div>
            ) : analyticsData ? (
              <>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <p className="text-gray-600 mb-2">Total Students</p>
                    <p className="text-4xl font-bold text-blue-600">{analyticsData.total_students}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <p className="text-gray-600 mb-2">Total Results</p>
                    <p className="text-4xl font-bold text-green-600">{analyticsData.total_results}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <p className="text-gray-600 mb-2">Overall Average</p>
                    <p className="text-4xl font-bold text-purple-600">{analyticsData.overall_average}%</p>
                  </div>
                </div>

                {analyticsData.topic_averages && Object.keys(analyticsData.topic_averages).length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Topic Performance</h3>
                    <div className="h-96">
                      <Bar
                        data={prepareChartData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: true },
                            title: { display: false }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <p className="text-gray-600">Click "Apply Filters" to view analytics</p>
              </div>
            )}
          </div>
        )}

        {/* Revision Plans Tab */}
        {activeTab === 'revision' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📚 Student Results & Revision Plans</h3>
              
              {/* Filters and View Toggle */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Level Filter */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Level</label>
                    <select
                      value={revisionFilters.level}
                      onChange={(e) => setRevisionFilters({ ...revisionFilters, level: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Levels</option>
                      {tutorInfo.levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Location</label>
                    <select
                      value={revisionFilters.location}
                      onChange={(e) => setRevisionFilters({ ...revisionFilters, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Locations</option>
                      {tutorInfo.locations.map(loc => (
                        <option key={loc} value={`RMSS - ${loc}`}>RMSS - {loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* View Toggle */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                          viewMode === 'grid' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        📱 Grid
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                          viewMode === 'list' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        📋 List
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Display */}
              {getFilteredResults().length > 0 ? (
                viewMode === 'grid' ? (
                  // Grid View
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredResults().map((result) => (
                      <div
                        key={result.result_id}
                        className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{result.student_name}</p>
                            <p className="text-sm text-gray-600">{result.level} {result.subject}</p>
                            <p className="text-xs text-gray-500">{result.location}</p>
                          </div>
                          <div className={`text-2xl font-bold ${
                            result.overall_score >= 75 ? 'text-green-600' :
                            result.overall_score >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {result.overall_score}%
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{result.exam_type}</p>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudent({ student_id: result.student_id, name: result.student_name });
                              fetchRevisionPlan(result.student_id);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            📊 View Details
                          </button>
                          <button
                            onClick={() => handleEditResult(result)}
                            className="px-3 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteResult(result.result_id, result.student_name, result.exam_type)}
                            className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // List View
                  <div className="space-y-3">
                    {getFilteredResults().map((result) => (
                      <div
                        key={result.result_id}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{result.student_name}</p>
                              <p className="text-sm text-gray-600">{result.level} {result.subject} | {result.location}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">{result.exam_type}</p>
                              <p className={`text-2xl font-bold ${
                                result.overall_score >= 75 ? 'text-green-600' :
                                result.overall_score >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {result.overall_score}%
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudent({ student_id: result.student_id, name: result.student_name });
                              fetchRevisionPlan(result.student_id);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 whitespace-nowrap"
                          >
                            📊 View Details
                          </button>
                          <button
                            onClick={() => handleEditResult(result)}
                            className="px-3 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteResult(result.result_id, result.student_name, result.exam_type)}
                            className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-gray-600 text-center py-8">No results found. {revisionFilters.level || revisionFilters.location ? 'Try adjusting your filters.' : 'Please upload results first.'}</p>
              )}

              {revisionPlan && (
                <div className="mt-8 border-t pt-6">
                  {/* Weak Performance Threshold Adjuster */}
                  <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-800">
                          ⚙️ Adjust Weak Performance Threshold
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          Topics scoring at or below this % will be marked as "weak"
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-purple-600">{weakThreshold}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">50%</span>
                      <input
                        type="range"
                        min="50"
                        max="90"
                        step="5"
                        value={weakThreshold}
                        onChange={(e) => setWeakThreshold(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${(weakThreshold-50)/40*100}%, #e5e7eb ${(weakThreshold-50)/40*100}%, #e5e7eb 100%)`
                        }}
                      />
                      <span className="text-sm text-gray-600">90%</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setWeakThreshold(60)}
                        className={`px-3 py-1 rounded text-xs ${weakThreshold === 60 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        60%
                      </button>
                      <button
                        onClick={() => setWeakThreshold(70)}
                        className={`px-3 py-1 rounded text-xs ${weakThreshold === 70 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        70% (Default)
                      </button>
                      <button
                        onClick={() => setWeakThreshold(80)}
                        className={`px-3 py-1 rounded text-xs ${weakThreshold === 80 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        80%
                      </button>
                    </div>
                  </div>

                  {/* All Test Results with Generate Assessment */}
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">Test Results History</h4>
                    <div className="space-y-4">
                      {/* We need to fetch and display all results here */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{revisionPlan.exam_type}</p>
                            <p className="text-sm text-gray-600">Overall Score: {revisionPlan.overall_score}%</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {revisionPlan.all_topics && revisionPlan.all_topics.map((item, idx) => (
                                <span key={idx} className={`text-xs px-2 py-1 rounded font-medium ${
                                  item.current_score <= weakThreshold ? 'bg-red-100 text-red-700 border border-red-300' : 
                                  'bg-green-100 text-green-700 border border-green-300'
                                }`}>
                                  {item.topic}: {item.current_score}%
                                </span>
                              ))}
                            </div>
                          </div>
                          <Button
                            onClick={() => openAssessmentGeneratorFromResult(
                              selectedStudent.student_id,
                              revisionPlan,
                              revisionPlan.revision_plan
                            )}
                            className="bg-gradient-to-r from-green-500 to-blue-500 text-white whitespace-nowrap w-full md:w-auto"
                          >
                            🎯 Generate Assessment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revision Recommendations */}
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-800">📚 AI Revision Recommendations</h4>
                    <p className="text-sm text-gray-600">Based on {revisionPlan.exam_type}</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Level:</strong> {revisionPlan.level} | 
                      <strong> Subject:</strong> {revisionPlan.subject} | 
                      <strong> Exam:</strong> {revisionPlan.exam_type} | 
                      <strong> Score:</strong> {revisionPlan.overall_score}%
                    </p>
                  </div>

                  {revisionPlan.all_topics && revisionPlan.all_topics.filter(t => t.current_score <= weakThreshold).length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-red-600 font-medium">
                        ⚠️ Weak Topics Identified (At or Below {weakThreshold}%):
                      </p>
                      {revisionPlan.all_topics
                        .filter(t => t.current_score <= weakThreshold)
                        .map((item, index) => {
                          // Find resources from revision plan if available
                          const revisionItem = revisionPlan.revision_plan.find(r => r.topic === item.topic);
                          return (
                            <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-semibold text-gray-800">{index + 1}. {item.topic}</h5>
                                <span className="text-sm text-red-600">Current: {item.current_score}%</span>
                              </div>
                              {revisionItem && revisionItem.resources && (
                                <div className="flex gap-4 text-sm">
                                  {revisionItem.resources.pdf && (
                                    <a href={revisionItem.resources.pdf} className="text-blue-600 hover:underline">📄 PDF</a>
                                  )}
                                  {revisionItem.resources.video && (
                                    <a href={revisionItem.resources.video} className="text-blue-600 hover:underline">🎥 Video</a>
                                  )}
                                  {revisionItem.resources.worksheet && (
                                    <a href={revisionItem.resources.worksheet} className="text-blue-600 hover:underline">📝 Worksheet</a>
                                  )}
                                  {revisionItem.resources.note && (
                                    <span className="text-gray-500">{revisionItem.resources.note}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-green-600 text-center py-4">
                      🎉 Great work! No weak topics found (all above {weakThreshold}%).
                    </p>
                  )}

                  {/* Generated Assessments List */}
                  {studentAssessments.length > 0 && (
                    <div className="mt-8 border-t pt-6">
                      <h5 className="text-lg font-bold text-gray-800 mb-4">📋 Generated Assessments</h5>
                      <div className="space-y-3">
                        {studentAssessments.map((assessment) => (
                          <div key={assessment.assessment_id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-gray-800">Internal Assessment Test {assessment.created_date.replace(/\//g, '')}</p>
                                <p className="text-sm text-gray-600">
                                  {assessment.question_count} questions | {assessment.total_marks} marks | {assessment.duration_minutes} mins
                                </p>
                                <p className="text-xs text-gray-500">Topics: {assessment.topics.join(', ')}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleDownloadPDF(selectedStudent.student_id, assessment.assessment_id, 'student')}
                                  className="bg-blue-600 text-white text-sm px-3 py-1"
                                >
                                  📄 Student
                                </Button>
                                <Button
                                  onClick={() => handleDownloadPDF(selectedStudent.student_id, assessment.assessment_id, 'tutor')}
                                  className="bg-purple-600 text-white text-sm px-3 py-1"
                                >
                                  📝 Tutor
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assessment Generation Modal */}
        {showAssessmentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">🎯 Generate Revision Assessment</h3>
                  <button
                    onClick={() => setShowAssessmentModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Duration Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Duration</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setAssessmentData({...assessmentData, duration_minutes: 45})}
                        className={`flex-1 py-3 rounded-lg border-2 ${assessmentData.duration_minutes === 45 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300'}`}
                      >
                        45 Minutes
                      </button>
                      <button
                        onClick={() => setAssessmentData({...assessmentData, duration_minutes: 90})}
                        className={`flex-1 py-3 rounded-lg border-2 ${assessmentData.duration_minutes === 90 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300'}`}
                      >
                        1.5 Hours (90 mins)
                      </button>
                    </div>
                  </div>

                  {/* Topics Selection - AI Recommended + Manual Addition */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🤖 AI Recommended Topics (Weak Areas - At or Below {weakThreshold}%)
                    </label>
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                      {assessmentData.all_available_topics && assessmentData.all_available_topics.length > 0 ? (
                        <div className="space-y-2">
                          {assessmentData.all_available_topics
                            .filter(t => t.current_score <= weakThreshold)
                            .map((topic) => (
                              <label key={topic.topic} className="flex items-center justify-between p-2 hover:bg-red-100 rounded">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={assessmentData.selected_topics.includes(topic.topic)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const newTopics = [...assessmentData.selected_topics, topic.topic];
                                        setAssessmentData({
                                          ...assessmentData,
                                          selected_topics: newTopics
                                        });
                                        fetchAvailableSubtopics(newTopics);
                                      } else {
                                        const newTopics = assessmentData.selected_topics.filter(t => t !== topic.topic);
                                        setAssessmentData({
                                          ...assessmentData,
                                          selected_topics: newTopics
                                        });
                                        if (newTopics.length > 0) {
                                          fetchAvailableSubtopics(newTopics);
                                        }
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <span className="font-medium">{topic.topic}</span>
                                </div>
                                <span className="text-sm text-red-600">{topic.current_score}%</span>
                              </label>
                            ))}
                          {assessmentData.all_available_topics.filter(t => t.current_score <= weakThreshold).length === 0 && (
                            <p className="text-sm text-gray-600">✅ No weak topics - all above {weakThreshold}%!</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {assessmentData.selected_topics.map((topic, index) => (
                            <span key={index} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Additional Topics Selection */}
                    {assessmentData.all_available_topics && assessmentData.all_available_topics.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ➕ Add Extra Topics (Optional - Scoring Above {weakThreshold}%)
                        </label>
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                          <div className="space-y-2">
                            {assessmentData.all_available_topics
                              .filter(t => t.current_score > weakThreshold) // Topics where student is doing well
                              .map((topic) => (
                                <label key={topic.topic} className="flex items-center justify-between p-2 hover:bg-blue-100 rounded">
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      checked={assessmentData.selected_topics.includes(topic.topic)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          const newTopics = [...assessmentData.selected_topics, topic.topic];
                                          setAssessmentData({
                                            ...assessmentData,
                                            selected_topics: newTopics
                                          });
                                          fetchAvailableSubtopics(newTopics);
                                        } else {
                                          const newTopics = assessmentData.selected_topics.filter(t => t !== topic.topic);
                                          setAssessmentData({
                                            ...assessmentData,
                                            selected_topics: newTopics
                                          });
                                          if (newTopics.length > 0) {
                                            fetchAvailableSubtopics(newTopics);
                                          }
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <span className="font-medium">{topic.topic}</span>
                                  </div>
                                  <span className="text-sm text-green-600">{topic.current_score}%</span>
                                </label>
                              ))}
                            {assessmentData.all_available_topics.filter(t => t.current_score > weakThreshold).length === 0 && (
                              <p className="text-sm text-gray-600">No additional topics available (all are at or below {weakThreshold}%)</p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Tip: Add strong topics to ensure comprehensive understanding or for extra practice
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Subtopics Selection */}
                  {availableSubtopics.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Subtopics (optional - leave empty for all)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableSubtopics.map((subtopic) => (
                          <label key={subtopic} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={assessmentData.selected_subtopics.includes(subtopic)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAssessmentData({
                                    ...assessmentData,
                                    selected_subtopics: [...assessmentData.selected_subtopics, subtopic]
                                  });
                                } else {
                                  setAssessmentData({
                                    ...assessmentData,
                                    selected_subtopics: assessmentData.selected_subtopics.filter(s => s !== subtopic)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{subtopic}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generation Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Selection Mode</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setAssessmentData({...assessmentData, generation_mode: 'auto'})}
                        className={`flex-1 py-3 rounded-lg border-2 ${assessmentData.generation_mode === 'auto' ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-300'}`}
                      >
                        🤖 Auto-Generate (AI Picks)
                      </button>
                      <button
                        onClick={() => setAssessmentData({...assessmentData, generation_mode: 'manual'})}
                        className={`flex-1 py-3 rounded-lg border-2 ${assessmentData.generation_mode === 'manual' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300'}`}
                        disabled
                      >
                        ✍️ Manual (Coming Soon)
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Auto-generate will select questions based on time duration and selected topics/subtopics
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => setShowAssessmentModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleGenerateAssessment}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white"
                    >
                      {loading ? '⏳ Generating...' : '✨ Generate Assessment'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Result Modal */}
        {showEditModal && editingResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-800">✏️ Edit Result</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingResult(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>{editingResult.student_name}</strong> - {editingResult.exam_type}</p>
                  <p>{editingResult.level} {editingResult.subject} | {editingResult.location}</p>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">Edit topic scores below. Percentages will be recalculated automatically.</p>
                
                <div className="space-y-4">
                  {editingResult.topics.map((topic, index) => (
                    <div key={index} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Topic Name</label>
                          <input
                            type="text"
                            value={topic.topic_name}
                            onChange={(e) => {
                              const newTopics = [...editingResult.topics];
                              newTopics[index].topic_name = e.target.value;
                              setEditingResult({ ...editingResult, topics: newTopics });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Marks Scored</label>
                          <input
                            type="number"
                            step="0.5"
                            value={topic.marks}
                            onChange={(e) => updateEditingTopic(index, 'marks', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Total Marks</label>
                          <input
                            type="number"
                            step="0.5"
                            value={topic.total_marks}
                            onChange={(e) => updateEditingTopic(index, 'total_marks', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className={`text-lg font-bold ${
                          topic.percentage >= 75 ? 'text-green-600' :
                          topic.percentage >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {topic.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingResult(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEditedResult}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white"
                  >
                    {loading ? '⏳ Saving...' : '💾 Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathAnalysis;
