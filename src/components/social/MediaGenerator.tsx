import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaGeneratorProps {
  type: 'tournament_card' | 'achievement_unlock' | 'match_result';
  data: any;
  onImageGenerated?: (imageUrl: string) => void;
}

export const MediaGenerator = ({ type, data, onImageGenerated }: MediaGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#134e4a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add content based on type
    switch (type) {
      case 'tournament_card':
        drawTournamentCard(ctx, data);
        break;
      case 'achievement_unlock':
        drawAchievementUnlock(ctx, data);
        break;
      case 'match_result':
        drawMatchResult(ctx, data);
        break;
    }

    // Generate image URL
    const imageUrl = canvas.toDataURL('image/png');
    onImageGenerated?.(imageUrl);
  };

  const drawTournamentCard = (ctx: CanvasRenderingContext2D, tournament: any) => {
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(tournament.title, 400, 80);

    // Game
    ctx.fillStyle = '#60a5fa';
    ctx.font = '20px Arial';
    ctx.fillText(tournament.game, 400, 120);

    // Prize Pool
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(`$${(tournament.prize_pool / 100).toFixed(2)}`, 400, 200);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.fillText('Prize Pool', 400, 230);

    // Status and participants
    ctx.fillStyle = '#34d399';
    ctx.font = '16px Arial';
    ctx.fillText(`${tournament.status.replace('_', ' ').toUpperCase()}`, 400, 280);
    
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(`Participants: ${data.participantCount}/${tournament.max_participants}`, 400, 310);

    // Footer
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText('Join the competition at Domin8', 400, 360);
  };

  const drawAchievementUnlock = (ctx: CanvasRenderingContext2D, achievement: any) => {
    // Achievement unlock banner
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 ACHIEVEMENT UNLOCKED!', 400, 80);

    // Achievement name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(achievement.name, 400, 150);

    // Description
    ctx.fillStyle = '#d1d5db';
    ctx.font = '18px Arial';
    const words = achievement.description.split(' ');
    let line = '';
    let y = 200;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > 600 && n > 0) {
        ctx.fillText(line, 400, y);
        line = words[n] + ' ';
        y += 25;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 400, y);

    // Reward
    if (achievement.reward_amount > 0) {
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`+$${(achievement.reward_amount / 100).toFixed(2)} earned!`, 400, y + 60);
    }

    // Footer
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText('Powered by Domin8', 400, 360);
  };

  const drawMatchResult = (ctx: CanvasRenderingContext2D, match: any) => {
    // Match result header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MATCH RESULT', 400, 60);

    // Players
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(match.player1_name || 'Player 1', 100, 150);
    
    ctx.textAlign = 'right';
    ctx.fillText(match.player2_name || 'Player 2', 700, 150);

    // Scores
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${match.score_player1 || 0} - ${match.score_player2 || 0}`, 400, 220);

    // Winner
    if (match.winner_id) {
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 20px Arial';
      const winner = match.winner_id === match.player1_id ? 
        (match.player1_name || 'Player 1') : 
        (match.player2_name || 'Player 2');
      ctx.fillText(`🏆 ${winner} WINS!`, 400, 280);
    }

    // Tournament info
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px Arial';
    ctx.fillText(match.tournament_title || 'Tournament Match', 400, 320);

    // Footer
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText('Powered by Domin8', 400, 360);
  };

  const downloadImage = () => {
    generateImage();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `domin8-${type}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Image downloaded!",
      description: "Share your gaming moment!",
    });
  };

  const shareImage = async () => {
    generateImage();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (navigator.share && navigator.canShare) {
      try {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `domin8-${type}.png`, { type: 'image/png' });
            await navigator.share({
              files: [file],
              title: 'Check out my gaming achievement!',
            });
          }
        });
      } catch (error) {
        console.log('Share canceled or failed');
      }
    } else {
      downloadImage();
    }
  };

  useEffect(() => {
    generateImage();
  }, [data, type]);

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        className="w-full max-w-md mx-auto border border-gray-600 rounded-lg"
        style={{ maxHeight: '200px' }}
      />
      
      <div className="flex gap-2 justify-center">
        <Button
          onClick={downloadImage}
          variant="outline"
          size="sm"
          className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        
        <Button
          onClick={shareImage}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-teal-600"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Image
        </Button>
      </div>
    </div>
  );
};