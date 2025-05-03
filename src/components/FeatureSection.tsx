
import { Handshake, PiggyBank, Wallet } from "lucide-react";

const FeatureSection = () => {
  const features = [
    {
      icon: <Wallet className="w-10 h-10 text-brand-purple" />,
      title: "Simple Web3 Integration",
      description: "Connect your wallet with a single click and start interacting with campaigns immediately."
    },
    {
      icon: <PiggyBank className="w-10 h-10 text-brand-blue" />,
      title: "Transparent Funding",
      description: "All transactions are recorded on the blockchain, ensuring complete transparency and trust."
    },
    {
      icon: <Handshake className="w-10 h-10 text-brand-purpleDark" />,
      title: "Low Platform Fees",
      description: "Enjoy minimal fees compared to traditional crowdfunding platforms, with more funds going directly to projects."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose 
            <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
              {" "}FundWave
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A new generation of crowdfunding built on blockchain technology, 
            offering transparency, security, and lower fees.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="p-3 rounded-full bg-purple-50 mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h3 className="text-2xl font-bold mb-2">Ready to launch your project?</h3>
              <p className="text-gray-700">Join hundreds of creators who've successfully funded their ideas.</p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue text-white font-medium rounded-lg hover:from-brand-purpleDark hover:to-brand-blue transition-all shadow-sm hover:shadow">
              Start a Campaign
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
