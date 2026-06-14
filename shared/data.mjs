// 纯数据常量，无 IO，Node 与 Worker 通用。

export const FIFA_API =
  "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&from=2026-06-11&to=2026-07-20&idCompetition=17";

export const TEAM_ZH = {
  ALG: "阿尔及利亚", ARG: "阿根廷", AUS: "澳大利亚", AUT: "奥地利",
  BEL: "比利时", BIH: "波黑", BRA: "巴西", CAN: "加拿大",
  CIV: "科特迪瓦", COD: "民主刚果", COL: "哥伦比亚", CPV: "佛得角",
  CRO: "克罗地亚", CUW: "库拉索", CZE: "捷克", ECU: "厄瓜多尔",
  EGY: "埃及", ENG: "英格兰", ESP: "西班牙", FRA: "法国",
  GER: "德国", GHA: "加纳", HAI: "海地", IRN: "伊朗",
  IRQ: "伊拉克", JOR: "约旦", JPN: "日本", KOR: "韩国",
  KSA: "沙特阿拉伯", MAR: "摩洛哥", MEX: "墨西哥", NED: "荷兰",
  NOR: "挪威", NZL: "新西兰", PAN: "巴拿马", PAR: "巴拉圭",
  POR: "葡萄牙", QAT: "卡塔尔", RSA: "南非", SCO: "苏格兰",
  SEN: "塞内加尔", SUI: "瑞士", SWE: "瑞典", TUN: "突尼斯",
  TUR: "土耳其", URU: "乌拉圭", USA: "美国", UZB: "乌兹别克斯坦",
  TBD: "待定"
};

const ENGLAND_FLAG = String.fromCodePoint(0x1f3f4, 0xe0067, 0xe0062, 0xe0065, 0xe006e, 0xe0067, 0xe007f);
const SCOTLAND_FLAG = String.fromCodePoint(0x1f3f4, 0xe0067, 0xe0062, 0xe0073, 0xe0063, 0xe0074, 0xe007f);

export const FLAG_EMOJI = {
  ALG: "🇩🇿", ARG: "🇦🇷", AUS: "🇦🇺", AUT: "🇦🇹",
  BEL: "🇧🇪", BIH: "🇧🇦", BRA: "🇧🇷", CAN: "🇨🇦",
  CIV: "🇨🇮", COD: "🇨🇩", COL: "🇨🇴", CPV: "🇨🇻",
  CRO: "🇭🇷", CUW: "🇨🇼", CZE: "🇨🇿", ECU: "🇪🇨",
  EGY: "🇪🇬", ENG: ENGLAND_FLAG, ESP: "🇪🇸", FRA: "🇫🇷",
  GER: "🇩🇪", GHA: "🇬🇭", HAI: "🇭🇹", IRN: "🇮🇷",
  IRQ: "🇮🇶", JOR: "🇯🇴", JPN: "🇯🇵", KOR: "🇰🇷",
  KSA: "🇸🇦", MAR: "🇲🇦", MEX: "🇲🇽", NED: "🇳🇱",
  NOR: "🇳🇴", NZL: "🇳🇿", PAN: "🇵🇦", PAR: "🇵🇾",
  POR: "🇵🇹", QAT: "🇶🇦", RSA: "🇿🇦", SCO: SCOTLAND_FLAG,
  SEN: "🇸🇳", SUI: "🇨🇭", SWE: "🇸🇪", TBD: "◇",
  TUN: "🇹🇳", TUR: "🇹🇷", URU: "🇺🇾", USA: "🇺🇸", UZB: "🇺🇿"
};

export const TEAM_PROFILES = {
  ALG: { confederation: "非洲 CAF", intro: "阿尔及利亚身体对抗强、转换速度快，常在高强度比赛里制造压迫和二点球优势。", highlights: ["边路推进和定位球是重要得分方式。", "面对技术型强队时，防线纪律和反击效率会决定上限。", "小组赛每一分都很关键。"] },
  ARG: { confederation: "南美 CONMEBOL", intro: "阿根廷是卫冕冠军，控球、节奏变化和关键球员个人能力仍是最大看点。", highlights: ["卫冕压力与阵容更新之间的平衡。", "中前场小范围配合能否持续撕开密集防守。", "淘汰赛经验丰富，是争冠观察重点。"] },
  AUS: { confederation: "亚洲 AFC", intro: "澳大利亚以身体强度、空中对抗和执行力见长，比赛风格直接而务实。", highlights: ["定位球和边路传中威胁稳定。", "面对控球强队时，防守站位和反击第一脚很关键。", "小组赛抗压能力值得关注。"] },
  AUT: { confederation: "欧洲 UEFA", intro: "奥地利整体压迫和中场覆盖能力突出，擅长把比赛带入高节奏对抗。", highlights: ["前场压迫后的就地反抢。", "中场体能和跑动质量是比赛基底。", "对强队时能否把压迫转化为进球机会。"] },
  BEL: { confederation: "欧洲 UEFA", intro: "比利时仍具备成熟的进攻组织和高水平个人能力，新老交替效果是核心悬念。", highlights: ["中前场创造力与防线稳定性的平衡。", "面对低位防守时的破局效率。", "关键球员健康和状态会显著影响走势。"] },
  BIH: { confederation: "欧洲 UEFA", intro: "波黑技术细腻，前场有支点和终结能力，适合打出有层次的阵地进攻。", highlights: ["中锋支点和二线插上配合。", "防守转换速度是需要观察的环节。", "若能控制比赛节奏，有机会制造惊喜。"] },
  BRA: { confederation: "南美 CONMEBOL", intro: "巴西天赋厚度和边路爆点仍然亮眼，攻防转换质量决定能走多远。", highlights: ["边锋一对一和禁区前沿创造力。", "中后场保护与反击防守。", "世界杯传统豪门，任何阶段都是焦点。"] },
  CAN: { confederation: "中北美及加勒比 CONCACAF", intro: "加拿大主场作战，速度、冲击力和主场氛围会给比赛带来很强变量。", highlights: ["主场第一场的情绪和节奏管理。", "边路速度是主要武器。", "能否把冲击力转化为稳定得分机会。"] },
  CIV: { confederation: "非洲 CAF", intro: "科特迪瓦身体素质出色，前场冲击强，比赛中经常依靠个人能力打开局面。", highlights: ["前锋和边路球员的单点爆破。", "中场防守覆盖决定比赛稳定性。", "面对欧洲球队时的节奏适应。"] },
  COD: { confederation: "非洲 CAF", intro: "民主刚果对抗能力强，比赛风格直接，若能提升攻防衔接会很难缠。", highlights: ["反击速度和禁区冲击。", "定位球攻防可能影响关键比分。", "首次阶段的心理稳定性值得关注。"] },
  COL: { confederation: "南美 CONMEBOL", intro: "哥伦比亚技术与身体结合出色，前场灵感和中场对抗都有很高观赏性。", highlights: ["中前场创造力是最大看点。", "转换进攻速度快，适合开放比赛。", "面对高压球队时的出球质量。"] },
  CPV: { confederation: "非洲 CAF", intro: "佛得角是扩军世界杯背景下的代表性新力量，整体纪律和反击效率值得关注。", highlights: ["队史大赛舞台的表现。", "防守组织和快速推进。", "面对强队时能否把握少数机会。"] },
  CRO: { confederation: "欧洲 UEFA", intro: "克罗地亚大赛经验丰富，中场控节奏能力长期稳定，是淘汰赛气质很强的球队。", highlights: ["中场传控和比赛降速能力。", "老将经验与新生力量衔接。", "胶着比赛中的心理优势。"] },
  CUW: { confederation: "中北美及加勒比 CONCACAF", intro: "库拉索是本届的黑马观察对象，阵容国际化，比赛态度积极。", highlights: ["首次世界杯阶段的适应速度。", "防守紧凑度和反击质量。", "面对传统强队时的抗压表现。"] },
  CZE: { confederation: "欧洲 UEFA", intro: "捷克注重整体、防守和定位球，比赛风格硬朗，常能把对手拖入消耗战。", highlights: ["定位球和禁区争顶。", "中后场纪律性。", "面对速度型球队时的回追保护。"] },
  ECU: { confederation: "南美 CONMEBOL", intro: "厄瓜多尔年轻、冲击力强，中后场运动能力突出，适合高强度比赛。", highlights: ["身体和速度带来的压迫感。", "年轻球员在大赛中的成熟度。", "攻防转换是主要看点。"] },
  EGY: { confederation: "非洲 CAF", intro: "埃及防守组织成熟，前场关键球员能决定比赛，整体打法务实高效。", highlights: ["反击中的最后一传和终结。", "防守阵型保持能力。", "关键球员能否在强对抗中持续输出。"] },
  ENG: { confederation: "欧洲 UEFA", intro: "英格兰阵容深度突出，前场选择丰富，争冠预期和临场调度是最大话题。", highlights: ["豪华攻击线如何组合。", "中场控制和边后卫使用。", "淘汰赛心理压力仍是焦点。"] },
  ESP: { confederation: "欧洲 UEFA", intro: "西班牙以传控和高位压迫见长，年轻攻击手让球队更具纵向速度。", highlights: ["控球优势能否转化为高质量射门。", "边路突破和中路渗透的结合。", "面对直接打法时的防守转换。"] },
  FRA: { confederation: "欧洲 UEFA", intro: "法国阵容天赋和厚度顶级，速度、力量与个人能力构成稳定争冠底盘。", highlights: ["反击速度和前场终结。", "多位置人才储备带来的战术弹性。", "强强对话中的控制力。"] },
  GER: { confederation: "欧洲 UEFA", intro: "德国注重整体和战术执行，阵容更新后的稳定性是本届核心观察点。", highlights: ["中场组织和前场压迫。", "面对密集防守时的效率。", "大赛经验与年轻活力的结合。"] },
  GHA: { confederation: "非洲 CAF", intro: "加纳身体能力强，比赛开放度高，前场冲击和中场硬度都很鲜明。", highlights: ["速度型进攻能否打穿防线。", "防守专注度会影响比赛波动。", "非洲劲旅的淘汰赛竞争力。"] },
  HAI: { confederation: "中北美及加勒比 CONCACAF", intro: "海地重返大赛舞台，身体冲击和团队韧性会是他们争分的基础。", highlights: ["弱势局面下的防守韧性。", "边路推进和快速反击。", "队史叙事本身就是看点。"] },
  IRN: { confederation: "亚洲 AFC", intro: "伊朗防守扎实、反击效率高，是亚洲球队中大赛经验最稳定的代表之一。", highlights: ["低位防守后的快速出球。", "锋线把握机会能力。", "面对强队时的比赛耐心。"] },
  IRQ: { confederation: "亚洲 AFC", intro: "伊拉克技术和斗志兼具，若能保持防守稳定，具备搅动小组格局的能力。", highlights: ["中前场灵活配合。", "比赛情绪和节奏控制。", "对抗强队时的防线耐心。"] },
  JOR: { confederation: "亚洲 AFC", intro: "约旦近年来竞争力提升明显，防守反击清晰，团队执行力强。", highlights: ["亚洲新势力在世界杯舞台的表现。", "快速反击和边路传中。", "面对强队时能否保持阵型紧凑。"] },
  JPN: { confederation: "亚洲 AFC", intro: "日本技术细腻、整体成熟，快速传接和高强度跑动让他们很具竞争力。", highlights: ["中场压迫和小范围配合。", "旅欧球员带来的阵容厚度。", "亚洲球队冲击更高阶段的代表。"] },
  KOR: { confederation: "亚洲 AFC", intro: "韩国跑动能力强，攻防节奏快，前场核心的个人能力是重要变量。", highlights: ["快速转换和前场冲刺。", "高强度跑动能否持续 90 分钟。", "关键球员状态影响上限。"] },
  KSA: { confederation: "亚洲 AFC", intro: "沙特技术风格鲜明，敢于控球和前压，大赛中具备制造冷门的历史经验。", highlights: ["中场控球与防线身后保护。", "面对强压时的出球稳定性。", "亚洲球队之间的横向比较。"] },
  MAR: { confederation: "非洲 CAF", intro: "摩洛哥延续强硬防守和快速转换风格，团队纪律性和大赛自信非常突出。", highlights: ["防守体系的延续性。", "边路推进和反击效率。", "能否复制上届深度晋级表现。"] },
  MEX: { confederation: "中北美及加勒比 CONCACAF", intro: "墨西哥主场作战，技术、节奏和球迷氛围都将成为揭幕阶段的重要看点。", highlights: ["揭幕战带来的巨大关注度。", "主场压力和情绪管理。", "中前场创造力能否稳定输出。"] },
  NED: { confederation: "欧洲 UEFA", intro: "荷兰身体条件、后防质量和边路推进兼备，整体结构感很强。", highlights: ["三线均衡度和防线压迫范围。", "边翼卫或边锋的推进选择。", "淘汰赛对抗强队时的韧性。"] },
  NOR: { confederation: "欧洲 UEFA", intro: "挪威锋线冲击力极强，进攻端明星效应明显，是本届最受关注的欧洲球队之一。", highlights: ["强力中锋和中场输送的连接。", "防守端能否支撑高目标。", "面对顶级防线时的破门方式。"] },
  NZL: { confederation: "大洋洲 OFC", intro: "新西兰身体对抗和空中能力突出，比赛方式简洁，定位球很重要。", highlights: ["禁区争顶和定位球质量。", "防守阵型能否顶住持续压力。", "大洋洲代表的竞争力检验。"] },
  PAN: { confederation: "中北美及加勒比 CONCACAF", intro: "巴拿马团队性强，作风硬朗，擅长把比赛带入高对抗和高消耗。", highlights: ["中后场纪律和身体对抗。", "边路反击速度。", "面对强队时的定位球机会。"] },
  PAR: { confederation: "南美 CONMEBOL", intro: "巴拉圭防守传统强硬，比赛韧性足，常能在胶着局里寻找机会。", highlights: ["防守硬度和定位球。", "低比分比赛中的耐心。", "南美对抗风格的代表。"] },
  POR: { confederation: "欧洲 UEFA", intro: "葡萄牙阵容技术含量高，前场选择丰富，攻势足球和代际交替都很有话题。", highlights: ["攻击线组合和球权分配。", "中场创造力极强。", "明星球员的大赛叙事。"] },
  QAT: { confederation: "亚洲 AFC", intro: "卡塔尔技术风格偏细，团队磨合时间长，亚洲杯经验能帮助他们应对大赛。", highlights: ["控球时的耐心组织。", "面对高压时的抗压出球。", "与同组强队的节奏差异。"] },
  RSA: { confederation: "非洲 CAF", intro: "南非速度和活力突出，揭幕战即登场，比赛关注度很高。", highlights: ["揭幕战压力下的执行力。", "前场速度能否制造空间。", "防线面对主场球队时的稳定性。"] },
  SCO: { confederation: "欧洲 UEFA", intro: "苏格兰对抗强、团队性鲜明，中场拼抢和边路冲击是传统优势。", highlights: ["身体对抗和二点球争夺。", "边路传中质量。", "面对技术型球队时的压迫强度。"] },
  SEN: { confederation: "非洲 CAF", intro: "塞内加尔身体、速度和大赛经验兼备，是非洲球队中竞争力最稳定的一支。", highlights: ["攻防两端身体优势明显。", "边路爆点和中路冲击。", "淘汰赛潜力值得重点看。"] },
  SUI: { confederation: "欧洲 UEFA", intro: "瑞士整体稳定、纪律性强，常在大赛中展现很高的下限。", highlights: ["防守组织和中场平衡。", "关键比赛里的抗压经验。", "阵地战效率决定上限。"] },
  SWE: { confederation: "欧洲 UEFA", intro: "瑞典身体条件好、结构清晰，擅长防守组织和直接进攻。", highlights: ["定位球和禁区对抗。", "防线整体移动。", "进攻端效率是突破关键。"] },
  TUN: { confederation: "非洲 CAF", intro: "突尼斯防守强度和团队纪律突出，比赛风格务实，常让强队踢得不舒服。", highlights: ["防守阵型和中场拦截。", "快速反击的第一脚处理。", "小组赛争分能力很关键。"] },
  TUR: { confederation: "欧洲 UEFA", intro: "土耳其年轻活力和进攻激情兼具，比赛情绪浓度高，观赏性强。", highlights: ["年轻球员创造力。", "高节奏进攻带来的波动。", "领先或落后时的情绪管理。"] },
  URU: { confederation: "南美 CONMEBOL", intro: "乌拉圭对抗强硬、转换犀利，兼具传统斗志和现代压迫打法。", highlights: ["高强度逼抢和快速推进。", "锋线终结能力。", "强强对话里的身体对抗。"] },
  USA: { confederation: "中北美及加勒比 CONCACAF", intro: "美国主场作战，阵容年轻且速度快，主场表现会直接影响赛事热度。", highlights: ["主场优势和年轻阵容能量。", "中前场速度冲击。", "关键战中的经验和稳定性。"] },
  UZB: { confederation: "亚洲 AFC", intro: "乌兹别克斯坦首次登上世界杯正赛舞台，技术基础扎实，团队执行力强。", highlights: ["队史首次世界杯的表现。", "中场组织和防守纪律。", "面对高强度压迫时的适应。"] }
};

export const TEAM_EXTRAS = {
  ALG: { tier: "非洲劲旅", starPlayers: ["里亚德·马赫雷斯", "伊斯梅尔·本纳塞尔", "拉米·本塞拜尼"] },
  ARG: { tier: "卫冕冠军 / 争冠热门", starPlayers: ["利昂内尔·梅西", "劳塔罗·马丁内斯", "恩佐·费尔南德斯", "亚历克西斯·麦卡利斯特"] },
  AUS: { tier: "亚洲硬朗派", starPlayers: ["马修·瑞安", "杰克逊·欧文", "哈里·苏塔"] },
  AUT: { tier: "欧洲强队", starPlayers: ["大卫·阿拉巴", "马塞尔·萨比策", "克里斯托夫·鲍姆加特纳"] },
  BEL: { tier: "欧洲强队", starPlayers: ["凯文·德布劳内", "罗梅卢·卢卡库", "杰里米·多库"] },
  BIH: { tier: "欧洲挑战者", starPlayers: ["埃丁·哲科", "米拉莱姆·皮亚尼奇", "阿内尔·艾哈迈德霍季奇"] },
  BRA: { tier: "传统豪门 / 争冠热门", starPlayers: ["维尼修斯", "罗德里戈", "内马尔", "阿利松"] },
  CAN: { tier: "东道主 / 潜在黑马", starPlayers: ["阿方索·戴维斯", "乔纳森·戴维", "斯蒂芬·欧斯塔基奥"] },
  CIV: { tier: "非洲强队", starPlayers: ["塞巴斯蒂安·阿莱", "弗兰克·凯西", "奥迪隆·科苏努"] },
  COD: { tier: "非洲挑战者", starPlayers: ["约安·维萨", "尚塞尔·姆本巴", "塞德里克·巴坎布"] },
  COL: { tier: "南美强队 / 潜在黑马", starPlayers: ["路易斯·迪亚斯", "哈梅斯·罗德里格斯", "约翰·杜兰"] },
  CPV: { tier: "世界杯新军", starPlayers: ["贝贝", "瑞安·门德斯", "加里·罗德里格斯"] },
  CRO: { tier: "大赛型强队", starPlayers: ["卢卡·莫德里奇", "马特奥·科瓦契奇", "约什科·格瓦迪奥尔"] },
  CUW: { tier: "世界杯新军 / 黑马观察", starPlayers: ["莱安德罗·巴库纳", "容·巴库纳", "库科·马蒂纳"] },
  CZE: { tier: "欧洲硬朗派", starPlayers: ["帕特里克·希克", "托马什·绍切克", "安东宁·巴拉克"] },
  ECU: { tier: "南美潜力股", starPlayers: ["莫伊塞斯·凯塞多", "皮耶罗·因卡皮耶", "恩纳·瓦伦西亚"] },
  EGY: { tier: "非洲强队", starPlayers: ["穆罕默德·萨拉赫", "奥马尔·马尔穆什", "穆罕默德·埃尔内尼"] },
  ENG: { tier: "争冠热门", starPlayers: ["哈里·凯恩", "裘德·贝林厄姆", "布卡约·萨卡", "菲尔·福登"] },
  ESP: { tier: "争冠热门", starPlayers: ["罗德里", "拉明·亚马尔", "佩德里", "尼科·威廉姆斯"] },
  FRA: { tier: "争冠热门", starPlayers: ["基利安·姆巴佩", "奥斯曼·登贝莱", "安托万·格列兹曼", "威廉·萨利巴"] },
  GER: { tier: "传统豪门 / 强队", starPlayers: ["贾马尔·穆西亚拉", "弗洛里安·维尔茨", "约书亚·基米希", "曼努埃尔·诺伊尔"] },
  GHA: { tier: "非洲劲旅", starPlayers: ["穆罕默德·库杜斯", "托马斯·帕尔特伊", "伊尼亚基·威廉姆斯"] },
  HAI: { tier: "中北美挑战者", starPlayers: ["达克恩斯·纳宗", "弗朗茨迪·皮埃罗", "让-里克纳·贝勒加德"] },
  IRN: { tier: "亚洲强队", starPlayers: ["迈赫迪·塔雷米", "萨达尔·阿兹蒙", "阿里雷扎·贾汉巴赫什"] },
  IRQ: { tier: "亚洲挑战者", starPlayers: ["阿里·贾西姆", "艾曼·侯赛因", "易卜拉欣·巴耶什"] },
  JOR: { tier: "亚洲黑马", starPlayers: ["穆萨·塔马里", "亚赞·阿尔奈马特", "努尔·拉瓦布德"] },
  JPN: { tier: "亚洲强队 / 潜在黑马", starPlayers: ["久保建英", "三笘薰", "远藤航", "堂安律"] },
  KOR: { tier: "亚洲强队", starPlayers: ["孙兴慜", "金玟哉", "李刚仁", "黄喜灿"] },
  KSA: { tier: "亚洲强队", starPlayers: ["萨利姆·多萨里", "菲拉斯·布赖坎", "穆罕默德·卡努"] },
  MAR: { tier: "非洲强队 / 潜在黑马", starPlayers: ["阿什拉夫·哈基米", "索菲扬·阿姆拉巴特", "优素福·恩内斯里"] },
  MEX: { tier: "东道主 / 传统强队", starPlayers: ["圣地亚哥·希门尼斯", "埃德森·阿尔瓦雷斯", "吉列尔莫·奥乔亚"] },
  NED: { tier: "欧洲强队", starPlayers: ["维吉尔·范戴克", "科迪·加克波", "弗兰基·德容", "哈维·西蒙斯"] },
  NOR: { tier: "欧洲潜在黑马", starPlayers: ["埃尔林·哈兰德", "马丁·厄德高", "亚历山大·瑟洛特"] },
  NZL: { tier: "大洋洲代表", starPlayers: ["克里斯·伍德", "萨普里特·辛格", "乔·贝尔"] },
  PAN: { tier: "中北美挑战者", starPlayers: ["阿尼瓦尔·戈多伊", "阿达尔贝托·卡拉斯基利亚", "迈克尔·穆里略"] },
  PAR: { tier: "南美硬朗派", starPlayers: ["米格尔·阿尔米隆", "胡利奥·恩西索", "古斯塔沃·戈麦斯"] },
  POR: { tier: "争冠热门", starPlayers: ["克里斯蒂亚诺·罗纳尔多", "布鲁诺·费尔南德斯", "贝尔纳多·席尔瓦", "若昂·内维斯"] },
  QAT: { tier: "亚洲挑战者", starPlayers: ["阿克拉姆·阿菲夫", "阿尔莫兹·阿里", "哈桑·海多斯"] },
  RSA: { tier: "非洲挑战者", starPlayers: ["珀西·陶", "特博霍·莫科埃纳", "龙文·威廉姆斯"] },
  SCO: { tier: "欧洲硬朗派", starPlayers: ["安迪·罗伯逊", "斯科特·麦克托米奈", "约翰·麦金"] },
  SEN: { tier: "非洲强队 / 潜在黑马", starPlayers: ["萨迪奥·马内", "卡利杜·库利巴利", "尼古拉斯·杰克逊"] },
  SUI: { tier: "欧洲稳定强队", starPlayers: ["格拉尼特·扎卡", "曼努埃尔·阿坎吉", "布雷尔·恩博洛"] },
  SWE: { tier: "欧洲挑战者", starPlayers: ["亚历山大·伊萨克", "德扬·库卢塞夫斯基", "维克托·约克雷斯"] },
  TUN: { tier: "非洲挑战者", starPlayers: ["埃利亚斯·斯希里", "汉尼拔·梅布里", "尤瑟夫·姆萨克尼"] },
  TUR: { tier: "欧洲潜在黑马", starPlayers: ["哈坎·恰尔汗奥卢", "阿尔达·居莱尔", "凯南·伊尔迪兹"] },
  URU: { tier: "南美强队 / 潜在黑马", starPlayers: ["费德里科·巴尔韦德", "达尔文·努涅斯", "罗纳德·阿劳霍"] },
  USA: { tier: "东道主 / 潜在黑马", starPlayers: ["克里斯蒂安·普利西奇", "韦斯顿·麦肯尼", "泰勒·亚当斯", "乔瓦尼·雷纳"] },
  UZB: { tier: "世界杯新军", starPlayers: ["埃尔多尔·肖穆罗多夫", "阿博斯别克·法伊祖拉耶夫", "阿卜杜科迪尔·胡萨诺夫"] }
};

export const MATCH_GOALS = {
  "400021458": [
    { teamCode: "USA", minute: "7'", player: "Damián Bobadilla", shirtNumber: 16, ownGoal: true, assist: "Weston McKennie / Christian Pulisic" },
    { teamCode: "USA", minute: "31'", player: "Folarin Balogun", shirtNumber: 20, assist: "Christian Pulisic" },
    { teamCode: "USA", minute: "45+5'", player: "Folarin Balogun", shirtNumber: 20, assist: "Malik Tillman" },
    { teamCode: "PAR", minute: "73'", player: "Mauricio", shirtNumber: 11, assist: "Julio Enciso" },
    { teamCode: "USA", minute: "90+8'", player: "Gio Reyna", shirtNumber: 7, assist: "Alex Freeman" }
  ]
};

export const LABEL_ZH = new Map([
  ["First Stage", "小组赛"], ["Round of 32", "32 强赛"], ["Round of 16", "16 强赛"],
  ["Quarter-final", "四分之一决赛"], ["Semi-final", "半决赛"],
  ["Play-off for third place", "三四名决赛"], ["Final", "决赛"],
  ["Group A", "A 组"], ["Group B", "B 组"], ["Group C", "C 组"], ["Group D", "D 组"],
  ["Group E", "E 组"], ["Group F", "F 组"], ["Group G", "G 组"], ["Group H", "H 组"],
  ["Group I", "I 组"], ["Group J", "J 组"], ["Group K", "K 组"], ["Group L", "L 组"]
]);

export const CITY_ZH = new Map([
  ["Atlanta", "亚特兰大"], ["Boston", "波士顿"], ["Dallas", "达拉斯"],
  ["Guadalajara", "瓜达拉哈拉"], ["Houston", "休斯敦"], ["Kansas City", "堪萨斯城"],
  ["Los Angeles", "洛杉矶"], ["Mexico City", "墨西哥城"], ["Miami", "迈阿密"],
  ["Monterrey", "蒙特雷"], ["New York New Jersey", "纽约新泽西"],
  ["Philadelphia", "费城"], ["San Francisco Bay Area", "旧金山湾区"],
  ["Seattle", "西雅图"], ["Toronto", "多伦多"], ["Vancouver", "温哥华"]
]);
