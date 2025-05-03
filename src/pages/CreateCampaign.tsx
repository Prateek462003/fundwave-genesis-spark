
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, AlertTriangle } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Campaign title must be at least 3 characters."
  }).max(100, {
    message: "Campaign title must be less than 100 characters."
  }),
  description: z.string().min(30, {
    message: "Campaign description must be at least 30 characters."
  }).max(5000, {
    message: "Campaign description must be less than 5000 characters."
  }),
  target: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Target amount must be greater than 0."
  }),
  deadline: z.string().refine(val => {
    const date = new Date(val);
    return date > new Date();
  }, {
    message: "Deadline must be in the future."
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL for the campaign image."
  }).optional().or(z.literal(''))
});

const CreateCampaign = () => {
  const { account, connectWallet, connecting, createCampaign, isCorrectNetwork, switchNetwork } = useWeb3();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      target: "",
      deadline: "",
      imageUrl: ""
    }
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a campaign.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to the Sepolia testnet to create a campaign.",
      });
      await switchNetwork();
      return;
    }
    
    setSubmitting(true);
    try {
      const deadline = new Date(values.deadline).getTime();
      
      // Use a default image URL if none provided
      const imageUrl = values.imageUrl || "https://images.unsplash.com/photo-1605792657660-596af9009e82";
      
      const success = await createCampaign(
        values.title,
        values.description,
        values.target,
        deadline,
        imageUrl
      );
      
      if (success) {
        toast({
          title: "Campaign Created",
          description: "Your campaign has been created successfully!"
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Creation Failed",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div>
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center">Create a Campaign</h1>
          <p className="text-gray-600 mb-8 text-center">
            Launch your project and start raising funds with blockchain technology
          </p>
          
          {!account && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center p-4">
                  <Wallet size={48} className="text-brand-purple mb-4" />
                  <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                  <p className="text-gray-600 mb-4">
                    You need to connect your wallet to create a campaign
                  </p>
                  <Button 
                    onClick={connectWallet} 
                    disabled={connecting}
                    className="bg-brand-purple hover:bg-brand-purpleDark"
                  >
                    {connecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {account && !isCorrectNetwork && (
            <Alert className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Wrong Network</AlertTitle>
              <AlertDescription>
                You're connected to the wrong network. Please switch to Sepolia testnet.
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={switchNetwork} 
                  className="ml-4"
                >
                  Switch Network
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Fill in the details of your fundraising campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a catchy title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your campaign in detail" 
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="target"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Amount (ETH)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-brand-purple hover:bg-brand-purpleDark"
                    disabled={submitting || !account || !isCorrectNetwork}
                  >
                    {submitting ? "Creating Campaign..." : "Create Campaign"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CreateCampaign;
