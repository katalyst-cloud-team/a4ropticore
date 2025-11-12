import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronDown,
  Laptop,
  Clock,
  Server,
  Activity,
  Eye,
  EyeOff,
  Cpu,
  MemoryStick,
  HardDrive,
  Layers,
  Terminal,
  X,
  AppWindow,
  CirclePlay,
  ChartPie,
  Download,
  AlertTriangle,
  Menu,
  Database,
} from 'lucide-react';
import { machineAPI, downloadEventPdf } from './config/api';
import { ErrorCard } from './ErrorCard';

const parseUSDateTime = (datetimeStr) => {
  if (!datetimeStr) return null;
  const [datePart, timePart] = datetimeStr.trim().split(' ');
  if (!datePart || !timePart) return null;
  const [month, day, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':').map(Number);
  if (!month || !day || !year || isNaN(hour) || isNaN(minute)) return null;
  const date = new Date(year, month - 1, day, hour, minute, second || 0);
  return isNaN(date.getTime()) ? null : date;
};

const formatTime12H = (datetimeString) => {
  if (!datetimeString) return 'N/A';
  const date = parseUSDateTime(datetimeString);
  if (!date || isNaN(date.getTime())) return 'N/A';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const formatDate = (datetimeString) => {
  if (!datetimeString) return 'N/A';
  const date = parseUSDateTime(datetimeString);
  if (!date || isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDuration = (durationStr) => {
  if (!durationStr || durationStr === 'N/A') return 'N/A';
  const minMatch = durationStr.match(/(\d+)\s*min/);
  const secMatch = durationStr.match(/(\d+)\s*sec/);
  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
  const seconds = secMatch ? parseInt(secMatch[1], 10) : 0;
  const totalSeconds = minutes * 60 + seconds;
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const parts = [];
  if (hrs > 0) parts.push(`${hrs} hr${hrs !== 1 ? 's' : ''}`);
  if (mins > 0) parts.push(`${mins} min${mins !== 1 ? 's' : ''}`);
  if (secs > 0 && hrs === 0) parts.push(`${secs} sec${secs !== 1 ? 's' : ''}`);
  if (parts.length === 0) return '0 secs';
  return parts.join(' ');
};


const isMostlyInvalid = (data) => {
  const isCpuEvent = data.cpu_event || false;
  const isRamEvent = data.ram_event || false;
  const isDiskEvent = data.disk_event || false;
  if (!isCpuEvent && !isRamEvent && !isDiskEvent) {
    return true;
  }
  else
  {
    return false;
  }
};

const EventDetails = () => {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    cpu: false,
    ram: false,
    storage: false,
    applications: false,
    processes: false,
    diskIO: false,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetchEventData();
  }, [uuid]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await downloadEventPdf(uuid);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await machineAPI.getMachineByUUID(uuid);
      setEventData(response.data);
      if (response.data) {
        setExpandedSections({
          cpu: response.data.cpu_event || false,
          ram: response.data.ram_event || false,
          storage: response.data.disk_event || false,
          applications: false,
          processes: false,
          diskIO: false, 
        });
      }
    } catch (err) {
      console.error('Error fetching event ', err);
      setError('Event data not found or is incomplete');
    } finally {
      setLoading(false);
    }
  };

  const parsePercentage = (percentString) => {
    if (!percentString || percentString === 'N/A') return 0;
    const num = parseFloat(percentString.replace('%', ''));
    return isNaN(num) ? 0 : Math.min(num, 100);
  };

  const formatBytes = (gbString) => {
    if (!gbString || gbString === 'N/A') return '0 GB';
    const gb = parseFloat(gbString);
    return `${gb.toFixed(1)} GB`;
  };

  const formatMB = (mbValue) => {
    if (typeof mbValue !== 'number') return 'N/A';
    return `${mbValue.toFixed(1)} MB`;
  };

  const getUserInitials = (username) => {
    if (!username) return '??';
    return username
      .split('_')
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getUserColor = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-cyan-500',
    ];
    return colors[index % colors.length];
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gray-50">
      {isMobile && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span className="hidden md:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {!isMobile && (
        <div className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
      )}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute top-0 left-0 h-full w-64 bg-white shadow-lg z-10">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-gray-900">
                {eventData?.no_of_active_users === 0 ? 'System Event Details' : 'Event Details'}
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900">
                    {eventData?.no_of_active_users === 0 ? 'System Event Details' : 'Event Details'}
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <Cpu className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] mt-1 text-gray-500">CPU</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MemoryStick className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] mt-1 text-gray-500">Memory</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <HardDrive className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] mt-1 text-gray-500">Storage</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
                    <div className="space-y-2">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {!isMobile && (
        <div className="flex pt-16">
          <div className="w-80 bg-white border-r border-gray-200 p-6 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  {eventData?.no_of_active_users === 0 ? 'System Event Details' : 'Event Details'}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <Cpu className={`w-4 h-4 ${eventData?.cpu_event ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-[10px] mt-1 text-gray-500">CPU</span>
                </div>
                <div className="flex flex-col items-center">
                  <MemoryStick className={`w-4 h-4 ${eventData?.ram_event ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className="text-[10px] mt-1 text-gray-500">Memory</span>
                </div>
                <div className="flex flex-col items-center">
                  <HardDrive className={`w-4 h-4 ${eventData?.disk_event ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className="text-[10px] mt-1 text-gray-500">Storage</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 ml-80 p-6 space-y-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {isMobile && (
        <div className="pt-16 pb-20">
          <div className="p-4 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorCard error={error || 'Event not found'} onRetry={fetchEventData} showRetry={true} showBack={true}/>
      </div>
    );
  }

  const hasCPUAlert = eventData.cpu_event || false;
  const hasRAMAlert = eventData.ram_event || false;
  const hasStorageAlert = eventData.disk_event || false;
  const userData = eventData.Userwise
    ? Object.entries(eventData.Userwise).map(([username, user]) => ({
        ...user,
        username,
      }))
    : [];
  const computerName = eventData.computer_name || 'Unknown';
  const ipAddress = eventData.ip || 'Unknown';
  const cpuPercent = eventData.cpu_percent || '0%';
  const memoryInfo = eventData.memory_info;
  const diskInfo = eventData.disk_info;
  const snapshots = eventData.snapshots;
  const topApplications = eventData.top_applications || [];
  const topProcesses = eventData.top_processes || [];
  const activeUsers = eventData.no_of_active_users || 0;
  const isSystemEvent = activeUsers === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading || isSystemEvent}
                className={`px-3 py-1.5 text-white text-xs rounded flex items-center gap-1 ${
                  isSystemEvent
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400'
                }`}
              >
                <Download className="w-3 h-3" />
                <span className="hidden md:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Desktop Header */}
      {!isMobile && (
        <div className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading || isSystemEvent || isMostlyInvalid(eventData)}
              className={`px-4 py-2 text-white text-sm rounded flex items-center gap-2 ${
                isSystemEvent
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400'
              }`}
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
      )}
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto">
          <div className="absolute top-0 left-0 h-full w-64 bg-white shadow-lg z-10">
            <div className={`p-4 border-b flex justify-between items-center border-gray-200`}>
              <h2 className={isSystemEvent ? 'text-red-700 text-xl font-bold' : 'text-blue-700 text-xl font-bold'}>
                {isSystemEvent ? 'System Event Details' : 'Event Details'}
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className={isSystemEvent ? 'text-black hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <Cpu className={`w-4 h-4 ${hasCPUAlert ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-[10px] mt-1 text-gray-500">CPU</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MemoryStick className={`w-4 h-4 ${hasRAMAlert ? 'text-orange-600' : 'text-gray-400'}`} />
                    <span className="text-[10px] mt-1 text-gray-500">Memory</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <HardDrive className={`w-4 h-4 ${hasStorageAlert ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className="text-[10px] mt-1 text-gray-500">Storage</span>
                  </div>
                </div>
              </div>
              {hasStorageAlert && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium mb-2">Storage Usage Alert</p>
                      <p className="text-xs text-yellow-700 mb-3">
                        This machine's storage usage is above threshold. Click below to view detailed storage data.
                      </p>
                      <button
                        onClick={() => {
                          const isoCreatedAt = eventData.created_at;
                          const searchParams = new URLSearchParams({
                            created_at: isoCreatedAt,
                          }).toString();
                          navigate(`/storage/${ipAddress}?${searchParams}`);
                          setSidebarOpen(false);
                        }}
                        className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2.5 py-1 rounded flex items-center gap-1"
                      >
                        <HardDrive className="w-3 h-3" />
                        View Storage Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Machine Info</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">IP Address:</span>
                    <p className="font-mono flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-gray-500" />
                      {ipAddress}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Hostname:</span>
                    <p className="font-mono">{computerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Event Duration:</span>
                    <p className="font-mono">{formatDuration(eventData.event_duration)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Active Users:</span>
                    <p className="font-mono">{activeUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Time Range</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Start</span>
                    <div className="ml-2 mt-1 space-y-1">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-mono">{formatDate(eventData.event_start_time)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <p className="font-mono">{formatTime12H(eventData.event_start_time)}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">End</span>
                    <div className="ml-2 mt-1 space-y-1">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-mono">{formatDate(eventData.event_end_time)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <p className="font-mono">{formatTime12H(eventData.event_end_time)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ChartPie className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Resource Usage</span>
                </div>
                {(eventData?.status === 'system' || eventData?.status === 'missing') ? (
                  <p className="text-sm text-gray-500 italic">
                    This is a system-level event. Accurate resource usage data is not available.
                  </p>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> CPU Usage
                        </span>
                        <span className="font-medium">{cpuPercent}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-700 h-2.5 rounded-full"
                          style={{ width: `${parsePercentage(cpuPercent)}%` }}
                        />
                      </div>
                    </div>
                    {memoryInfo && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 flex items-center gap-1">
                            <MemoryStick className="w-3 h-3" /> RAM Usage
                          </span>
                          <span className="font-medium">{memoryInfo.PercentUsed}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-orange-700 h-2.5 rounded-full"
                            style={{ width: `${parsePercentage(memoryInfo.PercentUsed)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatBytes(memoryInfo.UsedGB)} / {formatBytes(memoryInfo.TotalGB)}
                        </p>
                      </div>
                    )}
                    {diskInfo && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 flex items-center gap-1">
                            <HardDrive className="w-3 h-3" /> Storage Usage
                          </span>
                          <span className="font-medium">{diskInfo.PercentUsed}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-purple-700 h-2.5 rounded-full"
                            style={{ width: `${parsePercentage(diskInfo.PercentUsed)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatBytes(diskInfo.UsedGB)} / {formatBytes(diskInfo.TotalGB)}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Desktop Layout */}
      {!isMobile && (
        <div className="flex pt-16 overflow-y-auto">
          <div
            className={`w-80 p-6 fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto`}
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-6 w-6" />
                <h1 className={isSystemEvent ? 'text-red-700 text-xl font-bold' : 'text-blue-700 text-xl font-bold'}>
                  {isSystemEvent ? 'System Event Details' : 'Event Details'}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <Cpu className={`w-4 h-4 ${hasCPUAlert ? 'text-blue-500' : 'text-gray-300'}`} />
                  <span className="text-[10px] mt-1 text-gray-500">CPU</span>
                </div>
                <div className="flex flex-col items-center">
                  <MemoryStick className={`w-4 h-4 ${hasRAMAlert ? 'text-orange-500' : 'text-gray-300'}`} />
                  <span className="text-[10px] mt-1 text-gray-500">Memory</span>
                </div>
                <div className="flex flex-col items-center">
                  <HardDrive className={`w-4 h-4 ${hasStorageAlert ? 'text-purple-500' : 'text-gray-300'}`} />
                  <span className="text-[10px] mt-1 text-gray-500">Storage</span>
                </div>
              </div>
            </div>
            {hasStorageAlert && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium mb-2">Storage Usage Alert</p>
                    <p className="text-xs text-yellow-700 mb-3">
                      This machine's storage usage is above threshold. Click below to view detailed storage data.
                    </p>
                    <button
                      onClick={() => {
                        const isoCreatedAt = eventData.created_at;
                        const searchParams = new URLSearchParams({
                          created_at: isoCreatedAt,
                        }).toString();
                        navigate(`/storage/${ipAddress}?${searchParams}`);
                      }}
                      className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2.5 py-1 rounded flex items-center gap-1"
                    >
                      <HardDrive className="w-3 h-3" />
                      View Storage Details
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Server className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Machine Info</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">IP Address:</span>
                  <p className="font-mono flex items-center gap-1">
                    <Laptop className="w-3 h-3 text-gray-500" />
                    {ipAddress}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Hostname:</span>
                  <p className="font-mono">{computerName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Event Duration:</span>
                  <p className="font-mono">{formatDuration(eventData.event_duration)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Active Users:</span>
                  <p className="font-mono">{activeUsers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Time Range</span>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Start</span>
                  <div className="ml-2 mt-1 space-y-1">
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-mono">{formatDate(eventData.event_start_time)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <p className="font-mono">{formatTime12H(eventData.event_start_time)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">End</span>
                  <div className="ml-2 mt-1 space-y-1">
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-mono">{formatDate(eventData.event_end_time)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <p className="font-mono">{formatTime12H(eventData.event_end_time)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <ChartPie className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Resource Usage</span>
              </div>
              {(eventData?.status === 'system' || eventData?.status === 'missing') ? (
                <p className="text-sm text-gray-500 italic">
                  This is a system-level event. Accurate resource usage data is not available.
                </p>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> CPU Usage
                      </span>
                      <span className="font-medium">{cpuPercent}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-700 h-2.5 rounded-full"
                        style={{ width: `${parsePercentage(cpuPercent)}%` }}
                      />
                    </div>
                  </div>
                  {memoryInfo && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 flex items-center gap-1">
                          <MemoryStick className="w-3 h-3" /> RAM Usage
                        </span>
                        <span className="font-medium">{memoryInfo.PercentUsed}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-700 h-2.5 rounded-full"
                          style={{ width: `${parsePercentage(memoryInfo.PercentUsed)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatBytes(memoryInfo.UsedGB)} / {formatBytes(memoryInfo.TotalGB)}
                      </p>
                    </div>
                  )}
                  {diskInfo && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 flex items-center gap-1">
                          <HardDrive className="w-3 h-3" /> Storage Usage
                        </span>
                        <span className="font-medium">{diskInfo.PercentUsed}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-700 h-2.5 rounded-full"
                          style={{ width: `${parsePercentage(diskInfo.PercentUsed)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatBytes(diskInfo.UsedGB)} / {formatBytes(diskInfo.TotalGB)}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT PANEL — MODIFIED TO SHOW CENTERED MESSAGE WHEN isMostlyInvalid */}
          <div className="flex-1 ml-80 p-6 space-y-8">
            {isMostlyInvalid(eventData) ? (
              <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                  <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-red-800 mb-2">Data Collection Issue</h3>
                  <p className="text-red-700">
                    The monitoring scripts were unable to fetch complete data. Please verify that the agent is running properly or consider rebooting the VM.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* CPU Usage - User Breakdown */}
                {!isSystemEvent && userData.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div
                      className="p-6 cursor-pointer flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50"
                      onClick={() => toggleSection('cpu')}
                    >
                      <div className="flex items-center gap-3">
                        <Cpu className={`w-5 h-5 ${hasCPUAlert ? 'text-blue-600' : 'text-blue-400'}`} />
                        <h4 className="text-lg font-bold text-gray-900">CPU Usage - User Breakdown</h4>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          expandedSections.cpu ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedSections.cpu && (
                      <div className="px-6 pb-6 pt-3">
                        <div className="space-y-4">
                          {userData.map((user, index) => {
                            const cpuPercent = parsePercentage(
                              user.Current_User_Metrics?.User_CPU_Percentage || '0%'
                            );
                            return (
                              <div key={index} className="flex items-center gap-4">
                                <div
                                  className={`w-8 h-8 ${getUserColor(index)} rounded-full flex items-center justify-center text-white text-sm font-bold`}
                                >
                                  {getUserInitials(user.username)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-900 truncate">{user.username}</span>
                                    <span className="font-medium">{cpuPercent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-blue-700 h-2.5 rounded-full"
                                      style={{ width: `${cpuPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="mt-4 text-xs text-gray-600 italic">
                          <b>Note:</b> Total CPU usage may vary from the sum of all individual users CPU usage due to
                          system/kernel processes.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {/* RAM Usage - User Breakdown */}
                {!isSystemEvent && userData.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div
                      className="p-6 cursor-pointer flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50"
                      onClick={() => toggleSection('ram')}
                    >
                      <div className="flex items-center gap-3">
                        <MemoryStick className={`w-5 h-5 ${hasRAMAlert ? 'text-orange-600' : 'text-orange-400'}`} />
                        <h4 className="text-lg font-bold text-gray-900">RAM Usage - User Breakdown</h4>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          expandedSections.ram ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedSections.ram && (
                      <div className="px-6 pb-6 pt-3">
                        <div className="space-y-4">
                          {userData.map((user, index) => {
                            const ramPercent = parsePercentage(
                              user.Current_User_Metrics?.User_Memory_Percentage || '0%'
                            );
                            return (
                              <div key={index} className="flex items-center gap-4">
                                <div
                                  className={`w-8 h-8 ${getUserColor(index)} rounded-full flex items-center justify-center text-white text-sm font-bold`}
                                >
                                  {getUserInitials(user.username)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-900 truncate">{user.username}</span>
                                    <span className="font-medium">{ramPercent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className="bg-gradient-to-r from-orange-500 to-orange-700 h-2.5 rounded-full"
                                      style={{ width: `${ramPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="mt-4 text-xs text-gray-600 italic">
                          <b>Note:</b> Total RAM usage may vary from the sum of all individual users RAM usage due to
                          shared/system memory.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {/* Top Applications */}
                {topApplications.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div
                      className="p-6 cursor-pointer flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50"
                      onClick={() => toggleSection('applications')}
                    >
                      <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-green-600" />
                        <h4 className="text-lg font-bold text-gray-900">Top Applications</h4>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          expandedSections.applications ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedSections.applications && (
                      <div className="px-6 pb-6">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Application
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  CPU (%)
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Memory
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Instances
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {topApplications.map((app, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {app.Name || '—'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {typeof app.CPU === 'number' ? app.CPU.toFixed(2) : '—'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {formatMB(app.MemoryMB)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {app.Count || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Top Processes */}
                {topProcesses.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div
                      className="p-6 cursor-pointer flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50"
                      onClick={() => toggleSection('processes')}
                    >
                      <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-amber-600" />
                        <h4 className="text-lg font-bold text-gray-900">Top Processes</h4>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          expandedSections.processes ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedSections.processes && (
                      <div className="px-6 pb-6">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Process
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  PID
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  CPU (%)
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Memory
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {topProcesses.map((proc, index) => (
                                <tr key={proc.PID || index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {proc.Name || '—'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {proc.PID || '—'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {typeof proc.CPU === 'number' ? proc.CPU.toFixed(2) : '—'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {formatMB(proc.MemoryMB)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* CPU Performance Snapshots */}
                {snapshots && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-bold text-gray-900">CPU Performance Snapshots</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Chart
                        snapshots={[...(snapshots.Start?.Before || []), ...(snapshots.Start?.After || [])]}
                        useCpu={true}
                        gradientId="cpuStartGrad"
                        strokeColor="#1d4ed8"
                        fillColor="#3b82f6"
                        title="Event Start Timeline"
                        bgGradient="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                      />
                      <Chart
                        snapshots={snapshots.End || []}
                        useCpu={true}
                        gradientId="cpuEndGrad"
                        strokeColor="#047857"
                        fillColor="#10b981"
                        title="Event End Timeline"
                        bgGradient="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100"
                      />
                    </div>
                  </div>
                )}
                {/* Memory Performance Snapshots */}
                {snapshots && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <MemoryStick className="w-5 h-5 text-orange-600" />
                      <h4 className="text-lg font-bold text-gray-900">Memory Performance Snapshots</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Chart
                        snapshots={[...(snapshots.Start?.Before || []), ...(snapshots.Start?.After || [])]}
                        useCpu={false}
                        gradientId="ramStartGrad"
                        strokeColor="#c2410c"
                        fillColor="#f97316"
                        title="Event Start Timeline"
                        bgGradient="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100"
                      />
                      <Chart
                        snapshots={snapshots.End || []}
                        useCpu={false}
                        gradientId="ramEndGrad"
                        strokeColor="#b45309"
                        fillColor="#f59e0b"
                        title="Event End Timeline"
                        bgGradient="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100"
                      />
                    </div>
                  </div>
                )}
                {/* Disk I/O Snapshots */}
                {snapshots && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div
                      className="p-6 cursor-pointer flex items-center justify-between bg-gradient-to-r from-purple-50 to-fuchsia-50"
                      onClick={() => toggleSection('diskIO')}
                    >
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-purple-600" />
                        <h4 className="text-lg font-bold text-gray-900">Disk I/O Snapshots</h4>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          expandedSections.diskIO ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedSections.diskIO && (
                      <div className="px-6 pb-6">
                        <div className="grid md:grid-cols-2 gap-6 pt-5">
                          <DiskIOChart
                            snapshots={[...(snapshots.Start?.Before || []), ...(snapshots.Start?.After || [])]}
                            title="Event Start Timeline"
                            bgGradient="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100"
                          />
                          <DiskIOChart
                            snapshots={snapshots.End || []}
                            title="Event End Timeline"
                            bgGradient="bg-gradient-to-br from-fuchsia-50 to-pink-50 border-fuchsia-100"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Window Activity Monitor */}
                {!isSystemEvent && userData.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <AppWindow className="h-5 w-5 text-blue-600" />
                        Window Activity Monitor
                      </h3>
                      <p className="text-sm text-red-600 mt-1">
                        <b>Note: Window Activity data is only to be used for internal purpose don't share it with customer's</b>
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userData.map((user, index) => {
                        const visibleWindows = Array.isArray(user.WindowActivity?.visibleWindows)
                          ? user.WindowActivity.visibleWindows
                          : typeof user.WindowActivity?.visibleWindows === 'string'
                          ? [user.WindowActivity.visibleWindows]
                          : [];
                        const hiddenWindows = Array.isArray(user.WindowActivity?.hiddenWindows)
                          ? user.WindowActivity.hiddenWindows
                          : typeof user.WindowActivity?.hiddenWindows === 'string'
                          ? [user.WindowActivity.hiddenWindows]
                          : [];
                        return (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between min-h-[220px]"
                            onClick={() => setSelectedUser(user)}
                          >
                            <div className="space-y-3 text-sm">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 ${getUserColor(index)} rounded-full flex items-center justify-center text-white text-sm font-bold`}
                                >
                                  {getUserInitials(user.username)}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{user.username}</h4>
                                  <p className="text-xs text-gray-500">
                                    {visibleWindows.length} visible, {hiddenWindows.length} hidden
                                  </p>
                                </div>
                              </div>
                              {user.WindowActivity && (
                                <>
                                  <div>
                                    <span className="text-gray-600 font-medium flex items-center gap-1">
                                      <CirclePlay className="w-3 h-3" /> Active Window:
                                    </span>
                                    <p className="text-xs bg-gray-100 p-2 rounded mt-1 font-mono truncate">
                                      {user.WindowActivity.activeWindow || '—'}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 font-medium flex items-center gap-1">
                                      <Eye className="w-3 h-3" /> Visible Windows:
                                    </span>
                                    <ul className="mt-1 space-y-1">
                                      {visibleWindows.slice(0, 2).map((win, i) => (
                                        <li key={i} className="text-xs bg-gray-100 p-2 rounded font-mono truncate">
                                          {win}
                                        </li>
                                      ))}
                                      {visibleWindows.length === 0 && (
                                        <li className="text-xs text-gray-500 italic">None</li>
                                      )}
                                    </ul>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 font-medium flex items-center gap-1">
                                      <EyeOff className="w-3 h-3" /> Minimized Windows:
                                    </span>
                                    <ul className="mt-1 space-y-1">
                                      {hiddenWindows.slice(0, 2).map((win, i) => (
                                        <li key={i} className="text-xs bg-gray-100 p-2 rounded font-mono truncate">
                                          {win}
                                        </li>
                                      ))}
                                      {hiddenWindows.length === 0 && (
                                        <li className="text-xs text-gray-500 italic">None</li>
                                      )}
                                    </ul>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="mt-4 text-xs text-blue-600">Click to view full data</div>
                          </div>
                        );
                      })}
                    </div>
                    {selectedUser && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                            <h3 className="text-lg font-bold">Window Activity - {selectedUser.username}</h3>
                            <button
                              onClick={() => setSelectedUser(null)}
                              className="text-white hover:text-gray-200 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="p-6 overflow-y-auto max-h-[70vh]">
                            {selectedUser.WindowActivity ? (
                              <div className="space-y-5">
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <CirclePlay className="w-4 h-4 text-blue-600" /> Active Window
                                  </h4>
                                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                                    {selectedUser.WindowActivity.activeWindow || '—'}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-green-600" /> Visible Windows
                                  </h4>
                                  <ul className="space-y-2">
                                    {Array.isArray(selectedUser.WindowActivity.visibleWindows)
                                      ? selectedUser.WindowActivity.visibleWindows.map((win, i) => (
                                          <li key={i} className="bg-gray-50 p-3 rounded font-mono text-sm">
                                            {win}
                                          </li>
                                        ))
                                      : typeof selectedUser.WindowActivity.visibleWindows === 'string'
                                      ? [
                                          <li key="single" className="bg-gray-50 p-3 rounded font-mono text-sm">
                                            {selectedUser.WindowActivity.visibleWindows}
                                          </li>,
                                        ]
                                      : [
                                          <li key="none" className="text-gray-500 italic">None</li>,
                                        ]}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <EyeOff className="w-4 h-4 text-red-600" /> Minimized Windows
                                  </h4>
                                  <ul className="space-y-2">
                                    {Array.isArray(selectedUser.WindowActivity.hiddenWindows)
                                      ? selectedUser.WindowActivity.hiddenWindows.map((win, i) => (
                                          <li key={i} className="bg-gray-50 p-3 rounded font-mono text-sm">
                                            {win}
                                          </li>
                                        ))
                                      : typeof selectedUser.WindowActivity.hiddenWindows === 'string'
                                      ? [
                                          <li key="single" className="bg-gray-50 p-3 rounded font-mono text-sm">
                                            {selectedUser.WindowActivity.hiddenWindows}
                                          </li>,
                                        ]
                                      : [
                                          <li key="none" className="text-gray-500 italic">None</li>,
                                        ]}
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-600">No window activity data available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {/* Mobile Layout */}
      {isMobile && (
        <div className="pt-16 pb-20">
          <div className="p-4 space-y-6">
            {isMostlyInvalid(eventData) ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center max-w-xs p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-red-800 mb-1">Data Collection Issue</h3>
                  <p className="text-red-700 text-sm">
                    Monitoring scripts failed to collect data. Check agent status or reboot the VM.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {!isSystemEvent && userData.length > 0 && (
                  <>
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <div
                        className="p-4 cursor-pointer flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50"
                        onClick={() => toggleSection('cpu')}
                      >
                        <div className="flex items-center gap-2">
                          <Cpu className={`w-4 h-4 ${hasCPUAlert ? 'text-blue-600' : 'text-blue-400'}`} />
                          <h4 className="font-bold text-gray-900 text-sm">CPU Usage</h4>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transition-transform ${
                            expandedSections.cpu ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      {expandedSections.cpu && (
                        <div className="px-4 pb-4">
                          <div className="space-y-3 mt-3">
                            {userData.map((user, index) => {
                              const cpuPercent = parsePercentage(
                                user.Current_User_Metrics?.User_CPU_Percentage || '0%'
                              );
                              return (
                                <div key={index} className="flex items-center gap-3">
                                  <div
                                    className={`w-7 h-7 ${getUserColor(index)} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                                  >
                                    {getUserInitials(user.username)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="font-medium text-gray-900 truncate">{user.username}</span>
                                      <span className="font-medium">{cpuPercent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-700 h-2 rounded-full"
                                        style={{ width: `${cpuPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <p className="mt-3 text-xs text-gray-600 italic">
                            <b>Note:</b> Total CPU usage may vary from the sum of all individual users CPU usage due to
                            system/kernel processes.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <div
                        className="p-4 cursor-pointer flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50"
                        onClick={() => toggleSection('ram')}
                      >
                        <div className="flex items-center gap-2">
                          <MemoryStick className={`w-4 h-4 ${hasRAMAlert ? 'text-orange-600' : 'text-orange-400'}`} />
                          <h4 className="font-bold text-gray-900 text-sm">RAM Usage</h4>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transition-transform ${
                            expandedSections.ram ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      {expandedSections.ram && (
                        <div className="px-4 pb-4">
                          <div className="space-y-3 mt-3">
                            {userData.map((user, index) => {
                              const ramPercent = parsePercentage(
                                user.Current_User_Metrics?.User_Memory_Percentage || '0%'
                              );
                              return (
                                <div key={index} className="flex items-center gap-3">
                                  <div
                                    className={`w-7 h-7 ${getUserColor(index)} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                                  >
                                    {getUserInitials(user.username)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="font-medium text-gray-900 truncate">{user.username}</span>
                                      <span className="font-medium">{ramPercent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-gradient-to-r from-orange-500 to-orange-700 h-2 rounded-full"
                                        style={{ width: `${ramPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <p className="mt-3 text-xs text-gray-600 italic">
                            <b>Note:</b> Total RAM usage may vary from the sum of all individual users RAM usage due to
                            shared/system memory.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {topApplications.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div
                      className="p-4 cursor-pointer flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50"
                      onClick={() => toggleSection('applications')}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-green-600" />
                        <h4 className="font-bold text-gray-900 text-sm">Top Applications</h4>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition-transform ${
                          expandedSections.applications ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedSections.applications && (
                      <div className="px-4 pb-4">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  App
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  CPU (%)
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Mem
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {topApplications.map((app, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                                    {app.Name || '—'}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 text-right">
                                    {typeof app.CPU === 'number' ? app.CPU.toFixed(2) : '—'}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 text-right">
                                    {formatMB(app.MemoryMB)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {topProcesses.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div
                      className="p-4 cursor-pointer flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50"
                      onClick={() => toggleSection('processes')}
                    >
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-amber-600" />
                        <h4 className="font-bold text-gray-900 text-sm">Top Processes</h4>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition-transform ${
                          expandedSections.processes ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedSections.processes && (
                      <div className="px-4 pb-4">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Process
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  PID
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  CPU (%)
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Mem
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {topProcesses.map((proc, index) => (
                                <tr key={proc.PID || index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                                    {proc.Name || '—'}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 text-right">
                                    {proc.PID || '—'}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 text-right">
                                    {typeof proc.CPU === 'number' ? proc.CPU.toFixed(2) : '—'}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 text-right">
                                    {formatMB(proc.MemoryMB)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {snapshots && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-gray-900 text-sm">CPU Performance</h4>
                    </div>
                    <div className="space-y-4">
                      <Chart
                        snapshots={[...(snapshots.Start?.Before || []), ...(snapshots.Start?.After || [])]}
                        useCpu={true}
                        gradientId="cpuStartGrad"
                        strokeColor="#1d4ed8"
                        fillColor="#3b82f6"
                        title="Event Start"
                        bgGradient="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                      />
                      <Chart
                        snapshots={snapshots.End || []}
                        useCpu={true}
                        gradientId="cpuEndGrad"
                        strokeColor="#047857"
                        fillColor="#10b981"
                        title="Event End"
                        bgGradient="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100"
                      />
                    </div>
                  </div>
                )}
                {snapshots && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <MemoryStick className="w-4 h-4 text-orange-600" />
                      <h4 className="font-bold text-gray-900 text-sm">Memory Performance</h4>
                    </div>
                    <div className="space-y-4">
                      <Chart
                        snapshots={[...(snapshots.Start?.Before || []), ...(snapshots.Start?.After || [])]}
                        useCpu={false}
                        gradientId="ramStartGrad"
                        strokeColor="#c2410c"
                        fillColor="#f97316"
                        title="Event Start"
                        bgGradient="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100"
                      />
                      <Chart
                        snapshots={snapshots.End || []}
                        useCpu={false}
                        gradientId="ramEndGrad"
                        strokeColor="#b45309"
                        fillColor="#f59e0b"
                        title="Event End"
                        bgGradient="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100"
                      />
                    </div>
                  </div>
                )}
                {snapshots && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div
                      className="p-4 cursor-pointer flex items-center justify-between bg-gradient-to-r from-purple-50 to-fuchsia-50"
                      onClick={() => toggleSection('diskIO')}
                    >
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-purple-600" />
                        <h4 className="font-bold text-gray-900 text-sm">Disk I/O</h4>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition-transform ${
                          expandedSections.diskIO ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedSections.diskIO && (
                      <div className="px-4 pb-4">
                        <div className="space-y-4 pt-5">
                          <DiskIOChart
                            snapshots={[...(snapshots.Start?.Before || []), ...(snapshots.Start?.After || [])]}
                            title="Event Start"
                            bgGradient="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100"
                          />
                          <DiskIOChart
                            snapshots={snapshots.End || []}
                            title="Event End"
                            bgGradient="bg-gradient-to-br from-fuchsia-50 to-pink-50 border-fuchsia-100"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!isSystemEvent && userData.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <AppWindow className="h-4 w-4 text-blue-600" />
                        Window Activity
                      </h3>
                      <p className="text-xs text-red-600 mt-1">
                        Note: Window Activity data is only to be used for internal purpose don't share it with customer's
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {userData.map((user, index) => {
                        const visibleWindows = Array.isArray(user.WindowActivity?.visibleWindows)
                          ? user.WindowActivity.visibleWindows
                          : typeof user.WindowActivity?.visibleWindows === 'string'
                          ? [user.WindowActivity.visibleWindows]
                          : [];
                        const hiddenWindows = Array.isArray(user.WindowActivity?.hiddenWindows)
                          ? user.WindowActivity.hiddenWindows
                          : typeof user.WindowActivity?.hiddenWindows === 'string'
                          ? [user.WindowActivity.hiddenWindows]
                          : [];
                        return (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between min-h-[160px]"
                            onClick={() => setSelectedUser(user)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 ${getUserColor(index)} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                                >
                                  {getUserInitials(user.username)}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">{user.username}</h4>
                                  <p className="text-xs text-gray-500">
                                    {visibleWindows.length} vis, {hiddenWindows.length} hid
                                  </p>
                                </div>
                              </div>
                              {user.WindowActivity && (
                                <div>
                                  <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                                    <CirclePlay className="w-2 h-2" /> Active:
                                  </span>
                                  <p className="text-xs bg-gray-100 p-1 rounded mt-1 font-mono truncate">
                                    {user.WindowActivity.activeWindow || '—'}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 text-xs text-blue-600">Tap to view full details</div>
                          </div>
                        );
                      })}
                    </div>
                    {selectedUser && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-t-lg flex justify-between items-center">
                            <h3 className="text-sm font-bold">Window Activity - {selectedUser.username}</h3>
                            <button
                              onClick={() => setSelectedUser(null)}
                              className="text-white hover:text-gray-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4 overflow-y-auto max-h-[70vh]">
                            {selectedUser.WindowActivity ? (
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                                    <CirclePlay className="w-3 h-3 text-blue-600" /> Active Window
                                  </h4>
                                  <div className="bg-gray-50 p-2 rounded-lg text-xs font-mono">
                                    {selectedUser.WindowActivity.activeWindow || '—'}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                                    <Eye className="w-3 h-3 text-green-600" /> Visible Windows
                                  </h4>
                                  <ul className="space-y-1">
                                    {Array.isArray(selectedUser.WindowActivity.visibleWindows)
                                      ? selectedUser.WindowActivity.visibleWindows.map((win, i) => (
                                          <li key={i} className="bg-gray-50 p-2 rounded text-xs font-mono">
                                            {win}
                                          </li>
                                        ))
                                      : typeof selectedUser.WindowActivity.visibleWindows === 'string'
                                      ? [
                                          <li key="single" className="bg-gray-50 p-2 rounded text-xs font-mono">
                                            {selectedUser.WindowActivity.visibleWindows}
                                          </li>,
                                        ]
                                      : [
                                          <li key="none" className="text-xs text-gray-500 italic">None</li>,
                                        ]}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                                    <EyeOff className="w-3 h-3 text-red-600" /> Minimized Windows
                                  </h4>
                                  <ul className="space-y-1">
                                    {Array.isArray(selectedUser.WindowActivity.hiddenWindows)
                                      ? selectedUser.WindowActivity.hiddenWindows.map((win, i) => (
                                          <li key={i} className="bg-gray-50 p-2 rounded text-xs font-mono">
                                            {win}
                                          </li>
                                        ))
                                      : typeof selectedUser.WindowActivity.hiddenWindows === 'string'
                                      ? [
                                          <li key="single" className="bg-gray-50 p-2 rounded text-xs font-mono">
                                            {selectedUser.WindowActivity.hiddenWindows}
                                          </li>,
                                        ]
                                      : [
                                          <li key="none" className="text-xs text-gray-500 italic">None</li>,
                                        ]}
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">No window activity data available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const createLineChartPath = (points) => {
  if (points.length === 0) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`; 
  }
  return path;
};

const detectSpike = (points) => {
  if (points.length < 3) return { start: 0, end: points.length - 1 };
  let maxIdx = 0;
  let maxVal = points[0].pct;
  points.forEach((p, i) => {
    if (p.pct > maxVal) {
      maxVal = p.pct;
      maxIdx = i;
    }
  });
  const threshold = maxVal * 0.3;
  let startIdx = 0;
  for (let i = maxIdx - 1; i >= 0; i--) {
    if (points[i].pct < threshold) {
      startIdx = i + 1;
      break;
    }
  }
  let endIdx = points.length - 1;
  for (let i = maxIdx + 1; i < points.length; i++) {
    if (points[i].pct < threshold) {
      endIdx = i - 1;
      break;
    }
  }
  return { start: startIdx, end: endIdx };
};

const createChartPoints = (snapshots, width, height, useCpu = true) => {
  if (!snapshots || snapshots.length === 0) return [];
  const effectiveHeight = height * 0.75;
  const paddingTop = height * 0.1;
  const paddingBottom = height * 0.15;
  const paddingLeft = 30; 
  return snapshots.map((snapshot, index) => {
    const x = paddingLeft + (index / (snapshots.length - 1)) * (width - paddingLeft); 
    const pct = useCpu
      ? Math.min(typeof snapshot.cpu_pct === 'number' ? snapshot.cpu_pct : 0, 100)
      : Math.min(typeof snapshot.ram_pct === 'number' ? snapshot.ram_pct : 0, 100);
    const y = height - paddingBottom - (pct / 100) * effectiveHeight; // Keep Y-axis at 100%
    return { x, y, pct, timestamp: snapshot.timestamp };
  });
};

const extractTimeFromTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  if (timestamp.includes(' ')) {
    return timestamp.split(' ')[1] || 'N/A';
  }
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return 'N/A';
  }
};

const Chart = ({ snapshots, useCpu, gradientId, strokeColor, fillColor, title, bgGradient }) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '', isSpike: false });
  const svgRef = useRef(null);

  const handleMouseMove = (e, point, isSpike = false) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      content: `${point.pct.toFixed(1)}% at ${extractTimeFromTimestamp(point.timestamp)}`,
      isSpike,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: '', isSpike: false });
  };

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className={`${bgGradient} rounded-lg p-3 border flex items-center justify-center`}>
        <p className="text-gray-500 text-xs">No data available</p>
      </div>
    );
  }

  const points = createChartPoints(snapshots, 300, 120, useCpu);
  const linePath = createLineChartPath(points);
  const spike = detectSpike(points);

  return (
    <div>
      <h3 className="text-xs font-semibold mb-2 text-gray-800">{title}</h3>
      <div className={`${bgGradient} rounded-lg p-3 border relative`}>
        <svg ref={svgRef} className="w-full h-full" viewBox="0 0 350 140"> 
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d={`
              ${linePath}
              L ${points[points.length - 1].x} 125
              L ${points[0].x} 125
              Z
            `.trim()}
            fill={`url(#${gradientId})`}
            opacity="0.4"
          />
          <path
            d={linePath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point, i) => (
            <circle
              key={`point-${i}`}
              cx={point.x} 
              cy={point.y}
              r="3"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1.5"
              className="cursor-pointer transition-all hover:r-4"
              onMouseMove={(e) => handleMouseMove(e, point, false)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
          {points.length > 0 && (
            <>
              <circle
                key="spike-start"
                cx={points[spike.start]?.x || 0}
                cy={points[spike.start]?.y || 0}
                r="4"
                fill="#ef4444"
                stroke="#b91c1c"
                strokeWidth="1.5"
                className="cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, points[spike.start], true)}
                onMouseLeave={handleMouseLeave}
              />
              <circle
                key="spike-end"
                cx={points[spike.end]?.x || 0}
                cy={points[spike.end]?.y || 0}
                r="4"
                fill="#ef4444"
                stroke="#b91c1c"
                strokeWidth="1.5"
                className="cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, points[spike.end], true)}
                onMouseLeave={handleMouseLeave}
              />
            </>
          )}
          <text
            x="0"
            y="0"
            fontSize="10"
            fill="#4b5563"
            fontWeight="500"
            dominantBaseline="hanging"
          >
            Percent
          </text>
          <text
            x="270"
            y="130"
            fontSize="10"
            fill="#4b5563"
            fontWeight="500"
          >
            Time
          </text>
        </svg>
        {tooltip.visible && (
          <div
            className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg z-10 pointer-events-none whitespace-nowrap"
            style={{
              left: Math.max(10, Math.min(tooltip.x + 10, 310)),
              top: tooltip.y - 30,
            }}
          >
            <div className="relative">
              {tooltip.content}
              <div className="absolute left-2 -bottom-1 w-0 h-0 border-l-1.5 border-r-1.5 border-t-1.5 border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const DiskIOChart = ({ snapshots, title, bgGradient }) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const svgRef = useRef(null);

  const handleMouseMove = (e, point) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      content: `${point.mbps.toFixed(2)} MB/s at ${extractTimeFromTimestamp(point.timestamp)}`,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: '' });
  };

  if (!snapshots || snapshots.length === 0) {
  return (
    <div className={`${bgGradient} rounded-lg p-3 border flex items-center justify-center`}>
      <p className="text-gray-500 text-xs">No data available</p>
    </div>
  );
}

const maxMbps = Math.max(...snapshots.map(snapshot => snapshot.disk_mbps));
const width = 300;
const height = 120;
const effectiveHeight = height * 0.75;
const paddingBottom = height * 0.15;
const paddingLeft = 30;

const points = snapshots.map((snapshot, index) => {
  const x = paddingLeft + (index / (snapshots.length - 1)) * (width - paddingLeft); 
  let mbps = typeof snapshot.disk_mbps === 'number' ? snapshot.disk_mbps : 0;
  let y;
  if (maxMbps === 0) {
    y = height - paddingBottom; 
  } else {
    y = height - paddingBottom - (mbps / maxMbps) * effectiveHeight;
  }

  return { x, y, mbps, timestamp: snapshot.timestamp };
});

  let path = '';
  if (points.length > 0) {
    path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  return (
    <div>
      <h3 className="text-xs font-semibold mb-2 text-gray-800">{title}</h3>
      <div className={`${bgGradient} rounded-lg p-3 border relative`}>
        <svg ref={svgRef} className="w-full h-full" viewBox="0 0 350 140"> 
          <defs>
            <linearGradient id="diskIOGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Area fill under the line */}
          <path
            d={`
              ${path}
              L ${points[points.length - 1]?.x || 0} ${height - paddingBottom}
              L ${points[0]?.x || 0} ${height - paddingBottom}
              Z
            `.trim()}
            fill="url(#diskIOGrad)"
            opacity="0.4"
          />

          {/* Line stroke */}
          <path
            d={path}
            fill="none"
            stroke="url(#diskIOGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, i) => (
            <circle
              key={`disk-point-${i}`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#8b5cf6"
              stroke="#7c3aed"
              strokeWidth="1.5"
              className="cursor-pointer transition-all hover:r-4"
              onMouseMove={(e) => handleMouseMove(e, point)}
              onMouseLeave={handleMouseLeave}
            />
          ))}

          <text x="0" y="0" fontSize="10" fill="#4b5563" fontWeight="500" dominantBaseline="hanging">
            MB/s
          </text>
          <text x="270" y="130" fontSize="10" fill="#4b5563" fontWeight="500">Time</text>
        </svg>

        {tooltip.visible && (
          <div
            className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg z-10 pointer-events-none whitespace-nowrap"
            style={{
              left: Math.max(10, Math.min(tooltip.x + 10, 310)),
              top: tooltip.y - 30,
            }}
          >
            <div className="relative">
              {tooltip.content}
              <div className="absolute left-2 -bottom-1 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default EventDetails;