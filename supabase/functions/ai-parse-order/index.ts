// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 문자열 유사도 계산 (레벤슈타인)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= str1.length; j++) (matrix[0][j] = j);
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[str2.length][str1.length];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { inputText } = await req.json();
    if (!inputText) {
      return new Response(
        JSON.stringify({ error: "입력 텍스트가 필요합니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 제공해주신 예제에 맞춰 Gemini API 호출 방식 수정
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "AIzaSyBi3yFRcAH-FVXWM4XH3Evc440pSWwlkW0";
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API 키가 설정되지 않았습니다." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const prompt = `다음 자연어 주문 내용을 JSON 형태로 파싱해주세요.\n응답은 반드시 다음 형식의 JSON만 반환하세요:\n\n{\n  \"customer_name\": \"거래처명\",\n  \"items\": [\n    {\n      \"item_name\": \"품목명\",\n      \"qty\": 수량(숫자)\n    }\n  ]\n}\n\n입력 텍스트: \"${inputText}\"\n\n주의사항:\n- 거래처명이 명시되지 않은 경우 \"미지정\"으로 설정\n- 수량은 반드시 숫자로 변환\n- 품목명은 가능한 정확하게 추출\n- JSON 외의 다른 텍스트는 포함하지 마세요`;

    // 제공해주신 예제 형식에 맞춰 API 호출
    const modelId = "gemini-flash-lite-latest";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiApiKey}`;
    
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        thinkingConfig: {
          thinkingBudget: 0
        },
        temperature: 0.1,
        maxOutputTokens: 1000
      }
    };

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API Error:", geminiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Gemini API 오류: ${geminiResponse.status} - ${errorText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiData = await geminiResponse.json();
    const aiText: string | undefined = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) {
      return new Response(
        JSON.stringify({ error: "AI 응답을 받을 수 없습니다." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // JSON 파싱 (코드블록 제거 대응)
    let parsedOrder: any;
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : aiText;
      parsedOrder = JSON.parse(jsonText);
    } catch (_e) {
      return new Response(
        JSON.stringify({ error: "AI 응답을 JSON으로 파싱할 수 없습니다." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 테스트용 품목 매칭
    const mockItems = [
      { code: "A-001", name: "깐쇼새우 1kg", price: 5000, unit: "개" },
      { code: "A-002", name: "새우볼 500g", price: 3000, unit: "개" },
      { code: "A-003", name: "탕수육 1kg", price: 8000, unit: "개" },
      { code: "B-001", name: "짜장면 소스", price: 2000, unit: "개" },
      { code: "B-002", name: "짬뽕 소스", price: 2500, unit: "개" },
      { code: "C-001", name: "치킨 1마리", price: 15000, unit: "마리" },
      { code: "C-002", name: "피자 라지", price: 25000, unit: "판" },
      { code: "D-001", name: "김치찌개", price: 7000, unit: "인분" },
      { code: "D-002", name: "된장찌개", price: 6000, unit: "인분" },
    ];

    const matchedItems = (parsedOrder.items ?? []).map((item: any) => {
      let bestMatch: any = null;
      let bestScore = 0;
      for (const mockItem of mockItems) {
        const score = calculateSimilarity(String(item.item_name ?? "").toLowerCase(), mockItem.name.toLowerCase());
        if (score > bestScore && score > 0.2) {
          bestScore = score;
          bestMatch = mockItem;
        }
      }
      return {
        ...item,
        matched_item: bestMatch ? { code: bestMatch.code, name: bestMatch.name, price: bestMatch.price, unit: bestMatch.unit } : null,
        confidence: bestScore,
      };
    });

    const result = { customer_name: parsedOrder.customer_name ?? "미지정", items: matchedItems };
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: String(error?.message ?? error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});