import Facet from "./Facet";
import STLWriter from "./STLWriter";
import Vertex from "./Vertex";
import DEMReader from "./DEMReader";

export default class GlobeWriter {
  facets: Facet[] = [];
  stlWriter: STLWriter;
  demReader: DEMReader;
  elevationFactor: number = 1/200;
  cutLats: number[] = [];
  actualCuts: number[] = [];
  decimalPlaces: number;
  path: string;
  outNumber: number = 0;

  private radius: number = 5;
  private offset: Vertex = new Vertex(10, 10, 10);

  constructor(path: string, options) {
    this.path = path;

    if(options.decimalPlaces) {
      this.decimalPlaces = options.decimalPlaces;
    }

    this.startNewStlWriter();

    if (options.radius) {
      this.radius = options.radius;
    }

    if (options.offset) {
      this.offset = options.offset;
    }

    if (options.demReader) {
      this.demReader = options.demReader;
    }

    if(options.elevationFactor) {
      this.elevationFactor = options.elevationFactor;
    }

    if(options.cutLats) {
      this.cutLats = options.cutLats;
    }
  }

  private getThetaCenter(theta: number): Vertex {
    let outVertex = new Vertex(0,0, Math.cos(theta) * this.radius);
    outVertex.add(this.offset);
    return outVertex;
  }

  private startNewStlWriter() {
    let path = this.path;
    if(this.cutLats.length > 0){
      this.outNumber ++;
      path += '_' + this.outNumber.toString();
    }
    this.stlWriter = new STLWriter(path, this.decimalPlaces);
  }

  /**
   *
   * @param {number} theta spherical coordinate from north to south pole 0..Pi
   * @param {number} sigma spherical coordinate along equator -Pi..Pi
   * @param {number} elevation
   * @returns {Vertex}
   */
  private sphericalToCartesian(theta: number, sigma: number, elevation?: number): Vertex {
    let radius = this.radius;
    if (elevation) {
      radius = this.radius + elevation
    }
    const outVertex = new Vertex (
      radius * Math.cos(sigma) * Math.sin(theta),
      radius * Math.sin(sigma) * Math.sin(theta),
      radius * Math.cos(theta)
    );
    outVertex.add(this.offset);
    return outVertex;
  }

  /**
   *
   * @param {number} theta spherical coordinate from north to south pole 0..Pi
   * @returns {number} lat -90 .. 90
   */

  private static thetaToLat(theta: number): number {
    return ( Math.PI/2 - theta)*180/Math.PI
  }

  /**
   *
   * @param {number} sigma spherical coordinate along equator -Pi..Pi
   * @returns {number} lon -180 .. 180
   */

  private static sigmaToLon(sigma: number): number {
    return sigma*180/Math.PI
  }

  async sphericalToCartesianWithElevation(theta: number, sigma:number, granularity: number) {
    if (this.demReader) {
      const elevation = await this.demReader.getElevation(
        GlobeWriter.thetaToLat(theta),
        GlobeWriter.sigmaToLon(sigma),
        granularity
      );

      return this.sphericalToCartesian(theta, sigma, elevation * this.elevationFactor);
    } else {
      return this.sphericalToCartesian(theta, sigma);
    }
  }

  async generateSouthPoleFacet(theta_k: number, theta_kp1:number, sigma_l: number, sigma_lp1: number, granularity: number) {
    /*
    south pole
    one triangle:
      (sigma_l  , theta_k  )
      (sigma_l+1, theta_k+1)
      (sigma_l  , theta_k+1)
     */
    this.facets.push(new Facet([
      await this.sphericalToCartesianWithElevation(theta_k, sigma_l, granularity),
      await this.sphericalToCartesianWithElevation(theta_kp1, sigma_lp1, granularity),
      await this.sphericalToCartesianWithElevation(theta_kp1, sigma_l, granularity),
    ]));
  }

  async generateNorthPoleFacet(theta_k: number, theta_kp1:number, sigma_l: number, sigma_lp1: number, granularity: number) {
    /*
      north pole
      one triangle:
        (sigma_l, theta_k  )
        (lon_l+1, theta_k  )
        (sigma_l, theta_k+1)
     */
    this.facets.push(new Facet([
      await this.sphericalToCartesianWithElevation(theta_k, sigma_l, granularity),
      await this.sphericalToCartesianWithElevation(theta_k, sigma_lp1, granularity),
      await this.sphericalToCartesianWithElevation(theta_kp1, sigma_l, granularity),
    ]));
  }

  async generateBeforeCutFacet(_: number, theta_kp1:number, sigma_l: number, sigma_lp1: number, granularity: number) {
    /*
      one tringle:
        (theta_k+1, sigma_l+1)
        (theta_k+1, sigma_l  )
        theta_k+1 center
     */
    this.facets.push(new Facet([
      await this.sphericalToCartesianWithElevation(theta_kp1, sigma_lp1 , granularity),
      await this.sphericalToCartesianWithElevation(theta_kp1, sigma_l, granularity),
      this.getThetaCenter(theta_kp1),
    ]));
  }

  async generateAfterCutFacet(theta_k: number, _:number, sigma_l: number, sigma_lp1: number, granularity: number) {
    /*
      one tringle:
        (theta_k, sigma_l  )
        (theta_k, sigma_l+1)
        theta_k center
     */
    this.facets.push(new Facet([
      await this.sphericalToCartesianWithElevation(theta_k, sigma_l, granularity),
      await this.sphericalToCartesianWithElevation(theta_k, sigma_lp1, granularity),
      this.getThetaCenter(theta_k),
    ]));
  }

  async generateDefaultFacets(theta_k: number, theta_kp1:number, sigma_l: number, sigma_lp1: number, granularity: number) {
    /*
      triangle 1:
        (sigma_l   , theta_k  )
        (sigma_l+1 , theta_k  )
        (sigma_l+1 , theta_k+1)

      triangle 2:
        (sigma_l   , theta_k  )
        (sigma_l+1 , theta_k+1)
        (sigma_l   , theta_k+1)
     */
    this.facets.push(new Facet([
      await this.sphericalToCartesianWithElevation(theta_k, sigma_l, granularity),
      await this.sphericalToCartesianWithElevation(theta_k, sigma_lp1, granularity),
      await this.sphericalToCartesianWithElevation(theta_kp1, sigma_lp1, granularity),
    ]));

    this.facets.push(new Facet([
      await this.sphericalToCartesianWithElevation(theta_k, sigma_l, granularity),
      await this.sphericalToCartesianWithElevation(theta_kp1, sigma_lp1, granularity),
      await this.sphericalToCartesianWithElevation(theta_kp1, sigma_l, granularity),
    ]));
  }

  async generateFacets (granularity: number) {
    // generate global spherical coordinates
    const lats = [];
    const lons = [];

    let prevLat;
    for (let i = 0; i < 180; i = i + granularity) {
      const lat = i*Math.PI/180;

      // insert CUT as placeholder for a cut
      for (const cutLat of this.cutLats) {

        if ((prevLat < cutLat && lat > cutLat) || prevLat == cutLat) {
          this.actualCuts.push(lat);
        }
      }

      lats.push(lat);
      prevLat = lat;
    }

    for (let j = -180; j < 180; j = j + granularity) {
      lons.push(j*Math.PI/180);
    }

    // generate facets from spherical coordinates
    for (let k = 0; k < lats.length; k++) {
      let lat_k = lats[k];
      let lat_kp1;
      let kp1 = k + 1;

      // north pole
      if (kp1 == lats.length) {
        lat_kp1 = Math.PI;

      // normal
      } else {
        lat_kp1 = lats[kp1];
      }

      if (this.isALatcut(lat_k)) {
        // write
        console.log("inserting a cut, before lat", lat_kp1);
        await this.stlWriter.batchAddFacets(this.facets);
        await this.stlWriter.close();
        this.facets = [];
        this.startNewStlWriter();
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
          await this.generateSouthPoleFacet(lat_k, lat_kp1, lon_l, lon_lp1, granularity);

        } else if (lat_kp1 == Math.PI) {
          await this.generateNorthPoleFacet(lat_k, lat_kp1, lon_l, lon_lp1, granularity);

        } else if (this.isALatcut(lat_kp1)) {
          await this.generateDefaultFacets(lat_k, lat_kp1, lon_l, lon_lp1, granularity);
          await this.generateBeforeCutFacet(lat_k, lat_kp1, lon_l, lon_lp1, granularity);

        } else if (this.isALatcut(lat_k)) {
          await this.generateAfterCutFacet(lat_k, lat_kp1, lon_l, lon_lp1, granularity);
          await this.generateDefaultFacets(lat_k, lat_kp1, lon_l, lon_lp1, granularity);

        } else {
          await this.generateDefaultFacets(lat_k, lat_kp1, lon_l, lon_lp1, granularity);
        }
      }
    }
  }

  isALatcut(theta: number):boolean {
    return this.actualCuts.indexOf(theta) !== -1;
  }

  async write () {
    /*
    for (let i = 0; i < this.facets.length; i++) {
      await this.stlWriter.addFacet(this.facets[i]);
    }
    */

    await this.stlWriter.batchAddFacets(this.facets);
    await this.stlWriter.close();
  }
}
