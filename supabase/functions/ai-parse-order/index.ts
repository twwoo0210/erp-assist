// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 입력 검증 스키마
interface AIParseInput {
  inputText: string;
}

interface OrderItem {
  item_name: string;
  qty: number;
  matched_item?: {
    code: string;
    name: string;
    price: number;
    unit?: string;
  };
  confidence?: number;
}

interface ParsedOrder {
  customer_name: string;
  items: OrderItem[];
}

// 입력 검증 함수
function validateInput(data: any): AIParseInput {
  if (!data || typeof data !== 'object') {
    throw new Error('요청 데이터가 올바르지 않습니다.');
  }
  
  if (!data.inputText || typeof data.inputText !== 'string') {
    throw new Error('입력 텍스트가 필요합니다.');
  }
  
  if (data.inputText.length > 1000) {
    throw new Error('입력 텍스트는 1000자를 초과할 수 없습니다.');
  }
  
  return { inputText: data.inputText.trim() };
}

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

// Gemini API 호출 함수
async function callGeminiAPI(prompt: string): Promise<string> {
  // 제공받은 API 키 사용
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
  
  if (!geminiApiKey) {
    throw new Error("Gemini API 키가 설정되지 않았습니다.");
  }

  // 제공받은 모델 ID 사용
  const modelId = Deno.env.get('GEMINI_MODEL') ?? "gemini-flash-lite-latest";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiApiKey}`;
  
  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1000
    }
  };

  try {
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", response.status, errorText);
      throw new Error(`Gemini API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      throw new Error("AI 응답을 받을 수 없습니다.");
    }

    return aiText;
  } catch (error: any) {
    console.error("Gemini API 호출 실패:", error);
    throw new Error(`AI 서비스 오류: ${error.message}`);
  }
}

// JSON 파싱 함수
function parseAIResponse(aiText: string): any {
  try {
    // JSON 코드블록 제거
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : aiText;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("JSON 파싱 오류:", error);
    throw new Error("AI 응답을 JSON으로 파싱할 수 없습니다.");
  }
}

// 주문 데이터 검증 함수
function validateParsedOrder(data: any): ParsedOrder {
  if (!data || typeof data !== 'object') {
    throw new Error('파싱된 주문 데이터가 올바르지 않습니다.');
  }
  
  if (!data.customer_name || typeof data.customer_name !== 'string') {
    data.customer_name = '미지정';
  }
  
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('주문 품목이 없습니다.');
  }
  
  // 각 아이템 검증
  data.items = data.items.map((item: any, index: number) => {
    if (!item.item_name || typeof item.item_name !== 'string') {
      throw new Error(`품목 ${index + 1}의 이름이 올바르지 않습니다.`);
    }
    
    const qty = parseInt(item.qty);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`품목 ${index + 1}의 수량이 올바르지 않습니다.`);
    }
    
    return {
      item_name: item.item_name.trim(),
      qty: qty
    };
  });
  
  return data as ParsedOrder;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 입력 검증
    const requestData = await req.json();
    const { inputText } = validateInput(requestData);

    // Gemini API 프롬프트 생성
    const prompt = `다음 자연어 주문 내용을 JSON 형태로 파싱해주세요.
응답은 반드시 다음 형식의 JSON만 반환하세요:

{
  "customer_name": "거래처명",
  "items": [
    {
      "item_name": "품목명",
      "qty": 수량(숫자)
    }
  ]
}

입력 텍스트: "${inputText}"

주의사항:
- 거래처명이 명시되지 않은 경우 "미지정"으로 설정
- 수량은 반드시 숫자로 변환
- 품목명은 가능한 정확하게 추출
- JSON 외의 다른 텍스트는 포함하지 마세요`;

    // Gemini API 호출
    const aiText = await callGeminiAPI(prompt);
    
    // JSON 파싱 및 검증
    const rawParsedOrder = parseAIResponse(aiText);
    const parsedOrder = validateParsedOrder(rawParsedOrder);

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

    // 품목 매칭
    const matchedItems = parsedOrder.items.map((item) => {
      let bestMatch: any = null;
      let bestScore = 0;
      
      for (const mockItem of mockItems) {
        const score = calculateSimilarity(
          item.item_name.toLowerCase(), 
          mockItem.name.toLowerCase()
        );
        if (score > bestScore && score > 0.2) {
          bestScore = score;
          bestMatch = mockItem;
        }
      }
      
      return {
        ...item,
        matched_item: bestMatch ? {
          code: bestMatch.code,
          name: bestMatch.name,
          price: bestMatch.price,
          unit: bestMatch.unit
        } : null,
        confidence: bestScore,
      };
    });

    const result: ParsedOrder = {
      customer_name: parsedOrder.customer_name,
      items: matchedItems
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("AI Parse Order Error:", error);
    
    // 에러 타입별 상태 코드 설정
    let statusCode = 500;
    let errorMessage = error.message || "AI 파싱 중 오류가 발생했습니다.";
    
    if (error.message.includes('올바르지 않습니다') || error.message.includes('필요합니다')) {
      statusCode = 400; // Bad Request
    } else if (error.message.includes('AI 서비스 오류')) {
      statusCode = 502; // Bad Gateway
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
