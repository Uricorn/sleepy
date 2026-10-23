// Keyword lists (regex alternations) for the on-device chat parser. English first, then the
// other supported languages. Each entry is a regex fragment; matching is case-insensitive.
// Add words here to teach the parser a new phrasing - no other code needs to change.
const join = (...a) => a.join("|");

export const BED = join(
  "went to bed|bedtime|bed time|in bed at|to bed at|bed at|went to sleep at",
  "me acosté|me acoste|hora de dormir|a la cama|fui a la cama",
  "couché|couche|au lit|heure du coucher|je me suis couché",
  "ins bett|schlafenszeit|bettzeit|zu bett",
  "fui dormir|fui para a cama|deitei|hora de dormir",
  "лег|легла|ложусь|отбой",
  "ліг|лягла|відбій",
  "sono andato a letto|a letto|andato a dormire|ora di andare a letto",
  "yattım|yatağa girdim|yatış saati|yatma saati",
  "położyłem|położyłam|poszedłem spać|poszłam spać|idę spać|do łóżka",
  "취침|잠자리|잠들러|침대에",
  "सोने गया|सोने गई|बिस्तर पर|सोने का समय",
  "上床|就寝|睡觉时间|躺下",
  "就寝|ベッドに入|寝室へ|床についた",
  "نمت في|ذهبت إلى السرير|ذهبت للنوم|وقت النوم|السرير|الفراش",
  "הלכתי לישון|הלכתי למיטה|שעת שינה|למיטה",
  "به رختخواب رفتم|رفتم بخوابم|خوابیدم در|ساعت خواب|رختخواب",
  "بستر پر گیا|بستر پر گئی|سونے گیا|سونے گئی|سونے کا وقت|بستر",
);

export const ONSET = join(
  "fell asleep|sleep onset|asleep at|sleep start|slept at",
  "me dormí|me dormi|me quedé dormido|me quedé dormida",
  "endormi|je me suis endormi|endormie",
  "eingeschlafen|schlief ein",
  "adormeci|peguei no sono",
  "уснул|уснула|заснул|заснула",
  "mi sono addormentato|mi sono addormentata|addormentato",
  "uykuya daldım|uyudum saat",
  "zasnąłem|zasnęłam|zasnąłem o|zasnęłam o|zasnąłem|zasnęłam",
  "잠들었|잠이 들",
  "नींद आई|सो गया|सो गई",
  "入睡|睡着",
  "寝落ち|眠りについた|入眠",
  "غفوت|نمت عند|نمت في الساعة|بدأ النوم",
  "נרדמתי",
  "خوابم برد|به خواب رفتم|به خواب رفتم در",
  "آنکھ لگی|سو گیا|سو گئی|نیند آئی",
);

export const WAKE = join(
  "got up|woke up|out of bed|get up|up at|woke at|out of bed at",
  "me desperté|me desperte|me levanté|me levante|desperté a las|levantarme",
  "réveillé|reveille|me suis réveillé|levé|debout à|réveil",
  "aufgewacht|wach um|aufgestanden|stand auf|wachte auf",
  "acordei|levantei|me levantei",
  "проснулся|проснулась|встал|встала|подъём|подъем",
  "прокинувся|прокинулась|встав|встала|підйом",
  "mi sono svegliato|mi sono svegliata|svegliato|svegliata|alzato|alzata|sveglia",
  "uyandım|kalktım|uyanış|kalkış",
  "obudziłem|obudziłam|wstałem|wstałam|pobudka|wstaję",
  "기상|일어났|깼",
  "जागा|जागी|उठा|उठी",
  "起床|醒来|醒了",
  "起きた|起床|目覚め|目が覚めた",
  "استيقظت|صحوت|قمت من النوم|نهضت|الاستيقاظ|استيقاظ",
  "התעוררתי|קמתי|השכמה",
  "بیدار شدم|از خواب بیدار|بلند شدم|بیداری",
  "جاگا|جاگی|اٹھا|اٹھی|بیدار ہوا|بیدار ہوئی|اٹھنے",
);

export const SLEPT = join(
  "slept|sleep|total",
  "dormí|dormi|dormido|dormida|sueño|sueno|total de",
  "dormi|dormi pendant|sommeil|total de",
  "geschlafen|schlaf|schlief|insgesamt",
  "dormi por|sono|total de",
  "спал|спала|сон|всего",
  "спав|спала|сон|всього",
  "ho dormito|dormito|sonno|totale",
  "uyudum|uyku|toplam",
  "spałem|spałam|spałem przez|sen|razem",
  "잠|수면|잤",
  "सोया|सोई|नींद|कुल",
  "睡了|睡眠|总共|共",
  "寝た|睡眠|合計|眠った",
  "نمت|النوم|إجمالي|مجموع|ساعات النوم",
  "ישנתי|שינה|סה\"כ",
  "خوابیدم|خواب|مجموع|کل",
  "سویا|سوئی|نیند|کل",
);

export const HOURS_UNIT = join(
  "h|hrs?|hours?",
  "horas?|heures?|stunden?|std|часов|часа|час|ч|годин|години|годину|ore|ora|saat|godzin|godziny|godzinę|godz",
  "시간|घंटे|घंटा|小时|小時|時間|时|ساعات|ساعة|ساعه|שעות|שעה|ساعت|گھنٹے|گھنٹہ",
);

export const MINUTES_UNIT = join(
  "m|mins?|minutes?",
  "minutos?|minutes?|minuten?|мин|хв|minuti|dakika|dk|minut|분|मिनट|分钟|分鐘|分|دقيقة|دقائق|دقيقه|דקות|דקה|دقیقه|منٹ",
);

export const AND_WORD = "and|y|et|und|e|и|і|ve|i|و|ו";

export const QUALITY = join(
  "quality|rating",
  "calidad|puntuación|puntuacion|valoración",
  "qualité|qualite|note",
  "qualität|qualitat|bewertung",
  "qualidade|nota",
  "качество|оценка",
  "якість|оцінка",
  "qualità|qualita|valutazione|voto",
  "kalite|puan",
  "jakość|jakosc|ocena",
  "수면의 질|품질|점수|질",
  "गुणवत्ता|रेटिंग",
  "质量|質量|评分|睡眠质量",
  "質|品質|評価|スコア",
  "جودة|الجودة|تقييم",
  "איכות|דירוג",
  "کیفیت|امتیاز",
  "معیار|کوالٹی|ریٹنگ",
);

export const TIRED = join(
  "woke up tired|felt tired|unrested|groggy|exhausted",
  "cansado|cansada|agotado|agotada|fatigado",
  "fatigué|fatiguée|épuisé|epuise",
  "müde|erschöpft|ausgelaugt",
  "cansado|cansada|exausto|exausta",
  "уставш|устал|разбит|разбита|невыспал",
  "втомлен|втомилась|втомився|невиспа",
  "stanco|stanca|esausto|esausta",
  "yorgun|bitkin|uykusuz",
  "zmęczon|zmeczon|niewyspan",
  "피곤|지쳤",
  "थका|थकी|थकान",
  "累|疲惫|疲倦|没睡好",
  "疲れ|だるい|眠い",
  "متعب|تعبان|منهك|مرهق|مرهقة|تعبت",
  "עייף|עייפה|תשוש",
  "خسته|کسل|بیحال",
  "تھکا|تھکی|تھکاوٹ",
);

export const RESTED = join(
  "well rested|felt rested|refreshed|energetic",
  "descansado|descansada|renovado|con energía|con energia",
  "reposé|reposée|en forme|plein d'énergie|plein d'energie",
  "ausgeruht|erholt|fit",
  "descansado|descansada|disposto|disposta",
  "выспал|отдохнул|бодр|свеж",
  "виспа|відпочив|бадьор",
  "riposato|riposata|energico|energica",
  "dinlenmiş|dinlendim|enerjik|zinde",
  "wyspan|wypoczęt|wypoczet|pełen energii",
  "개운|상쾌|푹 쉬",
  "तरोताज़ा|आराम मिला|ऊर्जावान",
  "精神|休息好|睡得好|神清气爽",
  "すっきり|爽快|元気|よく眠れ",
  "مرتاح|مرتاحة|نشيط|نشيطة|منتعش|مستريح",
  "ערני|נינוח|רענן|נרגע",
  "سرحال|استراحت|شاداب|انرژی",
  "تازہ دم|آرام|توانا|چاق",
);

export const AWAKENINGS = join(
  "night awakenings?|awakenings?",
  "despertares|despertares nocturnos|me desperté a las",
  "réveils nocturnes|réveils|reveils",
  "nächtliches aufwachen|aufwachen|wachphasen",
  "despertares noturnos|despertares",
  "ночные пробуждения|пробуждения|просыпался в|просыпалась в",
  "нічні пробудження|пробудження",
  "risvegli notturni|risvegli",
  "gece uyanmaları|uyanmalar|gece uyandım",
  "przebudzenia|nocne przebudzenia",
  "야간 각성|깬 시간|각성",
  "रात में जागना|जागना",
  "夜间醒来|夜醒|醒来次数",
  "夜中に目が覚め|中途覚醒|夜間覚醒",
  "استيقاظ ليلي|الاستيقاظ ليلا|استيقاظات|استيقظت ليلا|صحيت",
  "התעוררויות|התעוררות בלילה",
  "بیدار شدن شبانه|بیداری‌های شبانه|بیداری شبانه",
  "رات کو جاگنا|رات میں جاگنا|جاگنا",
);

export const NOTES = join(
  "additional\\s+notes?|notes?",
  "notas?|observaciones",
  "remarques?|notes?",
  "notizen|notiz|anmerkung",
  "observações|observacoes|notas?",
  "заметки|заметка|примечание",
  "нотатки|нотатка|примітка",
  "appunti",
  "notlar",
  "notatki|notatka|uwagi",
  "메모|노트",
  "नोट्स|नोट|टिप्पणी",
  "备注|笔记|附注",
  "メモ|ノート|備考",
  "ملاحظات|ملاحظة",
  "הערות|הערה",
  "یادداشت|توضیحات",
  "نوٹس|نوٹ",
);

export const SCREENSHOT = join(
  "screenshot|image|photo|picture|upload",
  "captura|imagen|foto|subir",
  "capture d'écran|image|photo|téléverser",
  "bildschirmfoto|bild|foto|hochladen",
  "imagem|enviar",
  "скриншот|скрин|снимок экрана|фото|изображение",
  "знімок екрана|скріншот|фото",
  "schermata|immagine|foto|carica",
  "ekran görüntüsü|resim|fotoğraf",
  "zrzut ekranu|obraz|zdjęcie",
  "스크린샷|이미지|사진",
  "स्क्रीनशॉट|तस्वीर|फोटो",
  "截图|图片|照片",
  "スクリーンショット|画像|写真",
  "لقطة شاشة|لقطات الشاشة|صورة",
  "צילום מסך|תמונה",
  "تصویر صفحه|عکس",
  "اسکرین شاٹ|تصویر",
);

// Localized am/pm suffixes (Arabic ص/م). Mapped to "am"/"pm" by the parser.
export const AMPM = "am|pm|a\\.m\\.|p\\.m\\.|ص|م";
export const AM_SET = new Set(["am", "ص"]);
export const PM_SET = new Set(["pm", "م"]);
