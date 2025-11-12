import React, { useState } from "react";
import { 
  HelpCircle, 
  Home,
  HardDrive, 
  Cpu, 
  MemoryStick,  
  FileChartPie, 
  Boxes,
  AlertTriangle,
  ChevronRight,
  ArrowBigUpDash,
  ArrowBigDownDash,
  XCircle,
  Menu,
  X,
  Flag,
  FolderSearch,
  Activity,
} from "lucide-react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const HelpPage = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { id: "overview", title: "Overview", icon: HelpCircle },
    { id: "home", title: "Home", icon: Home },
    { id: "resource-events", title: "Resource Events", icon: Boxes },
    { id: "storage-events", title: "Storage Events", icon: HardDrive },
    { id: "reports", title: "Reports", icon: FileChartPie },
    { id: "event-details", title: "Event Details", icon: Activity },
    { id: "storage-details", title: "Storage Details", icon: FolderSearch },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Welcome to A4R OptiCoreAI</h3>
              <p className="text-gray-600 mb-4">
                A4R OptiCore provides real-time visibility into system health, resource utilization, 
                and performance anomalies across infrastructure — enabling proactive issue resolution.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <ArrowBigUpDash className="w-6 h-6 text-rose-600 mb-2" />
                  <h4 className="font-medium text-gray-800">Active Events</h4>
                  <p className="text-sm text-gray-600 mt-1">Monitor ongoing CPU/RAM/storage issues</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <HardDrive className="w-6 h-6 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-800">Storage Alerts</h4>
                  <p className="text-sm text-gray-600 mt-1">Track high disk usage anomalies</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <Activity className="w-6 h-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-gray-800">Detailed Reports</h4>
                  <p className="text-sm text-gray-600 mt-1">Comprehensive event insights</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "home":
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-800">Home Dashboard</h3>
            <p className="text-gray-600">
              The Home page provides a real-time consolidated view of all current and recent system activity.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <ArrowBigUpDash className="w-4 h-4 text-rose-600" />
                Active Events
              </h4>
              <p className="text-sm text-gray-600">
                Shows machines currently experiencing resource triggers (CPU, RAM, or Storage). 
                It also shows approximate duration of time passed since the alert was recieved in "Alert Recieved" column.
                "View Details" is disabled until the event is resolved.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <ArrowBigDownDash className="w-4 h-4 text-blue-600" />
                Inactive Events
              </h4>
              <p className="text-sm text-gray-600">
                Resolved events marked as <span className="font-medium">"Ended"</span>. 
                Click "View Details" to access full event reports.
              </p>
            </div>

            {/* Trigger Type Legend */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Trigger Type Legend</h4>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Colored icons</strong> indicate active threshold violations. <strong>Gray icons</strong> indicate normal state.  
                For example: {" "}
                <span className="inline-flex items-center gap-1">
                  <Cpu className="w-4 h-4 text-blue-600" />{" "}
                  <MemoryStick className="w-4 h-4 text-gray-400" />{" "}
                  <HardDrive className="w-4 h-4 text-gray-400" />
                </span>{" "}
                 indicates a <strong>CPU-only event</strong> is going on.
              </p>

              {/* Event Type Combinations Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Event Type</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">CPU</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">Memory</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">Storage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: "CPU only", cpu: true, mem: false, stor: false },
                      { name: "Memory only", cpu: false, mem: true, stor: false },
                      { name: "Storage only", cpu: false, mem: false, stor: true },
                      { name: "CPU + Memory", cpu: true, mem: true, stor: false },
                      { name: "CPU + Storage", cpu: true, mem: false, stor: true },
                      { name: "Memory + Storage", cpu: false, mem: true, stor: true },
                      { name: "CPU + Memory + Storage", cpu: true, mem: true, stor: true },
                    ].map((event, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-700">{event.name}</td>
                        <td className="py-2 px-3 text-center">
                          {event.cpu ? (
                            <Cpu className="w-5 h-5 text-blue-600 mx-auto" />
                          ) : (
                            <Cpu className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {event.mem ? (
                            <MemoryStick className="w-5 h-5 text-orange-500 mx-auto" />
                          ) : (
                            <MemoryStick className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {event.stor ? (
                            <HardDrive className="w-5 h-5 text-purple-600 mx-auto" />
                          ) : (
                            <HardDrive className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-600" />
                System Events
              </h4>
              <p className="text-sm text-red-700">
                Triggered when CPU/RAM thresholds are exceeded <strong>with no active user session</strong>. 
                Indicates background processes or potential malware.
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-600" />
                Storage Alerts
              </h4>
              <p className="text-sm text-purple-700">
                Shows storage alerts for the current day. Each alert displays disk usage percentage. 
                Click <strong>"View Details"</strong> to see user folders and C: drive breakdown.
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Note</h4>
              <p className="text-sm text-yellow-700">
                The <strong>"Active and Inactive events"</strong> are real time data events but when a events ends the machine will not 
                automatically move to Inactive events. This is kept to keep track of some critical events.
              </p>
            </div>
          </div>
        );

      case "resource-events":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Resource Events</h3>
            <p className="text-gray-600">
              Browse historical CPU and RAM trigger events with advanced filtering.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">What’s Included</h4>
              <ul className="text-sm text-gray-600 space-y-1 mt-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span>Computer Name / Hostname of the machine</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span>Number of users active at the moment of event</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span>Timestamp of event</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span>Indicator of trigger types (CPU | Memory | Storage)</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Filter Options</h4>
              <ul className="text-sm text-gray-600 space-y-1 mt-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span>Date range (single day or custom)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span>IP address</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span>Trigger type: CPU or RAM</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span>User count range</span>
                </li>
              </ul>
            </div>
            {/* Trigger Type Legend */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Trigger Type Legend</h4>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Colored icons</strong> indicate threshold violations. <strong>Gray icons</strong> indicate normal state.  
                For example: {" "}
                <span className="inline-flex items-center gap-1">
                  <Cpu className="w-4 h-4 text-blue-600" />{" "}
                  <MemoryStick className="w-4 h-4 text-gray-400" />{" "}
                  <HardDrive className="w-4 h-4 text-gray-400" />
                </span>{" "}
                 indicates a <strong>CPU-only</strong> event was occured.
              </p>

              {/* Event Type Combinations Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Event Type</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">CPU</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">Memory</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">Storage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: "CPU only", cpu: true, mem: false, stor: false },
                      { name: "Memory only", cpu: false, mem: true, stor: false },
                      { name: "Storage only", cpu: false, mem: false, stor: true },
                      { name: "CPU + Memory", cpu: true, mem: true, stor: false },
                      { name: "CPU + Storage", cpu: true, mem: false, stor: true },
                      { name: "Memory + Storage", cpu: false, mem: true, stor: true },
                      { name: "CPU + Memory + Storage", cpu: true, mem: true, stor: true },
                    ].map((event, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-700">{event.name}</td>
                        <td className="py-2 px-3 text-center">
                          {event.cpu ? (
                            <Cpu className="w-5 h-5 text-blue-600 mx-auto" />
                          ) : (
                            <Cpu className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {event.mem ? (
                            <MemoryStick className="w-5 h-5 text-orange-500 mx-auto" />
                          ) : (
                            <MemoryStick className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {event.stor ? (
                            <HardDrive className="w-5 h-5 text-purple-600 mx-auto" />
                          ) : (
                            <HardDrive className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-600" />
                System Events
              </h4>
              <p className="text-sm text-red-700">
                Triggered when CPU/RAM thresholds are exceeded <strong>with no active user session</strong>. 
                Indicates background processes or potential malware.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Deep Dive</h4>
              <p className="text-sm text-blue-700">
                Click "View Details" on any event to open the <strong>Event Details</strong> page.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Export</h4>
              <p className="text-sm text-green-700">
                Export filtered results to Excel or PDF using the buttons in the search panel.
              </p>
            </div>
          </div>
        );

      case "storage-events":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Storage Events</h3>
            <p className="text-gray-600">
              View historical storage alerts across all machines with date-based filtering.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">What’s Included</h4>
              <ul className="text-sm text-gray-600 space-y-1 mt-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Computer Name / Hostname of the machine</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Disk usage percentage at time of alert</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Total used space of the machine (in GB)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Timestamp of alert</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Filter Options</h4>
              <ul className="text-sm text-gray-600 space-y-1 mt-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Date range (single day or custom)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>IP address</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Trigger type: CPU or RAM</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>User count range</span>
                </li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">Deep Dive</h4>
              <p className="text-sm text-purple-700">
                Click "View Details" to navigate to the <strong>Storage Details</strong> page for folder-level insights.
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Note</h4>
              <p className="text-sm text-yellow-700">
                Export functionality for storage details is not yet available. Coming soon.
              </p>
            </div>
          </div>
        );

      case "reports":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Coming Soon
              </h4>
              <p className="text-sm text-yellow-700">
                Comprehensive dashboard-wide reporting features are under development and will be available in Q4 2025.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Current Options</h4>
              <ul className="text-sm text-gray-600 space-y-1 mt-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span>Per-event PDF exports from Event/Storage Details</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span>Excel & PDF exports from Search pages</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case "event-details":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Event Details</h3>
            <p className="text-gray-600">
              Comprehensive view of a resolved CPU or RAM event with performance snapshots.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Resource Breakdown</h4>
                <p className="text-sm text-gray-600">
                  See CPU/RAM usage per user during the event window with interactive charts.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Window Activity</h4>
                <p className="text-sm text-gray-600">
                  View active, visible, and minimized application windows for each user during event.
                </p>
              </div>
            </div>
             <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Storage Details</h4>
              <p className="text-sm text-gray-700">
                If the storage exceeds the defined threshold for an event, a notification box will appear in the left-hand section labeled <b>Storage Usage Alert</b>. 
                You can click the <b>View Storage Details</b> button to navigate directly to the corresponding storage event details page for that event's timestamp.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Export</h4>
              <p className="text-sm text-blue-700">
                Click "Download PDF" in the top-right to generate a complete event report.
              </p>
            </div>
            <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
              <h4 className="font-medium text-rose-800 mb-2">Warning</h4>
              <p className="text-sm text-rose-700">
                <strong> Window Activity</strong> is intended for internal use only and should not be shared with customers.
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Note</h4>
              <p className="text-sm text-yellow-700">
                Reports are <strong>not available</strong> for system-triggered or incomplete events.
              </p>
            </div>
          </div>
        );

      case "storage-details":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Storage Details</h3>
            <p className="text-gray-600">
              Deep inspection of disk usage on a specific machine at the time of a storage alert.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">C Drive Breakdown</h4>
                <p className="text-sm text-gray-600">
                  Top-level folders: <code className="bg-gray-100 px-1 rounded">Windows</code>, 
                  <code className="bg-gray-100 px-1 rounded">Program Files</code>, 
                  <code className="bg-gray-100 px-1 rounded">Users</code>, etc.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">User Folders</h4>
                <p className="text-sm text-gray-600">
                  Storage consumption per user, including hidden/system folders inside user profiles.
                </p>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Note</h4>
              <p className="text-sm text-yellow-700">
                <strong>Export reports are not available</strong> for Storage Details at this time. 
                This feature is planned for a future release.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <div className="flex-1 overflow-hidden pt-20">
          <div className="mx-auto px-5 py-6 md:pl-20">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
              >
                {isMobileMenuOpen ? (
                  <>
                    <X className="w-4 h-4" />
                    Close Menu
                  </>
                ) : (
                  <>
                    <Menu className="w-4 h-4" />
                    Sections
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Nav */}
              <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Help Sections
                  </h2>
                  <nav className="space-y-1">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
                            activeSection === section.id
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{section.title}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Content Area */}
              <div className={`${isMobileMenuOpen ? 'hidden' : 'block'} lg:block lg:col-span-3 h-[calc(93vh-6rem)]`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 pb-20 md:pb-7 h-full overflow-y-auto">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};