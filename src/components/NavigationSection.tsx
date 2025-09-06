import React from "react";
import { Link } from "react-router-dom";

const NavigationSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-100 to-purple-100">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple-800">
          🧭 Choose Your Adventure
        </h2>
        <p className="text-xl text-center mb-16 text-purple-600 max-w-2xl mx-auto">
          Select your role and embark on your personalized learning journey
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-4 border-transparent hover:border-yellow-400">
            <div className="text-6xl mb-6 text-center group-hover:animate-bounce">
              👦
            </div>
            <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">
              For Students
            </h3>
            <p className="text-purple-600 text-center mb-6">
              Start your magical learning adventure with fun quests and
              challenges!
            </p>
            <Link to="/auth">
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                Begin Quest ⚡
              </button>
            </Link>
          </div>

          <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-4 border-transparent hover:border-teal-400">
            <div className="text-6xl mb-6 text-center group-hover:animate-bounce">
              🧑‍🤝‍🧑
            </div>
            <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">
              Parent Monitoring
            </h3>
            <p className="text-purple-600 text-center mb-6">
              Track your child's progress and guide their learning journey
              safely.
            </p>
            <Link to="/auth">
              <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-3 px-6 rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all duration-300">
                Monitor Progress 📊
              </button>
            </Link>
          </div>

          <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-4 border-transparent hover:border-orange-400">
            <div className="text-6xl mb-6 text-center group-hover:animate-bounce">
              🛡️
            </div>
            <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">
              Admin Controls
            </h3>
            <p className="text-purple-600 text-center mb-6">
              Manage the platform and create amazing learning experiences.
            </p>
            <Link to="/auth">
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                Access Dashboard 🎛️
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NavigationSection;
