import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const key = url.pathname
    .replace(/^\/\.netlify\/functions\/uploads\/?/, "")
    .replace(/^\/uploads\/?/, "")
    .split("?")[0];

  if (!key) return new Response("Not found", { status: 404 });

  const audioStore = getStore("audio");
  const entry = await audioStore.getWithMetadata(key, { type: "arrayBuffer" });
  if (!entry) return new Response("Not found", { status: 404 });

  const contentType = (entry.metadata?.contentType as string) || "audio/webm";
  return new Response(entry.data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};

export const config: Config = {
  path: "/uploads/*",
};
