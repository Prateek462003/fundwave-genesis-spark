
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetAmount: string;
  amountCollected: string;
  deadline: number;
}

const CampaignCard = ({
  id,
  title,
  description,
  imageUrl,
  targetAmount,
  amountCollected,
  deadline
}: CampaignCardProps) => {
  // Calculate funding percentage
  const targetEth = parseFloat(ethers.utils.formatEther(targetAmount));
  const collectedEth = parseFloat(ethers.utils.formatEther(amountCollected));
  const percentageFunded = (collectedEth / targetEth) * 100;
  
  // Calculate days left
  const daysLeft = Math.max(0, Math.floor((deadline - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1605792657660-596af9009e82"}
          alt={title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      <CardContent className="p-5 flex-grow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{title}</h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Funded</span>
            <span className="font-medium">{percentageFunded.toFixed(1)}%</span>
          </div>
          <Progress value={percentageFunded} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 my-3 text-sm">
          <div>
            <p className="text-gray-600">Raised</p>
            <p className="font-semibold">
              {collectedEth.toFixed(2)} ETH
            </p>
          </div>
          <div>
            <p className="text-gray-600">Target</p>
            <p className="font-semibold">{targetEth.toFixed(2)} ETH</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-4 border-t flex justify-between items-center">
        <div className="text-sm">
          <span className="text-gray-600">
            {daysLeft > 0 ? `${daysLeft} days left` : "Campaign ended"}
          </span>
        </div>
        
        <Button asChild className="bg-brand-purple hover:bg-brand-purpleDark">
          <Link to={`/campaign/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
