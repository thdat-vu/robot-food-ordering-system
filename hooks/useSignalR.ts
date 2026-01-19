import { useEffect, useRef, useState, useMemo } from "react";
import * as signalR from "@microsoft/signalr";

interface UseSignalROptions {
  url: string;
  hubMethods?: { [event: string]: (data: any) => void };
  groupName?: string;
}

export function useSignalR({ url, hubMethods = {}, groupName }: UseSignalROptions) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const stableHubMethods = useMemo(() => hubMethods, [hubMethods]);

  useEffect(() => {
    let isUnmounted = false;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        // Ép dùng WebSockets để tránh lỗi negotiation
        transport: signalR.HttpTransportType.WebSockets,
        withCredentials: true,
      })
      .withAutomaticReconnect() // retry sau 0s, 2s, 5s, 10s
      .build();

    connectionRef.current = connection;

    // Đăng ký event từ server
    Object.entries(stableHubMethods).forEach(([event, callback]) => {
      connection.on(event, callback);
    });

    const joinGroup = async () => {
      if (!connectionRef.current || !groupName) return;
      try {
        switch (groupName) {
          case "Moderators":
            await connectionRef.current.invoke("JoinModeratorGroup");
            break;
          case "Kitchen":
            await connectionRef.current.invoke("JoinKitchenGroup");
            break;
          case "Waiters":
            await connectionRef.current.invoke("JoinWaiterGroup");
            break;
          default:
            await connectionRef.current.invoke("JoinTableGroup", groupName);
            break;
        }
      } catch (err) {
        // Error handled silently
      }
    };

    const start = async () => {
      try {
        await connection.start();
        if (isUnmounted) return;
        setIsConnected(true);
        await joinGroup();
      } catch (err) {
        setTimeout(start, 120000); // retry sau 2 phut
      }
    };

    // sự kiện khi reconnect thành công → join group lại
    connection.onreconnected(() => {
      setIsConnected(true);
      joinGroup();
    });

    // sự kiện khi disconnect
    connection.onclose(() => {
      setIsConnected(false);
    });
    start();

    return () => {
      isUnmounted = true;
      Object.keys(stableHubMethods).forEach((event) => {
        connection.off(event);
      });
      connection.stop();
    };
  }, [url, groupName]);

  const sendMessage = async (method: string, ...args: any[]) => {
    if (connectionRef.current && isConnected) {
      try {
        await connectionRef.current.invoke(method, ...args);
      } catch (err) {
        // Error handled silently
      }
    }
  };

  return { isConnected, sendMessage };
}
