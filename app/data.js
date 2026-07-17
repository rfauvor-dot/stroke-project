// Reclaim — Phase 1 word library (8 sets × 6 words = 48 items for beta; expands to 24×8)
// Each word carries its SFA feature answers + cue ladder content.

export const WORD_SETS = [
  { id: 1, name: "Kitchen & Food", category: "household" },
  { id: 2, name: "Family & People", category: "people" },
  { id: 3, name: "Around the House", category: "household" },
  { id: 4, name: "Getting Dressed", category: "clothing" },
  { id: 5, name: "Out & About", category: "community" },
  { id: 6, name: "Health & Daily Care", category: "health" },
  { id: 7, name: "In the Garden", category: "outdoors" },
  { id: 8, name: "Everyday Actions", category: "actions" },
];

export const WORDS = [
  // set 1 — Kitchen & Food
  { id: 101, set: 1, word: "cup", emoji: "☕", category: "something you drink from", use: "holding a hot drink", property: "small, has a handle", location: "in the kitchen cupboard", association: "coffee or tea", frame: "You drink coffee from a ___", phoneme: "k", difficulty: 1 },
  { id: 102, set: 1, word: "spoon", emoji: "🥄", category: "a utensil", use: "eating soup or stirring", property: "metal, with a round end", location: "in the cutlery drawer", association: "a bowl of cereal", frame: "You stir your tea with a ___", phoneme: "s", difficulty: 1 },
  { id: 103, set: 1, word: "bread", emoji: "🍞", category: "a food", use: "making sandwiches or toast", property: "soft inside, brown crust", location: "on the counter or in the pantry", association: "butter", frame: "You make toast from a slice of ___", phoneme: "b", difficulty: 1 },
  { id: 104, set: 1, word: "kettle", icon: "kettle", category: "a kitchen appliance", use: "boiling water", property: "has a spout and whistles", location: "on the stove or counter", association: "making tea", frame: "To boil water for tea, you fill the ___", phoneme: "k", difficulty: 2 },
  { id: 105, set: 1, word: "apple", emoji: "🍎", category: "a fruit", use: "eating as a snack", property: "round, red or green", location: "in the fruit bowl", association: "the doctor away", frame: "An ___ a day keeps the doctor away", phoneme: "a", difficulty: 1 },
  { id: 106, set: 1, word: "refrigerator", icon: "fridge", category: "a large appliance", use: "keeping food cold", property: "tall, white, with doors", location: "in the kitchen", association: "milk and leftovers", frame: "You keep milk cold in the ___", phoneme: "r", difficulty: 3 },

  // set 2 — Family & People
  { id: 201, set: 2, word: "husband", emoji: "🧑", category: "a family member", use: "your partner in marriage", property: "the man you married", location: "at home with you", association: "your wedding day", frame: "The man you married is your ___", phoneme: "h", difficulty: 1 },
  { id: 202, set: 2, word: "daughter", emoji: "👧", category: "a family member", use: "your female child", property: "she calls you Mom", location: "in the family", association: "your children", frame: "Your female child is your ___", phoneme: "d", difficulty: 2 },
  { id: 203, set: 2, word: "neighbor", emoji: "🏘️", category: "a person you know", use: "someone living close by", property: "friendly, nearby", location: "next door", association: "waving over the fence", frame: "The person living next door is your ___", phoneme: "n", difficulty: 2 },
  { id: 204, set: 2, word: "doctor", emoji: "🩺", category: "a profession", use: "treating people who are sick", property: "wears a white coat", location: "at the clinic or hospital", association: "a stethoscope", frame: "When you're sick, you go to see the ___", phoneme: "d", difficulty: 1 },
  { id: 205, set: 2, word: "friend", emoji: "🤝", category: "a person you care about", use: "someone you enjoy spending time with", property: "kind, trusted", location: "wherever you meet up", association: "laughing together", frame: "Someone you trust and enjoy time with is a ___", phoneme: "f", difficulty: 1 },
  { id: 206, set: 2, word: "grandson", emoji: "👦", category: "a family member", use: "your child's son", property: "young, calls you Grandma", location: "in the family", association: "birthday visits", frame: "Your child's little boy is your ___", phoneme: "g", difficulty: 2 },

  // set 3 — Around the House
  { id: 301, set: 3, word: "key", emoji: "🔑", category: "a small object", use: "unlocking the door", property: "small, metal, jagged edge", location: "in your pocket or by the door", association: "locking up at night", frame: "You unlock the front door with a ___", phoneme: "k", difficulty: 1 },
  { id: 302, set: 3, word: "window", emoji: "🪟", category: "part of a house", use: "letting in light and air", property: "made of glass", location: "in the wall", association: "curtains", frame: "You look outside through the ___", phoneme: "w", difficulty: 1 },
  { id: 303, set: 3, word: "pillow", icon: "pillow", category: "something on a bed", use: "resting your head", property: "soft and fluffy", location: "at the head of the bed", association: "sleeping", frame: "At night you rest your head on a ___", phoneme: "p", difficulty: 1 },
  { id: 304, set: 3, word: "television", emoji: "📺", category: "an electronic device", use: "watching shows and news", property: "flat screen, has a remote", location: "in the living room", association: "the evening news", frame: "You watch your favorite show on the ___", phoneme: "t", difficulty: 2 },
  { id: 305, set: 3, word: "stairs", icon: "stairs", category: "part of a house", use: "going up and down floors", property: "steps in a row", location: "between floors", association: "holding the handrail", frame: "To reach the second floor you climb the ___", phoneme: "st", difficulty: 2 },
  { id: 306, set: 3, word: "telephone", emoji: "📞", category: "a device", use: "calling people", property: "it rings", location: "in your hand or on the wall", association: "hearing a loved one's voice", frame: "When it rings, you answer the ___", phoneme: "t", difficulty: 2 },

  // set 4 — Getting Dressed
  { id: 401, set: 4, word: "shoes", emoji: "👟", category: "something you wear", use: "protecting your feet", property: "come in pairs, have laces", location: "by the front door", association: "going for a walk", frame: "Before going outside, you put on your ___", phoneme: "sh", difficulty: 1 },
  { id: 402, set: 4, word: "coat", emoji: "🧥", category: "clothing", use: "keeping warm outside", property: "long sleeves, buttons or zipper", location: "on the coat rack", association: "cold winter days", frame: "When it's cold out, you wear a ___", phoneme: "k", difficulty: 1 },
  { id: 403, set: 4, word: "glasses", emoji: "👓", category: "something you wear", use: "helping you see clearly", property: "two lenses, sit on your nose", location: "on your face or nightstand", association: "reading the paper", frame: "To read small print, you put on your ___", phoneme: "gl", difficulty: 2 },
  { id: 404, set: 4, word: "button", emoji: "🔘", category: "part of clothing", use: "fastening a shirt", property: "small and round", location: "down the front of a shirt", association: "buttoning up", frame: "You fasten your shirt with a ___", phoneme: "b", difficulty: 2 },
  { id: 405, set: 4, word: "scarf", emoji: "🧣", category: "clothing", use: "keeping your neck warm", property: "long and soft", location: "around your neck", association: "winter wind", frame: "In winter you wrap your neck in a ___", phoneme: "sk", difficulty: 2 },
  { id: 406, set: 4, word: "umbrella", emoji: "☂️", category: "something you carry", use: "staying dry in the rain", property: "opens wide, has a handle", location: "by the door", association: "rainy days", frame: "When it rains, you open your ___", phoneme: "u", difficulty: 3 },

  // set 5 — Out & About
  { id: 501, set: 5, word: "car", emoji: "🚗", category: "a vehicle", use: "driving places", property: "four wheels, an engine", location: "in the driveway", association: "road trips", frame: "You drive to the store in your ___", phoneme: "k", difficulty: 1 },
  { id: 502, set: 5, word: "store", emoji: "🏪", category: "a place", use: "buying groceries", property: "has aisles and a checkout", location: "in town", association: "a shopping list", frame: "You buy your groceries at the ___", phoneme: "st", difficulty: 1 },
  { id: 503, set: 5, word: "money", emoji: "💵", category: "something you spend", use: "paying for things", property: "bills and coins", location: "in your wallet", association: "the bank", frame: "To pay for groceries you need ___", phoneme: "m", difficulty: 1 },
  { id: 504, set: 5, word: "church", emoji: "⛪", category: "a place", use: "worship and community", property: "has a steeple", location: "in the neighborhood", association: "Sunday mornings", frame: "On Sunday mornings some people go to ___", phoneme: "ch", difficulty: 2 },
  { id: 505, set: 5, word: "library", icon: "library", category: "a place", use: "borrowing books", property: "quiet, full of shelves", location: "in town", association: "a library card", frame: "You borrow books from the ___", phoneme: "l", difficulty: 2 },
  { id: 506, set: 5, word: "restaurant", emoji: "🍽️", category: "a place", use: "eating a meal out", property: "has menus and waiters", location: "in town", association: "a dinner date", frame: "For a nice dinner out, you go to a ___", phoneme: "r", difficulty: 3 },

  // set 6 — Health & Daily Care
  { id: 601, set: 6, word: "medicine", emoji: "💊", category: "something for your health", use: "helping you feel better", property: "pills or liquid", location: "in the cabinet", association: "the pharmacy", frame: "The doctor prescribed some ___", phoneme: "m", difficulty: 2 },
  { id: 602, set: 6, word: "toothbrush", emoji: "🪥", category: "a bathroom item", use: "cleaning your teeth", property: "small brush with a handle", location: "by the bathroom sink", association: "toothpaste", frame: "Every morning you brush your teeth with a ___", phoneme: "t", difficulty: 2 },
  { id: 603, set: 6, word: "soap", emoji: "🧼", category: "a bathroom item", use: "washing your hands", property: "slippery, makes bubbles", location: "by the sink", association: "clean hands", frame: "You wash your hands with ___", phoneme: "s", difficulty: 1 },
  { id: 604, set: 6, word: "towel", icon: "towel", category: "a bathroom item", use: "drying off", property: "soft cloth", location: "hanging in the bathroom", association: "after a shower", frame: "After a shower you dry off with a ___", phoneme: "t", difficulty: 1 },
  { id: 605, set: 6, word: "water", emoji: "💧", category: "something you drink", use: "staying hydrated", property: "clear liquid", location: "from the tap", association: "a glass at dinner", frame: "When you're thirsty, you drink a glass of ___", phoneme: "w", difficulty: 1 },
  { id: 606, set: 6, word: "appointment", emoji: "📅", category: "a scheduled event", use: "meeting the doctor at a set time", property: "written on the calendar", location: "on your schedule", association: "the doctor's office", frame: "The doctor's office called about your ___", phoneme: "a", difficulty: 3 },

  // set 7 — In the Garden
  { id: 701, set: 7, word: "flower", emoji: "🌸", category: "a plant", use: "making the garden beautiful", property: "colorful petals", location: "in the garden or a vase", association: "spring", frame: "You put a beautiful ___ in the vase", phoneme: "fl", difficulty: 1 },
  { id: 702, set: 7, word: "tree", emoji: "🌳", category: "a plant", use: "giving shade", property: "tall, with leaves and branches", location: "in the yard", association: "birds nesting", frame: "The birds built a nest in the ___", phoneme: "tr", difficulty: 1 },
  { id: 703, set: 7, word: "bird", emoji: "🐦", category: "an animal", use: "singing in the morning", property: "has wings and feathers", location: "in the trees", association: "a bird feeder", frame: "Outside the window you heard a ___ singing", phoneme: "b", difficulty: 1 },
  { id: 704, set: 7, word: "rain", emoji: "🌧️", category: "weather", use: "watering the garden", property: "wet, falls from clouds", location: "outside", association: "gray skies", frame: "The garden got watered by the ___", phoneme: "r", difficulty: 1 },
  { id: 705, set: 7, word: "shovel", emoji: "🪏", category: "a garden tool", use: "digging holes", property: "long handle, flat blade", location: "in the shed", association: "planting", frame: "To dig a hole for planting, you use a ___", phoneme: "sh", difficulty: 2 },
  { id: 706, set: 7, word: "vegetables", emoji: "🥕", category: "food you grow", use: "eating healthy", property: "carrots, beans, tomatoes", location: "in the garden or crisper", association: "the dinner plate", frame: "From the garden you picked fresh ___", phoneme: "v", difficulty: 3 },

  // set 8 — Everyday Actions
  { id: 801, set: 8, word: "walk", emoji: "🚶", category: "an action", use: "moving on foot", property: "one step at a time", location: "around the block", association: "fresh air", frame: "Every morning you go for a ___", phoneme: "w", difficulty: 1 },
  { id: 802, set: 8, word: "cook", emoji: "🍳", category: "an action", use: "making a meal", property: "done at the stove", location: "in the kitchen", association: "dinner time", frame: "Tonight it's your turn to ___", phoneme: "k", difficulty: 1 },
  { id: 803, set: 8, word: "read", emoji: "📖", category: "an action", use: "enjoying a book", property: "done with your eyes", property2: "", location: "in a comfy chair", association: "a good story", frame: "Before bed you like to ___", phoneme: "r", difficulty: 1 },
  { id: 804, set: 8, word: "laugh", emoji: "😄", category: "an action", use: "showing you find something funny", property: "happy sound", location: "anywhere joyful", association: "a good joke", frame: "A funny joke makes you ___", phoneme: "l", difficulty: 2 },
  { id: 805, set: 8, word: "sing", emoji: "🎵", category: "an action", use: "making music with your voice", property: "melody and words", location: "in the shower or at church", association: "your favorite song", frame: "Along with the radio, you like to ___", phoneme: "s", difficulty: 2 },
  { id: 806, set: 8, word: "remember", emoji: "💭", category: "an action", use: "bringing something back to mind", property: "done in your head", location: "in your thoughts", association: "old photographs", frame: "Looking at old photos helps you ___", phoneme: "r", difficulty: 3 },
];
