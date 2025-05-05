
import { useState, useEffect } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CampaignCard from "@/components/CampaignCard";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { account, connectWallet, fetchCampaigns, myCampaigns, myDonations, campaigns } = useWeb3();
  const [activeTab, setActiveTab] = useState("campaigns");
  const { toast } = useToast();
  
  useEffect(() => {
    if (account) {
      fetchCampaigns();
    }
  }, [account]);

  const getMyCampaignDetails = (campaignId: string) => {
    return campaigns.find(c => c.id === campaignId);
  };

  return (
    <div>
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        
        {!account ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">Connect your wallet to view your dashboard</h2>
            <p className="text-gray-600 mb-8">You need to connect your wallet to see your campaigns and donations.</p>
            <Button 
              className="bg-brand-purple hover:bg-brand-purpleDark"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="campaigns">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
                <TabsTrigger value="donations">My Donations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="campaigns">
                {myCampaigns.length === 0 ? (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-semibold mb-3">You haven't created any campaigns yet</h3>
                    <p className="text-gray-600 mb-6">Start your first fundraising campaign today!</p>
                    <Button className="bg-brand-purple hover:bg-brand-purpleDark" asChild>
                      <a href="/create">Create a Campaign</a>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myCampaigns.map((campaign) => (
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
              </TabsContent>
              
              <TabsContent value="donations">
                {myDonations.length === 0 ? (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-semibold mb-3">You haven't made any donations yet</h3>
                    <p className="text-gray-600 mb-6">Support a fundraising campaign today!</p>
                    <Button className="bg-brand-purple hover:bg-brand-purpleDark" asChild>
                      <a href="/explore">Explore Campaigns</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myDonations.map((donation) => {
                      const campaign = getMyCampaignDetails(donation.id);
                      return (
                        <Card key={donation.id + Math.random()} className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h3 className="text-xl font-semibold mb-2">
                                  {campaign ? campaign.title : "Campaign"}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {campaign 
                                    ? `Campaign by ${campaign.creator.substring(0, 6)}...${campaign.creator.substring(campaign.creator.length - 4)}`
                                    : "Campaign details not available"}
                                </p>
                              </div>
                              <div className="bg-purple-50 px-4 py-2 rounded-full text-brand-purple font-semibold">
                                Donated: {ethers.utils.formatEther(donation.amount)} ETH
                              </div>
                            </div>
                            
                            {campaign && (
                              <Button variant="outline" className="mt-4" asChild>
                                <a href={`/campaign/${campaign.id}`}>View Campaign</a>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
