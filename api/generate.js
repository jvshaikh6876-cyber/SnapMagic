// TapImagine server: keeps your Gemini key and your prompts secret.
// Your users only send button names. This file turns them into a prompt.

const MODEL = "gemini-nano-banana-2.1";

const PROMPTS = {
  Couple: {
    Romantic: "a romantic couple portrait at golden hour, soft warm light, rose petals in the air",
    Wedding: "an elegant Indian wedding couple portrait, rich red and gold outfits, decorated mandap behind them",
    Cinematic: "a cinematic couple scene like a movie poster, moody lighting, rain-lit city street at night",
  },
  Boys: {
    Stylish: "a stylish young man in trendy streetwear, urban background, fashion photoshoot",
    Gym: "a fit man in a modern gym, dramatic lighting, confident athletic pose",
    Luxury: "a man in a tailored suit standing beside a luxury car, city skyline at night",
  },
  Girls: {
    Fashion: "a young woman in a high-fashion outfit, studio lighting, magazine cover style",
    Traditional: "a woman in a beautiful saree with traditional jewellery, temple courtyard, soft light",
    Portrait: "a soft natural-light portrait of a woman, blurred flower garden background",
  },
  Professional: {
    Business: "a confident professional in a business suit, modern office, clean light",
    LinkedIn: "a clean professional headshot, plain light grey background, friendly smile, shoulders up",
    Office: "a person working at a stylish desk with a laptop, bright modern office",
  },
  Lifestyle: {
    "Luxury car": "a person standing next to a luxury sports car at golden hour",
    Travel: "a traveller at a scenic mountain viewpoint with a backpack, wide landscape",
    "Rich lifestyle": "a person relaxing beside an infinity pool at a luxury villa",
  },
  Fantasy: {
    Anime: "an anime-style character portrait, vibrant colours, detailed eyes",
    Superhero: "a superhero in a custom suit standing on a rooftop, cape blowing in the wind",
    Fantasy: "a fantasy warrior in a magical forest full of glowing lights",
  },
  Festival: {
    Diwali: "a festive Diwali portrait with glowing diyas, rangoli and warm lights",
    Eid: "a joyful Eid portrait with lanterns, a crescent moon and soft golden light",
    Christmas: "a cosy Christmas portrait beside a decorated tree with fairy lights",
  },
};

const STYLES = {
  Realistic: "ultra-realistic photograph",
  "3D Cartoon": "3D animated movie style",
  Painting: "oil painting style",
  Anime: "anime illustration style",
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

  let prompt = `Create ${base}, ${STYLES[style]}, high quality, sharp details, portrait 4:5 framing. ${SAFETY}`;
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
