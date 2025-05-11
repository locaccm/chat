export interface User {
  USEN_ID: number;
  USEC_URLPP: string;
  USEC_LNAME: string;
  USEC_FNAME: string;
  USEC_TYPE: "Owner" | "Tenant";
  USEC_BIO: string;
  USED_BIRTH: string;
  USEC_TEL: string;
  USEC_ADDRESS: string;
  USEC_MAIL: string;
  USEC_PASSWORD: string;
  USEN_INVITE: number | null;
}

export interface Message {
  MESN_ID: number;
  MESN_RECEIVER: number;
  MESN_SENDER: number;
  MESC_CONTENT: string;
  MESD_DATE: string;
  MESB_READ: boolean | 0 | 1;
}
