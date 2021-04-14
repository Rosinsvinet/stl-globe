import DEMReader from './DEMReader';
import GlobeWriter from "./GlobeWriter";

import timedRunner from './timedRunner';
const OUT_PATH: string = "./out/out";
const DEM_PATH: string = "./dem";

//import testPyramid from './testPyramid';
//timedRunner(OUT_PATH, testPyramid);

//import testGlobe from './testGlobe';
timedRunner(async () => {
  const demReader = new DEMReader(DEM_PATH);
  await demReader.loadAllDems();
  const gw = new GlobeWriter(OUT_PATH, {
    demReader: demReader,
    elevationFactor: 1/5000,
    decimalPlaces: 4,
    cutLats: [Math.PI/2]
  });
  await gw.generateFacets(0.25);
  await gw.write();
});
