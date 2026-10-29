import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  AlertCircle,
  Boxes,
  Check,
  ClipboardCheck,
  Hash,
  Headphones,
  Loader2,
  Mail,
  MapPin,
  PackageCheck,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from 'lucide-react'

/* ---------- Static data ---------- */

const STEPS = [
  { label: 'Placed', icon: ClipboardCheck },
  { label: 'Processing', icon: Boxes },
  { label: 'Shipped', icon: Truck },
  { label: 'Out for delivery', icon: MapPin },
  { label: 'Delivered', icon: PackageCheck },
]

const TRUST = [
  { icon: ShieldCheck, text: 'Secure lookup' },
  { icon: Zap, text: 'Real-time status' },
  { icon: Headphones, text: 'Support if you need it' },
]

const EASE = [0.22, 1, 0.36, 1]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

/* ---------- Small pieces ---------- */

function Field({ id, label, hint, icon: Icon, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-semibold text-slate-800">
        {label}
        <span className="text-xs font-normal text-slate-400">{hint}</span>
      </label>
      <div className="group relative mt-2">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand"
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
        />
      </div>
    </div>
  )
}

function RadarIcon({ reduce }) {
  return (
    <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
      {!reduce &&
        [0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-2xl border border-brand/40"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 2.8, repeat: Infinity, delay: i * 1.4, ease: 'easeOut' }}
          />
        ))}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-light text-white shadow-xl shadow-brand/30">
        <PackageSearch size={28} />
      </div>
    </div>
  )
}

function Stepper({ current, reduce }) {
  const pct = (current / (STEPS.length - 1)) * 100

  return (
    <div className="relative mt-8">
      {/* Track line sits between the first and last node centres */}
      <div className="absolute left-[10%] right-[10%] top-5 h-1 -translate-y-1/2 rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduce ? 0 : 1.2, delay: 0.3, ease: EASE }}
        />
      </div>

      <ol className="relative grid grid-cols-5">
        {STEPS.map((step, i) => {
          const done = i < current
          const active = i === current
          const Icon = step.icon

          return (
            <li key={step.label} className="flex flex-col items-center text-center">
              <div className="relative">
                {active && !reduce && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-brand/30"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.12, type: 'spring', stiffness: 300, damping: 20 }}
                  className={[
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                    done && 'bg-brand text-white shadow-md shadow-brand/30',
                    active && 'border-2 border-brand bg-white text-brand shadow-lg shadow-brand/20',
                    !done && !active && 'bg-slate-100 text-slate-400',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {done ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                </motion.div>
              </div>
              <span
                className={`mt-3 px-0.5 text-[11px] leading-tight sm:text-xs ${
                  active ? 'font-semibold text-brand-dark' : done ? 'font-medium text-slate-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------- Page ---------- */

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const reduce = useReducedMotion()
  const resultRef = useRef(null)

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    }
  }, [result, reduce])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!orderId.trim() && !email.trim()) {
      setError('Enter your order ID or the email you used at checkout.')
      return
    }

    setLoading(true)
    try {
      // TODO: yahan apni backend API ka URL lagayen
      // const res = await fetch(`/api/track?orderId=${orderId}&email=${email}`)
      // const data = await res.json()

      // Demo ke liye nakli jawab (backend lagne par hata dein)
      // `step` 0-4 hota hai: 0 Placed, 1 Processing, 2 Shipped, 3 Out for delivery, 4 Delivered
      await new Promise((r) => setTimeout(r, 800))
      setResult({
        id: orderId || 'N/A',
        status: 'In Progress',
        step: 1,
        message: 'Your order is being processed. We will update you soon.',
      })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative isolate min-h-[80vh] overflow-hidden bg-gradient-to-b from-white via-blue-50/60 to-blue-100/60 px-4 py-16 md:py-24">
      {/* Grid, faded out towards the edges */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(30,111,217,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,111,217,0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 100%)',
        }}
      />

      {/* Soft drifting glows */}
      <motion.div
        aria-hidden
        className="absolute -left-24 top-10 -z-10 h-80 w-80 rounded-full bg-brand/20 blur-3xl"
        animate={reduce ? undefined : { x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-24 top-64 -z-10 h-96 w-96 rounded-full bg-brand-light/20 blur-3xl"
        animate={reduce ? undefined : { x: [0, -50, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-xl text-center"
      >
        {/* Hero */}
        <motion.div variants={item}>
          <RadarIcon reduce={reduce} />
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-8 bg-gradient-to-r from-brand-dark via-brand to-brand-light bg-clip-text pb-1 text-4xl font-extrabold tracking-tight text-transparent md:text-6xl"
        >
          Track your order
        </motion.h1>

        <motion.p variants={item} className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-500 md:text-lg">
          Enter your order ID or the email used at checkout to see where your order is right now.
        </motion.p>

        {/* Form card with gradient border */}
        <motion.div
          variants={item}
          className="mt-10 rounded-3xl bg-gradient-to-br from-brand/40 via-white to-brand-light/40 p-px shadow-2xl shadow-brand/10"
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-[calc(1.5rem-1px)] bg-white/90 p-6 text-left backdrop-blur-xl md:p-8"
          >
            <Field
              id="order-id"
              label="Order ID"
              hint="Optional if you add an email"
              icon={Hash}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 65b7c8d9e0f1a2b3c4d5e6f7"
            />

            <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              or
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <Field
              id="email"
              label="Email"
              hint="Optional if you add an order ID"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />

            <AnimatePresence initial={false}>
              {error && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <span className="mt-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    <AlertCircle size={18} className="mt-px shrink-0" />
                    {error}
                  </span>
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={reduce || loading ? undefined : { scale: 1.015 }}
              whileTap={reduce || loading ? undefined : { scale: 0.98 }}
              className="relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand to-brand-light py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition-shadow hover:shadow-xl hover:shadow-brand/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {!reduce && !loading && (
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-150%' }}
                  animate={{ x: '450%' }}
                  transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Track order
                  </>
                )}
              </span>
            </motion.button>
          </form>
        </motion.div>

        {/* Trust row */}
        <motion.ul
          variants={item}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500"
        >
          {TRUST.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon size={16} className="text-brand" />
              {text}
            </li>
          ))}
        </motion.ul>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.section
              ref={resultRef}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              aria-live="polite"
              className="mt-10 overflow-hidden rounded-3xl border border-brand/15 bg-white text-left shadow-2xl shadow-brand/10"
            >
              {/* Header strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-brand-dark to-brand px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <PackageSearch size={20} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold leading-tight">Order status</h2>
                    <p className="break-all text-xs text-white/70">Order ID: {result.id}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    {!reduce && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  {result.status}
                </span>
              </div>

              {/* Body */}
              <div className="px-4 pb-7 pt-2 sm:px-6">
                <Stepper current={result.step ?? 0} reduce={reduce} />

                <p className="mt-8 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                  {result.message}
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Bottom button */}
        <motion.div variants={item} className="mt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3 font-semibold !text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-light hover:shadow-xl hover:shadow-brand/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
          >
            <ShoppingBag size={18} />
            Continue shopping
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
