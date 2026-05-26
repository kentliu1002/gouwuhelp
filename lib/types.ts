export type Condition = "全新" | "99新" | "95新" | "90新及以下";
export type HardwareColor = "金色" | "银色";
export type LeatherColor = "原色皮（浅蜂蜜色）" | "深色氧化皮（深棕）";
export type HandleType = "双手提" | "单肩带" | "斜挎带" | "双肩背" | "腰带" | "双手提+肩带" | "手提+斜挎带";
export type ClosureType = "拉链" | "搭扣" | "磁扣" | "敞口";
export type HandleCondition = "无瑕疵" | "轻微氧化" | "明显氧化" | "有污渍" | "皮革开裂";
export type HardwareCondition = "无瑕疵" | "轻微刮痕" | "明显刮痕" | "氧化发黑";
export type ExteriorCondition = "无瑕疵" | "轻微污渍" | "明显污渍" | "边缘磨损";
export type BottomCondition = "无磨损" | "轻微磨损" | "明显磨损";
export type InteriorCondition = "无瑕疵" | "轻微污渍" | "明显污渍" | "内衬脱落";
export type RefurbishStatus = "未翻新" | "手柄已翻新" | "五金已翻新" | "内里已翻新";
export type PurchaseChannel = "国内官方专柜" | "海外官方专柜" | "机场免税店" | "代购" | "来源不明";
export type AuthStatus = "未鉴定" | "已鉴定（附证书）";
export type LockKeyStatus = "齐全" | "仅有锁头" | "无";
export type StrapStatus = "有原配肩带" | "无肩带" | "非原配肩带";

export interface LVStyle {
  nameEn: string;
  nameZh: string;
  category: string;
  sizes: LVSize[];
  isDiscontinued: boolean;
}

export interface LVSize {
  label: string;
  modelNumber: string;
  dimensions: string;
  retailPrice: number | null;
}

export interface Product {
  id: string;
  createdAt: number;
  isAvailable: boolean;

  // AI identified
  styleName: string;
  styleNameZh: string;
  handleType: HandleType;
  closureType: ClosureType;
  hasLock: boolean;
  leatherColor: LeatherColor;
  hardwareColor: HardwareColor;

  // DB lookup + user selected
  modelSize: string;
  modelNumber: string;
  dimensions: string;
  retailPrice: number | null;
  isDiscontinued: boolean;

  // Human judgment
  condition: Condition;
  hasDustBag: boolean;
  hasBox: boolean;
  hasReceipt: boolean;
  lockKeyStatus: LockKeyStatus;
  strapStatus: StrapStatus;
  handleCondition: HandleCondition;
  hardwareCondition: HardwareCondition;
  exteriorCondition: ExteriorCondition;
  bottomCondition: BottomCondition;
  interiorCondition: InteriorCondition;
  refurbishStatus: RefurbishStatus;
  purchaseChannel: PurchaseChannel;
  purchaseYear: number | null;
  authStatus: AuthStatus;

  // Images
  images: string[];

  // AI generated
  description: string;
  promotionalCopy: string;

  // Pricing
  askingPrice: number;
}

export type CreateProductInput = Omit<Product, "id" | "createdAt">;
