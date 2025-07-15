
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  type: 'tournament_registration' | 'match_scheduled' | 'tournament_status' | 'match_results' | 'achievement_unlock' | 'password_reset';
  data: {
    userName?: string;
    tournamentTitle?: string;
    opponent?: string;
    matchTime?: string;
    status?: string;
    score?: string;
    achievementName?: string;
    reset_url?: string;
    user_email?: string;
    [key: string]: any;
  };
}

const getEmailTemplate = (type: string, data: any) => {
  const templates = {
    tournament_registration: {
      subject: `Tournament Registration Confirmed - ${data.tournamentTitle}`,
      html: `
        <h1>Registration Confirmed!</h1>
        <p>Hi ${data.userName},</p>
        <p>You have successfully registered for <strong>"${data.tournamentTitle}"</strong>.</p>
        <p>Tournament details:</p>
        <ul>
          <li>Start Date: ${data.startDate || 'TBD'}</li>
          <li>Prize Pool: ${data.prizePool || 'TBD'}</li>
          <li>Max Participants: ${data.maxParticipants || 'TBD'}</li>
        </ul>
        <p>Good luck and may the best player win!</p>
        <p>Best regards,<br>The TourneyPro Team</p>
      `
    },
    match_scheduled: {
      subject: `Match Scheduled - vs ${data.opponent}`,
      html: `
        <h1>Match Scheduled</h1>
        <p>Hi ${data.userName},</p>
        <p>Your match against <strong>${data.opponent}</strong> has been scheduled.</p>
        <p>Match details:</p>
        <ul>
          <li>Opponent: ${data.opponent}</li>
          <li>Scheduled Time: ${data.matchTime}</li>
          <li>Tournament: ${data.tournamentTitle || 'N/A'}</li>
        </ul>
        <p>Make sure to be ready at the scheduled time!</p>
        <p>Best regards,<br>The TourneyPro Team</p>
      `
    },
    tournament_status: {
      subject: `Tournament Update - ${data.tournamentTitle}`,
      html: `
        <h1>Tournament Status Update</h1>
        <p>Hi ${data.userName},</p>
        <p>The tournament <strong>"${data.tournamentTitle}"</strong> status has been updated.</p>
        <p>New Status: <strong>${data.status}</strong></p>
        ${data.status === 'live' ? '<p>The tournament has started! Good luck in your matches.</p>' : ''}
        ${data.status === 'completed' ? '<p>The tournament has ended. Check out the final results on the platform.</p>' : ''}
        ${data.status === 'cancelled' ? '<p>Unfortunately, this tournament has been cancelled. You will be notified of any updates.</p>' : ''}
        <p>Best regards,<br>The TourneyPro Team</p>
      `
    },
    match_results: {
      subject: `Match Result - ${data.result === 'won' ? 'Victory!' : 'Match Completed'}`,
      html: `
        <h1>Match ${data.result === 'won' ? 'Victory!' : 'Result'}</h1>
        <p>Hi ${data.userName},</p>
        <p>Your match against <strong>${data.opponent}</strong> has been completed.</p>
        <p>Result: You <strong>${data.result}</strong></p>
        <p>Final Score: ${data.score}</p>
        ${data.result === 'won' ? '<p>🎉 Congratulations on your victory!</p>' : '<p>Better luck next time!</p>'}
        <p>Best regards,<br>The TourneyPro Team</p>
      `
    },
    achievement_unlock: {
      subject: `Achievement Unlocked - ${data.achievementName}`,
      html: `
        <h1>🏆 Achievement Unlocked!</h1>
        <p>Hi ${data.userName},</p>
        <p>Congratulations! You've earned a new achievement:</p>
        <h2>"${data.achievementName}"</h2>
        <p>${data.description || 'Great job on reaching this milestone!'}</p>
        <p>Keep up the excellent work and continue dominating the competition!</p>
        <p>Best regards,<br>The Domin8 Team</p>
      `
    },
    password_reset: {
      subject: 'Reset Your Domin8 Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Reset Your Password</h1>
            <p style="color: #666; font-size: 16px;">Domin8 - Africa's Premier Esports Platform</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your Domin8 account (${data.user_email}).
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.reset_url}" 
                 style="display: inline-block; 
                        background: linear-gradient(135deg, #1e40af, #0ea5e9); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        font-size: 16px;">
                Reset My Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #1e40af; font-size: 12px; background-color: #f1f5f9; padding: 10px; border-radius: 4px;">
              ${data.reset_url}
            </p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              If you didn't request this password reset, you can safely ignore this email.
            </p>
            <p style="color: #666; font-size: 12px;">
              This email was sent from Domin8 - Africa's premier esports ranking platform.
            </p>
          </div>
        </div>
      `
    }
  };

  return templates[type as keyof typeof templates] || {
    subject: 'Notification from TourneyPro',
    html: '<p>You have a new notification from TourneyPro.</p>'
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, data }: EmailRequest = await req.json();

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const template = getEmailTemplate(type, data);

    const emailResponse = await resend.emails.send({
      from: "TourneyPro <notifications@resend.dev>",
      to: [to],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
