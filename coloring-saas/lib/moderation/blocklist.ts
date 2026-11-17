// Trademarked brands and characters we refuse in prompts.
// Matching ignores case, accents, punctuation and spacing ("Hello-Kitty", "hellokitty" and "HELLO KITTY" all match).
// Keep entries specific enough to avoid blocking normal words (e.g. "super mario", not "mario").
export const TRADEMARK_BLOCKLIST: string[] = [
  // Disney / Pixar
  "disney", "pixar", "mickey mouse", "minnie mouse", "donald duck", "goofy", "pluto the dog",
  "frozen elsa", "elsa and anna", "princess elsa", "olaf", "moana", "encanto", "mirabel",
  "toy story", "buzz lightyear", "woody and buzz", "lightning mcqueen", "cars movie",
  "lilo and stitch", "stitch", "winnie the pooh", "tigger", "the lion king", "simba",
  "little mermaid", "ariel", "cinderella", "rapunzel", "tangled", "jasmine and aladdin",
  "aladdin", "belle and the beast", "snow white", "inside out", "monsters inc", "nemo",
  "finding dory", "zootopia", "wish asha",
  // Marvel / DC / Star Wars
  "marvel", "avengers", "spider man", "spiderman", "spidey", "iron man", "ironman", "hulk",
  "captain america", "thor", "black panther", "deadpool", "wolverine", "x men",
  "dc comics", "batman", "superman", "wonder woman", "aquaman", "harley quinn",
  "star wars", "darth vader", "yoda", "grogu", "baby yoda", "mandalorian", "stormtrooper",
  // Japanese brands
  "pokemon", "pikachu", "eevee", "charizard", "hello kitty", "sanrio", "kuromi", "my melody",
  "cinnamoroll", "pompompurin", "keroppi", "totoro", "studio ghibli", "spirited away",
  "naruto", "dragon ball", "goku", "sailor moon", "one piece", "luffy", "demon slayer",
  "my hero academia", "jujutsu kaisen", "attack on titan", "doraemon", "kirby", "chiikawa",
  // Kids TV and toys
  "bluey", "bingo heeler", "peppa pig", "paw patrol", "chase and marshall", "cocomelon",
  "gabbys dollhouse", "gabby's dollhouse", "sesame street", "elmo", "cookie monster",
  "spongebob", "sponge bob", "patrick star", "dora the explorer", "barbie", "my little pony",
  "care bears", "smurfs", "smurf", "minions", "despicable me", "shrek", "trolls poppy",
  "blippi", "ms rachel", "pj masks", "teletubbies", "thomas the tank engine", "hot wheels",
  "lego", "transformers", "optimus prime", "power rangers", "teenage mutant ninja turtles",
  "ninja turtles", "tmnt", "squishmallow", "labubu", "bratz", "lol surprise", "hatchimals",
  "stranger things", "wednesday addams", "harry potter", "hogwarts", "hermione",
  // Games
  "minecraft", "roblox", "fortnite", "super mario", "mario bros", "luigi",
  "princess peach", "bowser", "yoshi", "sonic the hedgehog", "sonic hedgehog", "zelda",
  "among us", "animal crossing", "pac man", "pacman", "five nights at freddys", "fnaf",
  "huggy wuggy", "poppy playtime", "skibidi",
  // Music / other recent hits
  "kpop demon hunters", "k pop demon hunters", "huntrix", "saja boys", "taylor swift",
  "bts", "blackpink",
  // Sports leagues and brands
  "nfl", "nba", "mlb", "nhl", "fifa", "nike", "adidas", "coca cola", "mcdonalds", "mcdonald's",
];

export function normalizeForMatch(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents (pokémon -> pokemon)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const entries = TRADEMARK_BLOCKLIST.map((term) => {
  const spaced = normalizeForMatch(term);
  return { term, spaced, compact: spaced.replace(/ /g, "") };
});

/** Returns the first blocked term found in the text, or null. */
export function findBlockedTerm(text: string): string | null {
  const spaced = ` ${normalizeForMatch(text)} `;
  const compact = spaced.replace(/ /g, "");
  for (const entry of entries) {
    // Whole words only, with an optional plural "s" ("pokemons").
    if (spaced.includes(` ${entry.spaced} `) || spaced.includes(` ${entry.spaced}s `)) {
      return entry.term;
    }
    // Catch run-together spellings like "hellokitty". Only for multi-word terms, so
    // single words like "marvel" don't match inside "marvelous".
    if (entry.spaced.includes(" ") && compact.includes(entry.compact)) return entry.term;
  }
  return null;
}
