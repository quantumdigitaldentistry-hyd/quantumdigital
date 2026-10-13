import {
  ArrowsInIcon,
  BarbellIcon,
  CalendarCheckIcon,
  ClockIcon,
  CurrencyInrIcon,
  DropIcon,
  EyeIcon,
  EyeSlashIcon,
  ForkKnifeIcon,
  HandHeartIcon,
  HeartIcon,
  type Icon,
  LinkIcon,
  MagicWandIcon,
  PaletteIcon,
  ShieldCheckIcon,
  SmileyIcon,
  SparkleIcon,
  TargetIcon,
  ToothIcon,
  WindIcon,
} from '@phosphor-icons/react';

/**
 * The longer content on each treatment page: why people choose it, the types offered,
 * the clinic's own lists and notes, and common questions. Benefits, options, lists, notes
 * and closing lines follow the clinic's treatment copy (docs/dental_treatment_data.md);
 * the FAQs are general patient information in our own words.
 * TODO(clinic): have the doctors review every answer, and confirm each option is offered.
 */
export type TreatmentDetails = {
  benefits: { title: string; body: string; Icon: Icon }[];
  options: { title: string; body: string }[];
  /** Lists from the clinic's copy, e.g. "Braces can fix" or "Signs you need it". */
  lists?: { title: string; intro?: string; items: string[] }[];
  /** Short notes from the clinic's copy, shown with the lists. */
  notes?: string[];
  /** The clinic's closing line for the treatment. */
  closing?: string;
  faqs: { question: string; answer: string }[];
};

export const treatmentDetails: Record<string, TreatmentDetails> = {
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
      { title: 'Metal braces', body: 'Strong, most affordable, most common.' },
      { title: 'Ceramic braces', body: 'Tooth-coloured, less visible.' },
      { title: 'Self-ligating braces', body: 'Faster, more comfortable, fewer visits.' },
    ],
    lists: [
      {
        title: 'Braces can fix',
        items: [
          'Crooked / crowded teeth',
          'Gaps between teeth',
          'Forwardly placed teeth',
          'Incorrect bite',
        ],
      },
    ],
    notes: [
      'It’s not just for looks — properly aligned teeth are easier to clean, so you get fewer cavities and gum problems.',
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
          'Often 12 to 18 months, depending on how much correction is needed. Your orthodontist gives you an estimate after your records are taken.',
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
        answer:
          'Usually every four to eight weeks, for a short adjustment. Self-ligating braces often need fewer visits.',
      },
    ],
  },

  implants: {
    benefits: [
      {
        title: 'Like natural teeth',
        body: 'Feels and functions like natural teeth.',
        Icon: SmileyIcon,
      },
      {
        title: 'Protects the jawbone',
        body: 'Prevents bone loss in the jaw.',
        Icon: BarbellIcon,
      },
      {
        title: 'Fixed teeth',
        body: 'No removable dentures — fixed teeth.',
        Icon: ShieldCheckIcon,
      },
      {
        title: 'Eat, speak, smile',
        body: 'Improves chewing, speech and confidence.',
        Icon: ForkKnifeIcon,
      },
    ],
    options: [
      {
        title: 'Single tooth implant',
        body: 'Replaces one missing tooth with 1 implant + crown. Fast, simple, looks natural.',
      },
      {
        title: 'Multiple teeth implants',
        body: 'Replaces 2–3 missing teeth with individual implants + crowns/bridge. Restores full chewing in that area.',
      },
      {
        title: 'All-on-4 / All-on-6 implants',
        body: 'Replaces a full arch (upper or lower) with only 4 or 6 implants. Gives a fixed full set of teeth in 1 day (with temporary teeth) or 3–4 days (final teeth). Best for people with all teeth missing.',
      },
      {
        title: 'Implant-supported overdenture',
        body: '2–4 implants hold a removable denture securely. The denture clicks on the implants, with no slipping.',
      },
      {
        title: 'Immediate load implants',
        body: 'Implant + temporary tooth placed on the same day as surgery. You get teeth instantly, then the final crown later.',
      },
      {
        title: 'Bone graft + implant',
        body: 'If the jawbone is thin, we add a bone graft first to make it strong enough for an implant. It takes 4–6 months for the bone to heal, then the implant is placed.',
      },
      {
        title: 'Sinus lift + bone graft + implant',
        body: 'A Sinus Lift (Sinus Augmentation) is a surgery to add bone in the upper back jaw, so a dental implant can be placed.',
      },
    ],
    lists: [
      {
        title: 'Why implants are better than a bridge or denture',
        items: [
          'Looks, feels & works exactly like a natural tooth',
          'Does not damage your neighbouring teeth',
          'Very long-lasting — can last a lifetime with care',
          'Prevents bone loss in the jaw',
        ],
      },
      {
        title: 'Sinus lift: why is it needed?',
        intro:
          'A Sinus Lift (Sinus Augmentation) is a surgery to add bone in the upper back jaw, so a dental implant can be placed.',
        items: [
          'The upper back teeth are near a hollow space in your cheekbone called the maxillary sinus.',
          'If the bone is too thin here, the implant won’t have enough support.',
          'A sinus lift adds bone below the sinus, lifting it up gently.',
          'After healing (4–6 months), the area is strong enough for an implant.',
        ],
      },
    ],
    closing:
      'We do guided, painless digital implants with 3D planning for best safety and accuracy.',
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

  'tooth-coloured-fillings': {
    benefits: [
      {
        title: 'Natural look',
        body: 'Matched to your natural tooth shade, so no one can tell you have a filling.',
        Icon: PaletteIcon,
      },
      {
        title: 'Bonds strongly',
        body: 'The composite resin bonds strongly to the tooth.',
        Icon: ToothIcon,
      },
      {
        title: 'Single visit',
        body: 'Done in a single visit (15–20 mins).',
        Icon: ClockIcon,
      },
      {
        title: 'No mercury',
        body: 'Safe and durable, with no mercury.',
        Icon: ShieldCheckIcon,
      },
    ],
    options: [
      {
        title: 'New cavities',
        body: 'Repairing decay early, before it reaches the nerve.',
      },
      {
        title: 'Replacing old silver fillings',
        body: 'Swapping worn or broken metal fillings for tooth-coloured ones, where advised.',
      },
      {
        title: 'Chipped or worn edges',
        body: 'Rebuilding small chips and worn edges on front teeth.',
      },
    ],
    lists: [
      {
        title: 'Used for',
        items: [
          'Cavities / tooth decay',
          'Small chips or broken teeth',
          'Gaps between front teeth',
          'Worn down teeth',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does getting a filling hurt?',
        answer:
          'The tooth is usually numbed with local anaesthesia, so you should feel pressure but not pain.',
      },
      {
        question: 'How long do tooth-coloured fillings last?',
        answer:
          'Often many years, depending on the size of the filling, your bite and how well you look after your teeth.',
      },
      {
        question: 'Should I replace my old silver fillings?',
        answer:
          'Not automatically. If they are sound, they can stay. We suggest replacing them only if they are broken, leaking or you want a more natural look.',
      },
      {
        question: 'Can I eat straight after?',
        answer:
          'Yes, the filling is hardened with light before you leave. Wait until the numbness wears off so you do not bite your cheek.',
      },
    ],
  },

  'root-canal': {
    benefits: [
      {
        title: 'Relieves pain',
        body: 'Removing the infected pulp stops the source of the pain.',
        Icon: HandHeartIcon,
      },
      {
        title: 'Keeps your own tooth',
        body: 'Your natural tooth is saved for years, so you don’t have to remove it.',
        Icon: ToothIcon,
      },
      {
        title: 'Stops the infection spreading',
        body: 'Without RCT, infection spreads and pain increases.',
        Icon: ShieldCheckIcon,
      },
      {
        title: 'Feels like a filling',
        body: 'With modern anaesthesia and digital X-rays, it feels just like getting a normal filling done.',
        Icon: SmileyIcon,
      },
    ],
    options: [
      {
        title: 'Single-visit root canal',
        body: 'For suitable cases, the treatment is completed in one appointment.',
      },
      {
        title: 'Multi-visit root canal',
        body: 'For infected teeth that need medicine placed between visits.',
      },
      {
        title: 'Laser-assisted disinfection',
        body: 'Our NovoLase Gold laser can be used to help disinfect the canals.',
      },
      {
        title: 'Crown after root canal',
        body: 'A cap / crown protects the treated tooth.',
      },
    ],
    lists: [
      {
        title: 'When do you need it?',
        items: [
          'Severe tooth pain, especially at night',
          'Sensitivity to hot/cold that stays long',
          'Swelling or pus near tooth',
          'Deep cavity close to nerve',
        ],
      },
      {
        title: 'What happens in RCT?',
        intro:
          'Inside your tooth there is soft tissue called pulp (nerve). When it gets infected, we:',
        items: [
          'Remove the infected pulp (painless with anaesthesia)',
          'Clean and disinfect the inside canals',
          'Fill it with a safe material',
          'Protect the tooth with a cap / crown',
        ],
      },
    ],
    notes: [
      'It’s NOT painful — with modern anaesthesia and digital X-rays, it feels just like getting a normal filling done.',
      'Without RCT: infection spreads, pain increases, and you may have to remove the tooth.',
      'With RCT: your natural tooth is saved for years.',
    ],
    faqs: [
      {
        question: 'Does a root canal hurt?',
        answer:
          'It is done under local anaesthesia and usually feels like having a filling. The tooth may be tender for a few days afterwards.',
      },
      {
        question: 'How many visits will I need?',
        answer: 'Often one or two, depending on the tooth and how much infection there is.',
      },
      {
        question: 'Do I need a crown afterwards?',
        answer:
          'Usually, especially for back teeth. A root-canal-treated tooth is more brittle, and a crown helps stop it from cracking.',
      },
      {
        question: 'Is it better to take the tooth out?',
        answer:
          'Keeping your own tooth is usually best. An extracted tooth needs replacing with an implant, bridge or denture to avoid other teeth shifting.',
      },
    ],
  },

  dentures: {
    benefits: [
      {
        title: 'Chew and speak again',
        body: 'Restores chewing and speaking ability.',
        Icon: ForkKnifeIcon,
      },
      {
        title: 'Supports your face',
        body: 'Supports facial shape and prevents a sunken look.',
        Icon: SmileyIcon,
      },
      {
        title: 'Natural-looking',
        body: 'Natural-looking teeth.',
        Icon: SparkleIcon,
      },
      {
        title: 'Affordable',
        body: 'An affordable tooth replacement option.',
        Icon: CurrencyInrIcon,
      },
      {
        title: 'Lighter and more comfortable',
        body: 'Now made lighter and more comfortable with digital technology.',
        Icon: HandHeartIcon,
      },
    ],
    options: [
      {
        title: 'Complete dentures',
        body: 'Replaces all teeth in the upper or lower jaw. Best for full teeth loss in old age.',
      },
      {
        title: 'Partial dentures',
        body: 'Replaces a few missing teeth when some natural teeth are still present.',
      },
      {
        title: 'Flexible dentures',
        body: 'Thin, lightweight, more comfortable, no metal clasps.',
      },
      {
        title: 'Implant-supported dentures',
        body: 'Fixed more tightly on implants — doesn’t move or fall while eating or talking. The most advanced option.',
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

  'teeth-whitening': {
    benefits: [
      {
        title: 'One visit',
        body: 'A brighter smile in 1 visit.',
        Icon: ClockIcon,
      },
      {
        title: 'Safe and painless',
        body: '100% safe, painless, no damage to enamel.',
        Icon: ShieldCheckIcon,
      },
      {
        title: 'Lasting results',
        body: 'Results last 1–2 years with care.',
        Icon: SparkleIcon,
      },
    ],
    options: [
      {
        title: 'In-clinic whitening',
        body: 'A safe whitening gel activated with a laser light, in one visit of 30–45 minutes.',
      },
      {
        title: 'Home whitening trays',
        body: 'Custom trays and gel to use at home over a couple of weeks.',
      },
      {
        title: 'Whitening before veneers or crowns',
        body: 'Setting the shade of your natural teeth before new work is matched to it.',
      },
    ],
    lists: [
      {
        title: 'Why do teeth become yellow?',
        items: ['Aging', 'Tea and coffee', 'Smoking', 'Poor oral hygiene'],
      },
    ],
    notes: [
      'In-office whitening is suggested for long-lasting results — much better than whitening toothpastes or kits.',
    ],
    faqs: [
      {
        question: 'Is teeth whitening safe?',
        answer:
          'Yes, when done or supervised by a dentist. Your teeth and gums are checked first and protected during treatment.',
      },
      {
        question: 'Will my teeth be sensitive?',
        answer: 'Some people feel temporary sensitivity, which usually settles within a few days.',
      },
      {
        question: 'How long do the results last?',
        answer:
          'Usually 1–2 years with care, depending on diet and habits such as tea, coffee and smoking.',
      },
      {
        question: 'Will it whiten my crowns or fillings?',
        answer:
          'No. Crowns, veneers and fillings keep their colour, so they may need replacing to match your new shade.',
      },
    ],
  },

  aligners: {
    benefits: [
      {
        title: 'Invisible',
        body: 'No one can tell you’re wearing them.',
        Icon: EyeSlashIcon,
      },
      {
        title: 'Removable',
        body: 'Eat anything, brush easily.',
        Icon: ForkKnifeIcon,
      },
      {
        title: 'Comfortable',
        body: 'No wires, no cuts, no pain.',
        Icon: HandHeartIcon,
      },
      {
        title: 'Fewer visits',
        body: 'Perfect for busy people and students.',
        Icon: CalendarCheckIcon,
      },
      {
        title: 'See the result first',
        body: 'You can see the result before starting, with a 3D scan.',
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
    lists: [
      {
        title: 'Aligners fix',
        items: ['Crowding', 'Gaps', 'Forward teeth', 'Crooked smile'],
      },
    ],
    closing: 'We provide advanced 3D planned clear aligners with full smile preview.',
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
          'It depends on how much your teeth need to move. Each set is worn for 10–14 days; minor corrections can take a few months, and fuller treatment often takes a year or more. You get an estimate after your assessment.',
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

  veneers: {
    benefits: [
      {
        title: 'Instant transformation',
        body: 'An instant smile transformation.',
        Icon: SparkleIcon,
      },
      {
        title: 'Looks natural',
        body: 'Matches your face.',
        Icon: SmileyIcon,
      },
      {
        title: 'Long-lasting',
        body: 'Stain-resistant and long-lasting (10–15 years).',
        Icon: ShieldCheckIcon,
      },
      {
        title: 'Minimal preparation',
        body: 'Only minimal tooth preparation is needed.',
        Icon: ToothIcon,
      },
    ],
    options: [
      {
        title: 'Porcelain veneers (laminates)',
        body: 'Thin ceramic shells made in a lab; stain-resistant and long-lasting.',
      },
      {
        title: 'Composite veneers',
        body: 'Tooth-coloured resin shaped directly on the tooth, often in one visit.',
      },
      {
        title: 'Minimal-preparation veneers',
        body: 'Very thin veneers that need little or no enamel removed, where the case allows.',
      },
    ],
    lists: [
      {
        title: 'Best for',
        items: [
          'Stained / yellow teeth that don’t whiten',
          'Gaps between front teeth',
          'Small, chipped, or broken teeth',
          'Slightly crooked or uneven teeth',
        ],
      },
    ],
    closing:
      'We design veneers digitally to match your face shape and smile for the most natural, beautiful result.',
    faqs: [
      {
        question: 'What is the difference between veneers and laminates?',
        answer:
          'They are the same idea: thin shells bonded to the front of the teeth. "Laminate" is often used for very thin porcelain veneers.',
      },
      {
        question: 'Do veneers damage my teeth?',
        answer:
          'Porcelain veneers usually need a thin layer of enamel removed; composite veneers often need little or none. We always aim to remove as little as possible.',
      },
      {
        question: 'How long do veneers last?',
        answer:
          'Porcelain veneers often last 10–15 years with good care; composite veneers usually need polishing or repair sooner.',
      },
      {
        question: 'Can veneers stain?',
        answer:
          'Porcelain resists staining well. Composite can pick up stains over time, like natural teeth.',
      },
      {
        question: 'How many visits does it take?',
        answer:
          'Composite veneers can often be done in one visit. Porcelain veneers usually take two or three visits after planning.',
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
        title: 'Designed for your face',
        body: 'Your face shape, lip line, skin tone, age, gender and what you want are all considered.',
        Icon: SmileyIcon,
      },
      {
        title: 'The least treatment first',
        body: 'We start with the gentlest options, like whitening or aligning, where they are enough.',
        Icon: ArrowsInIcon,
      },
      {
        title: 'One coordinated plan',
        body: 'Whitening, veneers, aligners and gum shaping are combined in the right order.',
        Icon: MagicWandIcon,
      },
    ],
    options: [
      {
        title: 'Teeth whitening',
        body: 'Lightens natural teeth that have yellowed or stained over time.',
      },
      {
        title: 'Veneers / laminates',
        body: 'Thin porcelain or composite shells that change the shape, colour or size of front teeth.',
      },
      {
        title: 'Clear aligners / braces',
        body: 'Straightening teeth first can mean less shaping later on.',
      },
      {
        title: 'Gum contouring',
        body: 'Evens out the gum line so the teeth look balanced.',
      },
      {
        title: 'Tooth-coloured fillings & shaping',
        body: 'Small repairs and reshaping with tooth-coloured composite.',
      },
      {
        title: 'Crowns for front teeth',
        body: 'For front teeth that are heavily filled, worn or broken.',
      },
    ],
    lists: [
      {
        title: 'What we consider',
        items: ['Your face shape', 'Lip line', 'Skin tone', 'Age', 'Gender', 'What you want'],
      },
    ],
    notes: ['We don’t just fix teeth, we design a smile that looks perfect on you.'],
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

  'full-mouth-rehabilitation': {
    benefits: [
      {
        title: 'Eat anything again',
        body: 'You can eat anything again comfortably.',
        Icon: ForkKnifeIcon,
      },
      {
        title: 'Corrects your bite',
        body: 'Corrects the bite and jaw pain.',
        Icon: TargetIcon,
      },
      {
        title: 'Restores your face',
        body: 'Restores face shape and age.',
        Icon: SmileyIcon,
      },
      {
        title: 'Fixed, long-lasting teeth',
        body: 'Long-lasting, fixed teeth — no more removable dentures.',
        Icon: ShieldCheckIcon,
      },
      {
        title: 'A complete transformation',
        body: 'A complete smile transformation.',
        Icon: MagicWandIcon,
      },
    ],
    options: [
      { title: 'Implants', body: 'For missing teeth.' },
      { title: 'Crowns / bridges', body: 'To protect teeth.' },
      { title: 'Root canals', body: 'Where needed.' },
      { title: 'Clear aligners / braces', body: 'For bite correction.' },
      { title: 'Veneers & smile designing', body: 'For looks.' },
    ],
    lists: [
      {
        title: 'Who needs FMR?',
        items: [
          'Many missing teeth',
          'Heavily worn-out / flat teeth due to grinding',
          'Full mouth decay',
          'Difficulty in chewing properly',
          'Loss of facial height / sunken face',
        ],
      },
    ],
    notes: ['It’s not just one treatment, it’s a full rebuilding of your smile.'],
    closing:
      'At Quantum Digital Dentistry, FMR is planned fully digitally with 3D scans, so results are more accurate, strong, and natural-looking.',
    faqs: [
      {
        question: 'Who needs full mouth rehabilitation?',
        answer:
          'People with many worn, broken or missing teeth, often from grinding, old dental work, decay or gum disease, where fixing one tooth at a time would not work.',
      },
      {
        question: 'How long does it take?',
        answer:
          'It depends on the plan. Some cases take a few weeks; those with implants take several months. You get a staged timeline before you start.',
      },
      {
        question: 'Will I be without teeth during treatment?',
        answer: 'No. Temporary teeth are fitted between stages so you can eat and smile.',
      },
      {
        question: 'Can it be done in stages to spread the cost?',
        answer:
          'Often, yes. Your prosthodontist can plan the treatment in phases and explain the cost of each.',
      },
    ],
  },

  'teeth-cleaning': {
    benefits: [
      {
        title: 'Removes stains and tartar',
        body: 'Removes yellow stains and tartar.',
        Icon: SparkleIcon,
      },
      {
        title: 'Fresher breath, healthier gums',
        body: 'Stops bleeding gums and bad breath.',
        Icon: WindIcon,
      },
      {
        title: 'Prevents problems',
        body: 'Prevents cavities and gum disease.',
        Icon: ShieldCheckIcon,
      },
      {
        title: 'Feels fresh',
        body: 'Makes teeth feel fresh and lighter.',
        Icon: DropIcon,
      },
      {
        title: 'Every 6 months',
        body: 'Recommended every 6 months.',
        Icon: CalendarCheckIcon,
      },
      {
        title: 'Quick and painless',
        body: 'Painless, and takes only 20–30 mins.',
        Icon: ClockIcon,
      },
    ],
    options: [
      {
        title: 'Scaling and polishing',
        body: 'Ultrasonic scalers remove plaque, tartar and stains, then teeth are polished smooth and shiny.',
      },
      {
        title: 'Deep cleaning',
        body: 'Cleaning below the gum line (root planing) for gum disease.',
      },
      {
        title: 'Laser gum care',
        body: 'Our NovoLase Gold laser can help disinfect gum pockets alongside a deep clean.',
      },
    ],
    faqs: [
      {
        question: 'How often should I have my teeth cleaned?',
        answer:
          'Usually every six months. If you have gum disease, your dentist may suggest more often.',
      },
      {
        question: 'Does cleaning hurt?',
        answer:
          'Most people feel only mild discomfort. If your gums are sensitive, the area can be numbed.',
      },
      {
        question: 'Will cleaning damage my enamel?',
        answer: 'No. Professional scaling removes tartar, not enamel.',
      },
      {
        question: 'My gums bled after cleaning. Is that normal?',
        answer:
          'A little bleeding is common when gums are inflamed. It usually settles within a few days as the gums heal.',
      },
    ],
  },

  'crowns-bridges': {
    benefits: [
      {
        title: 'Fixed in place',
        body: 'Fixed, no removal needed.',
        Icon: LinkIcon,
      },
      {
        title: 'Protects the tooth',
        body: 'Prevents further damage to the tooth.',
        Icon: ShieldCheckIcon,
      },
      {
        title: 'Long-lasting',
        body: 'A strong, long-lasting restoration.',
        Icon: ClockIcon,
      },
    ],
    options: [
      {
        title: 'Metal-free, all-ceramic crowns (Zirconia / E-max)',
        body: 'The most natural and biocompatible option.',
      },
      {
        title: 'Metal ceramics',
        body: 'A metal base with a tooth-coloured outer layer.',
      },
      {
        title: 'Tooth-supported bridges',
        body: 'Replaces a missing tooth by taking support from the teeth next to it — like a bridge.',
      },
      {
        title: 'Crowns on implants',
        body: 'The final tooth fitted on top of a dental implant.',
      },
    ],
    lists: [
      {
        title: 'When you need it',
        items: [
          'After Root Canal Treatment',
          'Big cavity / broken tooth',
          'Missing tooth / teeth',
          'Worn-out old cap',
        ],
      },
    ],
    closing: 'We deliver digital 3D impressions — no messy moulds, for a precise fit.',
    faqs: [
      {
        question: 'When do I need a crown?',
        answer:
          'When a tooth is cracked, badly worn, heavily filled or has had a root canal treatment, and a filling alone would not be strong enough.',
      },
      {
        question: 'How many visits does it take?',
        answer:
          'Usually two: one to prepare the tooth and take a digital 3D scan, and one to fit the finished crown or bridge, typically about a week apart.',
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

  'gum-surgery': {
    benefits: [
      {
        title: 'Stops bleeding and bad breath',
        body: 'Stops bleeding gums and bad breath.',
        Icon: WindIcon,
      },
      {
        title: 'Saves loose teeth',
        body: 'Saves loose teeth from falling.',
        Icon: ToothIcon,
      },
      {
        title: 'Protects your health',
        body: 'Protects from heart and diabetes problems linked to gum infection.',
        Icon: HeartIcon,
      },
      {
        title: 'A better-looking smile',
        body: 'Makes your smile more aesthetic.',
        Icon: SmileyIcon,
      },
    ],
    options: [
      {
        title: 'Deep cleaning (curettage)',
        body: 'Removes infection from under the gums.',
      },
      {
        title: 'Flap surgery',
        body: 'For advanced infection — we clean deep and tighten the gums.',
      },
      {
        title: 'Gum grafting',
        body: 'Covers exposed roots for receded gums.',
      },
      {
        title: 'Bone grafting & regeneration',
        body: 'Rebuilds lost bone to save loose teeth.',
      },
      {
        title: 'Laser gum therapy',
        body: 'Painless, bloodless, faster healing.',
      },
      {
        title: 'Gum contouring',
        body: 'Reshapes extra / uneven gums for a beautiful smile.',
      },
    ],
    lists: [
      {
        title: 'Signs you need gum treatment',
        items: [
          'Bleeding gums while brushing',
          'Bad breath despite brushing',
          'Swollen / red gums',
          'Gums going down, teeth looking longer',
          'Loose teeth, or gaps between teeth increasing',
        ],
      },
    ],
    notes: ['Don’t ignore bleeding gums — it’s not normal.'],
    closing: 'We do laser-assisted, minimally invasive gum surgeries — less pain, faster healing.',
    faqs: [],
  },
};
