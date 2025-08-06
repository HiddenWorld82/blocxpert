// src/components/sections/Recommendations.jsx
import React from "react";

export default function Recommendations({ recommendations }) {
  if (!recommendations) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Recommandations</h2>
      <ul className="list-disc list-inside text-gray-700">
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
}