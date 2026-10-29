import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, animate, useInView, useReducedMotion } from 'motion/react'
import {
  ShieldCheck, Cpu, Heart, Award, Clock, MapPin, Users, Briefcase,
  Phone, Banknote, Landmark, Smartphone, Wallet, AlertTriangle,
  CheckCircle2, RefreshCw, Package, Truck, Info,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

/* =====================================================================
   YAHAN APNA DATA BADLEIN
   ===================================================================== */
const PHONE = '0321 5003621'
const WHATSAPP = 'https://wa.me/923215003621'

// TODO: 'to' wali numbers placeholder hain. Live karne se pehle asli numbers likhein.
const stats = [
  { icon: Briefcase, to: 5, suffix: '+', label: 'Years in business' },
  { icon: Users, to: 500, suffix: '+', label: 'Happy clients' },
  { icon: MapPin, text: 'Lahore', label: 'Based in Pakistan' },
  { icon: Clock, text: '24/7', label: 'Online support' },
]

const values = [
  { icon: ShieldCheck, title: 'Honesty first', text: 'Honest diagnosis and fair pricing. No hidden charges, no unnecessary upsells.', tone: 'dark', wide: true },
  { icon: Cpu, title: 'Technical expertise', text: 'Our technicians have hands-on experience with IT systems and hardware.', tone: 'light' },
  { icon: Heart, title: 'Customer first', text: 'Every decision starts with one question: what is best for the customer?', tone: 'light' },
  { icon: Award, title: 'Quality assured', text: 'We use genuine, tested parts and verified quality in every job.', tone: 'brand', wide: true },
]

const payments = [
  { icon: Banknote, title: 'Cash on delivery', tag: 'Lahore only', text: 'Pay when your order arrives. Available for Lahore doorstep deliveries.' },
  { icon: Landmark, title: 'Bank transfer', tag: 'Nationwide', text: 'Direct transfer to our bank account. Order confirmed upon receipt.' },
  { icon: Smartphone, title: 'EasyPaisa', tag: 'Nationwide', text: 'Send payment via the EasyPaisa mobile wallet. Fast and convenient.' },
  { icon: Wallet, title: 'JazzCash', tag: 'Nationwide', text: 'Pay instantly through JazzCash, one of Pakistan’s most used wallets.' },
]

// TODO: Ye policies misaal hain. Apni asli policy likhein, ya agar zaroorat na ho to section hata dein.
const refundSteps = [
  'Contact us via WhatsApp or phone within 7 days of receiving your order.',
  'Share your order number, photos of the item, and the reason for return.',
  'We review and approve eligible returns within 24 hours.',
  'Ship the item back to our office (buyer covers return shipping).',
  'Refund is processed within 3–5 business days after we receive the item.',
]
const notRefundable = [
  'Items damaged due to customer misuse or physical impact.',
  'Software products, OS keys, or digital licenses once delivered.',
  'Custom-built or configured systems assembled to order.',
  'Items returned after the 7-day window.',
  'Consumable items such as thermal paste and cleaning kits.',
]
const eligibleRefund = [
  'Defective or Dead-on-Arrival (DOA) products.',
  'Item significantly different from its description.',
  'Wrong item shipped by us.',
  'Item damaged during delivery (photo proof required).',
]
const exchangeRules = [
  { icon: Package, text: 'Item must be unused, in original packaging with all accessories and box.' },
  { icon: RefreshCw, text: 'Exchange is for the same or a different product of equal or higher value.' },
  { icon: Truck, text: 'Customer covers return shipping. We cover dispatch of the replacement.' },
  { icon: Clock, text: 'Request must be made within 7 days of the delivery date.' },
]
const exchangeSteps = [
  'Contact us within 7 days of delivery to request an exchange.',
  'We confirm availability of the exchange item.',
  'Ship the original item back; we dispatch the replacement at the same time.',
  'Any price difference is charged or refunded accordingly.',
]
/* ===================================================================== */

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'

/* ---------- Animated circuit traces (echoes the Smart Teq logo) ---------- */
function CircuitBg({ className = '' }) {
  const reduce = useReducedMotion()
  const traces = [
    'M-20 140 H160 L220 200 H420 L470 150 H820',
    'M-20 300 H120 L180 360 H360 L420 300 H620 L680 360 H820',
    'M-20 470 H260 L320 410 H540 L600 470 H820',
    'M300 -20 V90 L350 140 V260 L300 310 V620',
    'M620 -20 V120 L570 170 V330 L620 380 V620',
  ]
  const nodes = [[160, 140], [420, 200], [180, 360], [620, 300], [540, 410], [350, 140], [570, 330]]

  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      fill="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {traces.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke="#38bdf8"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          initial={{ pathLength: reduce ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, delay: 0.2 + i * 0.25, ease: 'easeInOut' }}
        />
      ))}
      {nodes.map(([cx, cy], i) => (
        <motion.circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="4"
          fill="#38bdf8"
          initial={{ opacity: reduce ? 1 : 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 + i * 0.15 }}
        />
      ))}
    </svg>
  )
}

/* ---------- Count-up number ---------- */
function CountUp({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setN(to)
      return
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setN(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to, reduce])

  return <span ref={ref}>{n}{suffix}</span>
}

/* ---------- Headline line that slides up from a mask ---------- */
function Line({ children, delay = 0, className = '' }) {
  return (
    <span className="block overflow-hidden pb-1">
      <motion.span
        className={`block ${className}`}
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/* ---------- Vertical step timeline (real sequence, so numbers make sense) ---------- */
function Steps({ items }) {
  return (
    <ol className="relative space-y-5 border-l border-brand/25 pl-9">
      {items.map((step, i) => (
        <li key={step} className="relative text-sm leading-relaxed text-slate-700">
          <span className="absolute -left-[3.15rem] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white ring-4 ring-white">
            {i + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  )
}

function Heading({ title, text, light = false, className = '' }) {
  return (
    <div className={className}>
      <h2 className={`font-display text-3xl font-bold tracking-tight md:text-5xl ${light ? 'text-white' : 'text-ink'}`}>
        {title}
      </h2>
      {text && (
        <p className={`mt-4 max-w-xl leading-relaxed ${light ? 'text-blue-200' : 'text-slate-600'}`}>{text}</p>
      )}
    </div>
  )
}

/* ============================== PAGE ============================== */
export default function About() {
  const [tab, setTab] = useState('refund')
  const [imgOk, setImgOk] = useState(true)

  return (
    <main className="overflow-x-hidden bg-[#F4F7FE] font-sans text-slate-700">
      {/* ---------------- HERO ---------------- */}
      <section
        className="relative isolate px-4 pb-32 pt-20 text-white md:pt-28"
        style={{
          background:
            'radial-gradient(60% 70% at 85% 10%, rgba(30,111,217,0.55), transparent 65%), linear-gradient(180deg, #050B1F 0%, #0B2A5B 100%)',
        }}
      >
        <CircuitBg />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-blue-100 backdrop-blur"
            >
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              IT solutions & technical services, Lahore
            </motion.p>

            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">
              <Line delay={0.15}>Smarter Technology.</Line>
              <Line delay={0.3} className="text-white/50">Better Tomorrow.</Line>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-blue-100"
            >
              Smart Teq helps homes and businesses with reliable technology, honest advice and quick support.
              Technology should be accessible, affordable, and backed by people who genuinely care.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <a
                href={WHATSAPP}
                className={`inline-flex items-center gap-2 rounded-full bg-sky-400 px-7 py-3.5 font-semibold text-ink! shadow-lg shadow-sky-500/30 transition hover:bg-sky-300 ${focusRing}`}
              >
                <FaWhatsapp size={20} /> Chat on WhatsApp
              </a>
              <a
                href={`tel:${PHONE.replace(/\s/g, '')}`}
                className={`inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 font-semibold text-white! transition hover:bg-white/10 ${focusRing}`}
              >
                <Phone size={18} /> {PHONE}
              </a>
            </motion.div>
          </div>

          {/* Image frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-[2.2rem] bg-gradient-to-br from-sky-400/40 to-brand/10 blur-2xl" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 shadow-2xl">
              {imgOk ? (
                <img
                  src="/about.jpg"
                  alt="The Smart Teq team at work"
                  onError={() => setImgOk(false)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-dark to-brand">
                  <Cpu size={96} className="text-sky-300/70" strokeWidth={1} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                <MapPin size={16} /> Lahore, Pakistan
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="relative z-10 -mt-16 px-4">
        <div className="mx-auto grid max-w-5xl grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-2xl shadow-brand-dark/10 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 border-b border-r border-slate-100 p-6 last:border-r-0 md:border-b-0"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <s.icon size={22} />
              </span>
              <div>
                <p className="font-display text-3xl font-extrabold text-ink">
                  {s.to !== undefined ? <CountUp to={s.to} suffix={s.suffix} /> : s.text}
                </p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- VALUES (bento) ---------------- */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <Heading
            title="Four rules we don’t bend."
            text="How we work with every customer, on every job, big or small."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {values.map((v, i) => {
              const tones = {
                dark: 'bg-ink text-white',
                brand: 'text-white',
                light: 'border border-slate-200 bg-white text-ink',
              }
              return (
                <motion.article
                  key={v.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={v.tone === 'brand' ? { background: 'linear-gradient(135deg,#1e6fd9,#0b2a5b)' } : undefined}
                  className={`group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-3xl p-8 ${tones[v.tone]} ${v.wide ? 'lg:col-span-2' : ''}`}
                >
                  <v.icon
                    aria-hidden="true"
                    size={140}
                    strokeWidth={0.75}
                    className={`absolute -right-6 -top-6 transition duration-500 group-hover:scale-110 ${v.tone === 'light' ? 'text-brand/10' : 'text-white/10'}`}
                  />
                  <span
                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${v.tone === 'light' ? 'bg-brand text-white' : 'bg-white/15 text-white'}`}
                  >
                    <v.icon size={22} />
                  </span>
                  <div className="relative mt-10">
                    <h3 className="font-display text-2xl font-bold">{v.title}</h3>
                    <p className={`mt-2 max-w-md leading-relaxed ${v.tone === 'light' ? 'text-slate-600' : 'text-blue-100'}`}>
                      {v.text}
                    </p>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------------- PAYMENTS ---------------- */}
      <section className="relative isolate overflow-hidden bg-ink px-4 py-24 text-white">
        <CircuitBg className="opacity-40" />
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Heading
            light
            title="How to pay"
            text="Multiple payment options, so buying from us is as easy as possible."
            className="lg:sticky lg:top-28 lg:self-start"
          />
          <div className="space-y-3">
            {payments.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-sky-400/40 hover:bg-white/10 sm:flex-row sm:items-center"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
                  <p.icon size={22} />
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold">{p.title}</h3>
                  <p className="mt-0.5 text-sm text-blue-200">{p.text}</p>
                </div>
                <span className="w-fit rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {p.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- POLICIES (tabs) ---------------- */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <Heading
              title="Refunds and exchanges"
              text="We stand behind everything we sell. Here is exactly how returns work."
            />
            <div role="tablist" aria-label="Policy" className="relative flex w-fit rounded-full bg-white p-1.5 shadow-md">
              {[
                { id: 'refund', label: '7-day refund' },
                { id: 'exchange', label: 'Exchange' },
              ].map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${focusRing} ${
                    tab === t.id ? 'text-white' : 'text-slate-600 hover:text-ink'
                  }`}
                >
                  {tab === t.id && (
                    <motion.span
                      layoutId="policy-pill"
                      className="absolute inset-0 rounded-full bg-brand"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-brand-dark/5 md:p-10">
            <AnimatePresence mode="wait">
              {tab === 'refund' ? (
                <motion.div
                  key="refund"
                  role="tabpanel"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="grid gap-12 lg:grid-cols-2"
                >
                  <div>
                    <p className="mb-8 leading-relaxed text-slate-600">
                      If you’re not satisfied, you may request a full refund within{' '}
                      <b className="text-ink">7 days of receiving your order</b>, subject to the conditions on this page.
                    </p>
                    <Steps items={refundSteps} />
                    <div className="mt-8 flex gap-3 rounded-2xl bg-blue-50 p-4 text-sm text-slate-600">
                      <Info className="shrink-0 text-brand" size={18} />
                      Refunds are issued via the same payment method used at checkout. Bank transfers may take 3–5 working days to reflect.
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl bg-emerald-50 p-6">
                      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-emerald-800">
                        <CheckCircle2 size={20} /> Eligible for refund
                      </h3>
                      <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
                        {eligibleRefund.map((t) => (
                          <li key={t} className="flex gap-3">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-rose-50 p-6">
                      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-rose-700">
                        <AlertTriangle size={20} /> Not refundable
                      </h3>
                      <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
                        {notRefundable.map((t) => (
                          <li key={t} className="flex gap-3">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-400" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="exchange"
                  role="tabpanel"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="grid gap-12 lg:grid-cols-2"
                >
                  <div>
                    <p className="mb-8 leading-relaxed text-slate-600">
                      Changed your mind or need a different spec? Exchange your purchase within{' '}
                      <b className="text-ink">7 days</b>, as long as the item is in its original, unused condition.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {exchangeRules.map((r) => (
                        <div key={r.text} className="rounded-2xl bg-[#F4F7FE] p-4 text-sm leading-relaxed text-slate-600">
                          <r.icon className="mb-3 text-brand" size={20} />
                          {r.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-6 font-display text-xl font-bold text-ink">How to exchange</h3>
                    <Steps items={exchangeSteps} />
                    <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                      <b>Please note:</b> exchanges are not available for software licenses, custom-built systems, or items showing signs of use, damage, or missing components.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section
        className="relative isolate overflow-hidden px-4 py-24 text-center text-white"
        style={{ background: 'linear-gradient(135deg, #1e6fd9 0%, #0b2a5b 100%)' }}
      >
        <CircuitBg className="opacity-50" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">Have a question?</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-blue-100">
            Whether it’s about a repair, a refund, or advice on the right product, message us and we’ll reply as soon as we can.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href={WHATSAPP}
              className={`inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-ink! transition hover:bg-blue-50 ${focusRing}`}
            >
              <FaWhatsapp size={20} /> WhatsApp us
            </a>
            <a
              href={`tel:${PHONE.replace(/\s/g, '')}`}
              className={`inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white! transition hover:bg-white/10 ${focusRing}`}
            >
              <Phone size={18} /> {PHONE}
            </a>
            <Link
              to="/contact"
              className={`inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white! transition hover:bg-white/10 ${focusRing}`}
            >
              Send a message
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
