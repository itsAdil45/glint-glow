import { WhatsAppIcon } from "@/components/icons/social-icons";

// Matches the phone number already used in the top bar and footer.
// wa.me requires the full international number with no "+" or spaces.
const WHATSAPP_NUMBER = "923047629941";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 lg:bottom-5"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
