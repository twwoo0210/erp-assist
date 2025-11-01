
import { z } from 'zod';

// 주문 아이템 스키마
export const OrderItemSchema = z.object({
  item_name: z.string().min(1, '품목명은 필수입니다'),
  qty: z.number().int().positive('수량은 양의 정수여야 합니다'),
  matched_item: z.object({
    code: z.string(),
    name: z.string(),
    price: z.number().nonnegative(),
    unit: z.string().optional()
  }).optional(),
  confidence: z.number().min(0).max(1).optional()
});

// 파싱된 주문 스키마
export const ParsedOrderSchema = z.object({
  customer_name: z.string().min(1, '거래처명은 필수입니다'),
  items: z.array(OrderItemSchema).min(1, '최소 1개 이상의 품목이 필요합니다')
});

// AI 파싱 입력 스키마
export const AIParseInputSchema = z.object({
  inputText: z.string().min(1, '입력 텍스트는 필수입니다').max(1000, '입력 텍스트는 1000자를 초과할 수 없습니다')
});

// 전표 생성 입력 스키마
export const CreateOrderInputSchema = z.object({
  orderData: ParsedOrderSchema
});

// 타입 추출
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type ParsedOrder = z.infer<typeof ParsedOrderSchema>;
export type AIParseInput = z.infer<typeof AIParseInputSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

// 검증 헬퍼 함수
export const validateAIParseInput = (data: unknown): AIParseInput => {
  return AIParseInputSchema.parse(data);
};

export const validateParsedOrder = (data: unknown): ParsedOrder => {
  return ParsedOrderSchema.parse(data);
};

export const validateCreateOrderInput = (data: unknown): CreateOrderInput => {
  return CreateOrderInputSchema.parse(data);
};
