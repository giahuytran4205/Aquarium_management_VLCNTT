import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

const systemInstruction =
  `You are an assistant for answering users's question about the current data of this mini aquarium. You will receive the latest data along with each message queries.
  Your response must be in HTML format to display on the website, html style must be locally. Your response not include \`\`\`html\`\`\``;

interface CurrentData {
  temp: number;
  humid: number;
  isPumping: boolean;
}

export class Chat {
  currentData: CurrentData;
  genAI: GoogleGenerativeAI;
  model: GenerativeModel;

  constructor(apiKey: string) {
    this.currentData = {
      temp: NaN,
      humid: NaN,
      isPumping: false,
    };

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
    });
  }

  updateData(nTemp: number, nHumid: number, nPump: boolean) {
    this.currentData = {
      temp: nTemp,
      humid: nHumid,
      isPumping: nPump,
    };
  }

  /**
   * @param message  Câu hỏi mới
   * @param history  Lịch sử hội thoại hiện tại
   * @returns        Lịch sử hội thoại mới (bao gồm câu hỏi + câu trả lời mới nhất)
   */
  async chat(message: string, history: Array<{ role: string; parts: { text: string }[] }>) {
    // Thêm dữ liệu hiện tại vào câu hỏi
    const contextData =
      `Current Aquarium Data:\n` +
      `Temperature: ${this.currentData.temp}°C\n` +
      `Humidity: ${this.currentData.humid}%\n` +
      `Pumping: ${this.currentData.isPumping ? "ON" : "OFF"}`;

    const fullMessage = `${message}\n\n${contextData}`;
    console.log("query history", history);
    // Thêm tin nhắn mới của user vào lịch sử
    // history.push({
    //   role: "user",
    //   parts: [{ text: fullMessage }],
    // });

    // Gọi API với toàn bộ lịch sử
    const chatSession = this.model.startChat({ history });
    const result = await chatSession.sendMessage(fullMessage);
    const replyText = result.response.text();

    // Thêm phản hồi vào lịch sử
    // history.push({
    //     role: "model",
    //     parts: [{ text: replyText }],
    // });
    history[history.length - 2].parts = [{text: message}]; // not showing current data
    console.log("result ", result);
    console.log(history);
    return history;
  }
}

// Ví dụ sử dụng
// (async () => {
//   const chatBot = new Chat(process.env.GEMINI_API_KEY!);
//   chatBot.updateData(26.5, 78, true);

//   let history: Array<{ role: string; parts: { text: string }[] }> = [];

//   history = await chatBot.chat("What is the current status of the aquarium?", history);
//   console.log("History after chat:", history);

//   history = await chatBot.chat("Should I turn off the pump now?", history);
//   console.log("History after second chat:", history);
// })();
