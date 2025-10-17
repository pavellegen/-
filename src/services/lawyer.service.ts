import { Injectable, signal, effect } from '@angular/core';
import { Lawyer, VerificationInfo, CaseExample, Review } from '../models/lawyer.model.ts';
import { normalizePhoneNumber } from '../utils/phone-formatter.ts';

const LAWYERS_DATA: Lawyer[] = [
  // Семейное право
  {
    id: 1,
    fullName: 'Иванов Иван Иванович',
    photoUrl: 'https://picsum.photos/seed/lawyer1/400/400',
    city: 'Москва',
    phone: '79000000001',
    primarySpecialization: 'Эксперт по семейному праву',
    categories: ['Семейное право'],
    otherSpecializations: ['Раздел имущества', 'Алименты', 'Определение места жительства детей'],
    experienceYears: 15,
    winRate: 92,
    consultationsHeld: 154,
    verificationStatus: 'approved',
    bio: 'Специализируюсь на сложных семейных спорах. Моя цель — найти лучшее решение для вас и вашей семьи, минимизируя стресс и затраты.',
    caseExamples: [
      { title: 'Успешный раздел совместного бизнеса', description: 'Добился справедливого раздела активов компании между супругами при разводе.', sourceUrl: 'https://kad.arbitr.ru/' },
    ],
    reviews: [
      { author: 'Анна К.', rating: 5, text: 'Иван Иванович — настоящий профессионал. Помог в очень сложной ситуации с разводом. Спасибо!' },
    ],
    registrationDate: new Date('2023-10-25T10:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 5000,
    offersFreeConsultation: true,
    freeConsultationConditions: 'Только первичный анализ ситуации (15 мин).'
  },
  {
    id: 5,
    fullName: 'Смирнова Ольга Андреевна',
    photoUrl: 'https://picsum.photos/seed/lawyer5/400/400',
    city: 'Санкт-Петербург',
    phone: '79000000005',
    primarySpecialization: 'Медиатор по семейным спорам',
    categories: ['Семейное право'],
    otherSpecializations: ['Брачные договоры', 'Усыновление', 'Лишение родительских прав'],
    experienceYears: 8,
    winRate: 95,
    consultationsHeld: 250,
    verificationStatus: 'approved',
    bio: 'Помогаю супругам договориться без суда. Убеждена, что мирное урегулирование — лучший выход в семейных конфликтах.',
    caseExamples: [{ title: 'Заключение мирового соглашения', description: 'Помогла сторонам составить и утвердить в суде мировое соглашение по разделу имущества и воспитанию детей.' }],
    reviews: [{ author: 'Виктория Л.', rating: 5, text: 'Ольга помогла нам с мужем разойтись цивилизованно.' }],
    registrationDate: new Date('2023-11-10T12:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 4000,
    offersFreeConsultation: false,
  },
  {
    id: 6,
    fullName: 'Васильев Пётр Максимович',
    photoUrl: 'https://picsum.photos/seed/lawyer6/400/400',
    city: 'Москва',
    phone: '79000000006',
    primarySpecialization: 'Адвокат по бракоразводным процессам',
    categories: ['Семейное право'],
    otherSpecializations: ['Раздел имущества', 'Алименты на супруга', 'Международные разводы'],
    experienceYears: 18,
    winRate: 90,
    consultationsHeld: 320,
    verificationStatus: 'approved',
    bio: 'Защищаю интересы клиентов в сложных и эмоциональных бракоразводных процессах. Обеспечиваю максимальную финансовую защиту.',
    caseExamples: [{ title: 'Раздел активов за рубежом', description: 'Успешно провел процесс раздела имущества, находящегося в нескольких юрисдикциях.' }],
    reviews: [{ author: 'Андрей Т.', rating: 5, text: 'Петр Максимович - жесткий переговорщик и отличный стратег.' }],
    registrationDate: new Date('2022-01-15T15:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 6000,
    offersFreeConsultation: true,
    freeConsultationConditions: 'Только для новых клиентов.'
  },
  // Недвижимость
  {
    id: 2,
    fullName: 'Петрова Мария Сергеевна',
    photoUrl: 'https://picsum.photos/seed/lawyer2/400/400',
    city: 'Санкт-Петербург',
    phone: '79000000002',
    primarySpecialization: 'Специалист по сделкам с недвижимостью',
    categories: ['Недвижимость'],
    otherSpecializations: ['Сопровождение сделок купли-продажи', 'Споры с застройщиками', 'Оспаривание кадастровой стоимости'],
    experienceYears: 12,
    winRate: 95,
    consultationsHeld: 210,
    verificationStatus: 'approved',
    bio: 'Помогаю клиентам безопасно покупать и продавать недвижимость. Глубоко знаю все тонкости законодательства и умею предвидеть риски.',
    caseExamples: [{ title: 'Взыскание неустойки с застройщика', description: 'Добился выплаты крупной неустойки за срыв сроков сдачи объекта.' }],
    reviews: [{ author: 'Ольга В.', rating: 5, text: 'Мария Сергеевна сэкономила мне кучу нервов и денег при покупке квартиры!' }],
    registrationDate: new Date('2023-05-20T09:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 3500,
    offersFreeConsultation: true,
  },
  {
    id: 7,
    fullName: 'Козлов Дмитрий Евгеньевич',
    photoUrl: 'https://picsum.photos/seed/lawyer7/400/400',
    city: 'Москва',
    phone: '79000000007',
    primarySpecialization: 'Юрист по земельному праву',
    categories: ['Недвижимость'],
    otherSpecializations: ['Оформление земельных участков', 'Изменение категории земель', 'Споры о границах'],
    experienceYears: 14,
    winRate: 89,
    consultationsHeld: 180,
    verificationStatus: 'approved',
    bio: 'Решаю самые запутанные вопросы, связанные с земельными участками. Помогаю оформить собственность и защитить ее от посягательств.',
    caseExamples: [{ title: 'Установление границ участка через суд', description: 'Выиграл сложный пограничный спор с соседями.' }],
    reviews: [{ author: 'Фермерское хозяйство "Ромашка"', rating: 5, text: 'Дмитрий Евгеньевич помог нам оформить все наши земли.' }],
    registrationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 3000,
    offersFreeConsultation: false,
  },
  {
    id: 8,
    fullName: 'Зайцева Анна Игоревна',
    photoUrl: 'https://picsum.photos/seed/lawyer8/400/400',
    city: 'Сочи',
    phone: '79000000008',
    primarySpecialization: 'Эксперт по коммерческой недвижимости',
    categories: ['Недвижимость'],
    otherSpecializations: ['Договоры аренды', 'Due diligence объектов', 'Сделки с отелями'],
    experienceYears: 10,
    winRate: 97,
    consultationsHeld: 130,
    verificationStatus: 'approved',
    bio: 'Сопровождаю крупные инвестиционные проекты в сфере коммерческой недвижимости. Обеспечиваю юридическую чистоту и выгодные условия.',
    caseExamples: [],
    reviews: [{ author: 'Invest Group', rating: 5, text: 'Анна - профессионал высочайшего уровня.' }],
    registrationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 7000,
    offersFreeConsultation: false,
  },
  {
    id: 3,
    fullName: 'Сидоров Алексей Викторович',
    photoUrl: 'https://picsum.photos/seed/lawyer3/400/400',
    city: 'Москва',
    phone: '79000000003',
    primarySpecialization: 'Защита по уголовным делам',
    categories: ['Уголовное право'],
    otherSpecializations: ['Экономические преступления', 'Преступления против личности', 'Условно-досрочное освобождение'],
    experienceYears: 20,
    winRate: 88,
    consultationsHeld: 180,
    verificationStatus: 'approved',
    bio: 'Более 20 лет защищаю права граждан на всех стадиях уголовного процесса. Имею опыт работы следователем.',
    caseExamples: [{ title: 'Оправдательный приговор по делу о мошенничестве', description: 'Доказал полную невиновность подзащитного.' }],
    reviews: [{ author: 'Константин Б.', rating: 5, text: 'Алексей Викторович спас меня от несправедливого обвинения.' }],
    registrationDate: new Date('2021-08-01T18:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 10000,
    offersFreeConsultation: true,
    freeConsultationConditions: 'Консультация по телефону (до 10 минут).'
  },
  {
    id: 9,
    fullName: 'Орлова Екатерина Вадимовна',
    photoUrl: 'https://picsum.photos/seed/lawyer9/400/400',
    city: 'Екатеринбург',
    phone: '79000000009',
    primarySpecialization: 'Адвокат по делам о наркотиках (ст. 228 УК РФ)',
    categories: ['Уголовное право'],
    otherSpecializations: ['Защита на следствии', 'Обжалование приговоров', 'Представление интересов свидетелей'],
    experienceYears: 11,
    winRate: 85,
    consultationsHeld: 150,
    verificationStatus: 'approved',
    bio: 'Специализируюсь на одной из самых сложных категорий дел. Знаю все нюансы и слабые места обвинения.',
    caseExamples: [{ title: 'Переквалификация на менее тяжкую часть статьи', description: 'Добилась значительного смягчения приговора для своего подзащитного.' }],
    reviews: [{ author: 'Мать подзащитного', rating: 5, text: 'Екатерина Вадимовна - наша спасительница.' }],
    registrationDate: new Date('2023-01-10T11:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 8000,
    offersFreeConsultation: false,
  },
  {
    id: 10,
    fullName: 'Григорьев Станислав Игоревич',
    photoUrl: 'https://picsum.photos/seed/lawyer10/400/400',
    city: 'Новосибирск',
    phone: '79000000010',
    primarySpecialization: 'Защита по ДТП с тяжкими последствиями',
    categories: ['Уголовное право', 'Автомобильное право'],
    otherSpecializations: ['Возмещение вреда', 'Споры со страховыми', 'Автотехническая экспертиза'],
    experienceYears: 16,
    winRate: 91,
    consultationsHeld: 200,
    verificationStatus: 'approved',
    bio: 'Помогаю водителям, попавшим в тяжелые ДТП. Выстраиваю защиту, основываясь на тщательном анализе всех обстоятельств дела.',
    caseExamples: [{ title: 'Прекращение уголовного дела за примирением сторон', description: 'Добился примирения с потерпевшей стороной и прекращения дела.' }],
    reviews: [{ author: 'Александр', rating: 5, text: 'Станислав помог мне избежать тюрьмы. Безмерно благодарен.' }],
    registrationDate: new Date('2022-09-05T14:30:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 5000,
    offersFreeConsultation: true,
  },
  {
    id: 4,
    fullName: 'Кузнецова Елена Дмитриевна',
    photoUrl: 'https://picsum.photos/seed/lawyer4/400/400',
    city: 'Екатеринбург',
    phone: '79000000004',
    primarySpecialization: 'Эксперт по корпоративному праву',
    categories: ['Бизнес-споры'],
    otherSpecializations: ['Регистрация и ликвидация ООО/ИП', 'Корпоративные споры', 'Составление договоров'],
    experienceYears: 10,
    winRate: 94,
    consultationsHeld: 125,
    verificationStatus: 'approved',
    bio: 'Помогаю бизнесу расти и развиваться в правовом поле. Консультирую по вопросам создания компаний, решаю корпоративные конфликты.',
    caseExamples: [{ title: 'Успешное разрешение корпоративного конфликта', description: 'Разработала стратегию, которая позволила урегулировать спор между учредителями без суда.' }],
    reviews: [{ author: 'CEO "ТехноСтарт"', rating: 5, text: 'Елена Дмитриевна - наш надежный юридический партнер.' }],
    registrationDate: new Date('2023-03-12T10:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 4500,
    offersFreeConsultation: true,
  },
  {
    id: 11,
    fullName: 'Максимов Артем Геннадьевич',
    photoUrl: 'https://picsum.photos/seed/lawyer11/400/400',
    city: 'Москва',
    phone: '79000000011',
    primarySpecialization: 'Специалист по арбитражным спорам',
    categories: ['Бизнес-споры'],
    otherSpecializations: ['Взыскание дебиторской задолженности', 'Банкротство', 'Споры по договорам поставки'],
    experienceYears: 13,
    winRate: 96,
    consultationsHeld: 280,
    verificationStatus: 'approved',
    bio: 'Представляю интересы бизнеса в арбитражных судах по всей России. Моя задача - взыскать ваши деньги и защитить активы.',
    caseExamples: [{ title: 'Взыскание крупного долга с подрядчика', description: 'Выиграл дело о взыскании задолженности и неустойки на сумму более 50 млн рублей.', sourceUrl: 'https://kad.arbitr.ru/' }],
    reviews: [{ author: 'ООО "СтройКом"', rating: 5, text: 'Артем вернул нам деньги, которые мы уже не надеялись получить.' }],
    registrationDate: new Date('2022-11-20T16:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 7500,
    offersFreeConsultation: false,
  },
  {
    id: 12,
    fullName: 'Новикова Ирина Вячеславовна',
    photoUrl: 'https://picsum.photos/seed/lawyer12/400/400',
    city: 'Казань',
    phone: '79000000012',
    primarySpecialization: 'Юрист по интеллектуальной собственности',
    categories: ['Бизнес-споры', 'Интеллектуальная собственность'],
    otherSpecializations: ['Регистрация товарных знаков', 'Защита авторских прав', 'Патентование'],
    experienceYears: 9,
    winRate: 98,
    consultationsHeld: 110,
    verificationStatus: 'approved',
    bio: 'Защищаю самый ценный актив бизнеса - его интеллектуальную собственность. Помогаю регистрировать и отстаивать права на бренды и технологии.',
    caseExamples: [{ title: 'Запрет на использование товарного знака', description: 'Добилась в суде запрета для конкурента на использование схожего до степени смешения товарного знака.' }],
    reviews: [{ author: 'IT-стартап "CleverCode"', rating: 5, text: 'Ирина помогла нам защитить наш бренд.' }],
    registrationDate: new Date('2023-06-30T13:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 4000,
    offersFreeConsultation: true,
  },
  {
    id: 13,
    fullName: 'Лебедев Павел Андреевич',
    photoUrl: 'https://picsum.photos/seed/lawyer13/400/400',
    city: 'Москва',
    phone: '79000000013',
    primarySpecialization: 'Эксперт по трудовому праву',
    categories: ['Трудовое право'],
    otherSpecializations: ['Незаконное увольнение', 'Взыскание зарплаты', 'Коллективные трудовые споры'],
    experienceYears: 12,
    winRate: 93,
    consultationsHeld: 220,
    verificationStatus: 'approved',
    bio: 'Защищаю права как работников, так и работодателей. Помогаю находить законные и справедливые решения в трудовых конфликтах.',
    caseExamples: [{ title: 'Восстановление на работе', description: 'Успешно оспорил незаконное увольнение и добился восстановления клиента на работе с выплатой компенсации.' }],
    reviews: [{ author: 'Марина В.', rating: 5, text: 'Павел Андреевич помог мне отстоять свои права перед крупной компанией.' }],
    registrationDate: new Date('2022-02-18T10:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 3000,
    offersFreeConsultation: true,
  },
  {
    id: 14,
    fullName: 'Соколова Инна Викторовна',
    photoUrl: 'https://picsum.photos/seed/lawyer14/400/400',
    city: 'Санкт-Петербург',
    phone: '79000000014',
    primarySpecialization: 'Юрист для работодателей',
    categories: ['Трудовое право'],
    otherSpecializations: ['Разработка трудовых договоров', 'Проверки ГИТ', 'Сокращение штата'],
    experienceYears: 10,
    winRate: 97,
    consultationsHeld: 140,
    verificationStatus: 'approved',
    bio: 'Помогаю компаниям выстраивать кадровую политику в строгом соответствии с законом, минимизируя риски трудовых споров.',
    caseExamples: [{ title: 'Успешное прохождение проверки ГИТ', description: 'Сопроводила компанию во время проверки трудовой инспекции, что позволило избежать штрафов.' }],
    reviews: [{ author: 'HR-директор "FutureTech"', rating: 5, text: 'Инна - наш главный консультант по всем сложным кадровым вопросам.' }],
    registrationDate: new Date('2023-08-21T17:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 5000,
    offersFreeConsultation: false,
  },
  {
    id: 15,
    fullName: 'Егоров Михаил Юрьевич',
    photoUrl: 'https://picsum.photos/seed/lawyer15/400/400',
    city: 'Нижний Новгород',
    phone: '79000000015',
    primarySpecialization: 'Защита прав работников',
    categories: ['Трудовое право'],
    otherSpecializations: ['Производственные травмы', 'Невыплата премий', 'Дискриминация на рабочем месте'],
    experienceYears: 15,
    winRate: 91,
    consultationsHeld: 300,
    verificationStatus: 'approved',
    bio: 'Всегда на стороне работника. Помогаю добиться справедливости и получить все положенные по закону выплаты и компенсации.',
    caseExamples: [{ title: 'Взыскание компенсации за производственную травму', description: 'Добился выплаты крупной суммы в пользу работника, пострадавшего на производстве.' }],
    reviews: [{ author: 'Сергей Николаевич', rating: 5, text: 'Спасибо Михаилу за то, что не дал работодателю уйти от ответственности.' }],
    registrationDate: new Date('2021-04-14T11:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 2500,
    offersFreeConsultation: true,
  },
  {
    id: 16,
    fullName: 'Попова Людмила Ивановна',
    photoUrl: 'https://picsum.photos/seed/lawyer16/400/400',
    city: 'Москва',
    phone: '79000000016',
    primarySpecialization: 'Специалист по наследственному праву',
    categories: ['Наследство'],
    otherSpecializations: ['Оспаривание завещания', 'Раздел наследства', 'Выделение обязательной доли'],
    experienceYears: 22,
    winRate: 90,
    consultationsHeld: 450,
    verificationStatus: 'approved',
    bio: 'Наследственные споры - одни из самых сложных. Я помогаю наследникам разобраться в ситуации и получить то, что им положено по закону.',
    caseExamples: [{ title: 'Признание завещания недействительным', description: 'Доказала в суде, что наследодатель в момент составления завещания не осознавал своих действий.' }],
    reviews: [{ author: 'Ольга П.', rating: 5, text: 'Людмила Ивановна - очень опытный и мудрый юрист.' }],
    registrationDate: new Date('2020-03-01T09:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 4000,
    offersFreeConsultation: false,
  },
  {
    id: 17,
    fullName: 'Федоров Антон Сергеевич',
    photoUrl: 'https://picsum.photos/seed/lawyer17/400/400',
    city: 'Краснодар',
    phone: '79000000017',
    primarySpecialization: 'Оформление наследства',
    categories: ['Наследство'],
    otherSpecializations: ['Восстановление срока принятия наследства', 'Розыск наследственного имущества', 'Наследство за рубежом'],
    experienceYears: 8,
    winRate: 99,
    consultationsHeld: 180,
    verificationStatus: 'approved',
    bio: 'Беру на себя все хлопоты по оформлению наследства, от сбора документов до регистрации прав собственности. Экономлю ваше время и нервы.',
    caseExamples: [{ title: 'Восстановление пропущенного срока', description: 'Восстановил через суд срок на принятие наследства для клиента, который не знал о смерти родственника.' }],
    reviews: [{ author: 'Ирина С.', rating: 5, text: 'Антон все сделал быстро и профессионально. Мне почти не пришлось участвовать.' }],
    registrationDate: new Date('2023-09-01T14:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 3000,
    offersFreeConsultation: true,
  },
  {
    id: 18,
    fullName: 'Морозова Вероника Павловна',
    photoUrl: 'https://picsum.photos/seed/lawyer18/400/400',
    city: 'Санкт-Петербург',
    phone: '79000000018',
    primarySpecialization: 'Медиатор по наследственным спорам',
    categories: ['Наследство'],
    otherSpecializations: ['Раздел наследства между родственниками', 'Переговоры', 'Составление соглашений'],
    experienceYears: 11,
    winRate: 95,
    consultationsHeld: 210,
    verificationStatus: 'approved',
    bio: 'Помогаю наследникам договориться мирно, без долгих и дорогих судебных тяжб. Сохраняю не только имущество, но и семейные отношения.',
    caseExamples: [{ title: 'Заключение соглашения о разделе наследства', description: 'Помогла 5 наследникам договориться и справедливо разделить большое наследство, избежав суда.' }],
    reviews: [{ author: 'Семья Н.', rating: 5, text: 'Вероника помогла нам избежать семейной войны. Спасибо ей огромное.' }],
    registrationDate: new Date('2022-07-22T12:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 4500,
    offersFreeConsultation: true,
  },
  {
    id: 19,
    fullName: 'Давыдов Роман Станиславович',
    photoUrl: 'https://picsum.photos/seed/lawyer19/400/400',
    city: 'Москва',
    phone: '79000000019',
    primarySpecialization: 'Эксперт по защите прав потребителей',
    categories: ['Защита потребителей'],
    otherSpecializations: ['Возврат некачественного товара', 'Споры с интернет-магазинами', 'Некачественные услуги'],
    experienceYears: 9,
    winRate: 96,
    consultationsHeld: 350,
    verificationStatus: 'approved',
    bio: 'Знаю закон "О защите прав потребителей" от и до. Помогаю вернуть деньги за некачественные товары и услуги.',
    caseExamples: [{ title: 'Возврат денег за бракованный автомобиль', description: 'Добился от автосалона возврата полной стоимости автомобиля с дефектом.' }],
    reviews: [{ author: 'Игорь', rating: 5, text: 'Роман помог мне вернуть деньги за телефон, который сломался через неделю.' }],
    registrationDate: new Date('2023-02-15T10:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 3000,
    offersFreeConsultation: true,
  },
  {
    id: 20,
    fullName: 'Белова Алиса Денисовна',
    photoUrl: 'https://picsum.photos/seed/lawyer20/400/400',
    city: 'Екатеринбург',
    phone: '79000000020',
    primarySpecialization: 'Споры с застройщиками и УК',
    categories: ['Защита потребителей', 'Недвижимость'],
    otherSpecializations: ['Взыскание неустойки за просрочку', 'Некачественный ремонт от застройщика', 'Перерасчет коммунальных платежей'],
    experienceYears: 7,
    winRate: 92,
    consultationsHeld: 180,
    verificationStatus: 'approved',
    bio: 'Защищаю права дольщиков и собственников жилья. Заставляю застройщиков и управляющие компании выполнять свои обязанности.',
    caseExamples: [{ title: 'Взыскание 1 млн рублей неустойки', description: 'Взыскала с застройщика неустойку, штраф и моральный вред за срыв сроков сдачи квартиры.', sourceUrl: 'https://kad.arbitr.ru/' }],
    reviews: [{ author: 'Семья Ивановых', rating: 5, text: 'Алиса помогла нам наказать недобросовестного застройщика.' }],
    registrationDate: new Date('2023-10-02T16:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 2000,
    offersFreeConsultation: true,
  },
  {
    id: 21,
    fullName: 'Виноградов Арсений Ильич',
    photoUrl: 'https://picsum.photos/seed/lawyer21/400/400',
    city: 'Москва',
    phone: '79000000021',
    primarySpecialization: 'Юрист по туристическим спорам',
    categories: ['Защита потребителей'],
    otherSpecializations: ['Возврат денег за туры', 'Споры с авиакомпаниями', 'Некачественный отдых'],
    experienceYears: 11,
    winRate: 94,
    consultationsHeld: 240,
    verificationStatus: 'approved',
    bio: 'Помогаю туристам, чей отдых был испорчен. Возвращаю деньги за отмененные рейсы, несоответствующие отели и навязанные услуги.',
    caseExamples: [{ title: 'Полный возврат за несостоявшийся тур', description: 'Добился от туроператора полного возврата стоимости путевки из-за отмены рейса.' }],
    reviews: [{ author: 'Марина и Алексей', rating: 5, text: 'Арсений спас наши отпускные деньги! Очень рекомендуем.' }],
    registrationDate: new Date('2022-06-11T13:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 3000,
    offersFreeConsultation: false,
  },
  {
    id: 22,
    fullName: 'Богданов Кирилл Александрович',
    photoUrl: 'https://picsum.photos/seed/lawyer22/400/400',
    city: 'Санкт-Петербург',
    phone: '79000000022',
    primarySpecialization: 'Автоюрист',
    categories: ['Автомобильное право'],
    otherSpecializations: ['Лишение прав', 'Споры со страховыми (КАСКО, ОСАГО)', 'Оспаривание виновности в ДТП'],
    experienceYears: 14,
    winRate: 95,
    consultationsHeld: 400,
    verificationStatus: 'approved',
    bio: 'Помогаю автовладельцам в любых спорных ситуациях на дороге и не только. Отстаиваю ваши права в ГИБДД, судах и страховых компаниях.',
    caseExamples: [{ title: 'Возврат прав за выезд на встречную полосу', description: 'Доказал отсутствие состава правонарушения и сохранил права клиенту.' }],
    reviews: [{ author: 'Владимир', rating: 5, text: 'Кирилл - настоящий профи! Помог вернуть права.' }],
    registrationDate: new Date('2021-12-01T15:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 5000,
    offersFreeConsultation: true,
    freeConsultationConditions: 'Только по спорам с ГИБДД.'
  },
  {
    id: 23,
    fullName: 'Волкова Юлия Владимировна',
    photoUrl: 'https://picsum.photos/seed/lawyer23/400/400',
    city: 'Москва',
    phone: '79000000023',
    primarySpecialization: 'Споры с автосалонами',
    categories: ['Автомобильное право', 'Защита потребителей'],
    otherSpecializations: ['Возврат автомобиля дилеру', 'Гарантийный ремонт', 'Навязывание доп. услуг'],
    experienceYears: 8,
    winRate: 97,
    consultationsHeld: 150,
    verificationStatus: 'approved',
    bio: 'Защищаю права покупателей новых и подержанных автомобилей. Помогаю вернуть деньги за некачественные машины и навязанные услуги.',
    caseExamples: [{ title: 'Расторжение договора купли-продажи', description: 'Добилась расторжения ДКП и возврата денег за новый автомобиль со скрытыми дефектами.' }],
    reviews: [{ author: 'Дмитрий', rating: 5, text: 'Юлия помогла мне избавиться от проблемного автомобиля и вернуть все до копейки.' }],
    registrationDate: new Date('2023-07-19T18:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 4000,
    offersFreeConsultation: false,
  },
  {
    id: 24,
    fullName: 'Титов Игорь Дмитриевич',
    photoUrl: 'https://picsum.photos/seed/lawyer24/400/400',
    city: 'Красноярск',
    phone: '79000000024',
    primarySpecialization: 'Возмещение ущерба при ДТП',
    categories: ['Автомобильное право'],
    otherSpecializations: ['Споры о размере выплаты', 'Взыскание со страховой и виновника', 'Утрата товарной стоимости'],
    experienceYears: 10,
    winRate: 93,
    consultationsHeld: 280,
    verificationStatus: 'approved',
    bio: 'Специализируюсь на полном возмещении ущерба после ДТП. Не даю страховым компаниям занижать выплаты.',
    caseExamples: [{ title: 'Взыскание недоплаченного страхового возмещения', description: 'Через суд взыскал со страховой компании 300 000 рублей, которые она недоплатила клиенту.' }],
    reviews: [{ author: 'Антон', rating: 5, text: 'Игорь помог получить справедливую выплату после аварии. Сам бы я столько не добился.' }],
    registrationDate: new Date('2022-10-03T09:00:00Z'),
    smsNotificationsEnabled: true,
    isPublished: true,
    balance: 10000,
    consultationPrice: 3000,
    offersFreeConsultation: true,
  },
];

@Injectable({
  providedIn: 'root'
})
export class LawyerService {
  private readonly LAWYER_ID_INDEX_KEY = 'yurcheck_lawyer_ids';
  private readonly LAWYER_DATA_KEY_PREFIX = 'yurcheck_lawyer_';
  private readonly LEGACY_STORAGE_KEY = 'yurcheck_lawyers'; // For migration

  private lawyers = signal<Lawyer[]>([]);

  constructor() {
    this.lawyers.set(this.loadFromStorage());
  }
  
  /**
   * Shuffles an array using the Fisher-Yates algorithm without modifying the original.
   * @param array The array to shuffle.
   * @returns A new, shuffled array.
   */
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array]; // Create a shallow copy
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  private loadFromStorage(): Lawyer[] {
    try {
      // 1. Try loading from the new, optimized storage model first.
      const idIndexStr = localStorage.getItem(this.LAWYER_ID_INDEX_KEY);
      if (idIndexStr) {
        const ids = JSON.parse(idIndexStr) as number[];
        const lawyersFromStorage = ids.map(id => {
          const lawyerStr = localStorage.getItem(`${this.LAWYER_DATA_KEY_PREFIX}${id}`);
          // Gracefully handle if a lawyer's data is somehow missing
          return lawyerStr ? this.reviveLawyer(JSON.parse(lawyerStr)) : null;
        }).filter((l): l is Lawyer => l !== null);
        // The list is now shuffled on every application load for a dynamic, yet fair, presentation.
        return this.shuffleArray(lawyersFromStorage);
      }
      
      // 2. If new storage is empty, try migrating from the old, single-key model.
      const legacyDataStr = localStorage.getItem(this.LEGACY_STORAGE_KEY);
      if (legacyDataStr) {
        console.log("Migrating from legacy storage...");
        // FIX: Cast the result of JSON.parse to `any[]` so that TypeScript correctly infers
        // the result of the `.map()` operation as `Lawyer[]`. Without this, `legacyLawyers`
        // was inferred as `any` or `unknown[]`, causing downstream type errors.
        const legacyLawyers = (JSON.parse(legacyDataStr) as any[]).map(this.reviveLawyer);
        // Shuffle legacy data as well for consistency.
        const shuffledLegacy = this.shuffleArray(legacyLawyers);
        this.saveAllLawyersToNewStorage(shuffledLegacy);
        localStorage.removeItem(this.LEGACY_STORAGE_KEY); // Clean up old key
        return shuffledLegacy;
      }

    } catch (e) {
      console.error('Failed to load lawyers from localStorage', e);
      // If localStorage contains data that is malformed, return an empty array
      // to avoid errors and not fall back to default data.
      return [];
    }
    
    // 3. If nothing in storage, initialize with default data, shuffle it, and save it.
    const shuffledData = this.shuffleArray(LAWYERS_DATA);
    this.saveAllLawyersToNewStorage(shuffledData);
    return shuffledData;
  }
  
  private reviveLawyer(lawyer: any): Lawyer {
      // If a photoUrl is a base64 string, replace it with a placeholder to avoid storage issues.
      if (lawyer.photoUrl && lawyer.photoUrl.startsWith('data:image')) {
        lawyer.photoUrl = `https://picsum.photos/seed/lawyer${lawyer.id}/400/400`;
      }

      // Backward compatibility for verification status
      let verificationStatus: Lawyer['verificationStatus'] = lawyer.verificationStatus || 'none';
      if (typeof lawyer.isVerified !== 'undefined') {
        verificationStatus = lawyer.isVerified ? 'approved' : 'none';
        delete lawyer.isVerified; // Clean up old property
      }

      return {
        ...lawyer,
        isPublished: typeof lawyer.isPublished !== 'undefined' ? lawyer.isPublished : !!lawyer.fullName,
        verificationStatus,
        registrationDate: new Date(lawyer.registrationDate),
        balance: typeof lawyer.balance !== 'undefined' ? lawyer.balance : 0,
        consultationPrice: typeof lawyer.consultationPrice !== 'undefined' ? lawyer.consultationPrice : 3000,
        offersFreeConsultation: typeof lawyer.offersFreeConsultation !== 'undefined' ? lawyer.offersFreeConsultation : true,
        freeConsultationConditions: lawyer.freeConsultationConditions || '',
      };
  }
  
  private saveAllLawyersToNewStorage(lawyers: Lawyer[]) {
    try {
      const ids = lawyers.map(l => l.id);
      localStorage.setItem(this.LAWYER_ID_INDEX_KEY, JSON.stringify(ids));
      for (const lawyer of lawyers) {
        localStorage.setItem(`${this.LAWYER_DATA_KEY_PREFIX}${lawyer.id}`, JSON.stringify(lawyer));
      }
    } catch(e) {
      console.error('Failed to save all lawyers to new storage structure', e);
    }
  }

  private _saveSingleLawyer(lawyer: Lawyer) {
    try {
      localStorage.setItem(`${this.LAWYER_DATA_KEY_PREFIX}${lawyer.id}`, JSON.stringify(lawyer));
    } catch (e) {
      console.error(`Failed to save lawyer ${lawyer.id} to localStorage`, e);
    }
  }

  private _updateIdIndex(ids: number[]) {
     try {
      localStorage.setItem(this.LAWYER_ID_INDEX_KEY, JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to update lawyer ID index in localStorage', e);
    }
  }
  
  private _removeSingleLawyer(id: number) {
     try {
      localStorage.removeItem(`${this.LAWYER_DATA_KEY_PREFIX}${id}`);
    } catch (e) {
      console.error(`Failed to remove lawyer ${id} from localStorage`, e);
    }
  }

  getLawyers() {
    return this.lawyers.asReadonly();
  }

  getLawyersByCategory(category: string) {
    return this.lawyers().filter(lawyer => lawyer.isPublished && lawyer.categories.includes(category));
  }

  getLawyerById(id: number) {
    return this.lawyers().find(lawyer => lawyer.id === id);
  }

  getLawyerByPhone(phone: string) {
    const normalizedInput = normalizePhoneNumber(phone);
    if (!normalizedInput) return undefined;
    return this.lawyers().find(lawyer => normalizePhoneNumber(lawyer.phone) === normalizedInput);
  }

  createDraftLawyer(phone: string): Lawyer {
    const newLawyer: Lawyer = {
      id: this.lawyers().length > 0 ? Math.max(...this.lawyers().map(l => l.id)) + 1 : 1,
      phone,
      fullName: '',
      photoUrl: '',
      city: '',
      primarySpecialization: '',
      categories: [],
      otherSpecializations: [],
      experienceYears: 0,
      bio: '',
      verificationStatus: 'none',
      isPublished: false,
      winRate: 0,
      consultationsHeld: 0,
      caseExamples: [],
      reviews: [],
      registrationDate: new Date(),
      smsNotificationsEnabled: true,
      balance: 0,
      consultationPrice: 0,
      offersFreeConsultation: true,
      freeConsultationConditions: ''
    };
    this.lawyers.update(currentLawyers => [newLawyer, ...currentLawyers]);
    this._saveSingleLawyer(newLawyer);
    this._updateIdIndex(this.lawyers().map(l => l.id));
    return newLawyer;
  }

  updateLawyer(updatedLawyer: Lawyer) {
    this.lawyers.update(currentLawyers => {
      const index = currentLawyers.findIndex(l => l.id === updatedLawyer.id);
      if (index !== -1) {
        const newLawyers = [...currentLawyers];
        newLawyers[index] = updatedLawyer;
        this._saveSingleLawyer(updatedLawyer);
        return newLawyers;
      }
      return currentLawyers;
    });
  }

  deleteLawyer(id: number) {
    this.lawyers.update(currentLawyers => currentLawyers.filter(l => l.id !== id));
    this._removeSingleLawyer(id);
    this._updateIdIndex(this.lawyers().map(l => l.id));
  }

  addOrUpdateCaseExample(lawyerId: number, caseData: CaseExample, caseIndex: number | null) {
      this.lawyers.update(currentLawyers => {
        const lawyerIndex = currentLawyers.findIndex(l => l.id === lawyerId);
        if (lawyerIndex === -1) return currentLawyers;

        const lawyerToUpdate = currentLawyers[lawyerIndex];
        const newCaseExamples = [...lawyerToUpdate.caseExamples];

        if (caseIndex !== null && caseIndex >= 0 && caseIndex < newCaseExamples.length) {
            // Update existing case
            newCaseExamples[caseIndex] = caseData;
        } else {
            // Add new case
            newCaseExamples.push(caseData);
        }

        const updatedLawyer: Lawyer = { ...lawyerToUpdate, caseExamples: newCaseExamples };

        const newLawyersList = [...currentLawyers];
        newLawyersList[lawyerIndex] = updatedLawyer;

        this._saveSingleLawyer(updatedLawyer);
        return newLawyersList;
    });
  }

  deleteCaseExample(lawyerId: number, caseIndex: number) {
    this.lawyers.update(currentLawyers => {
        const lawyerIndex = currentLawyers.findIndex(l => l.id === lawyerId);
        if (lawyerIndex === -1) return currentLawyers;
        
        const lawyerToUpdate = currentLawyers[lawyerIndex];

        if (caseIndex < 0 || caseIndex >= lawyerToUpdate.caseExamples.length) {
            console.error(`Invalid case index ${caseIndex} for lawyer ${lawyerId}.`);
            return currentLawyers;
        }

        const updatedCases = lawyerToUpdate.caseExamples.filter((_, index) => index !== caseIndex);
        const updatedLawyer = { ...lawyerToUpdate, caseExamples: updatedCases };

        const newLawyersList = [...currentLawyers];
        newLawyersList[lawyerIndex] = updatedLawyer;
        
        this._saveSingleLawyer(updatedLawyer);
        return newLawyersList;
    });
  }

  submitForVerification(lawyerId: number, info: VerificationInfo) {
    this.lawyers.update(currentLawyers => {
      const index = currentLawyers.findIndex(l => l.id === lawyerId);
      if (index !== -1) {
        const newLawyers = [...currentLawyers];
        // FIX: Add explicit `Lawyer` type to prevent type widening of `verificationStatus` to `string`.
        const updatedLawyer: Lawyer = {
          ...newLawyers[index],
          verificationInfo: info,
          verificationStatus: 'pending',
          rejectionReason: undefined
        };
        newLawyers[index] = updatedLawyer;
        this._saveSingleLawyer(updatedLawyer);
        return newLawyers;
      }
      return currentLawyers;
    });
  }

  updateVerificationStatus(lawyerId: number, status: 'approved' | 'rejected', reason?: string) {
    this.lawyers.update(currentLawyers => {
      const index = currentLawyers.findIndex(l => l.id === lawyerId);
      if (index !== -1) {
        const newLawyers = [...currentLawyers];
        const lawyerToUpdate = newLawyers[index];
        const updatedLawyer = {
          ...lawyerToUpdate,
          verificationStatus: status,
          rejectionReason: status === 'rejected' ? reason : undefined
        };
        newLawyers[index] = updatedLawyer;
        this._saveSingleLawyer(updatedLawyer);
        return newLawyers;
      }
      return currentLawyers;
    });
  }

  addReview(lawyerId: number, review: Review) {
    this.lawyers.update(currentLawyers => {
        const lawyerIndex = currentLawyers.findIndex(l => l.id === lawyerId);
        if (lawyerIndex === -1) return currentLawyers;

        const lawyerToUpdate = currentLawyers[lawyerIndex];
        const updatedReviews = [review, ...lawyerToUpdate.reviews];
        const updatedLawyer: Lawyer = { ...lawyerToUpdate, reviews: updatedReviews };

        const newLawyersList = [...currentLawyers];
        newLawyersList[lawyerIndex] = updatedLawyer;

        this._saveSingleLawyer(updatedLawyer);
        return newLawyersList;
    });
  }
}
