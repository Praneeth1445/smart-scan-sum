import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedData {
  metadata: {
    exam: string;
    monthYear: string;
    branch: string;
    subCode: string;
    subName: string;
    examinerName: string;
    scrutinizerName: string;
  };
  marks: {
    questionNo: number;
    partA: number | null;
    partB: number | null;
    partC: number | null;
    total: number | null;
  }[];
  totalMarks: {
    calculated: number;
    written: number | null;
    bubbleDigits: number | null;
    marksInWords: {
      tens: string;
      units: string;
    };
  };
  validation: {
    isValid: boolean;
    calculatedSum: number;
    writtenTotal: number | null;
    bubbleTotal: number | null;
    errors: string[];
  };
  rawText: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing image for OCR extraction...');

    const systemPrompt = `You are an expert OCR system specialized in extracting data from handwritten exam answer sheets. Your task is to:

1. Extract all printed and handwritten text from the image
2. Identify and extract the marks table with question numbers, part marks (a, b, c), and totals
3. Extract the total marks written in figures
4. Identify the bubble/OMR digits that represent the total marks (filled bubbles)
5. Extract the marks written in words (tens place and units place)
6. Extract metadata like exam name, branch, subject code, subject name, examiner name, scrutinizer name

CRITICAL: You must return ONLY valid JSON, no explanations or markdown.

Return the data in this exact JSON structure:
{
  "metadata": {
    "exam": "exam name and type",
    "monthYear": "month and year",
    "branch": "branch name",
    "subCode": "subject code",
    "subName": "subject name",
    "examinerName": "examiner's name (handwritten)",
    "scrutinizerName": "scrutinizer's name (handwritten)"
  },
  "marks": [
    {
      "questionNo": 1,
      "partA": number or null,
      "partB": number or null,
      "partC": number or null,
      "total": number or null
    }
  ],
  "totalMarks": {
    "calculated": sum of all totals from marks table,
    "written": total marks written in figures,
    "bubbleDigits": total from filled bubble digits,
    "marksInWords": {
      "tens": "word for tens place",
      "units": "word for units place"
    }
  },
  "rawText": "all extracted text from the image"
}

For bubble digits: Look at the bubble sheet where digits 0-9 are marked. The filled bubbles indicate the digit. First column is tens place, second is units place.

Be precise with handwritten numbers - they can be challenging to read. If uncertain, note the most likely value.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all data from this exam answer sheet image. Return only valid JSON.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'API credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to process image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content in AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the response
    let extractedData: ExtractedData;
    try {
      // Clean up potential markdown formatting
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      const parsed = JSON.parse(jsonStr);
      
      // Calculate validation
      const calculatedSum = parsed.marks?.reduce((sum: number, m: any) => {
        return sum + (m.total || 0);
      }, 0) || 0;

      const writtenTotal = parsed.totalMarks?.written;
      const bubbleTotal = parsed.totalMarks?.bubbleDigits;

      const errors: string[] = [];
      
      if (writtenTotal !== null && calculatedSum !== writtenTotal) {
        errors.push(`Calculated sum (${calculatedSum}) doesn't match written total (${writtenTotal})`);
      }
      
      if (bubbleTotal !== null && calculatedSum !== bubbleTotal) {
        errors.push(`Calculated sum (${calculatedSum}) doesn't match bubble digits (${bubbleTotal})`);
      }
      
      if (writtenTotal !== null && bubbleTotal !== null && writtenTotal !== bubbleTotal) {
        errors.push(`Written total (${writtenTotal}) doesn't match bubble digits (${bubbleTotal})`);
      }

      const isValid = errors.length === 0 && 
        (writtenTotal === null || calculatedSum === writtenTotal) &&
        (bubbleTotal === null || calculatedSum === bubbleTotal);

      extractedData = {
        ...parsed,
        totalMarks: {
          ...parsed.totalMarks,
          calculated: calculatedSum
        },
        validation: {
          isValid,
          calculatedSum,
          writtenTotal,
          bubbleTotal,
          errors
        }
      };

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Content:', content);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse extracted data',
          rawContent: content 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extraction complete, validation:', extractedData.validation);

    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OCR extraction error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
