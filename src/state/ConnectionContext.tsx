import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  getPingAvg,
  getStatus,
  onTelemetry,
  type ConnStatus,
} from '@/connection/connection';
import { computeLinkBars } from '@/connection/linkQuality';

const TICK_MS = 250;

type Link = { status: ConnStatus; bars: 0 | 1 | 2 | 3 | 4 };

const ConnectionContext = createContext<Link | null>(null);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [link, setLink] = useState<Link>({ status: 'offline', bars: 0 });
  const lastTel = useRef<{ rssi: number; at: number } | null>(null);

  useEffect(() => {
    const unsubscribe = onTelemetry((t) => {
      lastTel.current = { rssi: t.rssi, at: Date.now() };
    });
    const id = setInterval(() => {
      const tel = lastTel.current;
      const status = getStatus();
      const bars = computeLinkBars(
        tel?.rssi ?? null,
        getPingAvg(),
        tel ? Date.now() - tel.at : Infinity,
      );
      setLink((prev) =>
        prev.status === status && prev.bars === bars ? prev : { status, bars },
      );
    }, TICK_MS);
    return () => {
      unsubscribe();
      clearInterval(id);
    };
  }, []);

  return (
    <ConnectionContext.Provider value={link}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection(): Link {
  const value = useContext(ConnectionContext);
  if (!value) {
    throw new Error('useConnection musi być użyte wewnątrz ConnectionProvider');
  }
  return value;
}
