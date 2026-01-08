// pages/admin.js
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storageType, setStorageType] = useState('');
  const [count, setCount] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/admin-data?key=${encodeURIComponent(adminKey)}`);
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setSubmissions(data.submissions || []);
        setCount(data.count || 0);
        setStorageType(data.storage || 'unknown');
        localStorage.setItem('admin-key', adminKey);
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
    const savedKey = localStorage.getItem('admin-key');
    if (!savedKey) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin-data?key=${encodeURIComponent(savedKey)}`);
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setSubmissions(data.submissions || []);
        setCount(data.count || 0);
        setStorageType(data.storage || 'unknown');
        setAdminKey(savedKey);
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
    setAdminKey('');
    setSubmissions([]);
    localStorage.removeItem('admin-key');
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
              <label htmlFor="adminKey" className="block text-gray-300 text-sm font-medium mb-2">
                Admin Key
              </label>
              <input
                type="password"
                id="adminKey"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="Enter admin key"
                required
              />
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {submissions.map((submission, index) => (
                    <tr key={index} className="hover:bg-gray-700/50 transition-colors">
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
                    </tr>
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
