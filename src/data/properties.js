/**
 * Divic — property content.
 *
 * PLACEHOLDER CONTENT. Room names, descriptions, rates and imagery are written to be
 * plausible, not accurate. Replace with real copy, photography and rates before launch.
 * The two facts taken as given: Divic Exclusive has 15 rooms, Divic Urban has 21.
 *
 * Shape note: room types are modelled the way a PMS returns them (stable id, display
 * name, inventory count, occupancy, base rate in minor-unit-free NGN) so that swapping
 * this module for live API responses is mechanical rather than a rewrite. Availability,
 * rate plans and reservation fields are deliberately absent — those belong to the real
 * booking contract, which is not wired up yet.
 */

export const BRAND = {
  name: 'Divic',
  line: 'Two houses in Festac',
  email: 'reservations@divic.com',
  phone: '+234 800 000 0000',
  instagram: 'https://instagram.com/divic',
};

const IMG = (id) => `https://images.unsplash.com/photo-${id}?q=80&w=1800&auto=format&fit=crop`;

export const PROPERTIES = {
  exclusive: {
    id: 'exclusive',
    slug: 'exclusive',
    name: 'Divic Exclusive',
    shortName: 'Exclusive',
    tagline: 'Fifteen rooms, and the sense that nobody else is checking in.',
    character: 'Residential, discreet, low-lit',
    roomCount: 15,
    address: '1st Avenue, E Close, Festac, Lagos',
    phone: '+234 800 000 0000',
    email: 'exclusive@divic.com',
    coords: '6.4654° N, 3.2836° E',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=1st+Avenue+E+Close+Festac+Lagos',
    whatsapp: 'https://wa.me/2348000000000',

    intro:
      'A fifteen-room house on a quiet close, built for people who would rather not be ' +
      'announced. Teak, unbleached linen, and shutters that actually close against the morning.',
    stayPitch:
      'Most guests stay three nights or longer. The rhythm suits it — breakfast when you ' +
      'come down, the bar open late, and staff who learn your name on the first evening.',

    heroImage: IMG('1566073771259-6a8506099945'),
    galleryImages: [
      IMG('1582719478250-c89cae4dc85b'),
      IMG('1470337458703-46ad1756a187'),
      IMG('1618773928121-c32242e63f39'),
      IMG('1578683010236-d716f9a3f461'),
    ],

    // 6 + 6 + 3 = 15
    roomTypes: [
      {
        id: 'exc-garden',
        name: 'Garden Room',
        count: 6,
        sizeSqm: 32,
        maxOccupancy: 2,
        bed: 'King or twin',
        baseRateNGN: 85000,
        description:
          'Thirty-two square metres of warm timber and linen, a rain shower, and a private ' +
          'balcony over the courtyard. Quiet enough to hear the garden.',
        image: IMG('1618773928121-c32242e63f39'),
      },
      {
        id: 'exc-terrace',
        name: 'Terrace Suite',
        count: 6,
        sizeSqm: 58,
        maxOccupancy: 3,
        bed: 'King',
        baseRateNGN: 145000,
        description:
          'A separate sitting room, a deep soaking tub, and a terrace wide enough to eat on. ' +
          'Built for longer stays and slower mornings.',
        image: IMG('1590490360182-c33d57733427'),
      },
      {
        id: 'exc-owners',
        name: "The Owner's Suite",
        count: 3,
        sizeSqm: 110,
        maxOccupancy: 4,
        bed: 'Two kings',
        baseRateNGN: 320000,
        description:
          'Two bedrooms, a private dining room, and a wraparound terrace, with a dedicated ' +
          'butler on call through the night.',
        image: IMG('1582719478250-c89cae4dc85b'),
      },
    ],

    amenities: [
      { label: 'The Amber Room', note: 'Bar, poured nightly until two' },
      { label: 'Courtyard dining', note: 'Breakfast to midnight, no fixed sitting' },
      { label: 'Butler service', note: 'On call, suites and above' },
      { label: 'Private transfer', note: 'Murtala Muhammed, both terminals' },
      { label: 'Laundry & pressing', note: 'Same day, returned before six' },
      { label: 'Quiet hours', note: 'Observed from eleven' },
    ],
  },

  urban: {
    id: 'urban',
    slug: 'urban',
    name: 'Divic Urban',
    shortName: 'Urban',
    tagline: 'Twenty-one rooms, and the whole of Festac at the door.',
    character: 'Open, social, daylit',
    roomCount: 21,
    address: '2nd Avenue, Festac, Lagos',
    phone: '+234 800 000 0011',
    email: 'urban@divic.com',
    coords: '6.4671° N, 3.2894° E',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=2nd+Avenue+Festac+Lagos',
    whatsapp: 'https://wa.me/2348000000011',

    intro:
      'Twenty-one rooms above a working street, built for people who came to be out, not in. ' +
      'Concrete, daylight, and a lobby that stays busy from seven.',
    stayPitch:
      'Most guests stay a night or two. Check-in is quick, the coffee counter opens at six, ' +
      'and the desk knows which way to send you before the traffic builds.',

    heroImage: IMG('1517248135467-4c7edcad34c4'),
    galleryImages: [
      IMG('1540555700478-4be289fbecef'),
      IMG('1414235077428-338989a2e8c0'),
      IMG('1571896349842-33c89424de2d'),
      IMG('1534438327276-14e5300c3a48'),
    ],

    // 10 + 8 + 3 = 21
    roomTypes: [
      {
        id: 'urb-king',
        name: 'Urban King',
        count: 10,
        sizeSqm: 26,
        maxOccupancy: 2,
        bed: 'King',
        baseRateNGN: 62000,
        description:
          'Twenty-six square metres, blackout to the street, a proper desk and fast wifi. ' +
          'Everything you need for one night done well.',
        image: IMG('1540555700478-4be289fbecef'),
      },
      {
        id: 'urb-corner',
        name: 'Corner Studio',
        count: 8,
        sizeSqm: 38,
        maxOccupancy: 3,
        bed: 'King or twin',
        baseRateNGN: 94000,
        description:
          'Two aspects of window on the corner of the building, a small kitchen counter, and ' +
          'enough floor to unpack properly.',
        image: IMG('1571896349842-33c89424de2d'),
      },
      {
        id: 'urb-loft',
        name: 'Loft Suite',
        count: 3,
        sizeSqm: 64,
        maxOccupancy: 4,
        bed: 'King + sofa bed',
        baseRateNGN: 168000,
        description:
          'Top floor, double height, with a long table that works as well for six at dinner ' +
          'as it does for a morning of calls.',
        image: IMG('1582719478250-c89cae4dc85b'),
      },
    ],

    amenities: [
      { label: 'The Counter', note: 'Coffee and pastry from six' },
      { label: 'Rooftop bar', note: 'Open to the public, Thursday to Sunday' },
      { label: 'Co-working floor', note: 'Day passes, printing, meeting room' },
      { label: 'Gym', note: 'Twenty-four hours, key-card entry' },
      { label: 'Express check-out', note: 'From the room, no queue' },
      { label: 'Secure parking', note: 'Twenty-two bays, attended' },
    ],
  },
};

export const PROPERTY_LIST = [PROPERTIES.exclusive, PROPERTIES.urban];

export const formatNGN = (amount) =>
  '₦' + Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 });
