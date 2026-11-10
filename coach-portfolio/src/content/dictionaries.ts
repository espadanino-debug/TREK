import type { Locale } from "./site";

export type Dictionary = {
  meta: { title: string; description: string };
  nav: {
    links: { href: string; label: string }[];
    cta: string;
    menu: string;
    close: string;
    switchTo: string;
    switchLabel: string;
  };
  preloader: { loading: string };
  hero: {
    eyebrow: string[];
    title: string[];
    sub: string;
    cta: string;
    secondary: string;
    scroll: string;
  };
  marquee: string[];
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    certLabel: string;
    photoLabel: string;
    stats: { value: string; label: string }[];
  };
  method: {
    eyebrow: string;
    title: string;
    intro: string;
    step: string;
    steps: { title: string; text: string }[];
  };
  programs: {
    eyebrow: string;
    title: string;
    cta: string;
    items: { tag: string; title: string; text: string; points: string[] }[];
  };
  results: {
    eyebrow: string;
    title: string;
    text: string;
    before: string;
    after: string;
    drag: string;
    photoHint: string;
    points: string[];
  };
  testimonials: {
    eyebrow: string;
    title: string;
    exampleTag: string;
    items: { quote: string; name: string; meta: string }[];
  };
  pricing: {
    eyebrow: string;
    title: string;
    sub: string;
    currency: string;
    per: string;
    popular: string;
    cta: string;
    note: string;
    plans: { name: string; tagline: string; features: string[] }[];
  };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  cta: { eyebrow: string; title: string[]; sub: string; button: string };
  footer: {
    tagline: string;
    country: string;
    formats: string;
    langs: string;
    navTitle: string;
    contactTitle: string;
    rights: string;
    top: string;
  };
  whatsapp: { message: string; plan: string };
};

const fr: Dictionary = {
  meta: {
    title: "Coach perte de poids au Maroc",
    description:
      "Coaching perte de poids pour débutants au Maroc, en ligne ou en présentiel. Programme sur mesure et suivi humain. Consultation gratuite sur WhatsApp.",
  },
  nav: {
    links: [
      { href: "#about", label: "À propos" },
      { href: "#method", label: "Méthode" },
      { href: "#programs", label: "Programmes" },
      { href: "#pricing", label: "Tarifs" },
      { href: "#faq", label: "FAQ" },
    ],
    cta: "Consultation gratuite",
    menu: "Menu",
    close: "Fermer",
    switchTo: "العربية",
    switchLabel: "Passer en arabe",
  },
  preloader: { loading: "Chargement" },
  hero: {
    eyebrow: ["Coach certifié", "Maroc", "En ligne et présentiel"],
    title: ["Moins de poids.", "Plus de vie."],
    sub: "Coaching perte de poids pour débutants, en ligne ou en présentiel au Maroc. Un plan simple, humain, construit autour de ta vie.",
    cta: "Réserver une consultation gratuite",
    secondary: "Découvrir la méthode",
    scroll: "Défiler",
  },
  marquee: ["Perte de poids", "Transformation", "Débutants bienvenus", "En ligne", "Présentiel", "Maroc"],
  about: {
    eyebrow: "À propos",
    title: "Pas besoin d'être sportif pour commencer.",
    paragraphs: [
      "J'accompagne les personnes qui veulent perdre du poids et transformer leur corps, pas à pas, sans pression et sans régime extrême.",
      "Que tu n'aies jamais mis les pieds dans une salle ou que tu reprennes après une longue pause, on part de ton niveau et on construit des habitudes qui tiennent.",
    ],
    certLabel: "Certification",
    photoLabel: "Portrait du coach",
    stats: [
      { value: "100%", label: "Programme sur mesure" },
      { value: "0", label: "Régime extrême" },
      { value: "1:1", label: "Suivi personnel" },
      { value: "2", label: "Formats: en ligne et présentiel" },
    ],
  },
  method: {
    eyebrow: "La méthode",
    title: "Quatre étapes. Zéro prise de tête.",
    intro: "Un cadre clair pour avancer, même en partant de zéro.",
    step: "Étape",
    steps: [
      {
        title: "Consultation gratuite",
        text: "On parle de ton objectif, de ton quotidien et de ce qui t'a bloqué jusqu'ici. Sans engagement.",
      },
      {
        title: "Plan sur mesure",
        text: "Entraînement et alimentation adaptés à ton niveau, ton emploi du temps et les plats que tu aimes.",
      },
      {
        title: "Suivi chaque semaine",
        text: "On fait le point, on ajuste le plan, et je reste disponible sur WhatsApp quand tu as une question.",
      },
      {
        title: "Résultats qui durent",
        text: "L'objectif n'est pas seulement la balance. Ce sont des habitudes que tu gardes après le coaching.",
      },
    ],
  },
  programs: {
    eyebrow: "Programmes",
    title: "Choisis ta façon d'avancer.",
    cta: "En parler sur WhatsApp",
    items: [
      {
        tag: "Partout",
        title: "Coaching en ligne",
        text: "Ton programme et ton suivi dans ta poche, où que tu sois.",
        points: ["Programme d'entraînement personnalisé", "Plan alimentaire simple", "Suivi et ajustements à distance"],
      },
      {
        tag: "Maroc",
        title: "Coaching en présentiel",
        text: "Des séances encadrées en personne pour apprendre les bons gestes.",
        points: ["Séances guidées pas à pas", "Technique et posture corrigées", "Motivation sur place"],
      },
      {
        tag: "Hybride",
        title: "Formule mixte",
        text: "Le meilleur des deux: des séances en personne et un suivi en ligne entre deux.",
        points: ["Séances en présentiel", "Programme en autonomie", "Suivi WhatsApp continu"],
      },
    ],
  },
  results: {
    eyebrow: "Transformations",
    title: "Le changement se voit. Et il se garde.",
    text: "Pas de promesse magique: chaque corps avance à son rythme. Ce que je garantis, c'est un plan clair, un suivi sérieux et quelqu'un à tes côtés du premier au dernier jour.",
    before: "Avant",
    after: "Après",
    drag: "Glisser pour comparer",
    photoHint: "Photo client à venir",
    points: ["Progression mesurée chaque semaine", "Habitudes construites pour durer", "Adapté à la cuisine marocaine"],
  },
  testimonials: {
    eyebrow: "Témoignages",
    title: "Ce qu'ils en disent.",
    exampleTag: "Exemple",
    items: [
      {
        quote: "Je n'avais jamais fait de sport. Aujourd'hui, l'entraînement fait partie de ma semaine.",
        name: "Prénom N.",
        meta: "Coaching en ligne",
      },
      {
        quote: "Un plan simple, des explications claires. Pour la première fois, j'ai tenu sur la durée.",
        name: "Prénom N.",
        meta: "Coaching en présentiel",
      },
      {
        quote: "Je mange toujours les plats que j'aime. J'ai juste appris à mieux les équilibrer.",
        name: "Prénom N.",
        meta: "Formule mixte",
      },
      {
        quote: "Le suivi chaque semaine a tout changé. Je ne me suis jamais sentie seule face à mon objectif.",
        name: "Prénom N.",
        meta: "Coaching en ligne",
      },
      {
        quote: "Aucun jugement, beaucoup d'écoute. J'ai repris confiance en moi séance après séance.",
        name: "Prénom N.",
        meta: "Coaching en présentiel",
      },
      {
        quote: "Je pensais ne pas avoir le temps. Le programme s'est adapté à mes horaires de travail.",
        name: "Prénom N.",
        meta: "Coaching en ligne",
      },
    ],
  },
  pricing: {
    eyebrow: "Tarifs",
    title: "Un prix clair. Aucun engagement caché.",
    sub: "Chaque formule commence par une consultation gratuite.",
    currency: "DH",
    per: "par mois",
    popular: "Le plus choisi",
    cta: "Choisir cette formule",
    note: "On valide ensemble la formule la plus adaptée pendant la consultation gratuite.",
    plans: [
      {
        name: "Départ",
        tagline: "Pour démarrer en autonomie",
        features: ["Programme d'entraînement personnalisé", "Guide alimentaire simple", "Bilan mensuel"],
      },
      {
        name: "Transformation",
        tagline: "L'accompagnement complet en ligne",
        features: [
          "Entraînement et alimentation sur mesure",
          "Bilan chaque semaine",
          "Support WhatsApp",
          "Ajustements continus",
        ],
      },
      {
        name: "Présentiel",
        tagline: "Des séances en personne",
        features: ["Séances encadrées", "Entraînement et alimentation sur mesure", "Bilan chaque semaine", "Support WhatsApp"],
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Les questions qu'on me pose.",
    items: [
      {
        q: "Je n'ai jamais fait de sport. Est-ce que c'est pour moi ?",
        a: "Oui. Le coaching est pensé pour les débutants: on part de ton niveau actuel, avec des exercices simples et une progression douce.",
      },
      {
        q: "Faut-il être inscrit dans une salle de sport ?",
        a: "Non. Ton programme s'adapte à ce que tu as: à la maison, en salle ou en extérieur.",
      },
      {
        q: "Comment se passe la consultation gratuite ?",
        a: "C'est un échange sur WhatsApp pour parler de ton objectif et de ton quotidien, et voir si on est faits pour travailler ensemble. Sans engagement.",
      },
      {
        q: "En combien de temps vais-je voir des résultats ?",
        a: "Chaque corps est différent, donc pas de promesse magique. Ce qui compte, c'est la régularité: on fixe des objectifs réalistes et on mesure ta progression chaque semaine.",
      },
      {
        q: "Est-ce que je dois suivre un régime strict ?",
        a: "Non. On construit une alimentation équilibrée autour des plats que tu aimes, cuisine marocaine comprise.",
      },
      {
        q: "Quelle différence entre le coaching en ligne et en présentiel ?",
        a: "En ligne, le programme, le suivi et les échanges se font à distance. En présentiel, les séances sont encadrées en personne. Tu peux aussi combiner les deux.",
      },
      {
        q: "Dans quelle langue se fait le coaching ?",
        a: "En français, en arabe ou en darija, comme tu préfères.",
      },
    ],
  },
  cta: {
    eyebrow: "On commence ?",
    title: ["Le premier pas", "est gratuit."],
    sub: "Écris-moi sur WhatsApp. On parle de ton objectif, sans engagement.",
    button: "Réserver une consultation gratuite",
  },
  footer: {
    tagline: "Coaching perte de poids et transformation physique pour débutants.",
    country: "Maroc",
    formats: "En ligne et en présentiel",
    langs: "Français · العربية · الدارجة",
    navTitle: "Navigation",
    contactTitle: "Contact",
    rights: "Tous droits réservés.",
    top: "Haut de page",
  },
  whatsapp: {
    message: "Bonjour, je souhaite réserver une consultation gratuite.",
    plan: "Bonjour, je suis intéressé(e) par la formule",
  },
};

const ar: Dictionary = {
  meta: {
    title: "كوتش نقص الوزن فالمغرب",
    description:
      "كوتشينغ نقص الوزن وتحول الجسم للمبتدئين فالمغرب. برنامج على قدك ومتابعة شخصية، أونلاين ولا حضوري. استشارة مجانية فواتساب.",
  },
  nav: {
    links: [
      { href: "#about", label: "شكون أنا" },
      { href: "#method", label: "الطريقة" },
      { href: "#programs", label: "البرامج" },
      { href: "#pricing", label: "الأثمنة" },
      { href: "#faq", label: "أسئلة" },
    ],
    cta: "استشارة مجانية",
    menu: "القائمة",
    close: "سد",
    switchTo: "Français",
    switchLabel: "بدل للفرنسية",
  },
  preloader: { loading: "جاري التحميل" },
  hero: {
    eyebrow: ["كوتش معتمد", "المغرب", "أونلاين وحضوري"],
    title: ["وزن أقل.", "حياة أكثر."],
    sub: "كوتشينغ نقص الوزن للمبتدئين، أونلاين ولا حضوري فالمغرب. برنامج بسيط وإنساني، مصاوب على قد حياتك.",
    cta: "حجز استشارة مجانية",
    secondary: "شوف الطريقة",
    scroll: "هبط",
  },
  marquee: ["نقص الوزن", "تحول الجسم", "مرحبا بالمبتدئين", "أونلاين", "حضوري", "المغرب"],
  about: {
    eyebrow: "شكون أنا",
    title: "ما خاصكش تكون رياضي باش تبدا.",
    paragraphs: [
      "كنعاون الناس اللي باغيين ينقصو الوزن ويبدلو جسمهم، خطوة بخطوة، بلا ضغط وبلا ريجيم قاسي.",
      "سوا عمرك ما دخلتي لصالة ولا راجع من بعد توقف طويل، كنبداو من المستوى ديالك وكنبنيو عادات كتبقى معاك.",
    ],
    certLabel: "الشهادة",
    photoLabel: "صورة الكوتش",
    stats: [
      { value: "100%", label: "برنامج على قدك" },
      { value: "0", label: "ريجيم قاسي" },
      { value: "1:1", label: "متابعة شخصية" },
      { value: "2", label: "صيغ: أونلاين وحضوري" },
    ],
  },
  method: {
    eyebrow: "الطريقة",
    title: "ربعة ديال الخطوات. بلا تعقيد.",
    intro: "إطار واضح باش تتقدم، واخا تكون بادي من الزيرو.",
    step: "الخطوة",
    steps: [
      {
        title: "استشارة مجانية",
        text: "كنهضرو على الهدف ديالك، النهار ديالك والحوايج اللي كانو حابسينك. بلا التزام.",
      },
      {
        title: "برنامج على قدك",
        text: "تمارين وتغذية مصاوبين على المستوى ديالك، الوقت ديالك والماكلة اللي كتعجبك.",
      },
      {
        title: "متابعة كل سيمانة",
        text: "كنشوفو فين وصلتي، كنعدلو البرنامج، وكنبقى معاك فواتساب إلا كان عندك شي سؤال.",
      },
      {
        title: "نتيجة كتبقى",
        text: "الهدف ماشي غير الميزان. الهدف هو عادات كتبقى معاك من بعد الكوتشينغ.",
      },
    ],
  },
  programs: {
    eyebrow: "البرامج",
    title: "اختار الطريقة اللي كتناسبك.",
    cta: "هضر معايا فواتساب",
    items: [
      {
        tag: "فين ما كنتي",
        title: "كوتشينغ أونلاين",
        text: "البرنامج والمتابعة ديالك فجيبك، فين ما كنتي.",
        points: ["برنامج تمارين شخصي", "نظام غذائي بسيط", "متابعة وتعديلات عن بعد"],
      },
      {
        tag: "المغرب",
        title: "كوتشينغ حضوري",
        text: "حصص مؤطرة وجها لوجه باش تتعلم الحركات الصحيحة.",
        points: ["حصص موجهة خطوة بخطوة", "تصحيح التقنية والوضعية", "تحفيز فعين المكان"],
      },
      {
        tag: "مختلط",
        title: "الصيغة المختلطة",
        text: "أحسن ما فالجوج: حصص حضورية ومتابعة أونلاين بيناتهم.",
        points: ["حصص حضورية", "برنامج كتطبقو بوحدك", "متابعة مستمرة فواتساب"],
      },
    ],
  },
  results: {
    eyebrow: "التحولات",
    title: "التغيير كيبان. وكيبقى.",
    text: "ما كاين حتى وعد سحري: كل جسم كيتقدم بالإيقاع ديالو. اللي كنضمن ليك هو برنامج واضح، متابعة جدية، وواحد واقف معاك من النهار الأول حتى للآخر.",
    before: "قبل",
    after: "بعد",
    drag: "جر باش تقارن",
    photoHint: "صورة العميل قريبا",
    points: ["تقدم كيتقاس كل سيمانة", "عادات مبنية باش تبقى", "مناسب للماكلة المغربية"],
  },
  testimonials: {
    eyebrow: "آراء",
    title: "آش كيقولو.",
    exampleTag: "مثال",
    items: [
      { quote: "عمري ما درت الرياضة. دابا التمرين ولى جزء من السيمانة ديالي.", name: "الاسم ن.", meta: "كوتشينغ أونلاين" },
      { quote: "برنامج بسيط وشرح واضح. أول مرة كنكمل بلا ما نحبس.", name: "الاسم ن.", meta: "كوتشينغ حضوري" },
      { quote: "باقي كناكل الماكلة اللي كتعجبني. غير تعلمت كيفاش نوازنها.", name: "الاسم ن.", meta: "الصيغة المختلطة" },
      { quote: "المتابعة كل سيمانة بدلات كلشي. عمري ما حسيت براسي بوحدي.", name: "الاسم ن.", meta: "كوتشينغ أونلاين" },
      { quote: "بلا حكم وبزاف ديال الإنصات. رجعات ليا الثقة حصة من بعد حصة.", name: "الاسم ن.", meta: "كوتشينغ حضوري" },
      { quote: "كنت كنظن ما عنديش الوقت. البرنامج تصاوب على أوقات الخدمة ديالي.", name: "الاسم ن.", meta: "كوتشينغ أونلاين" },
    ],
  },
  pricing: {
    eyebrow: "الأثمنة",
    title: "ثمن واضح. بلا مفاجآت.",
    sub: "كل صيغة كتبدا باستشارة مجانية.",
    currency: "درهم",
    per: "فالشهر",
    popular: "الأكثر اختيارا",
    cta: "اختار هاد الصيغة",
    note: "كنختارو مع بعضياتنا الصيغة اللي مناسبة ليك فالاستشارة المجانية.",
    plans: [
      {
        name: "البداية",
        tagline: "باش تبدا بوحدك",
        features: ["برنامج تمارين شخصي", "دليل تغذية بسيط", "تقييم كل شهر"],
      },
      {
        name: "التحول",
        tagline: "المرافقة الكاملة أونلاين",
        features: ["تمارين وتغذية على قدك", "تقييم كل سيمانة", "دعم فواتساب", "تعديلات مستمرة"],
      },
      {
        name: "حضوري",
        tagline: "حصص وجها لوجه",
        features: ["حصص مؤطرة", "تمارين وتغذية على قدك", "تقييم كل سيمانة", "دعم فواتساب"],
      },
    ],
  },
  faq: {
    eyebrow: "أسئلة",
    title: "الأسئلة اللي كيتطرحو عليا.",
    items: [
      {
        q: "عمري ما درت الرياضة. واش هادشي ليا؟",
        a: "إيه. الكوتشينغ مصاوب للمبتدئين: كنبداو من المستوى ديالك، بتمارين بسيطة وتقدم بشوية بشوية.",
      },
      {
        q: "واش خاصني نكون مسجل فصالة؟",
        a: "لا. البرنامج كيتصاوب على اللي عندك: فالدار، فالصالة ولا على برا.",
      },
      {
        q: "كيفاش كتدوز الاستشارة المجانية؟",
        a: "هي هضرة فواتساب على الهدف ديالك والنهار ديالك، وكنشوفو واش نقدرو نخدمو مع بعضياتنا. بلا التزام.",
      },
      {
        q: "شحال ديال الوقت باش نشوف النتيجة؟",
        a: "كل جسم مختلف، داكشي علاش ما كاين حتى وعد سحري. المهم هو الاستمرارية: كنحطو أهداف واقعية وكنقيسو التقدم كل سيمانة.",
      },
      {
        q: "واش خاصني ندير ريجيم قاسي؟",
        a: "لا. كنبنيو تغذية متوازنة على الماكلة اللي كتعجبك، والماكلة المغربية داخلة فيها.",
      },
      {
        q: "شنو الفرق بين الأونلاين والحضوري؟",
        a: "فالأونلاين، البرنامج والمتابعة كيدوزو عن بعد. فالحضوري، الحصص كتكون وجها لوجه. وتقدر تجمع بيناتهم.",
      },
      {
        q: "بأي لغة كيدوز الكوتشينغ؟",
        a: "بالفرنسية، بالعربية ولا بالدارجة، كيفما بغيتي.",
      },
    ],
  },
  cta: {
    eyebrow: "نبداو؟",
    title: ["الخطوة الأولى", "فابور."],
    sub: "كتب ليا فواتساب. كنهضرو على الهدف ديالك، بلا التزام.",
    button: "حجز استشارة مجانية",
  },
  footer: {
    tagline: "كوتشينغ نقص الوزن وتحول الجسم للمبتدئين.",
    country: "المغرب",
    formats: "أونلاين وحضوري",
    langs: "Français · العربية · الدارجة",
    navTitle: "التصفح",
    contactTitle: "تواصل",
    rights: "جميع الحقوق محفوظة.",
    top: "طلع الفوق",
  },
  whatsapp: {
    message: "السلام عليكم، بغيت نحجز استشارة مجانية.",
    plan: "السلام عليكم، مهتم بصيغة",
  },
};

const dictionaries: Record<Locale, Dictionary> = { fr, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
