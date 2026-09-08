/**
 * Divic — property data.
 *
 * Split deliberately in two:
 *
 *   PROPERTY_SEED     facts the PMS owns — address, phone, room types, rates, counts.
 *                     Shaped byte-for-byte like GET /api/public/properties, so it is a
 *                     drop-in fallback for the live response and nothing downstream has
 *                     to care which one it got.
 *
 *   CONTENT           things the PMS does not know about — display names, descriptions,
 *                     photography, character. Written here, not fetched.
 *
 * API.md is explicit: "Rates come from the live database... Do not hardcode prices on
 * the site." So the seed exists only so the site renders before the API is reachable;
 * whenever the fetch succeeds, live values win. See src/lib/divic-api.js.
 */

import { photo } from '../lib/images';

/** Mirrors GET /api/public/properties exactly. Values taken from API.md. */
export const PROPERTY_SEED = [
  {
    id: 'exclusive',
    // Mirrors the live API's display name exactly — this is the
    // fallback, byte-for-byte, per the file's own header comment. The
    // guest-facing name is CONTENT.exclusive.displayName below, untouched.
    name: 'Divic 1',
    address: 'Plot 55, 1st Avenue, E Close, Festac, Lagos',
    phone: '09169845311',
    totalRooms: 15,
    currency: 'NGN',
    roomTypes: [
      { type: 'standard', rate: 40000, roomCount: 6, floors: [1] },
      { type: 'deluxe', rate: 45000, roomCount: 5, floors: [2] },
      { type: 'superior', rate: 50000, roomCount: 4, floors: [2] },
    ],
  },
  {
    id: 'urban',
    name: 'Divic Urban',
    address: 'Plot 340, 3rd Avenue, A1 Close, Festac, Lagos',
    phone: '09169845314',
    totalRooms: 21,
    currency: 'NGN',
    roomTypes: [
      { type: 'classic', rate: 50000, roomCount: 5, floors: [1, 2] },
      { type: 'deluxe', rate: 55000, roomCount: 6, floors: [1, 2, 3] },
      { type: 'superior', rate: 60000, roomCount: 4, floors: [1, 2, 3] },
      { type: 'crown', rate: 65000, roomCount: 6, floors: [2, 3] },
    ],
  },
];

/**
 * House rules, shared by both branches.
 *
 * They arrived described against Divic Urban, but they are brand policy rather than one
 * building's — so they are defined once here and referenced by each branch, and a change
 * to check-out time cannot land on one page and not the other.
 */
const HOUSE_RULES = [
  { label: 'Check in', value: 'From 1pm' },
  { label: 'Check out', value: 'By 12 noon' },
  { label: 'Late check out', value: 'Half the room rate' },
  { label: 'After 6pm', value: 'The full room rate is charged' },
  { label: 'Smoking', value: 'No smoking in the rooms' },
  { label: 'Damages', value: 'Guests are responsible for any damage' },
];

const urban = (name) => photo('urban', name);
const exclusive = (name) => photo('exclusive', name);

/**
 * Editorial layer. `heroImage`, `galleryImages` and room `image` are null where no
 * photography has been supplied — the Plate component then renders its designed
 * surface rather than a broken well or a stock stand-in.
 */
export const CONTENT = {
  exclusive: {
    slug: 'exclusive',
    /* The PMS calls this branch "Divic Exclusive"; the hotel's own name for it is
       "Divic Exclusive 1 Hotel". The API name stays untouched — it is what booking
       payloads are keyed on — and this is what guests read. */
    displayName: 'Divic Exclusive 1 Hotel',
    shortName: 'Exclusive 1',
    character: 'Residential, discreet, low-lit',
    tagline: 'the sense that nobody else is checking in.',
    intro:
      'Hotel on a quiet close, built for people who would rather not be ' +
      'announced. Three floors, one staircase, and a front desk that knows your name by ' +
      'the second evening.',
    stayPitch:
      'Most guests stay three nights or longer. The rhythm suits it — breakfast when you ' +
      'come down, and quiet kept properly after eleven.',
    coords: '6.4654° N, 3.2836° E',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=Plot+55+1st+Avenue+E+Close+Festac+Lagos',
    heroImage: exclusive('frontview'),
    /* Grouped: several shots of one place belong in one frame, not spread across the
       page as though they were different rooms. */
    gallery: [
      { label: 'The bar', images: [exclusive('indoorbar'), exclusive('outdoorbar')] },
      { label: 'The pool', images: [exclusive('pool')] },
      { label: 'The rooms', images: [exclusive('bed')] },
    ],
    rooms: {
      standard: {
        name: 'Standard Room',
        image: exclusive('standard'),
        description:
          'Ground floor, quiet side. A king bed, a proper desk, and a rain shower — the ' +
          'room most guests end up rebooking.',
      },
      deluxe: {
        name: 'Deluxe Room',
        image: exclusive('deluxe'),
        description:
          'First floor, with more floor to unpack into and a seating corner by the window.',
      },
      superior: {
        name: 'Superior Room',
        image: exclusive('superior'),
        description:
          'The largest rooms in the house, first floor, with a separate sitting area and ' +
          'a deep bath.',
      },
    },
    houseRules: HOUSE_RULES,
    amenities: [
      { label: 'Indoor bar', note: 'Open nightly' },
      { label: 'Outdoor bar', note: 'Under the trees, from six' },
      { label: 'Swimming pool', note: 'Open to house guests' },
      { label: 'Front desk', note: 'Attended around the clock' },
      { label: 'Laundry and pressing', note: 'Same day, returned before six' },
      { label: 'Secure parking', note: 'Attended, on site' },
    ],
  },

  urban: {
    slug: 'urban',
    displayName: 'Divic Urban',
    shortName: 'Urban',
    character: 'Open, social, daylit',
    tagline: 'the whole of Festac at the door.',
    intro:
      '3rd Avenue, built for people who came to be ' +
      'out, not in. A bar, a pool, a gym, and a lobby that stays busy from seven.',
    stayPitch:
      'Most guests stay a night or two. Check-in is quick, the restaurant opens early, and ' +
      'the desk knows which way to send you before the traffic builds.',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=Plot+340+3rd+Avenue+A1+Close+Festac+Lagos',
    heroImage: urban('frontview'),
    gallery: [
      { label: 'The bar', images: [urban('bar'), urban('bar-1'), urban('bar-2')] },
      { label: 'The pool', images: [urban('pool')] },
      { label: 'The restaurant', images: [urban('restaurant-2'), urban('inside'), urban('inside-1')] },
      { label: 'The gym', images: [urban('gym'), urban('gym-1')] },
      { label: 'Reception', images: [urban('reception'), urban('reception-1')] },
    ],
    rooms: {
      classic: {
        name: 'Classic Room',
        image: urban('classic'),
        description:
          'A king bed, blackout curtains, a work desk and a walk-in shower. Ground and ' +
          'first floor — the straightforward choice for a night or two.',
      },
      deluxe: {
        name: 'Deluxe Room',
        image: urban('deluxe'),
        description:
          'More room around the bed and a seating chair by the window. Spread across all ' +
          'three floors, so there is usually one free.',
      },
      superior: {
        name: 'Superior Room',
        image: urban('superior'),
        description:
          'A larger footprint with a proper sitting area, and the better bathrooms in the ' +
          'house.',
      },
      crown: {
        name: 'Crown Room',
        image: urban('crown'),
        description:
          'The top of the house. Upper floors only, with a lounge chair, a bench at the ' +
          'foot of the bed, and the most light of any room here.',
      },
    },
    /* Whole-space hire, not rooms. These rates are not in the PMS, so unlike room rates
       they are held here — see the note in README under Known discrepancies. */
    privateBookings: [
      { label: 'Indoor pool', rate: 200000, note: 'Exclusive use of the pool and its deck' },
      { label: 'VIP bar', rate: 200000, note: 'The upstairs bar, closed to other guests' },
      { label: 'Outdoor bar', rate: 100000, note: 'The terrace bar and its seating' },
    ],
    houseRules: HOUSE_RULES,
    amenities: [
      { label: 'The bar', note: 'Open nightly' },
      { label: 'Swimming pool', note: 'Open to house guests' },
      { label: 'Gym', note: 'Equipped, open to guests' },
      { label: 'Restaurant', note: 'Breakfast through dinner' },
      { label: 'Security', note: 'Manned, twenty-four hours' },
      { label: 'Reception', note: 'Attended around the clock' },
    ],
  },
};

/**
 * Brand-level details, not branch-level.
 *
 * The WhatsApp number and Instagram belong to the brand and reach both branches; each
 * branch keeps its own landline, which comes from the PMS.
 */
const WHATSAPP_LOCAL = '09169845310';

export const BRAND = {
  name: 'Divic Exclusive Hotels',
  short: 'Divic',
  line: 'Two branches in Festac, Lagos',
  whatsapp: WHATSAPP_LOCAL,
  /* wa.me needs the number in international form, without the trunk zero. */
  whatsappUrl: `https://wa.me/234${WHATSAPP_LOCAL.replace(/^0/, '')}`,
  instagram: 'https://instagram.com/divicexclusivehotel',
  instagramHandle: 'divicexclusivehotel',
};

/** Joins a PMS property record to its editorial content. */
export function decorate(apiProperty) {
  const content = CONTENT[apiProperty.id] || {};
  return {
    ...apiProperty,
    ...content,
    id: apiProperty.id,
    name: apiProperty.name,
    /* What guests read. `name` stays as the PMS returned it. */
    displayName: content.displayName || apiProperty.name,
    /* Derived when absent rather than trusted blindly: a response without it used to
       render "  rooms" with a hole where the number should be, in four places. The room
       counts are the same fact, so the sum is the safe fallback. */
    totalRooms:
      apiProperty.totalRooms ??
      apiProperty.roomTypes.reduce((n, rt) => n + (rt.roomCount || 0), 0),
    roomTypes: apiProperty.roomTypes.map((rt) => ({
      ...rt,
      ...(content.rooms?.[rt.type] || { name: rt.type, image: null, description: '' }),
    })),
  };
}

export const formatNGN = (amount) =>
  '₦' + Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 });
