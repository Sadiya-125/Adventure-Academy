import React from "react";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-3xl font-bold mb-2">🏰 Adventure Academy</h3>
            <p className="text-purple-300 text-lg">
              Where learning becomes an epic adventure!
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 text-purple-200">
            <span>Made with</span>
            <Heart className="w-5 h-5 text-red-400 animate-pulse" />
            <span>by Sadiya Maheen Siddiqui</span>
          </div>

          <div className="border-t border-purple-700 pt-6">
            <p className="text-purple-300">
              © 2025 Adventure Academy. All Rights Reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex justify-center gap-8 mt-6 flex-wrap">
            <a
              href="#"
              className="text-purple-300 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-purple-300 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-purple-300 hover:text-white transition-colors"
            >
              Contact Us
            </a>
            <a
              href="#"
              className="text-purple-300 hover:text-white transition-colors"
            >
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
