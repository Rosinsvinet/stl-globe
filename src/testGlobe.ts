import Facet from "./Facet";
import Vertex from "./Vertex";
import STLWriter from "./STLWriter";

const RADIUS = 5;
const OFFSET = new Vertex(10, 10, 10);

function latLonToVertex(lat: number, lon: number): Vertex {
  const outVertex = new Vertex (
    RADIUS * Math.cos(lon) * Math.sin(lat),
    RADIUS * Math.sin(lon) * Math.sin(lat),
    RADIUS * Math.cos(lat)
  );
  outVertex.add(OFFSET);
  return outVertex;
}

export default async function testGlobe(outPath: string) {
  const stlWriter = new STLWriter(outPath);

  // we make a grid of 10 by 10 degrees
  // and convert every grid cell to 2 triangles
  const lats = [];
  const lons = [];

  const granularity = 5;


  for (let i = 0; i < 180; i = i + granularity) {
    lats.push(i*Math.PI/180);
  }

  for (let j = -180; j < 180; j = j + granularity) {
    lons.push(j*Math.PI/180);
  }

  for (let k = 0; k < lats.length; k++) {
    let lat_k = lats[k];
    let lat_kp1;
    let kp1 = k + 1;

    if (kp1 == lats.length) {
      // north pole
      lat_kp1 = Math.PI;
    } else {
      lat_kp1 = lats[kp1];
    }
    for (let l = 0; l < lons.length; l++) {
      let lon_l = lons[l];
      let lon_lp1;
      let lp1 = l + 1;

      if (lp1 == lons.length) {
        // wrap around
        lon_lp1 = lons[0];
      } else {
        lon_lp1 = lons[lp1];
      }

      // handle poles
      if (lat_k == 0) {
        /*
        south pole
        one triangle:
          (lon_l  , lat_k  )
          (lon_l+1, lat_k+1)
          (lon_l  , lat_k+1)
         */
        await stlWriter.addFacet(new Facet([
          latLonToVertex(lat_k, lon_l),
          latLonToVertex(lat_kp1, lon_lp1),
          latLonToVertex(lat_kp1, lon_l),
        ]));


      } else if (lat_kp1 == Math.PI) {
        /*
          north pole
          one triangle:
            (lon_l  , lat_k  )
            (lon_lp1, lat_k  )
            (lon_l  , lat_k+1)
         */
        await stlWriter.addFacet(new Facet([
          latLonToVertex(lat_k, lon_l),
          latLonToVertex(lat_k, lon_lp1),
          latLonToVertex(lat_kp1, lon_l),
        ]));
      } else {
        /*
          triangle 1:
            (lon_l   , lat_k  )
            (lon_l+1 , lat_k  )
            (lon_l+1 , lat_k+1)

          triangle 2:
            (lon_l   , lat_k  )
            (lon_l+1 , lat_k+1)
            (lon_l   , lat_k+1)
         */
        await stlWriter.addFacet(new Facet([
          latLonToVertex(lat_k, lon_l),
          latLonToVertex(lat_k, lon_lp1),
          latLonToVertex(lat_kp1, lon_lp1),
        ]));

        await stlWriter.addFacet(new Facet([
          latLonToVertex(lat_k, lon_l),
          latLonToVertex(lat_kp1, lon_lp1),
          latLonToVertex(lat_kp1, lon_l),
        ]));
      }

    }
  }
  stlWriter.close();
}
