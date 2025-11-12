"use client";
import { Users, Cpu, MemoryStick, HardDrive } from "lucide-react";

const kpiConfig = {
  usersAffecting: { label: "Users Affected", icon: Users, color: "text-foreground" },
  cpuTriggers: { label: "CPU Triggers", icon: Cpu, color: "text-foreground" },
  ramTriggers: { label: "RAM Triggers", icon: MemoryStick, color: "text-foreground" },
  storageAlerts: { label: "Storage Alerts", icon: HardDrive, color: "text-foreground" }, // Updated key and label
};

export const MetricsCards = ({ kpiData, className = "" }) => {
  return (
    <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {Object.entries(kpiData).map(([key, value]) => {
        const { label, icon: Icon, color } = kpiConfig[key] || {};
        // Skip rendering if config doesn't exist for the key
        if (!label || !Icon) return null;
        
        return (
          <div
            key={key}
            className="p-4 bg-card border border-border rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </h4>
            </div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        );
      })}
    </div>
  );
};