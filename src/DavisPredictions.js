import React, { useState, useEffect, useCallback } from "react";

// ============================================================
// DATA
// ============================================================
const MARKETS = [
  {
    id: "village-farms",
    title: "Village Farms Davis",
    subtitle: "Measure J/R/D Vote",
    question: "Will Davis voters approve the Village Farms development?",
    description: "1,800 new homes on 497 acres in North Davis at Pole Line & Covell. Includes 100 affordable housing units, parks, greenbelts, educational farm, and fire station. Requires voter approval under Measure J/R/D.",
    voteDate: "June 2, 2026",
    status: "Active",
    yesPrice: 42,
    volume: 18420,
    totalPool: 47250,
    tags: ["Housing", "Measure J/R/D", "North Davis"],
    details: {
      units: "1,800 homes",
      acres: "497 acres",
      affordable: "100 deed-restricted low-income units",
      location: "Pole Line Rd & Covell Blvd",
      developer: "North Davis Land Co. LLC",
      "Council Vote": "Unanimous approval to place on ballot",
      "Key Context": "Davis voters have rejected 7 of 9 Measure J projects. Covell Village at same site rejected in 2005.",
    },
    comments: [
      { user: "DavisBiker22", time: "2h ago", text: "School enrollment crisis might actually push this over the line. DJUSD needs those families.", side: "yes" },
      { user: "AgLandDefender", time: "5h ago", text: "Flood zone concerns are real. 61% of the site is FEMA Flood Zone A.", side: "no" },
      { user: "YoloHousing", time: "1d ago", text: "Unanimous council vote is unprecedented for a Measure J project.", side: "yes" },
    ],
    history: [35, 33, 36, 38, 37, 40, 39, 42, 41, 38, 40, 42, 44, 42, 40, 43, 41, 42],
  },
  {
    id: "willowgrove",
    title: "Willowgrove",
    subtitle: "Measure J/R/D Vote",
    question: "Will Davis voters approve the Willowgrove development?",
    description: "1,250 new homes on 232 acres in Northeast Davis. Includes community park, transit station, retail/entertainment area, inclusive housing for people with disabilities, and agricultural buffers. Formerly the Shriner's Property.",
    voteDate: "November 3, 2026",
    status: "Active",
    yesPrice: 38,
    volume: 9870,
    totalPool: 28100,
    tags: ["Housing", "Measure J/R/D", "NE Davis"],
    details: {
      units: "1,250 homes",
      acres: "232 acres",
      affordable: "Exceeds city requirements",
      location: "East of Wildhorse, North of Mace Ranch",
      developer: "Davis Eastside LLC",
      "Council Vote": "Pending — targeting Nov 2026 ballot",
      "Key Context": "First Davis project to release tentative map before voter approval. DEIR released Nov 2025.",
    },
    comments: [
      { user: "WildhorseMom", time: "4h ago", text: "The tentative map release before the vote is smart. Transparency could help.", side: "yes" },
      { user: "FarmFirst530", time: "8h ago", text: "Two major developments in one year? Voter fatigue is real.", side: "no" },
      { user: "DavisPlanNerd", time: "2d ago", text: "If Village Farms passes in June, it changes the calculus for November.", side: "yes" },
    ],
    history: [30, 32, 31, 34, 35, 33, 36, 35, 37, 38, 36, 38, 37, 39, 38, 37, 38, 38],
  },
];

const COIN_PACKAGES = [
  { coins: 500, price: 10, label: "Starter", popular: false },
  { coins: 1500, price: 25, label: "Most Popular", popular: true },
  { coins: 3500, price: 50, label: "Power Player", popular: false },
  { coins: 8000, price: 100, label: "Whale", popular: false },
];

// ============================================================
// HELPERS
// ============================================================
function getDaysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((target - now) / 86400000));
}
function formatMoney(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

// ============================================================
// MINI CHART
// ============================================================
function MiniChart({ data, color, height = 48, width = 160 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`cg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#cg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * (height - 8) - 4} r="3.5" fill={color} stroke="#0a0a16" strokeWidth="1.5" />
    </svg>
  );
}

// ============================================================
// PRICE BAR
// ============================================================
function PriceBar({ yesPrice }) {
  return (
    <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", width: "100%", background: "#1a1a2e" }}>
      <div style={{ width: `${yesPrice}%`, background: "linear-gradient(90deg, #00c896, #00e6ac)", transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)" }} />
      <div style={{ width: `${100 - yesPrice}%`, background: "linear-gradient(90deg, #ff4757, #ff6b81)", transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)" }} />
    </div>
  );
}

// ============================================================
// COIN ICON
// ============================================================
function CoinIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="url(#coinGrad)" stroke="#c8a200" strokeWidth="1.5" />
      <defs>
        <linearGradient id="coinGrad" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#f0a000" />
        </linearGradient>
      </defs>
      <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="serif" fill="#8B6508">D</text>
    </svg>
  );
}

// ============================================================
// SIGN UP MODAL
// ============================================================
function SignUpModal({ onComplete, onClose }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, animation: "fadeIn 0.2s ease" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#14142a", borderRadius: 24, padding: 36, maxWidth: 420, width: "92%", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
        {step === 0 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 56, marginBottom: 12, animation: "float 3s ease-in-out infinite" }}>🪙</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#fff", margin: "0 0 8px", fontWeight: 900 }}>Get 100 Free MyDavisCoins</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#8888aa", margin: 0, lineHeight: 1.5 }}>
                Sign up to start predicting outcomes of Davis development votes. No credit card required.
              </p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6666aa", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 6 }}>Display Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="DavisLocal2026" style={{
                width: "100%", padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                outline: "none", boxSizing: "border-box",
              }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6666aa", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 6 }}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@davis.com" style={{
                width: "100%", padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                outline: "none", boxSizing: "border-box",
              }} />
            </div>
            <button onClick={() => name && email && setStep(1)} disabled={!name || !email} style={{
              width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
              background: name && email ? "linear-gradient(135deg, #ffd700, #f0a000)" : "rgba(255,255,255,0.05)",
              color: name && email ? "#000" : "#444", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              fontSize: 16, cursor: name && email ? "pointer" : "default", letterSpacing: 0.5,
            }}>
              Claim My 100 Free Coins
            </button>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#444", textAlign: "center", marginTop: 12 }}>
              By signing up you agree to our Terms of Service
            </p>
          </>
        )}
        {step === 1 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#fff", margin: "0 0 8px" }}>Welcome, {name}!</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <CoinIcon size={28} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 32, fontWeight: 700, color: "#ffd700" }}>100</span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#8888aa", margin: "0 0 24px", lineHeight: 1.5 }}>
              MyDavisCoins have been added to your wallet. Start predicting!
            </p>
            <button onClick={() => onComplete({ name, email, balance: 100 })} style={{
              width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #00c896, #00e6ac)", color: "#000",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, cursor: "pointer",
            }}>
              Start Predicting
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// WALLET / TOP-UP MODAL
// ============================================================
function WalletModal({ user, onClose, onTopUp }) {
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const customCoins = customAmount ? Math.floor(parseFloat(customAmount) * 50) : 0;

  const handlePurchase = (coins, price) => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      onTopUp(coins);
    }, 1500);
  };

  if (success) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={onClose}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#14142a", borderRadius: 24, padding: 36, maxWidth: 420, width: "92%", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#fff", margin: "0 0 8px" }}>Coins Added!</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#8888aa", margin: "0 0 20px" }}>
            Thank you for your donation. Your MyDavisCoins are ready to use.
          </p>
          <button onClick={onClose} style={{
            padding: "14px 40px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #ffd700, #f0a000)", color: "#000",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#14142a", borderRadius: 24, padding: 36, maxWidth: 480, width: "92%", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#fff", margin: 0 }}>My Wallet</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <CoinIcon size={22} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, fontWeight: 700, color: "#ffd700" }}>{user.balance.toLocaleString()}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8888aa" }}>MyDavisCoins</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#8888aa", width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        {/* Info Box */}
        <div style={{
          padding: "14px 18px", borderRadius: 14, marginBottom: 24,
          background: "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(240,160,0,0.03))",
          border: "1px solid rgba(255,215,0,0.12)",
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#ccaa44", lineHeight: 1.6, margin: 0 }}>
            <strong>How it works:</strong> MyDavisCoins are used to make predictions on local Davis votes. Donations support mydaviscalifornia.com and fund our local journalism and community engagement. Coins have no cash value and cannot be redeemed for money.
          </p>
        </div>

        {/* Packages */}
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6666aa", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>
          Get More MyDavisCoins
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {COIN_PACKAGES.map((pkg, i) => (
            <button key={i} onClick={() => { setSelectedPkg(pkg); setShowCustom(false); }} style={{
              padding: "18px 14px", borderRadius: 14, border: "2px solid",
              borderColor: selectedPkg === pkg ? "#ffd700" : "rgba(255,255,255,0.06)",
              background: selectedPkg === pkg ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.02)",
              cursor: "pointer", textAlign: "center", position: "relative", overflow: "hidden",
              transition: "all 0.2s ease",
            }}>
              {pkg.popular && (
                <div style={{
                  position: "absolute", top: 0, right: 0, left: 0,
                  background: "linear-gradient(90deg, #ffd700, #f0a000)",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 800,
                  color: "#000", padding: "3px 0", textTransform: "uppercase", letterSpacing: 1.5,
                }}>Most Popular</div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: pkg.popular ? 8 : 0 }}>
                <CoinIcon size={18} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: "#ffd700" }}>{pkg.coins.toLocaleString()}</span>
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 6 }}>${pkg.price}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6666aa", marginTop: 2 }}>
                {(pkg.coins / pkg.price).toFixed(0)} coins/$
              </div>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <button onClick={() => { setShowCustom(!showCustom); setSelectedPkg(null); }} style={{
          width: "100%", padding: "12px 0", borderRadius: 12, border: "1px solid",
          borderColor: showCustom ? "#ffd700" : "rgba(255,255,255,0.06)",
          background: showCustom ? "rgba(255,215,0,0.04)" : "transparent",
          color: showCustom ? "#ffd700" : "#6666aa", fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, cursor: "pointer", marginBottom: showCustom ? 12 : 20,
          transition: "all 0.2s ease", fontWeight: 600,
        }}>
          {showCustom ? "▾ Custom Amount" : "▸ Custom Amount"}
        </button>

        {showCustom && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#888", fontFamily: "'DM Mono', monospace", fontSize: 18 }}>$</span>
                <input
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  style={{
                    width: "100%", padding: "14px 16px 14px 30px", borderRadius: 12,
                    border: "1px solid rgba(255,215,0,0.2)", background: "rgba(255,255,255,0.03)",
                    color: "#fff", fontSize: 20, fontFamily: "'DM Mono', monospace",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#888" }}>=</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 100 }}>
                <CoinIcon size={18} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700, color: "#ffd700" }}>
                  {customCoins.toLocaleString()}
                </span>
              </div>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6666aa", marginTop: 6 }}>
              50 MyDavisCoins per dollar · Minimum $10 donation
            </div>
          </div>
        )}

        {/* Donate / Purchase Button */}
        <button
          onClick={() => {
            if (selectedPkg) handlePurchase(selectedPkg.coins, selectedPkg.price);
            else if (showCustom && parseFloat(customAmount) >= 10) handlePurchase(customCoins, parseFloat(customAmount));
          }}
          disabled={processing || (!selectedPkg && (!showCustom || !customAmount || parseFloat(customAmount) < 10))}
          style={{
            width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
            background: (selectedPkg || (showCustom && parseFloat(customAmount) >= 10))
              ? "linear-gradient(135deg, #ffd700, #f0a000)"
              : "rgba(255,255,255,0.05)",
            color: (selectedPkg || (showCustom && parseFloat(customAmount) >= 10)) ? "#000" : "#444",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16,
            cursor: (selectedPkg || (showCustom && parseFloat(customAmount) >= 10)) ? "pointer" : "default",
            letterSpacing: 0.5, transition: "all 0.2s ease", position: "relative", overflow: "hidden",
          }}
        >
          {processing ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              Processing...
            </span>
          ) : (
            selectedPkg
              ? `Donate $${selectedPkg.price} → Get ${selectedPkg.coins.toLocaleString()} Coins`
              : showCustom && parseFloat(customAmount) >= 10
                ? `Donate $${parseFloat(customAmount).toFixed(2)} → Get ${customCoins.toLocaleString()} Coins`
                : "Select a Package"
          )}
        </button>

        {/* Payment Methods */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, alignItems: "center" }}>
          {["PayPal", "Apple Pay", "Card"].map(m => (
            <span key={m} style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#555",
              padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}>{m}</span>
          ))}
        </div>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#333", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
          Donations support mydaviscalifornia.com local community content.<br />
          MyDavisCoins have no cash value and are non-refundable.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// TRADE PANEL
// ============================================================
function TradePanel({ market, user, onClose, onTrade }) {
  const [side, setSide] = useState("yes");
  const [coins, setCoins] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const price = side === "yes" ? market.yesPrice : (100 - market.yesPrice);
  const shares = coins ? Math.floor((parseFloat(coins) / price) * 100) : 0;
  const payout = shares;
  const canAfford = parseFloat(coins) <= user.balance;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#14142a", borderRadius: 24, padding: 32, maxWidth: 440, width: "92%", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8888aa", textTransform: "uppercase", letterSpacing: 1 }}>Place Prediction</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#fff", marginTop: 4 }}>{market.title}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)" }}>
            <CoinIcon size={14} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#ffd700", fontWeight: 600 }}>{user.balance.toLocaleString()}</span>
          </div>
        </div>

        {!confirmed ? (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["yes", "no"].map(s => (
                <button key={s} onClick={() => setSide(s)} style={{
                  flex: 1, padding: "14px 0", borderRadius: 12, border: "2px solid",
                  borderColor: side === s ? (s === "yes" ? "#00c896" : "#ff4757") : "rgba(255,255,255,0.06)",
                  background: side === s ? (s === "yes" ? "rgba(0,200,150,0.1)" : "rgba(255,71,87,0.1)") : "transparent",
                  color: side === s ? (s === "yes" ? "#00e6ac" : "#ff6b81") : "#666",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.5,
                }}>
                  {s === "yes" ? "✓ Yes" : "✗ No"} — {s === "yes" ? market.yesPrice : 100 - market.yesPrice}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8888aa", textTransform: "uppercase", letterSpacing: 1, display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>Wager (MyDavisCoins)</span>
                <button onClick={() => setCoins(String(user.balance))} style={{
                  background: "none", border: "none", color: "#ffd700", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, padding: 0,
                }}>MAX</button>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  value={coins}
                  onChange={e => setCoins(e.target.value)}
                  placeholder="0"
                  style={{
                    width: "100%", padding: "14px 40px 14px 16px", borderRadius: 12,
                    border: `1px solid ${coins && !canAfford ? "rgba(255,71,87,0.4)" : "rgba(255,255,255,0.08)"}`,
                    background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 22,
                    fontFamily: "'DM Mono', monospace", outline: "none", boxSizing: "border-box",
                  }}
                />
                <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
                  <CoinIcon size={20} />
                </div>
              </div>
              {coins && !canAfford && (
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#ff4757", marginTop: 6 }}>
                  Insufficient balance. Top up your wallet to continue.
                </div>
              )}
            </div>

            {parseFloat(coins) > 0 && canAfford && (
              <div style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, marginBottom: 20,
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                {[
                  ["Shares", shares],
                  ["Avg Price", `${price} coins`],
                  ["Potential Payout", <span style={{ color: side === "yes" ? "#00e6ac" : "#ff6b81", fontWeight: 700 }}>{payout.toLocaleString()} coins</span>],
                ].map(([label, val], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < 2 ? 8 : 0 }}>
                    <span style={{ color: "#8888aa", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{label}</span>
                    <span style={{ color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 14 }}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => parseFloat(coins) > 0 && canAfford && (setConfirmed(true), onTrade(parseFloat(coins)))}
              disabled={!coins || parseFloat(coins) <= 0 || !canAfford}
              style={{
                width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
                background: parseFloat(coins) > 0 && canAfford
                  ? (side === "yes" ? "linear-gradient(135deg, #00c896, #00e6ac)" : "linear-gradient(135deg, #ff4757, #ff6b81)")
                  : "rgba(255,255,255,0.05)",
                color: parseFloat(coins) > 0 && canAfford ? "#000" : "#444",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16,
                cursor: parseFloat(coins) > 0 && canAfford ? "pointer" : "default",
              }}
            >
              {parseFloat(coins) > 0 && canAfford ? `Predict ${side.toUpperCase()}` : "Enter Amount"}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
            <div style={{ color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Prediction Placed!</div>
            <div style={{ color: "#8888aa", fontFamily: "'DM Sans', sans-serif", fontSize: 14, marginBottom: 24 }}>
              {shares} shares of <span style={{ color: side === "yes" ? "#00e6ac" : "#ff6b81", fontWeight: 700 }}>{side.toUpperCase()}</span> on {market.title}
            </div>
            <button onClick={onClose} style={{
              padding: "14px 40px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent", color: "#fff", fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer", fontSize: 15,
            }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MARKET CARD
// ============================================================
function MarketCard({ market, user, onTrade, onSignUp, expanded, onToggle }) {
  const daysLeft = getDaysUntil(market.voteDate);

  return (
    <div style={{
      background: "linear-gradient(145deg, #16162a 0%, #12121f 100%)",
      borderRadius: 20, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
      transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
      boxShadow: expanded ? "0 20px 60px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.2)",
    }}>
      <div style={{ padding: "28px 28px 0 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 1.2,
                background: "rgba(0,200,150,0.12)", color: "#00e6ac",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e6ac", display: "inline-block", animation: "pulse 2s infinite" }} />
                {market.status}
              </span>
              <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: "rgba(255,255,255,0.04)", color: "#8888aa" }}>
                {daysLeft}d until vote
              </span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>{market.title}</h2>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6666aa", marginTop: 4, letterSpacing: 0.5 }}>{market.subtitle} · {market.voteDate}</div>
          </div>
          <div style={{ textAlign: "right", minWidth: 90 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 700, color: market.yesPrice >= 50 ? "#00c896" : "#ff4757", lineHeight: 1 }}>{market.yesPrice}¢</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6666aa", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Yes Price</div>
          </div>
        </div>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#aaaabb", lineHeight: 1.6, margin: "0 0 20px" }}>{market.question}</p>

        <PriceBar yesPrice={market.yesPrice} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, marginBottom: 20 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#00c896" }}>Yes {market.yesPrice}¢</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#ff4757" }}>No {100 - market.yesPrice}¢</span>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button onClick={() => user ? onTrade(market) : onSignUp()} style={{
            flex: 1, padding: "14px 0", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, rgba(0,200,150,0.15), rgba(0,230,172,0.08))",
            color: "#00e6ac", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
            fontSize: 14, cursor: "pointer", letterSpacing: 0.5,
          }}>
            {user ? `Buy Yes — ${market.yesPrice}¢` : "🔒 Sign Up to Predict"}
          </button>
          {user && (
            <button onClick={() => onTrade(market)} style={{
              flex: 1, padding: "14px 0", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, rgba(255,71,87,0.15), rgba(255,107,129,0.08))",
              color: "#ff6b81", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              fontSize: 14, cursor: "pointer", letterSpacing: 0.5,
            }}>
              Buy No — {100 - market.yesPrice}¢
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", marginBottom: 20, background: "rgba(255,255,255,0.02)", borderRadius: 12, overflow: "hidden" }}>
          {[
            { label: "Volume", value: <><CoinIcon size={12} /> {formatMoney(market.volume)}</> },
            { label: "Pool", value: <><CoinIcon size={12} /> {formatMoney(market.totalPool)}</> },
            { label: "30d Trend", value: <MiniChart data={market.history} color="#00c896" height={28} width={80} /> },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "12px 14px", textAlign: "center",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#6666aa", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expand Toggle */}
      <button onClick={onToggle} style={{
        width: "100%", padding: "14px 28px", background: "rgba(255,255,255,0.02)",
        border: "none", borderTop: "1px solid rgba(255,255,255,0.04)",
        color: "#6666aa", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        {expanded ? "Hide Details" : "Project Details & Discussion"}
        <span style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s ease", display: "inline-block" }}>▾</span>
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ padding: "24px 28px" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6666aa", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16 }}>Project Details</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#aaaabb", lineHeight: 1.7, margin: "0 0 20px" }}>{market.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {Object.entries(market.details).map(([key, val]) => (
                <div key={key} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#6666aa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{key}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#ddd", lineHeight: 1.4 }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
              {market.tags.map(tag => (
                <span key={tag} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, background: "rgba(100,100,200,0.08)", color: "#8888cc", border: "1px solid rgba(100,100,200,0.12)" }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: "0 28px 24px" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6666aa", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16 }}>Community Discussion</div>
            {market.comments.map((c, i) => (
              <div key={i} style={{ padding: "14px 16px", borderRadius: 12, marginBottom: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${c.side === "yes" ? "#00c896" : "#ff4757"}33, ${c.side === "yes" ? "#00c896" : "#ff4757"}11)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: c.side === "yes" ? "#00e6ac" : "#ff6b81", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{c.user[0]}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#ccc", fontWeight: 600 }}>{c.user}</span>
                    <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: c.side === "yes" ? "#00e6ac" : "#ff6b81", textTransform: "uppercase", letterSpacing: 0.8, padding: "2px 6px", borderRadius: 4, background: c.side === "yes" ? "rgba(0,200,150,0.1)" : "rgba(255,71,87,0.1)" }}>Holds {c.side}</span>
                  </div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#555" }}>{c.time}</span>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#999", lineHeight: 1.5, margin: 0 }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function DavisPredictions() {
  const [user, setUser] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [tradeMarket, setTradeMarket] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignUpComplete = useCallback((userData) => {
    setUser(userData);
    setShowSignUp(false);
  }, []);

  const handleTopUp = useCallback((coins) => {
    setUser(prev => ({ ...prev, balance: prev.balance + coins }));
  }, []);

  const handleTrade = useCallback((spent) => {
    setUser(prev => ({ ...prev, balance: prev.balance - spent }));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a16", color: "#fff", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* Background Effects */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,200,150,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(100,80,200,0.04) 0%, transparent 50%)" }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100, padding: "14px 0",
        background: scrollY > 20 ? "rgba(10,10,22,0.92)" : "transparent",
        backdropFilter: scrollY > 20 ? "blur(20px)" : "none",
        borderBottom: scrollY > 20 ? "1px solid rgba(255,255,255,0.04)" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00c896, #6644cc)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 18, color: "#fff" }}>D</div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>mydaviscalifornia</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#6666aa", textTransform: "uppercase", letterSpacing: 1.5 }}>Predictions</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user ? (
              <>
                <button onClick={() => setShowWallet(true)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 12, background: "rgba(255,215,0,0.08)",
                  border: "1px solid rgba(255,215,0,0.15)", cursor: "pointer",
                  transition: "all 0.2s ease",
                }}>
                  <CoinIcon size={16} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#ffd700", fontWeight: 600 }}>{user.balance.toLocaleString()}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#aa8800", fontWeight: 700, marginLeft: 4 }}>+ ADD</span>
                </button>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "linear-gradient(135deg, #00c896, #0088ff)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: "#fff",
                }}>{user.name[0].toUpperCase()}</div>
              </>
            ) : (
              <button onClick={() => setShowSignUp(true)} style={{
                padding: "8px 20px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #ffd700, #f0a000)",
                color: "#000", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                fontSize: 13, cursor: "pointer", letterSpacing: 0.3,
              }}>
                Get 100 Free Coins
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px 48px", animation: "slideUp 0.8s cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#00e6ac", textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 16 }}>
          Davis Development Predictions
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 900, color: "#fff", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: -1 }}>
          What will Davis<br />
          <span style={{ color: "#00c896" }}>voters</span> decide?
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "#8888aa", lineHeight: 1.6, margin: "0 0 28px", maxWidth: 540 }}>
          Predict the outcomes of Davis Measure J/R/D votes. Two major housing developments head to the ballot in 2026. Put your local knowledge to work.
        </p>

        {/* Free coins CTA for logged out users */}
        {!user && (
          <button onClick={() => setShowSignUp(true)} style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 28px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg, #ffd700, #f0a000)",
            color: "#000", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
            fontSize: 16, cursor: "pointer", marginBottom: 32,
            boxShadow: "0 4px 24px rgba(255,215,0,0.2)",
          }}>
            <CoinIcon size={22} />
            Get 100 Free MyDavisCoins to Start
          </button>
        )}

        {/* How It Works */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { icon: "🪙", label: "Get coins", desc: "100 free at signup" },
            { icon: "🎯", label: "Predict", desc: "Buy Yes or No shares" },
            { icon: "🏆", label: "Win coins", desc: "If your prediction is right" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#ddd" }}>{item.label}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6666aa" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Markets */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
        {MARKETS.map((market, i) => (
          <div key={market.id} style={{ animation: `slideUp ${0.6 + i * 0.15}s cubic-bezier(0.22,1,0.36,1)` }}>
            <MarketCard
              market={market}
              user={user}
              onTrade={setTradeMarket}
              onSignUp={() => setShowSignUp(true)}
              expanded={expandedId === market.id}
              onToggle={() => setExpandedId(expandedId === market.id ? null : market.id)}
            />
          </div>
        ))}

        {/* Measure J/R/D Info */}
        <div style={{
          padding: "20px 24px", borderRadius: 16,
          background: "linear-gradient(135deg, rgba(100,68,204,0.08), rgba(0,200,150,0.05))",
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "flex-start", gap: 14,
        }}>
          <span style={{ fontSize: 24, marginTop: 2 }}>📋</span>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "#ddd", marginBottom: 4 }}>About Measure J/R/D</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8888aa", lineHeight: 1.6, margin: 0 }}>
              Davis requires voter approval for developments on agricultural land. Passed in 2000 and renewed twice, this ordinance has shaped Davis growth for 25 years. Historically, voters have rejected 7 of 9 projects at the ballot.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: "16px 20px", borderRadius: 14,
          background: "rgba(255,215,0,0.03)", border: "1px solid rgba(255,215,0,0.08)",
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#776622", lineHeight: 1.6, margin: 0 }}>
            <strong>Disclaimer:</strong> MyDavisCoins are virtual tokens used for community engagement predictions only. They have no cash value, cannot be exchanged for money, and are non-refundable. Donations support mydaviscalifornia.com local journalism and community content. Prediction prices reflect community sentiment and are not polls, endorsements, or financial advice. Not affiliated with the City of Davis.
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "24px 0 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#333", lineHeight: 1.6 }}>
            © 2026 mydaviscalifornia.com · Predictions Market<br />
            <a href="/terms" style={{ color: "#555", textDecoration: "none" }}>Terms of Service</a>  ·  <a href="/terms" style={{ color: "#555", textDecoration: "none" }}>Privacy Policy</a>  ·  <a href="/terms" style={{ color: "#555", textDecoration: "none" }}>FAQ</a>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSignUp && <SignUpModal onComplete={handleSignUpComplete} onClose={() => setShowSignUp(false)} />}
      {showWallet && user && <WalletModal user={user} onClose={() => setShowWallet(false)} onTopUp={handleTopUp} />}
      {tradeMarket && user && <TradePanel market={tradeMarket} user={user} onClose={() => setTradeMarket(null)} onTrade={handleTrade} />}
    </div>
  );
}
