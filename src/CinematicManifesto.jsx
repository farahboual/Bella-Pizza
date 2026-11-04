import React from 'react'
import { motion } from 'framer-motion'
import { useLang } from './i18n.jsx'

export function CinematicManifesto() {
  const { lang } = useLang()

  const acts = [
    {
      num: '01',
      eyebrow: lang === 'en' ? 'ACT I · THE DOUGH' : 'ACTE I · LA MATIÈRE',
      title: lang === 'en' ? 'Tipo 00 Flour & Pure Spring Water' : 'Farine Tipo 00 & Eau de Source',
      italian: 'La Farina e l\'Impasto',
      desc: lang === 'en'
        ? 'Imported wheat flour from ancient Campania mills. 72% hydration and 48 hours of slow cold maturation for cloud-like lightness.'
        : 'Blé pur sélectionné au Moulin de Naples, hydratation à 72% et 48 heures de fermentation lente en chambre froide pour une digestibilité absolue.',
      chip: lang === 'en' ? '48h Slow Maturation' : 'Maturation 48 Heures',
      img: '/client-assets/manifesto-step-1-dough.jpg',
      alt: 'Pétrissage artisanal et saupoudrage de farine Tipo 00 sur pâtons'
    },
    {
      num: '02',
      eyebrow: lang === 'en' ? 'ACT II · THE PRODUCE' : 'ACTE II · LA TERRE',
      title: lang === 'en' ? 'San Marzano DOP & Fior di Latte' : 'Tomate San Marzano DOP & Fior di Latte',
      italian: 'Gli Ingredienti Nobili',
      desc: lang === 'en'
        ? 'Sun-drenched volcanic tomatoes from Mount Vesuvius slopes crushed by hand, paired with farm-fresh Campania mozzarella.'
        : 'Tomates gorgées du soleil vésuvien écrasées à la main, Mozzarella di Bufala crémeuse et feuilles de basilic frais cueillies au matin.',
      chip: lang === 'en' ? 'Protected Origin DOP' : 'Appellation Protégée DOP',
      img: '/client-assets/manifesto-step-2-ingredients.jpg',
      alt: 'Ingrédients nobles italiens sous appellation protégée DOP'
    },
    {
      num: '03',
      eyebrow: lang === 'en' ? 'ACT III · THE FLAME' : 'ACTE III · LA FLAMME',
      title: lang === 'en' ? 'Wood Fire at 485°C' : 'Sole Réfractaire à 485°C',
      italian: 'Il Fuoco Napoletano',
      desc: lang === 'en'
        ? 'A blistering 90-second bake on volcanic stone. The crust rises instantly, tender and airy with authentic leopard spotting.'
        : 'Saisie fulgurante de 90 secondes sur pierre volcanique. La croûte gonfle instantanément, alvéolée et tachetée de son léopardage signature.',
      chip: lang === 'en' ? '90s High-Heat Bake' : '90 Secondes à Flamme Vive',
      img: '/client-assets/manifesto-step-3-oven.jpg',
      alt: 'Four à bois traditionnel napolitain incandescent à 485°C'
    },
    {
      num: '04',
      eyebrow: lang === 'en' ? 'ACT IV · THE FINISH' : 'ACTE IV · L\'ACCOMPLISSEMENT',
      title: lang === 'en' ? 'The Culinary Masterpiece' : 'L\'Émotion Gastronomique',
      italian: 'L\'Arte a Tavola',
      desc: lang === 'en'
        ? 'Finished with a drizzle of cold-pressed Umbrian olive oil and freshly torn herbs. Crisp outside, melt-in-mouth inside.'
        : 'Un filet d\'huile d\'olive vierge extra pressée à froid au burette en cuivre, burrata crémeuse et parfum fumé délicat. Servi immédiatement.',
      chip: lang === 'en' ? 'Handcrafted to Order' : 'Dressé Minute à la Commande',
      img: '/client-assets/manifesto-step-4-plated.jpg',
      alt: 'Pizza napolitaine fumante avec filet d\'huile d\'olive versé à la burette'
    }
  ]

  return (
    <section className="cinematic-manifesto-section" aria-label="Manifeste artisanal">
      {/* Cinematic subtle ambient lighting */}
      <div className="cinematic-ambient-glow" aria-hidden="true" />

      <div className="wrap">
        {/* Section Header */}
        <div className="cinematic-manifesto-header">
          <div className="cinematic-eyebrow-badge">
            <span className="cinematic-eyebrow-bullet" />
            <span>{lang === 'en' ? 'THE ATELIER MANIFESTO' : 'IL MANIFESTO DELL\'ATELIER'}</span>
          </div>
          <h2 className="cinematic-manifesto-title">
            {lang === 'en' ? (
              <>The Art of <em>Flame & Heritage</em></>
            ) : (
              <>L'Alchimie du Geste <em>& de la Flamme</em></>
            )}
          </h2>
          <p className="cinematic-manifesto-sub">
            {lang === 'en'
              ? 'Four sacred principles honoring the century-old ritual of Neapolitan master pizzaioli.'
              : 'Quatre piliers immuables, de la sélection des blés anciens jusqu\'à l\'embrasement du four à 485°C.'}
          </p>
        </div>

        {/* 4 Cinematic Widescreen Act Cards */}
        <div className="cinematic-acts-grid">
          {acts.map((act, index) => (
            <motion.article
              key={act.num}
              className="cinematic-act-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="cinematic-card-media">
                <img
                  src={act.img}
                  alt={act.alt}
                  loading="lazy"
                  className="cinematic-card-img"
                />
                <div className="cinematic-card-scrim" />
                <span className="cinematic-card-num" aria-hidden="true">
                  <span className="cinematic-card-num-dot" />
                  <span>{lang === 'en' ? `STEP ${act.num}` : `ÉTAPE ${act.num}`}</span>
                </span>
                <span className="cinematic-card-chip">{act.chip}</span>
              </div>

              <div className="cinematic-card-body">
                <div className="cinematic-card-eyebrow-row">
                  <span className="cinematic-card-eyebrow">{act.eyebrow}</span>
                  <span className="cinematic-card-italian">{act.italian}</span>
                </div>
                <div className="cinematic-act-title-row">
                  <span className="cinematic-act-num-badge" aria-hidden="true">{act.num}</span>
                  <h3 className="cinematic-card-title">{act.title}</h3>
                </div>
                <p className="cinematic-card-desc">{act.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom Filmic Strip */}
        <div className="cinematic-strip-bottom" aria-hidden="true">
          <div className="cinematic-strip-item">
            <strong>485°C</strong>
            <span>Sole Volcanique</span>
          </div>
          <div className="cinematic-strip-sep" />
          <div className="cinematic-strip-item">
            <strong>48H</strong>
            <span>Fermentation Lente</span>
          </div>
          <div className="cinematic-strip-sep" />
          <div className="cinematic-strip-item">
            <strong>100%</strong>
            <span>Fait Main Minute</span>
          </div>
          <div className="cinematic-strip-sep" />
          <div className="cinematic-strip-item">
            <strong>DOP</strong>
            <span>Campania & Puglia</span>
          </div>
        </div>
      </div>
    </section>
  )
}
