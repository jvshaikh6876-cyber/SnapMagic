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
  },
};

// How every picture is framed: close, relaxed, full of detail.
const FRAMING =
  "Frame the person from the waist up so the face is large and clear. Relaxed, natural pose and a real, happy expression. Rich, detailed background.";

const STYLES = {
  "3D Cartoon": "3D animated movie style, like a Pixar film, soft lighting, bright cheerful colours",
  Realistic:
    "professional photoshoot by an expensive portrait photographer, shot on 85mm lens, softly blurred background, soft cinematic lighting, natural skin tones, balanced true-to-life colours with no orange tint, sharp focus on the face, magazine quality",
  Painting: "beautiful oil painting style, visible brush strokes, rich colours",
  Anime: "anime illustration style, vibrant colours, clean lines",
};

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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "The app is missing its Gemini key. Add GEMINI_API_KEY in Vercel settings." });

  const { cat, opt, style, photo } = req.body || {};
  const base = PROMPTS[cat] && PROMPTS[cat][opt];
  if (!base || !STYLES[style]) return res.status(400).json({ error: "Please pick a category, look and style again." });

  let prompt = `Create ${base}. Style: ${STYLES[style]}. ${FRAMING} Portrait 4:5 image, high quality. ${SAFETY}`;
  const input = [];

  if (photo) {
    const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(photo);
    if (!m) return res.status(400).json({ error: "That photo could not be read. Try a JPG or PNG." });
    prompt += " Use the person (or people) from the attached photo and keep their face and identity exactly the same.";
    input.push({ type: "text", text: prompt });
    input.push({ type: "image", mime_type: m[1], data: m[2] });
  } else {
    input.push({ type: "text", text: prompt });
  }

  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, input }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("Gemini error", r.status, JSON.stringify(json).slice(0, 500));
      return res.status(502).json({ error: "The image AI is busy or refused this request. Please try again." });
    }
    const imgs = findImage(json);
    if (!imgs.length) {
      return res.status(422).json({ error: "No image came back. Try a different photo or look." });
    }
    const last = imgs[imgs.length - 1];
    return res.status(200).json({ image: `data:${last.mime};base64,${last.data}` });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };
