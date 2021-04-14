export default class ImageCache {
  private bboxes: number[][] = [];
  private images: any[][] = [];
  private index: number = 0;

  putImage(bbox: number[], image: any) {
    this.bboxes[this.index] = bbox;
    this.images[this.index] = image;
    this.index ++;
  }

  getImages(bbox: number[]) {
    let outImages = [];

    for(let i = 0; i < this.index; i++){
      const testBbox = this.bboxes[i];
      if (this.bboxOverlap(bbox, testBbox)) {
        outImages.push(this.images[i]);
      }
    }

    return outImages;
  }

  bboxOverlap(bbox1: number[], bbox2: number[]): boolean {
    //let xoverlap = bbox1[0] <= bbox2[2] &&  bbox1[2] >= bbox2[0];
    //let yoverlap = bbox1[1] <= bbox2[3] &&  bbox1[3] >= bbox2[1];

    return bbox1[0] <= bbox2[2] &&  bbox1[2] >= bbox2[0] && bbox1[1] <= bbox2[3] &&  bbox1[3] >= bbox2[1];
  }
}
