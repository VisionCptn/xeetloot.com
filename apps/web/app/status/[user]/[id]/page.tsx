import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { AutoResolveShell } from "@/components/AutoResolveShell";
import enMessages from "@/messages/en.json";

const ID_RE = /^\d{1,40}$/;
const USER_RE = /^[A-Za-z0-9_]{1,15}$/;

export default async function StatusPage({ params }: { params: Promise<{ user: string; id: string }> }) {
  const { user, id } = await params;
  if (!USER_RE.test(user) || !ID_RE.test(id)) notFound();

  const tweetUrl = `https://x.com/${user}/status/${id}`;

  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <AutoResolveShell tweetUrl={tweetUrl} />
    </NextIntlClientProvider>
  );
}
