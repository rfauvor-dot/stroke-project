// Reclaim — real photographs for the word library, sourced from Wikimedia
// Commons (freely licensed, individually verified — see PHOTO_CREDITS below
// and README.md for the reviewable source/license table Rick asked for).
//
// PILOT SCOPE: this covers the 6 words that previously had wrong pictures
// (kettle/fridge/pillow/stairs/library/towel). The other 42 words still use
// the custom icons/emoji from icons.js, which are accurate — just not photos
// yet. Add more entries here as photos are sourced and reviewed; anything
// without an entry automatically falls back to its icon, so a missing or
// broken photo can never blank out a card mid-session.
//
// Every URL is Wikimedia's "Special:FilePath" redirect — the officially
// supported stable direct-image link for a Commons file (redirects to the
// real upload.wikimedia.org URL). Verified reachable 2026-07-17.
export const PHOTOS = {
  kettle: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:White_electric_kettle.JPG",
    credit: "White electric kettle — Wikimedia Commons",
    license: "CC BY-SA 3.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:White_electric_kettle.JPG",
  },
  refrigerator: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Fridge.jpg",
    credit: "Fridge — Wikimedia Commons",
    license: "CC BY-SA 3.0 / GFDL",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Fridge.jpg",
  },
  pillow: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Average_White_Pillow.jpg",
    credit: "Average White Pillow — Wikimedia Commons",
    license: "CC BY-SA 4.0 / GFDL",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Average_White_Pillow.jpg",
  },
  stairs: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Interior_Apartment_Staircase_-_Modulightor_Building_Paul_Ruldolph.jpg",
    credit: "Interior apartment staircase, Modulightor Building — Wikimedia Commons",
    license: "CC BY-SA 4.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Interior_Apartment_Staircase_-_Modulightor_Building_Paul_Ruldolph.jpg",
  },
  library: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Library_book_stacks.jpg",
    credit: "Library book stacks — Wikimedia Commons",
    license: "CC0 (public domain)",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Library_book_stacks.jpg",
  },
  towel: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Handtuch.jpg",
    credit: "Handtuch (terry cloth towel) — Wikimedia Commons",
    license: "Public domain",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Handtuch.jpg",
  },

  // Batch 2 (2026-07-17) — common concrete nouns, all verified same way.
  cup: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Coffee_cup_(1).jpg",
    credit: "Coffee cup — Wikimedia Commons",
    license: "Public domain",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Coffee_cup_(1).jpg",
  },
  spoon: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Teaspoon_%26_tablespoon.jpg",
    credit: "Teaspoon & tablespoon — Wikimedia Commons",
    license: "CC BY-SA 3.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Teaspoon_%26_tablespoon.jpg",
  },
  key: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Standard-lock-key.jpg",
    credit: "Standard lock key — Wikimedia Commons",
    license: "Public domain",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Standard-lock-key.jpg",
  },
  shoes: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Adidas_Superstar_shoes_pair.jpg",
    credit: "Adidas Superstar shoes, pair — Wikimedia Commons",
    license: "CC BY 2.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Adidas_Superstar_shoes_pair.jpg",
  },
  toothbrush: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Toothbrush-20060209.JPG",
    credit: "Toothbrushes in a cup — Wikimedia Commons",
    license: "Public domain",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Toothbrush-20060209.JPG",
  },
  soap: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Bar_of_Castile_soap.jpg",
    credit: "Bar of Castile soap — Wikimedia Commons",
    license: "CC BY-SA 3.0 / GFDL",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Bar_of_Castile_soap.jpg",
  },

  // Batch 3 (2026-07-17) — window/TV/coat/umbrella skipped this round: no
  // clean single-subject Commons photo found without forcing a weak match.
  bread: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Loaf_of_Bread_(Unsplash_tm3Diid694Y).jpg",
    credit: "Loaf of bread, sliced — Wikimedia Commons (Unsplash)",
    license: "CC0 (public domain)",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Loaf_of_Bread_(Unsplash_tm3Diid694Y).jpg",
  },
  apple: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Red_Apple.jpg",
    credit: "Red apple on white background — Wikimedia Commons",
    license: "CC BY 2.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Red_Apple.jpg",
  },
  glasses: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Reading_glasses.jpg",
    credit: "Reading glasses — Wikimedia Commons",
    license: "Public domain",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Reading_glasses.jpg",
  },
  car: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/File:1992_Toyota_Corolla_(side_view)_(48419578466).jpg",
    credit: "1992 Toyota Corolla, side view — Wikimedia Commons",
    license: "CC BY 2.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:1992_Toyota_Corolla_(side_view)_(48419578466).jpg",
  },

  // Batch 4 (2026-07-17) — Rick-supplied local images (app/photos/*.png),
  // filling exactly the 4 words batch 3 skipped for lack of a clean Commons
  // photo. AI-generated (ChatGPT/DALL-E, Google Gemini); ownership/commercial
  // rights confirmed 2026-07-18. Local files load faster and don't depend on
  // an external host.
  television: {
    url: "./photos/television.png",
    credit: "Supplied by Rick",
    license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user",
    sourcePage: null,
  },
  coat: {
    url: "./photos/coat.png",
    credit: "Supplied by Rick",
    license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user",
    sourcePage: null,
  },
  umbrella: {
    url: "./photos/umbrella.png",
    credit: "Supplied by Rick",
    license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user",
    sourcePage: null,
  },
  window: {
    url: "./photos/window.png",
    credit: "Supplied by Rick",
    license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user",
    sourcePage: null,
  },

  // Batch 5 (2026-07-18) — Rick-supplied local images for the Family &
  // People set. Deliberately relational, not generic stock photos: husband
  // shows hands + wedding ring (not a face), neighbor shows the "waving over
  // the fence" association from the word's own SFA data, grandson shows a
  // child's hand reaching an elder's rather than full faces.
  husband: {
    url: "./photos/husband.png",
    credit: "Supplied by Rick",
    license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user",
    sourcePage: null,
  },
  daughter: {
    url: "./photos/daughter.png",
    credit: "Supplied by Rick",
    license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user",
    sourcePage: null,
  },
  neighbor: {
    url: "./photos/neighbor.png",
    credit: "Supplied by Rick",
    license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user",
    sourcePage: null,
  },
  doctor: {
    url: "./photos/doctor.png",
    credit: "Supplied by Rick",
    license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user",
    sourcePage: null,
  },
  friend: {
    url: "./photos/friend.png",
    credit: "Supplied by Rick",
    license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user",
    sourcePage: null,
  },
  grandson: {
    url: "./photos/grandson.png",
    credit: "Supplied by Rick",
    license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user",
    sourcePage: null,
  },

  // Batch 6 (2026-07-18) — Rick-supplied local images, 19 words including
  // the hardest category (actions: walk/cook/read/laugh/sing/remember) and
  // the abstract ones (appointment, remember). All reviewed and confirmed
  // clean single-subject matches.
  appointment: { url: "./photos/appointment.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  bird: { url: "./photos/bird.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  church: { url: "./photos/church.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  cook: { url: "./photos/cook.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  flower: { url: "./photos/flower.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  laugh: { url: "./photos/laugh.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  medicine: { url: "./photos/medicine.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  money: { url: "./photos/money.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  rain: { url: "./photos/rain.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  read: { url: "./photos/read.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  remember: { url: "./photos/remember.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  restaurant: { url: "./photos/restaurant.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  shovel: { url: "./photos/shovel.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  sing: { url: "./photos/sing.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  store: { url: "./photos/store.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  tree: { url: "./photos/tree.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  vegetables: { url: "./photos/vegetables.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  walk: { url: "./photos/walk.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  water: { url: "./photos/water.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },

  // Batch 7 (2026-07-18) — final 3 words, completing the 48-word library.
  telephone: { url: "./photos/telephone.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  button: { url: "./photos/button.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
  scarf: { url: "./photos/scarf.png", credit: "Supplied by Rick", license: "AI-generated by Rick (ChatGPT/DALL-E or Google Gemini) — ownership confirmed 2026-07-18, both platforms grant full commercial/redistribution rights to the user", sourcePage: null },
};
