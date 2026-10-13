import {
  BabyIcon,
  CrownIcon,
  FirstAidIcon,
  LightningIcon,
  DropIcon,
  SmileyIcon,
  SparkleIcon,
  SunIcon,
  ToothIcon,
  type Icon,
} from '@phosphor-icons/react';

import { illustrations, laserPhotos, photos, type Photo } from './photos';

/** Treatments and doctors, from the clinic's own list and signage. Pages read from here. */

export type Treatment = {
  slug: string;
  Icon: Icon;
  name: string;
  /** Shorter label for chips and tight spaces (defaults to name). */
  shortName?: string;
  summary: string;
  /** One line under the name in the treatments menu. */
  menuLine: string;
  /** Shown on the home page hero and showcase (two per specialist). */
  featured: boolean;
  /** Which speciality leads it (links the treatment to that doctor). */
  ledBy?: 'Orthodontics' | 'Prosthodontics';
  /** Short benefit chips. General information, to be reviewed by the clinic. */
  highlights: string[];
  illustration: Photo;
  photo: Photo;
  /** Plain-language explanation for the treatment page. */
  intro: string;
  steps: { title: string; body: string }[];
};

// The clinic's treatment list, in the clinic's own order.
// TODO(clinic): review the treatment copy with the doctors.
export const treatments: Treatment[] = [
  {
    slug: 'braces',
    Icon: SmileyIcon,
    name: 'Orthodontic braces',
    shortName: 'Braces',
    menuLine: 'Metal, ceramic and self-ligating braces',
    featured: true,
    ledBy: 'Orthodontics',
    summary:
      'Orthodontic braces are small devices used to straighten crooked teeth, close gaps, and fix your bite.',
    highlights: ['Metal or tooth-coloured', 'Suits complex cases', 'Regular adjustments'],
    illustration: illustrations.braces,
    photo: photos.bracesModels,
    intro:
      'Small brackets are fixed on your teeth and connected with a thin wire. This wire puts gentle, continuous pressure and slowly moves teeth into the correct position over 12–18 months.',
    steps: [
      { title: 'Records', body: 'Photos, scans and X-rays show how your teeth and bite line up.' },
      { title: 'Fitting', body: 'Brackets are bonded to the teeth and the first wire is placed.' },
      { title: 'Adjustments', body: 'Short visits every few weeks move the teeth step by step.' },
      { title: 'Retainer', body: 'A retainer keeps the new position once braces come off.' },
    ],
  },
  {
    slug: 'aligners',
    Icon: SmileyIcon,
    name: 'Clear aligners',
    shortName: 'Aligners',
    menuLine: 'Invisalign and clear aligners',
    featured: true,
    ledBy: 'Orthodontics',
    summary:
      'Clear aligners are the modern, invisible alternative to braces for straightening teeth.',
    highlights: ['Invisalign provider', 'Removable to eat', 'Digitally planned'],
    illustration: illustrations.smileBlue,
    photo: photos.aligners,
    intro:
      'Clear aligners are a set of custom-made, transparent, removable trays that slowly move teeth into the perfect position. You get a series of aligners: each set is worn for 10–14 days, then you switch to the next. Each tray shifts teeth a little — until you get your perfect smile.',
    steps: [
      { title: 'Digital scan', body: 'A 3D scan of your teeth replaces messy impressions.' },
      { title: 'Your plan', body: 'You see the planned movement of every tooth before you start.' },
      { title: 'Aligners', body: 'Wear each set about 22 hours a day, removing it to eat.' },
      { title: 'Retainer', body: 'A retainer keeps the new position once treatment ends.' },
    ],
  },
  {
    slug: 'implants',
    Icon: ToothIcon,
    name: 'Dental implants',
    shortName: 'Implants',
    menuLine: 'Single, multiple and full-arch implants',
    featured: true,
    ledBy: 'Prosthodontics',
    summary: 'The most advanced and natural way to replace a missing tooth.',
    highlights: [
      'Fixed, not removable',
      'Looks like a natural tooth',
      'Helps preserve the jawbone',
    ],
    illustration: illustrations.toothPlus,
    photo: photos.implantModel,
    intro:
      'A small, biocompatible titanium screw is fixed into your jawbone where the tooth is missing. After it heals and fuses with the bone, a strong, natural-looking cap (crown) is placed on top of it. Think of it as an artificial tooth root.',
    steps: [
      {
        title: 'Assessment',
        body: 'X-rays and scans check the bone and plan the implant position.',
      },
      { title: 'Placement', body: 'The post is placed in the jawbone under local anaesthesia.' },
      { title: 'Healing', body: 'Over a few months, the bone grows around the post.' },
      { title: 'Crown', body: 'A crown matched to your teeth is fixed on top.' },
    ],
  },
  {
    slug: 'veneers',
    Icon: SparkleIcon,
    name: 'Veneers and laminates',
    shortName: 'Veneers',
    menuLine: 'Thin shells for shape and shade',
    featured: false,
    ledBy: 'Prosthodontics',
    summary:
      'Ultra-thin, tooth-coloured shells placed on the front of your teeth to give you a perfect, celebrity-like smile.',
    highlights: ['Natural-looking', 'Stain-resistant porcelain', 'Little tooth removal'],
    illustration: illustrations.smileTeal,
    photo: photos.veneers,
    intro:
      'Think of veneers and laminates as a designer makeover for your teeth. We lightly shape the front surface and bond a custom-made, natural-looking veneer. In 2–3 visits, your smile is completely transformed.',
    steps: [
      { title: 'Smile plan', body: 'Photos and a preview show the planned shape and shade.' },
      { title: 'Preparation', body: 'A very thin layer of enamel is shaped, if needed.' },
      { title: 'Trial', body: 'You check the look before the veneers are finished.' },
      { title: 'Bonding', body: 'The veneers are bonded in place and polished.' },
    ],
  },
  {
    slug: 'tooth-coloured-fillings',
    Icon: ToothIcon,
    name: 'Tooth-coloured fillings',
    shortName: 'Fillings',
    menuLine: 'Composite, tooth-coloured fillings',
    featured: false,
    summary:
      'Natural-looking fillings used to repair a tooth damaged by cavities or a small chip or break.',
    highlights: ['Matched to your shade', 'Bonded to the tooth', 'Single visit (15–20 mins)'],
    illustration: illustrations.tooth,
    photo: photos.fillings,
    intro:
      'Unlike old silver (amalgam) fillings which look black, tooth-coloured fillings (composite fillings) are made of a tooth-coloured composite resin that exactly matches your natural tooth shade — so no one can tell you have a filling.',
    steps: [
      { title: 'Check', body: 'The tooth is examined, with an X-ray if needed.' },
      { title: 'Cleaning', body: 'Decay is removed gently, usually under local anaesthesia.' },
      {
        title: 'Filling',
        body: 'Shade-matched resin is placed in layers and hardened with light.',
      },
      { title: 'Polish', body: 'The filling is shaped to your bite and polished.' },
    ],
  },
  {
    slug: 'smile-design',
    Icon: SparkleIcon,
    name: 'Smile designing',
    shortName: 'Smile design',
    menuLine: 'A planned smile makeover',
    featured: true,
    ledBy: 'Prosthodontics',
    summary:
      'A complete makeover of your smile — not just teeth, but your whole face, lips, and personality.',
    highlights: ['Shape and shade', 'Planned before treatment', 'Combines treatments'],
    illustration: illustrations.smileOrange,
    photo: photos.smileDesign,
    intro:
      'We don’t just fix teeth, we design a smile that looks perfect on you. We consider your face shape, lip line, skin tone, age, gender, and what you want, then combine treatments like whitening, veneers, aligners or braces, gum contouring and tooth-coloured fillings to get there.',
    steps: [
      { title: 'Photos and scans', body: 'Your face, lips and teeth are recorded together.' },
      { title: 'Digital preview', body: 'You see the proposed smile before anything changes.' },
      { title: 'Treatment', body: 'Whitening, veneers, crowns or aligners, in the planned order.' },
    ],
  },
  {
    slug: 'root-canal',
    Icon: ToothIcon,
    name: 'Root canal treatment (RCT)',
    shortName: 'Root canal',
    menuLine: 'Save an infected or painful tooth',
    featured: false,
    summary:
      'A treatment to save a badly decayed, painful, or infected tooth — so you don’t have to remove it.',
    highlights: ['Relieves tooth pain', 'Saves your own tooth', 'Done under anaesthesia'],
    illustration: illustrations.calendar,
    photo: photos.xrayTall,
    intro:
      'Inside your tooth there is soft tissue called pulp (nerve). When it gets infected, we remove the infected pulp, clean and disinfect the inside canals, fill them with a safe material and protect the tooth with a cap (crown). With modern anaesthesia and digital X-rays, it feels just like getting a normal filling done.',
    steps: [
      { title: 'Diagnosis', body: 'An X-ray shows the infection and the shape of the roots.' },
      { title: 'Removal', body: 'The infected pulp is removed, painlessly with anaesthesia.' },
      { title: 'Cleaning', body: 'The inside canals are cleaned and disinfected.' },
      { title: 'Filling', body: 'The canals are filled with a safe material.' },
      { title: 'Crown', body: 'A cap (crown) protects the treated tooth.' },
    ],
  },
  {
    slug: 'full-mouth-rehabilitation',
    Icon: SmileyIcon,
    name: 'Full mouth rehabilitation (FMR)',
    shortName: 'Full mouth rehab',
    menuLine: 'Rebuild every tooth and your bite',
    featured: false,
    ledBy: 'Prosthodontics',
    summary:
      'A complete restoration of your entire mouth to bring back chewing, speaking, and a beautiful smile.',
    highlights: ['One complete plan', 'Restores your bite', 'Planned with 3D scans'],
    illustration: illustrations.smileGreen,
    photo: photos.fullMouth,
    intro:
      'When most of your teeth are damaged, worn out, or missing, full mouth rehabilitation rebuilds your whole smile. We combine multiple treatments together based on your needs: implants, crowns and bridges, root canals, aligners or braces, and veneers.',
    steps: [
      { title: 'Full assessment', body: 'X-rays, scans and bite records of both jaws.' },
      { title: 'Your plan', body: 'A staged plan with timings, options and costs.' },
      { title: 'Trial', body: 'Temporary teeth test the new bite and look.' },
      { title: 'Final teeth', body: 'The permanent crowns, bridges or implants are fitted.' },
    ],
  },
  {
    slug: 'dentures',
    Icon: SparkleIcon,
    name: 'Dentures',
    menuLine: 'Complete, partial, flexible or implant-supported',
    featured: false,
    ledBy: 'Prosthodontics',
    summary: 'Removable artificial teeth used to replace all or many missing teeth.',
    highlights: ['Complete, partial or flexible', 'Natural-looking', 'Implant-supported options'],
    illustration: illustrations.smilePurple,
    photo: photos.dentures,
    intro:
      'If you have lost most or all of your teeth due to age, decay, or gum disease, dentures help you eat, speak, and smile confidently again. Complete dentures replace a full arch, partial dentures fill gaps between natural teeth, flexible dentures are thin and metal-free, and implant-supported dentures stay firmly in place.',
    steps: [
      { title: 'Impressions', body: 'Detailed impressions record your gums and bite.' },
      {
        title: 'Try-in',
        body: 'You check the look and fit of the teeth before they are finished.',
      },
      { title: 'Fitting', body: 'The finished denture is fitted and adjusted for comfort.' },
    ],
  },
  {
    slug: 'teeth-cleaning',
    Icon: DropIcon,
    name: 'Professional teeth cleaning (scaling & polishing)',
    shortName: 'Teeth cleaning',
    menuLine: 'Scaling, polishing and gum care',
    featured: false,
    summary: 'Removes the plaque and tartar that daily brushing can’t reach, safely.',
    highlights: ['Removes tartar', 'Fresher breath', 'Protects your gums'],
    illustration: illustrations.toothbrush,
    photo: photos.procedure,
    intro:
      'Even with daily brushing, plaque and tartar build up in places you can’t reach — which causes bad breath, yellow teeth, bleeding gums and cavities. We use ultrasonic scalers to remove plaque, tartar and stains from above and below the gums, then polish teeth to make them smooth and shiny.',
    steps: [
      { title: 'Check-up', body: 'Your teeth and gums are examined.' },
      {
        title: 'Scaling',
        body: 'Ultrasonic scalers remove plaque, tartar and stains from above and below the gums.',
      },
      { title: 'Polishing', body: 'Teeth are polished to make them smooth and shiny.' },
      { title: 'Advice', body: 'Simple tips to keep your gums healthy at home.' },
    ],
  },
  {
    slug: 'teeth-whitening',
    Icon: SunIcon,
    name: 'Teeth whitening',
    shortName: 'Whitening',
    menuLine: 'Brighter teeth, safely',
    featured: false,
    summary:
      'A quick, safe cosmetic treatment to remove stains and make your teeth 2–3 shades whiter and brighter.',
    highlights: ['2–3 shades whiter', 'Safe for enamel', 'One visit'],
    illustration: illustrations.beam,
    photo: photos.teethWhitening,
    intro:
      'Teeth become yellow with aging, tea, coffee, smoking, or poor oral hygiene. We apply a safe whitening gel on your teeth and activate it with a laser light. In 30–45 mins, stains are removed and teeth become visibly whiter. Crowns, veneers and fillings do not change colour.',
    steps: [
      { title: 'Check', body: 'Your teeth and gums are checked, and the shade recorded.' },
      { title: 'Protection', body: 'Your gums are covered so only the teeth are treated.' },
      { title: 'Whitening', body: 'The gel is applied and activated with a laser light.' },
      { title: 'Aftercare', body: 'Advice on foods to avoid for a day or two.' },
    ],
  },
  {
    slug: 'crowns-bridges',
    Icon: CrownIcon,
    name: 'Crowns and bridges',
    shortName: 'Crowns & bridges',
    menuLine: 'Rebuild or replace damaged teeth',
    featured: false,
    ledBy: 'Prosthodontics',
    summary:
      'When a tooth is badly broken, root canal treated, or missing, a crown or bridge gives you back a strong, natural-looking fixed tooth.',
    highlights: ['Matched to your shade', 'Fixed in place', 'Restores chewing'],
    illustration: illustrations.crown,
    photo: photos.crownModel,
    intro:
      'A crown is a cap that covers and protects your damaged tooth completely. A bridge replaces a missing tooth by taking support from the teeth next to it — like a bridge.',
    steps: [
      {
        title: 'Preparation',
        body: 'The tooth is shaped and a digital 3D impression is taken — no messy moulds.',
      },
      { title: 'Temporary', body: 'A temporary crown protects the tooth while yours is made.' },
      {
        title: 'Fitting',
        body: 'The final crown or bridge is checked for fit and bite, then fixed.',
      },
    ],
  },
  {
    slug: 'onlays-inlays',
    Icon: CrownIcon,
    name: 'Onlays and inlays',
    shortName: 'Onlays & inlays',
    menuLine: 'Precise repairs for larger cavities',
    featured: false,
    ledBy: 'Prosthodontics',
    summary: 'Custom-made ceramic pieces that repair a damaged tooth while keeping more of it.',
    highlights: ['Keeps more natural tooth', 'Matched to your shade', 'Strong and long-lasting'],
    illustration: illustrations.tooth,
    photo: photos.scan,
    intro:
      'An inlay fits inside the chewing surface of a tooth; an onlay also covers one or more of its cusps. They are made to measure from a scan, so they repair damage too large for a filling without needing a full crown.',
    steps: [
      { title: 'Preparation', body: 'Decay or an old filling is removed and the tooth shaped.' },
      { title: 'Scan', body: 'A precise digital scan records the space to be filled.' },
      { title: 'Temporary', body: 'A temporary filling protects the tooth while yours is made.' },
      { title: 'Bonding', body: 'The inlay or onlay is checked for fit and bite, then bonded.' },
    ],
  },
  {
    slug: 'kids-dentistry',
    Icon: BabyIcon,
    name: 'Kids dentistry',
    shortName: 'Kids dentistry',
    menuLine: 'Gentle care for children’s teeth',
    featured: false,
    summary: 'Gentle check-ups, prevention and treatment for children, from the first tooth.',
    highlights: ['Child-friendly visits', 'Sealants and fluoride', 'Early habit guidance'],
    illustration: illustrations.smileOrange,
    photo: photos.kidsSmile,
    intro:
      'Children’s teeth need care from the first tooth. Regular visits catch decay early, protect the back teeth with sealants and fluoride, and help children feel at ease at the dentist.',
    steps: [
      {
        title: 'Friendly check',
        body: 'A gentle look at the teeth, gums and how they are growing.',
      },
      { title: 'Prevention', body: 'Cleaning, fluoride and sealants to protect against decay.' },
      { title: 'Treatment', body: 'Any cavities are treated calmly, explained in simple words.' },
      { title: 'Home care', body: 'Brushing, diet and habit tips for parents and children.' },
    ],
  },
  {
    slug: 'laser-dentistry',
    Icon: LightningIcon,
    name: 'Laser dentistry',
    shortName: 'Laser dentistry',
    menuLine: 'NovoLase Gold for gums and soft tissue',
    featured: false,
    ledBy: 'Prosthodontics',
    summary: 'Precise laser care for gums and soft tissue, with less bleeding and faster healing.',
    highlights: ['Minimal bleeding', 'Often no stitches', 'Faster healing'],
    illustration: illustrations.beam,
    photo: laserPhotos.unit,
    intro:
      'Our NovoLase Gold dual-wavelength laser treats gums and soft tissue with a focused beam of light. It is used for gum reshaping, disinfecting gum pockets, ulcers and minor surgery, usually with less discomfort and quicker healing.',
    steps: [
      {
        title: 'Assessment',
        body: 'Your gums and teeth are checked to see if laser care suits you.',
      },
      { title: 'Comfort', body: 'Local anaesthetic, if needed, and protective eyewear.' },
      { title: 'Laser care', body: 'The laser treats the area precisely, sealing as it works.' },
      { title: 'Healing', body: 'Simple aftercare; most people return to normal the same day.' },
    ],
  },
  {
    slug: 'gum-surgery',
    Icon: FirstAidIcon,
    name: 'Advanced gum surgeries',
    shortName: 'Gum surgeries',
    menuLine: 'Treat gum disease and recession',
    featured: false,
    summary: 'Surgical care for advanced gum disease, recession and uneven gum lines.',
    highlights: ['Saves loose teeth', 'Covers exposed roots', 'Laser-assisted options'],
    illustration: illustrations.toothPlus,
    photo: photos.procedure,
    intro:
      'Your gums are the foundation of your teeth. If gums are weak, infected, or receding, teeth become loose and fall, even without pain. Advanced gum treatments save your teeth before it’s too late.',
    steps: [
      { title: 'Gum check', body: 'Pocket depths and X-rays show how far the disease has gone.' },
      { title: 'Deep clean', body: 'Plaque and tartar are cleared from below the gum line.' },
      { title: 'Surgery', body: 'Gums are treated, grafted or reshaped under local anaesthesia.' },
      { title: 'Maintenance', body: 'Regular reviews keep the gums healthy afterwards.' },
    ],
  },
  {
    slug: 'wisdom-teeth-removal',
    Icon: ToothIcon,
    name: 'Wisdom teeth removal',
    shortName: 'Wisdom teeth',
    menuLine: 'Safe removal of impacted wisdom teeth',
    featured: false,
    summary: 'Careful removal of painful or impacted wisdom teeth, planned from X-rays.',
    highlights: ['Planned from X-rays', 'Local anaesthesia', 'Clear aftercare'],
    illustration: illustrations.calendar,
    photo: photos.xray,
    intro:
      'Wisdom teeth often come through at an angle or get stuck under the gum, causing pain, swelling or decay in the neighbouring tooth. X-rays show their position so they can be removed safely and comfortably.',
    steps: [
      { title: 'X-rays', body: 'Scans show the tooth’s position and nearby nerves.' },
      { title: 'Numbing', body: 'The area is fully numbed with local anaesthesia.' },
      { title: 'Removal', body: 'The tooth is removed, sometimes in sections for less strain.' },
      { title: 'Recovery', body: 'Aftercare advice, and a review to check healing.' },
    ],
  },
];

export type Doctor = {
  slug: string;
  name: string;
  initials: string;
  degree: string;
  /** Additional training, e.g. a fellowship. */
  fellowship?: string;
  specialty: 'Prosthodontics' | 'Orthodontics';
  /** Title under the name, e.g. "Orthodontist". */
  role: string;
  /**
   * Further qualifications and memberships, listed under the degree. TODO(clinic): add
   * each doctor's (university, fellowships, memberships, years of experience).
   */
  credentials?: string[];
  focus: string;
  /** Plain-language explanation of the speciality (general information, not a bio). */
  specialtyIntro: string;
  /** Treatments this speciality covers. */
  treats: string[];
  /** TODO(clinic): replace with the doctor's real portrait and set portraitIsIllustration: false. */
  portrait: Photo;
  /** Illustrations are drawn whole on a tinted panel; photos fill the frame. */
  portraitIsIllustration: boolean;
};

// Order on the page: Dr Pradeep on the left, Dr B Mohana Bindu on the right.
export const doctors: Doctor[] = [
  {
    slug: 'dr-d-reddy-pradeep',
    name: 'Dr D Reddy Pradeep',
    initials: 'RP',
    degree: 'MDS, Orthodontics & Dentofacial Orthopaedics',
    specialty: 'Orthodontics',
    role: 'Orthodontist',
    focus: 'Braces and clear aligners',
    specialtyIntro:
      'Orthodontics is the speciality of straightening teeth and correcting the bite. An orthodontist uses braces or clear aligners to move teeth gradually into a healthier, more even position.',
    treats: [
      'Metal and ceramic braces',
      'Clear aligners, including Invisalign',
      'Crowded, gapped or crooked teeth',
      'Overbite, underbite and crossbite',
      'Retainers after treatment',
    ],
    portrait: photos.doctorPradeep,
    portraitIsIllustration: true,
  },
  {
    slug: 'dr-mohana-bindu',
    name: 'Dr B Mohana Bindu',
    initials: 'MB',
    degree: 'MDS, Prosthodontics & Implantology',
    fellowship: 'Fellowship in Laser Dentistry',
    specialty: 'Prosthodontics',
    role: 'Prosthodontist and implantologist',
    focus: 'Implants, crowns, dentures, veneers and laser care',
    specialtyIntro:
      'Prosthodontics is the speciality of restoring and replacing teeth. A prosthodontist plans crowns, bridges, dentures and implant-supported teeth so they look natural, bite comfortably and last.',
    treats: [
      'Dental implants and implant crowns',
      'Crowns and bridges',
      'Complete and partial dentures',
      'Veneers, laminates and smile designing',
      'Full mouth rehabilitation',
      'Laser-assisted gum and soft-tissue care',
    ],
    portrait: photos.doctorBindu,
    portraitIsIllustration: true,
  },
];

/**
 * A doctor's name with non-breaking spaces, so it never splits across two lines when it
 * sits inside a sentence ("…with Dr B Mohana Bindu").
 */
export const oneLine = (name: string) => name.replace(/ /g, '\u00a0');

/** Treatments shown on the home page. */
export const featuredTreatments = treatments.filter((treatment) => treatment.featured);

/** The doctor whose speciality leads a treatment, if any. */
export const leadDoctor = (treatment: Treatment) =>
  treatment.ledBy ? doctors.find((doctor) => doctor.specialty === treatment.ledBy) : undefined;

/** The speciality illustration for a doctor. */
export const specialtyIllustration = (doctor: Doctor) =>
  doctor.specialty === 'Orthodontics' ? illustrations.braces : illustrations.crown;

export type ResultCase = {
  id: string;
  treatment: Treatment['slug'];
  title: string;
  photo: Photo;
  /** Tailwind arbitrary filter that stands in for "before" in the demo. */
  beforeFilter: string;
  /** Real cases: the separate "before" photo. Demos reuse `photo` with a filter. */
  before?: Photo;
  /** False for real, consented cases from the staff area. Demo when absent. */
  demo?: boolean;
};

/**
 * Before/after cases. These are DEMOS (one photo, a filter standing in for "before")
 * until the clinic adds real, consented patient cases with separate before/after photos.
 */
export const resultCases: ResultCase[] = [
  {
    id: 'whitening',
    treatment: 'teeth-whitening',
    title: 'Whitening and shade match',
    photo: photos.smileClose,
    beforeFilter: '[filter:sepia(0.6)_saturate(0.75)_brightness(0.92)]',
  },
  {
    id: 'aligners',
    treatment: 'aligners',
    title: 'Aligner treatment',
    photo: photos.smile,
    beforeFilter: '[filter:sepia(0.5)_saturate(0.7)_brightness(0.88)]',
  },
  {
    id: 'smile-makeover',
    treatment: 'smile-design',
    title: 'Smile makeover',
    photo: photos.smileJoy,
    beforeFilter: '[filter:sepia(0.45)_saturate(0.6)_brightness(0.9)_contrast(0.95)]',
  },
  {
    id: 'implant-crown',
    treatment: 'implants',
    title: 'Implant crown',
    photo: photos.implantModel,
    beforeFilter: '[filter:grayscale(0.7)_brightness(0.85)]',
  },
  {
    id: 'veneers',
    treatment: 'veneers',
    title: 'Veneers',
    photo: photos.smileClose,
    beforeFilter: '[filter:saturate(1.6)_hue-rotate(-12deg)_brightness(0.9)]',
  },
];

/** Photos for each treatment's demo cases, most relevant first. */
const demoPhotos: Record<string, Photo[]> = {
  braces: [photos.bracesModels, photos.bracesClose, photos.smileJoy],
  aligners: [photos.aligners, photos.alignerFit, photos.smile],
  implants: [photos.implantModel, photos.crownModel, photos.smileClose],
  veneers: [photos.veneers, photos.smileClose, photos.smileDesign],
  'tooth-coloured-fillings': [photos.fillings, photos.smileClose, photos.smile],
  'smile-design': [photos.smileDesign, photos.smileJoy, photos.smile],
  'root-canal': [photos.xrayTall, photos.xray, photos.smileClose],
  'full-mouth-rehabilitation': [photos.fullMouth, photos.dentures, photos.smile],
  dentures: [photos.dentures, photos.fullMouth, photos.smile],
  'teeth-cleaning': [photos.procedure, photos.smileClose, photos.smileJoy],
  'teeth-whitening': [photos.teethWhitening, photos.smileClose, photos.smileDesign],
  'crowns-bridges': [photos.crownModel, photos.implantModel, photos.smileClose],
  'onlays-inlays': [photos.scan, photos.fillings, photos.smileClose],
  'kids-dentistry': [photos.kidsSmile, photos.smileJoy, photos.smile],
  'laser-dentistry': [photos.procedure, photos.smileClose, photos.smile],
  'gum-surgery': [photos.procedure, photos.smileClose, photos.smile],
  'wisdom-teeth-removal': [photos.xray, photos.xrayTall, photos.smileClose],
};

/** Stand-ins for "before", rotated so neighbouring demo cases look different. */
const demoFilters = [
  '[filter:sepia(0.5)_saturate(0.7)_brightness(0.88)]',
  '[filter:grayscale(0.6)_brightness(0.86)_contrast(0.95)]',
  '[filter:sepia(0.35)_saturate(1.3)_hue-rotate(-10deg)_brightness(0.9)]',
];

/** How many before/after cases each treatment shows until real ones arrive. */
export const DEMO_CASES_PER_TREATMENT = 3;

/**
 * Demo cases for one treatment: its own entries above first, then cases made from
 * related photos, up to three, so every treatment shows several before/afters (labelled
 * Demo) until the clinic adds real cases for it.
 */
export function demoCasesFor(treatment: Treatment): ResultCase[] {
  const own = resultCases.filter((item) => item.treatment === treatment.slug);
  const used = new Set(own.map((item) => item.photo));
  const pool = (demoPhotos[treatment.slug] ?? [treatment.photo]).filter(
    (photo) => !used.has(photo),
  );
  const label = treatment.shortName ?? treatment.name;
  const made = pool
    .slice(0, Math.max(0, DEMO_CASES_PER_TREATMENT - own.length))
    .map((photo, index): ResultCase => ({
      id: `demo-${treatment.slug}-${index + 1}`,
      treatment: treatment.slug,
      title: `${label} · case ${own.length + index + 1}`,
      photo,
      beforeFilter: demoFilters[(own.length + index) % demoFilters.length]!,
    }));
  return [...own, ...made];
}

/**
 * Before/after cases covering every treatment, in the clinic's treatment order: the real
 * cases where the clinic has published some, labelled demos for the rest. `perTreatment`
 * caps how many each treatment contributes (the home page shows one each).
 */
export function casesForEveryTreatment(live: ResultCase[], perTreatment?: number): ResultCase[] {
  return treatments.flatMap((treatment) => {
    const real = live.filter((item) => item.treatment === treatment.slug);
    const cases = real.length ? real : demoCasesFor(treatment);
    return perTreatment ? cases.slice(0, perTreatment) : cases;
  });
}
