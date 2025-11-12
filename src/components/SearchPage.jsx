import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Cpu,
  MemoryStick,
  HardDrive,
  File,
  FileSpreadsheet,
  Filter,
  X,
  Flag,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchEvents, downloadPDF, downloadExcel } from './config/api';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from './Toast';

const FilterPanel = ({
  appliedFilters,
  onApply,
  onReset,
  isMobile = false,
  onClose,
}) => {
  const [isSingleDay, setIsSingleDay] = useState(!appliedFilters.dateTo);
  const [dateFrom, setDateFrom] = useState(appliedFilters.dateFrom || '');
  const [dateTo, setDateTo] = useState(appliedFilters.dateTo || appliedFilters.dateFrom || '');
  const [ipSearch, setIpSearch] = useState(appliedFilters.ipSearch || '');
  const [userRange, setUserRange] = useState(appliedFilters.userRange || 'all');
  const [selectedTriggers, setSelectedTriggers] = useState([...appliedFilters.selectedTriggers]);

  const handleTriggerChange = (trigger) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const handleApply = () => {
    onApply({
      isSingleDay,
      dateFrom,
      dateTo,
      ipSearch,
      userRange,
      selectedTriggers,
    });
    if (isMobile) onClose();
  };

  const handleReset = () => {
    setIsSingleDay(true);
    setDateFrom('');
    setDateTo('');
    setIpSearch('');
    setUserRange('all');
    setSelectedTriggers([]);
    onReset();
    if (isMobile) onClose();
  };

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
        <div className="bg-white w-full rounded-t-lg p-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Filters</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date Mode</label>
              <div className="flex bg-gray-100 rounded-md p-0.5">
                <button
                  onClick={() => setIsSingleDay(true)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${isSingleDay ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'}`}
                >
                  Single
                </button>
                <button
                  onClick={() => setIsSingleDay(false)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${!isSingleDay ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'}`}
                >
                  Range
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {!isSingleDay && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom || undefined}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">IP Address</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="192.168.1.1"
                  value={ipSearch}
                  onChange={(e) => setIpSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">User Range</label>
              <select
                value={userRange}
                onChange={(e) => setUserRange(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="1-2">1–2</option>
                <option value="3-5">3–5</option>
                <option value="5-7">5–7</option>
                <option value="8-10">8–10</option>
                <option value="11-15">11–15</option>
                <option value="16+">16+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Trigger</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'CPU', icon: Cpu, color: 'blue' },
                  { name: 'RAM', icon: MemoryStick, color: 'orange' },
                  { name: 'Storage', icon: HardDrive, color: 'purple' },
                ].map(({ name, icon: Icon, color }) => (
                  <button
                    key={name}
                    onClick={() => handleTriggerChange(name)}
                    className={`p-2 rounded border transition-colors ${
                      selectedTriggers.includes(name)
                        ? `border-${color}-500 bg-${color}-50 text-${color}-600`
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto" />
                    <span className="text-xs mt-1 block">{name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 flex items-center justify-center gap-1"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm flex items-center justify-center gap-1"
              >
                <Search className="h-4 w-4" /> Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-xl flex flex-wrap items-end gap-3 w-full">
      <div className="flex flex-wrap gap-2 flex-1 min-w-[280px]">
        <div>
          <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Date Mode</label>
          <div className="flex bg-gray-100 rounded-md p-0.5">
            <button
              onClick={() => setIsSingleDay(true)}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${isSingleDay ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'}`}
            >
              Single
            </button>
            <button
              onClick={() => setIsSingleDay(false)}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${!isSingleDay ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'}`}
            >
              Range
            </button>
          </div>
        </div>
        <div className="flex gap-2 flex-1">
          <div className="flex-1">
            <label className="block text-[10px] text-gray-600 mb-0.5">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {!isSingleDay && (
            <div className="flex-1">
              <label className="block text-[10px] text-gray-600 mb-0.5">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="block text-[10px] font-medium text-gray-600 mb-0.5">IP Address</label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input
            type="text"
            placeholder="192.168.1.1"
            value={ipSearch}
            onChange={(e) => setIpSearch(e.target.value)}
            className="w-full pl-6 pr-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="block text-[10px] font-medium text-gray-600 mb-0.5">User Range</label>
        <select
          value={userRange}
          onChange={(e) => setUserRange(e.target.value)}
          className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All</option>
          <option value="1-2">1–2</option>
          <option value="3-5">3–5</option>
          <option value="5-7">5–7</option>
          <option value="8-10">8–10</option>
          <option value="11-15">11–15</option>
          <option value="16+">16+</option>
        </select>
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Trigger</label>
        <div className="flex gap-1">
          {[
            { name: 'CPU', icon: Cpu, color: 'blue' },
            { name: 'RAM', icon: MemoryStick, color: 'orange' },
            { name: 'Storage', icon: HardDrive, color: 'purple' },
          ].map(({ name, icon: Icon, color }) => (
            <button
              key={name}
              onClick={() => handleTriggerChange(name)}
              className={`flex-1 p-1 rounded border transition-colors ${
                selectedTriggers.includes(name)
                  ? `border-${color}-500 bg-${color}-50 text-${color}-600`
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3 h-3 mx-auto" />
              <span className="text-[9px] mt-0.5 block">{name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={handleReset}
          title="Reset all filters"
          className="p-1.5 text-[10px] font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <button
          onClick={handleApply}
          className="px-2.5 py-1.5 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm flex items-center gap-1"
        >
          <Search className="h-3 w-3" /> Apply
        </button>
      </div>
    </div>
  );
};

const parseCustomTimestamp = (timestampStr) => {
  if (!timestampStr) return null;
  const [datePart, timePart] = timestampStr.trim().split(' ');
  if (!datePart || !timePart) return null;
  const [month, day, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':').map(Number);
  if (!month || !day || !year || isNaN(hour) || isNaN(minute)) return null;
  const date = new Date(year, month - 1, day, hour, minute, second || 0);
  return isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = parseCustomTimestamp(timestamp);
  if (!date || isNaN(date.getTime())) return timestamp;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [goToPage, setGoToPage] = useState('');
  const [totalEventsCount, setTotalEventsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const PAGE_SIZE = 13;
  const currentPage = parseInt(searchParams.get('page')) || 1;

  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';
  const ipSearch = searchParams.get('ip') || '';
  const userRange = searchParams.get('user_range') || 'all';
  const cpu = searchParams.get('cpu') === '1';
  const ram = searchParams.get('ram') === '1';
  const storage = searchParams.get('storage') === '1';
  const selectedTriggers = [
    ...(cpu ? ['CPU'] : []),
    ...(ram ? ['RAM'] : []),
    ...(storage ? ['Storage'] : []),
  ];

  const filterPanelRef = useRef(null);
  const filterButtonRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const showToast = (type, message, title = '') => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text, label = 'Text') => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast('success', 'Copied to clipboard', label);
    }).catch(() => {
      showToast('error', 'Failed to copy', 'Copy Error');
    });
  };

  const hasActiveAppliedFilters = () => {
    return !!(dateFrom || ipSearch || cpu || ram || storage || (userRange && userRange !== 'all'));
  };

  const loadEventsWithParams = async (params = {}, page = 1) => {
    setIsLoading(true);
    try {
      const cleanParams = { ...params, page, page_size: PAGE_SIZE };
      Object.keys(cleanParams).forEach((key) => {
        if ([false, '', null, undefined].includes(cleanParams[key])) {
          delete cleanParams[key];
        }
      });
      const response = await fetchEvents(cleanParams);
      if (response) {
        let eventsArray = [];
        let totalCount = 0;
        if (response.events && Array.isArray(response.events)) {
          eventsArray = response.events;
          totalCount = response.pagination?.total_count || response.events.length;
        } else if (response.data && Array.isArray(response.data)) {
          eventsArray = response.data;
          totalCount = response.total || response.data.length;
        } else if (Array.isArray(response)) {
          eventsArray = response;
          totalCount = response.length;
        } else {
          const possibleKeys = ['events', 'data', 'results', 'items', 'records'];
          for (const key of possibleKeys) {
            if (response[key] && Array.isArray(response[key])) {
              eventsArray = response[key];
              totalCount = response.total || response.count || response[key].length;
              break;
            }
          }
        }
        setEvents(eventsArray);
        setTotalEventsCount(totalCount);
      } else {
        setEvents([]);
        setTotalEventsCount(0);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);
      setTotalEventsCount(0);
      showToast('error', 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = {
      date_from: dateFrom,
      date_to: dateTo,
      ip: ipSearch,
      cpu: cpu,
      ram: ram,
      storage: storage,
      user_range: userRange === 'all' ? '' : userRange,
    };
    loadEventsWithParams(params, currentPage);
  }, [dateFrom, dateTo, ipSearch, cpu, ram, storage, userRange, currentPage]);

  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (event) => {
        if (
          filterPanelRef.current &&
          !filterPanelRef.current.contains(event.target) &&
          filterButtonRef.current &&
          !filterButtonRef.current.contains(event.target)
        ) {
          setIsFiltersVisible(false);
        }
      };
      const handleEscapeKey = (event) => {
        if (event.key === 'Escape') {
          setIsFiltersVisible(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isMobile]);

  const toUSDate = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${m}/${d}/${y}`;
  };

  const applyFilters = ({ isSingleDay, dateFrom, dateTo, ipSearch, userRange, selectedTriggers }) => {
  const params = new URLSearchParams();
  if (dateFrom) params.set('date_from', dateFrom);
  if (!isSingleDay && dateTo) params.set('date_to', dateTo);
  if (ipSearch) params.set('ip', ipSearch);
  if (userRange && userRange !== 'all') params.set('user_range', userRange);
  if (selectedTriggers.includes('CPU')) params.set('cpu', '1');
  if (selectedTriggers.includes('RAM')) params.set('ram', '1');
  if (selectedTriggers.includes('Storage')) params.set('storage', '1');
  if (currentPage !== 1) params.set('page', '1');
  setSearchParams(params, { replace: true });
  setIsFiltersVisible(false);
};

  const resetFilters = () => {
    const params = new URLSearchParams();
    if (currentPage !== 1) params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const timeA = parseCustomTimestamp(a.timestamp);
      const timeB = parseCustomTimestamp(b.timestamp);
      if (!timeA && !timeB) return 0;
      if (!timeA) return 1;
      if (!timeB) return -1;
      return timeB - timeA;
    });
  }, [events]);

  const totalPages = Math.ceil(totalEventsCount / PAGE_SIZE);

 const getTriggerIcons = (event) => (
    <div className="flex items-center gap-2">
       <Cpu className={`w-4 h-4 ${event.CPU || event.cpu ? 'text-blue-600' : 'text-gray-300'}`} />
       <MemoryStick className={`w-4 h-4 ${event.RAM || event.ram ? 'text-orange-600' : 'text-gray-300'}`} />
       <HardDrive className={`w-4 h-4 ${event.Storage || event.storage ? 'text-purple-600' : 'text-gray-300'}`} />
     </div>
    );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      const params = new URLSearchParams(searchParams);
      params.set('page', newPage);
      setSearchParams(params, { replace: true });
    }
  };

  const exportToExcel = async () => {
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (ipSearch) params.ip = ipSearch;
      if (cpu) params.cpu = true;
      if (ram) params.ram = true;
      if (storage) params.storage = true;
      if (userRange && userRange !== 'all') params.user_range = userRange;
      await downloadExcel(params);
      showToast('success', 'Excel export started', 'Export');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showToast('error', 'Failed to export Excel');
    }
  };

  const exportToPDF = async () => {
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (ipSearch) params.ip = ipSearch;
      if (cpu) params.cpu = true;
      if (ram) params.ram = true;
      if (storage) params.storage = true;
      if (userRange && userRange !== 'all') params.user_range = userRange;
      await downloadPDF(params);
      showToast('success', 'PDF export started', 'Export');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showToast('error', 'Failed to export PDF');
    }
  };

  const TableSkeleton = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            {['IP', 'Computer Name', 'Users', 'Timestamp', 'Trigger', 'Details'].map((h) => (
              <th key={h} className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <tr key={i} className="border-b border-gray-100 h-10">
              <td className="p-2">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </td>
              <td className="p-2">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </td>
              <td className="p-2">
                <div className="h-3 w-6 bg-gray-200 rounded animate-pulse"></div>
              </td>
              <td className="p-2">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </td>
              <td className="p-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </td>
              <td className="p-2">
                <div className="h-6 w-14 bg-gray-200 rounded animate-pulse"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const CopyableField = ({ text, label, maxWidth = '150px' }) => (
    <span
      className={`truncate max-w-[${maxWidth}] cursor-pointer text-slate-700`}
      onClick={() => copyToClipboard(text, label)}
    >
      {text}
    </span>
  );

  const EventCard = ({ event }) => {
    const computerName = event.computername || event.computerName || event.computer_name || 'Unknown';
    const ipAddress = event.ip || 'N/A';
    const isSystemEvent = (event.users || 0) === 0;

    return (
      <div
        className={`border rounded-lg p-4 mb-3 shadow-sm ${
          isSystemEvent
            ? 'bg-gradient-to-r from-orange-100 to-red-100 border-l-4 border-l-red-400 border-red-200'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="truncate max-w-[180px] cursor-pointer text-gray-600 font-mono"
                onClick={() => copyToClipboard(ipAddress, 'IP Address')}
              >
                {ipAddress}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-600">Computer Name:</span>
              <span
                className="truncate max-w-[180px] cursor-pointer text-gray-600"
                onClick={() => copyToClipboard(computerName, 'Computer Name')}
              >
                {computerName}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">{formatDateTime(event.timestamp)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-600">Users:</span>
              {isSystemEvent ? (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">System</span>
              ) : (
                <span className="font-bold text-sm text-green-600">{event.users || 0}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                navigate(`/events/${event.id}`, {
                  state: { machine: event },
                })
              }
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium hover:bg-blue-200"
            >
              View
            </button>
            {isSystemEvent && <Flag className="w-3 h-3 text-red-600" title="System-level event" />}
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100">{getTriggerIcons(event)}</div>
      </div>
    );
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setGoToPage('');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-16 pt-[4.5rem]">
        <Header />
        <main className="flex flex-1 flex-col pb-20 md:pb-3 overflow-hidden p-3 md:p-4">
          <div className="mb-3">
            <div className="hidden sm:flex justify-between gap-3">
              <button
                ref={filterButtonRef}
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  hasActiveAppliedFilters()
                    ? 'bg-blue-100 border border-blue-300 text-blue-800'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-3 h-3" />
                Filters
                {hasActiveAppliedFilters() && (
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative h-2 w-2 rounded-full bg-blue-500"></span>
                  </span>
                )}
              </button>
              <div className="flex gap-1.5">
                <button
                  onClick={exportToExcel}
                  disabled={totalEventsCount === 0}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium text-green-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="h-3 w-3" />
                  Excel
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={totalEventsCount === 0}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium text-red-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <File className="h-3 w-3" />
                  PDF
                </button>
              </div>
            </div>

            <div className="flex sm:hidden flex-row gap-2">
              <button
                ref={filterButtonRef}
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                  hasActiveAppliedFilters()
                    ? 'bg-blue-100 border border-blue-300 text-blue-800'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-3 h-3" />
                Filters
                {hasActiveAppliedFilters() && (
                  <span className="flex h-1.5 w-1.5">
                    <span className="animate-ping absolute h-1.5 w-1.5 rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  </span>
                )}
              </button>
              <button
                onClick={exportToExcel}
                disabled={totalEventsCount === 0}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-green-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="h-3 w-3" />
                Excel
              </button>
              <button
                onClick={exportToPDF}
                disabled={totalEventsCount === 0}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-red-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <File className="h-3 w-3" />
                PDF
              </button>
            </div>
          </div>

          {!isMobile && isFiltersVisible && (
            <div ref={filterPanelRef} className="mb-3 w-full z-30">
              <FilterPanel
                appliedFilters={{
                  dateFrom,
                  dateTo,
                  ipSearch,
                  userRange,
                  selectedTriggers,
                }}
                onApply={applyFilters}
                onReset={resetFilters}
              />
            </div>
          )}

          {isMobile && isFiltersVisible && (
            <FilterPanel
              appliedFilters={{
                dateFrom,
                dateTo,
                ipSearch,
                userRange,
                selectedTriggers,
              }}
              onApply={applyFilters}
              onReset={resetFilters}
              isMobile={true}
              onClose={() => setIsFiltersVisible(false)}
            />
          )}

          <div className="flex flex-col flex-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4">
                  {isMobile ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <TableSkeleton />
                  )}
                </div>
              ) : sortedEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-6">
                  <div>
                    <Search className="w-12 h-12 mx-auto text-gray-300" />
                    <h3 className="text-base font-medium text-gray-700 mt-3">No events found</h3>
                    <p className="text-gray-500 text-sm">Adjust your filters to see results</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 md:p-0">
                  {isMobile ? (
                    <div>{sortedEvents.map((event) => <EventCard key={event.id} event={event} />)}</div>
                  ) : (
                    <div className="overflow-x-auto h-full">
                      <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                          <tr className="border-b border-gray-200">
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">IP</th>
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">Computer Name</th>
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">Users</th>
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">Timestamp</th>
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">Trigger</th>
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedEvents.map((event) => {
                            const computerName = event.computername || event.computerName || event.computer_name || 'Unknown';
                            const ipAddress = event.ip || 'N/A';
                            const isSystemEvent = (event.users || 0) === 0;
                            return (
                              <tr
                                key={event.id}
                                className={`border-b border-gray-100 hover:bg-gray-50 h-10 ${
                                  isSystemEvent ? 'bg-gradient-to-r from-orange-100 to-red-100 border-l-4 border-l-red-400' : ''
                                }`}
                              >
                                <td className="p-2 text-[13px] font-mono text-slate-700">
                                  <CopyableField text={ipAddress} label="IP Address" maxWidth="150px" />
                                </td>
                                <td className="p-2 text-[13px] text-gray-800">
                                  <CopyableField text={computerName} label="Computer Name" maxWidth="150px" />
                                </td>
                                <td className="p-2">
                                  {isSystemEvent ? (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">System</span>
                                  ) : (
                                    <span className="font-bold text-[13px] text-green-600">{event.users || 0}</span>
                                  )}
                                </td>
                                <td className="p-2 text-gray-700 text-[13px]">{formatDateTime(event.timestamp)}</td>
                                <td className="p-2">{getTriggerIcons(event)}</td>
                                <td className="p-2">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        navigate(`/events/${event.id}`, {
                                          state: { machine: event },
                                        })
                                      }
                                      className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[13px] font-medium hover:bg-blue-200"
                                    >
                                      View
                                    </button>
                                    {isSystemEvent && <Flag className="w-3 h-3 text-red-600" title="System-level event" />}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {totalPages > 1 && !isLoading && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-3 py-2 border-t border-gray-200 bg-gray-50 text-sm">
                <span className="text-gray-700 font-medium whitespace-nowrap">
                  Records&nbsp;
                  {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalEventsCount)}–
                  {Math.min(currentPage * PAGE_SIZE, totalEventsCount)} of {totalEventsCount}
                </span>

                <div className="flex flex-nowrap items-center gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap sm:flex-row w-full sm:w-auto">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 bg-white border border-gray-300 rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-100 whitespace-nowrap"
                    >
                      Prev
                    </button>
                    <span className="px-2 py-1 font-medium text-gray-800 bg-gray-100 rounded text-sm whitespace-nowrap">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 bg-white border border-gray-300 rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-100 whitespace-nowrap"
                    >
                      Next
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
                    <span className="text-gray-700 font-medium">Go to page:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={goToPage}
                      onChange={(e) => setGoToPage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="1"
                    />
                    <button
                      onClick={handleGoToPage}
                      disabled={!goToPage.trim() || goToPage < 1 || goToPage > totalPages}
                      className="px-2.5 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Go
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <Toast toast={toast} />
      </div>
    </div>
  );
};

export default SearchPage;