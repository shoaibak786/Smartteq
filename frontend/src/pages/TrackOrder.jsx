import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
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
            transition={{
              duration: 2.8,
              repeat: Infinity,
              delay: i * 1.4,
              ease: 'easeOut',
            }}
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
      <div className="absolute left-[10%] right-[10%] top-5 h-1 -translate-y-1/2 rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: reduce ? 0 : 1.2,
            delay: 0.3,
            ease: EASE,
          }}
        />
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
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                )}

                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.15 + i * 0.12,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={[
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                    done && 'bg-brand text-white shadow-md shadow-brand/30',
                    active &&
                    'border-2 border-brand bg-white text-brand shadow-lg shadow-brand/20',
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
        >
          Track your order
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-500 md:text-lg"
        >
          Follow your order journey with secure, real-time tracking information.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 rounded-3xl bg-gradient-to-br from-brand/40 via-white to-brand-light/40 p-px shadow-2xl shadow-brand/10"
        >
          <div className="rounded-[calc(1.5rem-1px)] bg-white/90 p-6 text-left backdrop-blur-xl md:p-8">
            {loading ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <RefreshCw size={26} className="animate-spin" />
                </div>
                <h2 className="mt-5 text-lg font-bold text-slate-800">
                  Finding your order...
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Please wait while we securely retrieve your order details.
                </p>
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-light px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <PackageSearch size={18} />
                  {loading ? 'Verifying order...' : 'Find My Order'}
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
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-light px-6 py-3 font-semibold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5"
                  >
                    <RefreshCw size={17} />
                    Try again
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <ShieldCheck size={20} />
                Your order has been securely verified.
              </div>
            )}
          </div>
        </motion.div>

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
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-brand-dark to-brand px-6 py-5 text-white">
                <div className="flex items-center gap-3">
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

                <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
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

                <p className="mt-8 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                  {result.message}
                </p>

                <div className="mt-6 grid gap-3 rounded-xl border border-slate-100 p-4 text-sm sm:grid-cols-2">
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
                    <p className="font-semibold text-slate-800">
                      {formatPrice(result.total)}
                    </p>
                  </div>
                </div>

                <h3 className="mt-6 font-bold text-slate-800">
                  Ordered products
                </h3>

                <div className="mt-3 space-y-3">
                  {(result.items || []).map((product, index) => (
                    <div
                      key={`${product.id}-${index}`}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-14 w-14 rounded-lg bg-white object-contain"
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
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

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