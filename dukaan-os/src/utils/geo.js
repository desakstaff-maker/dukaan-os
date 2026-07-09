// ======================================
// EARTH RADIUS
// ======================================

const EARTH_RADIUS =
  6371;



// ======================================
// DEGREE TO RADIAN
// ======================================

export function toRadians(
  degrees
) {

  return (
    degrees *
    Math.PI
  ) / 180;
}



// ======================================
// DISTANCE
// ======================================

export function calculateDistance(
  lat1,
  lng1,
  lat2,
  lng2
) {

  if (
    !lat1 ||
    !lng1 ||
    !lat2 ||
    !lng2
  ) {

    return 999999;
  }

  const dLat =
    toRadians(
      lat2 - lat1
    );

  const dLng =
    toRadians(
      lng2 - lng1
    );

  const a =

    Math.sin(
      dLat / 2
    ) *
      Math.sin(
        dLat / 2
      ) +

    Math.cos(
      toRadians(
        lat1
      )
    ) *

      Math.cos(
        toRadians(
          lat2
        )
      ) *

      Math.sin(
        dLng / 2
      ) *

      Math.sin(
        dLng / 2
      );

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(
        1 - a
      )
    );

  return Number(
    (
      EARTH_RADIUS *
      c
    ).toFixed(1)
  );
}



// ======================================
// SORT BY DISTANCE
// ======================================

export function sortByDistance(
  userLocation,
  items
) {

  return [...items]
    .map(
      item => ({

        ...item,

        distance:
          calculateDistance(
            userLocation.lat,
            userLocation.lng,
            item.lat,
            item.lng
          )
      })
    )
    .sort(
      (a, b) =>
        a.distance -
        b.distance
    );
}



// ======================================
// USER LOCATION
// ======================================

export function getCurrentLocation() {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      if (
        !navigator
          .geolocation
      ) {

        reject(
          new Error(
            'Geolocation not supported'
          )
        );

        return;
      }

      navigator
        .geolocation
        .getCurrentPosition(

          position => {

            resolve({

              lat:
                position
                  .coords
                  .latitude,

              lng:
                position
                  .coords
                  .longitude
            });
          },

          error => {

            reject(
              error
            );
          },

          {
            enableHighAccuracy:
              true,

            timeout:
              10000,

            maximumAge:
              60000
          }
        );
    }
  );
}



// ======================================
// FORMAT DISTANCE
// ======================================

export function formatDistance(
  distance
) {

  if (
    distance <
    1
  ) {

    return `${Math.round(
      distance *
      1000
    )} m`;
  }

  return `${distance} km`;
}