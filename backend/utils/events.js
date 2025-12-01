"use strict";

function eventHasMaxedOut(event) {
  if (!event) {
    return false;
  }
  if (event.capacity === null || event.capacity === undefined) {
    return false;
  }
  const guestCount = Array.isArray(event.guests) ? event.guests.length : 0;
  return guestCount >= event.capacity;
}

async function loadEventCapacityInfo(prisma, eventId) {
  const snapshot = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      capacity: true,
      _count: {
        select: { guests: true },
      },
    },
  });

  if (!snapshot) {
    return false;
  }

  if (snapshot.capacity === null || snapshot.capacity === undefined) {
    return false;
  }

  return snapshot._count.guests >= snapshot.capacity;
}

module.exports = {
  eventHasMaxedOut,
  loadEventCapacityInfo,
};
