// components/TimelineView.jsx
import React from 'react';

const TimelineView = ({ scenarios = [] }) => {
  return (
    <div className="border-l-2 border-gray-300 pl-4">
      {scenarios.map((s, index) => (
        <div key={s.id || index} className="mb-6">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full -ml-5 mr-3" />
            <span className="font-medium">{s.name || `Scénario ${index + 1}`}</span>
          </div>
          {Array.isArray(s.milestones) && s.milestones.length > 0 && (
            <ul className="ml-4 text-sm text-gray-600 space-y-1">
              {s.milestones.map((m, i) => (
                <li key={i} className="flex items-center">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                  <span>
                    {m.date ? `${m.date} - ` : ''}
                    {m.label || m.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default TimelineView;

