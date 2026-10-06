export type GuideBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "numbers"; items: string[] }
  | { kind: "note"; text: string };

export type GuideSection = { heading: string; blocks: GuideBlock[] };

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  readMinutes: number;
  showPriceTable?: boolean;
  sections: GuideSection[];
  sources?: { label: string; url: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "wedding-photography-cost-india",
    title: "What a wedding photographer costs in India, and why the quotes differ so much",
    summary:
      "How photographers price their work, what changes the number, and what is almost always charged extra.",
    updated: "2026-10-01",
    readMinutes: 6,
    showPriceTable: true,
    sections: [
      {
        heading: "There is no single rate, and that is normal",
        blocks: [
          {
            kind: "p",
            text: "Two photographers in the same city can quote 40,000 and 2,40,000 for what sounds like the same wedding. Usually they are not quoting for the same thing at all. One is a single person with one camera for one function. The other is four people, two cinematographers, a drone, two printed albums and a highlight film. Before you compare prices, make both sides describe exactly what the money buys.",
          },
        ],
      },
      {
        heading: "The four ways photographers charge",
        blocks: [
          {
            kind: "list",
            items: [
              "Per hour. Suits a birthday, a small function or a product shoot. Ask for the minimum hours and the extra hour rate.",
              "Per day. The normal way to price one wedding function. Ask how many hours count as a day, and what overtime costs.",
              "Per week. A block rate for a destination wedding or a long shoot. Usually works out cheaper per day than paying day by day.",
              "Event package. One fixed price for the whole wedding with a written list of what is included. The most common in India, and the easiest to compare if the list is detailed.",
            ],
          },
        ],
      },
      {
        heading: "What pushes the price up",
        blocks: [
          {
            kind: "list",
            items: [
              "Number of days and functions. Roka, mehndi, haldi, sangeet, the wedding and the reception are six separate days of work.",
              "Crew size. A second photographer and a second cinematographer roughly double the shooting cost but halve the chance of missing a moment.",
              "Video. A highlight film, a teaser and a full film are three different jobs with three different edit costs.",
              "Drone. Equipment, a trained pilot and permissions, charged per day.",
              "Album. Printing and design are a real cost. Ask how many photos and how many rounds of changes are included.",
              "Travel and stay. Out of city work adds fuel, train or flight, rooms and food for every crew member.",
              "Speed. Same day edits and rush delivery cost more because somebody sits up all night.",
            ],
          },
        ],
      },
      {
        heading: "What is usually extra, even when nobody mentions it",
        blocks: [
          {
            kind: "p",
            text: "Most arguments after a wedding are about things that were never written down. Ask about each of these before you pay anything.",
          },
          {
            kind: "list",
            items: [
              "Travel beyond a certain distance, charged per kilometre.",
              "Stay and food for the crew, per night per person.",
              "Extra edited photos beyond the package count.",
              "A second album, or a reprint.",
              "Raw files. Many photographers do not give them at all, and that is their right.",
              "Extra hours on the day, when the function runs late, which it almost always does.",
            ],
          },
        ],
      },
      {
        heading: "A fair way to compare two quotes",
        blocks: [
          {
            kind: "numbers",
            items: [
              "Write down the number of shoot days each quote covers.",
              "Write down the number of people on the crew each day.",
              "Write down how many edited photos and how many films you get, and by when.",
              "Add the travel, stay and album charges to both quotes.",
              "Only now compare the totals.",
            ],
          },
          {
            kind: "note",
            text: "A quote that looks cheap and has no written list is not cheap. It is unfinished.",
          },
        ],
      },
    ],
  },
  {
    slug: "questions-to-ask-photographer",
    title: "Twelve questions to ask before you book a photographer",
    summary:
      "The questions that separate a smooth shoot from a bad one. Ask them on the first call.",
    updated: "2026-10-01",
    readMinutes: 4,
    sections: [
      {
        heading: "About the day itself",
        blocks: [
          {
            kind: "numbers",
            items: [
              "Who is actually coming? The person you are talking to, or someone from his team? Ask for the name.",
              "How many hours does your day cover, and what happens if the function runs late?",
              "Do you carry a backup camera? A camera can fail, and a wedding does not happen again.",
              "Have you shot at this venue before, or will you come early to look at the light?",
              "What happens if you fall ill on the day? Who replaces you?",
            ],
          },
        ],
      },
      {
        heading: "About what you get afterwards",
        blocks: [
          {
            kind: "numbers",
            items: [
              "How many edited photos per shoot day, and in how many days?",
              "Do I get the raw files, and if not, why not?",
              "How many rounds of changes are included in the album design?",
              "How long do you keep a backup of my photos?",
              "Can I see a full wedding, start to finish, and not just your best ten photos?",
            ],
          },
          {
            kind: "note",
            text: "That last one matters most. Anybody can show ten good frames. A full set shows whether the whole day was covered.",
          },
        ],
      },
      {
        heading: "About money",
        blocks: [
          {
            kind: "numbers",
            items: [
              "What is the advance, and how much of it comes back if we cancel?",
              "What exactly is not included in this price?",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "advance-and-written-terms",
    title: "What to put in writing before you pay an advance",
    summary:
      "A short checklist you can paste into the chat. It takes five minutes and saves most disputes.",
    updated: "2026-10-01",
    readMinutes: 3,
    sections: [
      {
        heading: "Why this matters",
        blocks: [
          {
            kind: "p",
            text: "BookMyShoot does not take payment for shoots. You pay the photographer directly, which keeps things simple but means the agreement is entirely between the two of you. Everything you agree in the chat on this site stays there, so put the terms in the chat rather than on a phone call.",
          },
        ],
      },
      {
        heading: "Copy this into the chat and fill it in",
        blocks: [
          {
            kind: "list",
            items: [
              "Dates and functions covered, with the start and end time of each.",
              "Venue and city for each date.",
              "Crew coming on each date, by number and role.",
              "Total price, and what it includes, item by item.",
              "Advance amount, and the date it is due.",
              "How much of the advance is refundable, and up to how many days before.",
              "What happens if the event is postponed rather than cancelled.",
              "Number of edited photos, number of films, and the delivery date.",
              "Album: size, number of photos, rounds of changes.",
              "Travel, stay and food: who pays, and how much.",
              "Who can use the photos publicly, and whether you can ask for a photo to be taken down.",
            ],
          },
        ],
      },
      {
        heading: "A fair way to stage the payment",
        blocks: [
          {
            kind: "p",
            text: "A common and reasonable arrangement is a booking advance to hold the date, a second part before the shoot, and the rest on delivery of the edited files. Paying the full amount before the shoot gives you nothing to hold on to if the delivery is late.",
          },
          {
            kind: "note",
            text: "Never pay anything to BookMyShoot for a shoot. We do not collect money for bookings. If anyone asks you to, report it from the grievance page.",
          },
        ],
      },
    ],
  },
  {
    slug: "wedding-shoot-checklist",
    title: "A wedding shoot checklist for the family, not the photographer",
    summary:
      "The small things on your side that decide whether the photos come out well.",
    updated: "2026-10-01",
    readMinutes: 4,
    sections: [
      {
        heading: "Two weeks before",
        blocks: [
          {
            kind: "list",
            items: [
              "Send the photographer the full schedule, with timings for every function.",
              "Give him one family contact person who will be with him through the day, so he is not hunting for people.",
              "Make the list of must have group photos. Which relatives, in which combinations.",
              "Tell him about anyone who should not be photographed, and anyone who must be.",
              "Ask the venue whether drones and extra lights are allowed inside.",
            ],
          },
        ],
      },
      {
        heading: "On the day",
        blocks: [
          {
            kind: "list",
            items: [
              "Feed the crew. They are on their feet for twelve hours and nobody shoots well hungry.",
              "Keep a corner for their bags and batteries, and a plug point.",
              "Do the family group photos right after the ceremony, while everyone is still in one place.",
              "Do not let guests stand behind the photographer with phones during the main rituals.",
            ],
          },
        ],
      },
      {
        heading: "After",
        blocks: [
          {
            kind: "list",
            items: [
              "Pick your album photos as a family in one sitting, not one by one over a month.",
              "Keep your own backup of the files as soon as you get them. Hard drives die.",
              "Write the review while the details are fresh. It helps the next family, and on this site only you can write it.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "drone-rules-india",
    title: "Drone shots at an Indian wedding: what the rules actually say",
    summary:
      "Who needs a licence, where you cannot fly, and what to ask your photographer before you pay for a drone.",
    updated: "2026-10-01",
    readMinutes: 5,
    sections: [
      {
        heading: "Drones are legal, with paperwork",
        blocks: [
          {
            kind: "p",
            text: "Flying a drone in India is governed by the DGCA. Drones are sorted by weight, and airspace is sorted into green, yellow and red zones on the Digital Sky platform. For a paid wedding shoot the rules are stricter than for someone flying a toy in a park, because the work is commercial.",
          },
          {
            kind: "list",
            items: [
              "Nano, under 250 g: no registration number for recreational flying in a green zone, under about 15 m, within sight. A paid shoot is not recreational, so do not assume this covers your wedding.",
              "Micro, 250 g to 2 kg, and anything heavier: the drone needs a Unique Identification Number, and the pilot needs a Remote Pilot Certificate from a DGCA approved school.",
              "Green zone: free to fly up to 120 m, no permission needed.",
              "Yellow zone: permission needed through Digital Sky before the flight.",
              "Red zone: no flying at all. Airports, military areas and border areas fall here.",
            ],
          },
        ],
      },
      {
        heading: "What to ask your photographer",
        blocks: [
          {
            kind: "numbers",
            items: [
              "Which drone are you bringing, and what does it weigh?",
              "Is it registered, and can you show me the Unique Identification Number?",
              "Does the pilot hold a Remote Pilot Certificate?",
              "Have you checked the venue on the Digital Sky map, and which zone is it in?",
              "If permission is needed, who takes it, and is the cost in your quote?",
            ],
          },
          {
            kind: "note",
            text: "Rules change. Check the venue on Digital Sky close to the date, and ask the venue separately, because many hotels and palaces ban drones on their own property even in a green zone.",
          },
        ],
      },
      {
        heading: "The practical side",
        blocks: [
          {
            kind: "list",
            items: [
              "A drone needs open space and daylight. Indoors and after dark, it adds nothing.",
              "It is loud. Agree when it will fly, so it does not drown out the rituals.",
              "Wind and rain ground it. Ask what happens to the drone charge if it cannot fly that day.",
            ],
          },
        ],
      },
    ],
    sources: [
      {
        label: "India DGCA drone regulations, categories and zone system",
        url: "https://blog.uavmodel.com/india-dgca-drone-regulations-2026-digital-sky-platform-uin-uaop-five-categories-zone-system/",
      },
      {
        label: "DGCA drone rules, registration and licence guide",
        url: "https://zbotic.in/dgca-drone-rules-india-2026-registration-license-guide/",
      },
    ],
  },
  {
    slug: "solo-or-full-crew",
    title: "One photographer or a full crew: how to decide",
    summary: "A simple way to work out how many people you actually need on the day.",
    updated: "2026-10-01",
    readMinutes: 3,
    sections: [
      {
        heading: "Count the places things happen at once",
        blocks: [
          {
            kind: "p",
            text: "This is the whole decision. If the bride is getting ready in one room and the baraat is arriving at the gate, one person cannot be in both places. Walk through your schedule and count how many moments overlap. That number is roughly how many shooters you need.",
          },
        ],
      },
      {
        heading: "Rough guide",
        blocks: [
          {
            kind: "list",
            items: [
              "Small function, under 100 guests, one venue: one photographer is enough.",
              "Birthday or office event with a stage: one photographer, two if you also want video.",
              "Wedding day with separate getting ready, ceremony and reception: two photographers and one cinematographer at least.",
              "Big wedding, 500 plus guests, multiple venues: a full crew, and ask who leads it.",
            ],
          },
        ],
      },
      {
        heading: "Spend the extra money here first",
        blocks: [
          {
            kind: "p",
            text: "If the budget is tight, a second shooter on the main day is usually worth more than a drone, a same day edit or a bigger album. Those can be added later. A missed moment cannot.",
          },
        ],
      },
    ],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
