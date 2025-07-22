// === src/components/LiveLogFeed.jsx ===
import React, { useEffect, useState } from "react";
import { fetchRecentViolations } from "../api/api";

export default function LiveLogFeed() {
  const [feed, setFeed] = useState([]);

  const load = () => {
    fetchRecentViolations()
      .then(setFeed)
      .catch(console.error);
  };

  useEffect(() => {
    load(); 
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <ul className="flex-1 overflow-y-auto divide-y divide-gray-700">
      {feed.map((log) => (
        <li key={log.logID} className="py-2 hover:bg-gray-800 p-2 rounded">
          <p className="font-medium">{log.message}</p>
          <p className="text-xs text-gray-400">
            {new Date(log.timestamp).toLocaleTimeString()} • {log.source}
          </p>
        </li>
      ))}
      {feed.length === 0 && <p className="text-gray-500">No recent activity</p>}
    </ul>
  );
}
