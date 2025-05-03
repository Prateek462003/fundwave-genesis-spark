
import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import CampaignCard from "@/components/CampaignCard";
import { useWeb3 } from "@/context/Web3Context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  const { campaigns, fetchCampaigns, loadingCampaigns } = useWeb3();
  
  useEffect(() => {
    fetchCampaigns();
  }, []);
  
  const featuredCampaigns = campaigns.slice(0, 3);
  
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeatureSection />
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Campaigns</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover innovative projects seeking funding through our platform
            </p>
          </div>
          
          {loadingCampaigns ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  id={campaign.id}
                  title={campaign.title}
                  description={campaign.description}
                  imageUrl={campaign.imageUrl}
                  targetAmount={campaign.targetAmount}
                  amountCollected={campaign.amountCollected}
                  deadline={campaign.deadline}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
