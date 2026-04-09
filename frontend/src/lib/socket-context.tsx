"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { api } from "./api";

// ── Types ─────────────────────────────────────────────────────
interface SocketContextType {
  /** Number of pending booking requests */
  pendingRequestCount: number;
  /** Force a refresh of the pending count */
  refreshPendingCount: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function SocketProvider({
  companyId,
  children,
}: {
  companyId: number;
  children: ReactNode;
}) {
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // Fetch the real count from the API
  const fetchCount = useCallback(async () => {
    try {
      const data = await api.get<{ rows: unknown[]; count: number }>(
        "/booking-requests?status=pending"
      );
      setPendingRequestCount(data.count ?? data.rows?.length ?? 0);
    } catch {
      // silently ignore – the badge just won't show
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Socket connection
  useEffect(() => {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:5000";

    const socket = io(apiBase, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-company", companyId);
    });

    socket.on("booking-request-change", () => {
      // Re-fetch the real count whenever anything changes
      fetchCount();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [companyId, fetchCount]);

  return (
    <SocketContext.Provider
      value={{ pendingRequestCount, refreshPendingCount: fetchCount }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
