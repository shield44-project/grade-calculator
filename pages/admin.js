// pages/admin.js
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storageType, setStorageType] = useState('');
  const [count, setCount] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/admin-data?password=${encodeURIComponent(adminPassword)}`);
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setSubmissions(data.submissions || []);
        setCount(data.count || 0);
        setStorageType(data.storage || 'unknown');
        localStorage.setItem('admin-password', adminPassword);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    const savedPassword = localStorage.getItem('admin-password');
    if (!savedPassword) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin-data?password=${encodeURIComponent(savedPassword)}`);
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setSubmissions(data.submissions || []);
        setCount(data.count || 0);
        setStorageType(data.storage || 'unknown');
        setAdminPassword(savedPassword);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword('');
    setSubmissions([]);
    localStorage.removeItem('admin-password');
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getDeviceDisplay = (deviceInfo) => {
    if (!deviceInfo) return 'Unknown';
    return `${deviceInfo.os} - ${deviceInfo.browser} (${deviceInfo.device})`;
  };

  const toggleRowExpansion = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleDeleteSubmission = async (index) => {
    if (deleteConfirm !== index) {
      setDeleteConfirm(index);
      return;
    }

    setLoading(true);
    try {
      const savedPassword = localStorage.getItem('admin-password');
      const response = await fetch(`/api/delete-submission?password=${encodeURIComponent(savedPassword)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ index }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh data after deletion
        await loadData();
        setDeleteConfirm(null);
        setExpandedRow(null);
      } else {
        alert(data.error || 'Failed to delete submission');
      }
    } catch (err) {
      alert('Failed to delete submission');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push(['Username', 'Login Time', 'Submission Time', 'SGPA', 'Device', 'OS', 'Browser', 'IP Address'].join(','));

    submissions.forEach(sub => {
      const row = [
        sub.username || 'Guest',
        sub.loginTime ? formatDate(sub.loginTime) : 'N/A',
        formatDate(sub.timestamp),
        sub.data?.sgpa || 'N/A',
        sub.deviceInfo?.device || 'N/A',
        sub.deviceInfo?.os || 'N/A',
        sub.deviceInfo?.browser || 'N/A',
        sub.ipAddress || 'N/A'
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <Head>
          <title>Admin Login - RVCE Grade Calculator</title>
        </Head>

        <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Admin Access</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="adminPassword" className="block text-gray-300 text-sm font-medium mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="Enter admin password"
                required
              />
              <p className="mt-2 text-sm text-gray-400">
                Default password: <span className="text-purple-400 font-mono">bozgors</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-8">
      <Head>
        <title>Admin Dashboard - RVCE Grade Calculator</title>
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">
              Total Submissions: {count} | Storage: {storageType}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading submissions...</p>
          </div>
        )}

        {/* Data Table */}
        {!loading && submissions.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-xl">
            <p className="text-gray-400 text-lg">No submissions yet</p>
          </div>
        )}

        {!loading && submissions.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      SGPA
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Login Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Submission Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Device Info
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {submissions.map((submission, index) => (
                    <>
                      <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => toggleRowExpansion(index)}
                            className="text-purple-400 hover:text-purple-300 focus:outline-none"
                            title="View course details"
                          >
                            <svg
                              className={`w-5 h-5 transform transition-transform ${expandedRow === index ? 'rotate-90' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {submission.username ? (
                              <>
                                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                </svg>
                                <span className="text-white font-medium">{submission.username}</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-500">Guest</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
                            {submission.data?.sgpa || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {submission.loginTime ? formatDate(submission.loginTime) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(submission.timestamp)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {getDeviceDisplay(submission.deviceInfo)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 font-mono">
                          {submission.ipAddress || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {deleteConfirm === index ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteSubmission(index)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={cancelDelete}
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeleteSubmission(index)}
                              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded transition-colors border border-red-600/30"
                              title="Delete submission"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedRow === index && (
                        <tr key={`${index}-detail`}>
                          <td colSpan="8" className="px-4 py-4 bg-gray-900/50">
                            <div className="space-y-4">
                              {/* Complete Submission Information */}
                              <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
                                <h4 className="text-lg font-semibold text-white mb-3">Complete Submission Data</h4>
                                
                                {/* User Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                  <div className="bg-gray-900/50 rounded p-3">
                                    <p className="text-xs text-gray-400 mb-1">Username</p>
                                    <p className="text-sm text-white font-semibold">{submission.username || 'Guest'}</p>
                                  </div>
                                  <div className="bg-gray-900/50 rounded p-3">
                                    <p className="text-xs text-gray-400 mb-1">Login Time</p>
                                    <p className="text-sm text-white font-semibold">{submission.loginTime ? formatDate(submission.loginTime) : 'N/A'}</p>
                                  </div>
                                  <div className="bg-gray-900/50 rounded p-3">
                                    <p className="text-xs text-gray-400 mb-1">Submission Time</p>
                                    <p className="text-sm text-white font-semibold">{formatDate(submission.timestamp)}</p>
                                  </div>
                                  <div className="bg-gray-900/50 rounded p-3">
                                    <p className="text-xs text-gray-400 mb-1">IP Address</p>
                                    <p className="text-sm text-white font-semibold font-mono">{submission.ipAddress || 'N/A'}</p>
                                  </div>
                                  <div className="bg-gray-900/50 rounded p-3">
                                    <p className="text-xs text-gray-400 mb-1">Operating System</p>
                                    <p className="text-sm text-white font-semibold">{submission.deviceInfo?.os || 'Unknown'}</p>
                                  </div>
                                  <div className="bg-gray-900/50 rounded p-3">
                                    <p className="text-xs text-gray-400 mb-1">Browser</p>
                                    <p className="text-sm text-white font-semibold">{submission.deviceInfo?.browser || 'Unknown'}</p>
                                  </div>
                                  <div className="bg-gray-900/50 rounded p-3">
                                    <p className="text-xs text-gray-400 mb-1">Device Type</p>
                                    <p className="text-sm text-white font-semibold">{submission.deviceInfo?.device || 'Unknown'}</p>
                                  </div>
                                  <div className="bg-gray-900/50 rounded p-3">
                                    <p className="text-xs text-gray-400 mb-1">SGPA</p>
                                    <p className="text-sm text-white font-semibold text-purple-400 text-lg">{submission.data?.sgpa || 'N/A'}</p>
                                  </div>
                                  <div className="bg-gray-900/50 rounded p-3">
                                    <p className="text-xs text-gray-400 mb-1">Total Courses</p>
                                    <p className="text-sm text-white font-semibold">{submission.data?.courses?.length || 0}</p>
                                  </div>
                                </div>

                                {/* User Agent String */}
                                {submission.userAgent && (
                                  <div className="bg-gray-900/50 rounded p-3 mt-3">
                                    <p className="text-xs text-gray-400 mb-1">User Agent</p>
                                    <p className="text-xs text-gray-300 font-mono break-all">{submission.userAgent}</p>
                                  </div>
                                )}
                              </div>

                              {/* Course Details */}
                              {submission.data?.courses && submission.data.courses.length > 0 && (
                                <div>
                                  <h4 className="text-lg font-semibold text-white mb-3">Course Details ({submission.data.courses.length} courses)</h4>
                                  <div className="grid gap-3">
                                {submission.data.courses.map((course, courseIdx) => {
                                  if (!course.courseDetails) return null;
                                  const hasCIE = course.results?.totalCie > 0;
                                  const hasSEE = course.results?.see !== undefined && course.results?.see !== null;
                                  
                                  return (
                                    <div key={courseIdx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                      <div className="flex justify-between items-start mb-3">
                                        <div>
                                          <h5 className="text-white font-medium">
                                            {course.courseDetails.code} - {course.courseDetails.title}
                                          </h5>
                                          <p className="text-sm text-gray-400">
                                            Credits: {course.courseDetails.credits} | Type: {course.courseDetails.type}
                                          </p>
                                        </div>
                                        {course.results?.grade && (
                                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                            course.results.grade === 'O' ? 'bg-green-500/20 text-green-300' :
                                            course.results.grade === 'A+' ? 'bg-blue-500/20 text-blue-300' :
                                            course.results.grade === 'A' ? 'bg-purple-500/20 text-purple-300' :
                                            course.results.grade === 'F' ? 'bg-red-500/20 text-red-300' :
                                            'bg-yellow-500/20 text-yellow-300'
                                          }`}>
                                            {course.results.grade} ({course.results.points} pts)
                                          </span>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        {hasCIE && (
                                          <div className="bg-gray-900/50 rounded p-2">
                                            <p className="text-gray-400 text-xs mb-1">CIE Marks</p>
                                            <p className="text-white font-semibold">
                                              {course.results.totalCie}/{course.courseDetails.cieMax}
                                              <span className="text-gray-400 text-xs ml-1">
                                                ({((course.results.totalCie / course.courseDetails.cieMax) * 100).toFixed(1)}%)
                                              </span>
                                            </p>
                                          </div>
                                        )}
                                        {hasSEE && (
                                          <div className="bg-gray-900/50 rounded p-2">
                                            <p className="text-gray-400 text-xs mb-1">SEE Marks</p>
                                            <p className="text-white font-semibold">
                                              {course.results.see}/{course.courseDetails.seeMax}
                                              <span className="text-gray-400 text-xs ml-1">
                                                ({((course.results.see / course.courseDetails.seeMax) * 100).toFixed(1)}%)
                                              </span>
                                            </p>
                                          </div>
                                        )}
                                        {course.results?.finalScore !== undefined && (
                                          <div className="bg-gray-900/50 rounded p-2">
                                            <p className="text-gray-400 text-xs mb-1">Final Score</p>
                                            <p className="text-white font-semibold">{course.results.finalScore.toFixed(2)}/100</p>
                                          </div>
                                        )}
                                        {course.results?.isPass !== undefined && (
                                          <div className="bg-gray-900/50 rounded p-2">
                                            <p className="text-gray-400 text-xs mb-1">Status</p>
                                            <p className={`font-semibold ${course.results.isPass ? 'text-green-400' : 'text-red-400'}`}>
                                              {course.results.isPass ? 'Pass' : 'Fail'}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                      {/* CIE Components Breakdown */}
                                      {course.cieMarks && Object.keys(course.cieMarks).length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-700">
                                          <p className="text-xs text-gray-400 mb-2 font-semibold">CIE Components (Detailed Breakdown):</p>
                                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {Object.entries(course.cieMarks).map(([key, value]) => {
                                              // Format the key to be more readable
                                              const formattedKey = key
                                                .replace(/([A-Z])/g, ' $1')
                                                .replace(/^./, str => str.toUpperCase())
                                                .trim();
                                              
                                              return (
                                                <div key={key} className="bg-gray-900/70 px-3 py-2 rounded border border-gray-700">
                                                  <p className="text-xs text-gray-400 mb-1">{formattedKey}</p>
                                                  <p className="text-sm text-white font-semibold">{value || 'N/A'}</p>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* SEE Marks Breakdown */}
                                      {course.seeMarks && Object.keys(course.seeMarks).length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-700">
                                          <p className="text-xs text-gray-400 mb-2 font-semibold">SEE Marks (Detailed Breakdown):</p>
                                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {Object.entries(course.seeMarks).map(([key, value]) => {
                                              // Format the key to be more readable
                                              const formattedKey = key
                                                .replace(/([A-Z])/g, ' $1')
                                                .replace(/^./, str => str.toUpperCase())
                                                .trim();
                                              
                                              return (
                                                <div key={key} className="bg-gray-900/70 px-3 py-2 rounded border border-gray-700">
                                                  <p className="text-xs text-gray-400 mb-1">{formattedKey}</p>
                                                  <p className="text-sm text-white font-semibold">{value || 'N/A'}</p>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                </div>
                              </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
