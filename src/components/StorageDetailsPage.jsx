import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  Server,
  FolderSearch,
  Folder,
  User,
  EyeOff,
  AlertTriangle,
  X,
  Menu,
  Info,
  FolderTree
} from "lucide-react";
import { storageAPI } from "./config/api";

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "N/A";
  }
};

const getUserInitials = (username) => {
  if (!username) return "??";
  return username
    .split(/[\s_\-]/)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

const getUserColor = (index) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-cyan-500",
  ];
  return colors[index % colors.length];
};

const SkeletonLoader = ({ isMobile }) => (
  <div className={isMobile ? "min-h-screen bg-gray-50" : "flex pt-16"}>
    {/* Mobile Header */}
    {isMobile && (
      <div className="bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between">
          <div className="w-10 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )}

    {/* Desktop Header */}
    {!isMobile && (
      <div className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )}

    {/* Mobile Layout */}
    {isMobile && (
      <div className="pt-16 pb-20">
        <div className="p-4 space-y-6">
          {[...Array(3)].map((_, i) => (
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

    {/* Desktop Layout */}
    {!isMobile && (
      <>
        {/* Left Sidebar Skeleton */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 fixed left-0 top-16 h-[calc(100vh-4rem)]">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 ml-80 p-6 space-y-8">
          {/* Root Folders Skeleton */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {[...Array(4)].map((_, i) => (
                      <th key={i} className="p-3">
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-100 h-12">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse ml-auto"></div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="h-3 w-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Folders Skeleton */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {[...Array(3)].map((_, i) => (
                      <th key={i} className="p-3">
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-100 h-12">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse ml-auto"></div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col items-end">
                          <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full mt-2 animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);

const StorageDetailsPage = () => {
  const { ip } = useParams();
  const [searchParams] = useSearchParams();
  const createdAtParam = searchParams.get('created_at');
  const navigate = useNavigate();
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetchStorageData();
  }, [ip]);

  const fetchStorageData = async () => {
    if (!ip) {
      setError("Invalid IP address");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await storageAPI.getLatestStorageByIP(ip, createdAtParam);
      setStorageData(response.data);
    } catch (err) {
      console.error("Error fetching storage ", err);
      setError("Failed to load storage details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <SkeletonLoader isMobile={isMobile} />
      </div>
    );
  }

  if (error || !storageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6 max-w-md w-full">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Storage Data Not Found</h3>
              <p className="text-red-600 mb-4 text-sm leading-relaxed">
                {error || `No storage data found for IP: ${ip}`}
              </p>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getNumber = (val) => (typeof val === 'object' && val?.$numberLong ? Number(val.$numberLong) : val || 0);

  const totalsizebytes = getNumber(storageData.totalsizebytes);
  const usedspacebytes = getNumber(storageData.usedspacebytes);
  const freespacebytes = getNumber(storageData.freespacebytes);
  const rootfilessize = storageData.rootfolders?.reduce((sum, f) => sum + getNumber(f.size), 0) || 0;
  const totalUserSize = storageData.userfolders?.reduce((sum, f) => sum + getNumber(f.size), 0) || 0;

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
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute top-0 left-0 h-full w-64 bg-white shadow-lg z-10">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-gray-900">Storage Details</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
              {/* System Information */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">System Information</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">IP Address:</span>
                    <p className="font-mono">{storageData.ip}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Computer Name:</span>
                    <p className="font-mono">{storageData.computername || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Drive:</span>
                    <p className="font-mono">{storageData.drive || "C"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Timestamp:</span>
                    <p className="font-mono">
                      {formatDate(storageData.timestamp)}, {formatTime(storageData.timestamp)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Space Summary */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Space Summary</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Total Size</span>
                      <span className="font-medium">{formatBytes(totalsizebytes)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Used Space</span>
                      <span className="font-medium">{formatBytes(usedspacebytes)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${storageData.usedpercent > 90
                            ? "bg-rose-500"
                            : storageData.usedpercent > 75
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        style={{ width: `${storageData.usedpercent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{storageData.usedpercent?.toFixed(2)}% used</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Free Space</span>
                      <span className="font-medium">{formatBytes(freespacebytes)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Space Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FolderTree className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Space Distribution</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Root Folders</span>
                      <span className="font-medium">{formatBytes(rootfilessize)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{
                          width: `${(rootfilessize / totalsizebytes) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">User Folders</span>
                      <span className="font-medium">{formatBytes(totalUserSize)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-purple-500 rounded-full"
                        style={{
                          width: `${(totalUserSize / totalsizebytes) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="flex pt-16">
          {/* Fixed Left Sidebar - System Info */}
          <div className="w-80 bg-white border-r border-gray-200 p-6 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FolderSearch className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">Storage Details</h1>
              </div>
              <p className="text-sm text-gray-600">Detailed storage analysis for <span className="font-mono">{storageData.ip}</span></p>
            </div>

            {/* System Information */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Server className="h-4 w-4 text-purple-600" />
                <span className="font-medium">System Information</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">IP Address:</span>
                  <p className="font-mono">{storageData.ip}</p>
                </div>
                <div>
                  <span className="text-gray-600">Computer Name:</span>
                  <p className="font-mono">{storageData.computername || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Drive:</span>
                  <p className="font-mono">{storageData.drive || "C"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Timestamp:</span>
                  <p className="font-mono">
                    {formatDate(storageData.timestamp)}, {formatTime(storageData.timestamp)}
                  </p>
                </div>
              </div>
            </div>

            {/* Space Summary */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Space Summary</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Total Size</span>
                    <span className="font-medium">{formatBytes(totalsizebytes)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Used Space</span>
                    <span className="font-medium">{formatBytes(usedspacebytes)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${storageData.usedpercent > 90
                          ? "bg-rose-500"
                          : storageData.usedpercent > 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      style={{ width: `${storageData.usedpercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{storageData.usedpercent?.toFixed(2)}% used</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Free Space</span>
                    <span className="font-medium">{formatBytes(freespacebytes)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Space Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <FolderTree className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Space Distribution</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Root Folders</span>
                    <span className="font-medium">{formatBytes(rootfilessize)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{
                        width: `${(rootfilessize / totalsizebytes) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">User Folders</span>
                    <span className="font-medium">{formatBytes(totalUserSize)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-purple-500 rounded-full"
                      style={{
                        width: `${(totalUserSize / totalsizebytes) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Root & User Folders */}
          <div className="flex-1 ml-80 p-6 space-y-8">
            {/* Root Folders */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Root Folders ({storageData.rootfolders?.length || 0})
                  </h3>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Folder Name
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size (GB)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usage
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {storageData.rootfolders?.map((folder, index) => {
                        const size = getNumber(folder.size);
                        const folderPercent = usedspacebytes > 0
                          ? ((size / usedspacebytes) * 100).toFixed(1)
                          : 0;

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center gap-2">
                                <Folder
                                  className={`w-4 h-4 ${folder.ishidden ? "text-gray-400" : "text-blue-600"
                                    }`}
                                />
                                {folder.name}
                                {folder.ishidden && (
                                  <EyeOff className="w-3 h-3 text-gray-400" title="Hidden folder" />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                              {(size / 1073741824).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-medium text-blue-700">{folderPercent}%</span>
                                <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="h-1.5 bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min(folderPercent, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${folder.ishidden
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-blue-100 text-blue-700"
                                  }`}
                              >
                                {folder.ishidden ? "Hidden" : "Visible"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* User Folders */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    User Folders ({storageData.userfolders?.length || 0})
                  </h3>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size (GB)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {storageData.userfolders?.map((user, index) => {
                        const size = getNumber(user.size);
                        const userPercent = usedspacebytes > 0
                          ? ((size / usedspacebytes) * 100).toFixed(1)
                          : 0;

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-6 h-6 ${getUserColor(index)} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                                >
                                  {getUserInitials(user.name)}
                                </div>
                                {user.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                              {(size / 1073741824).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-medium text-purple-700">{userPercent}%</span>
                                <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="h-1.5 bg-purple-500 rounded-full"
                                    style={{ width: `${Math.min(userPercent, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="pt-16 pb-20">
          <div className="p-4 space-y-6">
            {/* Root Folders Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-sm">
                    Root Folders ({storageData.rootfolders?.length || 0})
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {storageData.rootfolders?.map((folder, index) => {
                        const size = getNumber(folder.size);
                        const folderPercent = usedspacebytes > 0
                          ? ((size / usedspacebytes) * 100).toFixed(1)
                          : 0;

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">
                              <div className="flex items-center gap-1">
                                <Folder
                                  className={`w-3 h-3 ${folder.ishidden ? "text-gray-400" : "text-blue-600"
                                    }`}
                                />
                                <span className="truncate max-w-[120px]">{folder.name}</span>
                                {folder.ishidden && (
                                  <EyeOff className="w-2.5 h-2.5 text-gray-400" title="Hidden folder" />
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-500 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-medium text-blue-700">{folderPercent}%</span>
                                <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="h-1.5 bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min(folderPercent, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs mt-1">
                                  {(size / 1073741824).toFixed(2)} GB
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* User Folders Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-gray-900 text-sm">
                    User Folders ({storageData.userfolders?.length || 0})
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {storageData.userfolders?.map((user, index) => {
                        const size = getNumber(user.size);
                        const userPercent = usedspacebytes > 0
                          ? ((size / usedspacebytes) * 100).toFixed(1)
                          : 0;

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-6 h-6 ${getUserColor(index)} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                                >
                                  {getUserInitials(user.name)}
                                </div>
                                <span className="truncate max-w-[100px]">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-500 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-medium text-purple-700">{userPercent}%</span>
                                <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="h-1.5 bg-purple-500 rounded-full"
                                    style={{ width: `${Math.min(userPercent, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs mt-1">
                                  {(size / 1073741824).toFixed(2)} GB
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageDetailsPage;