import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  Laptop,
  Filter,
  HardDrive,
  X,
} from 'lucide-react';
import { storageAPI } from './config/api';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from './Toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const safeParseFloat = (value, fallback = 0) => {
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
};

const transformStorageData = (storageItem) => {
  if (!storageItem) return null;
  const totalsizebytes = safeParseFloat(storageItem.totalsizebytes, 0);
  const usedspacebytes = safeParseFloat(storageItem.usedspacebytes, 0);
  const freespacebytes = safeParseFloat(storageItem.freespacebytes, 0);
  const usedpercent = safeParseFloat(storageItem.usedpercent, 0);
  return {
    _id: storageItem._id || '',
    uuid: storageItem.uuid || '',
    ip: storageItem.ip || 'N/A',
    timestamp: storageItem.timestamp || new Date().toISOString(),
    totalSpaceGB: (totalsizebytes / (1024 ** 3)).toFixed(2),
    usedSpaceGB: (usedspacebytes / (1024 ** 3)).toFixed(2),
    freeSpaceGB: (freespacebytes / (1024 ** 3)).toFixed(2),
    usedPercent: usedpercent,
    computerName: storageItem.computername || storageItem.reversednshostname || 'Unknown',
    raw: storageItem,
  };
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid Date';
  }
};

const truncateDNS = (dns, maxLength = 25) => {
  if (!dns || dns.length <= maxLength) return dns;
  return dns.substring(0, maxLength) + '...';
};

const FilterPanel = ({
  isSingleDay,
  setIsSingleDay,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  ipSearch,
  setIpSearch,
  userRange,
  setUserRange,
  applyFilters,
  resetFilters,
  isMobile = false,
  onClose,
}) => {
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
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${isSingleDay ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'
                    }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setIsSingleDay(false)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${!isSingleDay ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'
                    }`}
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

            <div className="flex gap-2 pt-2">
              <button
                onClick={resetFilters}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 flex items-center justify-center gap-1"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
              <button
                onClick={applyFilters}
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
              className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${isSingleDay ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'
                }`}
            >
              Single
            </button>
            <button
              onClick={() => setIsSingleDay(false)}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${!isSingleDay ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'
                }`}
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
          <option value="1-2">1-2</option>
          <option value="3-5">3-5</option>
          <option value="5-7">5-7</option>
          <option value="8-10">8-10</option>
          <option value="11-15">11-15</option>
          <option value="16+">16+</option>
        </select>
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={resetFilters}
          title="Reset all filters"
          className="p-1.5 text-[10px] font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <button
          onClick={applyFilters}
          className="px-2.5 py-1.5 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm flex items-center gap-1"
        >
          <Search className="h-3 w-3" /> Apply
        </button>
      </div>
    </div>
  );
};

const StorageEventCard = ({ event, navigate, showToast }) => {
  const handleViewDetails = () => {
    const parsedDate = new Date(event.timestamp);
    const isoCreatedAt = isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString();

    const searchParams = new URLSearchParams({
      created_at: isoCreatedAt,
    }).toString();

    navigate(`/storage/${event.ip}?${searchParams}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="w-full">
          <div className="flex items-center gap-2 mb-1">
            <Laptop className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span
              className="truncate max-w-[150px] cursor-pointer text-gray-600"
              onClick={() => {
                navigator.clipboard.writeText(event.ip || '');
                showToast('success', 'Copied to clipboard', 'IP Address');
              }}
            >
              {event.ip || 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-600">Computer Name:</span>
            <span
              className="truncate max-w-[150px] cursor-pointer text-gray-600"
              onClick={() => {
                navigator.clipboard.writeText(event.computerName);
                showToast('success', 'Copied to clipboard', 'Computer Name');
              }}
            >
              {event.computerName}
            </span>
          </div>

          <p className="text-xs text-gray-600 mb-2">
            {event.timestamp ? formatTimestamp(event.timestamp) : 'N/A'}
          </p>

          <div className="flex flex-wrap gap-2 mt-1">
            <div>
              <span className="text-xs font-medium text-gray-600">Used Space:</span>
              <span className="text-gray-600 text-sm ml-1">
                {event.usedSpaceGB || '0.00'} GB
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-600">Used %:</span>
              <span className={`font-bold text-sm ml-1 ${event.usedPercent > 85 ? 'text-red-600' :
                event.usedPercent > 75 ? 'text-orange-600' : 'text-green-600'
                }`}>
                {event.usedPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleViewDetails}
          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium hover:bg-blue-200 flex-shrink-0"
        >
          View
        </button>
      </div>
    </div>
  );
};

const StorageSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // ✅

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message, title = '') => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';
  const ipSearch = searchParams.get('ip') || '';
  const userRange = searchParams.get('user_range') || 'all';
  const isSingleDay = !dateTo;

  const pageSize = 13;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalCount: 0,
  });
  const filterPanelRef = useRef(null);
  const filterButtonRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const hasActiveAppliedFilters = () => {
    return !!(dateFrom || ipSearch || (userRange && userRange !== 'all'));
  };

  const loadStorageEvents = async (params = {}, page = 1) => {
    setIsLoading(true);
    try {
      const apiParams = {
        date_from: params.date_from,
        date_to: params.date_to, 
        ip: params.ip,
        user_range: params.user_range === 'all' ? undefined : params.user_range,
        page,
        page_size: pageSize,
      };

      const cleanParams = {};
      Object.entries(apiParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });

      const response = await storageAPI.searchStorage(cleanParams);

      let rawList = [];
      let paginationData = { totalPages: 1, totalCount: 0 };

      if (response.data && Array.isArray(response.data.items)) {
        rawList = response.data.items;
        if (response.data.pagination) {
          paginationData = {
            totalPages: response.data.pagination.total_pages || 1,
            totalCount: response.data.pagination.total_count || 0,
          };
        }
      } else if (Array.isArray(response.data)) {
        rawList = response.data;
        paginationData.totalCount = rawList.length;
      }

      const transformed = rawList.map(transformStorageData).filter(Boolean);
      setFilteredEvents(transformed);
      setPagination(paginationData);
    } catch (err) {
      console.error('Error fetching storage events:', err);
      setFilteredEvents([]);
      setPagination({ totalPages: 1, totalCount: 0 });
      showToast('error', 'Failed to load storage data');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const params = {
        date_from: dateFrom,   
        date_to: dateTo,       
        ip: ipSearch,
        user_range: userRange,
      };
      loadStorageEvents(params, currentPage);
  }, [dateFrom, dateTo, ipSearch, userRange, currentPage]); 

  useEffect(() => {
    if (isMobile) return;
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const [transientDateFrom, setTransientDateFrom] = useState(dateFrom);
  const [transientDateTo, setTransientDateTo] = useState(dateTo);
  const [transientIsSingleDay, setTransientIsSingleDay] = useState(isSingleDay);
  const [transientIpSearch, setTransientIpSearch] = useState(ipSearch);
  const [transientUserRange, setTransientUserRange] = useState(userRange);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (transientDateFrom) params.set('date_from', transientDateFrom);
    if (!transientIsSingleDay && transientDateTo) params.set('date_to', transientDateTo);
    if (transientIpSearch) params.set('ip', transientIpSearch);
    if (transientUserRange && transientUserRange !== 'all') params.set('user_range', transientUserRange);
    if (currentPage !== 1) params.set('page', '1'); 
    setSearchParams(params, { replace: true });
    setIsFiltersVisible(false);
  };

  const resetFilters = () => {
    setSearchParams({}, { replace: true }); 
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params, { replace: true });
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPage, 10);
    if (!isNaN(page) && page >= 1 && page <= pagination.totalPages) {
      handlePageChange(page);
      setGoToPage("");
    }
  };

  const [goToPage, setGoToPage] = useState("");

  const renderCopyableCell = (text, label, maxWidth = '150px') => {
    if (!text) return 'N/A';
    return (
      <span
        className={`truncate max-w-[${maxWidth}] cursor-pointer text-gray-600`}
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(text).then(() => {
            showToast('success', 'Copied to clipboard', label);
          }).catch(() => {
            showToast('error', 'Failed to copy', 'Copy Error');
          });
        }}
      >
        {text}
      </span>
    );
  };

  const TableSkeleton = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            {['IP', 'Computer Name', 'Used %', 'Used Space (GB)', 'Timestamp', 'Details'].map((h) => (
              <th key={h} className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(pageSize)].map((_, i) => (
            <tr key={i} className="border-b border-gray-100 h-10">
              <td className="p-2"><div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div></td>
              <td className="p-2"><div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div></td>
              <td className="p-2"><div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div></td>
              <td className="p-2"><div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div></td>
              <td className="p-2"><div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div></td>
              <td className="p-2"><div className="h-6 w-14 bg-gray-200 rounded animate-pulse"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${hasActiveAppliedFilters()
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
            </div>

            <div className="flex sm:hidden">
              <button
                ref={filterButtonRef}
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${hasActiveAppliedFilters()
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
            </div>

            {!isMobile && isFiltersVisible && (
              <div ref={filterPanelRef} className="mt-2 w-full z-30">
                <FilterPanel
                  isSingleDay={transientIsSingleDay}
                  setIsSingleDay={setTransientIsSingleDay}
                  dateFrom={transientDateFrom}
                  setDateFrom={setTransientDateFrom}
                  dateTo={transientDateTo}
                  setDateTo={setTransientDateTo}
                  ipSearch={transientIpSearch}
                  setIpSearch={setTransientIpSearch}
                  userRange={transientUserRange}
                  setUserRange={setTransientUserRange}
                  applyFilters={applyFilters}
                  resetFilters={resetFilters}
                />
              </div>
            )}
          </div>

          {isMobile && isFiltersVisible && (
            <FilterPanel
              isSingleDay={transientIsSingleDay}
              setIsSingleDay={setTransientIsSingleDay}
              dateFrom={transientDateFrom}
              setDateFrom={setTransientDateFrom}
              dateTo={transientDateTo}
              setDateTo={setTransientDateTo}
              ipSearch={transientIpSearch}
              setIpSearch={setTransientIpSearch}
              userRange={transientUserRange}
              setUserRange={setTransientUserRange}
              applyFilters={applyFilters}
              resetFilters={resetFilters}
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
                        <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <TableSkeleton />
                  )}
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-6">
                  <div>
                    <HardDrive className="w-12 h-12 mx-auto text-gray-300" />
                    <h3 className="text-base font-medium text-gray-700 mt-3">No storage alerts found</h3>
                    <p className="text-gray-500 text-sm">Adjust your filters to see results</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 md:p-0">
                  {isMobile ? (
                    <div>
                      {filteredEvents.map((event, idx) => (
                        <StorageEventCard
                          key={event._id || idx}
                          event={event}
                          navigate={navigate}
                          showToast={showToast}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto h-full">
                      <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                          <tr className="border-b border-gray-200">
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">IP</th>
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">Computer Name</th>
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">Used %</th>
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">Used Space (GB)</th>
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">Timestamp</th>
                            <th className="text-left p-2 text-[10px] font-medium text-gray-500 uppercase">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEvents.map((event, idx) => (
                            <tr
                              key={event._id || idx}
                              className="border-b border-gray-100 hover:bg-gray-50 h-10"
                            >
                              <td className="p-2 text-gray-600 text-[13px]">
                                {renderCopyableCell(event.ip || 'N/A', 'IP Address')}
                              </td>
                              <td className="p-2 text-gray-600 text-[13px]">
                                {renderCopyableCell(truncateDNS(event.computerName, 25), 'Computer Name')}
                              </td>
                              <td className="p-2">
                                <span className={`font-bold text-[13px] ${event.usedPercent > 85 ? 'text-red-600' :
                                  event.usedPercent > 75 ? 'text-orange-600' : 'text-green-600'
                                  }`}>
                                  {event.usedPercent.toFixed(1)}%
                                </span>
                              </td>
                              <td className="p-2">
                                <span className="text-gray-600 text-[13px]">
                                  {event.usedSpaceGB || '0.00'} GB
                                </span>
                              </td>
                              <td className="p-2 text-gray-700 text-[13px]">
                                {formatTimestamp(event.timestamp)}
                              </td>
                              <td className="p-2">
                                <button
                                  onClick={() => {
                                    const parsedDate = new Date(event.timestamp);
                                    const isoCreatedAt = isNaN(parsedDate.getTime())
                                      ? new Date().toISOString()
                                      : parsedDate.toISOString();

                                    const searchParams = new URLSearchParams({
                                      created_at: isoCreatedAt,
                                    }).toString();

                                    navigate(`/storage/${event.ip}?${searchParams}`);
                                  }}
                                  className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[13px] font-medium hover:bg-blue-200"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {pagination.totalPages > 1 && !isLoading && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-3 py-2 border-t border-gray-200 bg-gray-50 text-sm">
                <span className="text-gray-700 font-medium whitespace-nowrap">
                  <span className="font-medium pr-2">Records</span>
                  {Math.min((currentPage - 1) * pageSize + 1, pagination.totalCount)}–
                  {Math.min(currentPage * pageSize, pagination.totalCount)} of {pagination.totalCount}
                </span>

                <div className="flex flex-nowrap items-center gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap sm:flex-row w-full sm:w-auto">
                  {/* Prev / Next Controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 bg-white border border-gray-300 rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-100"
                    >
                      Prev
                    </button>
                    <span className="px-2 py-1 font-medium text-gray-800 bg-gray-100 rounded text-sm">
                      {currentPage} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="px-2.5 py-1 bg-white border border-gray-300 rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>

                  {/* Go to Page Input */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
                    <label htmlFor="goToPageInput" className="text-gray-700 font-medium">
                      Go to page:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        id="goToPageInput"
                        type="number"
                        min="1"
                        max={pagination.totalPages}
                        value={goToPage}
                        onChange={(e) => setGoToPage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleGoToPage();
                          }
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="1"
                      />
                      <button
                        onClick={handleGoToPage}
                        disabled={!goToPage.trim() || goToPage < 1 || goToPage > pagination.totalPages}
                        className="px-2.5 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Go
                      </button>
                    </div>
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

export default StorageSearchPage;