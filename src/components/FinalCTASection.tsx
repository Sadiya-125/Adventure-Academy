import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

const FinalCTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 text-3xl animate-pulse opacity-30">
          ⭐
        </div>
        <div className="absolute top-20 right-20 text-4xl animate-bounce opacity-30">
          🚀
        </div>
        <div className="absolute bottom-20 left-20 text-3xl animate-pulse delay-200 opacity-30">
          ✨
        </div>
        <div className="absolute bottom-10 right-10 text-2xl animate-bounce delay-300 opacity-30">
          🌟
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <Sparkles className="w-16 h-16 text-yellow-300 animate-bounce-gentle" />
        </div>

        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
          🚀 Ready to Begin Your Epic Adventure?
        </h2>

        <p className="text-xl md:text-2xl mb-12 text-purple-100 max-w-3xl mx-auto leading-relaxed">
          Join Adventure Academy today and watch your child develop essential
          life skills while having the time of their life!
        </p>

        <div className="flex flex-col items-center gap-6">
          <a href="/auth">
            <button className="group bg-yellow-400 hover:bg-yellow-300 text-purple-800 font-bold py-6 px-12 rounded-full text-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center gap-4">
              🚀 Create Account
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </button>
          </a>
          <p className="text-purple-200 text-sm">
            Free trial • No credit card required • Safe for kids
          </p>
        </div>

        {/* Floating Achievement Badges */}
        <div className="flex justify-center gap-4 mt-12 flex-wrap">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium animate-float">
            🏆 Award Winning
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium animate-float delay-100">
            🔒 100% Safe
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium animate-float delay-200">
            👨‍👩‍👧 Family Approved
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
