import type { LVStyle } from "./types";

export const LV_STYLES: LVStyle[] = [
  // ===== 手提包 =====
  {
    nameEn: "Speedy 25", nameZh: "速递包 25", category: "手提包", isDiscontinued: false,
    sizes: [{ label: "25", modelNumber: "M41528", dimensions: "25×19×15cm", retailPrice: 9700 }],
  },
  {
    nameEn: "Speedy 30", nameZh: "速递包 30", category: "手提包", isDiscontinued: false,
    sizes: [{ label: "30", modelNumber: "M41526", dimensions: "30×21×17cm", retailPrice: 10800 }],
  },
  {
    nameEn: "Speedy 35", nameZh: "速递包 35", category: "手提包", isDiscontinued: false,
    sizes: [{ label: "35", modelNumber: "M41524", dimensions: "35×23×17cm", retailPrice: 11800 }],
  },
  {
    nameEn: "Speedy 40", nameZh: "速递包 40", category: "手提包", isDiscontinued: false,
    sizes: [{ label: "40", modelNumber: "M41522", dimensions: "40×26×20cm", retailPrice: 12500 }],
  },
  {
    nameEn: "Speedy Bandoulière 25", nameZh: "速递背带包 25", category: "手提包", isDiscontinued: false,
    sizes: [{ label: "25", modelNumber: "M41368", dimensions: "25×19×15cm", retailPrice: 11200 }],
  },
  {
    nameEn: "Speedy Bandoulière 30", nameZh: "速递背带包 30", category: "手提包", isDiscontinued: false,
    sizes: [{ label: "30", modelNumber: "M41400", dimensions: "30×21×17cm", retailPrice: 12300 }],
  },
  {
    nameEn: "Speedy Bandoulière 35", nameZh: "速递背带包 35", category: "手提包", isDiscontinued: false,
    sizes: [{ label: "35", modelNumber: "待核实", dimensions: "35×23×17cm", retailPrice: 13000 }],
  },
  {
    nameEn: "Speedy Bandoulière 40", nameZh: "速递背带包 40", category: "手提包", isDiscontinued: false,
    sizes: [{ label: "40", modelNumber: "待核实", dimensions: "40×26×20cm", retailPrice: 13800 }],
  },
  {
    nameEn: "Alma", nameZh: "艾玛", category: "手提包", isDiscontinued: false,
    sizes: [
      { label: "PM", modelNumber: "M53151", dimensions: "31.5×22×15cm", retailPrice: 15500 },
      { label: "MM", modelNumber: "待核实", dimensions: "36×27×17cm", retailPrice: 18500 },
    ],
  },
  {
    nameEn: "Ellipse", nameZh: "椭圆包", category: "手提包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "M51126", dimensions: "28×22×14cm", retailPrice: null },
      { label: "MM", modelNumber: "M51125", dimensions: "34×26×16cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Manhattan", nameZh: "曼哈顿", category: "手提包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "M40026", dimensions: "29×18×8.5cm", retailPrice: null },
      { label: "GM", modelNumber: "M40025", dimensions: "34×21×14cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Lockit Horizontal", nameZh: "锁扣包（横款）", category: "手提包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "待核实", dimensions: "31×23×13cm", retailPrice: null },
      { label: "MM", modelNumber: "待核实", dimensions: "37×28×16cm", retailPrice: null },
      { label: "GM", modelNumber: "待核实", dimensions: "46×34×20cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Lockit Vertical", nameZh: "锁扣包（竖款）", category: "手提包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "待核实", dimensions: "待核实", retailPrice: null },
      { label: "GM", modelNumber: "待核实", dimensions: "待核实", retailPrice: null },
    ],
  },

  // ===== 托特包/购物包 =====
  {
    nameEn: "Neverfull", nameZh: "购物袋", category: "托特包", isDiscontinued: false,
    sizes: [
      { label: "PM", modelNumber: "M40155", dimensions: "29.5×24×12cm", retailPrice: 12500 },
      { label: "MM", modelNumber: "M40156", dimensions: "31×28×14cm", retailPrice: 13800 },
      { label: "GM", modelNumber: "M40157", dimensions: "39×29×17cm", retailPrice: 15100 },
    ],
  },
  {
    nameEn: "Sac Plat", nameZh: "平板购物袋", category: "托特包", isDiscontinued: false,
    sizes: [
      { label: "Mini", modelNumber: "待核实", dimensions: "23×22×7cm", retailPrice: 7500 },
      { label: "BB", modelNumber: "待核实", dimensions: "30×26×11cm", retailPrice: 9500 },
      { label: "PM", modelNumber: "M13005", dimensions: "37×37×14cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Artsy", nameZh: "艺术家包", category: "托特包", isDiscontinued: true,
    sizes: [
      { label: "MM", modelNumber: "M40249", dimensions: "42×33×16cm", retailPrice: null },
      { label: "GM", modelNumber: "M40250", dimensions: "48×37×17cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Delightful", nameZh: "购物包", category: "托特包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "M40351", dimensions: "27×34×11cm", retailPrice: null },
      { label: "MM", modelNumber: "M40352", dimensions: "37×30×11cm", retailPrice: null },
      { label: "GM", modelNumber: "M40353", dimensions: "43×33×12cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Tivoli", nameZh: "蒂沃利", category: "托特包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "M40143", dimensions: "29×22×11cm", retailPrice: null },
      { label: "GM", modelNumber: "M40144", dimensions: "36×29×13cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Montorgueil", nameZh: "蒙托格伊", category: "托特包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "M95565", dimensions: "33×27×11cm", retailPrice: null },
      { label: "GM", modelNumber: "M95566", dimensions: "40×33×13cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Totally", nameZh: "托特利", category: "托特包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "M56688", dimensions: "27×29×12cm", retailPrice: null },
      { label: "MM", modelNumber: "M56689", dimensions: "33×37×13cm", retailPrice: null },
      { label: "GM", modelNumber: "M56690", dimensions: "38×42×15cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Batignolles Horizontal", nameZh: "巴蒂尼奥勒（横款）", category: "托特包", isDiscontinued: true,
    sizes: [{ label: "标准款", modelNumber: "M51154", dimensions: "38×25×15cm", retailPrice: null }],
  },
  {
    nameEn: "Batignolles Vertical", nameZh: "巴蒂尼奥勒（竖款）", category: "托特包", isDiscontinued: true,
    sizes: [{ label: "标准款", modelNumber: "M51153", dimensions: "33×32×14cm", retailPrice: null }],
  },
  {
    nameEn: "Batignolles", nameZh: "巴蒂尼奥勒", category: "托特包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "待核实", dimensions: "待核实", retailPrice: null },
      { label: "MM", modelNumber: "待核实", dimensions: "待核实", retailPrice: null },
      { label: "GM", modelNumber: "待核实", dimensions: "待核实", retailPrice: null },
    ],
  },
  {
    nameEn: "Cabas Piano", nameZh: "钢琴托特", category: "托特包", isDiscontinued: true,
    sizes: [{ label: "标准款", modelNumber: "M51148", dimensions: "40×30×14cm", retailPrice: null }],
  },
  {
    nameEn: "Cabas Mezzo", nameZh: "中号托特", category: "托特包", isDiscontinued: true,
    sizes: [{ label: "标准款", modelNumber: "M51151", dimensions: "50×35×20cm", retailPrice: null }],
  },
  {
    nameEn: "Luco", nameZh: "卢科托特", category: "托特包", isDiscontinued: true,
    sizes: [{ label: "标准款", modelNumber: "M51155", dimensions: "35×28×8cm", retailPrice: null }],
  },

  // ===== 单肩包/斜挎包 =====
  {
    nameEn: "Pochette Accessoires", nameZh: "小手包（标准款）", category: "单肩包", isDiscontinued: false,
    sizes: [{ label: "标准款", modelNumber: "M40712", dimensions: "26×14×5cm", retailPrice: 6500 }],
  },
  {
    nameEn: "Pochette Accessoires NM", nameZh: "小手包（新款）", category: "单肩包", isDiscontinued: false,
    sizes: [{ label: "NM", modelNumber: "待核实", dimensions: "25.5×14.5×7cm", retailPrice: 6800 }],
  },
  {
    nameEn: "Pochette Métis", nameZh: "梅蒂斯翻盖包", category: "单肩包", isDiscontinued: false,
    sizes: [{ label: "标准款", modelNumber: "M44875", dimensions: "25×19×7cm", retailPrice: 19000 }],
  },
  {
    nameEn: "Pochette Métis East West", nameZh: "梅蒂斯横版包", category: "单肩包", isDiscontinued: false,
    sizes: [{ label: "East West", modelNumber: "M45596", dimensions: "27×13×5cm", retailPrice: 17500 }],
  },
  {
    nameEn: "Multi Pochette Accessoires", nameZh: "多口袋斜挎包", category: "单肩包", isDiscontinued: false,
    sizes: [{ label: "标准款", modelNumber: "M44840", dimensions: "组合款", retailPrice: 17000 }],
  },
  {
    nameEn: "Félicie Pochette", nameZh: "菲丽链条包", category: "单肩包", isDiscontinued: false,
    sizes: [{ label: "标准款", modelNumber: "M61276", dimensions: "21×12×3cm", retailPrice: 9500 }],
  },
  {
    nameEn: "Favorite", nameZh: "最爱", category: "单肩包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "M40717", dimensions: "24×13×4cm", retailPrice: null },
      { label: "MM", modelNumber: "M40718", dimensions: "27×16×6cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Eva Clutch", nameZh: "伊娃手拿包", category: "单肩包", isDiscontinued: true,
    sizes: [{ label: "标准款", modelNumber: "M95567", dimensions: "25×15×6cm", retailPrice: null }],
  },
  {
    nameEn: "Turenne", nameZh: "图兰", category: "单肩包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "M48813", dimensions: "28×20×10cm", retailPrice: null },
      { label: "MM", modelNumber: "M48814", dimensions: "34×23×12cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Pallas", nameZh: "帕拉斯", category: "单肩包", isDiscontinued: true,
    sizes: [{ label: "标准款", modelNumber: "M41064", dimensions: "36×26×12cm", retailPrice: null }],
  },
  {
    nameEn: "Musette Salsa（短背带）", nameZh: "莎莎单肩包（短带）", category: "单肩包", isDiscontinued: true,
    sizes: [{ label: "短背带", modelNumber: "M51258", dimensions: "24×20×7cm", retailPrice: null }],
  },
  {
    nameEn: "Musette Salsa（长背带）", nameZh: "莎莎单肩包（长带）", category: "单肩包", isDiscontinued: true,
    sizes: [{ label: "长背带", modelNumber: "M51387", dimensions: "24×20×7cm", retailPrice: null }],
  },
  {
    nameEn: "Musette Tango", nameZh: "探戈单肩包", category: "单肩包", isDiscontinued: true,
    sizes: [{ label: "标准款", modelNumber: "M42242", dimensions: "27×18×5cm", retailPrice: null }],
  },
  {
    nameEn: "Reporter", nameZh: "记者包", category: "单肩包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "待核实", dimensions: "27×21×10cm", retailPrice: null },
      { label: "GM", modelNumber: "待核实", dimensions: "35×28×14cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Naviglio", nameZh: "纳维利奥", category: "单肩包", isDiscontinued: true,
    sizes: [{ label: "标准款", modelNumber: "M40097", dimensions: "35×25×11cm", retailPrice: null }],
  },
  {
    nameEn: "Popincourt", nameZh: "波潘古", category: "单肩包", isDiscontinued: true,
    sizes: [{ label: "标准款", modelNumber: "M40007", dimensions: "24×20×9cm", retailPrice: null }],
  },
  {
    nameEn: "Popincourt Haut", nameZh: "波潘古竖款", category: "单肩包", isDiscontinued: true,
    sizes: [{ label: "Haut", modelNumber: "M40009", dimensions: "25×26×8cm", retailPrice: null }],
  },

  // ===== 水桶包 =====
  {
    nameEn: "Noé", nameZh: "诺伊水桶包", category: "水桶包", isDiscontinued: false,
    sizes: [
      { label: "BB", modelNumber: "M44022", dimensions: "22×26×15cm", retailPrice: 12800 },
      { label: "PM", modelNumber: "M44021", dimensions: "27×31×18cm", retailPrice: 14500 },
      { label: "GM", modelNumber: "待核实", dimensions: "36×40×24cm", retailPrice: 17000 },
    ],
  },
  {
    nameEn: "Petit Noé", nameZh: "小诺伊水桶包", category: "水桶包", isDiscontinued: true,
    sizes: [{ label: "标准款", modelNumber: "M42226", dimensions: "27×31×17cm", retailPrice: null }],
  },

  // ===== 双肩包 =====
  {
    nameEn: "Palm Springs", nameZh: "棕榈泉双肩包", category: "双肩包", isDiscontinued: false,
    sizes: [
      { label: "Mini", modelNumber: "M41562", dimensions: "22×25×12cm", retailPrice: 13500 },
      { label: "PM", modelNumber: "M41560", dimensions: "28×32×15cm", retailPrice: 16500 },
      { label: "MM", modelNumber: "待核实", dimensions: "待核实", retailPrice: null },
      { label: "Backpack", modelNumber: "M44874", dimensions: "42×31×18cm", retailPrice: 21000 },
    ],
  },
  {
    nameEn: "Montsouris", nameZh: "蒙苏里双肩包", category: "双肩包", isDiscontinued: true,
    sizes: [
      { label: "BB", modelNumber: "M51136", dimensions: "26×31×15cm", retailPrice: null },
      { label: "PM", modelNumber: "M51135", dimensions: "28×33×18cm", retailPrice: null },
      { label: "MM", modelNumber: "M51131", dimensions: "31×37×20cm", retailPrice: null },
    ],
  },
  {
    nameEn: "Sac à Dos PM", nameZh: "经典双肩包", category: "双肩包", isDiscontinued: true,
    sizes: [{ label: "PM", modelNumber: "M51132", dimensions: "27×32×15cm", retailPrice: null }],
  },

  // ===== 腰包 =====
  {
    nameEn: "Bum Bag", nameZh: "腰包", category: "腰包", isDiscontinued: true,
    sizes: [
      { label: "PM", modelNumber: "M43644", dimensions: "30×17×10cm", retailPrice: null },
      { label: "GM", modelNumber: "M43645", dimensions: "37×21×13cm", retailPrice: null },
    ],
  },

  // ===== 旅行袋 =====
  {
    nameEn: "Keepall 45", nameZh: "旅行袋 45（无背带）", category: "旅行袋", isDiscontinued: false,
    sizes: [{ label: "45", modelNumber: "M41428", dimensions: "45×27×20cm", retailPrice: 12500 }],
  },
  {
    nameEn: "Keepall 50", nameZh: "旅行袋 50（无背带）", category: "旅行袋", isDiscontinued: false,
    sizes: [{ label: "50", modelNumber: "M41426", dimensions: "50×29×23cm", retailPrice: 13500 }],
  },
  {
    nameEn: "Keepall 55", nameZh: "旅行袋 55（无背带）", category: "旅行袋", isDiscontinued: false,
    sizes: [{ label: "55", modelNumber: "M41424", dimensions: "55×31×24cm", retailPrice: 15000 }],
  },
  {
    nameEn: "Keepall 60", nameZh: "旅行袋 60（无背带）", category: "旅行袋", isDiscontinued: false,
    sizes: [{ label: "60", modelNumber: "M41422", dimensions: "60×33×26cm", retailPrice: 16500 }],
  },
  {
    nameEn: "Keepall Bandoulière 45", nameZh: "旅行袋 45（带背带）", category: "旅行袋", isDiscontinued: false,
    sizes: [{ label: "45", modelNumber: "M41418", dimensions: "45×27×20cm", retailPrice: 15000 }],
  },
  {
    nameEn: "Keepall Bandoulière 50", nameZh: "旅行袋 50（带背带）", category: "旅行袋", isDiscontinued: false,
    sizes: [{ label: "50", modelNumber: "M41416", dimensions: "50×29×23cm", retailPrice: 16000 }],
  },
  {
    nameEn: "Keepall Bandoulière 55", nameZh: "旅行袋 55（带背带）", category: "旅行袋", isDiscontinued: false,
    sizes: [{ label: "55", modelNumber: "M41414", dimensions: "55×31×24cm", retailPrice: 17500 }],
  },
  {
    nameEn: "Keepall Bandoulière 60", nameZh: "旅行袋 60（带背带）", category: "旅行袋", isDiscontinued: false,
    sizes: [{ label: "60", modelNumber: "M41412", dimensions: "60×33×26cm", retailPrice: 19000 }],
  },
];

export function getStyleByName(nameEn: string): LVStyle | undefined {
  return LV_STYLES.find((s) => s.nameEn === nameEn);
}

export const CATEGORIES = [...new Set(LV_STYLES.map((s) => s.category))];
