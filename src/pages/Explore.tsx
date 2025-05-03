
import { useState, useEffect } from "react";
import CampaignCard from "@/components/CampaignCard";
import { useWeb3 } from "@/context/Web3Context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search } from "lucide-react";
import { ethers } from "ethers";

const Explore = () => {
  const { campaigns, fetchCampaigns, loadingCampaigns } = useWeb3();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    fetchCampaigns();
  }, []);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    
    if (activeTab === "active") {
      return matchesSearch && campaign.deadline > Date.now();
    }
    
    if (activeTab === "funded") {
      const targetAmount = parseFloat(ethers.utils.formatEther(campaign.targetAmount));
      const amountCollected = parseFloat(ethers.utils.formatEther(campaign.amountCollected));
      return matchesSearch && (amountCollected >= targetAmount);
    }
    
    return matchesSearch;
  });
  
  return (
    <div>
      <Navbar />
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Explore Campaigns
          </h1>
          <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            Discover innovative projects seeking funding through our platform
          </p>
          
          <div className="max-w-lg mx-auto relative mb-8">
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={handleSearch}
              className="pr-10"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <Tabs defaultValue="all" className="max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" onClick={() => setActiveTab("all")}>All</TabsTrigger>
              <TabsTrigger value="active" onClick={() => setActiveTab("active")}>Active</TabsTrigger>
              <TabsTrigger value="funded" onClick={() => setActiveTab("funded")}>Funded</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {loadingCampaigns ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
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
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any campaigns matching your search.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setActiveTab("all");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Explore;
