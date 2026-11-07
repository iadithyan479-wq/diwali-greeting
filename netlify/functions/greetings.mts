import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";
import { randomBytes } from "node:crypto";

export default async (req: Request, context: Context) => {
  const store = getStore("greetings");
  const audioStore = getStore("audio");

  const url = new URL(req.url);
  // path after /api/greetings or via function path
  const parts = url.pathname.replace(/^\/\.netlify\/functions\/greetings\/?/, "").replace(/^\/api\/greetings\/?/, "").split("/").filter(Boolean);
  const id = parts[0] || null;

  if (req.method === "POST") {
    try {
      const form = await req.formData();
      const clip = (v: FormDataEntryValue | null, n: number, d: string) =>
        String(v ?? d).trim().slice(0, n) || d;

      const greetingId = randomBytes(5).toString("base64url");
      let audioKey: string | null = null;

      const file = form.get("audio");
      if (file && typeof file !== "string" && file.size > 0) {
        if (file.size > 10 * 1024 * 1024) {
          return Response.json({ error: "Audio too large (max 10MB)" }, { status: 400 });
        }
        audioKey = randomBytes(8).toString("hex") + (file.name?.match(/\.\w+$/)?.[0] || ".webm");
        await audioStore.set(audioKey, file, {
          metadata: { contentType: file.type || "audio/webm" },
        });
      }

      const data = {
        id: greetingId,
        sender: clip(form.get("sender"), 60, "Someone who cares"),
        receiver: clip(form.get("receiver"), 60, "Dear One"),
        message: clip(form.get("message"), 600, "Wishing you a beautiful and prosperous Diwali!"),
        audio: audioKey,
        views: 0,
        created_at: new Date().toISOString(),
      };

      await store.setJSON(greetingId, data);
      return Response.json({ id: greetingId, url: `/g/${greetingId}` });
    } catch (e: any) {
      return Response.json({ error: e.message || "Failed" }, { status: 400 });
    }
  }

  if (req.method === "GET" && id) {
    const data = await store.get(id, { type: "json" }) as any;
    if (!data) return Response.json({ error: "Not found" }, { status: 404 });

    data.views = (data.views || 0) + 1;
    await store.setJSON(id, data);

    return Response.json({
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
      views: data.views,
      audioUrl: data.audio ? `/uploads/${data.audio}` : null,
    });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: ["/api/greetings", "/api/greetings/*"],
};
