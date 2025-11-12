import React from "react";
import { FileText, Clock, Calendar } from "lucide-react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const ReportPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="pt-20 flex-1">
          <div className="mx-auto px-5 py-6 max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-100 rounded-full animate-pulse">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-3">Report Section</h1>
              <p className="text-slate-600 max-w-md mx-auto mb-6">
                Comprehensive reporting features are currently in development and will be available soon.
              </p>
              
              <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 text-slate-500 bg-slate-100 px-4 py-3 rounded-full animate-bounce-slow">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Coming Soon</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Performance Reports</h3>
                  <p className="text-sm text-blue-600">Detailed performance metrics and analytics</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="font-medium text-purple-800 mb-2">Usage Analytics</h3>
                  <p className="text-sm text-purple-600">Resource utilization and trends</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h3 className="font-medium text-amber-800 mb-2">Export Options</h3>
                  <p className="text-sm text-amber-600">Export reports into PDF format.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};