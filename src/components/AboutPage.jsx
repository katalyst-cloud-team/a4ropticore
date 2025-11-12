import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Shield, Link as LinkIcon } from "lucide-react";
import logo from "../assets/logo.png";

export const AboutPage = () => {
  const importantLinks = [
    { name: "WHMCS", url: "https://billing.apps4rent.com/billing" },
    { name: "Apps4Rent Website", url: "https://www.apps4rent.com/" },
    { name: "Apps4Insights", url: "https://app4insights.azurewebsites.net/" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="pt-20 flex-1">
            <div className="mx-auto px-5 py-6 md:pl-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 flex items-center justify-center bg-blue-50 p-6">
                        <img 
                          src={logo} 
                          alt="A4R OptiCoreAI Logo" 
                          className="h-full w-auto max-h-40 object-contain" 
                        />
                      </div>

                      <div className="md:w-2/3 p-6 flex flex-col justify-center">
                        <h2 className="text-lg font-semibold text-slate-800 mb-3">
                          About A4R OptiCoreAI Dashboard
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                          This app is built for real-time visibility into system health, 
                          enabling faster incident response and proactive infrastructure management. 
                          The goal is to reduce downtime, improve user experience, and simplify complex 
                          monitoring workflows.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="mt-1 p-2 bg-emerald-100 rounded-lg">
                        <Shield className="w-5 h-5 text-emerald-600" />
                      </div>
                      Core Values
                    </h2>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="mt-1 w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></span>
                        <span className="text-slate-700"><span className="font-medium">Reliability:</span> Systems you can trust, 24/7.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></span>
                        <span className="text-slate-700"><span className="font-medium">Transparency:</span> Clear insights, no black boxes.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></span>
                        <span className="text-slate-700"><span className="font-medium">Simplicity:</span> Complex problems, simple solutions.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></span>
                        <span className="text-slate-700"><span className="font-medium">Innovation:</span> Continuously evolving to meet future challenges.</span>
                      </li>
                    </ul>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="mt-1 p-2 bg-purple-100 rounded-lg">
                        <LinkIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      Important Links
                    </h2>
                    <div className="flex-1">
                      <ul className="space-y-7">
                        {importantLinks.map((link, index) => (
                          <li key={index}>
                            <a 
                              href={link.url} 
                              className="flex items-center gap-3 text-slate-700 hover:text-purple-600 transition-colors group"
                            >
                              <span className="w-2.5 h-2.5 bg-slate-400 rounded-full group-hover:bg-purple-500 transition-colors"></span>
                              <span>{link.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 shadow-sm py-3 px-5 pb-12">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-slate-600">
            © {new Date().getFullYear()}, A4R OptiCoreAI Dashboard. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Version 2.0
          </p>
        </div>
      </div>
    </div>
  );
};