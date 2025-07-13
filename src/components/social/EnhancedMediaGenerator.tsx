import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2, Sparkles, Palette, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaGenerator } from './MediaGenerator';
import { useEnhancedMediaGenerator } from '@/hooks/useEnhancedMediaGenerator';

interface EnhancedMediaGeneratorProps {
  type: 'tournament_card' | 'achievement_unlock' | 'match_result';
  data: any;
  onImageGenerated?: (imageUrl: string) => void;
}

export const EnhancedMediaGenerator = ({ 
  type, 
  data, 
  onImageGenerated 
}: EnhancedMediaGeneratorProps) => {
  const [useAI, setUseAI] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { generateAIImage } = useEnhancedMediaGenerator();

  const handleGenerateAI = async () => {
    setGenerating(true);
    
    try {
      const imageUrl = await generateAIImage(type, data);
      
      if (imageUrl) {
        setGeneratedImageUrl(imageUrl);
        onImageGenerated?.(imageUrl);
      }
    } catch (error) {
      console.error('Error generating AI image:', error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `domin8-${type}-${Date.now()}.png`;
    link.click();

    toast({
      title: "Image downloaded!",
      description: "Share your gaming moment!",
    });
  };

  const shareImage = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        // For URLs, we need to fetch and create a file
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `domin8-${type}.png`, { type: 'image/png' });
        
        await navigator.share({
          files: [file],
          title: 'Check out my gaming achievement!',
        });
      } catch (error) {
        console.log('Share canceled or failed');
        // Fallback to copying URL
        await navigator.clipboard.writeText(imageUrl);
        toast({
          title: "Link copied!",
          description: "Image URL copied to clipboard.",
        });
      }
    } else {
      downloadImage(imageUrl);
    }
  };

  return (
    <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Palette className="h-5 w-5 mr-2 text-purple-400" />
          Create Shareable Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <Label className="text-white">AI Generated Image</Label>
          </div>
          <Switch
            checked={useAI}
            onCheckedChange={setUseAI}
          />
        </div>

        {useAI ? (
          <div className="space-y-4">
            {/* AI Generation Section */}
            <div className="text-center space-y-3">
              <p className="text-gray-300 text-sm">
                Generate a custom AI image for your {type.replace('_', ' ')}
              </p>
              
              {!generatedImageUrl ? (
                <Button
                  onClick={handleGenerateAI}
                  disabled={generating}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Image
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={generatedImageUrl}
                      alt="AI Generated"
                      className="w-full max-w-sm mx-auto rounded-lg border border-purple-500/30"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => downloadImage(generatedImageUrl)}
                      variant="outline"
                      size="sm"
                      className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button
                      onClick={() => shareImage(generatedImageUrl)}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    
                    <Button
                      onClick={() => setGeneratedImageUrl(null)}
                      variant="outline"
                      size="sm"
                    >
                      Generate New
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Canvas-based generation */
          <MediaGenerator 
            type={type} 
            data={data} 
            onImageGenerated={onImageGenerated}
          />
        )}

        <div className="text-xs text-gray-500 text-center mt-4">
          {useAI ? (
            "AI images are generated using OpenAI's latest model for high-quality results"
          ) : (
            "Canvas-based images are generated instantly in your browser"
          )}
        </div>
      </CardContent>
    </Card>
  );
};