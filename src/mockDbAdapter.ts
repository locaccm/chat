import { DBClient } from "./websocket";

const mockAdapter: DBClient = {
  async getUserById(id: string) {
    if (id === "1" || id === "2") {
      return { id };
    }
    return null;
  },
  async saveMessage(from, to, message) {
    return {
      MESN_SENDER: from,
      MESN_RECEIVER: to,
      MESC_CONTENT: message,
      MESD_DATE: new Date(),
      MESB_NEW: true,
    };
  },
};

export default mockAdapter;
