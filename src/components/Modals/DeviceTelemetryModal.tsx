import React, { useState } from 'react';
import { X, Cpu, Wifi, Battery, Gauge, Power, ShieldCheck, Activity, RefreshCw } from 'lucide-react';

interface DeviceTelemetryModalProps {
  device: {
    id: number;
    name: string;
    deviceType: string;
    status: string;
    lastActive: string;
  };
  onClose: () => void;
  onToggle: () => void;
  isActionLoading?: boolean;
}

export default function DeviceTelemetryModal({ device, onClose, onToggle, isActionLoading }: DeviceTelemetryModalProps) {
  const isOn = device.status === 'ON' || device.status === 'DEPLOYED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-gray-900">{device.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOn ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                  {device.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Hardware Node ID: #{device.id} • Mesh Protocol</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Telemetry Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Wifi className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-medium">Link Signal</span>
                <div className="text-sm font-bold text-gray-900">-64 dBm (98%)</div>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <Battery className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-medium">Power Level</span>
                <div className="text-sm font-bold text-gray-900">13.8V Solar</div>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-3">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <Gauge className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-medium">Operating Pressure</span>
                <div className="text-sm font-bold text-gray-900">{isOn ? '2.4 Bar' : '0.0 Bar'}</div>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-medium">Daily Runtime</span>
                <div className="text-sm font-bold text-gray-900">42 minutes</div>
              </div>
            </div>
          </div>

          {/* Device Specific Controls & Parameters */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Firmware Build</span>
              <span className="font-mono font-bold text-gray-800">v3.4.12-agri</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Auto Safety Cutoff</span>
              <span className="font-bold text-emerald-600">Enabled (Overheat & Dry Run)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Last Telemetry Packet</span>
              <span className="text-gray-700">{new Date(device.lastActive).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Quick Command */}
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
            <h4 className="text-xs font-bold text-blue-900 mb-1 flex items-center">
              <ShieldCheck className="h-4 w-4 mr-1.5 text-blue-600" />
              Manual Operator Override
            </h4>
            <p className="text-[11px] text-blue-700 mb-3">
              Command execution sends an encrypted packet over LoRa mesh directly to the controller solenoid.
            </p>
            <button
              onClick={onToggle}
              disabled={isActionLoading}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-sm ${
                isOn 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {isActionLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Power className="h-4 w-4 mr-2" />
              )}
              <span>{isOn ? 'Execute Emergency Shutoff' : 'Initiate Immediate Activation'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
