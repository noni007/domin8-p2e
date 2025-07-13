import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, data, userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate prompt based on type and data
    let prompt = ''
    let imageStyle = 'gaming tournament poster, high quality digital art, vibrant colors'

    switch (type) {
      case 'tournament_card':
        prompt = `${imageStyle}, tournament banner for ${data.game}, featuring "${data.title}", prize pool $${data.prize_pool}, esports style, modern design, blue and teal color scheme`
        break
      
      case 'achievement_unlock':
        prompt = `${imageStyle}, achievement unlock celebration, "${data.name}" achievement, ${data.category} themed, golden trophy elements, sparkles and effects, celebratory atmosphere`
        break
      
      case 'match_result':
        prompt = `${imageStyle}, match result display, ${data.game} tournament match, score ${data.score_player1}-${data.score_player2}, winner celebration, competitive gaming theme`
        break
      
      default:
        prompt = `${imageStyle}, general gaming achievement, esports themed, modern digital design`
    }

    // Check if we already have a generated image for this combination
    const { data: existingMedia } = await supabase
      .from('generated_media')
      .select('*')
      .eq('user_id', userId)
      .eq('media_type', type)
      .eq('prompt', prompt)
      .single()

    if (existingMedia) {
      // Update usage count and return existing image
      await supabase
        .from('generated_media')
        .update({ usage_count: existingMedia.usage_count + 1 })
        .eq('id', existingMedia.id)

      return new Response(
        JSON.stringify({ 
          image_url: existingMedia.image_url,
          cached: true,
          media_id: existingMedia.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate new image with OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png'
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const openaiData = await openaiResponse.json()
    
    // For gpt-image-1, the response contains base64 data directly
    const base64Data = openaiData.data?.[0]?.b64_json || openaiData.data?.[0]?.url
    
    if (!base64Data) {
      return new Response(
        JSON.stringify({ error: 'No image data received from OpenAI' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Convert base64 to blob and upload to Supabase Storage
    const imageData = base64Data.startsWith('data:') 
      ? base64Data.split(',')[1] 
      : base64Data

    const imageBuffer = Uint8Array.from(atob(imageData), c => c.charCodeAt(0))
    const fileName = `generated/${userId}/${type}_${Date.now()}.png`

    // Note: For this to work, you need to create a 'generated-images' bucket in Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      // Return base64 data as fallback
      return new Response(
        JSON.stringify({ 
          image: `data:image/png;base64,${imageData}`,
          cached: false,
          fallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fileName)

    const imageUrl = publicUrlData.publicUrl

    // Save media record to database
    const { data: mediaRecord, error: dbError } = await supabase
      .from('generated_media')
      .insert({
        user_id: userId,
        media_type: type,
        prompt: prompt,
        image_url: imageUrl,
        file_path: fileName,
        generation_model: 'gpt-image-1',
        generation_data: {
          openai_response: openaiData,
          size: '1024x1024',
          quality: 'high'
        },
        usage_count: 1
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Still return the image even if we can't save the record
    }

    return new Response(
      JSON.stringify({ 
        image_url: imageUrl,
        cached: false,
        media_id: mediaRecord?.id || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating image:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})