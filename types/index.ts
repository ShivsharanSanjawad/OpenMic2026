export type DynamicFieldType = "text" | "select" | "textarea" | "checkbox";

export type DynamicField = {
  id: string;
  label: string;
  type: DynamicFieldType;
  required: boolean;
  options?: string[];
};

export type PublicSettings = {
  upi_qr_url: string;
  upi_id: string;
  payment_amount_solo: string;
  payment_amount_group: string;
  form_fields: DynamicField[];
  event_date: string;
  event_venue: string;
  registrations_open: string; // "true" | "false"
  legacy_10_year_enabled: string; // "true" | "false"
};
