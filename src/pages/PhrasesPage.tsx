import { useState } from 'react'

type Phrase = { jp: string; romaji: string; es: string }
type Category = { id: string; label: string; icon: string; phrases: Phrase[] }

const CATEGORIES: Category[] = [
  {
    id: 'saludos',
    label: 'Saludos',
    icon: '👋',
    phrases: [
      { jp: 'こんにちは', romaji: 'Konnichiwa', es: 'Hola (de día)' },
      { jp: 'おはようございます', romaji: 'Ohayou gozaimasu', es: 'Buenos días' },
      { jp: 'こんばんは', romaji: 'Konbanwa', es: 'Buenas noches' },
      { jp: 'ありがとうございます', romaji: 'Arigatou gozaimasu', es: 'Muchas gracias' },
      { jp: 'すみません', romaji: 'Sumimasen', es: 'Perdón / Disculpe' },
      { jp: 'はい / いいえ', romaji: 'Hai / Iie', es: 'Sí / No' },
    ],
  },
  {
    id: 'restaurante',
    label: 'Restaurante',
    icon: '🍜',
    phrases: [
      { jp: 'メニューをください', romaji: 'Menyuu wo kudasai', es: 'El menú, por favor' },
      { jp: 'これをください', romaji: 'Kore wo kudasai', es: 'Esto, por favor' },
      { jp: 'お水をください', romaji: 'Omizu wo kudasai', es: 'Agua, por favor' },
      { jp: 'お会計をお願いします', romaji: 'Okaikei wo onegaishimasu', es: 'La cuenta, por favor' },
      { jp: 'おいしい！', romaji: 'Oishii!', es: '¡Está rico!' },
      { jp: 'おすすめは何ですか？', romaji: 'Osusume wa nan desu ka?', es: '¿Cuál es la recomendación de la casa?' },
      { jp: 'アレルギーがあります', romaji: 'Arerugii ga arimasu', es: 'Tengo alergia' },
    ],
  },
  {
    id: 'transporte',
    label: 'Transporte',
    icon: '🚆',
    phrases: [
      { jp: '〜駅はどこですか？', romaji: '〜eki wa doko desu ka?', es: '¿Dónde está la estación de...?' },
      { jp: '〜まで行きたいです', romaji: '〜made ikitai desu', es: 'Quiero ir a...' },
      { jp: '迷子になりました', romaji: 'Maigo ni narimashita', es: 'Me perdí' },
      { jp: 'このバスは止まりますか？', romaji: 'Kono basu wa tomarimasu ka?', es: '¿Este bus para aquí?' },
      { jp: 'タクシーを呼んでください', romaji: 'Takushii wo yonde kudasai', es: 'Llame un taxi, por favor' },
    ],
  },
  {
    id: 'compras',
    label: 'Compras',
    icon: '🛍️',
    phrases: [
      { jp: 'いくらですか？', romaji: 'Ikura desu ka?', es: '¿Cuánto cuesta?' },
      { jp: 'これをください', romaji: 'Kore wo kudasai', es: 'Me llevo esto' },
      { jp: 'クレジットカードは使えますか？', romaji: 'Kurejitto kaado wa tsukaemasu ka?', es: '¿Puedo pagar con tarjeta?' },
      { jp: '試着できますか？', romaji: 'Shichaku dekimasu ka?', es: '¿Puedo probármelo?' },
      { jp: '袋に入れてください', romaji: 'Fukuro ni irete kudasai', es: 'Pónganlo en una bolsa' },
    ],
  },
  {
    id: 'emergencias',
    label: 'Emergencias',
    icon: '🚨',
    phrases: [
      { jp: '助けてください！', romaji: 'Tasukete kudasai!', es: '¡Ayuda!' },
      { jp: '病院はどこですか？', romaji: 'Byouin wa doko desu ka?', es: '¿Dónde hay un hospital?' },
      { jp: '警察を呼んでください', romaji: 'Keisatsu wo yonde kudasai', es: 'Llamen a la policía' },
      { jp: '薬局はどこですか？', romaji: 'Yakkyoku wa doko desu ka?', es: '¿Dónde hay una farmacia?' },
      { jp: '気分が悪いです', romaji: 'Kibun ga warui desu', es: 'Me siento mal' },
    ],
  },
]

export default function PhrasesPage() {
  const [open, setOpen] = useState<string | null>('saludos')

  function toggle(id: string) {
    setOpen((prev) => (prev === id ? null : id))
  }

  return (
    <div className="page page--scrollable">
      <header className="header">
        <div className="badge">
          <span className="badge-emoji">🗣️</span>
          <span className="badge-text">Japonés básico</span>
        </div>
        <h1>Frases útiles</h1>
        <p className="sub">Frases esenciales para el viaje, organizadas por situación.</p>
      </header>

      <div className="phrases-list">
        {CATEGORIES.map((cat) => {
          const isOpen = open === cat.id
          return (
            <div key={cat.id} className="phrase-cat card">
              <button
                className="phrase-cat-header"
                onClick={() => toggle(cat.id)}
                aria-expanded={isOpen}
              >
                <span className="phrase-cat-title">
                  <span className="phrase-cat-icon">{cat.icon}</span>
                  {cat.label}
                </span>
                <svg
                  className={`phrase-chevron${isOpen ? ' phrase-chevron--open' : ''}`}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path fill="currentColor" d="M7 10l5 5 5-5H7Z" />
                </svg>
              </button>

              {isOpen && (
                <ul className="phrase-items" role="list">
                  {cat.phrases.map((p) => (
                    <li key={p.romaji} className="phrase-item">
                      <span className="phrase-jp">{p.jp}</span>
                      <span className="phrase-romaji">{p.romaji}</span>
                      <span className="phrase-es">{p.es}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
