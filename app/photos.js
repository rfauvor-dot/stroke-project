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
};
