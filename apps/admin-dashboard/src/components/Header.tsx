import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import { Activity, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [lastHeartbeat, setLastHeartbeat] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setLastHeartbeat(new Date().toLocaleTimeString());
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    function onOccUpdate() {
      setLastHeartbeat(new Date().toLocaleTimeString());
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('occupancy:update', onOccUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('occupancy:update', onOccUpdate);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-brand-border px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-brand-navy tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Socket Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-3.5 h-3.5" />
              <span>Real-Time Live</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <WifiOff className="w-3.5 h-3.5" />
              <span>Connecting...</span>
            </>
          )}
        </div>

        <div className="text-right text-xs text-slate-500 hidden sm:block border-l border-slate-200 pl-4">
          <p className="font-semibold text-slate-700">San Francisco, CA</p>
          <p className="text-[11px] text-slate-400">Sync: {lastHeartbeat}</p>
        </div>
      </div>
    </header>
  );
};
