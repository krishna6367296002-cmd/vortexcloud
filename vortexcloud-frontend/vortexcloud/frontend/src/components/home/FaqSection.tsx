import { Plus } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";

const FAQS = [
  {
    q: "How is my booking confirmed?",
    a: "Pay via the UPI QR, enter your 12-digit UTR and send the payment screenshot to @Hunter_38 on Telegram. Once the owner verifies it, your booking turns CONFIRMED in My Bookings and the stream unlocks.",
  },
  {
    q: "How do the combo passes work?",
    a: "Night Owl: 3 hours for ₹299, starting at 8 PM or 9 PM. Marathon: 5 hours for ₹499 on any day. Ultimate: 24 hours straight for ₹999 from any start hour, and you can live stream your gameplay on YouTube. Pick the pass on any game's booking page, then choose your start time.",
  },
  {
    q: "How do I use a coupon code?",
    a: "Enter the code (for example VORTEX20) in the Coupon Code field inside the UPI checkout and tap Apply. The discount is taken off before you pay.",
  },
  {
    q: "Where do I find the UTR number?",
    a: "Open the payment details in GPay / PhonePe / Paytm. You will see a 12-digit number labelled 'UPI transaction ID' or 'UTR' — that is what you enter.",
  },
  {
    q: "Do I need to download anything?",
    a: "No. You can play straight from your browser, or connect through Parsec / Moonlight for an even smoother 120Hz experience.",
  },
  {
    q: "What internet speed do I need?",
    a: "A stable connection of 15 Mbps or more is recommended. 5GHz Wi-Fi or a good mobile data connection works best.",
  },
  {
    q: "Can I use a controller?",
    a: "Yes — DualSense and Xbox controllers are fully supported, and the keyboard is mapped too. Just connect it before you launch your session.",
  },
  {
    q: "Payment done but not confirmed yet?",
    a: "Send your UTR and the payment screenshot to @Hunter_38 on Telegram and support will verify it right away.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-10">
        <SectionHeading eyebrow="Questions" eyebrowClass="text-amber-400" title="FAQ" />
      </div>
      <div className="space-y-3">
        {FAQS.map((item, i) => (
          <Reveal key={item.q} delay={i * 0.05}>
            <details
              className="group rounded-xl border border-[#1e263d] bg-[#0f131f]/65 p-5 backdrop-blur-xl"
              data-testid={`faq-item-${i + 1}`}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus className="h-4 w-4 shrink-0 text-cyan-400 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">{item.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
