import { GoogleGenAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Batasi hanya menerima metode POST demi keamanan
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const dataSistem = req.body;
    const gambarBase64 = dataSistem.image_base64; // Menangkap string base64 dari GAS Kampus
    const promptSistem = dataSistem.prompt;

    // Mengambil API Key dari Environment Variable Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ status: "error", message: "API Key Gemini belum diset di Vercel!" });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Konfigurasi ketat agar Gemini WAJIB merespon dalam bentuk Objek JSON sesuai skema
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash", // Menggunakan model generasi terbaru yang super cepat & akurat
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            status: { type: "STRING" },
            nominal: { type: "NUMBER" },
            no_ref: { type: "STRING" }
          },
          required: ["status"]
        }
      }
    });

    // Jalankan analisis Vision AI dengan mengirimkan base64 murni
    const result = await model.generateContent([
      promptSistem,
      {
        inlineData: {
          data: gambarBase64,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const teksResponAi = result.response.text();

    // Kirim hasil kembali ke Apps Script utama kampus
    return res.status(200).json({
      status: "success",
      hasil: teksResponAi
    });

  } catch (error) {
    // Tetap return status 200 agar UrlFetchApp di GAS tidak crash/break, 
    // namun kita selipkan pesan error agar ditangkap oleh sistem failover GAS.
    return res.status(200).json({
      status: "error",
      message: error.toString()
    });
  }
}
