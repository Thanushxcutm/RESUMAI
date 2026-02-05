
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  score: number;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ score }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981'; // green-500
    if (s >= 60) return '#3b82f6'; // blue-500
    if (s >= 40) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const COLORS = [getColor(score), '#e2e8f0'];

  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={450}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-slate-800">{score}</span>
        <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Score</span>
      </div>
    </div>
  );
};

export default ScoreChart;
