/**
 * « Voyants du tableau de bord » — the dashboard warning-light guide.
 *
 * General automotive guidance (what the light means, how urgent it is, what
 * to do right now), written for drivers, never a diagnosis and never a claim
 * about this garage. Each light points at the service that answers it, so
 * the guide ends in a booking. The owner's manual stays the reference; the
 * page says so.
 *
 * `level`: 'stop' (red — stop safely and call), 'soon' (amber — book soon).
 * `svg`: stroke-only pictogram on a 24×24 grid, drawn to read like the
 * ISO 2575 symbols without reproducing any manufacturer's artwork.
 */
module.exports = [
  {
    key: 'moteur', level: 'soon', service: 'diagnostic-code-moteur',
    svg: '<path d="M3 10v5M3 12.5h2M5 9h2V7h4M9 7V5.5M7.5 5.5h3M11 7h3l2 2h2v2h2v-2h1v7h-1v-2h-2v2l-2 2H8l-3-2V9"/>',
    name: 'Anomalie moteur (« Check engine »)', name_en: 'Engine fault ("Check engine")',
    means: 'Le calculateur du moteur a enregistré un code d’erreur : ça peut être aussi simple qu’un bouchon d’essence mal serré, ou un capteur, un allumage ou une émission à vérifier.',
    means_en: 'The engine computer has stored a fault code: it can be as simple as a loose fuel cap, or a sensor, ignition or emissions issue to check.',
    now: 'Allumé fixe : roulez normalement et prenez rendez-vous. S’il CLIGNOTE : ralentissez, évitez d’accélérer fort et faites vérifier le jour même — des ratés d’allumage peuvent endommager le catalyseur.',
    now_en: 'Steady: drive normally and book an appointment. If it FLASHES: slow down, avoid hard acceleration and have it checked the same day — misfires can damage the catalytic converter.',
  },
  {
    key: 'huile', level: 'stop', service: 'changement-huile',
    svg: '<path d="M2.5 11h4l2-2h6l5-2 1.5 1.5-5.5 5.5H7.5l-2-2h-3z"/><path d="M20.5 15.5c0 1-.7 1.7-1.5 1.7s-1.5-.7-1.5-1.7c0-.9 1.5-2.7 1.5-2.7s1.5 1.8 1.5 2.7z"/><path d="M10 9V7M8.5 7h3"/>',
    name: 'Pression d’huile', name_en: 'Oil pressure',
    means: 'La pression d’huile est trop basse pour bien lubrifier le moteur : niveau d’huile bas, fuite ou problème de pompe.',
    means_en: 'Oil pressure is too low to lubricate the engine properly: low oil level, a leak or a pump problem.',
    now: 'Arrêtez-vous dès que c’est sécuritaire et coupez le moteur. Vérifiez le niveau d’huile. Ne roulez pas avec ce voyant allumé : un moteur sans pression d’huile peut se briser en quelques minutes.',
    now_en: 'Pull over as soon as it is safe and switch the engine off. Check the oil level. Do not drive with this light on: an engine without oil pressure can be ruined within minutes.',
  },
  {
    key: 'batterie', level: 'stop', service: 'diagnostic-code-moteur',
    svg: '<rect x="3" y="7" width="18" height="12" rx="1.5"/><path d="M6.5 7V5h3v2M14.5 7V5h3v2M6.5 13h3M15 11.5v3M13.5 13h3"/>',
    name: 'Système de charge (batterie)', name_en: 'Charging system (battery)',
    means: 'La batterie n’est plus rechargée pendant que vous roulez : alternateur, courroie ou connexions.',
    means_en: 'The battery is no longer being charged while you drive: alternator, belt or connections.',
    now: 'Le véhicule roule sur sa batterie et peut s’arrêter. Éteignez ce qui n’est pas essentiel (chauffage des sièges, radio) et venez au garage directement, sans couper le moteur en chemin.',
    now_en: 'The vehicle is running on its battery and may stall. Switch off what is not essential (seat heaters, radio) and come straight to the garage without turning the engine off on the way.',
  },
  {
    key: 'temperature', level: 'stop', service: 'moteur-transmission',
    svg: '<path d="M12 3v10.5M10 4.5h2M10 7h2M10 9.5h2"/><circle cx="12" cy="16" r="2.5"/><path d="M3 20c1.5 0 1.5-1 3-1s1.5 1 3 1M15 20c1.5 0 1.5-1 3-1s1.5 1 3 1"/>',
    name: 'Température du moteur', name_en: 'Engine temperature',
    means: 'Le moteur surchauffe : liquide de refroidissement bas, fuite, thermostat, pompe à eau ou ventilateur.',
    means_en: 'The engine is overheating: low coolant, a leak, the thermostat, the water pump or the fan.',
    now: 'Arrêtez-vous et coupez le moteur. N’ouvrez JAMAIS le bouchon du radiateur à chaud : le liquide est sous pression et brûlant. Attendez que le moteur refroidisse avant de vérifier le niveau.',
    now_en: 'Pull over and switch the engine off. NEVER open the radiator cap while hot: the coolant is under pressure and scalding. Wait for the engine to cool before checking the level.',
  },
  {
    key: 'freins', level: 'stop', service: 'freins',
    svg: '<circle cx="12" cy="12" r="6"/><path d="M12 9v3.5M12 14.8v.2"/><path d="M4.5 7a9 9 0 0 0 0 10M19.5 7a9 9 0 0 1 0 10"/>',
    name: 'Système de freinage', name_en: 'Brake system',
    means: 'Frein de stationnement engagé, ou niveau de liquide de frein bas, ou défaut du système de freinage.',
    means_en: 'The parking brake is on, or the brake fluid is low, or there is a brake system fault.',
    now: 'Vérifiez d’abord le frein de stationnement. S’il est desserré et que le voyant reste allumé, ne prenez pas de risque : faites vérifier les freins sans tarder.',
    now_en: 'Check the parking brake first. If it is released and the light stays on, do not take chances: have the brakes checked right away.',
  },
  {
    key: 'abs', level: 'soon', service: 'freins',
    svg: '<circle cx="12" cy="12" r="7"/><path d="M3.5 7.5a10 10 0 0 0 0 9M20.5 7.5a10 10 0 0 1 0 9"/><path d="M8.2 14.5l1.3-5 1.3 5M8.6 13h1.8M12 9.5v5h1.2a1.2 1.2 0 0 0 0-2.5H12h1a1.2 1.2 0 0 0 0-2.5zM17 10a1.3 1.3 0 0 0-2.4.5c0 1.6 2.6 1 2.6 2.6a1.3 1.3 0 0 1-2.5.4"/>',
    name: 'ABS (antiblocage)', name_en: 'ABS (anti-lock brakes)',
    means: 'Le système antiblocage est hors service, souvent à cause d’un capteur de roue. Les freins fonctionnent, mais les roues peuvent bloquer en freinage d’urgence.',
    means_en: 'The anti-lock system is off, often because of a wheel sensor. The brakes still work, but the wheels can lock in an emergency stop.',
    now: 'Roulez prudemment, gardez plus de distance — surtout sur la neige et la glace — et prenez rendez-vous.',
    now_en: 'Drive carefully and leave more distance — especially on snow and ice — and book an appointment.',
  },
  {
    key: 'pneus', level: 'soon', service: 'pneus-voiture-vus',
    svg: '<path d="M6 17.5c-1.6-1.4-2.5-3.4-2.5-5.5 0-4 3.8-7.5 8.5-7.5s8.5 3.5 8.5 7.5c0 2.1-.9 4.1-2.5 5.5"/><path d="M4.5 19.5h15M6 17.5l-.8 2M18 17.5l.8 2M9 19.5l-.4-1.5M15 19.5l.4-1.5"/><path d="M12 8.5v4.5M12 15v.2"/>',
    name: 'Pression des pneus', name_en: 'Tire pressure',
    means: 'Au moins un pneu est sous-gonflé. Les premiers matins froids de l’automne l’allument souvent : l’air se contracte au froid.',
    means_en: 'At least one tire is under-inflated. The first cold mornings of fall often trigger it: air contracts in the cold.',
    now: 'Vérifiez la pression de chaque pneu à froid (la valeur est sur l’étiquette de la portière du conducteur). Si un pneu perd de l’air encore et encore, il a sans doute une crevaison.',
    now_en: 'Check each tire’s pressure when cold (the value is on the driver’s door label). If one tire keeps losing air, it probably has a puncture.',
  },
  {
    key: 'coussins', level: 'stop', service: 'diagnostic-code-moteur',
    svg: '<circle cx="9" cy="5" r="1.8"/><path d="M8 8.5l-1.5 6h5.5l2 5M7 11.5h3"/><circle cx="16.5" cy="10" r="3.5"/><path d="M5 19.5h5"/>',
    name: 'Coussins gonflables', name_en: 'Airbags',
    means: 'Le système de coussins gonflables a détecté un défaut : en cas d’accident, ils pourraient ne pas se déployer.',
    means_en: 'The airbag system has detected a fault: in a collision, they may not deploy.',
    now: 'Le véhicule roule normalement, mais votre protection n’est pas assurée. Faites vérifier rapidement, et ne tentez pas de réparation vous-même.',
    now_en: 'The vehicle drives normally, but your protection is not guaranteed. Have it checked soon, and do not attempt a repair yourself.',
  },
  {
    key: 'traction', level: 'soon', service: 'diagnostic-code-moteur',
    svg: '<path d="M6 11l1.8-4h8.4L18 11M5 11h14v4H5zM7 15v1.5M17 15v1.5"/><path d="M5 20c1.2-1.5 2.4 1.5 3.6 0M10.2 20c1.2-1.5 2.4 1.5 3.6 0M15.4 20c1.2-1.5 2.4 1.5 3.6 0"/>',
    name: 'Contrôle de traction / stabilité', name_en: 'Traction / stability control',
    means: 'S’il CLIGNOTE en roulant : le système travaille, les roues patinent — c’est normal sur chaussée glissante. S’il reste allumé FIXE : le système est désactivé ou en défaut.',
    means_en: 'If it FLASHES while driving: the system is working and the wheels are slipping — normal on slippery roads. If it stays on STEADY: the system is off or faulty.',
    now: 'Clignotant : levez le pied. Fixe : vérifiez que vous ne l’avez pas désactivé par le bouton; sinon, prenez rendez-vous avant l’hiver.',
    now_en: 'Flashing: ease off the gas. Steady: make sure you did not switch it off with the button; otherwise book before winter.',
  },
  {
    key: 'direction', level: 'soon', service: 'suspension-direction',
    svg: '<circle cx="11" cy="12" r="7.5"/><circle cx="11" cy="12" r="2"/><path d="M3.5 12H9M13 12h5.5M11 14v5.5"/><path d="M21 6.5v5M21 13.8v.2"/>',
    name: 'Direction assistée', name_en: 'Power steering',
    means: 'L’assistance de direction est réduite ou coupée : le volant peut devenir beaucoup plus lourd, surtout à basse vitesse.',
    means_en: 'Steering assist is reduced or off: the wheel can become much heavier, especially at low speed.',
    now: 'Vous gardez le contrôle, mais tenez le volant fermement dans les manœuvres. Prenez rendez-vous rapidement.',
    now_en: 'You keep control, but hold the wheel firmly when manoeuvring. Book an appointment soon.',
  },
  {
    key: 'entretien', level: 'soon', service: 'changement-huile',
    svg: '<path d="M14.5 4.5a4 4 0 0 0-3.8 5.3L4 16.5 6.5 19l6.7-6.7a4 4 0 0 0 5.3-3.8l-2.3 2.3-2.5-.5-.5-2.5z"/>',
    name: 'Rappel d’entretien', name_en: 'Maintenance reminder',
    means: 'Ce n’est pas une panne : l’ordinateur de bord vous rappelle que la vidange ou l’entretien prévu arrive à échéance.',
    means_en: 'Not a fault: the trip computer is reminding you that the oil change or scheduled maintenance is coming due.',
    now: 'Prenez rendez-vous pour le changement d’huile. Le garage remet le rappel à zéro après l’entretien.',
    now_en: 'Book the oil change. The garage resets the reminder after the service.',
  },
];
