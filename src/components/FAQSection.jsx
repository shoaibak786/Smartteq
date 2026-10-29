
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import "../styles/FAQSection.css";

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

    return (
        <section className="faq-section" id="faq">
            <div className="faq-heading">
                <h2>Frequently Asked Questions</h2>

                <p>Find answers to common questions about our services.</p>

                <span className="faq-heading-accent" />
            </div>

            <div className="faq-list">
                {faqItems.map((item, index) => {
                    const isOpen = openIndex === index;
                    const answerId = `faq-answer-${index}`;

                    return (
                        <article
                            className={`faq-item ${isOpen ? "faq-item-open" : ""}`}
                            key={item.question}
                        >
                            <button
                                className="faq-question"
                                type="button"
                                onClick={() =>
                                    setOpenIndex(isOpen ? null : index)
                                }
                                aria-expanded={isOpen}
                                aria-controls={answerId}
                            >
                                <span>{item.question}</span>

                                <ChevronDown
                                    className={`faq-chevron ${isOpen ? "faq-chevron-open" : ""
                                        }`}
                                    size={22}
                                    strokeWidth={2.2}
                                />
                            </button>
                            <div
                                className={`faq-answer-wrapper ${isOpen ? "answer-open" : ""
                                    }`}
                                id={answerId}
                                aria-hidden={!isOpen}
                                inert={!isOpen}
                            >
                                <div className="faq-answer-inner">
                                    <p className="faq-answer">{item.answer}</p>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
