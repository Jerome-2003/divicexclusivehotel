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
    name: 'Divic Exclusive',
    address: 'Plot 55, 1st Avenue, E Close, Festac, Lagos',
    phone: '09169845311',
    currency: 'NGN',
    roomTypes: [
      { type: 'standard', rate: 40000, roomCount: 6, floors: [0] },
      { type: 'deluxe', rate: 45000, roomCount: 5, floors: [1] },
      { type: 'superior', rate: 50000, roomCount: 4, floors: [1] },
    ],
  },
  {
    id: 'urban',
    name: 'Divic Urban',
    address: 'Plot 340, 3rd Avenue, A1 Close, Festac, Lagos',
    phone: '09169845314',
    currency: 'NGN',
    roomTypes: [
      { type: 'classic', rate: 50000, roomCount: 5, floors: [0, 1] },
      { type: 'deluxe', rate: 55000, roomCount: 6, floors: [0, 1, 2] },
      { type: 'superior', rate: 60000, roomCount: 4, floors: [0, 1, 2] },
      { type: 'crown', rate: 65000, roomCount: 6, floors: [1, 2] },
    ],
  },
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
    shortName: 'Exclusive',
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

/** Brand-level details, not property-level. */
export const BRAND = {
  name: 'Divic',
  line: 'Two houses in Festac',
  instagram: 'https://instagram.com/divicexclusivehotels',
  instagramHandle: 'divicexclusivehotels',
};

/** Joins a PMS property record to its editorial content. */
export function decorate(apiProperty) {
  const content = CONTENT[apiProperty.id] || {};
  return {
    ...apiProperty,
    ...content,
    id: apiProperty.id,
    name: apiProperty.name,
    roomTypes: apiProperty.roomTypes.map((rt) => ({
      ...rt,
      ...(content.rooms?.[rt.type] || { name: rt.type, image: null, description: '' }),
    })),
  };
}

export const formatNGN = (amount) =>
  '₦' + Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 });
