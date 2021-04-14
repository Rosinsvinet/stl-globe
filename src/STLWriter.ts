import {promises as fs} from "fs";

import Facet from './Facet';

export default class STLWriter {
  private readonly outSTLPath: string;
  protected hasOpeningTag: boolean = false;
  protected decimalPlaces: number;

  constructor(outPath: string, decimalPlaces?: number) {
    if (outPath.endsWith(".stl")) {
      this.outSTLPath = outPath;
    } else {
      this.outSTLPath = outPath + ".stl";
    }

    if (decimalPlaces) {
      this.decimalPlaces = decimalPlaces;
    }
  }

  async addOpeningTag() {
    /* tslint:disable:non-literal-fs-path */
    await fs.writeFile(this.outSTLPath, "solid test");
  }

  async addFacet(facet: Facet) {
    if (!this.hasOpeningTag) {
      await this.addOpeningTag();
      this.hasOpeningTag = true;
    }
    await fs.appendFile(this.outSTLPath, facet.toString());
  };

  async batchAddFacets(facets: Facet[]) {
    if (!this.hasOpeningTag) {
      await this.addOpeningTag();
      this.hasOpeningTag = true;
    }

    await fs.appendFile(this.outSTLPath, facets.map((facet: Facet) => {
      return facet.toString(this.decimalPlaces);
    }).reduce((acc: string, stringFacet:String) => {
      return acc + stringFacet
    }));
  }

  async close() {
    await fs.appendFile(this.outSTLPath, "\nendsolid");
  }

}
