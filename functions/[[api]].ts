import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS for all API routes
app.use('/api/*', cors())

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// AI Parse Order endpoint
app.post('/api/ai-parse-order', async (c) => {
  try {
    const { inputText } = await c.req.json()
    
    if (!inputText || typeof inputText !== 'string') {
      return c.json({ error: '입력 텍스트가 필요합니다.' }, 400)
    }
    
    if (inputText.length > 1000) {
      return c.json({ error: '입력 텍스트는 1000자를 초과할 수 없습니다.' }, 400)
    }

    // Gemini API 호출
    const geminiApiKey = "AIzaSyBi3yFRcAH-FVXWM4XH3Evc440pSWwlkW0"
    const modelId = "gemini-flash-lite-latest"
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiApiKey}`
    
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
- JSON 외의 다른 텍스트는 포함하지 마세요`

    const requestBody = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000
      }
    }

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API Error:", response.status, errorText)
      return c.json({ error: `AI 서비스 오류: ${response.status}` }, 502)
    }

    const data = await response.json()
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!aiText) {
      return c.json({ error: "AI 응답을 받을 수 없습니다." }, 502)
    }

    // JSON 파싱
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    const jsonText = jsonMatch ? jsonMatch[0] : aiText
    const parsedOrder = JSON.parse(jsonText)

    // 검증
    if (!parsedOrder.customer_name) {
      parsedOrder.customer_name = '미지정'
    }
    
    if (!Array.isArray(parsedOrder.items) || parsedOrder.items.length === 0) {
      return c.json({ error: '주문 품목이 없습니다.' }, 400)
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
    ]

    // 문자열 유사도 계산
    const calculateSimilarity = (str1: string, str2: string): number => {
      const longer = str1.length > str2.length ? str1 : str2
      const shorter = str1.length > str2.length ? str2 : str1
      if (longer.length === 0) return 1.0
      
      const distance = levenshteinDistance(longer, shorter)
      return (longer.length - distance) / longer.length
    }

    const levenshteinDistance = (str1: string, str2: string): number => {
      const matrix: number[][] = []
      for (let i = 0; i <= str2.length; i++) matrix[i] = [i]
      for (let j = 0; j <= str1.length; j++) (matrix[0][j] = j)
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1]
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            )
          }
        }
      }
      return matrix[str2.length][str1.length]
    }

    // 품목 매칭
    const matchedItems = parsedOrder.items.map((item: any) => {
      let bestMatch: any = null
      let bestScore = 0
      
      for (const mockItem of mockItems) {
        const score = calculateSimilarity(
          item.item_name.toLowerCase(), 
          mockItem.name.toLowerCase()
        )
        if (score > bestScore && score > 0.2) {
          bestScore = score
          bestMatch = mockItem
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
      }
    })

    const result = {
      customer_name: parsedOrder.customer_name,
      items: matchedItems
    }

    return c.json(result)

  } catch (error: any) {
    console.error("AI Parse Order Error:", error)
    return c.json({ 
      error: error.message || "AI 파싱 중 오류가 발생했습니다.",
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Create Order endpoint
app.post('/api/ecount-create-order', async (c) => {
  try {
    const { orderData } = await c.req.json()
    
    if (!orderData || typeof orderData !== 'object') {
      return c.json({ error: '주문 데이터가 필요합니다.' }, 400)
    }
    
    if (!orderData.customer_name || typeof orderData.customer_name !== 'string') {
      return c.json({ error: '거래처명이 필요합니다.' }, 400)
    }
    
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return c.json({ error: '주문 품목이 필요합니다.' }, 400)
    }

    // 총액 계산
    const totalAmount = orderData.items.reduce((total: number, item: any) => {
      return total + (item.matched_item?.price || 0) * item.qty
    }, 0)

    if (totalAmount <= 0) {
      return c.json({ error: '주문 총액이 0원 이하입니다. 품목 매칭을 확인해주세요.' }, 400)
    }

    // 시뮬레이션 지연
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // 90% 성공률
    const isSuccess = Math.random() > 0.1
    
    if (!isSuccess) {
      const errorMessages = [
        '재고가 부족합니다.',
        '거래처 정보를 찾을 수 없습니다.',
        '품목 코드가 유효하지 않습니다.',
        '네트워크 연결 오류가 발생했습니다.',
        'ECOUNT 서버가 일시적으로 사용할 수 없습니다.'
      ]
      const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)]
      return c.json({ 
        success: false,
        error: randomError,
        timestamp: new Date().toISOString()
      }, 422)
    }
    
    // 문서 ID 생성
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
    const documentId = `S-${today}-${randomNum}`
    
    const result = {
      success: true,
      document_id: documentId,
      message: `이카운트 판매전표 (${documentId})가 성공적으로 생성되었습니다.`,
      total_amount: totalAmount,
      items_count: orderData.items.length,
      customer_name: orderData.customer_name,
      created_at: new Date().toISOString()
    }

    return c.json(result)

  } catch (error: any) {
    console.error('ECOUNT Create Order Error:', error)
    return c.json({ 
      success: false,
      error: error.message || '전표 생성 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Fallback route for SPA
app.get('*', async (c) => {
  // This will be handled by Cloudflare Pages static assets
  return c.notFound()
})

export default app
