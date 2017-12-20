export class Color {
  constructor(public red: number, public green: number, public blue: number) {
  }

  private coll: Array<any> = [this.red, this.green, this.blue];
  private valid = this.colorIsVerid(this.coll);
  private text = this.colorText(this.coll, 'hex');
  private bg = this.colorText(this.coll, 'hex');


  colorIsVerid(colorSectionList) {
    let isValid = 'n';
    if ((!isNaN(colorSectionList[0])) && (!isNaN(colorSectionList[1])) && (!isNaN(colorSectionList[2]))) {
      isValid = 'y'
    }
    return isValid;
  }

  colorText(colorSectionList: Array<any>, colorFormat: String) {
    let base: number = 0;
    let denominator: number = 1;
    let result: String = '';

    if (colorFormat == 'hex') {
      base = 16;
    }

    colorSectionList.forEach((colorSection, colorSectionIndex) => {
      let colorSectionSegment = Math.round(colorSection / denominator);
      let colorSegmentString = colorSectionSegment.toString(base);

      if (colorFormat == 'hex' && colorSegmentString.length < 2) {
        colorSegmentString = '0' + colorSegmentString;
      }
      result = result + colorSegmentString;
    })

    if (colorFormat == 'hex') {
      result = '#' + result.toUpperCase();
    }
    return result;
  }

}
