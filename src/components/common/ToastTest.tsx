
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const ToastTest = () => {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: "Test Toast",
      description: "This is a test toast notification",
    });
  };

  return (
    <div className="p-4">
      <Button onClick={showToast}>Test Toast</Button>
    </div>
  );
};
