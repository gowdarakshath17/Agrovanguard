import React, { useState, useEffect } from 'react';
import { Power, Droplet, Plane, AlertTriangle, Cpu, Radio, ShieldCheck, Zap, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import DeviceTelemetryModal from '../Modals/DeviceTelemetryModal.tsx';

interface Device {
  id: number;
  name: string;
  deviceType: 'PUMP' | 'DRIP_VALVE' | 'DRONE' | string;
  status: 'ON' | 'OFF' | 'ERROR' | 'DEPLOYED' | 'STANDBY' | string;
  lastActive: string;
}

interface Intervention {
  id: number;
  triggerSource: string;
  actionType: string;
  reason: string;
  createdAt: string;
}

interface IoTControlPanelProps {
  fieldId: number;
}

export default function IoTControlPanel({ fieldId }: IoTControlPanelProps) {
  const { getToken } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const fetchIoTData = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/iot/devices/${fieldId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Silently ignore non-JSON responses (typically 502/503 from nginx during dev server restarts)
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setDevices(data.devices);
        setInterventions(data.interventions);
      }
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        // Silently ignore transient network errors (e.g., dev server restarts) during polling
        return;
      }
      console.error('Failed to fetch IoT data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIoTData();
    // Poll for updates (e.g. simulated drone returning)
    const interval = setInterval(fetchIoTData, 5000);
    return () => clearInterval(interval);
  }, [fieldId]);

  const toggleDevice = async (device: Device) => {
    setActionLoading(device.id);
    let newAction = 'TURN_ON';
    
    if (device.deviceType === 'DRONE') {
      newAction = device.status === 'STANDBY' ? 'DISPATCH' : 'RECALL';
    } else {
      newAction = device.status === 'OFF' ? 'TURN_ON' : 'TURN_OFF';
    }

    try {
      const token = await getToken();
      await fetch('/api/iot/intervene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fieldId,
          deviceId: device.id,
          action: newAction,
          reason: 'Manual Operator Intervention',
          triggerSource: 'MANUAL'
        })
      });
      await fetchIoTData();
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getDeviceIcon = (type: string, status: string) => {
    const isOn = status === 'ON' || status === 'DEPLOYED';
    const color = isOn ? 'text-green-500' : 'text-gray-400';
    
    switch (type) {
      case 'PUMP': return <Power className={`h-8 w-8 ${color}`} />;
      case 'DRIP_VALVE': return <Droplet className={`h-8 w-8 ${color}`} />;
      case 'DRONE': return <Plane className={`h-8 w-8 ${color}`} />;
      default: return <Cpu className={`h-8 w-8 ${color}`} />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 w-1/4 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Radio className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">IoT Control Node</h3>
            <p className="text-xs text-gray-500">Automated Intervention Systems</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <ShieldCheck className="h-4 w-4" />
          <span>Secured Link</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {devices.map(device => {
            const isOn = device.status === 'ON' || device.status === 'DEPLOYED';
            const isDrone = device.deviceType === 'DRONE';
            return (
              <div 
                key={device.id} 
                onClick={() => setSelectedDevice(device)}
                className={`border rounded-2xl p-4 transition-all duration-300 cursor-pointer relative group ${
                  isOn 
                    ? 'border-green-200 bg-green-50/30 hover:border-green-300 hover:shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
                    {getDeviceIcon(device.deviceType, device.status)}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {device.status}
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Inspect ↗
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{device.name}</h4>
                <p className="text-xs text-gray-500 mb-4">
                  Last Sync: {device.lastActive && !isNaN(new Date(device.lastActive).getTime()) ? new Date(device.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2 mins ago'}
                </p>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDevice(device);
                    }}
                    disabled={actionLoading === device.id}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                      isOn 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {actionLoading === device.id ? (
                      <span className="animate-spin mr-1">◷</span>
                    ) : isDrone ? (
                      isOn ? 'Recall Drone' : 'Dispatch Drone'
                    ) : (
                      isOn ? 'Turn Off' : 'Turn On'
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDevice(device);
                    }}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 transition-colors"
                    title="View Telemetry"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Intervention Logs */}
        {interventions.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-yellow-500" />
              Intervention Audit Log
            </h4>
            <div className="space-y-3">
              {interventions.map(log => (
                <div key={log.id} className="flex items-start space-x-3 text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className={`p-1.5 rounded-full ${log.triggerSource === 'AI_AUTOMATION' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {log.triggerSource === 'AI_AUTOMATION' ? <Cpu className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{log.actionType.replace('_', ' ')}</span>
                      <span className="text-gray-400">&bull;</span>
                      <span className="text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-600 mt-0.5">{log.reason}</p>
                    <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 bg-gray-200 text-gray-700 rounded-sm">
                      {log.triggerSource}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedDevice && (
        <DeviceTelemetryModal
          device={selectedDevice}
          isActionLoading={actionLoading === selectedDevice.id}
          onClose={() => setSelectedDevice(null)}
          onToggle={() => {
            toggleDevice(selectedDevice);
            setSelectedDevice(prev => prev ? { ...prev, status: prev.status === 'ON' ? 'OFF' : 'ON' } : null);
          }}
        />
      )}
    </div>
  );
}
