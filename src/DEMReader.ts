import {promises as fs} from "fs";
import * as GeoTIFF from 'geotiff';
import ImageCache from './ImageCache';

interface WeightedAverage {
  sum: number;
  weight: number;
}

const getWeightedAverage = (array: number[]): WeightedAverage => {
  let sum = 0;
  let weight = 0;
  for(let i = 0; i < array.length; i++){
    const newValue = array[i];
    if (newValue != -9999 && newValue != 0) {
      sum += array[i];
      weight ++;
    }
  }

  return  {
    sum,
    weight
  }
};

const getAverage = (avgs: WeightedAverage[]) =>{
  let totalWeight = 0;
  let totalAverage = 0;
  for (const avg of avgs) {
    totalWeight += avg.weight;
    totalAverage += avg.sum;
  }
  return totalAverage/totalWeight;
};

export default class DEMReader {
  private readonly path: string;
  private imageCache: ImageCache;
  private elevationCache: any;

  constructor (path: string) {
    this.path = path;
    this.imageCache = new ImageCache();
    this.elevationCache = {};
  }

  public async getElevation(lat: number, lon: number, granularity: number) {
    const elevationKey = `${lat}, ${lon}, ${granularity}`;
    if (elevationKey in this.elevationCache) {
      return this.elevationCache[elevationKey];
    } else {
      // todo: handle polar regions
      const halfGran = granularity/2;
      const elevation = await this.getValue (
        lon - halfGran,
        lon + halfGran,
        lat - halfGran,
        lat + halfGran
      );
      this.elevationCache[elevationKey] = elevation;
      return elevation;
    }
  }

  async getValue(lonMin: number, lonMax: number, latMin: number, latMax: number): Promise<number> {
    //const image = await this.getImage("gt30w020n90.tif");
    const images = this.imageCache.getImages([lonMin, latMin, lonMax, latMax]);

    let averages: WeightedAverage[] = [];
    for (const image of images) {
      const origin = image.getOrigin();
      const resolution = image.getResolution();

      //const window = [4000, 3000, 4010 , 3010];
      const y1 = Math.floor((latMin - origin[1])/resolution[1]);
      const y2 = Math.floor((latMax - origin[1])/resolution[1]);

      const x1 = Math.floor((lonMin - origin[0])/resolution[0]);
      const x2 = Math.floor((lonMax - origin[0])/resolution[0]);
      const window = [
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.max(x1, x2),
        Math.max(y1, y2),
      ];

      const data = await image.readRasters({window: window, fillValue: [NaN]});
      averages.push(getWeightedAverage(data[0]));
    }



    if(images.length > 0) {
      return getAverage(averages);
    } else {
      return 0;
    }
  }

  async loadAllDems() {
    /* tslint:disable:non-literal-fs-path */
    const files = await fs.readdir(this.path);
    let demsLoaded = 0;
    for (const file of files) {
      if (file.endsWith(".tif")) {
        console.log(`loading ${file}...`);
        const tiff = await GeoTIFF.fromFile(this.path + "/" + file);
        const image = await tiff.getImage();
        const bbox = image.getBoundingBox();
        this.imageCache.putImage(bbox, image);
        demsLoaded++;
      }
    }

    console.log(`${demsLoaded} files loaded!`);
  }
}
