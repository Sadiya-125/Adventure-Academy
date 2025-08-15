import React from "react";
import { Play, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 text-4xl animate-bounce">
          ⭐
        </div>
        <div className="absolute top-32 right-20 text-3xl animate-pulse">
          📚
        </div>
        <div className="absolute top-60 left-1/4 text-2xl animate-bounce delay-100">
          🕐
        </div>
        <div className="absolute top-80 right-1/3 text-3xl animate-pulse delay-200">
          🪙
        </div>
        <div className="absolute bottom-40 left-1/3 text-2xl animate-bounce delay-300">
          🍎
        </div>
        <div className="absolute bottom-60 right-10 text-4xl animate-pulse delay-150">
          ✨
        </div>
        <div className="absolute top-40 left-1/2 text-2xl animate-bounce delay-500">
          🌟
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
            🏰 Adventure Academy
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold mb-6 text-yellow-200 animate-fade-in delay-200">
            Where learning becomes an epic adventure! ✨
          </h2>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-400">
            Join thousands of young heroes mastering life skills through magical
            quests and exciting challenges.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in delay-600">
            <a href="/auth">
              <button className="group bg-yellow-400 hover:bg-yellow-300 text-purple-800 font-bold py-4 px-8 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
                🚀 Start Your Quest
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </a>
            <button className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
              <Play className="w-6 h-6" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
