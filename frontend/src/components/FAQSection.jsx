import { useState } from "react";
import { ChevronDown, MessageCircle, Phone } from "lucide-react";
import "../styles/FAQSection.css";

// Yahan se number badlein (country code ke saath, bina + ya space ke)
const WHATSAPP_NUMBER = "923215003621";
const PHONE_DISPLAY = "0321-5003621";
const PHONE_LINK = "tel:+923215003621";

const faqItems = [
    {
        question:
            "What types of laptop and computer repairs do you offer in Lahore?",
        answer:
            "We can help with common laptop and computer issues, including hardware troubleshooting, software problems, performance issues, and component replacement. Contact our team to confirm availability for your specific repair.",
    },
    {
        question: "Where is Digital Computers located?",
        answer:
            "Please contact our team for the current store address and directions. You can add your verified business address and Google Maps link here.",
    },
    {
        question: "Do you use genuine parts for repairs?",
        answer:
            "Parts availability depends on the device and repair required. Our team can explain the available original, compatible, or refurbished options before you proceed.",
    },
    {
        question: "How long does a typical laptop repair take?",
        answer:
            "Repair time depends on the fault, device model, and availability of parts. After an initial assessment, our team can provide an estimated completion time.",
    },
    {
        question: "Can I get a free diagnosis or estimate?",
        answer:
            "Please contact our team to confirm the current diagnostic charges and estimate policy before bringing in your device.",
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState(0);

    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Hi, I have a question about your services."
    )}`;

    return (
        <section className="faq-section" id="faq">
            <div className="faq-layout">
                {/* Left: heading + help card */}
                <div className="faq-intro">
                    <span className="faq-badge">
                        <i aria-hidden="true" />
                        Help centre
                    </span>

                    <h2>
                        Frequently asked <span>questions</span>
                    </h2>

                    <p className="faq-intro-text">
                        Find answers to common questions about our services.
                    </p>

                    <div className="faq-help">
                        <h3>Still have a question?</h3>

                        <p>
                            Our team replies quickly. Ask about your device
                            and we will guide you.
                        </p>

                        <div className="faq-help-actions">
                            <a
                                className="faq-help-btn faq-help-primary"
                                href={whatsappLink}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <MessageCircle
                                    size={18}
                                    strokeWidth={2.2}
                                    aria-hidden="true"
                                />
                                Chat on WhatsApp
                            </a>

                            <a
                                className="faq-help-btn faq-help-secondary"
                                href={PHONE_LINK}
                            >
                                <Phone
                                    size={18}
                                    strokeWidth={2.2}
                                    aria-hidden="true"
                                />
                                {PHONE_DISPLAY}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right: accordion */}
                <div className="faq-list">
                    {faqItems.map((item, index) => {
                        const isOpen = openIndex === index;
                        const answerId = `faq-answer-${index}`;
                        const questionId = `faq-question-${index}`;

                        return (
                            <article
                                className={`faq-item ${isOpen ? "faq-item-open" : ""}`}
                                key={item.question}
                            >
                                <button
                                    className="faq-question"
                                    type="button"
                                    id={questionId}
                                    onClick={() =>
                                        setOpenIndex(isOpen ? null : index)
                                    }
                                    aria-expanded={isOpen}
                                    aria-controls={answerId}
                                >
                                    <span>{item.question}</span>

                                    <span className="faq-chevron-wrap">
                                        <ChevronDown
                                            className={`faq-chevron ${isOpen ? "faq-chevron-open" : ""
                                                }`}
                                            size={20}
                                            strokeWidth={2.4}
                                            aria-hidden="true"
                                        />
                                    </span>
                                </button>

                                {/* Band answer CSS (visibility) se chhupta hai,
                                    is liye inert / aria-hidden ki zaroorat nahi */}
                                <div
                                    className={`faq-answer-wrapper ${isOpen ? "answer-open" : ""
                                        }`}
                                    id={answerId}
                                    role="region"
                                    aria-labelledby={questionId}
                                >
                                    <div className="faq-answer-inner">
                                        <p className="faq-answer">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
