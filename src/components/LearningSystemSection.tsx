import React from "react";

const LearningSystemSection = () => {
  const features = [
    {
      emoji: "🎮",
      title: "Gamified Learning",
      description:
        "Earn points, unlock realms, collect badges, and climb the leaderboard!",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      emoji: "🧠",
      title: "Interactive Quizzes",
      description: "Fun MCQs and true/false challenges for every realm.",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      emoji: "👨‍👩‍👧",
      title: "Parent Dashboard",
      description:
        "Track progress, limit screen time, and guide your child's journey.",
      gradient: "from-teal-500 to-cyan-600",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-purple-800">
            🎮 Learning System Features
          </h2>
          <p className="text-xl text-purple-600 max-w-2xl mx-auto">
            Discover the magic behind our educational platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group text-center p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-6xl mb-6 group-hover:animate-pulse">
                {feature.emoji}
              </div>
              <h3 className="text-2xl font-bold text-purple-800 mb-4">
                {feature.title}
              </h3>
              <p className="text-purple-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              <div
                className={`w-full h-2 bg-gradient-to-r ${feature.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningSystemSection;
