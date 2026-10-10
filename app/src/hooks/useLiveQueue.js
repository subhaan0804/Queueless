import { useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket';

// Returns the latest snapshot for a queue, when it arrived, and whether the socket is connected.
// `beforeUpdate` runs just before each new snapshot is applied: the moment to
// call LayoutAnimation, which must be armed before the state change.
export default function useLiveQueue(code, beforeUpdate) {
  const [live, setLive] = useState({ snapshot: null, receivedAt: 0 });
  const [online, setOnline] = useState(true);
  const before = useRef(beforeUpdate);
  before.current = beforeUpdate;

  useEffect(() => {
    // Re-joining on every (re)connect is what heals a Wi-Fi blip: the server
    // replies with a fresh snapshot that replaces anything we missed.
    const join = () => {
      setOnline(true);
      socket.emit('room:join', code);
    };
    const offline = () => setOnline(false);
    const update = (next) => {
      if (next.code !== code) return;
      if (before.current) before.current(next);
      setLive({ snapshot: next, receivedAt: Date.now() });
    };

    socket.on('connect', join);
    socket.on('disconnect', offline);
    socket.on('connect_error', offline);
    socket.on('queue:update', update);
    if (socket.connected) join();
    else socket.connect();

    // The socket is shared with the ticket alert watcher, so it stays open; only our listeners go.
    return () => {
      socket.off('connect', join);
      socket.off('disconnect', offline);
      socket.off('connect_error', offline);
      socket.off('queue:update', update);
    };
  }, [code]);

  return { snapshot: live.snapshot, receivedAt: live.receivedAt, online };
}
