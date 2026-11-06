const {ImapFlow} = require("imapflow");
const {simpleParser} = require("mailparser");
const {EMAIL_SUBJECT_HAS} = require("./settings");

function isConfigured() {
  return Boolean(process.env.GMAIL_ADDRESS && process.env.GMAIL_APP_PASSWORD);
}

async function readNewestEmails(client, count) {
  await client.mailboxOpen("INBOX");
  let uids = await client.search({subject: EMAIL_SUBJECT_HAS}, {uid: true});
  if (!uids) {
    uids = [];
  }
  const newestUids = uids.slice(-count);
  const emails = [];
  for (const uid of newestUids) {
    const message = await client.fetchOne(String(uid), {source: true}, {uid: true});
    const mail = await simpleParser(message.source);
    let receivedAt = null;
    if (mail.date) {
      receivedAt = mail.date.toISOString();
    }
    emails.push({
      id: mail.messageId ?? `gmail-${uid}`,
      subject: mail.subject ?? "(no subject)",
      sender: mail.from?.text ?? null,
      receivedAt: receivedAt,
      body: mail.text ?? "",
    });
  }
  return emails;
}

async function getRecentEmails(count) {
  if (!isConfigured()) {
    throw new Error("Missing GMAIL_ADDRESS or GMAIL_APP_PASSWORD in .env");
  }
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    logger: false,
  });
  await client.connect();
  let emails = [];
  try {
    emails = await readNewestEmails(client, count);
  } catch (error) {
    await client.logout();
    throw error;
  }
  await client.logout();
  return emails;
}

module.exports = {isConfigured, getRecentEmails};
