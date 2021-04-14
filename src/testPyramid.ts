import Facet from "./Facet";
import Vertex from "./Vertex";
import STLWriter from "./STLWriter";

export default async function testPyramid(outPath: string) {

  const stlWriter = new STLWriter(outPath);

  await stlWriter.addFacet(new Facet ([
    new Vertex(2,1,1),
    new Vertex(1,1,1),
    new Vertex(1.5,1.5,0.4),
  ]));

  await stlWriter.addFacet(new Facet ([
    new Vertex(1,1,1),
    new Vertex(1,2,1),
    new Vertex(1.5,1.5,0.4),
  ]));

  await stlWriter.addFacet(new Facet ([
    new Vertex(1,2,1),
    new Vertex(2,2,1),
    new Vertex(1.5,1.5,0.4),
  ]));

  await stlWriter.addFacet(new Facet ([
    new Vertex(2,2,1),
    new Vertex(2,1,1),
    new Vertex(1.5,1.5,0.4),
  ]));

  await stlWriter.addFacet(new Facet ([
    new Vertex(1,1,1),
    new Vertex(2,1,1),
    new Vertex(1.5,1.5,1.6),
  ]));

  await stlWriter.addFacet(new Facet ([
    new Vertex(1,2,1),
    new Vertex(1,1,1),
    new Vertex(1.5,1.5,1.6),
  ]));

  await stlWriter.addFacet(new Facet ([
    new Vertex(2,2,1),
    new Vertex(1,2,1),
    new Vertex(1.5,1.5,1.6),
  ]));

  await stlWriter.addFacet(new Facet ([
    new Vertex(2,1,1),
    new Vertex(2,2,1),
    new Vertex(1.5,1.5,1.6),
  ]));

  stlWriter.close();
}
