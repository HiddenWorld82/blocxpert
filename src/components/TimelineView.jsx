// components/TimelineView.jsx
import React from 'react';

const TimelineView = ({ scenarios = [] }) => {
  return (
    <div className="border-l-2 border-gray-300 pl-4">
      {scenarios.map((s, index) => (
        <div key={s.id || index} className="mb-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full -ml-5 mr-3" />
            <span className="font-medium">{s.name || `Scénario ${index + 1}`}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineView;
