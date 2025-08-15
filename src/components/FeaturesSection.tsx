import React from "react";

const FeaturesSection = () => {
  const worlds = [
    {
      emoji: "⏰",
      title: "World of Time",
      description: "Master scheduling, punctuality, and time management skills",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
    },
    {
      emoji: "😊",
      title: "World of Emotions",
      description: "Learn emotional intelligence, empathy, and social skills",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
    },
    {
      emoji: "💰",
      title: "World of Money",
      description: "Discover budgeting, saving, and financial responsibility",
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
    },
    {
      emoji: "🍎",
      title: "World of Wellness",
      description: "Build healthy habits, nutrition, and self-care routines",
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-purple-800">
            🌟 Epic Learning Adventures Await
          </h2>
          <p className="text-xl text-purple-600 max-w-3xl mx-auto">
            Explore magical worlds filled with exciting challenges and
            life-changing skills
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {worlds.map((world, index) => (
            <div
              key={index}
              className={`group ${world.bgColor} rounded-3xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-3 transition-all duration-500 border-2 border-transparent hover:border-purple-300`}
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 group-hover:animate-bounce inline-block">
                  {world.emoji}
                </div>
                <h3 className="text-2xl font-bold text-purple-800 mb-3">
                  {world.title}
                </h3>
                <p className="text-purple-600 leading-relaxed">
                  {world.description}
                </p>
              </div>
              <a href="/auth">
                <button
                  className={`w-full bg-gradient-to-r ${world.color} text-white font-bold py-3 px-4 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
                >
                  Explore World ✨
                </button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
