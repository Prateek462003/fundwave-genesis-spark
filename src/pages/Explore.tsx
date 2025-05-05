import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import CampaignCard from "@/components/CampaignCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Campaign {
  id: string;
  creator: string;
  title: string;
  description: string;
  targetAmount: string;
  amountCollected: string;
  deadline: number;
  claimed: boolean;
  imageUrl?: string;
}

const Explore = () => {
  const { campaigns, loadingCampaigns } = useWeb3();
  const [filter, setFilter] = useState('all');
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(loadingCampaigns);
  }, [loadingCampaigns]);

  useEffect(() => {
    let filtered: Campaign[] = [];
    if (filter === 'active') {
      filtered = campaigns.filter(campaign => campaign.deadline > Date.now());
    } else if (filter === 'ended') {
      filtered = campaigns.filter(campaign => campaign.deadline <= Date.now());
    } else {
      filtered = campaigns;
    }
    setFilteredCampaigns(filtered);
  }, [campaigns, filter]);
  
  return (
    <div>
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Explore Campaigns</h1>
          
          <Button asChild className="bg-brand-purple hover:bg-brand-purpleDark">
            <Link to="/create">Start a Campaign</Link>
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant={filter === 'all' ? "default" : "outline"}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? "default" : "outline"}
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'ended' ? "default" : "outline"}
            onClick={() => setFilter('ended')}
          >
            Ended
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
          </div>
        ) : (
          <>
            {filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-3">No campaigns found</h2>
                <p className="text-gray-600 mb-6">{filter === 'all' ? 'Be the first to create a campaign!' : `No ${filter} campaigns available.`}</p>
                <Button className="bg-brand-purple hover:bg-brand-purpleDark" asChild>
                  <Link to="/create">Create a Campaign</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Explore;
