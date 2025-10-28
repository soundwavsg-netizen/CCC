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

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://tuition-chatbot.preview.emergentagent.com';

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

  // Fetch students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/math-analysis/students`);
      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
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
      const response = await axios.post(`${BACKEND_URL}/api/math-analysis/analytics`, filters);
      if (response.data.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      setMessage('❌ Error fetching analytics: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisionPlan = async (studentId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/math-analysis/revision-plan/${studentId}`);
      if (response.data.success) {
        setRevisionPlan(response.data);
      }
    } catch (error) {
      setMessage('❌ Error fetching revision plan: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PageHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📊 Math Results Analysis System
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload, analyze, and track student performance across assessments. 
            Get AI-powered insights and revision plans for weak topics.
          </p>
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
                        <input
                          type="text"
                          required
                          value={pdfStudentInfo.location}
                          onChange={(e) => setPdfStudentInfo({ ...pdfStudentInfo, location: e.target.value })}
                          placeholder="e.g., RMSS Tampines"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                        <select
                          required
                          value={pdfStudentInfo.level}
                          onChange={(e) => setPdfStudentInfo({ ...pdfStudentInfo, level: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Level</option>
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
                          value={pdfStudentInfo.subject}
                          onChange={(e) => setPdfStudentInfo({ ...pdfStudentInfo, subject: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Subject</option>
                          <option value="E.Math">E.Math</option>
                          <option value="A.Math">A.Math</option>
                          <option value="Pure Math">Pure Math</option>
                          <option value="Statistics">Statistics</option>
                        </select>
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
                      <input
                        type="text"
                        required
                        value={manualForm.location}
                        onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                        placeholder="e.g., RMSS Tampines"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                      <select
                        required
                        value={manualForm.level}
                        onChange={(e) => setManualForm({ ...manualForm, level: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Level</option>
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
                        value={manualForm.subject}
                        onChange={(e) => setManualForm({ ...manualForm, subject: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Subject</option>
                        <option value="E.Math">E.Math</option>
                        <option value="A.Math">A.Math</option>
                        <option value="Pure Math">Pure Math</option>
                        <option value="Statistics">Statistics</option>
                      </select>
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
                  <option value="RMSS Tampines">RMSS Tampines</option>
                  <option value="RMSS Bedok">RMSS Bedok</option>
                  <option value="Online">Online</option>
                </select>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Levels</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                  <option value="S4">S4</option>
                  <option value="J1">J1</option>
                  <option value="J2">J2</option>
                </select>
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Subjects</option>
                  <option value="E.Math">E.Math</option>
                  <option value="A.Math">A.Math</option>
                  <option value="Pure Math">Pure Math</option>
                  <option value="Statistics">Statistics</option>
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Select Student for Revision Plan</h3>
              {students.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {students.map((student) => (
                    <div
                      key={student.student_id}
                      onClick={() => {
                        setSelectedStudent(student);
                        fetchRevisionPlan(student.student_id);
                      }}
                      className="p-4 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer"
                    >
                      <p className="font-semibold text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.level} {student.subject}</p>
                      <p className="text-xs text-gray-500">{student.location}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No students found. Please upload results first.</p>
              )}

              {revisionPlan && (
                <div className="mt-8 border-t pt-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">
                    Revision Plan for {revisionPlan.student_name}
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Level:</strong> {revisionPlan.level} | 
                      <strong> Subject:</strong> {revisionPlan.subject} | 
                      <strong> Exam:</strong> {revisionPlan.exam_type} | 
                      <strong> Score:</strong> {revisionPlan.overall_score}%
                    </p>
                  </div>
                  {revisionPlan.revision_plan.length > 0 ? (
                    <div className="space-y-4">
                      {revisionPlan.revision_plan.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold text-gray-800">{index + 1}. {item.topic}</h5>
                            <span className="text-sm text-red-600">Current: {item.current_score}%</span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            {item.resources.pdf && (
                              <a href={item.resources.pdf} className="text-blue-600 hover:underline">📄 PDF</a>
                            )}
                            {item.resources.video && (
                              <a href={item.resources.video} className="text-blue-600 hover:underline">🎥 Video</a>
                            )}
                            {item.resources.worksheet && (
                              <a href={item.resources.worksheet} className="text-blue-600 hover:underline">📝 Worksheet</a>
                            )}
                            {item.resources.note && (
                              <span className="text-gray-500">{item.resources.note}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 text-center py-4">
                      🎉 Great work! No weak topics found.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathAnalysis;
