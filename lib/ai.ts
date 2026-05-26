import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY!,
  baseURL: process.env.AI_BASE_URL,
});

const MODEL = process.env.AI_MODEL ?? "qwen3.6-plus";

export interface IdentifyResult {
  styleName: string;
  styleNameZh: string;
  handleType: string;
  closureType: string;
  hasLock: boolean;
  leatherColor: string;
  hardwareColor: string;
  confidence: string;
}

export async function identifyBag(imageUrls: string[]): Promise<IdentifyResult> {
  const imageContent = imageUrls.map((url) => ({
    type: "image_url" as const,
    image_url: { url },
  }));

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `你是一位专业的奢侈品鉴定师，专门鉴定路易威登（Louis Vuitton）经典老花（Monogram Canvas）包袋。
根据用户提供的包袋图片，识别并输出以下信息（JSON格式，不要输出任何其他内容）：
{
  "styleName": "英文款式名，如 Neverfull、Speedy 30、Alma 等",
  "styleNameZh": "中文款式名，如 购物袋、速递包 30、艾玛 等",
  "handleType": "手柄类型，从以下选项中选择：双手提、单肩带、斜挎带、双肩背、腰带、双手提+肩带、手提+斜挎带",
  "closureType": "开合方式，从以下选项中选择：拉链、搭扣、磁扣、敞口",
  "hasLock": true或false，是否有锁扣,
  "leatherColor": "皮革配件颜色，从以下选项中选择：原色皮（浅蜂蜜色）、深色氧化皮（深棕）",
  "hardwareColor": "五金颜色，从以下选项中选择：金色、银色",
  "confidence": "识别置信度：高、中、低"
}`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: "请识别这款LV老花包袋的型号和特征：" },
          ...imageContent,
        ],
      },
    ],
    max_tokens: 500,
    ...({ extra_body: { enable_thinking: false } } as object),
  });

  const text = response.choices[0]?.message?.content ?? "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI返回格式错误");
  return JSON.parse(jsonMatch[0]) as IdentifyResult;
}

export async function generateDescription(product: {
  styleName: string;
  styleNameZh: string;
  modelSize: string;
  modelNumber: string;
  dimensions: string;
  condition: string;
  askingPrice: number;
  retailPrice: number | null;
  hasDustBag: boolean;
  hasBox: boolean;
  hasReceipt: boolean;
  handleCondition: string;
  hardwareCondition: string;
  exteriorCondition: string;
  bottomCondition: string;
  interiorCondition: string;
  refurbishStatus: string;
  purchaseChannel: string;
}): Promise<{ description: string; promotionalCopy: string }> {
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `你是一位奢侈品二手交易平台的专业文案写手，擅长为LV二手包袋撰写商品描述和促销话术。
语言风格：专业、真实、有吸引力，不夸大不失实。面向中国消费者，语言流畅自然。`,
      },
      {
        role: "user",
        content: `请根据以下商品信息，生成商品描述和促销话术，以JSON格式输出（不要输出任何其他内容）：

商品信息：
- 款式：Louis Vuitton ${product.styleName}（${product.styleNameZh}）${product.modelSize ? ` ${product.modelSize}` : ""}
- 货号：${product.modelNumber}
- 尺寸：${product.dimensions}
- 成色：${product.condition}
- 随附配件：${[product.hasDustBag && "防尘袋", product.hasBox && "原装盒", product.hasReceipt && "购物凭证"].filter(Boolean).join("、") || "无"}
- 手柄状态：${product.handleCondition}
- 五金状态：${product.hardwareCondition}
- 包体外观：${product.exteriorCondition}
- 包底状态：${product.bottomCondition}
- 内里状态：${product.interiorCondition}
- 翻新情况：${product.refurbishStatus}
- 购买渠道：${product.purchaseChannel}
- 售价：¥${product.askingPrice.toLocaleString()}${product.retailPrice ? `（官方零售价约¥${product.retailPrice.toLocaleString()}）` : ""}

输出格式：
{
  "description": "商品描述（150-250字，详细客观描述包袋状态、配件、来源等）",
  "promotionalCopy": "促销话术（50-80字，突出性价比和产品亮点，吸引买家）"
}`,
      },
    ],
    max_tokens: 800,
    ...({ extra_body: { enable_thinking: false } } as object),
  });

  const text = stream.choices[0]?.message?.content ?? "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI返回格式错误");
  return JSON.parse(jsonMatch[0]) as { description: string; promotionalCopy: string };
}
