import {
  ArrowsInIcon,
  BarbellIcon,
  BroomIcon,
  CalendarCheckIcon,
  ClockIcon,
  DropIcon,
  EyeIcon,
  EyeSlashIcon,
  ForkKnifeIcon,
  HandHeartIcon,
  type Icon,
  LinkIcon,
  MagicWandIcon,
  PaletteIcon,
  ShieldCheckIcon,
  SmileyIcon,
  SparkleIcon,
  TargetIcon,
  ToothIcon,
} from '@phosphor-icons/react';

/**
 * The longer content on each treatment page: why people choose it, the types offered and
 * common questions. General patient information in our own words.
 * TODO(clinic): have the doctors review every answer, and confirm each option is offered.
 */
export type TreatmentDetails = {
  benefits: { title: string; body: string; Icon: Icon }[];
  options: { title: string; body: string }[];
  faqs: { question: string; answer: string }[];
};

export const treatmentDetails: Record<string, TreatmentDetails> = {
  invisalign: {
    benefits: [
      {
        title: 'Hard to spot',
        body: 'Clear aligners are difficult to notice in everyday conversation.',
        Icon: EyeSlashIcon,
      },
      {
        title: 'Eat what you like',
        body: 'Take the aligners out for meals, so there are no food restrictions.',
        Icon: ForkKnifeIcon,
      },
      {
        title: 'Easy to keep clean',
        body: 'Brush and floss as usual, with no brackets or wires in the way.',
        Icon: BroomIcon,
      },
      {
        title: 'See the plan first',
        body: 'A digital plan shows how your teeth are expected to move before you begin.',
        Icon: EyeIcon,
      },
    ],
    options: [
      {
        title: 'Full aligner treatment',
        body: 'For crowding, gaps and many bite problems, planned from start to finish by our orthodontist.',
      },
      {
        title: 'Shorter treatment for minor changes',
        body: 'For small corrections, such as teeth that have shifted after earlier braces.',
      },
      {
        title: 'Aligners for teenagers',
        body: 'Suitable for many teenagers who are ready to wear their aligners as advised.',
      },
      {
        title: 'Retainers',
        body: 'Fixed or removable retainers to keep teeth in place once treatment ends.',
      },
    ],
    faqs: [
      {
        question: 'Do aligners hurt?',
        answer:
          'Most people feel pressure or tightness for a day or two when they start a new set. That is a sign the aligners are working, and it usually settles quickly.',
      },
      {
        question: 'How many hours a day do I wear them?',
        answer:
          'Usually 20 to 22 hours a day. Take them out only to eat, drink anything other than water, and clean your teeth.',
      },
      {
        question: 'How long does treatment take?',
        answer:
          'It depends on how much your teeth need to move. Minor corrections can take a few months; fuller treatment often takes a year or more. You get an estimate after your assessment.',
      },
      {
        question: 'How do I clean my aligners?',
        answer:
          'Rinse them whenever you take them out and brush them gently with cool water. Avoid hot water, which can change their shape.',
      },
      {
        question: 'Will I need a retainer afterwards?',
        answer:
          'Yes. Teeth tend to drift back, so a retainer is needed to hold the result. Your orthodontist tells you how long to wear it.',
      },
    ],
  },

  implants: {
    benefits: [
      {
        title: 'Fixed and stable',
        body: 'An implant stays in place, so you can chew, speak and smile with confidence.',
        Icon: ShieldCheckIcon,
      },
      {
        title: 'Looks like your own tooth',
        body: 'The crown on top is shaped and shaded to match the teeth around it.',
        Icon: SmileyIcon,
      },
      {
        title: 'Helps protect the jawbone',
        body: 'Bone can shrink where a tooth is missing; an implant helps keep it in use.',
        Icon: BarbellIcon,
      },
      {
        title: 'Leaves other teeth alone',
        body: 'Unlike a bridge, a single implant does not need the neighbouring teeth to be shaped.',
        Icon: ToothIcon,
      },
    ],
    options: [
      {
        title: 'Single-tooth implant',
        body: 'One implant and one crown to replace one missing tooth.',
      },
      {
        title: 'Implant-supported bridge',
        body: 'Two or more implants hold a bridge that replaces several teeth in a row.',
      },
      {
        title: 'Full-arch fixed teeth',
        body: 'A fixed set of teeth held by several implants, for people missing most or all teeth in a jaw.',
      },
      {
        title: 'Implant-retained denture',
        body: 'A removable denture that clips onto implants, so it stays firm while you eat and talk.',
      },
    ],
    faqs: [
      {
        question: 'Does getting an implant hurt?',
        answer:
          'The area is numbed with local anaesthesia, so you should not feel pain during the procedure. Some soreness and swelling for a few days afterwards is common and manageable.',
      },
      {
        question: 'How long does the whole process take?',
        answer:
          'Often three to six months from placing the implant to fitting the final crown, because the bone needs time to bond to the implant. It can take longer if bone grafting is needed first.',
      },
      {
        question: 'Am I suitable for implants?',
        answer:
          'Most adults with healthy gums and enough jawbone are. Smoking and conditions such as uncontrolled diabetes can slow healing, so we review your medical history and X-rays at the assessment.',
      },
      {
        question: 'Do I need tests before an implant?',
        answer:
          'We ask about your health and medicines, and may request tests such as blood sugar levels if they are relevant. Your prosthodontist tells you exactly what is needed.',
      },
      {
        question: 'How do I look after an implant?',
        answer:
          'Brush twice a day, clean between your teeth and keep your regular check-ups. Healthy gums are the key to an implant lasting.',
      },
      {
        question: 'Is an implant better than a bridge or a denture?',
        answer:
          'Each has its place. Implants are fixed and leave neighbouring teeth untouched; bridges are quicker; dentures replace many teeth at a lower cost. We explain the options that suit you.',
      },
    ],
  },

  braces: {
    benefits: [
      {
        title: 'Handles complex cases',
        body: 'Braces give fine control for severe crowding and bite problems.',
        Icon: TargetIcon,
      },
      {
        title: 'Always working',
        body: 'Fixed to your teeth, so there is nothing to remember to wear.',
        Icon: ClockIcon,
      },
      {
        title: 'Tooth-coloured option',
        body: 'Ceramic brackets blend in with your teeth for a more discreet look.',
        Icon: PaletteIcon,
      },
      {
        title: 'For all ages',
        body: 'Suitable for children, teenagers and adults with healthy teeth and gums.',
        Icon: HandHeartIcon,
      },
    ],
    options: [
      {
        title: 'Metal braces',
        body: 'Strong, reliable and the most widely used type of braces.',
      },
      {
        title: 'Ceramic braces',
        body: 'Clear or tooth-coloured brackets that are less noticeable.',
      },
      {
        title: 'Early check for children',
        body: 'An orthodontic check around age seven can show whether early treatment would help.',
      },
      {
        title: 'Retainers',
        body: 'Fixed or removable retainers to keep teeth in place after braces come off.',
      },
    ],
    faqs: [
      {
        question: 'Am I too old for braces?',
        answer:
          'No. Adults can have braces as long as their teeth and gums are healthy. Many of our orthodontic patients are adults.',
      },
      {
        question: 'How long will I wear braces?',
        answer:
          'Often between one and two years, depending on how much correction is needed. Your orthodontist gives you an estimate after your records are taken.',
      },
      {
        question: 'Do braces hurt?',
        answer:
          'Your teeth may feel sore for a few days after the braces are fitted and after adjustments. Soft food and simple pain relief usually help.',
      },
      {
        question: 'What should I avoid eating?',
        answer:
          'Hard, sticky and chewy foods, such as nuts, toffees and hard sweets, which can break brackets. Cut harder foods like apples into small pieces.',
      },
      {
        question: 'How often are the visits?',
        answer: 'Usually every four to eight weeks, for a short adjustment.',
      },
    ],
  },

  'crowns-bridges': {
    benefits: [
      {
        title: 'Protects weak teeth',
        body: 'A crown holds a cracked or heavily filled tooth together.',
        Icon: ShieldCheckIcon,
      },
      {
        title: 'Matched to your smile',
        body: 'Shape and shade are chosen to blend in with your natural teeth.',
        Icon: PaletteIcon,
      },
      {
        title: 'Fixed in place',
        body: 'Crowns and bridges are cemented, so there is nothing to take out.',
        Icon: LinkIcon,
      },
      {
        title: 'Chew comfortably again',
        body: 'Restores a strong, even bite on the treated side.',
        Icon: ForkKnifeIcon,
      },
    ],
    options: [
      {
        title: 'All-ceramic and zirconia crowns',
        body: 'Metal-free crowns with a natural look, suited to front and back teeth.',
      },
      {
        title: 'Metal-ceramic crowns',
        body: 'A metal base with a tooth-coloured outer layer, for strength where it is needed.',
      },
      {
        title: 'Tooth-supported bridges',
        body: 'A false tooth held by crowns on the teeth either side of the gap.',
      },
      {
        title: 'Crowns on implants',
        body: 'The final tooth fitted on top of a dental implant.',
      },
    ],
    faqs: [
      {
        question: 'When do I need a crown?',
        answer:
          'When a tooth is cracked, badly worn, heavily filled or has had a root canal treatment, and a filling alone would not be strong enough.',
      },
      {
        question: 'How many visits does it take?',
        answer:
          'Usually two: one to prepare the tooth and take a scan or impression, and one to fit the finished crown or bridge, typically about a week apart.',
      },
      {
        question: 'Will it look natural?',
        answer:
          'Yes. The shade is matched to your teeth, and ceramic materials reflect light in a similar way to enamel.',
      },
      {
        question: 'How long do crowns last?',
        answer:
          'Many last for years, often more than ten, with good cleaning and regular check-ups. Grinding your teeth or biting hard objects can shorten their life.',
      },
      {
        question: 'Should I choose a bridge or an implant?',
        answer:
          'A bridge is quicker and avoids surgery but involves shaping the neighbouring teeth. An implant leaves them untouched but takes longer. We explain both for your case.',
      },
    ],
  },

  dentures: {
    benefits: [
      {
        title: 'Replaces many teeth',
        body: 'One denture can replace several teeth or a whole arch.',
        Icon: ToothIcon,
      },
      {
        title: 'Supports your face',
        body: 'Fills out the lips and cheeks, which can sink when teeth are missing.',
        Icon: SmileyIcon,
      },
      {
        title: 'No surgery needed',
        body: 'A non-surgical way to restore your smile and your bite.',
        Icon: HandHeartIcon,
      },
      {
        title: 'Simple to clean',
        body: 'Take it out to clean it and to rest your gums.',
        Icon: DropIcon,
      },
    ],
    options: [
      {
        title: 'Complete dentures',
        body: 'A full set of teeth for an upper or lower jaw with no natural teeth left.',
      },
      {
        title: 'Partial dentures',
        body: 'Fill the gaps between your natural teeth and stop them from drifting.',
      },
      {
        title: 'Implant-retained dentures',
        body: 'Clip onto a few implants for a firmer fit while eating and speaking.',
      },
      {
        title: 'Relines and repairs',
        body: 'Adjusting an existing denture as your gums change over time.',
      },
    ],
    faqs: [
      {
        question: 'How long does it take to get used to dentures?',
        answer:
          'Usually a few weeks. Speaking and eating can feel different at first; reading aloud and starting with soft food help.',
      },
      {
        question: 'Can I eat normally?',
        answer:
          'Start with soft food cut into small pieces and chew on both sides. Most people return to a varied diet as they get used to their dentures.',
      },
      {
        question: 'Should I wear them at night?',
        answer:
          'Usually not. Taking dentures out at night gives your gums a rest. Follow the advice your prosthodontist gives you.',
      },
      {
        question: 'How do I clean my dentures?',
        answer:
          'Brush them daily with a soft brush and a denture cleaner, not regular toothpaste, and keep them in water when they are out so they do not dry out.',
      },
      {
        question: 'How long do dentures last?',
        answer:
          'Your gums and bone change over time, so dentures usually need relining or replacing after several years. Regular check-ups keep them fitting well.',
      },
    ],
  },

  'laser-dentistry': {
    benefits: [
      {
        title: 'Less bleeding',
        body: 'The laser seals small blood vessels as it works.',
        Icon: DropIcon,
      },
      {
        title: 'Precise',
        body: 'Treats only the tissue that needs it, sparing the area around it.',
        Icon: TargetIcon,
      },
      {
        title: 'Often fewer stitches',
        body: 'Many soft-tissue procedures heal without sutures.',
        Icon: SparkleIcon,
      },
      {
        title: 'Comfortable recovery',
        body: 'Many people return to their routine the same or the next day.',
        Icon: CalendarCheckIcon,
      },
    ],
    // TODO(clinic): confirm which of these the clinic's laser is used for.
    options: [
      {
        title: 'Laser gum treatment',
        body: 'Helps clean infected gum pockets alongside a deep clean, for bleeding gums and gum disease.',
      },
      {
        title: 'Gum reshaping',
        body: 'Evens out an uneven or "gummy" smile line, often as part of smile design.',
      },
      {
        title: 'Frenectomy',
        body: 'Releases a tight tongue or lip tie that affects speech, feeding or gum health.',
      },
      {
        title: 'Gum depigmentation',
        body: 'Lightens dark patches on the gums for a more even colour.',
      },
    ],
    faqs: [
      {
        question: 'Is laser dentistry safe?',
        answer:
          'Yes, when used by trained dentists with the right safety steps. You and the team wear protective glasses during treatment.',
      },
      {
        question: 'Does it hurt?',
        answer:
          'Many people find it more comfortable than conventional methods. Local anaesthesia may still be used, depending on the procedure.',
      },
      {
        question: 'How quickly will I heal?',
        answer:
          'Minor procedures often heal within days. We give you aftercare advice for your specific treatment.',
      },
      {
        question: 'Can a laser replace the drill completely?',
        answer:
          'No. Lasers are excellent for gums and soft tissue, and some other uses, but many treatments still need conventional instruments.',
      },
    ],
  },

  'smile-design': {
    benefits: [
      {
        title: 'Planned before you commit',
        body: 'Your new smile is designed and discussed with you before any tooth is changed.',
        Icon: EyeIcon,
      },
      {
        title: 'Natural proportions',
        body: 'Tooth shape, length and shade are chosen to suit your face.',
        Icon: SmileyIcon,
      },
      {
        title: 'The least treatment first',
        body: 'We start with the gentlest options, like whitening or aligning, where they are enough.',
        Icon: ArrowsInIcon,
      },
      {
        title: 'One coordinated plan',
        body: 'Whitening, veneers, crowns and gum shaping are combined in the right order.',
        Icon: MagicWandIcon,
      },
    ],
    options: [
      {
        title: 'Teeth whitening',
        body: 'Lightens natural teeth that have yellowed or stained over time.',
      },
      {
        title: 'Veneers',
        body: 'Thin porcelain or composite shells that change the shape, colour or size of front teeth.',
      },
      {
        title: 'Crowns for front teeth',
        body: 'For front teeth that are heavily filled, worn or broken.',
      },
      {
        title: 'Gum reshaping',
        body: 'Evens out the gum line so the teeth look balanced.',
      },
      {
        title: 'Aligning first',
        body: 'Straightening teeth with aligners can mean less shaping later on.',
      },
    ],
    faqs: [
      {
        question: 'What is smile design?',
        answer:
          'A planned approach to improving how your smile looks. We look at your teeth, gums, lips and face together, then suggest the treatments that will get you there.',
      },
      {
        question: 'Can I see the result before treatment?',
        answer:
          'We plan your smile digitally and discuss it with you, and a trial mock-up can often be placed on your teeth so you can see and approve the shape.',
      },
      {
        question: 'Do veneers damage my teeth?',
        answer:
          'Porcelain veneers usually need a thin layer of enamel removed; composite veneers often need little or none. We always aim to remove as little as possible.',
      },
      {
        question: 'Will whitening make my teeth sensitive?',
        answer:
          'Some people feel temporary sensitivity during or after whitening. It usually settles within a few days. Crowns, veneers and fillings do not change colour.',
      },
      {
        question: 'How many visits will I need?',
        answer:
          'It depends on the plan. Whitening may take one or two visits; veneers usually take two or three after planning. You get a timeline before you start.',
      },
    ],
  },
};
