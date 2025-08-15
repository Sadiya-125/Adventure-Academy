import React from "react";
import HeroSection from "../components/HeroSection";
import NavigationSection from "../components/NavigationSection";
import FeaturesSection from "../components/FeaturesSection";
import LearningSystemSection from "../components/LearningSystemSection";
import StatsSection from "../components/StatsSection";
import FinalCTASection from "../components/FinalCTASection";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <NavigationSection />
      <FeaturesSection />
      <LearningSystemSection />
      <StatsSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
