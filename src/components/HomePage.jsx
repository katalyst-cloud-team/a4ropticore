"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Cpu,
  MemoryStick,
  HardDrive,
  CheckCircle,
  XCircle,
  Laptop,
  ArrowBigUpDash,
  ArrowBigDownDash,
  AlertTriangle,
  Bell,
  X,
  RotateCcw,
  Info,
  Flag,
} from "lucide-react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MetricsCards } from "./MetricsCards";
import {
  machineAPI,
  createEventSource,
  createInactiveEventSource,
  API_ENDPOINTS,
  storageAPI,
  checkAPIHealth,
} from "./config/api";
import { useNavigate } from "react-router-dom";

const safeParseInt = (value, fallback = 0) => {
  const num = parseInt(value, 10);
  return isNaN(num) ? fallback : num;
};
const safeParseFloat = (value, fallback = 0) => {
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
};
const safeBoolean = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
};

const transformMachineData = (apiMachine) => {
  if (!apiMachine) return null;
  const ip = apiMachine.ip || 'N/A';
  const users = safeParseInt(apiMachine.users, 0);
  const triggers = safeParseInt(apiMachine.triggers || apiMachine.trigger_count, 0);
  const cpu = safeBoolean(apiMachine.cpu);
  const ram = safeBoolean(apiMachine.ram);
  const storage = safeBoolean(apiMachine.storage);
  return {
    ip,
    avg: apiMachine.created_at || (2 + Math.random() * 120).toFixed(1),
    triggers,
    status: mapApiStatus(apiMachine.status),
    users,
    duration: apiMachine.duration,
    lastSeen: apiMachine.last_seen || apiMachine.updated_at
      ? new Date(apiMachine.last_seen || apiMachine.updated_at).toLocaleTimeString()
      : new Date().toLocaleTimeString(),
    uuid: apiMachine.uuid || null,
    id: apiMachine.id || null,
    trigger_type: apiMachine.trigger_type || "unknown",
    created_at: apiMachine.created_at || new Date().toISOString(),
    start_time: apiMachine.start_time,
    cpu,
    ram,
    storage,
    end_time: apiMachine.end_time || null,
    stopped: apiMachine.trigger_type === "machine_stopped" || false,
  };
};

const transformStorageData = (storageItem) => {
  if (!storageItem) return null;
  const totalsizebytes = safeParseFloat(storageItem.totalsizebytes, 0);
  const usedspacebytes = safeParseFloat(storageItem.usedspacebytes, 0);
  const freespacebytes = safeParseFloat(storageItem.freespacebytes, 0);
  const usedpercent = safeParseFloat(storageItem.usedpercent, 0);
  return {
    ip: storageItem.ip || 'N/A',
    timestamp: storageItem.timestamp || new Date().toISOString(),
    totalSpace: (totalsizebytes / (1024 ** 3)).toFixed(2),
    usedSpace: (usedspacebytes / (1024 ** 3)).toFixed(2),
    freeSpace: (freespacebytes / (1024 ** 3)).toFixed(2),
    usedPercent: usedpercent,
    computerName: storageItem.computername || 'Unknown',
  };
};

const mapApiStatus = (apiStatus) => {
  switch (apiStatus?.toLowerCase()) {
    case "running":
    case "active":
      return "Ongoing";
    case "warning":
    case "degraded":
      return "Warning";
    case "critical":
    case "error":
    case "failed":
      return "Critical";
    case "stopped":
    case "inactive":
      return "Ended";
    default:
      return "Ongoing";
  }
};

const getFriendlyRuntime = (startTime) => {
  if (!startTime) return "Just started";
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMinutes < 1) return "Alert recieved few seconds ago";
  if (diffMinutes < 60)
    return `Alert recieved ${diffMinutes} minute${diffMinutes !== 1 ? "s ago" : "ago"}`;
  if (diffHours < 24)
    return `Alert recieved ${diffHours} hour${diffHours !== 1 ? "s ago" : "ago"}`;
  return `Alert recieved ${diffDays} day${diffDays !== 1 ? "s ago" : "ago"}`;
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "Unknown duration";
  const totalSeconds = Math.floor(parseFloat(seconds) || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (mins > 0) parts.push(`${mins} min${mins !== 1 ? "s" : ""}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} sec${secs !== 1 ? "s" : ""}`);
  return parts.join(" ");
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return 'Invalid Date';
  }
};

const InfoPopup = ({ message, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-5 border border-slate-200">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-slate-500 hover:text-slate-700"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="text-sm text-slate-700 leading-relaxed">
        {message}
      </div>
    </div>
  </div>
);

export const HomePage = () => {
  const [machines, setMachines] = useState(new Map());
  const [kpiData, setKpiData] = useState({
    usersAffecting: 0,
    cpuTriggers: 0,
    ramTriggers: 0,
    storageAlerts: 0,
  });
  const [inactiveMachines, setInactiveMachines] = useState(new Map());
  const [storageAlerts, setStorageAlerts] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [useApiData, setUseApiData] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [dataSource, setDataSource] = useState("");
  const [isInactiveConnected, setIsInactiveConnected] = useState(false);
  const [inactiveDataSource, setInactiveDataSource] = useState("");
  const [inactiveLastUpdate, setInactiveLastUpdate] = useState(null);
  const [machinePage, setMachinePage] = useState(1);
  const [machinePageSize] = useState(10);
  const [criticalPage, setCriticalPage] = useState(1);
  const [criticalPageSize] = useState(3);
  const [inactivePage, setInactivePage] = useState(1);
  const [inactivePageSize] = useState(10);
  const [storagePage, setStoragePage] = useState(1);
  const [storagePageSize] = useState(10);
  const [storageTotalCount, setStorageTotalCount] = useState(0);
  const [storageTotalPages, setStorageTotalPages] = useState(1);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionRetryAttempts = useRef(0);
  const maxRetryAttempts = 5;
  const retryDelay = 2000;
  const inactiveEventSourceRef = useRef(null);
  const inactiveReconnectTimeoutRef = useRef(null);
  const inactiveConnectionRetryAttempts = useRef(0);
  const inactiveMaxRetryAttempts = 5;
  const inactiveRetryDelay = 2000;
  const [activeMachinesLoading, setActiveMachinesLoading] = useState(true);
  const [inactiveMachinesLoading, setInactiveMachinesLoading] = useState(true);
  const [storageAlertsLoading, setStorageAlertsLoading] = useState(true); // Shows 0 while true
  const [backendDown, setBackendDown] = useState(false);
  const backendDownTimeoutRef = useRef(null);
  const inactiveTimeoutRef = useRef(null);
  const inactiveInitialReceivedRef = useRef(false);
  const [errors, setErrors] = useState([]);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const nextId = useRef(0);
  const addError = useCallback((source, message) => {
    const id = nextId.current++;
    const newError = { id, source, message, timestamp: Date.now() };
    setErrors((prev) => [...prev, newError]);
    setTimeout(() => {
      setErrors((prev) => prev.filter((e) => e.id !== id));
    }, 5000);
  }, []);

  const getMachinesArray = useCallback(() => {
    return Array.from(machines.values()).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [machines]);

  const getPaginatedMachines = useCallback(() => {
    const allMachines = getMachinesArray();
    const startIndex = (machinePage - 1) * machinePageSize;
    const endIndex = startIndex + machinePageSize;
    return allMachines.slice(startIndex, endIndex);
  }, [getMachinesArray, machinePage, machinePageSize]);

  const getCriticalMachines = useCallback(() => {
    const allMachines = getMachinesArray();
    return allMachines
      .filter((machine) => machine.triggers > 20)
      .sort((a, b) => b.triggers - a.triggers);
  }, [getMachinesArray]);

  const getPaginatedCriticalMachines = useCallback(() => {
    const criticalList = getCriticalMachines();
    const startIndex = (criticalPage - 1) * criticalPageSize;
    const endIndex = startIndex + criticalPageSize;
    return criticalList.slice(startIndex, endIndex);
  }, [getCriticalMachines, criticalPage, criticalPageSize]);

  const getInactiveMachinesArray = useCallback(() => {
    return Array.from(inactiveMachines.values()).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [inactiveMachines]);

  const getPaginatedInactiveMachines = useCallback(() => {
    const allInactiveMachines = getInactiveMachinesArray();
    const startIndex = (inactivePage - 1) * inactivePageSize;
    const endIndex = startIndex + inactivePageSize;
    return allInactiveMachines.slice(startIndex, endIndex);
  }, [getInactiveMachinesArray, inactivePage, inactivePageSize]);

  const getPaginatedStorageAlerts = useCallback(() => {
    return storageAlerts;
  }, [storageAlerts]);

  const totalMachines = getMachinesArray().length;
  const totalMachinePages = Math.ceil(totalMachines / machinePageSize);
  const totalCriticalPages = Math.ceil(getCriticalMachines().length / criticalPageSize);
  const totalInactiveMachines = getInactiveMachinesArray().length;
  const totalInactivePages = Math.ceil(totalInactiveMachines / inactivePageSize);
  const handleServerEvent = useCallback((data) => {
    console.log(`Received event: ${data.type}`, data);
    setLastUpdate(new Date().toLocaleTimeString());
    switch (data.type) {
      case "initial_state":
        setMachines((prevMachines) => {
          const newMachines = new Map();
          if (data.data && Array.isArray(data.data)) {
            data.data.forEach((machine) => {
              const transformedMachine = transformMachineData(machine);
              if (transformedMachine) {
                newMachines.set(transformedMachine.ip, transformedMachine);
              }
            });
          }
          console.log(`Loaded initial state: ${newMachines.size} machines`);
          setActiveMachinesLoading(false);
          return newMachines;
        });
        if (data.source) {
          setDataSource(data.source);
        }
        break;
      case "connected":
        console.log("Real-time stream connected");
        break;
      case "machine_started":
      case "machine_create":
      case "machine_update":
        if (data.data) {
          const transformedMachine = transformMachineData(data.data);
          if (transformedMachine) {
            setMachines((prevMachines) => {
              const newMachines = new Map(prevMachines);
              newMachines.set(transformedMachine.ip, transformedMachine);
              console.log(`Machine updated: ${transformedMachine.ip}`);
              setActiveMachinesLoading(false);
              return newMachines;
            });
          }
        }
        break;
      case "machine_stopped":
      case "machine_stop":
        if (data.data) {
          const transformedMachine = transformMachineData(data.data);
          if (transformedMachine) {
            setMachines((prevMachines) => {
              const newMachines = new Map(prevMachines);
              const existingMachine = newMachines.get(transformedMachine.ip);
              if (existingMachine) {
                const updatedMachine = {
                  ...existingMachine,
                  ...transformedMachine,
                  status: "Ended",
                  end_time: new Date().toISOString(),
                  stopped: true,
                };
                newMachines.set(transformedMachine.ip, updatedMachine);
              } else {
                const newMachine = {
                  ...transformedMachine,
                  status: "Ended",
                  end_time: new Date().toISOString(),
                  stopped: true,
                };
                newMachines.set(transformedMachine.ip, newMachine);
              }
              console.log(`Machine stopped: ${transformedMachine.ip} - now marked as Inactive`);
              setActiveMachinesLoading(false);
              return newMachines;
            });
          }
        }
        break;
      case "dashboard_stats":
        if (data.data) {
          setKpiData((prev) => ({
            ...prev,
            usersAffecting: safeParseInt(data.data.active_machines_count, prev.usersAffecting),
            cpuTriggers: safeParseInt(data.data.cpu_triggers, prev.cpuTriggers),
            ramTriggers: safeParseInt(data.data.ram_triggers, prev.ramTriggers),
            storageAlerts: safeParseInt(data.data.storage_alerts, prev.storageAlerts),
          }));
        }
        break;
      case "error":
        console.error("Server error:", data.message);
        setError(data.message);
        setActiveMachinesLoading(false);
        addError("Active Stream", data.message);
        break;
      default:
        console.log("Unknown event type:", data.type);
    }
  }, [addError]);

  const handleInactiveServerEvent = useCallback((data) => {
    console.log(`Received INACTIVE event: ${data.type}`, data);
    if (data.type === "initial_state") {
      inactiveInitialReceivedRef.current = true;
      if (inactiveTimeoutRef.current) {
        clearTimeout(inactiveTimeoutRef.current);
        inactiveTimeoutRef.current = null;
      }
    }
    setInactiveLastUpdate(new Date().toLocaleTimeString());
    switch (data.type) {
      case "initial_state":
        setInactiveMachines((prevMachines) => {
          const newMachines = new Map();
          if (data.data && Array.isArray(data.data)) {
            data.data.forEach((machine) => {
              const transformedMachine = transformMachineData(machine);
              if (transformedMachine) {
                newMachines.set(transformedMachine.ip, transformedMachine);
              }
            });
          }
          console.log(`Loaded initial inactive state: ${newMachines.size} machines`);
          setInactiveMachinesLoading(false);
          return newMachines;
        });
        if (data.source) {
          setInactiveDataSource(data.source);
        }
        break;
      case "connected":
        console.log("Inactive machines stream connected");
        break;
      case "machine_stopped":
      case "machine_stop":
        if (data.data) {
          const transformedMachine = transformMachineData(data.data);
          if (transformedMachine) {
            setInactiveMachines((prevMachines) => {
              const newMachines = new Map(prevMachines);
              newMachines.set(transformedMachine.ip, transformedMachine);
              console.log(`Inactive machine added/updated: ${transformedMachine.ip}`);
              setInactiveMachinesLoading(false);
              return newMachines;
            });
          }
        }
        break;
      case "error":
        console.error("Inactive server error:", data.message);
        setError(data.message);
        setInactiveMachinesLoading(false);
        addError("Inactive Stream", data.message);
        break;
      default:
        console.log("Unknown inactive event type:", data.type);
    }
  }, [addError]);

  const connectToEventStream = useCallback(() => {
    setIsConnected(false);
    try {
      console.log("Setting up EventSource connection...");
      eventSourceRef.current = createEventSource(API_ENDPOINTS.EVENTS_STREAM);
      eventSourceRef.current.onopen = () => {
        console.log("Real-time connection established");
        setIsConnected(true);
        setError(null);
        connectionRetryAttempts.current = 0;
      };
      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleServerEvent(data);
        } catch (error) {
          console.error("Error parsing event ", error);
          addError("Active Stream", "Message parse failed");
        }
      };
      eventSourceRef.current.onerror = (error) => {
        console.error("EventSource error:", error);
        setIsConnected(false);
        addError("Active Stream", "Connection error");
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          scheduleReconnect();
        }
      };
    } catch (error) {
      console.error("Failed to create EventSource:", error);
      addError("Active Stream", "Initialization failed");
      scheduleReconnect();
    }
  }, [handleServerEvent, addError]);

  const connectToInactiveEventStream = useCallback(() => {
    setIsInactiveConnected(false);
    inactiveInitialReceivedRef.current = false;
    try {
      console.log("Setting up Inactive EventSource connection...");
      inactiveEventSourceRef.current = createInactiveEventSource(API_ENDPOINTS.EVENTS_INACTIVE);
      inactiveEventSourceRef.current.onopen = () => {
        console.log("Inactive machines stream connected");
        setIsInactiveConnected(true);
        setError(null);
        inactiveConnectionRetryAttempts.current = 0;
        inactiveTimeoutRef.current = setTimeout(() => {
          if (!inactiveInitialReceivedRef.current) {
            console.warn("Inactive stream timeout: assuming empty.");
            setInactiveMachines(new Map());
            setInactiveMachinesLoading(false);
          }
        }, 5000);
      };
      inactiveEventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleInactiveServerEvent(data);
        } catch (error) {
          console.error("Error parsing inactive event ", error);
          addError("Inactive Stream", "Message parse failed");
        }
      };
      inactiveEventSourceRef.current.onerror = (error) => {
        console.error("Inactive EventSource error:", error);
        setIsInactiveConnected(false);
        addError("Inactive Stream", "Connection error");
        if (inactiveEventSourceRef.current?.readyState === EventSource.CLOSED) {
          scheduleInactiveReconnect();
        }
      };
    } catch (error) {
      console.error("Failed to create Inactive EventSource:", error);
      addError("Inactive Stream", "Initialization failed");
      scheduleInactiveReconnect();
      inactiveTimeoutRef.current = setTimeout(() => {
        if (!inactiveInitialReceivedRef.current) {
          setInactiveMachines(new Map());
          setInactiveMachinesLoading(false);
        }
      }, 5000);
    }
  }, [handleInactiveServerEvent, addError]);

  const scheduleReconnect = useCallback(() => {
    connectionRetryAttempts.current++;
    if (connectionRetryAttempts.current <= maxRetryAttempts) {
      const delay = retryDelay * Math.pow(2, connectionRetryAttempts.current - 1);
      console.log(
        `Connection lost. Retrying in ${delay / 1000} seconds... (${connectionRetryAttempts.current}/${maxRetryAttempts})`
      );
      reconnectTimeoutRef.current = setTimeout(() => {
        connectToEventStream();
      }, delay);
    } else {
      console.log("Max reconnection attempts reached.");
      setError("Connection lost. Please refresh the page.");
      addError("Active Stream", "Max retries exceeded");
    }
  }, [connectToEventStream, addError]);

  const scheduleInactiveReconnect = useCallback(() => {
    inactiveConnectionRetryAttempts.current++;
    if (inactiveConnectionRetryAttempts.current <= inactiveMaxRetryAttempts) {
      const delay = inactiveRetryDelay * Math.pow(2, inactiveConnectionRetryAttempts.current - 1);
      console.log(
        `Inactive connection lost. Retrying in ${delay / 1000} seconds... (${inactiveConnectionRetryAttempts.current}/${inactiveMaxRetryAttempts})`
      );
      inactiveReconnectTimeoutRef.current = setTimeout(() => {
        connectToInactiveEventStream();
      }, delay);
    } else {
      console.log("Max inactive reconnection attempts reached.");
      setError("Inactive machines stream connection lost. Please refresh the page.");
      addError("Inactive Stream", "Max retries exceeded");
    }
  }, [connectToInactiveEventStream, addError]);

  const refreshActiveMachines = useCallback(async () => {
    setActiveMachinesLoading(true);
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      const activeMachinesResponse = await machineAPI.getActiveMachines({
        page: 1,
        page_size: 30,
      });
      let activeData = [];
      if (activeMachinesResponse.data && Array.isArray(activeMachinesResponse.data)) {
        activeData = activeMachinesResponse.data;
      } else if (activeMachinesResponse.data?.data && Array.isArray(activeMachinesResponse.data.data)) {
        activeData = activeMachinesResponse.data.data;
      }
      const initialMachines = new Map();
      activeData.forEach((machine) => {
        const transformedMachine = transformMachineData(machine);
        if (transformedMachine) {
          initialMachines.set(transformedMachine.ip, transformedMachine);
        }
      });
      setMachines(initialMachines);
      setDataSource("API refresh");
      setActiveMachinesLoading(false);
      connectToEventStream();
    } catch (err) {
      console.error("Refresh active failed:", err);
      setActiveMachinesLoading(false);
      addError("Refresh", "Failed to reload active machines");
    }
  }, [connectToEventStream, addError]);

  const refreshInactiveMachines = useCallback(() => {
    setInactiveMachinesLoading(true);
    if (inactiveEventSourceRef.current) {
      inactiveEventSourceRef.current.close();
      inactiveEventSourceRef.current = null;
    }
    if (inactiveTimeoutRef.current) {
      clearTimeout(inactiveTimeoutRef.current);
      inactiveTimeoutRef.current = null;
    }
    inactiveInitialReceivedRef.current = false;
    setInactiveMachines(new Map());
    connectToInactiveEventStream();
  }, [connectToInactiveEventStream]);

  const fetchStorageAlerts = useCallback(async (page = 1) => {
    setStorageAlertsLoading(true);
    try {
      const localDate = new Date().toLocaleDateString('en-CA');
      const response = await storageAPI.getPaginatedStorageList({
        date_from: localDate,
        page: page,
        page_size: storagePageSize,
      });

      let items = [];
      let pagination = {};

      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        pagination = response.data.pagination || {};
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
        pagination = { total_count: items.length, total_pages: 1 };
      } else {
        console.warn("Unexpected storage API response format", response.data);
        items = [];
        pagination = { total_count: 0, total_pages: 1 };
      }

      const transformedAlerts = items.map(transformStorageData).filter(Boolean);
      setStorageAlerts(transformedAlerts);
      setStorageTotalCount(pagination.total_count || 0);
      setStorageTotalPages(pagination.total_pages || 1);
      setStoragePage(page);
    } catch (error) {
      console.error("Failed to fetch storage alerts:", error);
      setStorageAlerts([]);
      setStorageTotalCount(0);
      setStorageTotalPages(1);
      addError("Storage API", "Failed to load storage alerts");
    } finally {
      setStorageAlertsLoading(false);
    }
  }, [storagePageSize, addError]);

  const handleRefreshStorage = useCallback(() => {
    fetchStorageAlerts(1);
  }, [fetchStorageAlerts]);

  const handleStoragePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= storageTotalPages) {
        fetchStorageAlerts(newPage);
      }
    },
    [storageTotalPages, fetchStorageAlerts]
  );

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkAPIHealth();
        setBackendDown(!health.isHealthy);
        if (!health.isHealthy) {
          if (backendDownTimeoutRef.current) clearTimeout(backendDownTimeoutRef.current);
          backendDownTimeoutRef.current = setTimeout(() => setBackendDown(false), 10000);
          addError("Backend", "Connection lost");
        }
      } catch (err) {
        setBackendDown(true);
        if (backendDownTimeoutRef.current) clearTimeout(backendDownTimeoutRef.current);
        backendDownTimeoutRef.current = setTimeout(() => setBackendDown(false), 10000);
        addError("Backend", "Health check failed");
      }
    };

    const initializeStreams = async () => {
      try {
        setActiveMachinesLoading(true);
        setStorageAlertsLoading(true);
        setInactiveMachinesLoading(true);
        setError(null);
        await fetchStorageAlerts(1);
        connectToEventStream();
        connectToInactiveEventStream();
      } catch (err) {
        console.error("Failed to initialize streams:", err);
        addError("System", "Initialization failed");
        setActiveMachinesLoading(false);
        setInactiveMachinesLoading(false);
        setStorageAlertsLoading(false);
      }
    };

    checkHealth();
    initializeStreams();

    const healthInterval = setInterval(checkHealth, 300000); 
    return () => {
      clearInterval(healthInterval);
      if (backendDownTimeoutRef.current) clearTimeout(backendDownTimeoutRef.current);
      if (inactiveTimeoutRef.current) clearTimeout(inactiveTimeoutRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (inactiveEventSourceRef.current) inactiveEventSourceRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (inactiveReconnectTimeoutRef.current) clearTimeout(inactiveReconnectTimeoutRef.current);
    };
  }, [addError, connectToEventStream, connectToInactiveEventStream, fetchStorageAlerts]);

  useEffect(() => {
    const activeMachines = Array.from(machines.values()).filter(
      (machine) => machine.status !== "Ended"
    );
    const usersAffecting = activeMachines.reduce((sum, m) => sum + (m.users || 0), 0);
    const cpuTriggers = activeMachines.filter((m) => m.cpu === true).length;
    const ramTriggers = activeMachines.filter((m) => m.ram === true).length;

    setKpiData({
      usersAffecting: isNaN(usersAffecting) ? 0 : usersAffecting,
      cpuTriggers: isNaN(cpuTriggers) ? 0 : cpuTriggers,
      ramTriggers: isNaN(ramTriggers) ? 0 : ramTriggers,
      storageAlerts: storageAlertsLoading ? 0 : storageTotalCount, // ✅ Show 0 during load
    });
  }, [machines, storageTotalCount, storageAlertsLoading]);

  const navigate = useNavigate();
  const handleViewDetails = (machine) => {
    if (machine.uuid) {
      navigate(`/events/${machine.uuid}`);
    } else {
      console.warn("Machine has no UUID:", machine);
    }
  };

  const getBadge = (status) => {
    const variants = {
      Ongoing: "bg-red-100 text-red-800 border-red-200",
      Ended: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[status] || variants.Ongoing}`}>
        {status === "Ongoing" ? <XCircle className="w-3 h-3 text-red-600" /> : <CheckCircle className="w-3 h-3 text-blue-600" />}
        {status}
      </span>
    );
  };

  const getTriggerIcons = (machine) => (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <Cpu className={`w-4 h-4 ${machine.cpu ? "text-blue-600" : "text-slate-300"}`} />
        <span className="text-[10px] mt-1 text-slate-500">CPU</span>
      </div>
      <div className="flex flex-col items-center">
        <MemoryStick className={`w-4 h-4 ${machine.ram ? "text-orange-600" : "text-slate-300"}`} />
        <span className="text-[10px] mt-1 text-slate-500">Memory</span>
      </div>
      <div className="flex flex-col items-center">
        <HardDrive className={`w-4 h-4 ${machine.storage ? "text-purple-600" : "text-slate-300"}`} />
        <span className="text-[10px] mt-1 text-slate-500">Storage</span>
      </div>
    </div>
  );

  const handleMachinePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalMachinePages) {
        setMachinePage(newPage);
      }
    },
    [totalMachinePages]
  );

  const handleCriticalPageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalCriticalPages) {
        setCriticalPage(newPage);
      }
    },
    [totalCriticalPages]
  );

  const handleInactivePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalInactivePages) {
        setInactivePage(newPage);
      }
    },
    [totalInactivePages]
  );

  const displayMachines = getPaginatedMachines();
  const displayCriticalMachines = getPaginatedCriticalMachines();
  const displayInactiveMachines = getPaginatedInactiveMachines();
  const displayStorageAlerts = getPaginatedStorageAlerts();

  const tableHeight = "calc(10 * 3.5rem + 2.5rem)";

  const MachineCard = ({ machine, isInactive = false }) => (
    <div
      className={`rounded-lg p-4 mb-3 shadow-sm border ${
        machine.users === 0
          ? 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-red-400 border-red-200'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Laptop className="w-4 h-4 text-slate-500" />
            <span className="font-mono text-sm text-slate-700">{machine.ip || 'N/A'}</span>
          </div>
          <div className="text-xs text-slate-600 mb-1">
            {isInactive
              ? `Duration: ${formatDuration(machine.duration)}`
              : `Started: ${getFriendlyRuntime(machine.created_at)}`
            }
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-slate-600">
              {machine.users === 0 ? "Type:" : "Users:"}
            </span>
            {machine.users === 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                System
              </span>
            ) : (
              <span
                className={`font-semibold text-sm ${
                  (machine.triggers || 0) > 30
                    ? "text-rose-600"
                    : (machine.triggers || 0) > 15
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {machine.users}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          {getBadge(machine.status)}
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => handleViewDetails(machine)}
              disabled={machine.status === "Ongoing" && !isInactive}
              className={`px-2.5 py-1 text-xs rounded border font-medium ${
                machine.status === "Ongoing" && !isInactive
                  ? "text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed"
                  : "text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              View Details
            </button>
            {machine.users === 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInfoPopup(machine.uuid || machine.ip);
                }}
                className="text-slate-500 hover:text-slate-700 focus:outline-none"
                title="System-level event"
              >
                <Info className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-slate-100">
        {getTriggerIcons(machine)}
      </div>
    </div>
  );

  const StorageAlertCard = ({ alert }) => {
    const handleViewDetails = () => {
      const parsedDate = new Date(alert.timestamp);
      const isoCreatedAt = isNaN(parsedDate.getTime())
        ? new Date().toISOString()
        : parsedDate.toISOString();
      const searchParams = new URLSearchParams({
        created_at: isoCreatedAt,
      }).toString();
      navigate(`/storage/${alert.ip}?${searchParams}`);
    };
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Laptop className="w-4 h-4 text-slate-500" />
              <span className="font-mono text-sm text-slate-700">{alert.ip || 'N/A'}</span>
            </div>
            <div className="text-xs text-slate-600 mb-1">
              {formatTimestamp(alert.timestamp)}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
              <div><span className="text-slate-500">Total:</span> {alert.totalSpace} GB</div>
              <div><span className="text-slate-500">Used:</span> {alert.usedSpace} GB</div>
              <div><span className="text-slate-500">Free:</span> {alert.freeSpace} GB</div>
              <div>
                <span className="text-slate-500">Used %:</span>
                <span className="font-semibold text-rose-600 ml-1">
                  {isNaN(alert.usedPercent) ? '0.00' : alert.usedPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleViewDetails}
            className="mt-2 px-2.5 py-1 text-xs rounded border border-slate-300 font-medium text-slate-700 hover:bg-slate-100"
          >
            View
          </button>
        </div>
      </div>
    );
  };

  const TableSkeleton = () => (
    <div className="overflow-x-auto" style={{ height: tableHeight }}>
      <table className="w-full min-w-full">
        <thead>
          <tr className="text-left text-slate-500 text-xs border-b border-slate-200 h-10">
            <th className="p-3 font-medium">IP Address</th>
            <th className="p-3 font-medium">Alert Duration</th>
            <th className="p-3 font-medium">Users</th>
            <th className="p-3 font-medium">Trigger</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, i) => (
            <tr key={i} className="border-b border-slate-100 h-14">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                </div>
              </td>
              <td className="p-3">
                <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
              </td>
              <td className="p-3">
                <div className="h-4 bg-slate-200 rounded w-8 animate-pulse"></div>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-2 bg-slate-200 rounded w-8 mt-1 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </td>
              <td className="p-3">
                <div className="h-6 bg-slate-200 rounded-full w-20 animate-pulse"></div>
              </td>
              <td className="p-3">
                <div className="h-6 bg-slate-200 rounded-lg w-24 animate-pulse"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const StorageTableSkeleton = () => (
    <div className="overflow-x-auto" style={{ height: tableHeight }}>
      <table className="w-full min-w-full">
        <thead>
          <tr className="text-left text-slate-500 text-xs border-b border-slate-200 h-10">
            <th className="p-3 font-medium">IP Address</th>
            <th className="p-3 font-medium">Timestamp</th>
            <th className="p-3 font-medium">Total Space (GB)</th>
            <th className="p-3 font-medium">Used (%)</th>
            <th className="p-3 font-medium">Used Space (GB)</th>
            <th className="p-3 font-medium">Free Space (GB)</th>
            <th className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, i) => (
            <tr key={i} className="border-b border-slate-100 h-14">
              <td className="p-3">
                <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
              </td>
              <td className="p-3">
                <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
              </td>
              <td className="p-3">
                <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
              </td>
              <td className="p-3">
                <div className="h-4 bg-slate-200 rounded w-12 animate-pulse"></div>
              </td>
              <td className="p-3">
                <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
              </td>
              <td className="p-3">
                <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
              </td>
              <td className="p-3">
                <div className="h-6 bg-slate-200 rounded-lg w-20 animate-pulse"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const [infoPopup, setInfoPopup] = useState(null);

  return (
    <>
      {backendDown && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-rose-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Backend connection is lost</span>
        </div>
      )}

      {/* Bottom-right error notifications */}
      {errors.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-xs">
          {errors.slice(0, 3).map((err) => (
            <div
              key={err.id}
              className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg text-sm"
            >
              <div className="font-medium">⚠️ {err.source}</div>
              <div className="mt-1">{err.message}</div>
            </div>
          ))}
          {errors.length > 3 && (
            <button
              onClick={() => setShowAllErrors(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              View All ({errors.length})
            </button>
          )}
        </div>
      )}

      {/* Full error panel modal */}
      {showAllErrors && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-t-lg w-full max-w-md max-h-96 overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">All Errors</h3>
              <button
                onClick={() => setShowAllErrors(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {errors.map((err) => (
                <div key={err.id} className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <div className="font-medium text-red-800">⚠️ {err.source}</div>
                  <div className="text-sm text-red-700 mt-1">{err.message}</div>
                  <div className="text-xs text-red-500 mt-2">
                    {new Date(err.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setErrors([]);
                  setShowAllErrors(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {infoPopup && (
        <InfoPopup
          message="This is a special system-level event indicating that resource thresholds were exceeded even when no user was logged in."
          onClose={() => setInfoPopup(null)}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <div className="flex-1 overflow-auto pt-20 pb-20 md:pb-0 md:ml-16">
            <div className="mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
              <MetricsCards
                kpiData={kpiData}
                className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4"
              />

              {/* Active Events */}
              <div className="bg-white rounded-xl shadow-sm border border-rose-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between p-3 md:p-4 border-b border-rose-200 bg-gradient-to-r from-rose-50 to-red-50">
                  <h3 className="text-base md:text-lg font-semibold flex items-center gap-1.5 md:gap-2 text-rose-800">
                    <ArrowBigUpDash className="w-4 h-4 text-rose-600" />
                    <span>Active Events</span>
                  </h3>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xs md:text-sm font-medium text-rose-700">
                      {activeMachinesLoading ? "Loading..." : `${totalMachines} events`}
                    </span>
                    <button
                      onClick={refreshActiveMachines}
                      disabled={activeMachinesLoading}
                      className="p-1.5 rounded-full hover:bg-rose-100 text-rose-600 disabled:opacity-50"
                      title="Refresh active machines"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3 md:p-5">
                  <div className="md:hidden">
                    {activeMachinesLoading ? (
                      <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    ) : displayMachines.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Laptop className="w-10 h-10 text-rose-400 mb-2" />
                        <h3 className="text-base font-medium text-rose-600">No active issues</h3>
                        <p className="text-xs text-rose-500 mt-1">All systems are stable</p>
                      </div>
                    ) : (
                      <div>
                        {displayMachines.map((m) => (
                          <MachineCard key={m.uuid || m.ip} machine={m} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block">
                    {activeMachinesLoading ? (
                      <TableSkeleton />
                    ) : displayMachines.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center" style={{ height: tableHeight }}>
                        <Laptop className="w-12 h-12 text-rose-400 mb-3" />
                        <h3 className="text-lg font-medium text-rose-600">No active issues today</h3>
                        <p className="text-sm text-rose-500 mt-1">All systems are stable</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto" style={{ height: tableHeight }}>
                        <table className="w-full min-w-full">
                          <thead>
                            <tr className="text-left text-slate-500 text-xs border-b border-slate-200 h-10">
                              <th className="p-3 font-medium">IP Address</th>
                              <th className="p-3 font-medium">Alert Duration</th>
                              <th className="p-3 font-medium">Users</th>
                              <th className="p-3 font-medium">Trigger</th>
                              <th className="p-3 font-medium">Status</th>
                              <th className="p-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayMachines.map((m) => (
                              <tr
                                key={m.uuid || m.ip}
                                className={`border-b border-slate-100 h-14 ${
                                  m.users === 0
                                    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-red-400'
                                    : 'hover:bg-rose-50 transition-colors'
                                }`}
                              >
                                <td className="p-3 text-sm font-mono text-slate-700 align-middle">
                                  <div className="flex items-center gap-2">
                                    <Laptop className="w-4 h-4 text-slate-500" />
                                    {m.ip || 'N/A'}
                                  </div>
                                </td>
                                <td className="p-3 text-sm text-slate-600 align-middle">
                                  {m.status === "Ongoing"
                                    ? getFriendlyRuntime(m.created_at)
                                    : m.lastSeen || 'N/A'}
                                </td>
                                <td className="p-3 align-middle">
                                  {m.users === 0 ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                      System
                                    </span>
                                  ) : (
                                    <span
                                      className={`font-semibold ${
                                        (m.triggers || 0) > 30
                                          ? "text-rose-600"
                                          : (m.triggers || 0) > 15
                                          ? "text-amber-600"
                                          : "text-emerald-600"
                                      }`}
                                    >
                                      {m.users}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 align-middle">{getTriggerIcons(m)}</td>
                                <td className="p-3 align-middle">{getBadge(m.status)}</td>
                                <td className="p-3 align-middle">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleViewDetails(m)}
                                      disabled={m.status === "Ongoing"}
                                      className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                                        m.status === "Ongoing"
                                          ? "text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed"
                                          : "text-slate-700 border-slate-300 hover:bg-slate-100"
                                      }`}
                                    >
                                      View Details
                                    </button>
                                    {m.users === 0 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setInfoPopup(m.uuid || m.ip);
                                        }}
                                        className="text-slate-500 hover:text-slate-700 focus:outline-none"
                                        title="System-level event"
                                      >
                                        <Flag className="w-4 h-4 text-red-600" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
                {!activeMachinesLoading && totalMachinePages > 1 && (
                  <div className="flex justify-end p-3 md:p-4 border-t border-slate-200 gap-1 md:gap-2">
                    <button
                      onClick={() => handleMachinePageChange(machinePage - 1)}
                      disabled={machinePage === 1}
                      className="p-1.5 md:p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                    >
                      <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                    <span className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm text-slate-600 font-medium">
                      Page {machinePage} of {totalMachinePages}
                    </span>
                    <button
                      onClick={() => handleMachinePageChange(machinePage + 1)}
                      disabled={machinePage === totalMachinePages}
                      className="p-1.5 md:p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                    >
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between p-3 md:p-5 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-base md:text-lg font-semibold flex items-center gap-1.5 md:gap-2 text-blue-800">
                    <ArrowBigDownDash className="w-4 h-4 text-blue-600" />
                    <span>Inactive Events</span>
                  </h3>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xs md:text-sm font-medium text-blue-700">
                      {inactiveMachinesLoading ? "Loading..." : `${totalInactiveMachines} events`}
                    </span>
                    <button
                      onClick={refreshInactiveMachines}
                      disabled={inactiveMachinesLoading}
                      className="p-1.5 rounded-full hover:bg-blue-100 text-blue-600 disabled:opacity-50"
                      title="Refresh inactive machines"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3 md:p-5">
                  <div className="md:hidden">
                    {inactiveMachinesLoading ? (
                      <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    ) : displayInactiveMachines.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <ArrowBigDownDash className="w-10 h-10 text-blue-400 mb-2" />
                        <h3 className="text-base font-medium text-blue-600">No inactive machines</h3>
                        <p className="text-xs text-blue-500 mt-1">Resolved events will appear here</p>
                      </div>
                    ) : (
                      <div>
                        {displayInactiveMachines.map((m) => (
                          <MachineCard key={m.uuid || m.ip} machine={m} isInactive={true} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block">
                    {inactiveMachinesLoading ? (
                      <TableSkeleton />
                    ) : displayInactiveMachines.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center" style={{ height: tableHeight }}>
                        <ArrowBigDownDash className="w-12 h-12 text-blue-400 mb-3" />
                        <h3 className="text-lg font-medium text-blue-600">No inactive machines today</h3>
                        <p className="text-sm text-blue-500 mt-1">Resolved events will appear here</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto" style={{ height: tableHeight }}>
                        <table className="w-full min-w-full">
                          <thead>
                            <tr className="text-left text-slate-500 text-xs border-b border-slate-200 h-10">
                              <th className="p-3 font-medium">IP Address</th>
                              <th className="p-3 font-medium">Duration</th>
                              <th className="p-3 font-medium">Users</th>
                              <th className="p-3 font-medium">Trigger</th>
                              <th className="p-3 font-medium">Status</th>
                              <th className="p-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayInactiveMachines.map((m) => (
                              <tr
                                key={m.uuid || m.ip}
                                className={`border-b border-slate-100 h-14 ${
                                  m.users === 0
                                    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-red-400'
                                    : 'hover:bg-blue-50 transition-colors'
                                }`}
                              >
                                <td className="p-3 text-sm font-mono text-slate-700 align-middle">
                                  <div className="flex items-center gap-2">
                                    <Laptop className="w-4 h-4 text-slate-500" />
                                    {m.ip || 'N/A'}
                                  </div>
                                </td>
                                <td className="p-3 text-sm text-slate-600 align-middle">
                                  {formatDuration(m.duration)}
                                </td>
                                <td className="p-3 align-middle">
                                  {m.users === 0 ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                      System
                                    </span>
                                  ) : (
                                    <span
                                      className={`font-semibold ${
                                        (m.triggers || 0) > 30
                                          ? "text-rose-600"
                                          : (m.triggers || 0) > 15
                                          ? "text-amber-600"
                                          : "text-emerald-600"
                                      }`}
                                    >
                                      {m.users}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 align-middle">{getTriggerIcons(m)}</td>
                                <td className="p-3 align-middle">{getBadge(m.status)}</td>
                                <td className="p-3 align-middle">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleViewDetails(m)}
                                      className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                    >
                                      View Details
                                    </button>
                                    {m.users === 0 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setInfoPopup(m.uuid || m.ip);
                                        }}
                                        className="text-slate-500 hover:text-slate-700 focus:outline-none"
                                        title="System-level event"
                                      >
                                        <Flag className="w-4 h-4 text-red-600" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
                {!inactiveMachinesLoading && totalInactivePages > 1 && (
                  <div className="flex justify-end p-3 md:p-4 border-t border-slate-200 gap-1 md:gap-2">
                    <button
                      onClick={() => handleInactivePageChange(inactivePage - 1)}
                      disabled={inactivePage === 1}
                      className="p-1.5 md:p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                    >
                      <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                    <span className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm text-slate-600 font-medium">
                      Page {inactivePage} of {totalInactivePages}
                    </span>
                    <button
                      onClick={() => handleInactivePageChange(inactivePage + 1)}
                      disabled={inactivePage === totalInactivePages}
                      className="p-1.5 md:p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                    >
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between p-3 md:p-5 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <h3 className="text-base md:text-lg font-semibold flex items-center gap-1.5 md:gap-2 text-purple-800">
                    <HardDrive className="w-4 h-4 text-purple-600" />
                    <span>Storage Alerts</span>
                  </h3>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xs md:text-sm font-medium text-purple-700">
                      {storageAlertsLoading ? "0 alerts" : `${storageTotalCount} alerts`}
                    </span>
                    <button
                      onClick={handleRefreshStorage}
                      disabled={storageAlertsLoading}
                      className="p-1.5 rounded-full hover:bg-purple-100 text-purple-600 disabled:opacity-50"
                      title="Refresh storage alerts"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3 md:p-5">
                  <div className="md:hidden">
                    {storageAlertsLoading ? (
                      <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-28 bg-slate-100 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    ) : displayStorageAlerts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Laptop className="w-10 h-10 text-purple-400 mb-2" />
                        <h3 className="text-base font-medium text-purple-600">No storage alerts</h3>
                        <p className="text-xs text-purple-500 mt-1">All storage systems are healthy</p>
                      </div>
                    ) : (
                      <div>
                        {displayStorageAlerts.map((alert, index) => (
                          <StorageAlertCard key={index} alert={alert} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block">
                    {storageAlertsLoading ? (
                      <StorageTableSkeleton />
                    ) : displayStorageAlerts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center" style={{ height: tableHeight }}>
                        <Laptop className="w-12 h-12 text-purple-400 mb-3" />
                        <h3 className="text-lg font-medium text-purple-600">No storage alerts today</h3>
                        <p className="text-sm text-purple-500 mt-1">All storage systems are healthy</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto" style={{ height: tableHeight }}>
                        <table className="w-full min-w-full">
                          <thead>
                            <tr className="text-left text-slate-500 text-xs border-b border-slate-200 h-10">
                              <th className="p-3 font-medium">IP Address</th>
                              <th className="p-3 font-medium">Timestamp</th>
                              <th className="p-3 font-medium">Total Space (GB)</th>
                              <th className="p-3 font-medium">Used (%)</th>
                              <th className="p-3 font-medium">Used Space (GB)</th>
                              <th className="p-3 font-medium">Free Space (GB)</th>
                              <th className="p-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayStorageAlerts.map((alert, index) => (
                              <tr
                                key={index}
                                className="border-b border-slate-100 hover:bg-purple-50 transition-colors h-14"
                              >
                                <td className="p-3 text-sm font-mono text-slate-700 align-middle">
                                  <div className="flex items-center gap-2">
                                    <Laptop className="w-4 h-4 text-slate-500" />
                                    {alert.ip || 'N/A'}
                                  </div>
                                </td>
                                <td className="p-3 text-sm text-slate-600 align-middle">
                                  {formatTimestamp(alert.timestamp)}
                                </td>
                                <td className="p-3 text-sm text-slate-600 align-middle">
                                  {alert.totalSpace || '0.00'}
                                </td>
                                <td className="p-3 align-middle">
                                  <span className="font-semibold text-rose-600">
                                    {isNaN(alert.usedPercent) ? '0.00' : alert.usedPercent.toFixed(2)}%
                                  </span>
                                </td>
                                <td className="p-3 text-sm text-slate-600 align-middle">
                                  {alert.usedSpace || '0.00'}
                                </td>
                                <td className="p-3 text-sm text-slate-600 align-middle">
                                  {alert.freeSpace || '0.00'}
                                </td>
                                <td className="p-3 align-middle">
                                  <button
                                    onClick={() => {
                                      const parsedDate = new Date(alert.timestamp);
                                      const isoCreatedAt = isNaN(parsedDate.getTime())
                                        ? new Date().toISOString()
                                        : parsedDate.toISOString();
                                      const searchParams = new URLSearchParams({
                                        created_at: isoCreatedAt,
                                      }).toString();
                                      navigate(`/storage/${alert.ip}?${searchParams}`);
                                    }}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {!storageAlertsLoading && storageTotalPages > 1 && (
                  <div className="flex justify-end p-3 md:p-4 border-t border-slate-200 gap-1 md:gap-2">
                    <button
                      onClick={() => handleStoragePageChange(storagePage - 1)}
                      disabled={storagePage === 1}
                      className="p-1.5 md:p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                    >
                      <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                    <span className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm text-slate-600 font-medium">
                      Page {storagePage} of {storageTotalPages}
                    </span>
                    <button
                      onClick={() => handleStoragePageChange(storagePage + 1)}
                      disabled={storagePage === storageTotalPages}
                      className="p-1.5 md:p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                    >
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};