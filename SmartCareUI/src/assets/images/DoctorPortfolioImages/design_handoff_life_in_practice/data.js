/* Dr. Prasanna N.M — content model (single doctor prototype) */
window.PROFILE = {
  id: "prasanna",

  hero: {
    nameMini: "Dr. Prasanna N.M",
    pretitle: "Orthopaedic Surgeon · Sagara, Karnataka",
    title: ["Four", "Decades of", "<em>Healing.</em>"],
    portrait: "assets/portrait.png",
    portraitAlt: "Dr. Prasanna N.M, Orthopaedic Surgeon",
    stand:
      "From a tiled house in the Malnad hills to forty years in the operating theatre — a life spent setting bone, and people, back in place.",
  },

  origins: {
    index: "Ch. 01 — The Origins",
    img: "assets/village.jpg",
    alt: "The family home in Nisarani, Karnataka",
    place: ["Nisarani,", "<em>Karnataka.</em>"],
    body:
      "A village of areca palms and red-tiled roofs, deep in the Malnad. This is the house he was born into — and the distance he would travel from it is the rest of this story.",
    year: "1969",
  },

  education: {
    index: "Ch. 02 — The Making of a Surgeon",
    head: ["1984", "—", "1993"],
    cards: [
      {
        no: "N° 01",
        img: "assets/college-national.png",
        alt: "National College, Basavanagudi, Bengaluru",
        year: "1984",
        name: ["National College", "Basavanagudi"],
        degree: "Pre-Medical · Bengaluru",
        body:
          "The first step away from the village. A city classroom, and the long road toward medicine begins.",
      },
      {
        no: "N° 02",
        img: "assets/college-bellary.png",
        alt: "Bellary Medical College",
        tall: true,
        year: "1986",
        name: ["Bellary Medical", "College"],
        degree: "MBBS · Bellary, Karnataka",
        body:
          "Five years, one direction. Every ward round shaping the hands that would one day repair what time had broken.",
      },
      {
        no: "N° 03",
        img: "assets/college-kmc.png",
        alt: "Kasturba Medical College, Hubli",
        year: "1993",
        name: ["Kasturba Medical", "College, Hubli"],
        degree: "D.Ortho · Diploma in Orthopaedics",
        body:
          "Specialisation. One discipline, given everything — the beginning of a life in orthopaedic surgery.",
      },
    ],
  },

  practice: {
    marriage: {
      eyebrow: "Hubli · 1995",
      line: ["Two doctors.", "One family.", "<em>The year that changed everything.</em>"],
      year: "1995",
    },
    journey: {
      label: "The Practice",
      nodes: [
        {
          years: "1995 — 2000",
          place: "Kerala",
          body: "Early practice. Building experience, and a reputation, far from home.",
        },
        {
          years: "2000 — 2007",
          place: "Bhatkal",
          body: "Coastal Karnataka. Seven years of quiet service and steady growth.",
        },
        {
          years: "2007 — Present",
          place: "Sagara",
          body: "Home, at last. Spandana Hospital — built from the ground up.",
          tag: "Spandana Hospital · Est. 2007",
          current: true,
        },
      ],
    },
  },

  roots: {
    img: "assets/grandparents.png",
    alt: "Family — the ones who made it possible",
    head: ["For the ones", "who made it", "<em>possible.</em>"],
    sub: "To the families of Nisarani — your sacrifices built all of this.",
    otherDoctor: { name: "Dr. Lakshmi Hegde", href: "#" },
    footer: "Spandana Hospital · Sagara, Karnataka",
  },

  // lifeline ticks (year + chapter), positioned 0..1 down the page
  ticks: [
    { at: 0.02, year: "1969", label: "Born" },
    { at: 0.22, year: "1984", label: "Origins" },
    { at: 0.46, year: "1986", label: "MBBS" },
    { at: 0.62, year: "1995", label: "Practice" },
    { at: 0.9, year: "Today", label: "Roots" },
  ],
};
