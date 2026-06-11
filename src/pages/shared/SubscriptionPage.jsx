import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, Crown, Sparkles, X, Loader2 } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'bkash', label: 'bKash', icon: '💳' },
  { id: 'nagad', label: 'Nagad', icon: '📱' },
  { id: 'card', label: 'Card', icon: '💳' },
  { id: 'bank', label: 'Bank', icon: '🏦' },
];

const FREE_FEATURES = [
  'Browse & Book Services',
  'NID-Verified Providers',
  'Escrow Payment Protection',
  'Service Request Tracking',
  'Standard Customer Support',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Priyo Workshop — Save favorite providers',
  'Instant Booking — Auto-assign nearest pro',
  'Emergency Service Request — Priority dispatch',
  'Priority Customer Support',
];

export default function SubscriptionPage() {
  const { user, isProvider, isCustomer } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    api.getSubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, []);

  const isProActive = subscription?.is_active;

  const handleSubscribeClick = () => {
    setShowPayment(true);
    setPaymentMethod('bkash');
    setTransactionId('');
  };

  const handlePayAndSubscribe = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter your MFS transaction ID');
      return;
    }
    setSubscribing(true);
    try {
      const res = await api.subscribePriyo('priyo_basic', transactionId.trim());
      setSubscription(res);
      setShowPayment(false);
      toast.success('Subscribed to Priyo Pro!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    setSubscribing(true);
    try {
      await api.unsubscribePriyo();
      setSubscription(null);
      toast.success('Unsubscribed successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div>
      <div className="dash-header">
        <h1>Subscription Plans</h1>
        <p>
          {isProvider
            ? 'Choose a plan to start receiving more service requests'
            : 'Unlock premium features for your service needs'}
        </p>
      </div>

      {!loading && isProActive && (
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: 16, padding: '16px 24px', marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: '#fff', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Crown size={24} />
            <div>
              <strong>Priyo Pro Active</strong>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                {subscription.plan_name === 'priyo_basic' ? 'Basic Plan' : 'Premium Plan'}
                {subscription.expires_at && ` · Expires ${new Date(subscription.expires_at).toLocaleDateString()}`}
              </div>
            </div>
          </div>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
            onClick={handleUnsubscribe} disabled={subscribing}>
            {subscribing ? '...' : 'Cancel Subscription'}
          </button>
        </div>
      )}

      {!loading && subscription && !isProActive && (
        <div style={{
          background: '#fef2f2', borderRadius: 16, padding: '16px 24px', marginBottom: 32,
          display: 'flex', alignItems: 'center', gap: 12,
          color: '#991b1b', border: '1px solid #fecaca',
        }}>
          <X size={20} />
          <div>
            <strong>Subscription Expired</strong>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              Your Priyo subscription expired on {new Date(subscription.expires_at).toLocaleDateString()}.
              Subscribe again to continue enjoying Pro benefits.
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 32, alignItems: 'start',
      }}>
        <div className="card" style={{
          padding: 40, borderRadius: 20, border: '1px solid var(--color-border)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Free
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 24 }}>
            ৳0
            <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--color-text-secondary)' }}>/month</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {FREE_FEATURES.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-text-primary)' }}>
                <Check size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
          {!isProActive && (
            <div style={{
              padding: '12px 16px', background: '#f1f5f9', borderRadius: 10,
              textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)',
            }}>
              Currently Active
            </div>
          )}
        </div>

        <div className="card" style={{
          padding: 40, borderRadius: 20,
          border: '2px solid #f59e0b',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15)',
        }}>
          <div style={{
            position: 'absolute', top: 16, right: 16, zIndex: 1,
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em', padding: '4px 12px', borderRadius: 100,
            }}>Popular</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Crown size={18} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Priyo Pro
            </span>
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 24 }}>
            ৳500
            <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--color-text-secondary)' }}>/month</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {PRO_FEATURES.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-text-primary)' }}>
                {i === 0 ? (
                  <Check size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                ) : (
                  <Sparkles size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                )}
                {f}
              </li>
            ))}
          </ul>

          {isProActive ? (
            <button className="btn btn-lg" style={{ width: '100%', background: '#f1f5f9', color: 'var(--color-text-secondary)', cursor: 'default', border: 'none' }} disabled>
              <Crown size={16} /> Active Plan
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
              onClick={handleSubscribeClick} disabled={subscribing}>
              {subscribing ? 'Subscribing...' : <><Sparkles size={16} /> Subscribe to Priyo Pro</>}
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 40, padding: 32, borderRadius: 20 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Plan Comparison</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '12px 16px' }}>Free</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#f59e0b' }}>Priyo Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Browse & Book Services', free: true, pro: true },
                { name: 'NID-Verified Providers', free: true, pro: true },
                { name: 'Escrow Payment Protection', free: true, pro: true },
                { name: 'Service Request Tracking', free: true, pro: true },
                { name: 'Standard Customer Support', free: true, pro: true },
                { name: 'Priyo Workshop', free: false, pro: true },
                { name: 'Instant Booking', free: false, pro: true },
                { name: 'Emergency Service Request', free: false, pro: true },
                { name: 'Priority Support', free: false, pro: true },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{row.name}</td>
                  <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                    {row.free ? <Check size={16} style={{ color: '#22c55e' }} /> : <X size={16} style={{ color: '#d1d5db' }} />}
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                    <Check size={16} style={{ color: '#22c55e' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPayment && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', padding: 20,
        }} onClick={() => !subscribing && setShowPayment(false)}>
          <div className="card" style={{
            maxWidth: 480, width: '100%', padding: 32, borderRadius: 20,
            position: 'relative',
          }} onClick={e => e.stopPropagation()}>
            <button style={{
              position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 20,
            }} onClick={() => setShowPayment(false)} disabled={subscribing}>
              <X size={20} />
            </button>

            <h3 style={{ marginBottom: 8, fontWeight: 700 }}>Subscribe to Priyo Pro</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              Pay ৳500/month to unlock all Pro features
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: 'block' }}>
                Select Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {PAYMENT_METHODS.map(m => (
                  <button key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      padding: '12px 8px', borderRadius: 10, border: paymentMethod === m.id ? '2px solid #f59e0b' : '1px solid var(--color-border)',
                      background: paymentMethod === m.id ? '#fefce8' : 'transparent',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{m.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)' }}>{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                MFS Transaction ID
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={`Enter ${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || 'MFS'} transaction ID`}
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 14 }}
                disabled={subscribing}
              />
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>
                Send ৳500 to the MeramotHub {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || 'MFS'} number and enter the transaction ID above
              </p>
            </div>

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
              onClick={handlePayAndSubscribe} disabled={subscribing}>
              {subscribing ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : 'Pay & Subscribe'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
