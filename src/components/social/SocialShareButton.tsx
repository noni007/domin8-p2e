import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Share2, Twitter, MessageCircle, Link, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  type: 'tournament' | 'achievement' | 'match' | 'activity';
}

export const SocialShareButton = ({ 
  title, 
  description, 
  url = window.location.href, 
  imageUrl,
  type 
}: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateShareText = () => {
    const emoji = {
      tournament: '🏆',
      achievement: '⚡',
      match: '🎮',
      activity: '🎯'
    }[type];

    return `${emoji} ${title}\n\n${description}\n\nJoin the action: ${url}`;
  };

  const shareData = {
    title,
    text: description,
    url,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Thanks for sharing with your friends!",
        });
      } catch (error) {
        console.log('Share canceled');
      }
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(generateShareText());
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    
    toast({
      title: "Opening Twitter...",
      description: "Share your gaming achievement!",
    });
  };

  const handleDiscordShare = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copied to clipboard!",
      description: "Ready to paste in Discord!",
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Link copied!",
        description: "Share this link anywhere!",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare} className="text-white hover:bg-gray-800">
            <Share2 className="h-4 w-4 mr-2" />
            Share...
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleTwitterShare} className="text-white hover:bg-gray-800">
          <Twitter className="h-4 w-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleDiscordShare} className="text-white hover:bg-gray-800">
          <MessageCircle className="h-4 w-4 mr-2" />
          Copy for Discord
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleCopyLink} className="text-white hover:bg-gray-800">
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-400" />
          ) : (
            <Link className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};