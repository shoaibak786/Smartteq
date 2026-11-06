import {
  Truck,
  ShieldCheck,
  Headphones,
  Award,
} from "lucide-react";

import "../styles/WhyChooseUs.css";

const services = [
  {
    id: 1,
    title: "Free Shipping",
    description:
      "On all orders over PKR 5,000 — delivered to your door.",
    icon: Truck,
    color: "blue",
  },
  {
    id: 2,
    title: "Warranty Protection",
    description:
      "Up to 3 years of comprehensive coverage on every purchase.",
    icon: ShieldCheck,
    color: "cyan",
  },
  {
    id: 3,
    title: "24/7 Support",
    description:
      "Expert technical assistance whenever you need it most.",
    icon: Headphones,
    color: "indigo",
  },
  {
    id: 4,
    title: "Best Price Guarantee",
    description:
      "We match any verified competitor price. No questions asked.",
    icon: Award,
    color: "violet",
  },
];

// Mouse ke peeche chalne wali roshni (sirf design, mouse devices par)
const handleSpotlight = (event) => {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();

  card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  card.style.setProperty("--my", `${event.clientY - rect.top}px`);
};

export default function WhyChooseUs() {
  return (
    <section className="why-choose-section" id="why-choose-us">
      <span className="why-orb why-orb-one" aria-hidden="true" />
      <span className="why-orb why-orb-two" aria-hidden="true" />

      <div className="why-choose-heading">
        <span className="why-choose-eyebrow">
          <i aria-hidden="true" />
          Why choose us
        </span>

        <h2>
          Premium Services <span>Zero Compromise</span>
        </h2>

        <p>
          <i aria-hidden="true" />
          Everything you need for a top-tier PC build experience
          <i aria-hidden="true" />
        </p>
      </div>

      <div className="why-choose-grid">
        {services.map((service) => {
          const ServiceIcon = service.icon;

          return (
            <article
              className={`service-card service-${service.color}`}
              key={service.id}
              onMouseMove={handleSpotlight}
            >
              <div className="service-icon">
                <ServiceIcon
                  size={30}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>

              <h3>{service.title}</h3>

              <p>{service.description}</p>

              <span className="service-accent" aria-hidden="true" />
            </article>
          );
        })}
      </div>
    </section>
  );
}
