import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

export default function WsTest({ eventId }) {
  const [logs, setLogs] = useState([]);
  const log = (m) => setLogs((p) => [...p, m]);

  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8181/ws",  
      reconnectDelay: 3000,
      debug: (s) => console.log(s),
      onConnect: () => {
        log("WS connected");
        client.subscribe(`/topic/events/${eventId}`, (msg) => {
          log("MSG: " + msg.body);
        });
      },
      onStompError: (frame) => log("STOMP error: " + frame.body),
      onWebSocketError: () => log("WS error"),
      onWebSocketClose: () => log("WS closed"),
    });

    client.activate();
    return () => client.deactivate();
  }, [eventId]);

  return (
    <pre style={{ padding: 20, background: "#111", color: "#0f0" }}>
      {logs.join("\n")}
    </pre>
  );
}
