import type { Word } from '../types/word';

/**
 * CET-4 种子单词（30 词）
 * 每词 3 条例句，覆盖不同语境
 */
export const cet4Words: Word[] = [
  {
    id: 'cet4-001',
    word: 'abandon',
    phonetic: '/əˈbændən/',
    partOfSpeech: 'v.',
    chineseDefinition: 'v. 放弃；抛弃；遗弃',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'We had to abandon the plan due to lack of funding.',
        chinese: '由于缺乏资金，我们不得不放弃这个计划。',
        source: '牛津词典',
      },
      {
        english: "Don't abandon yourself to despair — there's always a way out.",
        chinese: '不要沉溺于绝望之中——总有出路。',
        source: '日常表达',
      },
      {
        english: 'The crew abandoned the sinking ship and escaped on lifeboats.',
        chinese: '船员们弃船逃生，乘救生艇逃离。',
        source: 'BBC News',
      },
    ],
  },
  {
    id: 'cet4-002',
    word: 'absorb',
    phonetic: '/əbˈzɔːrb/',
    partOfSpeech: 'v.',
    chineseDefinition: 'v. 吸收；吸引（注意力）；理解',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'Plants absorb carbon dioxide and release oxygen.',
        chinese: '植物吸收二氧化碳并释放氧气。',
        source: '科学教材',
      },
      {
        english: 'She was so absorbed in her book that she missed the train.',
        chinese: '她完全沉浸在书中，以至于错过了火车。',
        source: '日常场景',
      },
      {
        english: "It takes time to absorb everything you've learned today.",
        chinese: '消化今天学到的所有内容需要时间。',
        source: '学术语境',
      },
    ],
  },
  {
    id: 'cet4-003',
    word: 'abstract',
    phonetic: '/ˈæbstrækt/',
    partOfSpeech: 'adj. / n.',
    chineseDefinition: 'adj. 抽象的；n. 摘要；抽象概念',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'The concept of justice is too abstract for young children to grasp.',
        chinese: '正义这个概念对小孩子来说太抽象了，难以理解。',
        source: '牛津词典',
      },
      {
        english: 'Please submit an abstract of your paper before the conference.',
        chinese: '请在会议前提交论文摘要。',
        source: '学术场景',
      },
      {
        english: "I love looking at abstract paintings — they make you think.",
        chinese: '我喜欢看抽象画——它们引人深思。',
        source: '艺术评论',
      },
    ],
  },
  {
    id: 'cet4-004',
    word: 'abundant',
    phonetic: '/əˈbʌndənt/',
    partOfSpeech: 'adj.',
    chineseDefinition: 'adj. 丰富的；充裕的',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'The region is abundant in natural resources, especially oil and gas.',
        chinese: '该地区自然资源丰富，尤其是石油和天然气。',
        source: '经济学人',
      },
      {
        english: 'There is abundant evidence that exercise improves mental health.',
        chinese: '有充分的证据表明运动能改善心理健康。',
        source: '科普文章',
      },
      {
        english: 'We had an abundant harvest this year thanks to the perfect weather.',
        chinese: '由于天气极好，我们今年大丰收。',
        source: '生活场景',
      },
    ],
  },
  {
    id: 'cet4-005',
    word: 'accommodate',
    phonetic: '/əˈkɑːmədeɪt/',
    partOfSpeech: 'v.',
    chineseDefinition: 'v. 容纳；提供住宿；迁就；适应',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'The hotel can accommodate up to 300 guests.',
        chinese: '这家酒店最多可容纳 300 位客人。',
        source: '商务场景',
      },
      {
        english: 'We try to accommodate the needs of all our students.',
        chinese: '我们尽力满足所有学生的需求。',
        source: '教育场景',
      },
      {
        english: "It's hard to accommodate myself to the new time zone after a long flight.",
        chinese: '长途飞行后，我很难适应新的时区。',
        source: '旅行日记',
      },
    ],
  },
  {
    id: 'cet4-006',
    word: 'accompany',
    phonetic: '/əˈkʌmpəni/',
    partOfSpeech: 'v.',
    chineseDefinition: 'v. 陪伴；伴随；为……伴奏',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'She accompanied her mother to the hospital for a check-up.',
        chinese: '她陪母亲去医院做检查。',
        source: '日常场景',
      },
      {
        english: 'Strong winds accompanied the heavy rain throughout the night.',
        chinese: '整夜狂风伴随着暴雨。',
        source: '天气预报',
      },
      {
        english: 'He accompanied the singer on the piano during the recital.',
        chinese: '他在独奏会上用钢琴为歌手伴奏。',
        source: '音乐场景',
      },
    ],
  },
  {
    id: 'cet4-007',
    word: 'accomplish',
    phonetic: '/əˈkɑːmplɪʃ/',
    partOfSpeech: 'v.',
    chineseDefinition: 'v. 完成；实现；达到',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'She accomplished her goal of running a marathon in under four hours.',
        chinese: '她实现了四小时内跑完马拉松的目标。',
        source: '体育报道',
      },
      {
        english: "What do you hope to accomplish in your first year at the company?",
        chinese: '你希望在公司第一年取得什么成就？',
        source: '面试场景',
      },
      {
        english: 'The team accomplished the project ahead of schedule.',
        chinese: '团队提前完成了项目。',
        source: '商务邮件',
      },
    ],
  },
  {
    id: 'cet4-008',
    word: 'accumulate',
    phonetic: '/əˈkjuːmjəleɪt/',
    partOfSpeech: 'v.',
    chineseDefinition: 'v. 积累；积聚；堆积',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'Over the years, she has accumulated a vast collection of rare books.',
        chinese: '多年以来，她积累了大量的珍本书籍收藏。',
        source: '人物专访',
      },
      {
        english: 'If you don\'t clear out your inbox regularly, emails accumulate quickly.',
        chinese: '如果不定期清理收件箱，邮件很快就会堆积起来。',
        source: '生活建议',
      },
      {
        english: 'Snow accumulated on the roads overnight, causing travel chaos.',
        chinese: '一夜之间路面积雪，导致交通混乱。',
        source: '新闻报道',
      },
    ],
  },
  {
    id: 'cet4-009',
    word: 'accurate',
    phonetic: '/ˈækjərət/',
    partOfSpeech: 'adj.',
    chineseDefinition: 'adj. 准确的；精确的；正确的',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'The weather forecast turned out to be remarkably accurate.',
        chinese: '天气预报结果出奇地准确。',
        source: '日常对话',
      },
      {
        english: 'We need accurate data before we can draw any conclusions.',
        chinese: '我们需要准确的数据才能得出结论。',
        source: '科研场景',
      },
      {
        english: 'Her account of the accident was accurate in every detail.',
        chinese: '她对事故的描述在每个细节上都是准确的。',
        source: '法庭证词',
      },
    ],
  },
  {
    id: 'cet4-010',
    word: 'acknowledge',
    phonetic: '/əkˈnɑːlɪdʒ/',
    partOfSpeech: 'v.',
    chineseDefinition: 'v. 承认；确认收到；致谢',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'He finally acknowledged that he had made a mistake.',
        chinese: '他终于承认自己犯了一个错误。',
        source: '日常场景',
      },
      {
        english: 'Please acknowledge receipt of this email at your earliest convenience.',
        chinese: '请尽快确认收到此邮件。',
        source: '商务邮件',
      },
      {
        english: 'The author acknowledged the support of her family in the preface.',
        chinese: '作者在前言中感谢了家人的支持。',
        source: '书籍序言',
      },
    ],
  },
  {
    id: 'cet4-011',
    word: 'acquire',
    phonetic: '/əˈkwaɪər/',
    partOfSpeech: 'v.',
    chineseDefinition: 'v. 获得；习得；收购',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'Children acquire language naturally through interaction with others.',
        chinese: '儿童通过与他人的互动自然地习得语言。',
        source: '语言学教材',
      },
      {
        english: 'The company plans to acquire several smaller competitors this year.',
        chinese: '该公司计划今年收购几家较小的竞争对手。',
        source: '财经新闻',
      },
      {
        english: "It's never too late to acquire a new skill.",
        chinese: '学习新技能永远不嫌晚。',
        source: '励志演讲',
      },
    ],
  },
  {
    id: 'cet4-012',
    word: 'adequate',
    phonetic: '/ˈædɪkwət/',
    partOfSpeech: 'adj.',
    chineseDefinition: 'adj. 足够的；适当的；合乎要求的',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'Make sure you have adequate sleep before the exam.',
        chinese: '考试前确保有充足的睡眠。',
        source: '校园建议',
      },
      {
        english: 'The existing facilities are no longer adequate for our growing team.',
        chinese: '现有设施已不足以满足我们不断扩大的团队。',
        source: '办公室场景',
      },
      {
        english: 'His explanation was adequate, though not particularly detailed.',
        chinese: '他的解释还算说得过去，虽然不够详细。',
        source: '日常评价',
      },
    ],
  },
  {
    id: 'cet4-013',
    word: 'adjust',
    phonetic: '/əˈdʒʌst/',
    partOfSpeech: 'v.',
    chineseDefinition: 'v. 调整；调节；适应',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'You can adjust the height of the chair by turning this knob.',
        chinese: '旋转这个旋钮可以调节椅子高度。',
        source: '产品说明',
      },
      {
        english: 'It took her a few months to adjust to life in a new country.',
        chinese: '她花了几个月时间才适应新国家的生活。',
        source: '留学博客',
      },
      {
        english: 'We need to adjust our strategy based on the latest market data.',
        chinese: '我们需要根据最新市场数据调整策略。',
        source: '商业会议',
      },
    ],
  },
  {
    id: 'cet4-014',
    word: 'advocate',
    phonetic: '/ˈædvəkeɪt/',
    partOfSpeech: 'v. / n.',
    chineseDefinition: 'v. 提倡；拥护；n. 倡导者',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: 'She has long advocated for better mental health services in schools.',
        chinese: '她长期倡导在学校中提供更好的心理健康服务。',
        source: '社会新闻',
      },
      {
        english: 'He is a strong advocate of renewable energy and sustainable living.',
        chinese: '他是可再生能源和可持续生活的坚定倡导者。',
        source: '人物介绍',
      },
      {
        english: "I wouldn't advocate taking such a risky approach without testing first.",
        chinese: '我不主张在没有先测试的情况下采取如此冒险的做法。',
        source: '职场建议',
      },
    ],
  },
  {
    id: 'cet4-015',
    word: 'alternative',
    phonetic: '/ɔːlˈtɜːrnətɪv/',
    partOfSpeech: 'n. / adj.',
    chineseDefinition: 'n. 替代选择；adj. 替代的；另类的',
    bookId: 'cet4',
    exampleSentences: [
      {
        english: "Is there an alternative to driving? Maybe we could take the train.",
        chinese: '有没有开车的替代方案？也许我们可以坐火车。',
        source: '日常对话',
      },
      {
        english: 'Alternative energy sources like solar and wind are becoming cheaper.',
        chinese: '太阳能和风能等替代能源正变得越来越便宜。',
        source: '科普文章',
      },
      {
        english: 'The doctor suggested alternative therapies alongside the standard treatment.',
        chinese: '医生建议在标准治疗之外配合替代疗法。',
        source: '医疗建议',
      },
    ],
  },
];
