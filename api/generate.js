// TapImagine server: keeps your Gemini key and your prompts secret.
// Your users only send button names. This file turns them into a prompt.

const MODEL = "gemini-nano-banana-2.1";

const PROMPTS = {
  Couple: {
    Romantic: "a romantic couple close together at golden hour, gentle smiles, rose petals floating in the air, warm sunset glow",
    Wedding: "an Indian wedding couple in rich red and gold outfits with jewellery, decorated mandap with marigold flowers and fairy lights behind them",
    Cinematic: "a couple sharing an umbrella on a rain-lit city street at night, neon reflections, movie poster mood",
  },
  Boys: {
    Stylish: "a stylish young man in trendy streetwear leaning on a wall in a colourful city street, confident look",
    Gym: "a fit man in a modern gym holding dumbbells, dramatic side lighting, confident expression",
    Luxury: "a man in a perfectly tailored suit leaning on a shiny supercar, glittering city skyline at night behind him, wealthy confident look",
  },
  Girls: {
    Fashion: "a young woman in a high-fashion outfit, magazine cover look, elegant pose",
    Traditional: "a woman in a beautiful silk saree with traditional gold jewellery and flowers in her hair, temple courtyard with diyas",
    Portrait: "a soft dreamy portrait of a woman in a blooming flower garden, gentle smile",
  },
  Professional: {
    Business: "a confident professional in a business suit, arms crossed, modern glass office behind",
    LinkedIn: "a clean professional headshot, shoulders up, plain light grey background, friendly natural smile",
    Office: "a person working happily at a stylish desk with a laptop and coffee, bright modern office",
  },
  Lifestyle: {
    "Luxury car": "a person leaning on a luxury sports car at golden hour, stylish outfit, sunglasses in hand",
    Travel: "a happy traveller with a backpack at a scenic mountain viewpoint, mountains and clouds behind",
    "Rich lifestyle": "a person relaxing beside an infinity pool at a luxury villa with a sea view, holding a drink",
  },
  Fantasy: {
    Anime: "an anime hero character with a cool outfit, vibrant magical background",
    Superhero: "a superhero in a custom suit on a rooftop at night, cape blowing in the wind, city lights below",
    Fantasy: "a fantasy warrior in shining armour in a magical forest full of glowing lights",
  },
  Festival: {
    Diwali: "a festive Diwali scene, person in a rich embroidered kurta, glowing diyas, colourful rangoli, marigold garlands, lanterns and fireworks",
    Eid: "a joyful Eid scene, person in elegant festive clothes, glowing lanterns, crescent moon, soft golden light",
    Christmas: "a cosy Christmas scene beside a decorated tree with fairy lights and gifts, warm sweater",
    Holi: "a joyful Holi celebration, person in a white kurta covered in bright pink, yellow, green and blue colour powder, clouds of gulal in the air, big happy smile",
    "Raksha Bandhan": "a warm Raksha Bandhan scene, person in festive Indian clothes holding a beautiful decorated rakhi, puja thali with diya and sweets, soft golden light",
    Navratri: "a lively Navratri garba night, person in colourful traditional chaniya choli or kediyu with mirror work, holding dandiya sticks, festive lights and decorations",
    "Ganesh Chaturthi": "a devotional Ganesh Chaturthi scene, person in a traditional kurta beside a beautifully decorated Ganpati idol, marigold flowers, diyas and modak sweets",
    "Independence Day": "a proud Indian Independence Day scene, person in a white kurta holding a small Indian tricolour flag, tricolour balloons and decorations, bright sunny sky",
    Birthday: "a happy birthday party, person beside a big birthday cake with candles, colourful balloons, confetti and party decorations",
  },
  Group: {
    "Family portrait": "a warm family portrait, everyone dressed nicely in coordinated outfits, elegant living room with soft lights",
    "Family Diwali": "a family celebrating Diwali together, everyone in festive Indian clothes, glowing diyas, rangoli, marigold garlands and fireworks",
    "Friends trip": "a group of friends on a fun road trip, scenic mountain road and an open jeep behind them, happy and laughing",
    "Office team": "a confident team photo, everyone in smart office clothes, modern bright office behind them",
    Party: "a fun party celebration, balloons, fairy lights and confetti, everyone smiling and cheering",
    "Movie poster": "an epic Bollywood movie poster with the whole group as the heroes, dramatic lighting, action movie mood",
  },
  "Profile Pic": {
    "WhatsApp DP": "a friendly, clean profile picture, soft colourful background, warm smile",
    "Instagram DP": "a stylish, trendy profile picture, aesthetic pastel background, confident cool look",
    "LinkedIn photo": "a professional headshot, smart formal clothes, plain light grey background, confident friendly smile",
    "Cool avatar": "a fun, stylish avatar portrait with a bold colourful background",
  },
  Kids: {
    "Birthday party": "a happy birthday party for a young child, big colourful cake with candles, balloons, confetti and toys, child in a cute party outfit",
    "Little superhero": "a young child as a cute little superhero in a colourful kid-friendly costume with a small cape, playful heroic pose, bright cartoonish city behind",
    Astronaut: "a young child as a little astronaut in a cute space suit, floating among planets and stars, rocket in the background",
    "Cricket star": "a young child as a little cricket star in a team jersey holding a small bat, sunny cricket ground behind",
    "Little prince/princess": "a young child as a little prince or princess in a royal outfit with a small crown, fairytale palace garden behind",
    "Cartoon world": "a young child in a colourful cartoon toy land with friendly animals, candy trees and rainbows",
  },
};

// How every picture is framed: close, relaxed, full of detail.
const FRAMING =
  "Frame the person from the waist up so the face is large and clear. Relaxed, natural pose and a real, happy expression. Rich, detailed background. Portrait 4:5 image.";
const FRAMING_BY_CAT = {
  Couple: "Frame both people from the waist up, close together, so both faces are large and clear. Relaxed, natural, loving poses. Rich, detailed background. Portrait 4:5 image.",
  Group: "Keep every person from the photo, exactly the same number of people, nobody added or removed. Frame everyone so all faces are clear and visible. Natural, happy poses. Rich, detailed background. Portrait 4:5 image.",
  "Profile Pic": "Head-and-shoulders portrait, face centred and large, perfect for a round profile picture crop. Square 1:1 image.",
};

const STYLES = {
  "3D Cartoon": "3D animated movie style, like a Pixar film, soft lighting, bright cheerful colours",
  Realistic:
    "professional photoshoot by an expensive portrait photographer, shot on 85mm lens, softly blurred background, soft cinematic lighting, natural skin tones, balanced true-to-life colours with no orange tint, sharp focus on the face, magazine quality",
  Painting: "beautiful oil painting style, visible brush strokes, rich colours",
  Anime: "anime illustration style, vibrant colours, clean lines",
};

const KIDS_SAFETY =
  "This is a young child: keep the child exactly their real age and size, wholesome and age-appropriate, wearing normal fully covering kids' clothing, cheerful innocent mood.";

const SAFETY =
  "Keep it fully clothed, family-friendly and respectful. No text or watermarks.";

// Finds the generated image anywhere in Google's reply.
function findImage(node, found = []) {
  if (!node || typeof node !== "object") return found;
  if (Array.isArray(node)) {
    node.forEach((n) => findImage(n, found));
    return found;
  }
  if (node.type === "image" && typeof node.data === "string") {
    found.push({ data: node.data, mime: node.mime_type || "image/png" });
  } else if (node.inlineData && node.inlineData.data) {
    found.push({ data: node.inlineData.data, mime: node.inlineData.mimeType || "image/png" });
  }
  for (const key of Object.keys(node)) {
    if (key !== "data") findImage(node[key], found);
  }
  return found;
}

// ---- Money protection: daily limits (works when Upstash Redis is connected in Vercel) ----
const DAILY_LIMIT = Number(process.env.DAILY_LIMIT || 50); // free images for the whole app per day
const PER_IP_LIMIT = Number(process.env.PER_IP_LIMIT || 5); // free images per internet connection per day
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(cmds) {
  const r = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
  });
  return r.json();
}

// Returns null if allowed, or an error code if a limit is reached.
async function takeSlot(ip) {
  if (!REDIS_URL || !REDIS_TOKEN) return { code: null, undo: async () => {} }; // no store connected: no limits
  const day = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10); // India date
  const kAll = `free:${day}`, kIp = `free:${day}:${ip}`;
  try {
    const out = await redis([["INCR", kAll], ["EXPIRE", kAll, 172800], ["INCR", kIp], ["EXPIRE", kIp, 172800]]);
    const all = out[0].result, mine = out[2].result;
    const undo = async () => { try { await redis([["DECR", kAll], ["DECR", kIp]]); } catch (e) {} };
    if (all > DAILY_LIMIT) { await undo(); return { code: "daily_cap", undo: async () => {} }; }
    if (mine > PER_IP_LIMIT) { await undo(); return { code: "ip_cap", undo: async () => {} }; }
    return { code: null, undo };
  } catch (e) {
    console.error("limit check failed", e);
    return { code: null, undo: async () => {} };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "The app is missing its Gemini key. Add GEMINI_API_KEY in Vercel settings." });

  const { cat, opt, style, photo, photo2 } = req.body || {};
  const base = PROMPTS[cat] && PROMPTS[cat][opt];
  if (!base || !STYLES[style]) return res.status(400).json({ error: "Please pick a category, look and style again." });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const slot = await takeSlot(ip);
  if (slot.code === "daily_cap") return res.status(429).json({ code: "daily_cap", error: "Today's free images are finished. Please come back tomorrow!" });
  if (slot.code === "ip_cap") return res.status(429).json({ code: "ip_cap", error: "You've used today's free images. Please come back tomorrow!" });

  let prompt = `Create ${base}. Style: ${STYLES[style]}. ${FRAMING_BY_CAT[cat] || FRAMING} High quality. ${SAFETY}`;
  if (cat === "Kids") prompt += " " + KIDS_SAFETY;
  const input = [];

  const readPhoto = (p) => /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(p || "");
  const photos = [photo, photo2].filter(Boolean).map(readPhoto);
  if (photos.some((m) => !m)) { await slot.undo(); return res.status(400).json({ error: "That photo could not be read. Try a JPG or PNG." }); }

  if (photos.length === 2) {
    prompt += " The couple is the person in the first attached photo and the person in the second attached photo. Keep both faces, identities and real ages exactly the same.";
  } else if (photos.length === 1) {
    prompt += " Use the person (or people) from the attached photo and keep their face, identity and real age exactly the same (a child stays a child).";
  }
  input.push({ type: "text", text: prompt });
  photos.forEach((m) => input.push({ type: "image", mime_type: m[1], data: m[2] }));

  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, input }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("Gemini error", r.status, JSON.stringify(json).slice(0, 500));
      await slot.undo();
      return res.status(502).json({ error: "The image AI is busy or refused this request. Please try again." });
    }
    const imgs = findImage(json);
    if (!imgs.length) {
      await slot.undo();
      return res.status(422).json({ error: "No image came back. Try a different photo or look." });
    }
    const last = imgs[imgs.length - 1];
    return res.status(200).json({ image: `data:${last.mime};base64,${last.data}` });
  } catch (e) {
    console.error(e);
    await slot.undo();
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "4.5mb" } } };
