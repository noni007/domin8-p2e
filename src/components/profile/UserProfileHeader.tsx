
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const UserProfileHeader = () => {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-blue-800/30 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/be31ac20-7045-4c65-bf6f-1dda987cd378.png" 
              alt="Logo" 
              className="h-10 w-auto"
            />
          </div>
          <Button 
            variant="outline" 
            className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </nav>
  );
};
