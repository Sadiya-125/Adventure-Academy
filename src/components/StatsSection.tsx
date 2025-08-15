import React, { useState, useEffect } from 'react';

const StatsSection = () => {
  const [counts, setCounts] = useState({
    heroes: 0,
    worlds: 0,
    realms: 0,
    satisfaction: 0
  });

  const finalCounts = {
    heroes: 1000,
    worlds: 4,
    realms: 12,
    satisfaction: 95
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const interval = duration / steps;

    const timer = setInterval(() => {
      setCounts(prev => ({
        heroes: Math.min(prev.heroes + Math.ceil(finalCounts.heroes / steps), finalCounts.heroes),
        worlds: Math.min(prev.worlds + Math.ceil(finalCounts.worlds / steps), finalCounts.worlds),
        realms: Math.min(prev.realms + Math.ceil(finalCounts.realms / steps), finalCounts.realms),
        satisfaction: Math.min(prev.satisfaction + Math.ceil(finalCounts.satisfaction / steps), finalCounts.satisfaction)
      }));
    }, interval);

    setTimeout(() => clearInterval(timer), duration);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      emoji: '🌟',
      count: `${counts.heroes.toLocaleString()}+`,
      label: 'Young Heroes',
      color: 'text-yellow-600'
    },
    {
      emoji: '🌍',
      count: counts.worlds,
      label: 'Magical Worlds',
      color: 'text-green-600'
    },
    {
      emoji: '🏰',
      count: counts.realms,
      label: 'Epic Realms',
      color: 'text-purple-600'
    },
    {
      emoji: '😊',
      count: `${counts.satisfaction}%`,
      label: 'Happy Learners',
      color: 'text-pink-600'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            🏆 Our Amazing Community
          </h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Join thousands of families on their learning adventure
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-3xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-5xl mb-4 animate-bounce">
                {stat.emoji}
              </div>
              <div className={`text-3xl md:text-4xl font-bold mb-2 text-white`}>
                {stat.count}
              </div>
              <div className="text-purple-100 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;