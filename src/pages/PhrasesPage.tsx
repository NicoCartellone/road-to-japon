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
      { jp: 'すみません', romaji: 'Sumimasen', es: 'Perdón / Disculpe / Gracias' },
      { jp: 'ごめんなさい', romaji: 'Gomen nasai', es: 'Lo siento' },
      { jp: 'はい / いいえ', romaji: 'Hai / Iie', es: 'Sí / No' },
      { jp: 'いただきます', romaji: 'Itadakimasu', es: 'Buen provecho (antes de comer)' },
      { jp: 'ごちそうさまでした', romaji: 'Gochisousamadeshita', es: 'Gracias por la comida (después de comer)' },
    ],
  },
  {
    id: 'cotidianas',
    label: 'Cotidianas',
    icon: '💬',
    phrases: [
      { jp: 'じゃあね', romaji: 'Jaa ne', es: 'Chau' },
      { jp: 'またね', romaji: 'Mata ne', es: 'Hasta luego' },
      { jp: 'また明日', romaji: 'Mata ashita', es: 'Hasta mañana' },
      { jp: 'さようなら', romaji: 'Sayounara', es: 'Adiós (formal)' },
      { jp: 'お休みなさい', romaji: 'Oyasuminasai', es: 'Buenas noches (al despedirse)' },
      { jp: '初めまして', romaji: 'Hajimemashite', es: 'Mucho gusto (al conocer a alguien)' },
      { jp: 'よろしくお願いします', romaji: 'Yoroshiku onegaishimasu', es: 'Un placer / Encantado' },
      { jp: 'アルゼンチンじんです', romaji: 'Aruzenchinjin desu', es: 'Soy argentino/a' },
      { jp: 'メキシコじんです', romaji: 'Mekishikojin desu', es: 'Soy mexicano/a' },
      { jp: 'ウルグアイじんです', romaji: 'Uruguaijin desu', es: 'Soy uruguayo/a' },
      { jp: 'わかりません', romaji: 'Wakarimasen', es: 'No entiendo' },
      { jp: 'もう一度お願いします', romaji: 'Mou ichido onegaishimasu', es: '¿Puede repetir, por favor?' },
      { jp: 'ゆっくり話してください', romaji: 'Yukkuri hanashite kudasai', es: 'Hable más despacio, por favor' },
      { jp: '英語を話せますか？', romaji: 'Eigo wo hanasemasu ka?', es: '¿Habla inglés?' },
    ],
  },
  {
    id: 'aeropuerto',
    label: 'Aeropuerto',
    icon: '✈️',
    phrases: [
      { jp: 'すみません、チェックインはどこですか', romaji: 'Sumimasen, chekkuin wa doko desu ka', es: '¿Dónde está el check-in?' },
      { jp: 'あちらです', romaji: 'Achira desu', es: 'Es por allá' },
      { jp: 'パスポートをみせてください', romaji: 'Pasupoto o misete kudasai', es: 'Muéstreme su pasaporte, por favor' },
      { jp: 'はい、どうぞ', romaji: 'Hai, douzo', es: 'Sí, aquí tiene' },
      { jp: 'いってらっしゃい', romaji: 'Itterasshai', es: 'Que tenga buen viaje (despedida)' },
      { jp: 'いってきます', romaji: 'Ittekimasu', es: 'Me voy (respuesta al Itterasshai)' },
      { jp: 'パスポート', romaji: 'Pasupoto', es: 'Pasaporte' },
    ],
  },
  {
    id: 'hora',
    label: 'La Hora',
    icon: '⌚',
    phrases: [
      { jp: 'すみません、いま、なんじですか', romaji: 'Sumimasen, ima, nanji desu ka', es: '¿Qué hora es ahora?' },
      { jp: '3じです', romaji: 'San-ji desu', es: 'Son las 3' },
      { jp: 'ごぜん', romaji: 'Gozen', es: 'AM (antes del mediodía)' },
      { jp: 'ごご', romaji: 'Gogo', es: 'PM (después del mediodía)' },
      { jp: 'さんじからごじまでです', romaji: 'San ji kara goji made desu', es: 'Desde las 3 hasta las 5' },
    ],
  },
  {
    id: 'restaurante',
    label: 'Restaurante',
    icon: '🍜',
    phrases: [
      { jp: 'すみません、えいごのメニューをください', romaji: 'Sumimasen, eigo no menyuu o kudasai', es: 'El menú en inglés, por favor' },
      { jp: 'メニューをください', romaji: 'Menyuu wo kudasai', es: 'El menú, por favor' },
      { jp: 'これをください', romaji: 'Kore wo kudasai', es: 'Esto, por favor' },
      { jp: 'ラーメンをひとつください', romaji: 'Raamen o hitotsu kudasai', es: 'Un ramen, por favor' },
      { jp: 'お水をください', romaji: 'Omizu wo kudasai', es: 'Agua, por favor' },
      { jp: 'コーヒーをひとつください', romaji: 'Koohii o hitotsu kudasai', es: 'Un café, por favor' },
      { jp: 'お会計をお願いします', romaji: 'Okaikei wo onegaishimasu', es: 'La cuenta, por favor' },
      { jp: 'おいしい！', romaji: 'Oishii!', es: '¡Está rico!' },
      { jp: 'おすすめは何ですか？', romaji: 'Osusume wa nan desu ka?', es: '¿Cuál es la recomendación de la casa?' },
      { jp: 'アレルギーがあります', romaji: 'Arerugii ga arimasu', es: 'Tengo alergia' },
    ],
  },
  {
    id: 'hotel',
    label: 'Hotel',
    icon: '🏨',
    phrases: [
      { jp: 'こんばんは、よやくしました', romaji: 'Konbanwa, yoyaku shimashita', es: 'Buenas noches, tengo una reserva' },
      { jp: 'ようこそ。こちらへどうぞ', romaji: 'Youkoso. Kochira e douzo', es: 'Bienvenido/a. Por aquí, por favor' },
      { jp: 'よやく', romaji: 'Yoyaku', es: 'Reserva' },
      { jp: 'チェックイン', romaji: 'Chekkuin', es: 'Check-in' },
      { jp: 'チェックアウト', romaji: 'Chekkuauto', es: 'Check-out' },
      { jp: 'タオル', romaji: 'Taoru', es: 'Toallas' },
    ],
  },
  {
    id: 'transporte',
    label: 'Transporte',
    icon: '🚆',
    phrases: [
      { jp: '〜駅はどこですか？', romaji: '〜eki wa doko desu ka?', es: '¿Dónde está la estación de...?' },
      { jp: '〜まで行きたいです', romaji: '〜made ikitai desu', es: 'Quiero ir a...' },
      { jp: 'このバスはおおさかにいきますか', romaji: 'Kono basu wa Oosaka ni ikimasu ka', es: '¿Este bus va a Osaka?' },
      { jp: 'きっぷを1まいください', romaji: 'Kippu o ichi-mai kudasai', es: 'Un boleto, por favor' },
      { jp: '迷子になりました', romaji: 'Maigo ni narimashita', es: 'Me perdí' },
      { jp: 'このバスは止まりますか？', romaji: 'Kono basu wa tomarimasu ka?', es: '¿Este bus para aquí?' },
      { jp: 'タクシーを呼んでください', romaji: 'Takushii wo yonde kudasai', es: 'Llame un taxi, por favor' },
      { jp: 'こども', romaji: 'Kodomo', es: 'Niño/a (para boletos)' },
      { jp: 'おとな', romaji: 'Otona', es: 'Adulto/a (para boletos)' },
    ],
  },
  {
    id: 'compras',
    label: 'Compras',
    icon: '🛍️',
    phrases: [
      { jp: 'いくらですか？', romaji: 'Ikura desu ka?', es: '¿Cuánto cuesta?' },
      { jp: 'これをください', romaji: 'Kore wo kudasai', es: 'Me llevo esto' },
      { jp: 'ちょっとたかいですね', romaji: 'Chotto takai desu ne', es: 'Es un poco caro, ¿verdad?' },
      { jp: 'クレジットカードは使えますか？', romaji: 'Kurejitto kaado wa tsukaemasu ka?', es: '¿Puedo pagar con tarjeta?' },
      { jp: '試着できますか？', romaji: 'Shichaku dekimasu ka?', es: '¿Puedo probármelo?' },
      { jp: '袋に入れてください', romaji: 'Fukuro ni irete kudasai', es: 'Pónganlo en una bolsa' },
      { jp: 'レジ', romaji: 'Reji', es: 'Caja (para pagar)' },
    ],
  },
  {
    id: 'emergencias',
    label: 'Emergencias',
    icon: '🚨',
    phrases: [
      { jp: '助けてください！', romaji: 'Tasukete kudasai!', es: '¡Ayuda!' },
      { jp: 'すみません、てつだってください', romaji: 'Sumimasen, tetsudatte kudasai', es: 'Disculpe, ayúdeme por favor' },
      { jp: 'いたい', romaji: 'Itai', es: 'Me duele' },
      { jp: 'あたまがいたい', romaji: 'Atama ga itai', es: 'Me duele la cabeza' },
      { jp: 'おなかがいたい', romaji: 'Onaka ga itai', es: 'Me duele la panza' },
      { jp: 'はがいたい', romaji: 'Ha ga itai', es: 'Me duele un diente' },
      { jp: 'あしがいたい', romaji: 'Ashi ga itai', es: 'Me duele el pie' },
      { jp: '気分が悪いです', romaji: 'Kibun ga warui desu', es: 'Me siento mal' },
      { jp: '病院はどこですか？', romaji: 'Byouin wa doko desu ka?', es: '¿Dónde hay un hospital?' },
      { jp: '薬局はどこですか？', romaji: 'Yakkyoku wa doko desu ka?', es: '¿Dónde hay una farmacia?' },
      { jp: 'すみません、このくすりはありますか', romaji: 'Sumimasen, kono kusuri wa arimasu ka', es: '¿Tiene esta medicina?' },
      { jp: 'このくすりをください', romaji: 'Kono kusuri o kudasai', es: 'Esta medicina, por favor' },
      { jp: '警察を呼んでください', romaji: 'Keisatsu wo yonde kudasai', es: 'Llamen a la policía' },
    ],
  },
]

function speak(text: string, onDone: () => void): void {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.onend = onDone
  utterance.onerror = onDone
  window.speechSynthesis.speak(utterance)
}

export default function PhrasesPage() {
  const [open, setOpen] = useState<string | null>(null)
  const [speaking, setSpeaking] = useState<string | null>(null)

  function toggle(id: string) {
    setOpen((prev) => (prev === id ? null : id))
  }

  function handleSpeak(jp: string) {
    if (speaking === jp) {
      window.speechSynthesis.cancel()
      setSpeaking(null)
      return
    }
    setSpeaking(jp)
    speak(jp, () => setSpeaking(null))
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
                  {cat.phrases.map((p) => {
                    const isActive = speaking === p.jp
                    return (
                      <li key={p.romaji} className="phrase-item">
                        <div className="phrase-text">
                          <span className="phrase-jp">{p.jp}</span>
                          <span className="phrase-romaji">{p.romaji}</span>
                          <span className="phrase-es">{p.es}</span>
                        </div>
                        <button
                          className={`phrase-speak${isActive ? ' phrase-speak--active' : ''}`}
                          onClick={() => handleSpeak(p.jp)}
                          aria-label={`Escuchar: ${p.es}`}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            {isActive ? (
                              <path
                                fill="currentColor"
                                d="M6 6h12v12H6z"
                              />
                            ) : (
                              <path
                                fill="currentColor"
                                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                              />
                            )}
                          </svg>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
