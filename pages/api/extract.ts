import type { NextApiRequest, NextApiResponse } from "next";
import * as mammoth from "mammoth";
import pdfParse from "pdf-parse";

type Ok = { text: string };
type Err = { error: string };

export const config = {
  api: { bodyParser: { sizeLimit: "15mb" } }, // pour gros PDF
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>
) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { fileName, fileBase64 } = req.body as { fileName?: string; fileBase64?: string };
    if (!fileName || !fileBase64) return res.status(400).json({ error: "Missing file" });

    const ext = fileName.toLowerCase().split(".").pop() || "";
    const buffer = Buffer.from(fileBase64, "base64");

    let text = "";

    if (ext === "pdf") {
      const data = await pdfParse(buffer);
      text = data.text || "";
    } else if (ext === "docx") {
      const out = await mammoth.extractRawText({ buffer });
      text = out.value || "";
    } else if (ext === "txt") {
      text = buffer.toString("utf8");
    } else {
      return res.status(415).json({ error: "Format non supporté (utilise PDF, DOCX ou TXT)" });
    }

    text = text.replace(/\r/g, "").trim();
    if (!text) return res.status(422).json({ error: "Impossible d'extraire du texte" });

    return res.status(200).json({ text });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
