import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from 'motion/react'
import {
  AlertCircle,
  Boxes,
  Check,
  ClipboardCheck,
  Headphones,
  MapPin,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from 'lucide-react'

import { apiUrl } from '../config/api'

const STEPS = [
  { label: 'Placed', icon: ClipboardCheck },
  { label: 'Processing', icon: Boxes },
  { label: 'Shipped', icon: Truck },
  { label: 'Out for delivery', icon: MapPin },
  { label: 'Delivered', icon: PackageCheck },
]

const TRUST = [
  { icon: ShieldCheck, text: 'Secure tracking' },
  { icon: Zap, text: 'Live order status' },
  { icon: Headphones, text: 'Support if you need it' },
]

const FLOATERS = [
  { icon: Boxes, cls: 'left-[7%] top-32', size: 30, delay: 0 },
  { icon: Truck, cls: 'right-[8%] top-44', size: 34, delay: 1.2 },
  { icon: PackageCheck, cls: 'left-[12%] top-[26rem]', size: 28, delay: 2.4 },
  { icon: MapPin, cls: 'right-[13%] top-[30rem]', size: 28, delay: 0.6 },
]

const EASE = [0.22, 1, 0.36, 1]

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: EASE },
  },
}

const formatPrice = (price) =>
  `PKR ${Number(price || 0).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const getStatusInfo = (status) => {
  const normalized = String(status || 'Pending').toLowerCase().trim()

  if (normalized === 'processing') {
    return { label: 'Processing', step: 1 }
  }

  if (normalized === 'shipped') {
    return { label: 'Shipped', step: 2 }
  }

  if (normalized === 'out for delivery') {
    return { label: 'Out for delivery', step: 3 }
  }

  if (normalized === 'delivered') {
    return { label: 'Delivered', step: 4 }
  }

  if (normalized === 'cancelled') {
    return { label: 'Cancelled', step: 0 }
  }

  return { label: 'Pending', step: 0 }
}

/* ---------- visual-only helpers (no logic) ---------- */

function SpotlightCard({ children, reduce, className = '' }) {
  const x = useMotionValue(-300)
  const y = useMotionValue(-300)
  const glow = useMotionTemplate`radial-gradient(380px circle at ${x}px ${y}px, rgba(30,111,217,0.16), transparent 65%)`

  const onMove = (e) => {
    if (reduce) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)
  }

  return (
    <div onMouseMove={onMove} className={`group relative ${className}`}>
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glow }}
        />
      )}
      {children}
    </div>
  )
}

function RadarIcon({ reduce }) {
  return (
    <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
      {!reduce &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-3xl border border-brand/40"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              delay: i * 1.2,
              ease: 'easeOut',
            }}
          />
        ))}

      <motion.div
        animate={reduce ? undefined : { y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-brand-light text-white shadow-2xl shadow-brand/40 ring-4 ring-white/70"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/30 to-transparent"
        />
        <PackageSearch size={34} className="relative" />
      </motion.div>
    </div>
  )
}

function Stepper({ current, reduce }) {
  const pct = (current / (STEPS.length - 1)) * 100

  return (
    <div className="relative mt-8">
      <div className="absolute left-[10%] right-[10%] top-5 h-1.5 -translate-y-1/2 rounded-full bg-slate-100">
        <motion.div
          className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-brand to-brand-light shadow-[0_0_14px_rgba(30,111,217,0.55)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: reduce ? 0 : 1.2,
            delay: 0.3,
            ease: EASE,
          }}
        >
          {!reduce && pct > 0 && (
            <motion.span
              aria-hidden
              className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '600%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1.2,
                ease: 'easeInOut',
                delay: 1.5,
              }}
            />
          )}
        </motion.div>
      </div>

      <ol className="relative grid grid-cols-5">
        {STEPS.map((step, i) => {
          const done = i < current
          const active = i === current
          const Icon = step.icon

          return (
            <li
              key={step.label}
              className="flex flex-col items-center text-center"
            >
              <div className="relative">
                {active && !reduce && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-brand/30"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                )}

                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: active ? 1.12 : 1, opacity: 1 }}
                  transition={{
                    delay: 0.15 + i * 0.12,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={[
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                    done && 'bg-gradient-to-br from-brand to-brand-light text-white shadow-md shadow-brand/30',
                    active &&
                    'border-2 border-brand bg-white text-brand shadow-lg shadow-brand/30',
                    !done && !active && 'bg-slate-100 text-slate-400',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {done ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <Icon size={18} />
                  )}
                </motion.div>
              </div>

              <span
                className={`mt-3 px-0.5 text-[11px] leading-tight sm:text-xs ${active
                  ? 'font-semibold text-brand-dark'
                  : done
                    ? 'font-medium text-slate-600'
                    : 'text-slate-400'
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

export default function TrackOrder() {
  const { token } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [lookupOrderId, setLookupOrderId] = useState('')
  const [lookupPhone, setLookupPhone] = useState('')

  const reduce = useReducedMotion()
  const resultRef = useRef(null)
  const handleLookup = async (event) => {
    event.preventDefault()

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(
        apiUrl('/api/orders/lookup'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            orderId: lookupOrderId,
            phone: lookupPhone,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success || !data.order) {
        throw new Error(data.message || 'Unable to find your order.')
      }

      const statusInfo = getStatusInfo(data.order.status)

      setResult({
        ...data.order,
        status: statusInfo.label,
        step: statusInfo.step,
        message:
          statusInfo.label === 'Delivered'
            ? 'Your order has been delivered. Thank you for shopping with Smartteq!'
            : statusInfo.label === 'Cancelled'
              ? 'This order has been cancelled. Please contact support if you need assistance.'
              : `Your order is currently ${statusInfo.label.toLowerCase()}. Check back for future updates.`,
      })

    } catch (err) {
      setError(
        err.message || 'Unable to verify your order. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }
  const fetchOrder = async (signal) => {
    setLoading(true)
    setError('')
    setResult(null)

    if (!token) {
      setError(
        'Tracking link is missing. Please open the secure tracking link received after placing your order.'
      )
      setLoading(false)
      return
    }

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      setError('This tracking link is invalid. Please check your tracking link.')
      setLoading(false)
      return
    }

    // if (!API_URL) {
    //   setError('Backend API configuration is missing. Please try again later.')
    //   setLoading(false)
    //   return
    // }

    try {
      const response = await fetch(
        apiUrl(`/api/orders/track/${encodeURIComponent(token)}`),
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal,
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success || !data.order) {
        throw new Error(
          data.message || 'Unable to find your order. Please check your tracking link.'
        )
      }

      const order = data.order
      const statusInfo = getStatusInfo(order.status)

      setResult({
        ...order,
        status: statusInfo.label,
        step: statusInfo.step,
        message:
          statusInfo.label === 'Delivered'
            ? 'Your order has been delivered. Thank you for shopping with Smartteq!'
            : statusInfo.label === 'Cancelled'
              ? 'This order has been cancelled. Please contact support if you need assistance.'
              : `Your order is currently ${statusInfo.label.toLowerCase()}. Check back for future updates.`,
      })
    } catch (err) {
      if (err.name === 'AbortError') return

      setError(
        err.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please check your internet connection and try again.'
          : err.message || 'Unable to track your order. Please try again.'
      )
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }
  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('')
      setResult(null)
      return
    }

    const controller = new AbortController()
    fetchOrder(controller.signal)

    return () => controller.abort()
  }, [token])

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'center',
      })
    }
  }, [result, reduce])

  const handleRetry = () => {
    const controller = new AbortController()
    fetchOrder(controller.signal)
  }

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3.5 outline-none transition duration-300 placeholder:text-slate-400 hover:border-brand/40 focus:border-brand focus:bg-white focus:shadow-lg focus:shadow-brand/10 focus:ring-4 focus:ring-brand/15'

  return (
    <main className="relative isolate min-h-[80vh] overflow-hidden bg-gradient-to-b from-white via-blue-50/60 to-blue-100/60 px-4 py-16 md:py-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(30,111,217,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,111,217,0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 100%)',
        }}
      />

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

      {/* floating logistics icons (desktop only, decorative) */}
      {FLOATERS.map(({ icon: Icon, cls, size, delay }) => (
        <motion.div
          key={cls}
          aria-hidden
          className={`pointer-events-none absolute -z-10 hidden rounded-2xl border border-brand/15 bg-white/60 p-3 text-brand/60 shadow-lg shadow-brand/10 backdrop-blur lg:block ${cls}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            reduce
              ? { opacity: 1, scale: 1 }
              : { opacity: 1, scale: 1, y: [0, -14, 0], rotate: [0, 4, -4, 0] }
          }
          transition={{
            opacity: { duration: 0.8, delay: 0.6 },
            scale: { duration: 0.8, delay: 0.6 },
            y: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay },
            rotate: { duration: 9, repeat: Infinity, ease: 'easeInOut', delay },
          }}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-xl text-center"
      >
        <motion.div variants={item}>
          <RadarIcon reduce={reduce} />
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-8 bg-gradient-to-r from-brand-dark via-brand to-brand-light bg-clip-text pb-1 text-4xl font-extrabold tracking-tight text-transparent md:text-6xl"
          style={{ backgroundSize: '200% auto' }}
        >
          <motion.span
            className="inline-block bg-gradient-to-r from-brand-dark via-brand to-brand-light bg-clip-text text-transparent"
            style={{ backgroundSize: '200% auto' }}
            animate={
              reduce
                ? undefined
                : { backgroundPosition: ['0% center', '200% center'] }
            }
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            Track your order
          </motion.span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-500 md:text-lg"
        >
          Follow your order journey with secure, real-time tracking information.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 rounded-3xl bg-gradient-to-br from-brand/40 via-white to-brand-light/40 p-px shadow-2xl shadow-brand/15 transition-shadow duration-500 hover:shadow-brand/25"
        >
          <SpotlightCard
            reduce={reduce}
            className="rounded-[calc(1.5rem-1px)] bg-white/90 p-6 text-left backdrop-blur-xl md:p-8"
          >
            {loading ? (
              <div className="py-8 text-center" role="status">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  {!reduce && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-2xl border border-brand/40"
                      animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                  <RefreshCw size={26} className="animate-spin" />
                </div>
                <h2 className="mt-5 text-lg font-bold text-slate-800">
                  Finding your order...
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Please wait while we securely retrieve your order details.
                </p>
                <div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
                  {!reduce && (
                    <motion.div
                      className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand to-brand-light"
                      animate={{ x: ['-100%', '300%'] }}
                      transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </div>
              </div>


            ) : !token && !result ? (
              <form onSubmit={handleLookup} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Order ID
                  </label>
                  <input
                    type="text"
                    value={lookupOrderId}
                    onChange={(event) => setLookupOrderId(event.target.value)}
                    placeholder="e.g. STQ-A1B2C3D4"
                    required
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Registered phone number
                  </label>
                  <input
                    type="tel"
                    value={lookupPhone}
                    onChange={(event) => setLookupPhone(event.target.value)}
                    placeholder="Enter your checkout phone number"
                    required
                    className={inputCls}
                  />
                </div>

                {error && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, x: -8 }}
                    animate={
                      reduce
                        ? { opacity: 1 }
                        : { opacity: 1, x: [0, -6, 6, -4, 4, 0] }
                    }
                    transition={{ duration: 0.5 }}
                    className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand to-brand-light px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/30 blur-sm transition-all duration-700 group-hover/btn:left-[130%]"
                  />
                  <PackageSearch size={18} className="relative" />
                  <span className="relative">
                    {loading ? 'Verifying order...' : 'Find My Order'}
                  </span>
                </button>
              </form>

            ) : error ? (
              <div className="py-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <AlertCircle size={27} />
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-800">
                  Unable to track your order
                </h2>

                <p
                  role="alert"
                  className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500"
                >
                  {error}
                </p>

                {token && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-light px-6 py-3 font-semibold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
                  >
                    <RefreshCw size={17} />
                    Try again
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <motion.span
                  initial={reduce ? false : { scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                  className="flex"
                >
                  <ShieldCheck size={20} />
                </motion.span>
                Your order has been securely verified.
              </div>
            )}
          </SpotlightCard>
        </motion.div>

        <motion.ul
          variants={item}
          className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-sm text-slate-600"
        >
          {TRUST.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2 rounded-full border border-brand/10 bg-white/70 px-3.5 py-1.5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
            >
              <Icon size={16} className="text-brand" />
              {text}
            </li>
          ))}
        </motion.ul>

        <AnimatePresence>
          {result && (
            <motion.section
              ref={resultRef}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              aria-live="polite"
              className="mt-10 overflow-hidden rounded-3xl border border-brand/15 bg-white text-left shadow-2xl shadow-brand/15"
            >
              <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden bg-gradient-to-r from-brand-dark to-brand px-6 py-5 text-white">
                {!reduce && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    initial={{ left: '-30%' }}
                    animate={{ left: '130%' }}
                    transition={{
                      duration: 2.2,
                      delay: 0.6,
                      repeat: Infinity,
                      repeatDelay: 3.5,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                <div className="relative flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <PackageSearch size={20} />
                  </span>

                  <div>
                    <h2 className="text-lg font-bold leading-tight">
                      Order status
                    </h2>
                    <p className="break-all text-xs text-white/70">
                      Order ID: {result.orderId}
                    </p>
                  </div>
                </div>

                <span className="relative inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    {!reduce && result.status !== 'Cancelled' && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  {result.status}
                </span>
              </div>

              <div className="px-4 pb-7 pt-2 sm:px-6">
                {result.status !== 'Cancelled' ? (
                  <Stepper current={result.step ?? 0} reduce={reduce} />
                ) : (
                  <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    This order has been cancelled.
                  </p>
                )}

                <p className="mt-8 rounded-xl border-l-4 border-brand bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                  {result.message}
                </p>

                <div className="mt-6 grid gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-white to-blue-50/40 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-slate-400">Customer</span>
                    <p className="font-semibold text-slate-800">
                      {result.customer?.fullName || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Order date</span>
                    <p className="font-semibold text-slate-800">
                      {result.orderDate
                        ? new Date(result.orderDate).toLocaleDateString('en-PK', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                        : '—'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400">Payment</span>
                    <p className="font-semibold text-slate-800">
                      {result.paymentMethod || '—'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400">Order total</span>
                    <p className="bg-gradient-to-r from-brand-dark to-brand bg-clip-text font-bold text-transparent">
                      {formatPrice(result.total)}
                    </p>
                  </div>
                </div>

                <h3 className="mt-6 font-bold text-slate-800">
                  Ordered products
                </h3>

                <div className="mt-3 space-y-3">
                  {(result.items || []).map((product, index) => (
                    <motion.div
                      key={`${product.id}-${index}`}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5, ease: EASE }}
                      className="flex items-center gap-3 rounded-xl border border-transparent bg-slate-50 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white hover:shadow-lg hover:shadow-brand/10"
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-14 w-14 rounded-lg bg-white object-contain shadow-sm"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Quantity: {product.quantity}
                        </p>
                      </div>

                      <strong className="text-sm text-slate-800">
                        {formatPrice(
                          Number(product.price || 0) *
                          Number(product.quantity || 0)
                        )}
                      </strong>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <motion.div variants={item} className="mt-12">
          <Link
            to="/"
            className="group/cta relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-brand px-8 py-3 font-semibold !text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-light hover:shadow-xl hover:shadow-brand/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/30 blur-sm transition-all duration-700 group-hover/cta:left-[130%]"
            />
            <ShoppingBag size={18} className="relative transition-transform duration-300 group-hover/cta:-rotate-12 group-hover/cta:scale-110" />
            <span className="relative">Continue shopping</span>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
