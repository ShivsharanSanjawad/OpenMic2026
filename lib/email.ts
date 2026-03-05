import nodemailer from "nodemailer";

type RegistrationMailData = {
  id: string;
  name: string;
  email: string;
  performanceType: string;
  performanceTitle: string | null;
  paymentStatus: string;
};

type EventMeta = {
  eventDate: string;
  eventVenue: string;
};

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD are required");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendRegistrationEmail(registration: RegistrationMailData, eventMeta: EventMeta) {
  const transporter = getTransporter();
  const from = process.env.GMAIL_FROM ?? process.env.GMAIL_USER ?? "";

  await transporter.sendMail({
    from,
    to: registration.email,
    subject: "You're registered for SPARK OpenMic 10! 🎤",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.5">
        <h2>SPARK OpenMic 10 — Registration Confirmed</h2>
        <p>Hello ${registration.name},</p>
        <p>Your registration has been received successfully.</p>
        <ul>
          <li><strong>Registration ID:</strong> ${registration.id}</li>
          <li><strong>Performance Type:</strong> ${registration.performanceType}</li>
          <li><strong>Performance Title:</strong> ${registration.performanceTitle ?? "N/A"}</li>
          <li><strong>Payment Status:</strong> ${registration.paymentStatus}</li>
          <li><strong>Event Date:</strong> ${eventMeta.eventDate}</li>
          <li><strong>Event Venue:</strong> ${eventMeta.eventVenue}</li>
        </ul>
        <p><strong>What's next:</strong> Our team will verify your payment screenshot and update your status.</p>
        <p>See you on stage!<br/>Team SPARK</p>
      </div>
    `,
  });
}

export async function sendPaymentVerifiedEmail(
  registration: RegistrationMailData,
  eventMeta: EventMeta,
  slotInfo?: string,
) {
  const transporter = getTransporter();
  const from = process.env.GMAIL_FROM ?? process.env.GMAIL_USER ?? "";

  await transporter.sendMail({
    from,
    to: registration.email,
    subject: "Payment Confirmed — See you at the Mic! ✅",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.5">
        <h2>Payment Verified ✅</h2>
        <p>Hello ${registration.name},</p>
        <p>Your payment is verified for SPARK OpenMic 10.</p>
        <ul>
          <li><strong>Registration ID:</strong> ${registration.id}</li>
          <li><strong>Performance Type:</strong> ${registration.performanceType}</li>
          <li><strong>Event Date:</strong> ${eventMeta.eventDate}</li>
          <li><strong>Event Venue:</strong> ${eventMeta.eventVenue}</li>
          <li><strong>Slot Info:</strong> ${slotInfo ?? "Will be announced soon"}</li>
        </ul>
        <p>You're all set. The stage is yours!</p>
      </div>
    `,
  });
}

export async function sendPaymentRejectedEmail(
  registration: RegistrationMailData,
  eventMeta: EventMeta,
  adminComment?: string,
  isPendingCorrection?: boolean,
) {
  const transporter = getTransporter();
  const from = process.env.GMAIL_FROM ?? process.env.GMAIL_USER ?? "";

  const subject = isPendingCorrection
    ? "Registration Update — Action Required"
    : "Update on your SPARK OpenMic Registration";

  const title = isPendingCorrection ? "Registration Needs Correction" : "Registration Rejected";
  const intro = isPendingCorrection
    ? "Your registration has been reviewed and requires corrections before we can proceed. Please see the comments from our team below."
    : "We're sorry to inform you that after careful review, your registration could not be approved at this time. See the final comments from our team below.";

  const callToAction = isPendingCorrection
    ? `<p>Please visit the status page to upload corrected files or information. You can check your status with your registration ID.</p>`
    : `<p>This decision is final. We thank you for your interest and hope to see you at future events.</p>`;

  await transporter.sendMail({
    from,
    to: registration.email,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.5">
        <h2>${title}</h2>
        <p>Hello ${registration.name},</p>
        <p>${intro}</p>
        <ul>
          <li><strong>Registration ID:</strong> ${registration.id}</li>
          <li><strong>Status:</strong> ${registration.paymentStatus}</li>
          <li><strong>Performance Type:</strong> ${registration.performanceType}</li>
        </ul>
        <p><strong>Admin comment:</strong> ${adminComment ?? "No comment provided."}</p>
        ${callToAction}
        <p>Regards,<br/>Team SPARK</p>
      </div>
    `,
  });
}

export async function sendReuploadReceivedEmail(registration: RegistrationMailData, eventMeta: EventMeta) {
  const transporter = getTransporter();
  const from = process.env.GMAIL_FROM ?? process.env.GMAIL_USER ?? "";

  await transporter.sendMail({
    from,
    to: registration.email,
    subject: "Reupload received — Under Review",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.5">
        <h2>Correction Received ✅</h2>
        <p>Hello ${registration.name},</p>
        <p>We received your updated submission files and moved your registration back to review.</p>
        <ul>
          <li><strong>Registration ID:</strong> ${registration.id}</li>
          <li><strong>Status:</strong> ${registration.paymentStatus}</li>
          <li><strong>Performance Type:</strong> ${registration.performanceType}</li>
          <li><strong>Event Date:</strong> ${eventMeta.eventDate}</li>
          <li><strong>Event Venue:</strong> ${eventMeta.eventVenue}</li>
        </ul>
        <p>Our team will check your updated files and notify you on the next status change.</p>
      </div>
    `,
  });
}
